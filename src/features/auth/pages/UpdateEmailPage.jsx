// filepath: src/features/auth/pages/UpdateEmailPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { api } from "../../../services/api";
import { ROUTES } from "../../../constants";
import { useAuth } from "../context";

export default function UpdateEmailPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // نحتاج login لتحديث الجلسة بالكامل بعد استلام الإيميل
  const { login, user: currentUser } = useAuth();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // استدعاء الموك (أو الـ API الحقيقي) لتحديث الإيميل
      const res = await api.completeOAuthEmail({
        email,
        provider_id: currentUser?.provider_id || state?.user?.provider_id,
        provider: currentUser?.provider || "facebook"
      });

      if (res.ok) {
        // تحديث الجلسة فوراً بالبيانات الجديدة
        // الموك سيعيد user يحتوي على الإيميل الجديد و profile_complete: false
        login({ 
          token: res.token || localStorage.getItem("token"), 
          user: res.user 
        });
        
        // التوجيه لصفحة تأكيد الإيميل لأن المستخدم الجديد عبر فيسبوك 
        // يحتاج لتأكيد إيميله يدوياً في نظامنا (أو إكمال البروفايل حسب منطقك)
        // بما أن الـ Guard ذكي، سيوجهه للمكان الصحيح بناءً على email_verified
        navigate(ROUTES.CHECK_EMAIL, { replace: true, state: { email } });
      } else {
        setError(res.error || "Something went wrong while saving your email.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="bg-light" style={{ minHeight: "100vh" }}>
      <Row className="justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
            <div style={{ height: "6px", backgroundColor: "var(--bs-primary)" }} />
            
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <span className="badge rounded-pill bg-primary-soft text-primary px-3 py-2">
                    Final Step
                  </span>
                </div>
                <h3 className="fw-bold text-dark">Almost There!</h3>
                <p className="text-muted small px-lg-3">
                  {state?.message || "We just need your email address to secure your account and keep you updated."}
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="border-0 small d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="emailInput">
                  <Form.Label className="small fw-bold text-secondary">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="py-2 px-3 border-light-subtle rounded-3 shadow-none"
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 fw-bold rounded-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      Submit Email
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
            
            <Card.Footer className="bg-white border-0 text-center pb-4">
              <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                Secure authentication by <strong>TAKAATUF</strong>
              </p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// // filepath: src/features/auth/pages/UpdateEmailPage.jsx
// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Card, Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
// import { api } from "../../../services/api";
// import { ROUTES } from "../../../constants";
// import { useAuth } from "../context";

// /**
//  * UpdateEmailPage component handles users who registered via social providers 
//  * (like Facebook) but didn't provide an email address.
//  */
// export default function UpdateEmailPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { login, user: currentUser } = useAuth();
  
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Send the new email along with provider info to the backend
//       const res = await api.completeOAuthEmail({
//         email,
//         provider_id: currentUser?.provider_id || state?.id,
//         provider: "facebook"
//       });

//       if (res.ok) {
//         // Update session with full user data received from server
//         login({ 
//           token: res.token || localStorage.getItem("token"), 
//           user: res.user 
//         });
        
//         // Navigate to profile completion gate
//         navigate(ROUTES.COMPLETE_PROFILE, { replace: true });
//       } else {
//         setError(res.error || "Something went wrong while saving your email.");
//       }
//     // eslint-disable-next-line no-unused-vars
//     } catch (err) {
//       setError("Failed to connect to the server. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container fluid className="bg-light" style={{ minHeight: "100vh" }}>
//       <Row className="justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
//         <Col xs={12} sm={8} md={6} lg={4}>
//           <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
//             {/* Top decorative bar */}
//             <div style={{ height: "6px", backgroundColor: "var(--bs-primary)" }} />
            
//             <Card.Body className="p-4 p-md-5">
//               <div className="text-center mb-4">
//                 <div className="mb-3">
//                   <span className="badge rounded-pill bg-primary-soft text-primary px-3 py-2">
//                     Final Step
//                   </span>
//                 </div>
//                 <h3 className="fw-bold text-dark">Almost There!</h3>
//                 <p className="text-muted small px-lg-3">
//                   {state?.message || "We just need your email address to secure your account and keep you updated."}
//                 </p>
//               </div>

//               {error && (
//                 <Alert variant="danger" className="border-0 small d-flex align-items-center">
//                   <i className="bi bi-exclamation-triangle-fill me-2"></i>
//                   {error}
//                 </Alert>
//               )}

//               <Form onSubmit={handleSubmit}>
//                 <Form.Group className="mb-4" controlId="emailInput">
//                   <Form.Label className="small fw-bold text-secondary">
//                     Email Address
//                   </Form.Label>
//                   <Form.Control
//                     type="email"
//                     placeholder="e.g. name@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     className="py-2 px-3 border-light-subtle rounded-3 shadow-none"
//                     style={{ backgroundColor: "#f8f9fa" }}
//                   />
//                   <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
//                     We'll never share your email with anyone else.
//                   </Form.Text>
//                 </Form.Group>

//                 <Button 
//                   type="submit" 
//                   variant="primary" 
//                   className="w-100 fw-bold rounded-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
//                   disabled={loading}
//                   style={{ transition: "all 0.3s ease" }}
//                 >
//                   {loading ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       Submit Email
//                       <i className="bi bi-arrow-right"></i>
//                     </>
//                   )}
//                 </Button>
//               </Form>
//             </Card.Body>
            
//             <Card.Footer className="bg-white border-0 text-center pb-4">
//               <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
//                 Secure authentication by <strong>TAKAATUF</strong>
//               </p>
//             </Card.Footer>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// }