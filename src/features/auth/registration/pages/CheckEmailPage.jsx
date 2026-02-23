// filepath: src/features/auth/registration/pages/CheckEmailPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useMemo, useState } from "react";
import { api } from "../../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../../../constants/routes";

export default function CheckEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // استدعاء completeStepLocally التي أضفناها للـ Context
  const { user, completeStepLocally } = useAuth();

  const email = useMemo(() => {
    const fromState = location?.state?.email;
    if (fromState) return String(fromState);
    if (user?.email) return String(user.email);
    return "";
  }, [location?.state?.email, user?.email]);

  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    if (!email || loading) return;
    setLoading(true);
    setStatus({ type: "", msg: "" });

    try {
      // نستخدم api.resendVerificationEmail التي تأكدنا من وجودها في الموك
      const res = await api.resendVerificationEmail({ email });
      if (!res?.ok) {
        setStatus({
          type: "danger",
          msg: res?.error || "Could not resend email. Please try again.",
        });
        return;
      }
      setStatus({
        type: "success",
        msg: "Verification email resent. Please check your inbox.",
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus({
        type: "danger",
        msg: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const canBypass = import.meta.env.DEV || String(import.meta.env.VITE_USE_MOCK_API) === "true";

  const bypassForDev = () => {
    const nowIso = new Date().toISOString();

    // التحديث الذري باستخدام الدالة الجديدة لضمان مزامنة الـ Storage والـ Context
    completeStepLocally({
      email_verified: true,
      email_verified_at: nowIso,
    });

    // التوجيه المباشر لصفحة إكمال البروفايل بدلاً من Login
    // هذا يكسر حلقة الـ Loop لأن المستخدم أصبح Verified الآن
    navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
  };

  return (
    <Container className="py-5 d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm border-0" style={{ maxWidth: 500, width: "100%" }}>
        <Card.Body className="p-4 p-md-5 text-center">
          <div className="mb-4">
            <h3 className="fw-bold">Check your email</h3>
          </div>

          <p className="text-muted mb-4">
            We sent a verification link to: <br />
            <strong className="text-dark">{email || "your email address"}</strong>
            <br />
            Please click the link in the email to verify your account.
          </p>

          {status.msg && (
            <Alert variant={status.type} className="py-2 small mb-4">
              {status.msg}
            </Alert>
          )}

          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={resend} 
              disabled={!email || loading}
              className="py-2 fw-bold"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Resending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>

            {canBypass && (
              <Button 
                type="button" 
                variant="outline-warning" 
                onClick={bypassForDev}
                className="mt-2"
              >
                Skip verification (DEV/MOCK MODE)
              </Button>
            )}
          </div>

          <div className="mt-4 pt-3 border-top">
            <p className="text-muted small mb-0">
              Need help? <a href="/support" className="text-decoration-none">Contact Support</a>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}


// // filepath: src/features/auth/registration/pages/CheckEmailPage.jsx
// import { useLocation, useNavigate } from "react-router-dom";
// import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
// import { useMemo, useState } from "react";
// import { api } from "../../../../services/api";
// import { useAuth } from "../../context/AuthContext";
// import { ROUTES } from "../../../../constants/routes";

// /**
//  * CheckEmailPage
//  * * Displayed after registration to prompt the user to verify their email.
//  * * Handles resending the verification link.
//  * * Includes a DEV-only bypass to skip verification during local development.
//  */
// export default function CheckEmailPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, setUser } = useAuth();

//   // Determine the target email: priority goes to navigation state, then current auth context
//   const email = useMemo(() => {
//     const fromState = location?.state?.email;
//     if (fromState) return String(fromState);
//     if (user?.email) return String(user.email);
//     return "";
//   }, [location?.state?.email, user?.email]);

//   const [status, setStatus] = useState({ type: "", msg: "" });
//   const [loading, setLoading] = useState(false);

//   /**
//    * Triggers the backend to resend the verification email.
//    */
//   const resend = async () => {
//     if (!email || loading) return;

//     setLoading(true);
//     setStatus({ type: "", msg: "" });

//     try {
//       const res = await api.resendVerificationEmail({ email });

//       if (!res?.ok) {
//         setStatus({
//           type: "danger",
//           msg: res?.error || "Could not resend email. Please try again.",
//         });
//         return;
//       }

//       setStatus({
//         type: "success",
//         msg: "Verification email resent. Please check your inbox.",
//       });
//     } catch (err) {
//       console.error("Resend Error:", err);
//       setStatus({
//         type: "danger",
//         msg: "An unexpected error occurred. Please try again later.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * DEV-ONLY: Simulates a successful email verification.
//    * Useful for testing the "Complete Profile" flow without actual email access.
//    */
//   const canBypass = import.meta.env.DEV;

//   const bypassForDev = () => {
//     const nowIso = new Date().toISOString();

//     // Persist temporary bypass status to session storage
//     sessionStorage.setItem("dev_email_verified", "1");
//     sessionStorage.setItem("dev_email_verified_at", nowIso);

//     // Update the global auth user state to reflect verified status
//     setUser((prev) => {
//       if (!prev) return null;
//       return {
//         ...prev,
//         email_verified: true,
//         email_verified_at: prev.email_verified_at || nowIso,
//       };
//     });

//     // Send user back to Login (where the Guard will now let them pass to Profile Completion)
//     navigate(ROUTES.LOGIN, { replace: true });
//   };

//   return (
//     <Container className="py-5 d-flex justify-content-center align-items-center min-vh-100">
//       <Card className="shadow-sm border-0" style={{ maxWidth: 500, width: "100%" }}>
//         <Card.Body className="p-4 p-md-5 text-center">
//           <div className="mb-4">
//              {/* يمكنك هنا إضافة أيقونة ظرف بريدي (Mail Icon) لتحسين الشكل */}
//             <h3 className="fw-bold">Check your email</h3>
//           </div>

//           <p className="text-muted mb-4">
//             We sent a verification link to: <br />
//             <strong className="text-dark">{email || "your email address"}</strong>
//             <br />
//             Please click the link in the email to verify your account.
//           </p>

//           {status.msg && (
//             <Alert variant={status.type} className="py-2 small mb-4">
//               {status.msg}
//             </Alert>
//           )}

//           <div className="d-grid gap-2">
//             <Button 
//               variant="primary" 
//               onClick={resend} 
//               disabled={!email || loading}
//               className="py-2 fw-bold"
//             >
//               {loading ? (
//                 <>
//                   <Spinner size="sm" animation="border" className="me-2" />
//                   Resending...
//                 </>
//               ) : (
//                 "Resend verification email"
//               )}
//             </Button>

//             {canBypass && (
//               <Button 
//                 type="button" 
//                 variant="outline-warning" 
//                 onClick={bypassForDev}
//                 className="mt-2"
//               >
//                 Skip verification (DEV MODE)
//               </Button>
//             )}
//           </div>

//           <div className="mt-4 pt-3 border-top">
//             <p className="text-muted small mb-0">
//               Need help? <a href="/support" className="text-decoration-none">Contact Support</a>
//             </p>
//           </div>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// }
