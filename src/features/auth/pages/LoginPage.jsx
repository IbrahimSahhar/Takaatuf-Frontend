// filepath: src/features/auth/pages/LoginPage.jsx
import LoginCard from "../components/LoginCard";

/*
  LoginPage Component
  A wrapper page that centers the login card and provides the overall page structure.
 */
export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-page__container">
        <div className="login-page__content">
          {/* The LoginCard handles all logic (Form, Social, Redirection) */}
          <LoginCard />
        </div>
      </section>
    </main>
  );
}