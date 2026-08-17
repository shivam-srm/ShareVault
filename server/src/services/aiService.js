import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

const DOC_TYPES = ["academic", "code", "legal", "invoice", "image", "other"];
const RISKS = ["LOW", "MEDIUM", "HIGH"];
const SENSITIVE_TYPES = [
  "api_key", "email", "phone", "password", "pii", "credit_card", "other",
];

class AIServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

const callOpenRouter = async (messages, { maxTokens = 1200, temperature = 0.2 } = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AIServiceError("AI service unavailable: OpenRouter is not configured.", 500);
  }

  try {
    const { data } = await axios.post(
      OPENROUTER_URL,
      {
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "ShareVault AI",
        },
        timeout: 90000,
      }
    );

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new AIServiceError("AI service returned an empty response.", 500);
    return content;
  } catch (err) {
    if (err instanceof AIServiceError) throw err;
    console.error("OpenRouter error:", err.response?.status, err.response?.data || err.message);
    throw new AIServiceError("AI service unavailable. Please try again later.", 500);
  }
};

const parseJsonBlock = (raw) => {
  let text = String(raw).trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new AIServiceError("AI returned an unreadable response.", 500);
  return JSON.parse(text.slice(start, end + 1));
};

/** Validate + normalise the model's analysis JSON. */
export const validateAnalysis = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    throw new AIServiceError("AI returned an invalid analysis payload.", 500);
  }

  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  if (!summary) throw new AIServiceError("AI returned an analysis without a summary.", 500);

  const documentType = DOC_TYPES.includes(parsed.documentType) ? parsed.documentType : "other";
  const securityRisk = RISKS.includes(String(parsed.securityRisk).toUpperCase())
    ? String(parsed.securityRisk).toUpperCase()
    : "LOW";

  const keywords = Array.isArray(parsed.keywords)
    ? parsed.keywords
        .filter((k) => typeof k === "string" && k.trim())
        .map((k) => k.trim().slice(0, 60))
        .slice(0, 15)
    : [];

  const sensitiveData = Array.isArray(parsed.sensitiveData)
    ? parsed.sensitiveData
        .filter((s) => s && typeof s === "object")
        .map((s) => ({
          type: SENSITIVE_TYPES.includes(s.type) ? s.type : "other",
          count: Number.isFinite(Number(s.count)) ? Math.max(0, Math.floor(Number(s.count))) : 0,
          locations: Array.isArray(s.locations)
            ? s.locations.filter((n) => Number.isFinite(Number(n))).map(Number).slice(0, 50)
            : [],
        }))
        .slice(0, 20)
    : [];

  return { summary: summary.slice(0, 4000), documentType, keywords, securityRisk, sensitiveData };
};

export const analyzeDocumentText = async ({ text, fileName }) => {
  const systemPrompt = `You are ShareVault AI, a document analysis engine.
Rules:
- Analyze ONLY the supplied document content. Never invent information.
- Identify the document type, important keywords, and obvious sensitive information.
- Assign a security risk of LOW, MEDIUM or HIGH based on sensitive data found.
- Respond with VALID JSON only, no prose, no markdown fences.

JSON shape:
{"summary":"string","documentType":"academic|code|legal|invoice|image|other","keywords":["string"],"securityRisk":"LOW|MEDIUM|HIGH","sensitiveData":[{"type":"api_key|email|phone|password|pii|credit_card|other","count":0,"locations":[]}]}`;

  const userPrompt = `File name: ${fileName}\n\nDocument content:\n"""\n${text}\n"""`;

  const raw = await callOpenRouter([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  return validateAnalysis(parseJsonBlock(raw));
};

export const answerQuestion = async ({ text, fileName, question }) => {
  const systemPrompt = `You are ShareVault AI answering questions about a single uploaded document.
Answer ONLY using the document content supplied below. Do not use outside knowledge and do not guess.
If the answer is not present in the document, reply exactly:
I could not find this information in the uploaded document.
Use concise Markdown.`;

  const userPrompt = `File name: ${fileName}\n\nDocument content:\n"""\n${text}\n"""\n\nQuestion: ${question}`;

  return callOpenRouter(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { maxTokens: 800, temperature: 0.1 }
  );
};

export { AIServiceError };

/** Vault Assistant chat — general assistant grounded in the user's file list. */
export const chatWithVaultAI = async ({ systemPrompt, history = [], message }) => {
  const safeHistory = (Array.isArray(history) ? history : [])
    .filter((m) => m && typeof m.content === "string" && ["user", "assistant"].includes(m.role))
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  return callOpenRouter(
    [
      { role: "system", content: systemPrompt },
      ...safeHistory,
      { role: "user", content: String(message).slice(0, 4000) },
    ],
    { maxTokens: 900, temperature: 0.4 }
  );
};

export default {
  analyzeDocumentText,
  answerQuestion,
  chatWithVaultAI,
  validateAnalysis,
  AIServiceError,
};
