// filepath: src/components/common/RouteLoader.jsx
import { Container, Spinner } from "react-bootstrap";

/*
  RouteLoader Component
  Full-screen loading state used during route transitions (Suspense fallback).
 */
export default function RouteLoader() {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center align-items-center bg-light"
      style={{ 
        minHeight: "100vh",
        transition: "opacity 0.3s ease-in-out" 
      }}
    >
      <div className="text-center">
        <Spinner
          animation="grow" 
          role="status"
          variant="primary"
          className="mb-3"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading page...</span>
        </Spinner>

        <h6 className="text-secondary fw-medium animate-pulse">
          Loading, please wait...
        </h6>
      </div>
    </Container>
  );
}
