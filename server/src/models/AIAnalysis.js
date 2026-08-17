import mongoose, { Schema } from "mongoose";

const sensitiveDataSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["api_key", "email", "phone", "password", "pii", "credit_card", "other"],
      default: "other",
    },
    count: { type: Number, default: 0 },
    locations: { type: [Number], default: [] },
  },
  { _id: false }
);

const aiAnalysisSchema = new Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      unique: true,
      index: true,
    },
    summary: { type: String, default: "" },
    documentType: {
      type: String,
      enum: ["academic", "code", "legal", "invoice", "image", "other"],
      default: "other",
    },
    keywords: { type: [String], default: [] },
    securityRisk: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    sensitiveData: { type: [sensitiveDataSchema], default: [] },
    // Capped at 50,000 characters by the controller before saving.
    extractedText: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

export const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema);
export default AIAnalysis;
