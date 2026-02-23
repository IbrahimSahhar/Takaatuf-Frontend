

// filepath: src/services/api/client.js
import axios from "axios";
import { loadAuth, clearAuth } from "../../features/auth/utils/authSession";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const auth = loadAuth();
  const token = auth?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // session invalid/expired
      clearAuth();
    }
    return Promise.reject(error);
  }
);
