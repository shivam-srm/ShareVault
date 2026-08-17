import express from "express";
import {
  chatWithVault,
  publicChat,
  analyzeDocument,
  askQuestion,
  getAnalysis,
} from "../controllers/ai.controller.js";
import authenticate from "../middlewares/auth.middlewares.js";

const router = express.Router();

// Public landing-page assistant (no auth required)
router.post("/public-chat", publicChat);

router.post("/chat", authenticate, chatWithVault);

// ShareVault AI — document analysis
router.post("/analyze/:fileId", authenticate, analyzeDocument);
router.post("/ask/:fileId", authenticate, askQuestion);
router.get("/analysis/:fileId", authenticate, getAnalysis);

export default router;
