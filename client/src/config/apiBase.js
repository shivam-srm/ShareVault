// Same resolution rule as axiosInstance: use VITE_API_URL in prod builds,
// otherwise "/api/" so the Vite dev proxy forwards to the Express server.
export const API_BASE = import.meta.env.VITE_API_URL || "/api/";
