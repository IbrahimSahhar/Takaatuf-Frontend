// filepath: src/layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import Footer from "../components/layout/Footer";

export default function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Topbar */}
      <Topbar />

      {/* Page Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

