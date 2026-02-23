// filepath: src/features/auth/guards/RequireGuest.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";
import { roleHome } from "../utils/authRedirect";

/*
  RequireGuest Guard
   Purpose: Ensures that certain routes (Login, Register, etc.) are only accessible to non-authenticated users.
    Behavior:
      1. If Authenticated but Email NOT verified: Force redirect to Check Email unless already there.
      2. If Authenticated and Verified: Redirect to their respective Role Home.
      3. If Guest: Allow access to children components.
 */
export default function RequireGuest({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Prevent UI flickering during auth state hydration
  if (loading) return null;

  const isCheckEmail = location.pathname === ROUTES.CHECK_EMAIL;

  // Case 1: Authenticated but stuck in verification flow
  if (isAuthenticated && user?.email_verified === false) {
    return isCheckEmail ? children : <Navigate to={ROUTES.CHECK_EMAIL} replace />;
  }

  // Case 2: Fully authenticated and verified user
  if (isAuthenticated) {
    // Direct them to their dashboard based on their role (KP/KR/Admin)
    return <Navigate to={roleHome(user?.role)} replace />;
  }

  // Case 3: Actual Guest
  return children;
}


