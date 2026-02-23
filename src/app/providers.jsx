// filepath: src/app/providers.jsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext";

/*
  Global Providers Wrapper
  Composes all context providers required by the application.
   Hierarchy:
   1. BrowserRouter: Enables routing functionality.
   2. AuthProvider: Manages global authentication state.
 */
export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}