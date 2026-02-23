// filepath: src/features/auth/guards/RequireLocationConfirmed.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";
import { storeLocationRedirectOnce } from "../utils/authRedirect";

/*
  Builds a string representation of the full URL (Path + Search + Hash).
 */
const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

/*
  RequireLocationConfirmed Guard
   Purpose: Intercepts users who need to confirm their location before proceeding.
   Flow:
    1. If not logged in: Passes through (auth guards will handle them).
    2. If already on the confirmation page: Passes through to avoid loops.
    3. If confirmation is required: Stores current path and redirects to CONFIRM_LOCATION.
 */
export default function RequireLocationConfirmed({ children }) {
  const { requiresLocationConfirmation, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Prevent flicker during session check
  if (loading) return null;

  // 1. Skip check if user is not authenticated
  if (!isAuthenticated) return children;

  // 2. Prevent infinite redirect loop if already on the confirmation page
  if (location.pathname === ROUTES.CONFIRM_LOCATION) return children;

  // 3. Force redirect if location flag is active
  if (requiresLocationConfirmation) {
    // Store the original destination to resume after confirmation
    storeLocationRedirectOnce(fullPath(location));

    // Handle redirection reason (default to "unknown" if not provided)
    const currentParams = new URLSearchParams(location.search || "");
    const reason = currentParams.get("reason") || "unknown";

    const searchParams = new URLSearchParams({ reason });
    
    return (
      <Navigate 
        to={`${ROUTES.CONFIRM_LOCATION}?${searchParams.toString()}`} 
        replace 
      />
    );
  }

  // 4. Access Granted
  return children;
}

