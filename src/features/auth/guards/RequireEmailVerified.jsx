// filepath: src/features/auth/guards/RequireEmailVerified.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";

/*
  RequireEmailVerified Guard
   Purpose: Restricts access to routes that require a verified email address.
  Logic:
    1. If loading: Wait for auth hydration.
    2. If not logged in: Redirect to Login.
    3. If logged in but email NOT verified: Force redirect to Check Email page.
    4. Otherwise: Grant access to protected content.
 */
export default function RequireEmailVerified({ children }) {
  const { isAuthenticated, emailVerified, loading } = useAuth();

  // Prevent UI flickering during session recovery
  if (loading) return null;

  // Step 1: Authentication Check
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Step 2: Verification Check
  if (!emailVerified) {
    // If the user hasn't verified their email, they must go to the status page
    return <Navigate to={ROUTES.CHECK_EMAIL} replace />;
  }

  // Access Granted
  return children;
}


