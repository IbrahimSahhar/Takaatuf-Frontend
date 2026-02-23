// filepath: src/features/auth/guards/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";
import { storeLoginRedirectOnce } from "../utils/authRedirect";

/**
 * Builds a string representation of the full URL (Path + Search + Hash).
 */
const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const currentPath = location.pathname;

  // --- 1. حماية غير المسجلين (المستخدم الضيف) ---
  if (!isAuthenticated) {
    // السماح بدخول صفحة التسجيل واللوجن حتى لو كان الحارس مغلفاً لهما (تجنب التعليق)
    if (currentPath === ROUTES.LOGIN || currentPath === "/register") {
      return children;
    }

    // حفظ المسار لإعادة التوجيه لاحقاً في صفحات التطبيق فقط
    if (currentPath.startsWith("/app")) {
      storeLoginRedirectOnce(fullPath(location));
    }
    
    // طرد أي ضيف يحاول دخول أي مسار محمي
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  // --- المسجلين: المستخدم يملك توكن الآن ---

  // --- 2. فحص وجود الإيميل (حالة فيسبوك) ---
  if (!user?.email && currentPath !== ROUTES.UPDATE_EMAIL) {
    return <Navigate to={ROUTES.UPDATE_EMAIL} replace />;
  }
  if (user?.email && currentPath === ROUTES.UPDATE_EMAIL) {
    return <Navigate to="/" replace />;
  }

  // --- 3. فحص تأكيد الإيميل ---
  // توحيد مسميات الفحص لضمان قراءة الحالة من الموك أو الباك إند
  const isVerified = user?.email_verified === true || user?.isVerified === true || !!user?.email_verified_at;

  // لو مش مؤكد: مسموح له فقط بصفحة التأكيد أو تحديث الإيميل
  if (!isVerified) {
    if (currentPath !== ROUTES.CHECK_EMAIL && currentPath !== ROUTES.UPDATE_EMAIL) {
      return <Navigate to={ROUTES.CHECK_EMAIL} replace />;
    }
    return children; // السماح برؤية CHECK_EMAIL أو UPDATE_EMAIL للمسجلين غير المؤكدين
  }

  // لو الإيميل مؤكد: ممنوع يدخل صفحة التأكيد مرة ثانية
  if (isVerified && currentPath === ROUTES.CHECK_EMAIL) {
    return <Navigate to="/" replace />;
  }

  // --- 4. فحص اكتمال الملف الشخصي (Profile Completion) ---
  const isProfileComplete = user?.profile_complete === true || user?.profile_completed === true;

  // لو مش مكمل ملفه وهو مش في صفحة الإكمال.. نوديه يكمل (بعد التأكد من الإيميل)
  if (!isProfileComplete && currentPath !== ROUTES.COMPLETE_PROFILE) {
    return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
  }

  // لو مكمل ملفه وحاول يدخل صفحة الإكمال يدوياً.. نطرده للرئيسية
  if (isProfileComplete && currentPath === ROUTES.COMPLETE_PROFILE) {
    return <Navigate to="/" replace />;
  }

  // --- 5. مسموح له بالمرور للداشبورد أو الصفحة المطلوبة ---
  return children;
}


// // filepath: src/features/auth/guards/RequireAuth.jsx
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context";
// import { ROUTES } from "../../../constants";
// import { storeLoginRedirectOnce } from "../utils/authRedirect";

// /**
//  * Builds a string representation of the full URL (Path + Search + Hash).
//  */
// const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

// export default function RequireAuth({ children }) {
//   const { isAuthenticated, loading, user } = useAuth();
//   const location = useLocation();

//   if (loading) return null;

//   const currentPath = location.pathname;

//   // --- 1. حماية غير المسجلين ---
//   if (!isAuthenticated) {
//     if (currentPath.startsWith("/app") && currentPath !== ROUTES.LOGIN) {
//       storeLoginRedirectOnce(fullPath(location));
//       return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
//     }
//     // إذا كان يحاول دخول أي صفحة محمية وهو غير مسجل
//     if (currentPath !== ROUTES.LOGIN && currentPath !== "/register") {
//        return <Navigate to={ROUTES.LOGIN} replace />;
//     }
//     return children;
//   }

//   // --- المسجلين: الآن نفحص جودة الحساب خطوة بخطوة ---

//   // --- 2. فحص وجود الإيميل (حالة فيسبوك) ---
//   // لو المستخدم عنده إيميل وحاول يدخل صفحة update-email يدوياً.. نطرده!
//   if (user?.email && currentPath === ROUTES.UPDATE_EMAIL) {
//     return <Navigate to="/" replace />;
//   }
//   // لو ما عنده إيميل وهو مش في صفحة التحديث.. نوديه فوراً
//   if (!user?.email && currentPath !== ROUTES.UPDATE_EMAIL) {
//     return <Navigate to={ROUTES.UPDATE_EMAIL} replace />;
//   }

