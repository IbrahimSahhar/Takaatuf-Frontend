// filepath: src/features/auth/registration/utils/registration.validation.js

export const NAME_MIN = 2;
export const NAME_MAX = 100;

/**
 * Strong password requirements
 */
export const passwordPolicy = {
  minLen: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
};

/**
 * Checks if a string is empty or contains only whitespace.
 */
export function isBlank(str) {
  return !String(str ?? "").trim();
}

/**
 * Validates the full name based on length and presence.
 */
export function validateFullName(fullName) {
  const v = String(fullName ?? "");
  if (isBlank(v)) return "Full Name is required.";
  
  const t = v.trim();
  if (t.length < NAME_MIN) return `Full Name must be at least ${NAME_MIN} characters.`;
  if (t.length > NAME_MAX) return `Full Name must be no more than ${NAME_MAX} characters.`;
  
  return "";
}

/**
 * Validates email format using a standard regex.
 */
export function validateEmail(email) {
  const v = String(email ?? "");
  if (isBlank(v)) return "Email is required.";
  
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(v.trim())) return "Please enter a valid email address.";
  
  return "";
}

/**
 * Validates password against the policy and returns a combined error message.
 */
export function validatePassword(password) {
  const v = String(password ?? "");
  if (!v) return "Password is required.";

  const missing = [];
  if (v.length < passwordPolicy.minLen) missing.push(`${passwordPolicy.minLen} characters`);
  if (!passwordPolicy.upper.test(v)) missing.push("one uppercase letter");
  if (!passwordPolicy.lower.test(v)) missing.push("one lowercase letter");
  if (!passwordPolicy.number.test(v)) missing.push("one number");
  if (!passwordPolicy.special.test(v)) missing.push("one special character");

  if (missing.length) {
    return `Password must include ${missing.join(", ")}.`;
  }
  return "";
}

/**
 * Ensures the confirmation field matches the original password.
 */
export function validatePasswordConfirmation(password, confirmation) {
  const c = String(confirmation ?? "");
  if (!c) return "Please confirm your password.";
  if (c !== String(password ?? "")) return "Passwords do not match.";
  
  return "";
}

/**
 * Runs all validations and returns an object containing only existing errors.
 */
export function validateAll(values) {
  const errors = {
    fullName: validateFullName(values.fullName),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword: validatePasswordConfirmation(
      values.password,
      values.confirmPassword
    ),
  };

  // Remove keys with empty string values to keep the errors object clean
  Object.keys(errors).forEach((k) => {
    if (!errors[k]) delete errors[k];
  });

  return errors;
}
