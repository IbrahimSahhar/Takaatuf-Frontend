// filepath: src/components/common/PrivacyNotice.jsx
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
  PrivacyNotice Component
  Displays a small privacy disclaimer with a link to the policy.
  @param {string} text - The main notice text.
  @param {string} linkLabel - The clickable text for the link.
  @param {string} to - The route path for the privacy policy.
 */
export default function PrivacyNotice({
  text = "Your data is secure and used only to improve our services.",
  linkLabel = "Privacy Policy",
  to = "/privacy",
}) {
  return (
    <Form.Text className="text-muted d-block mt-2 small">
      <i className="bi bi-shield-lock me-1"></i> {/* Standard Bootstrap Icon */}
      {text}{" "}
      <Link 
        to={to} 
        className="text-primary text-decoration-none fw-medium hover-underline"
      >
        {linkLabel}
      </Link>
    </Form.Text>
  );
}
