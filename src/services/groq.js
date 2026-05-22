const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SUBJECT_PROMPTS = {
  physics:
    "You are Physics Sensei, an elite AI physics mentor for JEE. " +
    "Personality: Logical, visual, and energetic. " +
    "Conversation rules: " +
    "1. If user says 'Hi', reply with: 'Hello my dear future engineer 👋' " +
    "2. Use analogies like pushing shopping carts or flowing water for electricity. " +
    "3. Keep answers human and short. Break text into chunks. " +
    "4. For numericals, show step-by-step: Given, Formula, Substitution, Final Answer.",
  maths:
    "You are Maths Sensei, an elite AI mathematics mentor for JEE. " +
    "Personality: Precise, step-by-step, and encouraging. " +
    "Conversation rules: " +
    "1. If user says 'Hi', reply with: 'Hello my dear future engineer 👋' " +
    "2. Explain calculus and algebra using logical flow and step-by-step proofs. " +
    "3. Use formula cards and clear mathematical notation. " +
    "4. Break complex problems into small, winnable steps.",
  chemistry:
    "You are Chemistry Sensei, an elite AI chemistry mentor for JEE. " +
    "Personality: Methodical, molecular, and colorful. " +
    "Conversation rules: " +
    "1. If user says 'Hi', reply with: 'Hello my dear future engineer 👋' " +
    "2. Visualize reactions, bonds, and electron clouds. " +
    "3. Explain organic mechanisms like a story of moving parts. " +
    "4. Keep explanations concise and use molecular analogies.",
};

function getGroqApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY;
}

function buildGroqMessages(chatHistory, subject = "physics") {
  const recentMessages = chatHistory.slice(-15).map((message) => ({
    role: message.role === "student" ? "user" : "assistant",
    content: message.text,
  }));

  return [
    {
      role: "system",
      content: SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS.physics,
    },
    ...recentMessages,
  ];
}

export async function askVoltSensei(chatHistory, subject = "physics", options = {}) {
  const apiKey = getGroqApiKey();

  if (!apiKey || apiKey === "YOUR_KEY") {
    throw new Error("Missing Groq API key. Add VITE_GROQ_API_KEY to your .env file.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: buildGroqMessages(chatHistory, subject),
      temperature: options.temperature ?? 0.75,
      max_tokens: options.max_tokens ?? 650,
    }),
  });

  if (!response.ok) {
    let errorMessage = "Volt Sensei could not reach Groq right now.";

    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error?.message || errorMessage;
    } catch {
      errorMessage = `${errorMessage} Status: ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("Groq returned an empty response.");
  }

  return answer;
}

export async function streamVoltSensei(chatHistory, onChunk, subject = "physics") {
  const apiKey = getGroqApiKey();

  if (!apiKey || apiKey === "YOUR_KEY") {
    throw new Error("Missing Groq API key. Add VITE_GROQ_API_KEY to your .env file.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: buildGroqMessages(chatHistory, subject),
      temperature: 0.78,
      max_tokens: 750,
      stream: true,
    }),
  });

  if (!response.ok) {
    let errorMessage = "Volt Sensei could not reach Groq right now.";

    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error?.message || errorMessage;
    } catch {
      errorMessage = `${errorMessage} Status: ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Groq streaming is not available in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";
  let pendingText = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    pendingText += decoder.decode(value, { stream: true });
    const lines = pendingText.split("\n");
    pendingText = lines.pop() || "";

    for (const line of lines) {
      const token = parseLine(line);
      if (token !== null) {
        fullText += token;
        onChunk(fullText);
      }
    }
  }

  // Handle remaining text
  if (pendingText.trim()) {
    const token = parseLine(pendingText);
    if (token !== null) {
      fullText += token;
      onChunk(fullText);
    }
  }

  if (!fullText.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return fullText.trim();
}

function parseLine(line) {
  const cleanLine = line.trim();
  if (!cleanLine.startsWith("data:")) return null;

  const payload = cleanLine.replace(/^data:\s*/, "");
  if (payload === "[DONE]") return null;

  try {
    const parsed = JSON.parse(payload);
    return parsed?.choices?.[0]?.delta?.content || "";
  } catch {
    return null;
  }
}

function extractJson(text) {
  try {
    let cleaned = text.trim();
    
    // Remove markdown code fences if present
    cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    // Robust extraction: find the first '[' and last ']'
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");

    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = cleaned.slice(start, end + 1);
      return JSON.parse(jsonStr);
    }
    
    // Fallback: try to find any JSON-like structure
    const match = cleaned.match(/\[\s*\{.*\}\s*\]/s);
    if (match) {
      return JSON.parse(match[0]);
    }

    throw new Error("No valid JSON array found");
  } catch (error) {
    console.error("JSON Extraction Error:", error, "Text snippet:", text.slice(0, 100));
    throw new Error("Invalid quiz format received from AI.");
  }
}

