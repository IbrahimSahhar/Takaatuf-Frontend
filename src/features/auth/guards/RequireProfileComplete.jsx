// filepath: src/features/auth/guards/RequireProfileComplete.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";
import { storeProfileRedirectOnce } from "../utils/authRedirect";

/**
 * Builds a string representation of the full URL (Path + Search + Hash).
 */
const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

/*
  RequireProfileComplete Guard
   Purpose: Ensures the user has finished setting up their profile (Roles, Wallets, etc.)
  before accessing the core features of the app.
   Logic:
    1. Wait for auth hydration.
    2. If not logged in, pass through (let RequireAuth handle it).
    3. If profile is complete, grant access.
    4. Bypass check for "Setup" pages to prevent infinite redirect loops.
 */
export default function RequireProfileComplete({ children }) {
  const { profileComplete, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Avoid redirect decisions while auth state is loading
  if (loading) return null;

  // 1. Skip if the user isn't logged in (authentication is another guard's job)
  if (!isAuthenticated) return children;

  // 2. Profile is already finished - proceed to destination
  if (profileComplete) return children;

  // 3. Bypass pages that are part of the setup flow to avoid infinite loops
  const path = location.pathname;
  const SETUP_PAGES = [
    ROUTES.COMPLETE_PROFILE,
    ROUTES.CHECK_EMAIL,
    ROUTES.CONFIRM_LOCATION
  ];

  if (SETUP_PAGES.includes(path)) {
    return children;
  }

  // 4. Profile incomplete: Store the original intent and redirect to setup
  storeProfileRedirectOnce(fullPath(location));

  return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
}

