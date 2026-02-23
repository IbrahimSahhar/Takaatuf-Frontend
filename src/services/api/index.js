// filepath: src/services/api/index.js
import { mockApi } from "./mock";
import { realApi } from "./real";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// استخدام المتغير من الـ env
const useMock =
  String(import.meta.env.VITE_USE_MOCK_API || "").toLowerCase() === "true";

// طباعة الحالة في الكونصول عشان ما تتلخبط وأنت شغال
if (import.meta.env.DEV) {
  console.log(`🔌 API Service Mode: ${useMock ? "🛠️ MOCK DATA" : "🌐 REAL SERVER"}`);
}

export const api = useMock ? mockApi : realApi;

export default api;
