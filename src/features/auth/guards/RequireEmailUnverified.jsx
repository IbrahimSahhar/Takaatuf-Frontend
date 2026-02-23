// filepath: src/features/auth/guards/RequireEmailUnverified.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";

/*
  RequireEmailUnverified Guard
   Purpose: Ensures the page is only accessible to logged-in users who 
  HAVE NOT yet verified their email address.
   Behavior:
     1. Not Authenticated: Redirect to Login.
     2. Authenticated & Verified: Redirect to Dashboard (already verified).
     3. Authenticated & Unverified: Allow access (e.g., to Check Email/Resend page).
 */
export default function RequireEmailUnverified({ children }) {
  const { isAuthenticated, emailVerified, loading } = useAuth();

  // Prevent UI flickering while checking auth state
  if (loading) return null;

  // 1. User is not logged in
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 2. User is logged in but already verified
  if (emailVerified) {
    // DASH_REDIRECT handles role-based routing (KP/KR)
    return <Navigate to={ROUTES.DASH_REDIRECT} replace />;
  }

  // 3. Authenticated but needs verification
  return children;
}