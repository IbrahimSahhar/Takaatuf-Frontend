// filepath: src/features/auth/registration/hooks/useRegisterLogic.js
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../services/api";
import { validateAll } from "../utils/registration.validation";
import { ROUTES } from "../../../../constants/routes";
import { useAuth } from "../../context/AuthContext";

function mapRegisterError(resOrErr) {
  const status = resOrErr?.status;
  const message = String(resOrErr?.error || "").toLowerCase();

  if (status === 409 || (message.includes("email") && (message.includes("taken") || message.includes("exists")))) {
    return { type: "email_in_use", message: "This email is already in use." };
  }
  if (status >= 500) {
    return { type: "server", message: "Our servers are acting up. Please try again later." };
  }
  return { type: "generic", message: "Registration failed. Please check your details and try again." };
}

export default function useRegisterLogic() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isLoading, setIsLoading] = useState(false);

  const isBusy = isLoading;
  const canSubmit = useMemo(() => !isBusy, [isBusy]);

  const setField = (key) => (e) => {
    const val = e?.target?.value ?? "";
    setValues((prev) => {
      const nextValues = { ...prev, [key]: val };
      if (submitted) {
        setErrors(validateAll(nextValues));
      }
      return nextValues;
    });
  };

  const submit = async () => {
    if (isBusy) return;
    setSubmitted(true);
    setStatus({ type: "", msg: "" });

    const nextErrors = validateAll(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);

    try {
      // 1. طلب التسجيل
      const res = await api.register({
        name: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.confirmPassword,
      });

      // 2. معالجة الفشل
      if (!res?.ok) {
        const mapped = mapRegisterError(res);
        if (mapped.type === "email_in_use") {
          setErrors((prev) => ({ ...prev, email: mapped.message }));
          setStatus({
            type: "warning",
            msg: "This email is already in use. Please log in instead.",
          });
        } else {
          setStatus({ type: "danger", msg: mapped.message });
        }
        setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
        return;
      }

      // 3. النجاح: تحديث الحالة العالمية فوراً
      // نمرر البيانات للـ Context الذي سيقوم بدوره بحفظها في localStorage
      login({ 
        token: res.token, 
        user: res.user 
      });

      // تنظيف الحقول الحساسة قبل الانتقال
      setValues((p) => ({ ...p, password: "", confirmPassword: "" }));

      // 4. التوجيه لصفحة التأكيد مع "دفعة" بسيطة للتوقيت
      // الـ replace: true تمنع المستخدم من العودة لنموذج التسجيل بالخطأ
      setTimeout(() => {
        navigate(ROUTES.CHECK_EMAIL, {
          replace: true,
          state: { email: values.email.trim() },
        });
      }, 10); 

    } catch (err) {
      console.error("Registration Error:", err);
      setStatus({
        type: "danger",
        msg: "Connection error. Please check your internet and try again.",
      });
      setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    values,
    errors,
    status,
    submitted,
    isLoading,
    isBusy,
    canSubmit,
    setField,
    submit,
  };
}

// // filepath: src/features/auth/registration/hooks/useRegisterLogic.js
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../../../services/api";
// import { validateAll } from "../utils/registration.validation";
// import { ROUTES } from "../../../../constants/routes";
// import { useAuth } from "../../context/AuthContext"; // استيراد الـ Auth

// function mapRegisterError(resOrErr) {
//   const status = resOrErr?.status;
//   const message = String(resOrErr?.error || "").toLowerCase();

//   if (status === 409 || (message.includes("email") && (message.includes("taken") || message.includes("exists")))) {
//     return { type: "email_in_use", message: "This email is already in use." };
//   }
//   if (status >= 500) {
//     return { type: "server", message: "Our servers are acting up. Please try again later." };
//   }
//   return { type: "generic", message: "Registration failed. Please check your details and try again." };
// }

// /*
//   Custom hook to manage registration form state, validation, and submission.
// */
// export default function useRegisterLogic() {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // استخراج دالة login

//   // Form Fields State
//   const [values, setValues] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   // UI & Feedback State
//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [status, setStatus] = useState({ type: "", msg: "" });
//   const [isLoading, setIsLoading] = useState(false);

//   const isBusy = isLoading;
//   const canSubmit = useMemo(() => !isBusy, [isBusy]);

//   /*
//     Updates a specific field and triggers live validation if the user
//     has already tried to submit the form once.
//   */
//   const setField = (key) => (e) => {
//     const val = e?.target?.value ?? "";
//     setValues((prev) => {
//       const nextValues = { ...prev, [key]: val };
//       if (submitted) {
//         setErrors(validateAll(nextValues));
//       }
//       return nextValues;
//     });
//   };

