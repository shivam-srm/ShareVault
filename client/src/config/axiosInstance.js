import axios from "axios";

// Base URL comes from Vite env (VITE_API_URL). In dev we fall back to `/api/`
// so requests go through the Vite dev proxy (see vite.config.js) to the
// Express server. In prod builds you can set VITE_API_URL to the deployed
// backend URL (e.g. https://api.example.com/api/).
const BASE_URL = import.meta.env.VITE_API_URL || "/api/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ---------- Auth token attachment ----------
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* localStorage unavailable — ignore */
  }
  return config;
});

// ---------- 401 handler ----------
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch { /* noop */ }
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup") &&
        window.location.pathname !== "/"
      ) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
