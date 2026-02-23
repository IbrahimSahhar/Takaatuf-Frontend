// filepath: src/features/dashboards/config/sidebarLinks.js
import { ROUTES } from "../../../constants";
import { 
  FaHome, 
  FaUser, 
  FaLifeRing, 
  FaClipboardList, 
  FaInbox, 
  FaHistory, 
  FaUserCheck, 
  FaMoneyBillWave, 
  FaMoneyCheckAlt 
} from "react-icons/fa";

/*
  Configuration object that maps user roles to their specific sidebar links.
 */
export const sidebarLinksByRole = {
  // Links for users who request services (Requesters)
  requester: [
    { to: ROUTES.DASH_KR, label: "Dashboard", icon: FaHome },
    { to: ROUTES.PROFILE, label: "My Account", icon: FaUser },
    { to: ROUTES.SUPPORT, label: "Support", icon: FaLifeRing },
  ],

  // Links for Knowledge Partners (Service Providers)
  kp: [
    { to: ROUTES.DASH_KP, label: "Dashboard", icon: FaHome },
    { to: ROUTES.PROFILE, label: "Profile", icon: FaUser },
  ],

  // Links for System Administrators
  admin: [
    {
      to: ROUTES.PENDING_REQUESTS,
      label: "Pending Requests",
      icon: FaClipboardList,
    },
    {
      to: ROUTES.PENDING_RESPONSES,
      label: "Pending Responses",
      icon: FaInbox,
    },
    {
      to: ROUTES.APPLICATIONS,
      label: "Applications",
      icon: FaUserCheck,
    },
    {
      to: ROUTES.BUDGET_MANAGEMENT,
      label: "Budget Management",
      icon: FaMoneyBillWave,
    },
    {
      to: ROUTES.PENDING_PAYOUTS,
      label: "Pending Payouts",
      icon: FaMoneyCheckAlt,
    },
    {
      to: ROUTES.AUDIT_LOGS,
      label: "Audit & Logs",
      icon: FaHistory,
    },
  ],
};

/*
  Utility function to safely retrieve links for a specific role.
  Prevents errors if the role is undefined or not found.
 */
export const getSidebarLinks = (role) => {
  return sidebarLinksByRole[role?.toLowerCase()] || [];
};