//   /*
//     Handles the registration submission logic.
//   */
//   const submit = async () => {
//     if (isBusy) return;
//     setSubmitted(true);
//     setStatus({ type: "", msg: "" });

//     // 1. Client-side validation
//     const nextErrors = validateAll(values);
//     setErrors(nextErrors);
//     if (Object.keys(nextErrors).length > 0) return;

//     setIsLoading(true);

//     try {
//       // 2. API Call with normalized keys for Laravel/Backend
//       const res = await api.register({
//         name: values.fullName.trim(),
//         email: values.email.trim(),
//         password: values.password,
//         password_confirmation: values.confirmPassword,
//       });

//       // 3. Handle Backend Failure
//       if (!res?.ok) {
//         const mapped = mapRegisterError(res);
//         if (mapped.type === "email_in_use") {
//           setErrors((prev) => ({ ...prev, email: mapped.message }));
//           setStatus({
//             type: "warning",
//             msg: "This email is already in use. Please log in instead.",
//           });
//         } else {
//           setStatus({ type: "danger", msg: mapped.message });
//         }
//         // Security: Reset sensitive fields on failure
//         setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
//         return;
//       }

//       // --- 4. Success Flow (تعديل لضمان التوقيت) ---
      
//       // أ. تسجيل الدخول وحفظ البيانات في الـ Context/Storage
//       login({ 
//         token: res.token, 
//         user: res.user 
//       });

//       // ب. تنظيف الحقول الحساسة
//       setValues((p) => ({ ...p, password: "", confirmPassword: "" }));

//       // ج. استخدام setTimeout لضمان أن الـ Context قام بتحديث الحالة 
//       // وأصبح isAuthenticated=true قبل أن يقرر الـ Guard توجيهك
//       setTimeout(() => {
//         console.log("tesssssssssst")
//         navigate(ROUTES.CHECK_EMAIL, {
//           replace: true,
//           state: { email: values.email.trim() },
//         });
//       }, 50); // تأخير تقني بسيط جداً لا يشعر به المستخدم

//     } catch (err) {
//       console.error("Registration Error:", err);
//       setStatus({
//         type: "danger",
//         msg: "Connection error. Please check your internet and try again.",
//       });
//       setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return {
//     values,
//     errors,
//     status,
//     submitted,
//     isLoading,
//     isBusy,
//     canSubmit,
//     setField,
//     submit,
//   };
// }

// // filepath: src/features/auth/registration/hooks/useRegisterLogic.js
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../../../services/api";
// import { validateAll } from "../utils/registration.validation";
// import { ROUTES } from "../../../../constants/routes";
// import { useAuth } from "../../context/AuthContext"; // استيراد الـ Auth

// function mapRegisterError(resOrErr) {
//   const status = resOrErr?.status;
//   const message = String(resOrErr?.error || "").toLowerCase();

//   if (status === 409 || (message.includes("email") && (message.includes("taken") || message.includes("exists")))) {
//     return { type: "email_in_use", message: "This email is already in use." };
//   }
//   if (status >= 500) {
//     return { type: "server", message: "Our servers are acting up. Please try again later." };
//   }
//   return { type: "generic", message: "Registration failed. Please check your details and try again." };
// }

// export default function useRegisterLogic() {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // استخراج دالة login

//   const [values, setValues] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [status, setStatus] = useState({ type: "", msg: "" });
//   const [isLoading, setIsLoading] = useState(false);

//   const isBusy = isLoading;
//   const canSubmit = useMemo(() => !isBusy, [isBusy]);

//   const setField = (key) => (e) => {
//     const val = e?.target?.value ?? "";
//     setValues((prev) => {
//       const nextValues = { ...prev, [key]: val };
//       if (submitted) {
//         setErrors(validateAll(nextValues));
//       }
//       return nextValues;
//     });
//   };

//   const submit = async () => {
//     if (isBusy) return;
//     setSubmitted(true);
//     setStatus({ type: "", msg: "" });

//     const nextErrors = validateAll(values);
//     setErrors(nextErrors);
//     if (Object.keys(nextErrors).length > 0) return;

//     setIsLoading(true);

//     try {
//       const res = await api.register({
//         name: values.fullName.trim(),
//         email: values.email.trim(),
//         password: values.password,
//         password_confirmation: values.confirmPassword,
//       });

//       if (!res?.ok) {
//         const mapped = mapRegisterError(res);
//         if (mapped.type === "email_in_use") {
//           setErrors((prev) => ({ ...prev, email: mapped.message }));
//           setStatus({
//             type: "warning",
//             msg: "This email is already in use. Please log in instead.",
//           });
//         } else {
//           setStatus({ type: "danger", msg: mapped.message });
//         }
//         setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
//         return;
//       }

