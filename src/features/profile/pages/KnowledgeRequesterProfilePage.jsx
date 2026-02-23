import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useAuth } from "../../auth/context/AuthContext";
import { ROLES } from "../../../constants/roles";

// ✅ mock persistence key (DEV until backend)
const PROFILE_LOCAL_KEY = "takatuf_profile_settings";

// --- validators ---
const isBlank = (v) => !String(v ?? "").trim();
const isValidName = (name) => {
  const n = String(name ?? "").trim();
  if (n.length < 2) return { ok: false, msg: "Full Name must be at least 2 characters." };
  if (n.length > 100) return { ok: false, msg: "Full Name must not exceed 100 characters." };
  return { ok: true, msg: "" };
};

const isValidEmail = (email) => {
  const e = String(email ?? "").trim();
  // simple + good enough
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(e)) return { ok: false, msg: "Please enter a valid email address." };
  return { ok: true, msg: "" };
};

// ✅ mock "uniqueness" check (until backend)
function isEmailTakenMock(email, currentUserEmail) {
  try {
    const raw = localStorage.getItem("takaatuf_users"); // you already used this key elsewhere
    const users = raw ? JSON.parse(raw) : {};
    const normalized = String(email).trim().toLowerCase();
    const current = String(currentUserEmail ?? "").trim().toLowerCase();

    // iterate stored users map
    for (const k of Object.keys(users)) {
      const u = users[k];
      const uEmail = String(u?.email ?? "").trim().toLowerCase();
      if (!uEmail) continue;
      if (uEmail === normalized && uEmail !== current) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export default function KnowledgeRequesterProfilePage() {
  const { user, setUser } = useAuth();

  const initialLoadedRef = useRef(false);

  // base values from auth
  const baseFullName = user?.name ?? "";
  const baseEmail = user?.email ?? "";

  const [fullName, setFullName] = useState(baseFullName);
  const [contactEmail, setContactEmail] = useState(baseEmail);

  const [errors, setErrors] = useState({ fullName: "", email: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  // load persisted values (DEV only / until backend)
  useEffect(() => {
    if (initialLoadedRef.current) return;
    initialLoadedRef.current = true;

    try {
      const raw = localStorage.getItem(PROFILE_LOCAL_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.fullName != null) setFullName(String(saved.fullName));
      if (saved?.contactEmail != null) setContactEmail(String(saved.contactEmail));
    } catch {
      // ignore
    }
  }, []);

  // compute dirty (no-change behavior)
  const initialSnapshot = useMemo(() => {
    // snapshot should represent "saved" data:
    // take persisted if exists, else AuthContext values
    try {
      const raw = localStorage.getItem(PROFILE_LOCAL_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return {
          fullName: String(saved?.fullName ?? baseFullName),
          contactEmail: String(saved?.contactEmail ?? baseEmail),
        };
      }
    } catch {
      // ignore
    }
    return { fullName: String(baseFullName), contactEmail: String(baseEmail) };
  }, [baseFullName, baseEmail]);

  const hasChanges = useMemo(() => {
    const a = String(fullName ?? "");
    const b = String(contactEmail ?? "");
    return a !== String(initialSnapshot.fullName ?? "") || b !== String(initialSnapshot.contactEmail ?? "");
  }, [fullName, contactEmail, initialSnapshot]);

  const roleLabel = "Knowledge Requester"; // read-only for KR

  const validateAll = () => {
    const next = { fullName: "", email: "" };

    if (isBlank(fullName)) next.fullName = "Full Name is required.";
    else {
      const v = isValidName(fullName);
      if (!v.ok) next.fullName = v.msg;
    }

    if (isBlank(contactEmail)) next.email = "Contact Email is required.";
    else {
      const v = isValidEmail(contactEmail);
      if (!v.ok) next.email = v.msg;
    }

    setErrors(next);
    return !next.fullName && !next.email;
  };

  const persistLocal = (payload) => {
    try {
      localStorage.setItem(PROFILE_LOCAL_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });

    // no-change behavior
    if (!hasChanges) {
      setStatus({ type: "info", msg: "No changes to save." });
      return;
    }

    if (!validateAll()) return;

    // uniqueness (mock) — later replace with backend 409
    if (isEmailTakenMock(contactEmail, user?.email)) {
      setStatus({ type: "danger", msg: "This email is already in use." });
      setErrors((p) => ({ ...p, email: "Email is already associated with another account." }));
      return;
    }

    setSaving(true);

    try {
      // ✅ until backend: "simulate" saving; later replace with api.updateProfile(...)
      await new Promise((r) => setTimeout(r, 500));

      const updated = {
        ...(user || {}),
        role: user?.role || ROLES.KR, // ensure KR
        name: String(fullName).trim(),
        email: String(contactEmail).trim(),
      };

      setUser(updated);
      persistLocal({ fullName: updated.name, contactEmail: updated.email });

      setStatus({ type: "success", msg: "Profile updated successfully." });
    } catch {
      // error handling: keep input, keep old saved
      setStatus({ type: "danger", msg: "Could not update your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-4 py-md-5" style={{ maxWidth: 1100 }}>
      <h2 className="fw-bold mb-3">Profile Settings</h2>

      {status.msg ? <Alert variant={status.type}>{status.msg}</Alert> : null}

      <Card className="shadow-sm border border-2 rounded-4" style={{ borderColor: "#e6e9ef" }}>
        <Card.Body className="p-4 p-md-5">
          <div className="mb-4">
            <h4 className="fw-bold mb-1">Personal Information</h4>
            <div className="text-muted">Manage your basic account details.</div>
          </div>

          <Form onSubmit={onSave} noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Full Name</Form.Label>
                  <Form.Control
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    isInvalid={!!errors.fullName}
                    placeholder="Your full name"
                    disabled={saving}
                    aria-invalid={!!errors.fullName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Role</Form.Label>
                  <Form.Control value={roleLabel} readOnly disabled aria-readonly="true" />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Contact Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    isInvalid={!!errors.email}
                    placeholder="name@domain.com"
                    disabled={saving}
                    aria-invalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button type="submit" disabled={saving} className="px-4">
                {saving ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
