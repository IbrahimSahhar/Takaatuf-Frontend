// filepath: src/components/common/EmptyState.jsx
import { Button } from "react-bootstrap";

/*
  EmptyState Component
  Displays a placeholder when no data is available.
  Includes an optional icon, title, description, and action button.
 */
export default function EmptyState({
  title = "No results found",
  description = "There is no data to display at the moment.",
  actionLabel,
  onAction,
  icon,
}) {
  return (
    <div className="empty-state text-center py-5 px-3">
      {/* Icon Section */}
      {icon && (
        <div className="empty-state__icon mb-3 fs-1 text-secondary opacity-50">
          {icon}
        </div>
      )}

      {/* Content Section */}
      <h5 className="fw-semibold text-dark">{title}</h5>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: "350px" }}>
        {description}
      </p>

      {/* Action Button Section */}
      {actionLabel && onAction && (
        <Button 
          variant="outline-primary" 
          onClick={onAction}
          className="px-4 rounded-pill"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
