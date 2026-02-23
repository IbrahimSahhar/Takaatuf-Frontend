// filepath: src/routes/auth.routes.jsx
import { Route } from "react-router-dom";
import { ROUTES } from "../constants";
import OAuthCallbackPage from "../features/auth/pages/OAuthCallbackPage";
/* Layout */
import AuthLayout from "../layouts/AuthLayout";

/* Guards */
import RequireAuth from "../features/auth/guards/RequireAuth";
import RedirectIfAuth from "../features/auth/guards/RedirectIfAuth";

/* Pages */
import { P } from "./lazyPages";
import CheckEmailPage from "../features/auth/registration/pages/CheckEmailPage";
import RegisterPage from "../features/auth/registration/pages/RegisterPage";
import ConfirmLocationPage from "../features/profile/pages/ConfirmLocationPage";
import UpdateEmailPage from "../features/auth/pages/UpdateEmailPage";

export const authRoutes = () => (
  <Route element={<AuthLayout />}>
    {/* 1. صفحات الضيوف (Login & Register) */}
    {/* نستخدم RedirectIfAuth فقط؛ فهو كفيل بطرد المسجلين والسماح للضيوف */}
    <Route
      path={ROUTES.LOGIN}
      element={
        <RedirectIfAuth>
          <P.LoginPage />
        </RedirectIfAuth>
      }
    />

    <Route
      path={ROUTES.REGISTER}
      element={
        <RedirectIfAuth>
          <RegisterPage />
        </RedirectIfAuth>
      }
    />

    {/* 2. صفحة تأكيد الإيميل */}
    <Route
      path={ROUTES.CHECK_EMAIL}
      element={
        <RequireAuth>
            <CheckEmailPage />
        </RequireAuth>
      }
    />

    {/* 3. صفحة إكمال البروفايل */}
    {/* RequireAuth سيتأكد أن الإيميل مؤكد أولاً، ثم يدخلك هنا */}
    <Route
      path={ROUTES.COMPLETE_PROFILE}
      element={
        <RequireAuth>
          <P.CompleteProfilePage />
        </RequireAuth>
      }
    />

    {/* 4. صفحة تحديث الإيميل (لحالة فيسبوك) */}
    <Route
      path={ROUTES.UPDATE_EMAIL}
      element={
        <RequireAuth>
          <UpdateEmailPage />
        </RequireAuth>
      }
    />
    {/* 5. روابط أخرى */}
    <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />

    {/* 6. تأكيد الموقع (للمسجلين والمنتهين من البروفايل) */}
    <Route
      path={ROUTES.CONFIRM_LOCATION}
      element={
        <RequireAuth>
          <ConfirmLocationPage />
        </RequireAuth>
      }
    />
  </Route>
);

// // filepath: src/routes/auth.routes.jsx
// import { Route } from "react-router-dom";
// import { ROUTES } from "../constants";
// import RequireCheckEmailAccess from "../features/auth/guards/RequireCheckEmailAccess";
// import OAuthCallbackPage from "../features/auth/pages/OAuthCallbackPage";
// /* Layout */
// import AuthLayout from "../layouts/AuthLayout";

// /* Guards */
// import RequireAuth from "../features/auth/guards/RequireAuth";
// import RequireProfileIncomplete from "../features/auth/guards/RequireProfileIncomplete";
// import RequireProfileComplete from "../features/auth/guards/RequireProfileComplete";
// import RedirectIfAuth from "../features/auth/guards/RedirectIfAuth";
// import RequireGuest from "../features/auth/guards/RequireGuest";

// /* Pages */
// import { P } from "./lazyPages";
// import CheckEmailPage from "../features/auth/registration/pages/CheckEmailPage";
// import RegisterPage from "../features/auth/registration/pages/RegisterPage";
// import ConfirmLocationPage from "../features/profile/pages/ConfirmLocationPage";
// import UpdateEmailPage from "../features/auth/pages/UpdateEmailPage";

// export const authRoutes = () => (
//   <Route element={<AuthLayout />}>
//     {/* Login (guests only) */}
//     <Route
//       path={ROUTES.LOGIN}
//       element={
//         <RedirectIfAuth>
//           <P.LoginPage />
//         </RedirectIfAuth>
//       }
//     />

//     {/* Register (guests only) */}
//     <Route
//       path={ROUTES.REGISTER}
//       element={
//         <RequireGuest>
//           <RegisterPage />
//         </RequireGuest>
//       }
//     />

//     {/* Check Email (must be accessible for logged-in but unverified users) */}
//     <Route
//       path={ROUTES.CHECK_EMAIL}
//       element={
//         <RequireCheckEmailAccess>
//             <CheckEmailPage />
//         </RequireCheckEmailAccess>
//       }
//     />

//     {/* Complete Profile (authed + profile incomplete) */}
//     <Route
//       path={ROUTES.COMPLETE_PROFILE}
//       element={
//         <RequireAuth>
//           <RequireProfileIncomplete>
//             <P.CompleteProfilePage />
//           </RequireProfileIncomplete>
//         </RequireAuth>
//       }
//     />
//     <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />
//     <Route
//       path={ROUTES.UPDATE_EMAIL}
//       element={
//         <RequireAuth>
//           {/* نضمن أن المستخدم مسجل دخول بالتوكن القادم من فيسبوك */}
//           <RequireProfileIncomplete>
//             {/* نضمن أن البروفايل لم يكتمل بعد */}
//             <UpdateEmailPage />
//           </RequireProfileIncomplete>
//         </RequireAuth>
//       }
//     />

//     {/* Confirm Location (authed + profile complete) */}
//     <Route
//       path={ROUTES.CONFIRM_LOCATION}
//       element={
//         <RequireAuth>
//           <RequireProfileComplete>
//             <ConfirmLocationPage />
//           </RequireProfileComplete>
//         </RequireAuth>
//       }
//     />
//   </Route>
// );