//   // --- 3. فحص تأكيد الإيميل ---
//   const isVerified = user?.email_verified ?? user?.isVerified;
  
//   // لو الإيميل مؤكد وحاول يدخل صفحة check-email.. نطرده
//   if (isVerified && currentPath === ROUTES.CHECK_EMAIL) {
//     return <Navigate to="/" replace />;
//   }
  
//   // لو مش مؤكد وهو في مكان غير مسموح.. نرجعه لصفحة التأكيد
//   // استثناء: نسمح له بصفحة update-email لو حب يغير إيميله اللي لسه ما تأكد
//   if (user?.email && !isVerified && 
//       currentPath !== ROUTES.CHECK_EMAIL && 
//       currentPath !== ROUTES.UPDATE_EMAIL) {
//     return <Navigate to={ROUTES.CHECK_EMAIL} replace />;
//   }

//   // --- 4. فحص اكتمال الملف الشخصي (Profile Completion) ---
//   // هاد الجزء هو اللي بيحل مشكلة اللوب في الموك والحقيقي
//   const isProfileComplete = user?.profile_complete;

//   // لو مش مكمل ملفه وهو مش في صفحة الإكمال.. نوديه يكمل (بشرط يكون مأكد إيميله أول)
//   if (isVerified && !isProfileComplete && currentPath !== ROUTES.COMPLETE_PROFILE) {
//     return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />;
//   }

//   // لو مكمل ملفه وحاول يدخل صفحة الإكمال يدوياً.. نطرده للرئيسية
//   if (isProfileComplete && currentPath === ROUTES.COMPLETE_PROFILE) {
//     return <Navigate to="/" replace />;
//   }

//   // --- 5. مسموح له بالمرور ---
//   return children;
// }

// // filepath: src/features/auth/guards/RequireAuth.jsx
// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context";
// import { ROUTES } from "../../../constants";
// import { storeLoginRedirectOnce } from "../utils/authRedirect";

// /**
//  * Builds a string representation of the full URL (Path + Search + Hash).
//  */
// const fullPath = (loc) => `${loc.pathname}${loc.search}${loc.hash}`;

// /*
//   RequireAuth Guard
//  * Purpose: Protects internal routes by ensuring the user is authenticated.
//   Behavior:
//   1. If loading: Renders nothing to prevent layout shift.
//   2. If guest in protected area: Saves current path and redirects to login.
//   3. If authenticated but missing email: Redirects to Update Email page.
//   4. If authenticated but not verified: Redirects to Check Email page.
//   5. If authorized: Renders children components.
//  */
// export default function RequireAuth({ children }) {
//   const { isAuthenticated, loading, user } = useAuth();
//   const location = useLocation();

//   // Prevent UI flickering while checking auth session
//   if (loading) return null;

//   const currentPath = location.pathname;
//   const isLogin = currentPath === ROUTES.LOGIN;
//   const isAppRoute = currentPath.startsWith("/app");

//   // --- 1. Handling Unauthenticated Users ---
//   if (!isAuthenticated) {
//     if (isAppRoute && !isLogin) {
//       const from = fullPath(location);
      
//       // Persist the destination to redirect back after successful login
//       storeLoginRedirectOnce(from);
      
//       return (
//         <Navigate 
//           to={ROUTES.LOGIN} 
//           replace 
//           state={{ from }} 
//         />
//       );
//     }
//     // General fallback for guests
//     return <Navigate to={ROUTES.LOGIN} replace />;
//   }

//   // --- 2. Handling Missing Email (Facebook Phone Case) ---
//   // We exclude UPDATE_EMAIL path to avoid infinite redirection loops
//   if (!user?.email && currentPath !== ROUTES.UPDATE_EMAIL) {
//     return (
//       <Navigate 
//         to={ROUTES.UPDATE_EMAIL} 
//         replace 
//       />
//     );
//   }

//   // --- 3. Handling Unverified Email ---
//   // We exclude CHECK_EMAIL and UPDATE_EMAIL from this check
//   const isVerified = user?.email_verified ?? user?.isVerified;
//   if (user?.email && !isVerified && 
//       currentPath !== ROUTES.CHECK_EMAIL && 
//       currentPath !== ROUTES.UPDATE_EMAIL) {
//     return (
//       <Navigate 
//         to={ROUTES.CHECK_EMAIL} 
//         replace 
//       />
//     );
//   }

//   // --- 4. Authorized Access ---
//   return children;
// }


