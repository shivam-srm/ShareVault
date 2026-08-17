import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./slice/file/fileSlice.js";
import authReducer from "./slice/auth/authSlice.js";
import aiReducer from "./slice/ai/aiSlice.js";
const store=configureStore({
    reducer:{
      file:fileReducer,
      auth:authReducer,
      ai:aiReducer
    },
    devTools:true
})

export default store;
