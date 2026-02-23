// filepath: src/features/profile/components/LocationConfirmationModal.jsx
import { useMemo, useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";

/**
 * Props:
 * - show: boolean
 * - reason: "MISMATCH" | "UNKNOWN"
 * - onConfirm: (choice: "IN_GAZA" | "OUTSIDE_GAZA") => Promise<void> | void
 * - onClose: () => void
 * - allowClose: boolean (default false)
 */
export default function LocationConfirmationModal({
  show,
  reason = "UNKNOWN",
  onConfirm,
  onClose,
  allowClose = false,
}) {
  const [choice, setChoice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // تحسين النصوص لتكون أكثر وضوحاً بناءً على حالة التحقق
  const copy = useMemo(() => {
    if (reason === "MISMATCH") {
      return {
        title: "Location Verification",
        message:
          "The city you entered does not match your current network location. Please confirm your physical location to assign the correct role.",
      };
    }
    return {
      title: "Confirm Your Location",
      message:
        "We couldn't automatically determine your location. Please select your current location to continue profile setup.",
    };
  }, [reason]);

  const handleConfirm = async () => {
    setError("");
    if (!choice) return;

    try {
      setSubmitting(true);
      // استدعاء الدالة الممررة من CompleteProfilePage
      await onConfirm(choice); 
    } catch (e) {
      // إظهار رسالة الخطأ القادمة من API إذا فشل الطلب
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(choice) && !submitting;

  return (
    <Modal
      show={show}
      onHide={allowClose ? onClose : undefined}
      backdrop="static" // يمنع إغلاق المودال عند الضغط خارجاً لضمان الاختيار
      keyboard={allowClose}
      centered
    >
      <Modal.Header closeButton={allowClose} className="border-0 pb-0">
        <Modal.Title className="fw-bold">{copy.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        <p className="text-muted mb-4">{copy.message}</p>

        {error && (
          <Alert variant="danger" className="py-2 small">
            {error}
          </Alert>
        )}

        <Form>
          <div 
            className={`p-3 rounded-3 border mb-2 ${choice === "IN_GAZA" ? "border-primary bg-light" : ""}`}
            style={{ cursor: 'pointer' }}
            onClick={() => !submitting && setChoice("IN_GAZA")}
          >
            <Form.Check
              type="radio"
              name="gaza_choice"
              id="in_gaza"
              label={
                <div className="ms-2">
                  <div className="fw-bold">I am currently in Gaza</div>
                  <small className="text-muted">You will be registered as a Knowledge Provider.</small>
                </div>
              }
              value="IN_GAZA"
              checked={choice === "IN_GAZA"}
              onChange={(e) => setChoice(e.target.value)}
              disabled={submitting}
              className="d-flex align-items-center"
            />
          </div>

          <div 
            className={`p-3 rounded-3 border ${choice === "OUTSIDE_GAZA" ? "border-primary bg-light" : ""}`}
            style={{ cursor: 'pointer' }}
            onClick={() => !submitting && setChoice("OUTSIDE_GAZA")}
          >
            <Form.Check
              type="radio"
              name="gaza_choice"
              id="outside_gaza"
              label={
                <div className="ms-2">
                  <div className="fw-bold">I am outside Gaza</div>
                  <small className="text-muted">You will be registered as a Knowledge Requester.</small>
                </div>
              }
              value="OUTSIDE_GAZA"
              checked={choice === "OUTSIDE_GAZA"}
              onChange={(e) => setChoice(e.target.value)}
              disabled={submitting}
              className="d-flex align-items-center"
            />
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        {allowClose && (
          <Button
            variant="light"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}

        <Button 
          variant="primary" 
          onClick={handleConfirm} 
          disabled={!canSubmit}
          className="px-4"
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            "Confirm & Proceed"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}