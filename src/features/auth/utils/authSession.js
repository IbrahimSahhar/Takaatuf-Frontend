// filepath: src/features/auth/utils/authSession.js
import { STORAGE_KEYS } from "../../../constants/storageKeys";

const STORAGE_KEY = STORAGE_KEYS.AUTH;
const SESSION_TTL_MS = 365 * 24 * 60 * 60 * 1000; 

const now = () => Date.now();

/*
  Converts value to a finite number or returns null.
 */
const toNumber = (v) => {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : null;
};

/*
  Checks if the given timestamp has passed.
 */
const isExpired = (expiresAt) =>
  typeof expiresAt === "number" && expiresAt <= now();

/*
  Loads the auth snapshot from localStorage.
  - Returns null if session is missing, invalid, or expired.
  - Automatically wipes storage if data is corrupted or outdated.
 */
export function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const token = parsed?.token ?? null;
    const user = parsed?.user ?? null;
    const exp = toNumber(parsed?.expiresAt);

    // 1. Check for expiration
    if (exp && isExpired(exp)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // 2. Integrity Check: Both token and user must coexist
    if ((token && !user) || (!token && user)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      token,
      user,
      expiresAt: exp,
    };
  } catch {
    // Handling corrupted JSON in localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage access errors */
    }
    return null;
  }
}

/*
  Persists the auth snapshot to localStorage.
  Wrapped in try/catch to handle private browsing or full storage issues.
 */
export function saveAuth({ token, user, expiresAt }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user, expiresAt })
    );
  } catch (err) {
    console.warn("Failed to save auth session to storage:", err);
  }
}

/*
  Removes all auth data from storage (Logout).
 */
export function clearAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/*
  Fallback mechanism to ensure a valid expiration timestamp.
  If provided value is invalid, it defaults to a fresh TTL from now.
 */
export function ensureExpiresAt(expiresAt) {
  const exp = toNumber(expiresAt);
  return exp ?? now() + SESSION_TTL_MS;
}

export function makeExpiresAt() {
  return now() + SESSION_TTL_MS;
}

export function isSessionExpired(expiresAt) {
  const exp = toNumber(expiresAt);
  return exp ? isExpired(exp) : false;
}