//       // --- التعديل الجوهري هنا ---
      
//       // 1. تسجيل الدخول فعلياً وتخزين التوكن في المتصفح
//       // الموك أو الباك-إند سيعيد res.token و res.user
//       login({ 
//         token: res.token, 
//         user: res.user 
//       });

//       // 2. تنظيف الحقول الحساسة
//       setValues((p) => ({ ...p, password: "", confirmPassword: "" }));

//       // 3. التوجيه لصفحة التأكيد
//       navigate(ROUTES.CHECK_EMAIL, {
//         replace: true,
//         state: { email: values.email.trim() },
//       });

//     } catch (err) {
//       console.error("Registration Error:", err);
//       setStatus({
//         type: "danger",
//         msg: "Connection error. Please check your internet and try again.",
//       });
//       setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return { values, errors, status, submitted, isLoading, isBusy, canSubmit, setField, submit };
// }

// // filepath: src/features/auth/registration/hooks/useRegisterLogic.js
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../../../services/api";
// import { validateAll } from "../utils/registration.validation";
// import { ROUTES } from "../../../../constants/routes";

// /*
//   Maps backend error responses to user-friendly messages.
//   Specifically handles duplicate email conflicts (409) and server errors.
//  */
// function mapRegisterError(resOrErr) {
//   const status = resOrErr?.status;
//   const message = String(resOrErr?.error || "").toLowerCase();

//   if (status === 409 || (message.includes("email") && (message.includes("taken") || message.includes("exists")))) {
//     return { type: "email_in_use", message: "This email is already in use." };
//   }

//   if (status >= 500) {
//     return { type: "server", message: "Our servers are acting up. Please try again later." };
//   }

//   return { type: "generic", message: "Registration failed. Please check your details and try again." };
// }

// /*
//   Custom hook to manage registration form state, validation, and submission.
//  */
// export default function useRegisterLogic() {
//   const navigate = useNavigate();

//   // Form Fields State
//   const [values, setValues] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   // UI & Feedback State
//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [status, setStatus] = useState({ type: "", msg: "" });
//   const [isLoading, setIsLoading] = useState(false);

//   const isBusy = isLoading;
//   const canSubmit = useMemo(() => !isBusy, [isBusy]);

//   /*
//     Updates a specific field and triggers live validation if the user
//     has already tried to submit the form once.
//    */
//   const setField = (key) => (e) => {
//     const val = e?.target?.value ?? "";
//     setValues((prev) => {
//       const nextValues = { ...prev, [key]: val };
//       if (submitted) {
//         setErrors(validateAll(nextValues));
//       }
//       return nextValues;
//     });
//   };

//   /*
//     Handles the registration submission logic.
//    */
//   const submit = async () => {
//     if (isBusy) return;

//     setSubmitted(true);
//     setStatus({ type: "", msg: "" });

//     // 1. Client-side validation
//     const nextErrors = validateAll(values);
//     setErrors(nextErrors);

//     if (Object.keys(nextErrors).length > 0) return;

//     setIsLoading(true);

//     try {
//       // 2. API Call with normalized keys for Laravel/Backend
//       const res = await api.register({
//         name: values.fullName.trim(),
//         email: values.email.trim(),
//         password: values.password,
//         password_confirmation: values.confirmPassword,
//       });

//       // 3. Handle Backend Failure
//       if (!res?.ok) {
//         const mapped = mapRegisterError(res);

//         if (mapped.type === "email_in_use") {
//           setErrors((prev) => ({ ...prev, email: mapped.message }));
//           setStatus({
//             type: "warning",
//             msg: "This email is already in use. Please log in instead.",
//           });
//         } else {
//           setStatus({ type: "danger", msg: mapped.message });
//         }

//         // Security: Reset sensitive fields on failure
//         setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
//         return;
//       }

//       // 4. Success Flow
//       setValues((p) => ({ ...p, password: "", confirmPassword: "" }));

//       // Redirect to verification screen with the email stored in state
//       navigate(ROUTES.CHECK_EMAIL, {
//         replace: true,
//         state: { email: values.email.trim() },
//       });

//     } catch (err) {
//       console.error("Registration Error:", err);
//       setStatus({
//         type: "danger",
//         msg: "Connection error. Please check your internet and try again.",
//       });
//       setValues((p) => ({ ...p, password: "", confirmPassword: "" }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return {
//     values,
//     errors,
//     status,
//     submitted,
//     isLoading,
//     isBusy,
//     canSubmit,
//     setField,
//     submit,
//   };
// }
