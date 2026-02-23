// filepath: src/constants/storageKeys.js

/*
  Storage Keys
  Centralized keys for LocalStorage/SessionStorage to prevent magic strings.
 */
export const STORAGE_KEYS = Object.freeze({
  /* Authentication data: { token, user, expiresAt } */
  AUTH: "takaatuf_auth",

  /* Post-auth navigation persistence */
  REDIRECT_AFTER_LOGIN: "redirect_after_login",
  REDIRECT_AFTER_PROFILE: "redirect_after_profile",

  /* Development / Mock environment keys */
  MOCK_USERS: "takaatuf_users",
});