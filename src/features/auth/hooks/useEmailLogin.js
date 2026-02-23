// filepath: src/features/auth/hooks/useEmailLogin.js
import { useCallback } from "react";
import { validateLogin } from "../utils/loginValidation";
import { api } from "../../../services/api";

const EMPTY_STATUS = { type: "", msg: "" };

/*
  Custom hook to handle the email/password login flow.
  Manages validation, API communication, and state updates.
 */
export default function useEmailLogin({
  isBusy,
  email,
  password,
  authenticate,
  showMessage,
  setSubmitted,
  setStatus,
  setLoadingEmail,
}) {
  
  /*
    Helper to display error messages via the UI callback.
   */
  const handleError = useCallback((message) => {
    showMessage("danger", message);
  }, [showMessage]);

  /*
    Main login execution handler.
   */
  return useCallback(
    async function (e) {
    if (e) e.preventDefault();

    // Prevent duplicate submissions
    if (isBusy) return;

    setSubmitted(true);
    setStatus(EMPTY_STATUS);

    // 1. Client-side validation
    const validationError = validateLogin({ email, password });
    if (validationError) {
      handleError(validationError);
      return;
    }

    setLoadingEmail(true);

    try {
      // 2. API Call
      const res = await api.loginEmail({
        email: email.trim(),
        password,
      });

      // 3. Handle Business Logic Errors
      if (!res?.ok) {
        handleError(res?.error || "Login failed. Please try again.");
        return;
      }

      // 4. Update Global Auth State
      // Expected payload: { token, user }
      await authenticate({
        provider: "email",
        token: res.token,
        user: res.user,
      });

    } catch (err) {
      console.error("Login Error:", err);
      handleError("Email login failed. Please try again.");
    } finally {
      setLoadingEmail(false);
    }
  },
    [
      isBusy, 
      email, 
      password, 
      setSubmitted, 
      setStatus, 
      setLoadingEmail, 
      handleError, 
      authenticate
    ]
  );
}
