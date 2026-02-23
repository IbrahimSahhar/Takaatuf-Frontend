// filepath: src/features/auth/registration/components/RegisterCard.jsx
import { Alert, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import useRegisterLogic from "../hooks/useRegisterLogic";
import { ROUTES } from "../../../../constants/routes";

/*
  RegisterCard Component
   Handles the visual wrapper for the registration form.
   Manages the display of status alerts (success, error, warning).
   Provides navigation links to login and legal documents.
 */
export default function RegisterCard() {
  const { values, errors, status, isBusy, setField, submit } = useRegisterLogic();

  return (
    <Card 
      className="shadow-sm border-0 mx-auto" 
      style={{ maxWidth: "500px", width: "100%" }}
    >
      <Card.Body className="p-4 p-md-5">
        {/* Header Section */}
        <div className="mb-4 text-center">
          <h3 className="fw-bold mb-1">Create Your Account</h3>
          <p className="text-muted small">Enter your details to register</p>
        </div>

        {/* Dynamic Status Notifications */}
        {status.msg && (
          <Alert variant={status.type} className="py-2 small">
            {status.msg}
            {status.type === "warning" && (
              <Link to={ROUTES.LOGIN} className="ms-1 fw-bold">
                Login here
              </Link>
            )}
          </Alert>
        )}

        {/* Abstraction of the Form Logic */}
        <RegisterForm
          values={values}
          errors={errors}
          isBusy={isBusy}
          onChange={setField}
          onSubmit={submit}
        />

        {/* Legal Disclaimer */}
        <div className="text-center mt-4 small text-muted">
          By registering, you agree to our{" "}
          <a href="/terms" target="_blank" rel="noreferrer" className="text-decoration-none">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank" rel="noreferrer" className="text-decoration-none">
            Privacy Policy
          </a>.
        </div>

        {/* Footer Navigation */}
        <div className="text-center mt-3 pt-3 border-top">
          <span className="text-muted small">Already have an account?</span>{" "}
          <Link to={ROUTES.LOGIN} className="small fw-bold text-decoration-none">
            Login
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
