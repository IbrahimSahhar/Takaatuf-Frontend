// filepath: src/layouts/PublicLayout.jsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Button } from "react-bootstrap";
import { ROUTES } from "../constants";
import { storeLoginRedirectOnce } from "../features/auth/utils/authRedirect";
import { fullPathFromLocation } from "../utils/navigation";

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const HIDE_LOGIN_BUTTON_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.CHECK_EMAIL,
  ];
  const hideLoginButton = HIDE_LOGIN_BUTTON_ROUTES.includes(location.pathname);
  /* Actions */
  const onLogin = () => {
    storeLoginRedirectOnce(fullPathFromLocation(location));
    navigate(ROUTES.LOGIN);
  };
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Topbar */}
      <Navbar bg="white" className="border-bottom">
        <Container fluid className="py-2">
          <Navbar.Brand className="fw-semibold">TAKAATUF</Navbar.Brand>

          {/* Public action */}
          {!hideLoginButton && (
            <Button variant="primary" size="sm" onClick={onLogin}>
              Login
            </Button>
          )}
        </Container>
      </Navbar>

      {/* Content */}
      <div className="flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
}

