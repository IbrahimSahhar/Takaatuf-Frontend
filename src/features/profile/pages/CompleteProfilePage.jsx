// filepath: src/features/profile/pages/CompleteProfilePage.jsx
import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Spinner,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ROUTES } from "../../../constants/routes";
import { ROLES } from "../../../constants/roles";
import { WALLET_TYPE_OPTIONS } from "../../../constants/wallets";
import LocationConfirmationModal from "../../profile/components/LocationConfirmationModal";
import {
  getLocationDecision,
  LOCATION_STATUS,
} from "../locationFlow/locationDecisionProvider";
import api from "../../../services/api";
import {
  mapPublicToDashboard,
  roleHome,
  PROFILE_REDIRECT_KEY,
  REDIRECT_KEY,
} from "../../auth/utils/authRedirect";

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  // استخدام completeStepLocally لضمان تحديث الجلسة فوراً
  const { user, completeStepLocally } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || user?.name || "");
  const [cityNeighborhood, setCityNeighborhood] = useState(user?.city_neighborhood || "");

  const [detectedRole, setDetectedRole] = useState(user?.role || null); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentFields, setShowPaymentFields] = useState(false); 

  const [walletType, setWalletType] = useState(user?.wallet_type || "");
  const [walletAddress, setWalletAddress] = useState(user?.wallet_address || "");
  const [paypalAccount, setPaypalAccount] = useState(user?.paypal_account || "");

  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmReason, setConfirmReason] = useState("UNKNOWN");

  const missingFields = useMemo(() => {
    const arr = Array.isArray(location?.state?.missingProfileFields)
      ? location.state.missingProfileFields
      : [];
    return Array.from(new Set(arr));
  }, [location?.state?.missingProfileFields]);

  const validate = () => {
    const next = {};
    if (!fullName.trim()) next.name = "Name is required.";
    if (!cityNeighborhood.trim()) next.city_neighborhood = "City is required.";

    if (showPaymentFields) {
      if (detectedRole === ROLES.KP || detectedRole === 'kp') {
        if (!walletType) next.wallet_type = "Wallet type is required.";
        if (!walletAddress) next.wallet_address = "Wallet address is required.";
      }
      if (detectedRole === ROLES.KR || detectedRole === 'kr') {
        if (!paypalAccount.trim()) next.paypal_account = "PayPal account is required.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const finalizeNavigation = (roleValue) => {
    const nextRaw =
      localStorage.getItem(PROFILE_REDIRECT_KEY) ||
      localStorage.getItem(REDIRECT_KEY);
    localStorage.removeItem(PROFILE_REDIRECT_KEY);
    localStorage.removeItem(REDIRECT_KEY);

    if (nextRaw && nextRaw !== ROUTES.COMPLETE_PROFILE) {
      navigate(mapPublicToDashboard(nextRaw) || nextRaw, { replace: true });
    } else {
      navigate(roleHome(roleValue), { replace: true });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPageError("");
    setIsProcessing(true);

    const payload = {
      name: fullName.trim(),
      city_neighborhood: cityNeighborhood.trim(),
      ...(showPaymentFields && {
        wallet_type: walletType,
        wallet_address: walletAddress,
        paypal_account: paypalAccount,
        role: detectedRole,
      }),
    };

    try {
      // المرحلة الثانية: إرسال البيانات النهائية
      if (showPaymentFields) {
        const res = await api.completeProfile(payload);
        if (!res?.ok) throw new Error(res?.error || "Failed to finalize profile.");

        // تحديث ذري وشامل للحالة
        completeStepLocally({
          ...res.user,
          profile_complete: true,
          requiresLocationConfirmation: false,
        });

        finalizeNavigation(res.user?.role || detectedRole);
        return;
      }

      // المرحلة الأولى: فحص الموقع
      const decision = await getLocationDecision();

      if (decision.status === LOCATION_STATUS.MATCH) {
        const res = await api.completeProfile(payload);
        if (!res?.ok) throw new Error(res?.error || "Failed to update profile.");

        if (res.role || res.user?.role) {
          setDetectedRole(res.role || res.user?.role);
          setShowPaymentFields(true);
        } else {
          completeStepLocally({ ...res.user, profile_complete: true });
          finalizeNavigation(res.user?.role);
        }
      } else {
        setConfirmReason(decision.reason || "UNKNOWN");
        setShowConfirm(true);
      }
    } catch (err) {
      setPageError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmLocation = async (choice) => {
    setShowConfirm(false);
    setIsProcessing(true);

    try {
      const res = await api.confirmLocation(choice);
      if (!res?.ok) throw new Error("Location confirmation failed.");

      const assignedRole = (choice === "IN_GAZA") ? ROLES.KP : ROLES.KR;
      setDetectedRole(assignedRole);
      setShowPaymentFields(true);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 800 }}>
      <h2 className="fw-bold mb-4">Complete Your Profile</h2>

      {missingFields.length > 0 && (
        <Alert variant="warning" className="small">
          Missing fields: <strong>{missingFields.join(", ")}</strong>
        </Alert>
      )}

      {pageError && <Alert variant="danger">{pageError}</Alert>}

      <Form onSubmit={submit}>
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">Basic Information</h5>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isInvalid={!!errors.name}
                disabled={showPaymentFields && isProcessing}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>City / Neighborhood</Form.Label>
              <Form.Control
                value={cityNeighborhood}
                onChange={(e) => setCityNeighborhood(e.target.value)}
                isInvalid={!!errors.city_neighborhood}
                placeholder="e.g. Gaza, Rimal"
                disabled={showPaymentFields && isProcessing}
              />
              <Form.Control.Feedback type="invalid">{errors.city_neighborhood}</Form.Control.Feedback>
            </Form.Group>
          </Card.Body>
        </Card>

        {showPaymentFields && (
          <Card className="mb-4 shadow-sm border-primary animate__animated animate__fadeIn">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Payment Details</h5>
                <Badge bg="primary">
                  Role: {String(detectedRole).toUpperCase()}
                </Badge>
              </div>

              {(detectedRole === ROLES.KP || detectedRole === 'kp') ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Crypto Wallet Type</Form.Label>
                    <Form.Select
                      value={walletType}
                      onChange={(e) => setWalletType(e.target.value)}
                      isInvalid={!!errors.wallet_type}
                    >
                      <option value="">Select Type</option>
                      {WALLET_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Wallet Address</Form.Label>
                    <Form.Control
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      isInvalid={!!errors.wallet_address}
                      placeholder="0x..."
                    />
                  </Form.Group>
                </>
              ) : (
                <Form.Group className="mb-3">
                  <Form.Label>PayPal Account (Email)</Form.Label>
                  <Form.Control
                    value={paypalAccount}
                    onChange={(e) => setPaypalAccount(e.target.value)}
                    isInvalid={!!errors.paypal_account}
                    placeholder="example@mail.com"
                  />
                </Form.Group>
              )}
            </Card.Body>
          </Card>
        )}

        <div className="d-flex justify-content-end gap-2">
          <Button variant="light" onClick={() => navigate(-1)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isProcessing}>
            {isProcessing ? <Spinner size="sm" /> : showPaymentFields ? "Finalize Profile" : "Continue"}
          </Button>
        </div>
      </Form>

      <LocationConfirmationModal
        show={showConfirm}
        reason={confirmReason}
        onConfirm={handleConfirmLocation}
        onClose={() => setShowConfirm(false)}
      />
    </Container>
  );
}
// // filepath: src/features/profile/pages/CompleteProfilePage.jsx
// import { useMemo, useState } from "react";
// import {
//   Alert,
//   Badge,
//   Button,
//   Card,
//   Container,
//   Form,
//   Spinner,
// } from "react-bootstrap";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../../auth/context/AuthContext";
// import { ROUTES } from "../../../constants/routes";
// import { ROLES } from "../../../constants/roles";
// import { WALLET_TYPES, WALLET_TYPE_OPTIONS } from "../../../constants/wallets";
// import LocationConfirmationModal from "../../profile/components/LocationConfirmationModal";
// import {
//   getLocationDecision,
//   LOCATION_STATUS,
// } from "../locationFlow/locationDecisionProvider";
// import api from "../../../services/api";
// import {
//   mapPublicToDashboard,
//   roleHome,
//   PROFILE_REDIRECT_KEY,
//   REDIRECT_KEY,
// } from "../../auth/utils/authRedirect";

// /* Storage Key */
// const USERS_KEY = "takaatuf_users";

// export default function CompleteProfilePage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, setUser } = useAuth();

//   /* 1. الحقول الأساسية فقط (الاسم والمدينة) */
//   const [fullName, setFullName] = useState(user?.full_name || user?.name || "");
//   const [cityNeighborhood, setCityNeighborhood] = useState(
//     user?.city_neighborhood || "",
//   );

//   /* 2. حالات التحكم في الواجهة الديناميكية */
//   const [detectedRole, setDetectedRole] = useState(user?.role || null); // الدور الذي سيأتي من الباك إند
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showPaymentFields, setShowPaymentFields] = useState(false); // إظهار بيانات الدفع بعد تحديد الدور

//   /* حقول الدفع (مخفية في البداية) */
//   const [walletType, setWalletType] = useState(user?.wallet_type || "");
//   const [walletAddress, setWalletAddress] = useState(
//     user?.wallet_address || "",
//   );
//   const [paypalAccount, setPaypalAccount] = useState(
//     user?.paypal_account || "",
//   );

//   const [errors, setErrors] = useState({});
//   const [pageError, setPageError] = useState("");

//   /* Modal States */
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [confirmReason, setConfirmReason] = useState("UNKNOWN");
//   // eslint-disable-next-line no-unused-vars
//   const [pendingPayload, setPendingPayload] = useState(null);

//   const missingFields = useMemo(() => {
//     const arr = Array.isArray(location?.state?.missingProfileFields)
//       ? location.state.missingProfileFields
//       : [];
//     return Array.from(new Set(arr));
//   }, [location?.state?.missingProfileFields]);

//   // التحقق من الحقول المطلوبة
//   const validate = () => {
//     const next = {};
//     if (!fullName.trim()) next.name = "Name is required.";
//     if (!cityNeighborhood.trim()) next.city_neighborhood = "City is required.";

//     // التحقق من بيانات الدفع فقط إذا ظهرت للمستخدم
//     if (showPaymentFields) {
//       if (detectedRole === ROLES.KP) {
//         if (!walletType) next.wallet_type = "Wallet type is required.";
//         if (!walletAddress) next.wallet_address = "Wallet address is required.";
//       }
//       if (detectedRole === ROLES.KR) {
//         if (!paypalAccount.trim())
//           next.paypal_account = "PayPal account is required.";
//       }
//     }

//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   /* التوجيه النهائي */
//   const finalizeNavigation = (roleValue) => {
//     const nextRaw =
//       localStorage.getItem(PROFILE_REDIRECT_KEY) ||
//       localStorage.getItem(REDIRECT_KEY);
//     localStorage.removeItem(PROFILE_REDIRECT_KEY);
//     localStorage.removeItem(REDIRECT_KEY);

//     if (nextRaw && nextRaw !== ROUTES.COMPLETE_PROFILE) {
//       navigate(mapPublicToDashboard(nextRaw) || nextRaw, { replace: true });
//     } else {
//       navigate(roleHome(roleValue), { replace: true });
//     }
//   };

//   /* 3. الوظيفة الأساسية: إرسال البيانات ومعالجة رد الباك إند */
//   const submit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setPageError("");
//     setIsProcessing(true);

//     // تجهيز البيانات الأساسية
//     const payload = {
//       name: fullName.trim(),
//       city_neighborhood: cityNeighborhood.trim(),
//       // إذا كانت بيانات الدفع ظاهرة، نرسلها
//       ...(showPaymentFields && {
//         wallet_type: walletType,
//         wallet_address: walletAddress,
//         paypal_account: paypalAccount,
//         role: detectedRole,
//       }),
//     };

//     try {
//       /* --- التعديل هنا --- */
//       // إذا كانت حقول الدفع ظاهرة، فهذا يعني أننا تجاوزنا مرحلة فحص الموقع بنجاح
//       // لذا نرسل البيانات مباشرة للباك إند ولا نستدعي getLocationDecision مجدداً
//       if (showPaymentFields) {
//         const res = await api.completeProfile(payload);
//         if (!res?.ok)
//           throw new Error(res?.error || "Failed to finalize profile.");

//         const updatedUser = {
//           ...user,
//           ...res.user,
//           profile_complete: true,
//           requiresLocationConfirmation: false,
//           location_verified: true,
//         };
//         setUser(updatedUser);
//         finalizeNavigation(updatedUser.role);
//         return; // ننهي الدالة هنا
//       }
//       /* ------------------- */

//       // إذا لم تكن حقول الدفع ظاهرة، فنحن في المرحلة الأولى (فحص الموقع)
//       const decision = await getLocationDecision();
//       setPendingPayload(payload);

//       if (decision.status === LOCATION_STATUS.MATCH) {
//         const res = await api.completeProfile(payload);
//         if (!res?.ok)
//           throw new Error(res?.error || "Failed to update profile.");

//         // إذا رجع الباك إند دوراً، نظهر حقول الدفع وننتظر الضغطة القادمة
//         if (res.role) {
//           setDetectedRole(res.role);
//           setShowPaymentFields(true);
//         } else {
//           // إذا لم يتطلب الدور بيانات دفع (حالة نادرة حسب منطقك)
//           const updatedUser = { ...user, ...res.user, profile_complete: true };
//           setUser(updatedUser);
//           finalizeNavigation(updatedUser.role);
//         }
//       } else {
//         // إظهار المودال في حالة عدم التطابق
//         setConfirmReason(decision.reason || "UNKNOWN");
//         setShowConfirm(true);
//       }
//     } catch (err) {
//       setPageError(err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   /* 4. معالجة تأكيد الموقع يدوياً (في حال الـ Mismatch) */
//   const handleConfirmLocation = async (choice) => {
//     setShowConfirm(false);
//     setIsProcessing(true);

//     try {
//       const res = await api.confirmLocation(choice);
//       if (!res?.ok) throw new Error("Location confirmation failed.");

//       // بناءً على الاختيار يتحدد الدور: داخل غزة (KP)، خارجها (KR)
//       const assignedRole = choice === "IN_GAZA" ? ROLES.KP : ROLES.KR;
//       setDetectedRole(assignedRole);

//       // ننتقل لمرحلة طلب بيانات الدفع بناءً على الدور الذي تم تأكيده
//       setShowPaymentFields(true);
//     } catch (err) {
//       setPageError(err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <Container className="py-5" style={{ maxWidth: 800 }}>
//       <h2 className="fw-bold mb-4">Complete Your Profile</h2>

//       {/* تنبيه نقص البيانات */}
//       {missingFields.length > 0 && (
//         <Alert variant="warning" className="small">
//           Missing fields: <strong>{missingFields.join(", ")}</strong>
//         </Alert>
//       )}

//       {pageError && <Alert variant="danger">{pageError}</Alert>}

//       <Form onSubmit={submit}>
//         {/* المرحلة الأولى: المعلومات الأساسية */}
//         <Card className="mb-4 shadow-sm border-0">
//           <Card.Body className="p-4">
//             <h5 className="fw-bold mb-3">Basic Information</h5>
//             <Form.Group className="mb-3">
//               <Form.Label>Full Name</Form.Label>
//               <Form.Control
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 isInvalid={!!errors.name}
//                 disabled={showPaymentFields}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {errors.name}
//               </Form.Control.Feedback>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>City / Neighborhood</Form.Label>
//               <Form.Control
//                 value={cityNeighborhood}
//                 onChange={(e) => setCityNeighborhood(e.target.value)}
//                 isInvalid={!!errors.city_neighborhood}
//                 placeholder="e.g. Gaza, Rimal"
//                 disabled={showPaymentFields}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {errors.city_neighborhood}
//               </Form.Control.Feedback>
//             </Form.Group>
//           </Card.Body>
//         </Card>

//         {/* المرحلة الثانية: بيانات الدفع (تظهر ديناميكياً بناءً على الدور المكتشف) */}
//         {showPaymentFields && (
//           <Card className="mb-4 shadow-sm border-primary animate__animated animate__fadeIn">
//             <Card.Body className="p-4">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="fw-bold mb-0">Payment Details</h5>
//                 <Badge bg="primary">
//                   Role:{" "}
//                   {detectedRole === ROLES.KP
//                     ? "Knowledge Provider"
//                     : "Requester"}
//                 </Badge>
//               </div>

//               {detectedRole === ROLES.KP ? (
//                 <>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Crypto Wallet Type</Form.Label>
//                     <Form.Select
//                       value={walletType}
//                       onChange={(e) => setWalletType(e.target.value)}
//                       isInvalid={!!errors.wallet_type}
//                     >
//                       <option value="">Select Type</option>
//                       {WALLET_TYPE_OPTIONS.map((opt) => (
//                         <option key={opt.value} value={opt.value}>
//                           {opt.label}
//                         </option>
//                       ))}
//                     </Form.Select>
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Wallet Address</Form.Label>
//                     <Form.Control
//                       value={walletAddress}
//                       onChange={(e) => setWalletAddress(e.target.value)}
//                       isInvalid={!!errors.wallet_address}
//                       placeholder="0x..."
//                     />
//                   </Form.Group>
//                 </>
//               ) : (
//                 <Form.Group className="mb-3">
//                   <Form.Label>PayPal Account (Email)</Form.Label>
//                   <Form.Control
//                     value={paypalAccount}
//                     onChange={(e) => setPaypalAccount(e.target.value)}
//                     isInvalid={!!errors.paypal_account}
//                     placeholder="example@mail.com"
//                   />
//                 </Form.Group>
//               )}
//             </Card.Body>
//           </Card>
//         )}

//         {/* أزرار التحكم */}
//         <div className="d-flex justify-content-end gap-2">
//           <Button
//             variant="light"
//             onClick={() => navigate(-1)}
//             disabled={isProcessing}
//           >
//             Cancel
//           </Button>
//           <Button type="submit" variant="primary" disabled={isProcessing}>
//             {isProcessing ? (
//               <Spinner size="sm" />
//             ) : showPaymentFields ? (
//               "Finalize Profile"
//             ) : (
//               "Continue"
//             )}
//           </Button>
//         </div>
//       </Form>

//       {/* مودال تأكيد الموقع في حال عدم المطابقة */}
//       <LocationConfirmationModal
//         show={showConfirm}
//         reason={confirmReason}
//         onConfirm={handleConfirmLocation}
//         onClose={() => setShowConfirm(false)}
//       />
//     </Container>
//   );
// }
