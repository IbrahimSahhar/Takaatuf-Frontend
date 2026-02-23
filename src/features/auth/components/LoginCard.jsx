// filepath: src/features/auth/components/LoginCard.jsx
import { Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants";
import OAuthButtons from "./OAuthButtons";
import LoginForm from "./LoginForm";
import useLoginLogic from "../hooks/useLoginLogic";
import { useState } from "react";
// 1. استيراد الـ api لاستخدامه في جلب رابط التوجيه
import { api } from "../../../services/api";

/**
 * LoginCard Component
 * Presentational container that orchestrates the login UI flow.
 * Delegates business logic to the useLoginLogic hook.
 */
export default function LoginCard() {
  const [errorMessage, setErrorMessage] = useState(null);
  
  const {
    email,
    password,
    loadingProvider,
    loadingEmail,
    status,
    submitted,
    isEmailValid,
    isPasswordValid,
    isBusy,
    setEmail,
    setPassword,
    showMessage,
    // handleProvider, // سنستبدل منطقها هنا بالـ Redirect المباشر
    handleEmailLogin,
  } = useLoginLogic();

  const handleForgot = () =>
    showMessage("info", "Password reset is not implemented yet.");

  // 2. تعديل دالة تسجيل الدخول عبر جوجل/فيسبوك
  const handleProviderLogin = async (provider) => {
    try {
      setErrorMessage(null);
      
      // جلب الرابط الصحيح (سواء من الموك أو الحقيقي)
      // نرسل الـ provider والوجهة النهائية بعد النجاح
      const redirectUrl = api.oauthRedirectUrl(provider, "/dashboard");

      if (redirectUrl) {
        // التوجيه الكامل لصفحة جوجل/فيسبوك
        window.location.href = redirectUrl;
      } else {
        throw new Error("Could not generate redirect URL");
      }
      
    } catch (error) {
      console.error("Social Login Error:", error);
      setErrorMessage("فشل الاتصال بمزود الخدمة. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <Card className="border-0 shadow-sm rounded-4 login-card">
      <Card.Body className="p-4 p-md-5">
        {/* Header Section */}
        <div className="mb-4 text-center">
          <h3 className="fw-bold mb-1" style={{ letterSpacing: ".2px" }}>
            Sign In to TAKAATUF
          </h3>
          <div className="text-muted small">
            Securely access your account
          </div>
        </div>

        {/* Global Status/Error Alert */}
        {(status?.msg || errorMessage) && (
          <Alert
            variant={errorMessage ? "danger" : status.type}
            className="py-2 small border-0"
            style={{ borderRadius: 10 }}
          >
            {errorMessage || status.msg}
          </Alert>
        )}

        {/* Social Authentication */}
        <OAuthButtons
          onProvider={handleProviderLogin} // الدالة المعدلة
          loadingProvider={loadingProvider}
          disabled={isBusy}
        />

        {/* Divider with Text */}
        <div className="d-flex align-items-center gap-3 my-4">
          <div className="flex-grow-1 border-top" />
          <span
            className="text-uppercase text-muted fw-medium"
            style={{ fontSize: 11, letterSpacing: ".05em" }}
          >
            Or continue with
          </span>
          <div className="flex-grow-1 border-top" />
        </div>

        {/* Traditional Credentials Form */}
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          submitted={submitted}
          isEmailValid={isEmailValid}
          isPasswordValid={isPasswordValid}
          loading={loadingEmail}
          disabled={isBusy}
          onSubmit={handleEmailLogin}
          onForgot={handleForgot}
        />

        {/* Footer Links */}
        <div className="text-center mt-3 small">
          <span className="text-muted">Don&apos;t have an account?</span>{" "}
          <Link to={ROUTES.REGISTER} className="fw-bold text-decoration-none">
            Register
          </Link>
        </div>

        <div className="text-muted mt-4 text-center" style={{ fontSize: 11, lineHeight: 1.5 }}>
          By signing in, you agree to our terms. We only request minimum
          provider scopes for authentication. Your session will last 1 year.
        </div>
      </Card.Body>
    </Card>
  );
}