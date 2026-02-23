// filepath: src/app/routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { ROUTES } from "../constants/routes";

// Components
import RouteLoader from "../components/common/RouteLoader";

// Route groups
import { authRoutes } from "../routes/auth.routes";
import { dashboardRoutes } from "../routes/dashboard.routes";
import { systemRoutes } from "../routes/system.routes";
import ScrollToTop from "../components/common/ScrollToTop";
/*
  Main Application Routing
  Defines the routing structure and handles lazy-loaded components.
 */
export default function AppRoutes() {
  return (
      <Suspense fallback={<RouteLoader />}>
        <ScrollToTop />
        <Routes>
          {/* Redirect root to login by default */}
          <Route
            path={ROUTES.HOME}
            element={<Navigate to={ROUTES.LOGIN} replace />}
          />

          {/* Authentication Routes (Login, Register, etc.) */}
          {authRoutes()}

          {/* Protected Dashboard Routes (Admin, KR, KP) */}
          {dashboardRoutes()}

          {/* System & Error Routes (404, Offline, etc.) */}
          {systemRoutes()}
        </Routes>
      </Suspense>
  );
}
