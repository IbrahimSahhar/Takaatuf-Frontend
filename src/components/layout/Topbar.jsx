// filepath: src/components/layout/Topbar.jsx
import { Container, Navbar, Button, Badge } from "react-bootstrap";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ROUTES } from "../../constants";
import { HiBriefcase } from "react-icons/hi"; 

const REDIRECT_KEY = "redirect_after_login";
const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

export default function Topbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === ROUTES.LOGIN;

  const handleLoginClick = () => {
    if (!isLoginPage) {
      localStorage.setItem(REDIRECT_KEY, fullPath(location));
    }
    navigate(ROUTES.LOGIN);
  };

  const handleLogoutClick = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const HIDDEN_ROUTES = [ROUTES.COMPLETE_PROFILE, ROUTES.CHECK_EMAIL];
  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  return (
    <Navbar bg="white" className="border-bottom py-2 sticky-top shadow-sm">
      <Container fluid className="px-4">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div 
            className="d-flex align-items-center justify-content-center bg-primary rounded-3 text-white" 
            style={{ width: "35px", height: "35px", backgroundColor: "#1a237e" }}
          >
            <HiBriefcase size={20} />
          </div>
          <span className="fw-bold text-dark fs-5" style={{ letterSpacing: "1px" }}>
            TAKAATUF
          </span>
        </Link>

        {/* Actions Section */}
        <div className="d-flex align-items-center gap-3">
          {isAuthenticated && (
            <div className="d-flex align-items-center gap-2">
              <Badge bg="light" className="text-dark border fw-medium px-3 py-2 rounded-pill">
              </Badge>
              <span className="text-muted small d-none d-md-inline fw-medium">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              {/* User Avatar Placeholder as seen in images */}
              <div className="rounded-circle bg-light border" style={{ width: 35, height: 35 }}></div>
            </div>
          )}

          {isAuthenticated ? (
            <Button
              variant="outline-danger"
              size="sm"
              className="px-3 fw-medium rounded-pill"
              onClick={handleLogoutClick}
            >
              Logout
            </Button>
          ) : isLoginPage ? null : (
            <Button
              variant="primary"
              className="px-4 fw-medium rounded-pill shadow-sm"
              onClick={handleLoginClick}
            >
              Login
            </Button>
          )}
        </div>
      </Container>
    </Navbar>
  );
}