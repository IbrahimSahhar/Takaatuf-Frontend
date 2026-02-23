// filepath: src/components/layout/Sidebar.jsx
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { sidebarLinksByRole } from "../../features/dashboards/config/sidebarLinks";

/*
  Sidebar Component
  Dynamically renders navigation links based on the user's role.
 */
export default function Sidebar() {
  const { role } = useAuth();

  // Resolve links based on role with a fallback for KR/Requester
  const normalizedRole = String(role || "").toLowerCase();
  const navLinks = 
    sidebarLinksByRole[role] || 
    sidebarLinksByRole[normalizedRole] ||
    (normalizedRole === "kr" ? sidebarLinksByRole["requester"] : []) || 
    [];

  return (
    <aside className="sidebar border rounded bg-white p-3 h-100  shadow-sm">
      <div className="text-uppercase small fw-bold text-muted mb-3 px-2">
        Main Menu
      </div>

      {navLinks.length === 0 ? (
        <div className="text-muted small px-2">No accessible links.</div>
      ) : (
        <Nav className="flex-column gap-1 text-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `d-flex align-items-center text-decoration-none rounded px-3 py-2 transition-all ${
                  isActive 
                    ? "bg-primary text-white shadow-sm fw-medium" 
                    : "text-dark hover-light-bg"
                }`
              }
            >
              {link.icon && <link.icon className="me-2 flex-shrink-0" size={18} />}
              <span >{link.label}</span>
            </NavLink>
          ))}
        </Nav>
      )}
    </aside>
  );
}