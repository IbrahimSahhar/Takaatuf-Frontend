// filepath: src/features/auth/utils/validators.js

/*
  Standard email validation regex.
  Ensures presence of @ and a domain structure.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks if a string follows a valid email format.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email = "") => emailRegex.test(email.trim());

/**
 * Checks if the password meets the minimum length requirement.
 * Note: Used primarily for login checks; registration may use stricter policies.
 * @param {string} pw 
 * @returns {boolean}
 */
export const isValidPassword = (pw = "") => pw.length >= 6;


