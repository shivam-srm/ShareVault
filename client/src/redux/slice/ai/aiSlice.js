import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../config/axiosInstance";

const errMsg = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const analyzeDocument = createAsyncThunk(
  "ai/analyzeDocument",
  async (fileId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/ai/analyze/${fileId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(errMsg(error, "Analysis failed."));
    }
  }
);

export const getAnalysis = createAsyncThunk(
  "ai/getAnalysis",
  async (fileId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/ai/analysis/${fileId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(errMsg(error, "Could not load the analysis."));
    }
  }
);

export const askQuestion = createAsyncThunk(
  "ai/askQuestion",
  async ({ fileId, question }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/ai/ask/${fileId}`, { question });
      return res.data;
    } catch (error) {
      return rejectWithValue(errMsg(error, "Could not answer the question."));
    }
  }
);

const initialState = {
  analysis: null,
  loading: false,
  analyzing: false,
  asking: false,
  answer: "",
  error: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    resetAI: () => initialState,
    clearAnswer: (state) => {
      state.answer = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // getAnalysis
      .addCase(getAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload?.analysis || null;
      })
      .addCase(getAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // analyzeDocument
      .addCase(analyzeDocument.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(analyzeDocument.fulfilled, (state, action) => {
        state.analyzing = false;
        state.analysis = action.payload?.analysis || null;
      })
      .addCase(analyzeDocument.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      // askQuestion
      .addCase(askQuestion.pending, (state) => {
        state.asking = true;
        state.error = null;
      })
      .addCase(askQuestion.fulfilled, (state, action) => {
        state.asking = false;
        state.answer = action.payload?.answer || "";
      })
      .addCase(askQuestion.rejected, (state, action) => {
        state.asking = false;
        state.error = action.payload;
      });
  },
});

export const { resetAI, clearAnswer } = aiSlice.actions;
export default aiSlice.reducer;
