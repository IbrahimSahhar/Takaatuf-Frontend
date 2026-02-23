// filepath: src/components/common/Loading.jsx
import { Spinner } from "react-bootstrap";

/**
  Loading Component
  A reusable spinner for async operations.
  @param {string} text - Message to display alongside the spinner.
  @param {boolean} fullPage - If true, covers the entire viewport.
  @param {string} size - Spinner size ('sm' or undefined for normal).
 */
export default function Loading({ 
  text = "Loading...", 
  fullPage = false, 
  size 
}) {
  // Style for full-page loading overlay
  const fullPageStyle = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
    flexDirection: 'column' // Stack icon and text vertically
  } : {};

  return (
    <div 
      className={`d-flex justify-content-center align-items-center ${fullPage ? '' : 'py-5'}`}
      style={fullPageStyle}
    >
      <Spinner 
        animation="border" 
        variant="primary" 
        size={size} 
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      
      <span className={`${fullPage ? 'mt-3' : 'ms-2'} text-secondary fw-medium`}>
        {text}
      </span>
    </div>
  );
}