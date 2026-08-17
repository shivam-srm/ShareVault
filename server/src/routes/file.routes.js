import { Router } from "express";
import upload from "../middlewares/upload.middlewares.js";
import authenticate from "../middlewares/auth.middlewares.js";
import {
  deleteFile,
  downloadInfo,
  downloadFile,
  generateQR,
  generateShareShortenLink,
  getDownloadCount,
  getFileDetails,
  getUserFiles,
  resolveShareLink,
  searchFiles,
  sendLinkEmail,
  showUserFiles,
  updateAllFileExpiry,
  updateFileExpiry,
  updateFilePassword,
  updateFileStatus,
  uploadFiles,
  verifyFilePassword,
  uploadFilesGuest,
  guestDownloadInfo,
  verifyGuestFilePassword,
} from "../controllers/file.controller.js";

const router = Router();

// Public — guest uploads, share-link resolution, download flows
router.post("/upload-guest", upload.array("files"), uploadFilesGuest);
router.get("/download/:fileId", downloadFile);
router.get("/getFileDetails/:fileId", getFileDetails);
router.get("/f/:shortCode", downloadInfo);
router.get("/g/:shortCode", guestDownloadInfo);
router.get("/resolveShareLink/:code", resolveShareLink);
router.post("/verifyFilePassword", verifyFilePassword);
router.post("/verifyGuestFilePassword", verifyGuestFilePassword);
router.get("/generateQR/:fileId", generateQR);
router.get("/getDownloadCount/:fileId", getDownloadCount);

// Authenticated — anything that mutates or lists a user's own files
router.post("/upload", authenticate, upload.array("files"), uploadFiles);
router.delete("/delete/:fileId", authenticate, deleteFile);
router.put("/update/:fileId", authenticate, updateFileStatus);
router.post("/generateShareShortenLink", authenticate, generateShareShortenLink);
router.post("/sendLinkEmail", authenticate, sendLinkEmail);
router.post("/updateFileExpiry", authenticate, updateFileExpiry);
router.post("/updateAllFileExpiry", authenticate, updateAllFileExpiry);
router.post("/updateFilePassword", authenticate, updateFilePassword);
router.get("/searchFiles", authenticate, searchFiles);
router.get("/showUserFiles", authenticate, showUserFiles);
router.get("/getUserFiles/:userId", authenticate, getUserFiles);

export default router;
