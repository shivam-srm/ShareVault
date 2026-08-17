import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "json", "xml", "yml", "yaml", "csv", "log", "env",
  "ini", "toml", "sql", "js", "jsx", "ts", "tsx", "mjs", "cjs", "py", "rb",
  "go", "rs", "java", "kt", "swift", "c", "h", "cpp", "hpp", "cc", "cs",
  "php", "sh", "bash", "html", "htm", "css", "scss", "less", "vue", "svelte",
]);

export const isSupportedForExtraction = (fileName = "", mimeType = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf" || ext === "docx") return true;
  if (TEXT_EXTENSIONS.has(ext)) return true;
  if (mimeType.startsWith("text/")) return true;
  return false;
};

/**
 * Extract plain text from a file on disk.
 * @returns {Promise<{text: string, pageCount: number}>}
 */
export const extractText = async (filePath, fileName = "") => {
  const ext = (fileName || path.basename(filePath)).split(".").pop()?.toLowerCase() || "";

  try {
    if (ext === "pdf") {
      const buffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const parsed = await parser.getText();
        return {
          text: parsed?.text || "",
          pageCount: parsed?.total ?? parsed?.pages?.length ?? 1,
        };
      } finally {
        await parser.destroy?.();
      }
    }

    if (ext === "docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return { text: result.value || "", pageCount: 1 };
    }

    if (ext === "doc") {
      throw new Error("Legacy .doc files are not supported. Please upload .docx or PDF.");
    }

    const text = await fs.readFile(filePath, "utf8");
    return { text, pageCount: 1 };
  } catch (err) {
    throw new Error(`Text extraction failed: ${err.message}`);
  }
};

export default { extractText, isSupportedForExtraction };
