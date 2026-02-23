// filepath: src/features/auth/context/auth.profile.js
import { canonicalizeRole } from "./auth.roles";
import { get, isNonEmpty } from "./auth.utils";
import { ROLES, WALLET_TYPES } from "../../../constants";

/*
  Storage key for manual profile completion overrides (useful for development/mocking).
 */
export const LS_PROFILE_COMPLETE_KEY = "profile_complete_mock";

/*
  Validates crypto wallet addresses based on the selected network type.
  Supports: Ethereum (0x...), Bitcoin (1, 3, or bc1...), and Solana.
 */
export const validateWalletAddress = (type, address) => {
  const t = String(type || "").toLowerCase();
  const a = String(address || "").trim();

  if (!a) return false;

  // Ethereum: Standard 0x followed by 40 hex characters
  if (t === WALLET_TYPES.ETHEREUM) return /^0x[a-fA-F0-9]{40}$/.test(a);

  // Bitcoin: Legacy, SegWit, or Bech32 formats
  if (t === WALLET_TYPES.BITCOIN) {
    return (
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(a) ||
      /^bc1[ac-hj-np-z02-9]{25,90}$/.test(a)
    );
  }

  // Solana: Base58 encoded addresses (32-44 characters)
  if (t === WALLET_TYPES.SOLANA) return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);

  return true;
};

/*
  Identifies missing or invalid profile fields based on the user's role.
  Role-specific requirements:
  - KP: Must provide a valid crypto wallet.
  - KR: Must provide a PayPal account.
 */
export const computeMissingProfileFields = (u) => {
  const missing = [];

  // General fields required for all users
  const name = get(u, "name");
  const city = get(u, "city", "neighborhood", "cityNeighborhood", "city_neighborhood");

  if (!isNonEmpty(name)) missing.push("name");
  if (!isNonEmpty(city)) missing.push("city_neighborhood");

  const role = canonicalizeRole(get(u, "role"));
  if (!role) {
    missing.push("role");
    return missing; // Cannot validate further without a role
  }

  // Role: Key Person (Inside Gaza)
  if (role === ROLES.KP) {
    const walletType = get(u, "walletType", "wallet_type", "cryptoWalletType");
    const walletAddress = get(u, "walletAddress", "wallet_address", "cryptoWalletAddress");

    if (!isNonEmpty(walletType)) missing.push("wallet_type");
    if (!isNonEmpty(walletAddress)) missing.push("wallet_address");

    if (isNonEmpty(walletType) && isNonEmpty(walletAddress)) {
      if (!validateWalletAddress(walletType, walletAddress)) {
        missing.push("wallet_address_invalid");
      }
    }
  }

  // Role: Key Requester (Outside Gaza)
  if (role === ROLES.KR) {
    const paypal = get(u, "paypalAccount", "paypal_account", "paypalEmail");
    if (!isNonEmpty(paypal)) missing.push("paypal_account");
  }

  return missing;
};


export const computeProfileComplete = (u) => {
  // Check for explicit flag from API response
  const backendFlag = get(u, "profile_complete", "profileComplete", "profile_completed");
  if (typeof backendFlag === "boolean") return backendFlag;

  // Check for local dev override
  const ls = localStorage.getItem(LS_PROFILE_COMPLETE_KEY);
  if (ls === "true" || ls === "false") return ls === "true";

  // Infer status from missing fields
  const missing = computeMissingProfileFields(u);
  return missing.length === 0;
};
