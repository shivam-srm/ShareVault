import express from "express";
import {
  chatWithVault,
  publicChat,
  analyzeDocument,
  askQuestion,
  getAnalysis,
  chatWithAttachment,
} from "../controllers/ai.controller.js";
import authenticate from "../middlewares/auth.middlewares.js";
import chatUpload from "../middlewares/chatUpload.middlewares.js";

const router = express.Router();

// Public landing-page assistant (no auth required)
router.post("/public-chat", publicChat);

router.post("/chat", authenticate, chatWithVault);

// Chat with an attached screenshot / document
router.post(
  "/chat-attachment",
  authenticate,
  (req, res, next) =>
    chatUpload.single("file")(req, res, (err) =>
      err ? res.status(400).json({ error: err.message }) : next()
    ),
  chatWithAttachment
);

// ShareVault AI — document analysis
router.post("/analyze/:fileId", authenticate, analyzeDocument);
router.post("/ask/:fileId", authenticate, askQuestion);
router.get("/analysis/:fileId", authenticate, getAnalysis);

export default router;
