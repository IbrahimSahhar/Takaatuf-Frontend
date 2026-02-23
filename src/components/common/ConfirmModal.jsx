// filepath: src/components/common/ConfirmModal.jsx
import { Modal, Button, Spinner } from "react-bootstrap";
import PropTypes from 'prop-types';

/*
  ConfirmModal Component
  A reusable modal for destructive actions or important confirmations.
 */
export default function ConfirmModal({
  show,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={!loading}
      className="confirm-modal"
    >
      <Modal.Header closeButton={!loading} className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-3 text-secondary">
        {message}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="light" 
          onClick={onClose} 
          disabled={loading}
          className="text-muted"
        >
          {cancelText}
        </Button>

        <Button 
          variant={variant} 
          onClick={onConfirm} 
          disabled={loading}
          className="px-4"
        >
          {loading ? (
            <>
              <Spinner 
                as="span"
                animation="border"
                size="sm" 
                role="status" 
                aria-hidden="true" 
                className="me-2" 
              />
              Processing...
            </>
          ) : (
            confirmText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

