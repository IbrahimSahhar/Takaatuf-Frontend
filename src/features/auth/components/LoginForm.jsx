// filepath: src/features/auth/components/LoginForm.jsx
import { Form, Button, Spinner } from "react-bootstrap";
import { MdOutlineEmail, MdOutlineLock } from "react-icons/md";

export default function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  submitted,
  isEmailValid,
  isPasswordValid,
  loading,
  disabled,
  onSubmit,
  onForgot,
}) {
  const isBusy = disabled || loading;

  return (
    <Form
      onSubmit={(e) => {
        if (isBusy) {
          e.preventDefault();
          return;
        }
        onSubmit?.(e);
      }}
    >
      {/* Email Field */}
      <Form.Group className="mb-3">
        <Form.Label className="login-label fw-semibold">Email</Form.Label>
        <div className="login-field-wrapper">
          <span className="login-field__icon-fixed" aria-hidden="true">
            <MdOutlineEmail size={20} />
          </span>
          <Form.Control
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={submitted && !isEmailValid}
            disabled={isBusy}
            autoComplete="email"
            className="login-input-with-icon"
          />
          <Form.Control.Feedback type="invalid" className="ps-1">
            Please enter a valid email address.
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      {/* Password Field */}
      <Form.Group className="mb-2">
        <Form.Label className="login-label fw-semibold">Password</Form.Label>
        <div className="login-field-wrapper">
          <span className="login-field__icon-fixed" aria-hidden="true">
            <MdOutlineLock size={20} />
          </span>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={submitted && !isPasswordValid}
            disabled={isBusy}
            autoComplete="current-password"
            className="login-input-with-icon"
          />
          <Form.Control.Feedback type="invalid" className="ps-1">
            Password must be at least 6 characters.
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      {/* Forgot password */}
      <div className="text-center mb-4">
        <Button
          type="button"
          variant="link"
          className="login-forgot p-0 text-decoration-none small fw-medium"
          onClick={onForgot}
          disabled={isBusy}
        >
          Forgot password?
        </Button>
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="primary"
        className="login-submit w-100 fw-bold py-2 shadow-sm"
        disabled={isBusy}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" /> Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </Form>
  );
}

