// filepath: src/features/auth/pages/OAuthCallbackPage.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context";
import { ROUTES } from "../../../constants";
import { consumeNextRedirect, roleHome } from "../utils/authRedirect";
import { api } from "../../../services/api";
import { canonicalizeRole } from "../context/auth.roles";

const safeInternalPath = (value, fallback = "/") => {
  if (!value) return fallback;
  return typeof value === "string" && value.startsWith("/") ? value : fallback;
};

export default function OAuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let isCancelled = false;

    const finalizeAuth = async () => {
      const pathSegments = location.pathname.split("/");
      const provider = pathSegments[pathSegments.length - 1] || "google";

      try {
        const res = await api.verifyOAuth(provider, location.search);

        if (!res.ok || !res.token) {
          throw new Error(res.error || "No token received");
        }

        const data = res.data || res;
        const userFromApi = data.user;

        // 1. توحيد حالة تأكيد الإيميل
        const isEmailVerified = 
          provider === "google" || 
          userFromApi?.email_verified === true || 
          userFromApi?.isVerified === true ||
          !!userFromApi?.email_verified_at;

        // 2. توحيد بيانات المستخدم لتناسب الـ Context والموك
        const normalizedUser = {
          ...userFromApi,
          role: canonicalizeRole(userFromApi?.role),
          email_verified: isEmailVerified,
          // هنا نتأكد من قراءة profile_complete بشكل موحد (الموك يرجعها مباشرة في الـ user)
          profile_complete: userFromApi?.profile_complete ?? data.profile_completed ?? false
        };

        if (isCancelled) return;

        // 3. تفعيل الدخول (هنا الـ Context سيحفظ البيانات في الـ Storage أيضاً)
        login({ token: data.token, user: normalizedUser });

        // 4. منطق التوجيه (الدومينو)
        
        // أ- فحص وجود الإيميل (لحالة فيسبوك)
        const emailValue = userFromApi?.email || data?.email;
        if (!emailValue || String(emailValue).toLowerCase() === "null") {
          navigate(ROUTES.UPDATE_EMAIL, { 
            state: { user: normalizedUser, message: data.message },
            replace: true 
          });
          return;
        }

        // ب- فحص التأكيد
        if (!isEmailVerified) {
          navigate(ROUTES.CHECK_EMAIL, { replace: true, state: { email: emailValue } });
          return;
        }

        // ج- فحص اكتمال الملف الشخصي
        if (!normalizedUser.profile_complete) {
          navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
          return;
        }

        // د- المسار المثالي (الوصول للداشبورد)
        const next = consumeNextRedirect();
        const safeReturnUrl = safeInternalPath(data.return_url || data.returnUrl, "/");
        const finalTarget = next || safeReturnUrl || roleHome(normalizedUser.role);

        navigate(finalTarget, { replace: true });

      } catch (error) {
        console.error("OAuth Callback Error:", error);
        // نكتفي بالتوجيه لـ Login وهو سيعرض رسالة خطأ لو أردت
        navigate(ROUTES.LOGIN, { replace: true, state: { error: "Authentication failed" } });
      }
    };

    finalizeAuth();

    return () => { isCancelled = true; };
  }, [location.search, location.pathname, navigate, login]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fw-medium">Securing your session, please wait...</p>
      </div>
    </div>
  );
}

// /* eslint-disable no-unused-vars */
// // filepath: src/features/auth/pages/OAuthCallbackPage.jsx
// import { useEffect } from "react";
// import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
// import { useAuth } from "../context";
// import { ROUTES } from "../../../constants";
// import { consumeNextRedirect, roleHome } from "../utils/authRedirect";
// import { api } from "../../../services/api";
// import { canonicalizeRole } from "../context/auth.roles";

// /* --- Helpers --- */
// const safeInternalPath = (value, fallback = "/") => {
//   if (!value) return fallback;
//   return typeof value === "string" && value.startsWith("/") ? value : fallback;
// };

// export default function OAuthCallbackPage() {
//   const [params] = useSearchParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   useEffect(() => {
//     let isCancelled = false;

//     const finalizeAuth = async () => {
//       // 1. تحديد المزود ديناميكياً من الرابط (google أو facebook)
//       const pathSegments = location.pathname.split("/");
//       const provider = pathSegments[pathSegments.length - 1] || "google";

//       try {
//         // 2. إرسال الكود للباك إند
//         const res = await api.verifyOAuth(provider, location.search);

//         if (!res.ok || !res.token) {
//           throw new Error(res.error || "No token received");
//         }

//         const data = res.data || res;
//         const token = data.token;
//         const userFromApi = data.user;

//         // 3. توحيد بيانات المستخدم (Normalization)
//         const normalizedUser = {
//           ...userFromApi,
//           role: canonicalizeRole(userFromApi?.role),
//           // مستخدم جوجل نعتبر إيميله مؤكداً تلقائياً، فيسبوك يعتمد على رد الباك إند
//           email_verified: provider === "google" ? true : (userFromApi?.email_verified ?? false),
//           avatar: userFromApi?.avatar || null,
//           profile_complete: data.profile_completed ?? userFromApi?.profile_complete ?? false
//         };

//         if (isCancelled) return;

//         // 4. تفعيل الدخول في السياق العالمي
//         login({ token, user: normalizedUser });

//         // 5. فحص البريد الإلكتروني (المنطق المحسن)
//         // نفحص الإيميل داخل كائن user ومن المستوى الأول لضمان التغطية
//         const emailValue = userFromApi?.email || data?.email;
//         const hasEmail = emailValue && 
//                          String(emailValue).trim() !== "" && 
//                          emailValue !== "null" && 
//                          emailValue !== null;

//         // إذا كان الإيميل مفقوداً (حالة فيسبوك غالباً)
//         if (!hasEmail) {
//           navigate(ROUTES.UPDATE_EMAIL, { 
//             state: { id: userFromApi?.provider_id, message: data.message },
//             replace: true 
//           });
//           return;
//         }

//         // 6. فحص حالة التأكيد (إذا كان الإيميل موجوداً ولكن غير مؤكد)
//         if (!normalizedUser.email_verified) {
//           navigate(ROUTES.CHECK_EMAIL, { replace: true });
//           return;
//         }

//         // 7. التوجيه بناءً على اكتمال البروفايل
//         if (normalizedUser.profile_complete === false) {
//           navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
//           return;
//         }

//         // 8. الوصول للداشبورد (المسار المثالي لمستخدم جوجل)
//         const next = consumeNextRedirect();
//         const safeReturnUrl = safeInternalPath(data.return_url || data.returnUrl, "/");
//         const finalTarget = next || safeReturnUrl || roleHome(normalizedUser.role);

//         navigate(finalTarget, { replace: true });

//       } catch (error) {
//         console.error("OAuth Callback Error:", error);
//         alert("Authentication failed. Please try again.");
//         navigate(ROUTES.LOGIN, { replace: true });
//       }
//     };

//     finalizeAuth();

//     return () => {
//       isCancelled = true;
//     };
//   }, [location.search, location.pathname, navigate, login]);

//   return (
//     <div className="d-flex align-items-center justify-content-center h-screen bg-light">
//       <div className="text-center">
//         <div className="spinner-border text-primary mb-3" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="text-muted fw-medium">Securing your session, please wait...</p>
//       </div>
//     </div>
//   );
// }