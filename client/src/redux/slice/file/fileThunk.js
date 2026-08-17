// src/features/file/fileThunks.js
// All endpoints are relative to axiosInstance.baseURL (`.../api/`) and prefixed
// with `files/` to match the Express router mounted at `/api/files` on the server.
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../config/axiosInstance";

// UPLOAD FILE
export const uploadFile = createAsyncThunk("file/upload", async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/upload", formData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GET FILE DETAILS
export const getFileDetails = createAsyncThunk("file/getDetails", async (fileId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/getFileDetails/${fileId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// DELETE FILE
export const deleteFile = createAsyncThunk("file/delete", async (fileId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/files/delete/${fileId}`);
    return fileId;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// UPDATE FILE STATUS
export const updateFileStatus = createAsyncThunk("file/updateStatus", async ({ fileId, status }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/files/update/${fileId}`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GENERATE SHORT LINK
export const generateShareShortenLink = createAsyncThunk("file/generateShortLink", async ({ fileId }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/generateShareShortenLink", { fileId });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// SEND LINK VIA EMAIL
export const sendLinkEmail = createAsyncThunk("file/sendLinkEmail", async ({ fileId, email }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/sendLinkEmail", { fileId, email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// UPDATE EXPIRY
export const updateFileExpiry = createAsyncThunk("file/updateExpiry", async ({ fileId, expiresAt }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/updateFileExpiry", { fileId, expiresAt });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// UPDATE PASSWORD
export const updateFilePassword = createAsyncThunk("file/updatePassword", async ({ fileId, password }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/updateFilePassword", { fileId, password });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// SEARCH FILES
export const searchFiles = createAsyncThunk("file/search", async (query, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/searchFiles?query=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// SHOW USER FILES
export const showUserFiles = createAsyncThunk("file/showUserFiles", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/files/showUserFiles");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GENERATE QR
export const generateQR = createAsyncThunk("file/generateQR", async (fileId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/generateQR/${fileId}`, { responseType: "blob" });
    return URL.createObjectURL(res.data);
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GET DOWNLOAD COUNT
export const getDownloadCount = createAsyncThunk("file/downloadCount", async (fileId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/getDownloadCount/${fileId}`);
    return { fileId, count: res.data.count };
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// RESOLVE SHORT LINK
export const resolveShareLink = createAsyncThunk("file/resolveLink", async (shortUrl, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/resolveShareLink/${shortUrl}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// VERIFY PASSWORD
export const verifyFilePassword = createAsyncThunk("file/verifyPassword", async ({ fileId, password }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/files/verifyFilePassword", { fileId, password });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

// GET USER FILES (by userId)
export const getUserFiles = createAsyncThunk("file/getUserFiles", async (userId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/files/getUserFiles/${userId}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});
