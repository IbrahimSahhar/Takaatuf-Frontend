// filepath: src/features/auth/context/auth.utils.js

/**
 * Safely extracts the first non-null/non-empty value from an object using multiple possible keys.
 * * @param {Object} obj - The source object.
 * @param {...string} keys - List of keys to check in order of priority.
 * @returns {*} The first found value or null.
 */
export const get = (obj, ...keys) => {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") {
      return obj[k];
    }
  }
  return null;
};

/**
 * Checks if a value is not null, undefined, and not an empty or whitespace-only string.
 * * @param {*} v - The value to validate.
 * @returns {boolean} True if the value contains actual data.
 */
export const isNonEmpty = (v) => v != null && String(v).trim().length > 0;