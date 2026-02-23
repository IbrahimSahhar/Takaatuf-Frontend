// filepath: src/features/profile/locationFlow/locationDecisionProvider.js
export const LOCATION_STATUS = Object.freeze({
  MATCH: "MATCH",
  MISMATCH: "MISMATCH",
  UNKNOWN: "UNKNOWN",
});

/*
  Mock Decision Provider (single place)
 *
 Control from .env:
 VITE_LOCATION_STATUS=match | mismatch | unknown
 
  Default: unknown
 */
export async function getLocationDecision() {
  const v = (import.meta.env.VITE_LOCATION_STATUS || "unknown").toLowerCase();

  if (v === "match") return { status: LOCATION_STATUS.MATCH };
  if (v === "mismatch")
    return { status: LOCATION_STATUS.MISMATCH, reason: "MISMATCH" };

  return { status: LOCATION_STATUS.UNKNOWN, reason: "UNKNOWN" };
}

