// filepath: src/components/layout/Footer.jsx
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

/*
  Footer Component
  Provides copyright information and legal links.
  Responsive design: stacks on mobile, spreads on desktop.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer mt-auto py-3 bg-white border-top">
      <Container
        fluid
        className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
      >
        {/* Copyright Section */}
        <div className="text-secondary small fw-medium">
          &copy; {currentYear} <span className="text-primary">TAKAATUF</span>. All rights reserved.
        </div>

        {/* Legal Links Section */}
        <nav className="d-flex gap-4">
          <Link 
            to="/terms" 
            className="text-muted small text-decoration-none hover-primary transition-all"
          >
            Terms of Service
          </Link>
          <Link 
            to="/privacy" 
            className="text-muted small text-decoration-none hover-primary transition-all"
          >
            Privacy Policy
          </Link>
        </nav>
      </Container>
    </footer>
  );
}

