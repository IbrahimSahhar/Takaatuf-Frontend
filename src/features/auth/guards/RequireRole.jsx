// filepath: src/features/auth/guards/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";
import { storeLoginRedirectOnce } from "../utils/authRedirect";
import { canonicalizeRole } from "../context/auth.roles";

/*
  Builds a string representation of the full URL (Path + Search + Hash).
 */
const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

/*
  Normalizes strings for consistent comparison.
 */
const norm = (v) => String(v || "").toLowerCase().trim();

/*
  RequireRole Guard
   Purpose: Restricts access to routes based on user roles (RBAC).
   Params: 
  - allow: Array of strings representing roles that can access the route.
   Logic:
    1. Checks authentication (Redirects to Login if guest).
    2. Checks if a role is assigned (Redirects to Profile Completion if missing).
    3. Checks if the user's role exists in the 'allow' list.
 */
export default function RequireRole({ allow = [], children }) {
  const { role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Avoid redirect decisions while auth is loading
  if (loading) return null;

  const target = fullPath(location);

  // 1. Authentication Check
  if (!isAuthenticated) {
    storeLoginRedirectOnce(target);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const currentRole = canonicalizeRole(role);

  // 2. Role Assignment Check
  if (!currentRole) {
    storeLoginRedirectOnce(target);
    // If no role exists, user must finalize their profile setup
    return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
  }

  // 3. Authorization Check
  const allowed = Array.isArray(allow) ? allow : [];
  const allowedCanonical = allowed.map(canonicalizeRole).filter(Boolean);

  if (!allowedCanonical.includes(norm(currentRole))) {
    // Role is recognized but not permitted for this specific path
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }
  // 4. Permission Granted
  return children;
}
