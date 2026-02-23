// filepath: src/features/auth/guards/RequireProfileIncomplete.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { roleHome, storeLoginRedirectOnce } from "../utils/authRedirect";

/*
  Builds a string representation of the full URL (Path + Search + Hash).
 */
const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

/*
  RequireProfileIncomplete Guard
   Purpose: Ensures the "Complete Profile" page is only shown to users with missing data.
   Special Case: Allows access if 'allowEdit' is passed in the location state.
   Behavior:
     1. If profile is already complete: Redirects to the role's home page.
     2. If profile is incomplete: Allows access to the page.
 */
export default function RequireProfileIncomplete({ children }) {
  const { profileComplete, role, loading } = useAuth();
  const location = useLocation();

  // Avoid redirect decisions while auth is loading to prevent incorrect jumps
  if (loading) return null;

  /*
     EDIT MODE:
    Allow access if the user explicitly wants to edit their profile information,
    even if it is already marked as complete.
   */
  if (location.state?.allowEdit === true) {
    return children;
  }

  // If the profile is already fully set up, send them to their dashboard
  if (profileComplete) {
    return <Navigate to={roleHome(role)} replace />;
  }

  /*
    If profile is incomplete, store the current location (once)
    to ensure they can return here if interrupted.
   */
  storeLoginRedirectOnce(fullPath(location));

  return children;
}

