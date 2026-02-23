// filepath: src/features/auth/guards/RequireCheckEmailAccess.jsx
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../../constants";
import { useAuth } from "../context";

/**
 * RequireCheckEmailAccess Guard
 * Purpose: Ensures the Check Email page is only accessible when relevant.
 * Logic:
 * 1. Guests: Must have an 'email' in location state (passed from Register).
 * 2. Authenticated: 
 * - If no email exists (Facebook case): Redirect to Update Email.
 * - If email is already verified: Redirect away.
 */
export default function RequireCheckEmailAccess({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading, emailVerified, user } = useAuth();

  // Prevent flicker during session check
  if (loading) return null;

  const emailFromState = location.state?.email;

  // Case 1: Unauthenticated User (Guest)
  if (!isAuthenticated) {
    // Only allow access if they just came from the registration form with an email in state
    if (!emailFromState) {
      return <Navigate to={ROUTES.REGISTER} replace />;
    }
    return children;
  }

  // Case 2: Authenticated User
  
  // --- NEW LOGIC: If the authenticated user has NO email (Facebook/OAuth case) ---
  // They shouldn't be here because there's no email to "check".
  if (!user?.email) {
    return <Navigate to={ROUTES.UPDATE_EMAIL} replace />;
  }

  // If email is already verified, they don't need to be here.
  if (emailVerified) {
    // Redirect to login/dashboard (RequireAuth will handle the final destination)
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // User is logged in but email is NOT verified -> Show the page
  return children;
}