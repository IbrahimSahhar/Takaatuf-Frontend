// filepath: src/features/auth/utils/authRedirect.js
import { ROUTES } from "../../../constants/routes";
import { ROLES } from "../../../constants/roles";
import { STORAGE_KEYS } from "../../../constants/storageKeys";

const REDIRECT_KEY = STORAGE_KEYS.REDIRECT_AFTER_LOGIN;
const PROFILE_REDIRECT_KEY = STORAGE_KEYS.REDIRECT_AFTER_PROFILE;
const LOCATION_REDIRECT_KEY = "redirect_after_location";

export const APP_BASE = ROUTES.DASH_REDIRECT || "/app";

/*
  Determines the home dashboard based on the user's role.
 */
export function roleHome(role) {
  switch (String(role || "").toLowerCase()) {
    case ROLES.ADMIN:
      return ROUTES.DASH_ADMIN;
    case ROLES.KP:
      return ROUTES.DASH_KP;
    case ROLES.KR:
    default:
      return ROUTES.DASH_KR;
  }
}

/* 
   Peek Helpers: Reading stored redirects without removing them
*/
export const peekRedirect = () => localStorage.getItem(REDIRECT_KEY);
export const peekProfileRedirect = () => localStorage.getItem(PROFILE_REDIRECT_KEY);
export const peekLocationRedirect = () => localStorage.getItem(LOCATION_REDIRECT_KEY);

/*
  Priority Logic:
  1. Location redirect (specific action required)
  2. Profile redirect (forced flow)
  3. Login redirect (initial intent)
 */
export const peekNextRedirect = () =>
  localStorage.getItem(LOCATION_REDIRECT_KEY) ||
  localStorage.getItem(PROFILE_REDIRECT_KEY) ||
  localStorage.getItem(REDIRECT_KEY) ||
  null;

/* 
   Consume Helpers: Reading AND cleaning up the storage
*/
export function consumeRedirect() {
  const next = localStorage.getItem(REDIRECT_KEY);
  localStorage.removeItem(REDIRECT_KEY);
  return next;
}

export function consumeProfileRedirect() {
  const next = localStorage.getItem(PROFILE_REDIRECT_KEY);
  localStorage.removeItem(PROFILE_REDIRECT_KEY);
  return next;
}

export function consumeLocationRedirect() {
  const next = localStorage.getItem(LOCATION_REDIRECT_KEY);
  localStorage.removeItem(LOCATION_REDIRECT_KEY);
  return next;
}

/*
  Clears all possible redirect flags and returns the highest priority one.
 */
export function consumeNextRedirect() {
  const nextRaw = peekNextRedirect();
  if (!nextRaw) return null;

  localStorage.removeItem(LOCATION_REDIRECT_KEY);
  localStorage.removeItem(PROFILE_REDIRECT_KEY);
  localStorage.removeItem(REDIRECT_KEY);
  return nextRaw;
}

/* 
   Store Helpers: Safely persisting the user's intent
*/
const hasAnyRedirect = () =>
  Boolean(peekLocationRedirect() || peekProfileRedirect() || peekRedirect());

/* Overwrites any existing login redirect with the latest intent. */
export function storeLoginRedirectOnce(target) {
  if (!target) return;
  localStorage.setItem(REDIRECT_KEY, String(target));
}

/* Stores profile redirect ONLY if no other redirect is currently pending. */
export function storeProfileRedirectOnce(target) {
  if (!target || hasAnyRedirect()) return;
  localStorage.setItem(PROFILE_REDIRECT_KEY, String(target));
}

/** Stores specific location redirect once. */
export function storeLocationRedirectOnce(target) {
  if (!target || hasAnyRedirect()) return;
  localStorage.setItem(LOCATION_REDIRECT_KEY, String(target));
}

export const storeRedirectOnce = storeLoginRedirectOnce;

/* 
   Route Mapping & Safety
*/

/*
  Prevents "Redirect Loops" by ensuring we don't redirect users 
  back to public/auth pages once they are authenticated.
 */
export function mapPublicToDashboard(path) {
  if (!path) return null;

  const p = String(path);

  // Guard: Never redirect back to these pages if the user is logged in
  const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.CHECK_EMAIL, ROUTES.HOME];
  if (authRoutes.includes(p)) {
    return ROUTES.DASH_REDIRECT;
  }

  // If the path is already deep within the app, it's safe to use
  if (p.startsWith("/app")) return p;

  // Default fallback for any other unexpected public route
  return ROUTES.DASH_REDIRECT;
}

export { REDIRECT_KEY, PROFILE_REDIRECT_KEY, LOCATION_REDIRECT_KEY };
