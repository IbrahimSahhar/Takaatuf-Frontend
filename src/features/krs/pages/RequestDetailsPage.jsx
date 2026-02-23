/* eslint-disable react-hooks/exhaustive-deps */
// filepath: src/features/dashboards/requester/RequestDetailsPage.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  ProgressBar,
  Spinner,
  Alert,
} from "react-bootstrap";
import { ROUTES } from "../../../constants";

/**
 * Utility to format budget according to platform rules.
 */
const formatBudget = (amount, currency = "USD") => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State Management
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [request, setRequest] = useState(location.state?.requestData || null);

  /**
   * Logic to determine status based on progress (Acceptance Criteria Requirement)
   */
  const getStatusInfo = (progress) => {
    if (progress >= 100) {
      return { label: "Completed", variant: "success" };
    }
    return { label: "In Progress", variant: "primary" };
  };

  /**
   * Data Loading Logic: Prioritizes Router State for instant feel.
   * Fetches from API as a fallback if page is refreshed.
   */
  const loadData = useCallback(async () => {
    if (request) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Simulate API fetch delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      /** * In a real system:
       * const response = await api.getRequestById(id);
       * setRequest(response.data);
       */
      
      setErrorMsg("Request data not found. Please navigate from the dashboard.");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setErrorMsg("A system error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, request]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // UI: Loading State
  if (loading && !request) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  // UI: Error State (Error Handling Requirement)
  if (errorMsg && !request) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm p-4">
          <h5 className="fw-bold">Oops! Something went wrong.</h5>
          <p className="mb-0">{errorMsg}</p>
          <hr />
          <Button variant="outline-danger" size="sm" onClick={() => loadData()}>Retry Loading</Button>
        </Alert>
        <Button variant="link" className="text-decoration-none" onClick={() => navigate(-1)}>← Back to Dashboard</Button>
      </Container>
    );
  }

  const statusInfo = getStatusInfo(request.progress);

  return (
    <Container className="py-5" style={{ maxWidth: "1200px" }}>
      
      {/* Header Section */}
      <header className="mb-4">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
          <div>
            <Button 
              variant="link" 
              className="p-0 text-decoration-none text-muted mb-2 small shadow-none" 
              onClick={() => navigate(-1)}
            >
              ← Return to Dashboard
            </Button>
            <h2 className="fw-bold text-dark m-0">Request Details</h2>
          </div>
          
          {/* New Request Entry Point (Requirement) */}
          <Button 
            variant="primary" 
            className="rounded-3 px-4 fw-bold shadow-sm"
            onClick={() => navigate(ROUTES.CREATE_REQUEST)}
          >
            + Create New Request
          </Button>
        </div>
      </header>

      <Row className="g-4">
        {/* Left Column: Core Request Info */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <Card.Body className="p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <Badge bg="light" text="primary" className="border border-primary-subtle px-3 py-2 rounded-pill mb-3 fw-bold">
                    {request.category}
                  </Badge>
                  <h3 className="fw-bold text-dark mb-2" style={{ lineHeight: "1.3" }}>{request.title}</h3>
                  <div className="text-muted small">
                    <strong>Reference ID:</strong> {request.id} <span className="mx-2">|</span> 
                    <strong>Created:</strong> {request.created_at}
                  </div>
                </div>
                {/* Visual Classification (Requirement) */}
                <Badge bg={statusInfo.variant} className="px-3 py-2 rounded-pill">
                  {statusInfo.label}
                </Badge>
              </div>

              <hr className="my-4 opacity-25" />

              <section>
                <h5 className="fw-bold text-dark mb-3">Request Description</h5>
                <p className="text-secondary" style={{ fontSize: "1.1rem", lineHeight: "1.8", whiteSpace: "pre-line" }}>
                  {request.description}
                </p>
              </section>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Financials & Tracking (Requirement) */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <h6 className="text-muted fw-bold text-uppercase mb-4" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>
                Request Summary
              </h6>

              {/* Budget Display (Requirement) */}
              <div className="mb-4 pb-3 border-bottom border-light">
                <label className="text-muted small d-block mb-1">Total Budget Allocation</label>
                <div className="fw-bold text-dark h3 mb-0">
                  {formatBudget(request.budget, request.currency)}
                </div>
              </div>

              {/* Progress Indicator (Requirement: 0-100%) */}
              <div className="p-4 rounded-4" style={{ backgroundColor: "#f8faff", border: "1px solid #eef2f7" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark small">Current Progress</span>
                  <span className={`fw-bold text-${statusInfo.variant}`}>{request.progress}%</span>
                </div>
                <ProgressBar 
                  now={request.progress} 
                  variant={statusInfo.variant}
                  style={{ height: "12px", borderRadius: "20px" }}
                  className="shadow-sm bg-white"
                />
                <p className="text-muted mt-3 mb-0 small" style={{ lineHeight: "1.4" }}>
                  {request.progress === 100 
                    ? "This project is fully delivered and closed." 
                    : "The provider is currently working on this request."}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Contextual Empty State Message Box (Requirement) */}
          <Card className="border-0 shadow-sm rounded-4 bg-light border">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-2">Platform Assurance</h6>
              <p className="small text-muted mb-0">
                Your budget is protected. Funds are only released when the progress reaches 100% and you approve the final delivery.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}