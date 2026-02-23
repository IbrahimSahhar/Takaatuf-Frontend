// filepath: src/features/auth/hooks/useLoginLogic.js
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context";
import { ROLES, ROUTES } from "../../../constants";
import { consumeNextRedirect, roleHome } from "../utils/authRedirect";
import { isValidEmail, isValidPassword } from "../utils/validators";
import useProviderLogin from "./useProviderLogin";
import useEmailLogin from "./useEmailLogin";

const EMPTY_STATUS = { type: "", msg: "" };

/*
  Main Logic Hook for Login Feature.
  Coordinates form state, validation, provider logins, and redirection flows.
 */
export default function useLoginLogic() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- Form State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- UI & Feedback State ---
  const [loadingProvider, setLoadingProvider] = useState(null); // stores provider name (e.g., 'google')
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [status, setStatus] = useState(EMPTY_STATUS);
  const [submitted, setSubmitted] = useState(false);

  // Derived loading state
  const isBusy = useMemo(
    () => Boolean(loadingProvider) || loadingEmail,
    [loadingProvider, loadingEmail]
  );

  // --- Validation Helpers ---
  const isEmailValid = useMemo(() => isValidEmail(email), [email]);
  const isPasswordValid = useMemo(() => isValidPassword(password), [password]);

  const showMessage = useCallback((type, msg) => {
    setStatus({ type, msg });
  }, []);

  /*
    Final Step: Redirection.
    Checks for a deep-link path first, otherwise falls back to role home.
   */
  const goNext = useCallback(
    (fallbackRole = ROLES.KR) => {
      const next = consumeNextRedirect();
      if (next) {
        navigate(next, { replace: true });
        return;
      }
      navigate(roleHome(fallbackRole), { replace: true });
    },
    [navigate]
  );

  /*
    Core Authentication Handler.
    Invoked after successful API response (Email or Provider).
    Passes the user through security "gates" (Profile completion, Location, etc.)
   */
  const authenticate = useCallback(
    async ({ token, user }) => {
      if (!token || !user) {
        showMessage("danger", "Login failed. Missing session data.");
        return;
      }

      // 1. Persist session in global context
      login({ token, user });

      // 2. Gate: Profile Completion Check
      if (!user?.profile_complete) {
        navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
        return;
      }

      // 3. Gate: Location Confirmation Check
      if (user?.requiresLocationConfirmation) {
        navigate(ROUTES.CONFIRM_LOCATION, { replace: true });
        return;
      }

      // 4. All checks passed -> Proceed to destination
      goNext(user?.role || ROLES.KR);
    },
    [login, goNext, showMessage, navigate]
  );

  const resetUI = useCallback(() => {
    setSubmitted(false);
    setStatus(EMPTY_STATUS);
  }, []);

  // --- Login Methods ---
  const handleProvider = useProviderLogin({
    isBusy,
    resetUI,
    showMessage,
    setLoadingProvider,
  });

  const handleEmailLogin = useEmailLogin({
    isBusy,
    email,
    password,
    authenticate,
    showMessage,
    setSubmitted,
    setStatus,
    setLoadingEmail,
  });

  return {
    email,
    password,
    loadingProvider,
    loadingEmail,
    status,
    submitted,
    isEmailValid,
    isPasswordValid,
    isBusy,
    setEmail,
    setPassword,
    showMessage,
    handleProvider,
    handleEmailLogin,
  };
}

