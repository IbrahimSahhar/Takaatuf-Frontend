// filepath: src/features/auth/utils/loginValidation.js
import { isValidEmail, isValidPassword } from "./validators";

/**
 * Validates login credentials on the client side.
 * Designed to provide quick feedback before hitting the API.
 * * @param {Object} credentials - The email and password from the form.
 * @returns {string|null} Error message if invalid, or null if validation passes.
 */
export function validateLogin({ email, password }) {
  const e = (email || "").trim();
  const p = password || "";

  // 1. Basic Presence Check
  if (!e || !p) {
    return "Please enter your email and password.";
  }

  // 2. Format Check (Email)
  if (!isValidEmail(e)) {
    return "Please enter a valid email address.";
  }

  // 3. Length Check (Password)
  // Note: We use a shorter length for login (6) compared to registration (8) 
  // to stay compatible with older accounts or specific legacy requirements.
  if (!isValidPassword(p)) {
    return "Password must be at least 6 characters.";
  }

  return null;
}
