// filepath: src/features/auth/context/auth.roles.js
import { ROLES } from "../../../constants";

/*
  Normalizes a role string by converting to lowercase and trimming whitespace.
 */
const normalizeRole = (role) =>
  String(role || "")
    .toLowerCase()
    .trim();

/*
  Maps various role aliases to the application's canonical roles.
  Supports legacy naming or external provider formats.
 */
const ROLE_ALIASES = {
  // Key Person (Inside Gaza) aliases
  knowledge_provider: ROLES.KP,
  provider: ROLES.KP,

  // Key Requester (Outside Gaza) aliases
  knowledge_requester: ROLES.KR,
  requester: ROLES.KR,

  // Admin aliases
  administrator: ROLES.ADMIN,
  admin: ROLES.ADMIN,
};

/*
  Set of allowed canonical roles defined in the application constants.
 */
const CANONICAL = new Set([ROLES.KP, ROLES.KR, ROLES.ADMIN]);

/**
 * Converts any role input into a strictly validated canonical role (kp, kr, or admin).
 * @param {string} role - The raw role string from API or storage.
 * @returns {string} The canonical role or normalized string if no match is found.
 */
export const canonicalizeRole = (role) => {
  const r = normalizeRole(role);
  if (!r) return "";

  // 1. Direct match with canonical roles
  if (CANONICAL.has(r)) return r;

  // 2. Match against known aliases
  const mapped = ROLE_ALIASES[r];
  if (mapped) return mapped;

  // 3. Fallback to normalized value
  return r;
};