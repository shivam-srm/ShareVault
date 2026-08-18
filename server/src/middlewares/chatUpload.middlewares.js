import multer from "multer";
import path from "path";

const allowedExtensions = new Set([
  // images (screenshots)
  ".png", ".jpg", ".jpeg", ".webp", ".gif",
  // documents
  ".pdf", ".docx",
  // text-ish
  ".txt", ".md", ".markdown", ".json", ".csv", ".log", ".yml", ".yaml", ".xml",
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".go",
  ".rb", ".php", ".sh", ".sql", ".html", ".css",
]);

const chatUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      return cb(new Error(`Unsupported attachment type: ${ext}`));
    }
    cb(null, true);
  },
});

export default chatUpload;
