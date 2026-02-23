// filepath: src/features/auth/utils/authStorage.js
import { ROLES } from "../../../constants";
import { STORAGE_KEYS } from "../../../constants/storageKeys";

/*
  Key used to persist mock users in localStorage for development/demo purposes.
 */
const USERS_KEY = STORAGE_KEYS.MOCK_USERS;

/**
 * Loads the collection of mock users from storage.
 * @returns {Object} A map of user records (keyed by email/id), or an empty object on failure.
 */
export function loadUsers() {
  try {
    const rawData = localStorage.getItem(USERS_KEY);
    return rawData ? JSON.parse(rawData) : {};
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    console.warn("Failed to parse mock users, returning empty state.");
    return {};
  }
}

/**
 * Persists the updated mock users collection to localStorage.
 * @param {Object} users - The user map to save.
 */
export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    // Fail silently to prevent crashing if storage is full or restricted (Incognito)
    console.error("Critical: Could not save mock users to localStorage.", err);
  }
}



/*
  Wipes all mock users from the local environment.
  Useful for resetting the dev environment.
 */
export function clearUsers() {
  try {
    localStorage.removeItem(USERS_KEY);
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    /* ignore removal errors */
  }
}
