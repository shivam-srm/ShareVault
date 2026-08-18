import mongoose from "mongoose";
import { File } from "../models/file.models.js";
import { chatWithVaultAI, AIServiceError as ChatAIServiceError } from "../services/aiService.js";
import { extractTextFromBuffer } from "../services/pdfService.js";
import path from "path";

/** Public (no-auth) landing page assistant — answers questions about ShareVault. */
export const publicChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemPrompt = `You are "Vault Assistant", the friendly guide on the ShareVault public website.
ShareVault is a secure file sharing platform: users upload files, get shareable links with expiry dates,
track downloads from a dashboard, and can run AI document analysis (summary, document type, keywords,
security risk, sensitive data detection) on their uploaded PDFs, DOCX and text files.
Guests can also share a file without an account, but a free account unlocks unlimited uploads,
analytics and the dashboard.

Rules:
- You are talking to a visitor who is NOT logged in. You have no access to any files or accounts.
- Never claim to see, delete or modify files. If asked, invite them to sign up or log in.
- Answer questions about ShareVault features, pricing-free signup, security and how to get started.
- Be warm, concise and helpful. Use Markdown. Keep answers under 120 words.`;

    const aiMessage = await chatWithVaultAI({ systemPrompt, history, message: message.trim() });
    res.status(200).json({ message: aiMessage });
  } catch (error) {
    if (error instanceof ChatAIServiceError) {
      return res.status(error.status || 500).json({ error: error.message });
    }
    console.error("Public Assistant Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Vault Assistant is temporarily unavailable." });
  }
};

export const chatWithVault = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user.userId;

    // Fetch user's files to give context to the AI
    const files = await File.find({ owner: userId }).select("name size type createdAt expiresAt");
    
    const fileListContext = files.length > 0 
      ? `The user has the following files in their ShareVault:\n${files.map(f => `- ${f.name} (${(f.size / 1024).toFixed(1)} KB, ${f.type}, uploaded ${new Date(f.createdAt).toLocaleDateString()})`).join("\n")}`
      : "The user has no files yet.";

    const systemPrompt = `You are "Vault Assistant", the premium AI agent for ShareVault.
ShareVault is a high-end file sharing platform.
Your goal is to help the user manage their files, explain what they have, and provide general assistance.

AVAILABLE ACTIONS:
- To DELETE a file, reply with exactly: ACTION:DELETE:fileId (e.g., ACTION:DELETE:65d1...)
- To RENEW/UPDATE EXPIRY, reply with exactly: ACTION:RENEW:fileId (e.g., ACTION:RENEW:65d1...)

${fileListContext}
Be professional, helpful, and concise. Use Markdown for formatting.`;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const aiMessage = await chatWithVaultAI({ systemPrompt, history, message: message.trim() });
    res.status(200).json({ message: aiMessage });
  } catch (error) {
    if (error instanceof ChatAIServiceError) {
      return res.status(error.status || 500).json({ error: error.message });
    }
    console.error("AI Assistant Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Vault Assistant is temporarily unavailable." });
  }
};

/* ============================================================
   ShareVault AI — Document Analysis
   ============================================================ */
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import s3 from "../config/s3.js";
import { AIAnalysis } from "../models/AIAnalysis.js";
import { extractText, isSupportedForExtraction } from "../services/pdfService.js";
import { analyzeDocumentText, answerQuestion, AIServiceError } from "../services/aiService.js";

const MAX_TEXT_CHARS = 50000;

/** Resolve the owned file or send the proper error response. */
const resolveOwnedFile = async (req, res) => {
  const { fileId } = req.params;
  if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
    res.status(400).json({ message: "A valid fileId is required." });
    return null;
  }

  const file = await File.findById(fileId);
  if (!file) {
    res.status(404).json({ message: "File not found." });
    return null;
  }

  if (String(file.createdBy) !== String(req.user.userId)) {
    res.status(403).json({ message: "You do not have access to this file." });
    return null;
  }

  return file;
};

/** Derive the S3 object key from the stored file URL (fallback to upload convention). */
const resolveS3Key = (file) => {
  try {
    const url = new URL(file.path);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    const bucket = process.env.AWS_BUCKET_NAME;
    if (bucket && key.startsWith(`${bucket}/`)) return key.slice(bucket.length + 1);
    if (key) return key;
  } catch {
    /* stored path is not an absolute URL — fall through */
  }
  return `file-share-app/${file.name}`;
};

/** Download the object from the existing S3 configuration into a temp file. */
const downloadToTemp = async (file) => {
  const Key = resolveS3Key(file);
  const data = await s3
    .getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key })
    .promise();

  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const tmpPath = path.join(os.tmpdir(), `sharevault-${randomUUID()}${ext}`);
  await fs.writeFile(tmpPath, data.Body);
  return tmpPath;
};

const publicAnalysis = (doc) => ({
  fileId: doc.fileId,
  summary: doc.summary,
  documentType: doc.documentType,
  keywords: doc.keywords,
  securityRisk: doc.securityRisk,
  sensitiveData: doc.sensitiveData,
  status: doc.status,
  error: doc.error,
  hasText: Boolean(doc.extractedText),
  updatedAt: doc.updatedAt,
});

