// filepath: src/routes/lazyPages.jsx
import { lazy } from "react";

// eslint-disable-next-line react-refresh/only-export-components
const L = (importer) => lazy(importer);

export const P = {


  // Auth
  LoginPage: L(() => import("../features/auth/pages/LoginPage")),
  CompleteProfilePage: L(() =>
    import("../features/profile/pages/CompleteProfilePage")
  ),

  // Dashboards
  RequesterDashboardPage: L(() =>
    import("../features/dashboards/requester/RequesterDashboardPage")
  ),
  KPDashboardPage: L(() => import("../features/dashboards/kp/KPDashboardPage")),

    PendingRequestsPage: L(() =>
    import("../features/dashboards/admin/PendingRequestsPage")
  ),
    PendingPayoutsPage: L(() =>
    import("../features/dashboards/admin/PendingPayoutsPage")
  ),
     BudgetManagementPage: L(() =>
    import("../features/dashboards/admin/BudgetManagementPage")
  ),
     AuditLogsPage: L(() =>
    import("../features/dashboards/admin/AuditLogsPage")
  ),
     PendingResponsesPage: L(() =>
    import("../features/dashboards/admin/PendingResponsesPage")
  ),
     ApplicationsPage: L(() =>
    import("../features/dashboards/admin/ApplicationsPage")
  ),

  // Shared
  KnowledgeRequesterProfilePage:L(() => import("../features/profile/pages/KnowledgeRequesterProfilePage")),
  KnowledgeProviderProfilePage:L(() => import("../features/profile/pages/KnowledgeProviderProfilePage")),
  NotificationsPage: L(() =>
    import("../features/notifications/pages/NotificationsPage")
  ),
CreateRequestPage: L(() => import("../features/krs/pages/CreateRequestPage")),

SupportPage: L(() => import("../features/Support/Pages/SupportPage")),
PaymentPage: L(() => import("../features/payments/pages/PaymentPage")),
  // System
  ForbiddenPage: L(() => import("../pages/common/ForbiddenPage")),
  NotFoundPage: L(() => import("../pages/common/NotFoundPage")),
};

