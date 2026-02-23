// filepath: src/features/auth/components/OAuthButtons.jsx
/* eslint-disable no-unused-vars */
import { Button, Spinner, Alert } from "react-bootstrap";
import { OAUTH_PROVIDERS } from "../../../constants/";

/**
 * Normalizes labels to "Sign in with [Provider]"
 */
const toSignInLabel = (label = "") => {
  if (label.toLowerCase().startsWith("continue with")) {
    return label.replace(/continue with/i, "Sign in with");
  }
  return label;
};

export default function OAuthButtons({
  onProvider,
  loadingProvider,
  disabled,
  errorMessage, 
}) {
  return (
    <div className="d-grid gap-3">
      {errorMessage && (
        <Alert variant="danger" className="py-2 small border-0 shadow-sm mb-2 text-center">
          {errorMessage}
        </Alert>
      )}

      {OAUTH_PROVIDERS.map(({ id, label, icon: Icon }) => {
        const isLoading = loadingProvider === id;
        const uiLabel = toSignInLabel(label);

        return (
          <Button
            key={id}
            variant="outline-dark" 
            className="oauth-btn d-flex align-items-center justify-content-center gap-3 py-2 fw-medium bg-white"
            onClick={() => {
              if (disabled || isLoading) return;
              onProvider(id);
            }}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            style={{ borderRadius: "8px", transition: "all 0.2s" }} 
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                <span className="oauth-btn__text small">Authenticating...</span>
              </>
            ) : (
              <>
                <Icon size={20} className="text-secondary" /> 
                <span className="oauth-btn__text">{uiLabel}</span>
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}


