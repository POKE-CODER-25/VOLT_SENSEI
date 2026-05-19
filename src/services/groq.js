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

export async function askVoltSensei(chatHistory, subject = "physics") {
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
      temperature: 0.75,
      max_tokens: 650,
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

    if (done) {
      if (pendingText.trim()) {
        const lines = (pendingText + "\n").split("\n");
        for (const line of lines) {
          const token = parseLine(line);
          if (token) {
            fullText += token;
            onChunk(fullText);
          }
        }
      }
      break;
    }

    pendingText += decoder.decode(value, { stream: true });
    const lines = pendingText.split("\n");
    pendingText = lines.pop() || "";

    for (const line of lines) {
      const token = parseLine(line);
      if (token) {
        fullText += token;
        onChunk(fullText);
      }
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
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("AI quiz response did not include valid JSON array.");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    console.error("JSON Extraction Error:", error, "Text:", text);
    throw new Error("Volt Sensei provided an invalid quiz format. Please try again.");
  }
}

export async function generateQuizWithGroq({ topic, difficulty, questionType, subject = "physics" }) {
  const prompt = `Generate exactly 5 ${difficulty} ${questionType} quiz questions for class 11-12 JEE level on ${topic} for the subject of ${subject}.
Return ONLY a valid JSON array of objects. Do not use markdown blocks like \`\`\`json. Just the raw JSON.
Each object must have exactly these keys:
"question": string,
"options": array of exactly 4 strings (for Numerical, provide 4 close options),
"correctAnswer": string (must exactly match one of the options),
"explanation": string (step-by-step),
"difficulty": string,
"topic": string,
"xpReward": number (integer).`;

  const answer = await askVoltSensei([
    {
      role: "student",
      text: prompt,
    },
  ], subject);

  const parsed = extractJson(answer);

  return parsed.map((question, index) => ({
    id: `${Date.now()}-${index}`,
    question: question.question,
    options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || "No explanation provided.",
    difficulty: question.difficulty || difficulty,
    topic: question.topic || topic,
    xpReward: Number(question.xpReward || (difficulty.includes("Advanced") ? 200 : difficulty.includes("Hard") ? 160 : 120)),
  }));
}
