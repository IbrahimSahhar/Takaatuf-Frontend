import { useMemo, useState } from "react";
import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ROLES } from "../../../constants/roles";
import { api } from "../../../services/api";
import {
  consumeLocationRedirect,
  consumeNextRedirect,
  roleHome,
} from "../../auth/utils/authRedirect";
import { canonicalizeRole } from "../../auth/context/auth.roles";

const roleFromChoice = (choice) => (choice === "IN_GAZA" ? ROLES.KP : ROLES.KR);

export default function ConfirmLocationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();

  const { user, setUser } = useAuth();

  const reasonParam = (sp.get("reason") || "unknown").toLowerCase();

  const message = useMemo(() => {
    if (reasonParam === "mismatch") {
      return "We detected you may be in/near Gaza based on your network. Please confirm your location.";
    }
    return "We couldn’t determine your location. Please confirm your location.";
  }, [reasonParam]);

  const [choice, setChoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canConfirm = !!choice && !loading;

  const handleConfirm = async () => {
    if (!choice) return;

    setError("");
    setLoading(true);

    try {
      const ensuredRole = roleFromChoice(choice);

      const res = await api.confirmLocation(choice, { reason: reasonParam });
      if (!res?.ok) {
        setError(res?.error || "Failed to confirm location.");
        return;
      }

      const updatedUser = {
        ...(user || {}),
        ...(res?.user || {}),
        role: canonicalizeRole(res?.user?.role || ensuredRole),
        requiresLocationConfirmation: false,
      };

      setUser(updatedUser);

      // Prefer location redirect; never loop back to confirm-location
      const selfPath = location.pathname;
      const locTarget = consumeLocationRedirect();
      if (locTarget && !String(locTarget).startsWith(selfPath)) {
        navigate(locTarget, { replace: true });
        return;
      }

      const next = consumeNextRedirect();
      if (next && !String(next).startsWith(selfPath)) {
        navigate(next, { replace: true });
        return;
      }

      navigate(roleHome(updatedUser.role), { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Card className="shadow-sm border-0" style={{ maxWidth: 560, width: "100%" }}>
        <Card.Body className="p-4 p-md-5">
          <h4 className="fw-bold mb-2">Confirm your location</h4>
          <div className="text-muted mb-4">{message}</div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Form>
            <div className="mb-3">
              <Form.Check
                type="radio"
                id="in-gaza"
                name="location"
                label="I am in Gaza"
                value="IN_GAZA"
                checked={choice === "IN_GAZA"}
                onChange={(e) => setChoice(e.target.value)}
                disabled={loading}
              />
              <Form.Check
                type="radio"
                id="outside-gaza"
                name="location"
                label="I am outside Gaza"
                value="OUTSIDE_GAZA"
                checked={choice === "OUTSIDE_GAZA"}
                onChange={(e) => setChoice(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="small text-muted mb-3">
              We estimate location approximately using network information. See our{" "}
              <a href="/privacy" target="_blank" rel="noreferrer">
                privacy policy
              </a>
              .
            </div>

            <div className="d-grid">
              <Button onClick={handleConfirm} disabled={!canConfirm} className="py-2 fw-semibold">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

