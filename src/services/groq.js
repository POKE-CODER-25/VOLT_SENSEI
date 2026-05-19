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
    // Remove markdown
    cleaned = cleaned.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    const start = cleaned.indexOf("[");
    let end = cleaned.lastIndexOf("]");

    if (start === -1) {
      throw new Error("No JSON array start found");
    }

    // If no closing bracket, it might be truncated. 
    // We try to find the last closing brace and close the array ourselves as a last resort.
    if (end === -1 || end < start) {
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace !== -1 && lastBrace > start) {
        cleaned = cleaned.slice(start, lastBrace + 1) + "]";
        end = cleaned.lastIndexOf("]");
      } else {
        throw new Error("No valid JSON content found");
      }
    }

    const jsonStr = cleaned.slice(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("JSON Extraction Error:", error, "Text:", text);
    throw new Error("Invalid quiz format received from AI.");
  }
}

function validateQuizData(data) {
  if (!Array.isArray(data)) return [];
  
  return data.filter(q => {
    return (
      q &&
      typeof q.question === 'string' && q.question.length > 0 &&
      Array.isArray(q.options) && q.options.length >= 2 &&
      q.correctAnswer !== undefined && q.correctAnswer !== null &&
      typeof q.explanation === 'string'
    );
  });
}

export async function generateQuizWithGroq({ topic, difficulty, questionType, subject = "physics" }, attemptCount = 0) {
  const subjectInstructions = {
    physics: "Focus on conceptual physics and complex numericals. Include SI units where applicable.",
    maths: "Focus on step-by-step rigorous mathematical proofs and calculations. Use clear mathematical notation.",
    chemistry: "Focus on chemical reactions, molecular structures, mechanisms, and physical chemistry numericals where applicable."
  };

  const prompt = `Generate exactly 5 ${difficulty} ${questionType} quiz questions for class 11-12 JEE level on ${topic} for the subject of ${subject}.
${subjectInstructions[subject] || ""}
Return ONLY a raw JSON array of objects.
CRITICAL: No markdown, no code blocks, no preamble, no explanations outside JSON.
Each object MUST have: "question", "options" (array of 4), "correctAnswer" (must match an option), "explanation", "difficulty", "topic", "xpReward".`;

  try {
    const answer = await askVoltSensei([
      {
        role: "student",
        text: prompt,
      },
    ], subject, { max_tokens: 1500, temperature: 0.6 });

    let parsed = extractJson(answer);
    let validated = validateQuizData(parsed);

    if (validated.length === 0) {
      throw new Error("AI failed to provide any valid questions.");
    }

    let baseXP = 120;
    if (subject === "maths") baseXP = 150;
    else if (subject === "physics") baseXP = 130;
    else if (subject === "chemistry") baseXP = 110;

    return validated.map((question, index) => ({
      id: `${Date.now()}-${index}`,
      question: question.question,
      options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
      correctAnswer: String(question.correctAnswer),
      explanation: question.explanation || "No explanation provided.",
      difficulty: question.difficulty || difficulty,
      topic: question.topic || topic,
      xpReward: Number(question.xpReward || (difficulty.includes("Advanced") ? baseXP * 2 : difficulty.includes("Hard") ? baseXP * 1.5 : baseXP)),
    }));
  } catch (err) {
    if (attemptCount < 1) {
      console.warn("Quiz generation failed, retrying once...", err.message);
      return generateQuizWithGroq({ topic, difficulty, questionType, subject }, attemptCount + 1);
    }
    throw new Error(`Volt Sensei failed to generate a valid quiz: ${err.message}`);
  }
}
