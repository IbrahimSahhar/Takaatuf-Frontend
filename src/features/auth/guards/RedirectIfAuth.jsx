// filepath: src/features/auth/guards/RedirectIfAuth.jsx
import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { roleHome, consumeNextRedirect } from "../utils/authRedirect";
import { ROUTES } from "../../../constants"; // استيراد الروابط للتحقق من الحالة

/*
  Utility to check if a string is a valid internal application path.
 */
const isInternalPath = (v) => typeof v === "string" && v.startsWith("/");

export default function RedirectIfAuth({ children, fallbackTo }) {
  const { isAuthenticated, role, loading, user } = useAuth(); // أضفنا user
  const location = useLocation();
  const [target, setTarget] = useState(null);

  /**
   * Determine the ultimate fallback path based on account status and role.
   */
  const fallback = useMemo(() => {
    if (!isAuthenticated || !user) return fallbackTo || "/";

    // 1. فحص تأكيد الإيميل
    const isVerified = user?.email_verified === true || user?.isVerified === true || !!user?.email_verified_at;
    if (!isVerified) return ROUTES.CHECK_EMAIL;

    // 2. فحص اكتمال الملف
    const isProfileComplete = user?.profile_complete === true || user?.profile_completed === true;
    if (!isProfileComplete) return ROUTES.COMPLETE_PROFILE;

    // 3. المسار النهائي حسب الدور
    return fallbackTo && isInternalPath(fallbackTo) ? fallbackTo : roleHome(role);
  }, [isAuthenticated, role, user, fallbackTo]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTarget(null);
      return;
    }

    // Attempt to resolve the next destination
    const nextRaw = location.state?.from || consumeNextRedirect();

    // نتحقق من المسار المطلوب: إذا كان المسار المطلوب يتطلب "حساباً كاملاً" 
    // والمستخدم حسابه "غير كامل"، نستخدم الـ fallback الذكي الذي حسبناه فوق
    if (isInternalPath(nextRaw)) {
      setTarget(nextRaw);
    } else {
      setTarget(fallback);
    }
  }, [isAuthenticated, loading, fallback, location.state]);

  if (loading) return null;

  if (isAuthenticated) {
    // توجيه المستخدم بعيداً عن صفحات الضيوف (Login/Register)
    // نستخدم الـ target إذا كان متاحاً، وإلا الـ fallback الذكي
    return <Navigate to={target || fallback} replace />;
  }

  return children;
}

// // filepath: src/features/auth/guards/RedirectIfAuth.jsx
// import { useEffect, useMemo, useState } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context";
// import { roleHome, consumeNextRedirect } from "../utils/authRedirect";

// /*
//   Utility to check if a string is a valid internal application path.
//  */
// const isInternalPath = (v) => typeof v === "string" && v.startsWith("/");

// /*
//   RedirectIfAuth Guard
//    Purpose: Prevents authenticated users from accessing auth-only pages (Login, Register).
//   Priority for Redirection:
//   1. Location state "from" (where the user was originally headed).
//   2. Persisted redirect URL (from localStorage via consumeNextRedirect).
//   3. Role-based home page (fallback).
//  */
// export default function RedirectIfAuth({ children, fallbackTo }) {
//   const { isAuthenticated, role, loading } = useAuth();
//   const location = useLocation();
//   const [target, setTarget] = useState(null);

//   /**
//    * Determine the ultimate fallback path based on role or explicit prop.
//    */
//   const fallback = useMemo(
//     () => (fallbackTo && isInternalPath(fallbackTo) ? fallbackTo : roleHome(role)),
//     [fallbackTo, role]
//   );

//   useEffect(() => {
//     if (loading) return;

//     if (!isAuthenticated) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       setTarget(null);
//       return;
//     }

//     // Attempt to resolve the next destination
//     const nextRaw = location.state?.from || consumeNextRedirect();

//     if (isInternalPath(nextRaw)) {
//       setTarget(nextRaw);
//     } else {
//       setTarget(fallback);
//     }
//   }, [isAuthenticated, loading, fallback, location.state]);

//   // Prevent flicker during auth state hydration
//   if (loading) return null;

//   // If already logged in, move them away from the login/register page
//   if (isAuthenticated) {
//     return <Navigate to={target || fallback} replace />;
//   }

//   // If guest, allow them to view the auth pages (children)
//   return children;
// }

