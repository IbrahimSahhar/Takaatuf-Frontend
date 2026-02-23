// filepath: src/features/support/pages/SupportPage.jsx

import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";

export default function SupportPage() {
  return (
    <Container
      className="py-5 d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="text-center" style={{ maxWidth: "700px" }}>
        {/* Animated Icon Section */}
        <div className="mb-4">
        <div className="position-relative d-inline-block mb-5">
  {/* Outer Glow Circle */}
  <div 
    className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary opacity-10"
    style={{ width: "220px", height: "220px", filter: "blur(20px)" }}
  />
  
  {/* Main Icon Container */}
  <div
    className="position-relative d-flex align-items-center justify-content-center bg-white shadow-sm rounded-circle border border-light"
    style={{ width: "160px", height: "160px", zIndex: 2 }}
  >
    <div 
      className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle"
      style={{ width: "130px", height: "130px" ,fontSize:25}}
    >
      <i
        className="bi bi-headset text-primary"
        style={{ fontSize: "4.5rem", lineHeight: 1 }}
      />
      Support
    </div>

    {/* Floating Badge */}
    <Badge
      bg="primary"
      className="position-absolute bottom-0 start-50 translate-middle-x mb-n2 px-3 py-2 rounded-pill shadow-sm text-uppercase fw-bold"
      style={{ 
        fontSize: "0.75rem", 
        letterSpacing: "1px",
        transform: "translateX(-50%) translateY(50%)" 
      }}
    >
      Coming Soon
    </Badge>
  </div>
</div>

          <h1 className="display-5 fw-bold text-dark mb-3">
            Support Center is Underway
          </h1>
          <p className="lead text-muted px-lg-5">
            We're building a state-of-the-art support system to help you manage
            your account, track payments, and resolve technical issues
            instantly.
          </p>
        </div>

        {/* Features Preview Cards */}
        <Row className="g-3 mb-5 mt-4">
          {[
            {
              icon: "chat-dots",
              title: "Live Chat",
              desc: "Instant help from our team.",
            },
            {
              icon: "file-earmark-medical",
              title: "Smart Tickets",
              desc: "Track issues with ease.",
            },
            {
              icon: "search",
              title: "Knowledge Base",
              desc: "Answers at your fingertips.",
            },
          ].map((item, idx) => (
            <Col md={4} key={idx}>
              <Card className="border-0 shadow-sm rounded-4 h-100 py-3">
                <Card.Body>
                  <i
                    className={`bi bi-${item.icon} text-primary mb-2 d-block`}
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                  <h6 className="fw-bold mb-1">{item.title}</h6>
                  <p className="small text-muted mb-0">{item.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Visual Notification Box */}
        <Card className="border-0 bg-dark text-white rounded-4 overflow-hidden shadow-lg p-4">
          <Card.Body className="p-2">
            <h5 className="fw-bold mb-2">Need urgent assistance?</h5>
            <p className="opacity-75 mb-4 small">
              While we finalize this page, our team is still available via
              email. We'll notify you as soon as the support dashboard goes
              live!
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="primary"
                className="px-4 py-2 fw-bold rounded-pill"
                onClick={() =>
                  (window.location.href = "mailto:support@example.com")
                }
              >
                Contact via Email
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Footer info */}
        <div className="mt-5 text-muted small">
          Expected Launch: <strong>Q2 2026</strong>
        </div>
      </div>
    </Container>
  );
}