export const analyzeDocument = async (req, res) => {
  let tmpPath = null;
  try {
    const file = await resolveOwnedFile(req, res);
    if (!file) return;

    // Cache: never re-call OpenRouter for a completed analysis.
    const existing = await AIAnalysis.findOne({ fileId: file._id });
    if (existing && existing.status === "completed") {
      return res.status(200).json({ analysis: publicAnalysis(existing), cached: true });
    }

    if (!isSupportedForExtraction(file.name, file.type || "")) {
      return res.status(400).json({
        message: "No extractable text: this file type is not supported for AI analysis.",
      });
    }

    tmpPath = await downloadToTemp(file);
    const { text } = await extractText(tmpPath, file.name);
    const trimmed = (text || "").trim().slice(0, MAX_TEXT_CHARS);

    if (trimmed.length < 20) {
      await AIAnalysis.findOneAndUpdate(
        { fileId: file._id },
        { fileId: file._id, status: "failed", error: "No extractable text found." },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.status(400).json({ message: "No extractable text found in this document." });
    }

    const result = await analyzeDocumentText({ text: trimmed, fileName: file.name });

    const saved = await AIAnalysis.findOneAndUpdate(
      { fileId: file._id },
      {
        fileId: file._id,
        ...result,
        extractedText: trimmed,
        status: "completed",
        error: "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ analysis: publicAnalysis(saved), cached: false });
  } catch (error) {
    console.error("AI analyzeDocument error:", error.message);
    const status = error instanceof AIServiceError ? error.status : 500;
    try {
      if (req.params?.fileId && mongoose.Types.ObjectId.isValid(req.params.fileId)) {
        await AIAnalysis.findOneAndUpdate(
          { fileId: req.params.fileId },
          { fileId: req.params.fileId, status: "failed", error: "Analysis failed." },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }
    } catch { /* ignore bookkeeping failure */ }
    return res.status(status).json({
      message:
        error instanceof AIServiceError
          ? error.message
          : "Analysis failed. Please try again.",
    });
  } finally {
    if (tmpPath) {
      try { await fs.unlink(tmpPath); } catch { /* temp file already gone */ }
    }
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const file = await resolveOwnedFile(req, res);
    if (!file) return;

    const analysis = await AIAnalysis.findOne({ fileId: file._id });
    if (!analysis) return res.status(200).json({ analysis: null });

    return res.status(200).json({ analysis: publicAnalysis(analysis), cached: true });
  } catch (error) {
    console.error("AI getAnalysis error:", error.message);
    return res.status(500).json({ message: "Could not load the analysis." });
  }
};

export const askQuestion = async (req, res) => {
  try {
    const file = await resolveOwnedFile(req, res);
    if (!file) return;

    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    if (!question || question.length > 1000) {
      return res.status(400).json({ message: "Please provide a question (1-1000 characters)." });
    }

    const analysis = await AIAnalysis.findOne({ fileId: file._id });
    if (!analysis || !analysis.extractedText) {
      return res.status(400).json({
        message: "Analyze this document first so the AI has its content.",
      });
    }

    const answer = await answerQuestion({
      text: analysis.extractedText,
      fileName: file.name,
      question,
    });

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("AI askQuestion error:", error.message);
    const status = error instanceof AIServiceError ? error.status : 500;
    return res.status(status).json({
      message:
        error instanceof AIServiceError ? error.message : "Could not answer the question.",
    });
  }
};


const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const MIME_BY_EXT = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif",
};

/** Build an attachment payload for the AI from an uploaded (in-memory) file. */
export const buildAttachment = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (IMAGE_EXTS.has(ext)) {
    const mime = MIME_BY_EXT[ext] || file.mimetype || "image/png";
    return {
      kind: "image",
      fileName: file.originalname,
      dataUrl: `data:${mime};base64,${file.buffer.toString("base64")}`,
    };
  }
  const { text } = await extractTextFromBuffer(file.buffer, file.originalname);
  if (!text || !text.trim()) {
    throw Object.assign(new Error("No readable text found in the attached file."), { status: 400 });
  }
  return { kind: "text", fileName: file.originalname, text };
};

/** Vault Assistant chat with an attached screenshot or document. */
export const chatWithAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "An attachment is required." });

    const { message = "" } = req.body;
    let history = [];
    try {
      history = req.body.history ? JSON.parse(req.body.history) : [];
    } catch { history = []; }

    const attachment = await buildAttachment(req.file);

    const systemPrompt = `You are "Vault Assistant", the premium AI agent for ShareVault.
The user has attached a file directly in the chat for analysis.
- Analyze ONLY what the attachment actually contains; never invent details.
- For screenshots/images: describe what is shown and answer the user's question about it.
- For documents: summarise, extract key points, and flag any sensitive data (API keys, passwords, personal info) you notice.
- Be professional and concise. Use Markdown.`;

    const aiMessage = await chatWithVaultAI({
      systemPrompt,
      history,
      message: message.trim() || "Analyze this attachment.",
      attachment,
    });

    res.status(200).json({ message: aiMessage, attachment: { name: attachment.fileName, kind: attachment.kind } });
  } catch (error) {
    if (error instanceof ChatAIServiceError) {
      return res.status(error.status || 500).json({ error: error.message });
    }
    if (error.status === 400) return res.status(400).json({ error: error.message });
    console.error("Attachment chat error:", error.message);
    res.status(500).json({ error: "Could not analyze the attachment. Please try another file." });
  }
};
