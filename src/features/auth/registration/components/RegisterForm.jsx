import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterForm({ values, errors, isBusy, onChange, onSubmit }) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Full Name</Form.Label>
        <Form.Control
          value={values.fullName}
          onChange={onChange("fullName")}
          isInvalid={!!errors.fullName}
          placeholder="John Doe"
          autoComplete="name"
          disabled={isBusy}
          aria-invalid={!!errors.fullName}
        />
        <Form.Control.Feedback type="invalid">
          {errors.fullName}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Email</Form.Label>
        <Form.Control
          type="email"
          value={values.email}
          onChange={onChange("email")}
          isInvalid={!!errors.email}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isBusy}
          aria-invalid={!!errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Password</Form.Label>
        <InputGroup>
          <Form.Control
            type={showPass ? "text" : "password"}
            value={values.password}
            onChange={onChange("password")}
            isInvalid={!!errors.password}
            autoComplete="new-password"
            disabled={isBusy}
            aria-invalid={!!errors.password}
          />
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => setShowPass((s) => !s)}
            disabled={isBusy}
            aria-label="toggle-password"
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </InputGroup>
        {!!errors.password && (
          <div className="invalid-feedback d-block">{errors.password}</div>
        )}
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Confirm Password</Form.Label>
        <InputGroup>
          <Form.Control
            type={showConfirm ? "text" : "password"}
            value={values.confirmPassword}
            onChange={onChange("confirmPassword")}
            isInvalid={!!errors.confirmPassword}
            autoComplete="new-password"
            disabled={isBusy}
            aria-invalid={!!errors.confirmPassword}
          />
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => setShowConfirm((s) => !s)}
            disabled={isBusy}
            aria-label="toggle-confirm-password"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </InputGroup>
        {!!errors.confirmPassword && (
          <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
        )}
      </Form.Group>

      <div className="d-grid">
        <Button type="submit" disabled={isBusy} className="py-2">
          {isBusy ? (
            <>
              <Spinner size="sm" className="me-2" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </div>
    </Form>
  );
}

