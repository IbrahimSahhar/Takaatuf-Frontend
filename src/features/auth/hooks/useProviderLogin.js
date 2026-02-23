// filepath: src/features/auth/hooks/useProviderLogin.js
import { useCallback } from "react";
import { api, API_BASE_URL } from "../../../services/api";

/*
  Safely access the window object.
 */
const safeWindow = () => (typeof window !== "undefined" ? window : null);

/*
  Captures the current full path including query strings and hashes.
 */
const getFullPath = () => {
  const w = safeWindow();
  if (!w) return "/";
  return `${w.location.pathname}${w.location.search}${w.location.hash}`;
};

/*
  Custom hook to handle OAuth provider redirects (Google, Facebook, etc.)
 */
export default function useProviderLogin({
  isBusy,
  resetUI,
  showMessage,
  setLoadingProvider,
}) {
  return useCallback(
    async (provider) => {
      if (isBusy) return;

      resetUI();
      setLoadingProvider(provider);

      try {
        const returnUrl = getFullPath();
        let redirectUrl = null;

        // Use the API helper for redirection if available, otherwise fallback to manual string
        if (typeof api?.oauthRedirectUrl === "function") {
          redirectUrl = api.oauthRedirectUrl(provider, returnUrl);
        } else {
          // Manual fallback construction
          redirectUrl = `${API_BASE_URL}/oauth/${provider}/redirect?returnUrl=${encodeURIComponent(
            returnUrl
          )}`;
        }

        const w = safeWindow();
        if (!w) throw new Error("No browser window found");

        // Execute the redirect
        w.location.href = redirectUrl;

      } catch (err) {
        console.error("OAuth Redirect Error:", err);
        showMessage("danger", "Provider authentication failed. Please try again.");
        setLoadingProvider(null);
      }
    },
    [isBusy, resetUI, showMessage, setLoadingProvider]
  );
}