function validateAndRepairQuestion(q, fallbackTopic, fallbackDifficulty) {
  if (!q || typeof q !== 'object') return null;

  const validQuestion = typeof q.question === 'string' && q.question.trim().length > 0;
  const validOptions = Array.isArray(q.options) && q.options.length >= 2;
  const hasAnswer = q.correctAnswer !== undefined && q.correctAnswer !== null;

  if (!validQuestion || !validOptions || !hasAnswer) return null;

  // Ensure options are strings and exactly 4 if possible (standardizing)
  let options = q.options.map(String).filter(s => s.trim().length > 0);
  if (options.length < 2) return null;
  
  // Ensure correct answer is one of the options
  const answerStr = String(q.correctAnswer);
  if (!options.includes(answerStr)) {
    // If it doesn't match exactly, try to find the closest match or use index if it's a number
    if (typeof q.correctAnswer === 'number' && options[q.correctAnswer]) {
      q.correctAnswer = options[q.correctAnswer];
    } else {
      // Just pick the first option as a absolute emergency repair if AI failed logic
      q.correctAnswer = options[0];
    }
  }

  // Determine XP based on difficulty (consistent with generateQuizWithGroq)
  const diff = q.difficulty || fallbackDifficulty;
  let reward = 10;
  if (diff === "JEE Advanced") reward = 75;
  else if (diff === "JEE Main") reward = 50;
  else if (diff === "Advanced") reward = 35;
  else if (diff === "Medium") reward = 20;

  return {
    question: q.question.trim(),
    options: options.slice(0, 4),
    correctAnswer: String(q.correctAnswer),
    explanation: q.explanation || "Concept: Visualize the physical system and apply the fundamental laws.",
    difficulty: diff,
    topic: q.topic || fallbackTopic,
    xpReward: reward
  };
}

export async function generateQuizWithGroq({ topic, difficulty, questionType, subject = "physics" }, attemptCount = 0) {
  const difficultyPrompts = {
    Beginner: "Focus on simple concept checks and direct formula applications. Questions should be straightforward.",
    Medium: "Include moderate calculations and require combining a basic concept with a formula.",
    Advanced: "Focus on multi-step reasoning and deeper conceptual understanding. Questions should require more than one major step to solve.",
    "JEE Main": "Genuinely match JEE Main level. Focus on NCERT-based applications, time-pressure MCQs, and standard JEE Main problem patterns. No simple or school-level questions.",
    "JEE Advanced": "Genuinely match JEE Advanced level. Questions must be hard, involving multiple concepts (multi-concept), multiple logical steps, and tricky reasoning. Use professional academic language."
  };

  const subjectInstructions = {
    physics: "Focus on conceptual physics and complex numericals. Include SI units where applicable.",
    maths: "Focus on rigorous calculations and logical derivations. Use clear mathematical notation.",
    chemistry: "Focus on chemical reactions, molecular structures, mechanisms, and physical chemistry numericals where applicable."
  };

  const prompt = `Generate exactly 10 ${difficulty} ${questionType} quiz questions for class 11-12 JEE level on ${topic} for the subject of ${subject}.
${difficultyPrompts[difficulty] || ""}
${subjectInstructions[subject] || ""}

CRITICAL: Return ONLY a raw JSON array of 10 objects. 
Each object MUST have: "question", "options" (array of 4 strings), "correctAnswer" (must match an option exactly), "explanation", "difficulty", "topic".
DO NOT include markdown fences, DO NOT include introductory text.`;

  try {
    const answer = await askVoltSensei([
      {
        role: "student",
        text: prompt,
      },
    ], subject, { max_tokens: 3500, temperature: 0.65 });

    let parsed = extractJson(answer);
    let validated = (Array.isArray(parsed) ? parsed : [])
      .map(q => validateAndRepairQuestion(q, topic, difficulty))
      .filter(Boolean);

    // If we have at least 1 but less than 10, try to fix it by requesting missing ones or padding with clones if absolute emergency
    if (validated.length > 0 && validated.length < 10) {
      console.warn(`Only ${validated.length}/10 questions valid. Attempting to fill...`);
      // In a real prod app we might call AI again, but for safety/UX we pad with slightly modified existing ones 
      // or just retry the whole call if we're far off.
      if (attemptCount < 2) return generateQuizWithGroq({ topic, difficulty, questionType, subject }, attemptCount + 1);
      
      // Padding logic if we've exhausted retries
      while (validated.length < 10) {
        const clone = { ...validated[validated.length % validated.length] };
        validated.push({ ...clone, question: `[Review] ${clone.question}` });
      }
    }

    if (validated.length === 0) {
      throw new Error("AI failed to provide any valid questions.");
    }

    // Ensure we return EXACTLY 10
    const final10 = validated.slice(0, 10);

    return final10.map((question, index) => ({
      ...question,
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
    }));

  } catch (err) {
    if (attemptCount < 2) {
      console.warn("Quiz generation failed, retrying...", err.message);
      return generateQuizWithGroq({ topic, difficulty, questionType, subject }, attemptCount + 1);
    }
    throw new Error(`Volt Sensei failed to generate a valid quiz: ${err.message}`);
  }
}
