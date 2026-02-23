import { Route, Navigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { ROLES } from "../constants/roles";

import DashboardLayout from "../layouts/DashboardLayout";

// Guard Components
import RequireAuth from "../features/auth/guards/RequireAuth";
import RequireEmailVerified from "../features/auth/guards/RequireEmailVerified";
import RequireRole from "../features/auth/guards/RequireRole";
import RequireProfileComplete from "../features/auth/guards/RequireProfileComplete";
import RequireLocationConfirmed from "../features/auth/guards/RequireLocationConfirmed";

import { P } from "./lazyPages";
import { useAuth } from "../features/auth/context/AuthContext";
import { roleHome } from "../features/auth/utils/authRedirect";
import KnowledgeTaskPage from "../features/krs/pages/KnowledgeTaskPage";
import KnowledgeTaskPreviewPage from "../features/krs/pages/KnowledgeTaskPreviewPage";
import KnowledgeTaskCompletedPage from "../features/krs/pages/KnowledgeTaskCompletedPage";
import RequestDetailsPage from "../features/krs/pages/RequestDetailsPage";

/**
 * Redirects the user to their specific home page based on their role
 */
// eslint-disable-next-line react-refresh/only-export-components
function AppIndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user?.role)} replace />;
}

/**
 * Renders the correct profile page based on user role
 */
// eslint-disable-next-line react-refresh/only-export-components
function ProfileByRole() {
  const { user } = useAuth();

  if (user?.role === ROLES.KR) return <P.KnowledgeRequesterProfilePage />;
  if (user?.role === ROLES.KP) return <P.KnowledgeProviderProfilePage />;

  return <Navigate to={ROUTES.FORBIDDEN} replace />;
}

export const dashboardRoutes = () => {
  // 1. Core Dashboards (Strictly role-based)
  const roleDashboards = [
    {
      path: ROUTES.DASH_KR,
      allow: [ROLES.KR],
      element: <P.RequesterDashboardPage />,
    },
    { path: ROUTES.DASH_KP, allow: [ROLES.KP], element: <P.KPDashboardPage /> },
    {
      path: ROUTES.DASH_ADMIN,
      allow: [ROLES.ADMIN],
      element: <P.PendingRequestsPage />,
    },
  ];

  // 2. Admin Only Routes (Restricted access to Admin role)
  const adminOnlyRoutes = [
    { path: ROUTES.PENDING_REQUESTS, element: <P.PendingRequestsPage /> },
    { path: ROUTES.PENDING_PAYOUTS, element: <P.PendingPayoutsPage /> },
    { path: ROUTES.BUDGET_MANAGEMENT, element: <P.BudgetManagementPage /> },
    { path: ROUTES.AUDIT_LOGS, element: <P.AuditLogsPage /> },
  ];

  // 3. Knowledge Requester (KR) Only Routes
  const requesterOnlyRoutes = [
    {
      path: ROUTES.CREATE_REQUEST,
      element: <P.CreateRequestPage />,
    },
    { path: ROUTES.PAYMENT, element: <P.PaymentPage /> },
  ];

  // 4. Shared or Task-Specific Routes (KR & KP access)
  const sharedRoutes = [
    {
      path: ROUTES.PROFILE,
      element: (
        <RequireRole allow={[ROLES.KR, ROLES.KP]}>
          <ProfileByRole />
        </RequireRole>
      ),
    },
    { path: ROUTES.KRS, element: <P.KRListPage /> },
    { path: ROUTES.NOTIFICATIONS, element: <P.NotificationsPage /> },
    { path: ROUTES.SUPPORT, element: <P.SupportPage /> },
    { path: ROUTES.APPLICATIONS, element: <P.ApplicationsPage /> },
    { path: ROUTES.PENDING_RESPONSES, element: <P.PendingResponsesPage /> },
    // Task details page - Restricted to those who perform or request the task
    {
      path: "/task/:id",
      element: (
        <RequireRole allow={[ROLES.KP]}>
          <KnowledgeTaskPage />
        </RequireRole>
      ),
    },
    {
      path: "/task-preview/:id",
      element: (
        <RequireRole allow={[ROLES.KP]}>
          <KnowledgeTaskPreviewPage />
        </RequireRole>
      ),
    },
    {
      path: "/task-completed/:id",
      element: (
        <RequireRole allow={[ROLES.KP]}>
          <KnowledgeTaskCompletedPage />
        </RequireRole>
      ),
    },
  ];

  return (
    <Route
      element={
        <RequireAuth>
          <RequireEmailVerified>
            <RequireProfileComplete>
              <RequireLocationConfirmed>
                <DashboardLayout />
              </RequireLocationConfirmed>
            </RequireProfileComplete>
          </RequireEmailVerified>
        </RequireAuth>
      }
    >
      {/* Default redirect based on auth status */}
      <Route path={ROUTES.DASH_REDIRECT} element={<AppIndexRedirect />} />

      {/* Main Role-Specific Dashboards */}
      {roleDashboards.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={<RequireRole allow={r.allow}>{r.element}</RequireRole>}
        />
      ))}

      {/* KR Restricted Routes */}
      {requesterOnlyRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={<RequireRole allow={[ROLES.KR]}>{r.element}</RequireRole>}
        />
      ))}
      <Route
        path="/requests/:id"
        element={
          <RequireRole allow={[ROLES.KR]}>
            <RequestDetailsPage />
          </RequireRole>
        }
      />
      {/* Admin Restricted Routes */}
      {adminOnlyRoutes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={<RequireRole allow={[ROLES.ADMIN]}>{r.element}</RequireRole>}
        />
      ))}

      {/* General Shared Routes */}
      {sharedRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={r.element} />
      ))}
    </Route>
  );
};
