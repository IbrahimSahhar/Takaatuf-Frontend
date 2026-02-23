
// filepath: src/features/auth/services/authMock.service.js
import { loadUsers, saveUsers } from "../utils/authStorage";
import { peekRedirect } from "../utils/authRedirect";
import { ROUTES } from "../../../constants/routes";
import { ROLES } from "../../../constants/roles";

const PROVIDER_EMAILS = {
  google: "user@gmail.com",
  facebook: "user@facebook.com",
};

/**
 * Simulates obtaining identity from a social provider.
 */
export function getProviderIdentity(provider) {
  const p = String(provider || "").toLowerCase().trim();

  if (p === "cancel") {
    const err = new Error("Authentication was cancelled by the user.");
    err.code = "CANCELLED";
    throw err;
  }

  return {
    provider: p,
    email: PROVIDER_EMAILS[p] || `user@${p || "unknown"}.com`,
  };
}

/** * Cleans a URL by removing query strings and hashes for stable route matching.
 */
const normalizePath = (url = "") => String(url).split(/[?#]/)[0];

/**
 * Intelligent Role Derivation:
 * If a user was trying to reach /admin, we mock them as an ADMIN.
 * If /kp-dashboard, they become a KP (Provider).
 * Otherwise, default to KR (Requester).
 */
const deriveRoleFromNext = (next) => {
  const path = normalizePath(next);

  if (path.startsWith(ROUTES.DASH_ADMIN)) return ROLES.ADMIN;
  if (path.startsWith(ROUTES.DASH_KP)) return ROLES.KP;

  return ROLES.KR;
};

/**
 * Fetches a mock user or creates a new one in localStorage.
 * This simulates a "Find or Create" database operation.
 */
export function getOrCreateUser({ provider, email }) {
  const users = loadUsers();
  const key = `${provider}:${email}`;

  // Return existing user if found
  if (users[key]) return users[key];

  // Logic for New Users
  const next = peekRedirect() || "";
  const role = deriveRoleFromNext(next);

  const newUser = {
    id: `mock_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name:
      provider === "google"
        ? "Google User"
        : provider === "facebook"
        ? "Facebook User"
        : "Email User",
    email,
    provider,
    role,
    profile_complete: false, // Default for new mock users
    email_verified: true,    // OAuth users are usually pre-verified
  };

  users[key] = newUser;
  saveUsers(users);
  return newUser;
}

/**
 * Artificial Delay to simulate real-world network latency.
 */
export async function mockNetwork(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}
