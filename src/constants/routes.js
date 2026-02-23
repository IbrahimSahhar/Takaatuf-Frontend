// filepath: src/constants/routes.js

/*
  Application Routes
  A centralized, frozen object containing all route paths.
 */
export const ROUTES = Object.freeze({
  /* --- Public & Auth Routes --- */
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  COMPLETE_PROFILE: "/complete-profile",
  CONFIRM_LOCATION: "/confirm-location",
  CHECK_EMAIL: "/check-email",
  AUTH_CALLBACK: "/auth/callback",
  UPDATE_EMAIL: "/update-email", 
  /* --- Core App Navigation --- */
  DASH_REDIRECT: "/app",
  PROFILE: "/app/profile",
  NOTIFICATIONS: "/app/notifications",
  SUPPORT: "/app/support",

  /* --- Role-Based Dashboards --- */
  DASH_KR: "/app/dashboard/requester",
  DASH_KP: "/app/dashboard/kp",
  DASH_ADMIN: "/app/dashboard/admin",

  /* --- KR (Requester) Specific --- */
  CREATE_REQUEST: "/app/krs/create",
  PAYMENT: "/app/payment",

  /* --- Admin Console  --- */
  PENDING_REQUESTS: "/app/dashboard/admin/pending-requests",
  PENDING_RESPONSES: "/app/dashboard/admin/pending-responses",
  APPLICATIONS: "/app/dashboard/admin/applications",
  BUDGET_MANAGEMENT: "/app/dashboard/admin/budget-management",
  PENDING_PAYOUTS: "/app/dashboard/admin/pending-payouts",
  AUDIT_LOGS: "/app/dashboard/admin/audit-logs",

  /* --- System Errors --- */
  FORBIDDEN: "/403",
  NOT_FOUND: "*",
});
