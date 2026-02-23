// filepath: src/features/auth/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAuth,
  ensureExpiresAt,
  isSessionExpired,
  loadAuth,
  makeExpiresAt,
  saveAuth,
} from "../utils/authSession";

import { canonicalizeRole } from "./auth.roles";
import {
  computeMissingProfileFields,
  computeProfileComplete,
} from "./auth.profile";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initial = loadAuth();

  const [token, setToken] = useState(initial?.token ?? null);
  const [user, _setUser] = useState(initial?.user ?? null);
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? null);
  const [isHydrating, setIsHydrating] = useState(true);

  // دالة موحدة لحساب حالة التأكيد لمنع التضارب
  const checkEmailVerified = useCallback((u) => {
    if (!u) return false;
    return (
      u.email_verified === true || 
      u.isVerified === true || 
      Boolean(u.email_verified_at)
    );
  }, []);

  const derived = useMemo(() => {
    if (!user) {
      return {
        userWithProfile: null,
        missingProfileFields: [],
        profileComplete: false,
        requiresLocationConfirmation: false,
        emailVerified: false,
      };
    }

    const role = canonicalizeRole(user?.role);
    const emailVerified = checkEmailVerified(user);

    const userWithProfile = {
      ...user,
      role,
      email_verified: emailVerified,
      requiresLocationConfirmation: Boolean(user?.requiresLocationConfirmation),
      profile_complete:
        typeof user?.profile_complete === "boolean"
          ? user.profile_complete
          : computeProfileComplete({ ...user, role }),
    };

    return {
      userWithProfile,
      missingProfileFields: computeMissingProfileFields(userWithProfile),
      profileComplete: Boolean(userWithProfile.profile_complete),
      requiresLocationConfirmation: Boolean(userWithProfile.requiresLocationConfirmation),
      emailVerified,
    };
  }, [user, checkEmailVerified]);

  const logout = useCallback(() => {
    setToken(null);
    _setUser(null);
    setExpiresAt(null);
    clearAuth();
  }, []);

  const setUser = useCallback((next) => {
    _setUser((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      if (!resolved) return null;
      return {
        ...resolved,
        role: canonicalizeRole(resolved?.role),
      };
    });
  }, []);

  const completeStepLocally = useCallback((updates) => {
    _setUser((prev) => {
      if (!prev) return null;
      const updatedUser = { 
        ...prev, 
        ...updates,
        role: canonicalizeRole(updates?.role || prev?.role)
      };
      
      saveAuth({ 
        token: localStorage.getItem("token") || token, 
        user: updatedUser, 
        expiresAt: expiresAt || makeExpiresAt()
      });
      
      return updatedUser;
    });
  }, [token, expiresAt]);

  const setRequiresLocationConfirmation = useCallback((flag) => {
    setUser((prev) => ({ ...prev, requiresLocationConfirmation: Boolean(flag) }));
  }, [setUser]);

  const setEmailVerified = useCallback((flag) => {
    setUser((prev) => ({
      ...prev,
      email_verified: Boolean(flag),
      email_verified_at: flag ? (prev?.email_verified_at || new Date().toISOString()) : null,
    }));
  }, [setUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token && !user) logout();
    setIsHydrating(false);
  }, [token, user, logout]);

  useEffect(() => {
    if (!token || !user) {
      if (!isHydrating) clearAuth();
      return;
    }
    const exp = ensureExpiresAt(expiresAt);
    if (isSessionExpired(exp)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      logout();
      return;
    }
    if (!expiresAt) setExpiresAt(exp);
    
    // نستخدم البيانات المشتقة للحفظ لضمان مزامنة Flags مثل email_verified
    saveAuth({ token, user: derived.userWithProfile || user, expiresAt: exp });
  }, [token, user, expiresAt, derived.userWithProfile, logout, isHydrating]);

  const login = useCallback(({ token: t, user: u }) => {
    const exp = makeExpiresAt();
    const role = canonicalizeRole(u?.role);
    const emailVerified = (
        u?.email_verified === true || 
        u?.isVerified === true || 
        Boolean(u?.email_verified_at)
    );

    const initialUser = {
      ...u,
      role,
      email_verified: emailVerified,
    };

    const finalUser = {
      ...initialUser,
      profile_complete: u?.profile_complete ?? computeProfileComplete(initialUser),
    };

    setToken(t);
    _setUser(finalUser);
    setExpiresAt(exp);
    // حفظ فوري لتقليل فجوة التوقيت مع الـ Guard
    saveAuth({ token: t, user: finalUser, expiresAt: exp });
  }, []);

  const value = useMemo(() => {
    const activeUser = derived.userWithProfile ?? user;
    return {
      token,
      user: activeUser,
      expiresAt,
      isAuthenticated: Boolean(token && activeUser),
      role: activeUser?.role ?? null,
      emailVerified: derived.emailVerified,
      profileComplete: derived.profileComplete,
      missingProfileFields: derived.missingProfileFields,
      requiresLocationConfirmation: derived.requiresLocationConfirmation,
      setRequiresLocationConfirmation,
      setEmailVerified,
      completeStepLocally,
      isHydrating,
      loading: isHydrating,
      ready: !isHydrating,
      login,
      logout,
      setUser,
    };
  }, [token, user, expiresAt, isHydrating, derived, login, logout, setUser, setRequiresLocationConfirmation, setEmailVerified, completeStepLocally]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// /* eslint-disable react-refresh/only-export-components */
// // filepath: src/features/auth/context/AuthContext.jsx
// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import {
//   clearAuth,
//   ensureExpiresAt,
//   isSessionExpired,
//   loadAuth,
//   makeExpiresAt,
//   saveAuth,
// } from "../utils/authSession";

// import { canonicalizeRole } from "./auth.roles";
// import {
//   computeMissingProfileFields,
//   computeProfileComplete,
// } from "./auth.profile";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const initial = loadAuth();

//   const [token, setToken] = useState(initial?.token ?? null);
//   const [user, _setUser] = useState(initial?.user ?? null);
//   const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? null);
//   const [isHydrating, setIsHydrating] = useState(true);

//   const derived = useMemo(() => {
//     if (!user) {
//       return {
//         userWithProfile: null,
//         missingProfileFields: [],
//         profileComplete: false,
//         requiresLocationConfirmation: false,
//         emailVerified: false,
//       };
//     }

//     const role = canonicalizeRole(user?.role);
//     const emailVerified =
//       typeof user?.email_verified === "boolean"
//         ? user.email_verified
//         : typeof user?.isVerified === "boolean"
//         ? user.isVerified
//         : Boolean(user?.email_verified_at);

//     const userWithProfile = {
//       ...user,
//       role,
//       email_verified: emailVerified,
//       requiresLocationConfirmation: Boolean(user?.requiresLocationConfirmation),
//       profile_complete:
//         typeof user?.profile_complete === "boolean"
//           ? user.profile_complete
//           : computeProfileComplete({ ...user, role }),
//     };

//     return {
//       userWithProfile,
//       missingProfileFields: computeMissingProfileFields(userWithProfile),
//       profileComplete: Boolean(userWithProfile.profile_complete),
//       requiresLocationConfirmation: Boolean(userWithProfile.requiresLocationConfirmation),
//       emailVerified,
//     };
//   }, [user]);

//   const logout = useCallback(() => {
//     setToken(null);
//     _setUser(null);
//     setExpiresAt(null);
//     clearAuth();
//   }, []);

//   const setUser = useCallback((next) => {
//     _setUser((prev) => {
//       const resolved = typeof next === "function" ? next(prev) : next;
//       if (!resolved) return null;
//       return {
//         ...resolved,
//         role: canonicalizeRole(resolved?.role),
//       };
//     });
//   }, []);

//   /**
//    * دالة التحديث الذري (Atomic Update)
//    * نستخدمها في صفحة الـ Skip وفي نهاية الـ Complete Profile
//    * لضمان تحديث الـ Context والـ Storage معاً فوراً.
//    */
//   const completeStepLocally = useCallback((updates) => {
//     _setUser((prev) => {
//       if (!prev) return null;
//       const updatedUser = { 
//         ...prev, 
//         ...updates,
//         role: canonicalizeRole(updates?.role || prev?.role)
//       };
      
//       // حفظ فوري لضمان أن الـ Guard يقرأ من الـ Storage لو حصل Refresh
//       saveAuth({ 
//         token: localStorage.getItem("token"), 
//         user: updatedUser, 
//         expiresAt: localStorage.getItem("takaatuf_auth") ? JSON.parse(localStorage.getItem("takaatuf_auth")).expiresAt : makeExpiresAt()
//       });
      
//       return updatedUser;
//     });
//   }, []);

//   const setRequiresLocationConfirmation = useCallback((flag) => {
//     setUser((prev) => ({ ...prev, requiresLocationConfirmation: Boolean(flag) }));
//   }, [setUser]);

//   const setEmailVerified = useCallback((flag) => {
//     setUser((prev) => ({
//       ...prev,
//       email_verified: Boolean(flag),
//       email_verified_at: flag ? (prev?.email_verified_at || new Date().toISOString()) : null,
//     }));
//   }, [setUser]);

//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     if (token && !user) logout();
//     setIsHydrating(false);
//   }, [token, user, logout]);

//   useEffect(() => {
//     if (!token || !user) {
//       clearAuth();
//       return;
//     }
//     const exp = ensureExpiresAt(expiresAt);
//     if (isSessionExpired(exp)) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       logout();
//       return;
//     }
//     if (!expiresAt) setExpiresAt(exp);
//     saveAuth({ token, user: derived.userWithProfile || user, expiresAt: exp });
//   }, [token, user, expiresAt, derived.userWithProfile, logout]);

//   const login = useCallback(({ token: t, user: u }) => {
//     const exp = makeExpiresAt();
//     const requireLoc = String(import.meta.env.VITE_REQUIRE_LOC_CONFIRM || "").toLowerCase() === "true";
//     const role = canonicalizeRole(u?.role);

//     const emailVerified = 
//       typeof u?.email_verified === "boolean" 
//         ? u.email_verified 
//         : typeof u?.isVerified === "boolean"
//         ? u.isVerified
//         : Boolean(u?.email_verified_at);

//     const userWithFlags = {
//       ...u,
//       role,
//       email_verified: emailVerified,
//       requiresLocationConfirmation: u?.requiresLocationConfirmation ?? requireLoc,
//     };

//     const finalUser = {
//       ...userWithFlags,
//       profile_complete: u?.profile_complete ?? computeProfileComplete(userWithFlags),
//     };

//     setToken(t);
//     _setUser(finalUser);
//     setExpiresAt(exp);
//   }, []);

//   const value = useMemo(() => {
//     const activeUser = derived.userWithProfile ?? user;
//     return {
//       token,
//       user: activeUser,
//       expiresAt,
//       isAuthenticated: Boolean(token && activeUser),
//       role: activeUser?.role ?? null,
//       emailVerified: derived.emailVerified,
//       profileComplete: derived.profileComplete,
//       missingProfileFields: derived.missingProfileFields,
//       requiresLocationConfirmation: derived.requiresLocationConfirmation,
//       setRequiresLocationConfirmation,
//       setEmailVerified,
//       completeStepLocally, // أضفناها هنا لتكون متاحة لكل الصفحات
//       isHydrating,
//       loading: isHydrating,
//       ready: !isHydrating,
//       login,
//       logout,
//       setUser,
//     };
//   }, [token, user, expiresAt, isHydrating, derived, login, logout, setUser, setRequiresLocationConfirmation, setEmailVerified, completeStepLocally]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

// /* eslint-disable react-refresh/only-export-components */
// // filepath: src/features/auth/context/AuthContext.jsx
// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import {
//   clearAuth,
//   ensureExpiresAt,
//   isSessionExpired,
//   loadAuth,
//   makeExpiresAt,
//   saveAuth,
// } from "../utils/authSession";

// import { canonicalizeRole } from "./auth.roles";
// import {
//   computeMissingProfileFields,
//   computeProfileComplete,
// } from "./auth.profile";

// /*
//   AuthContext: Global state for user session and profile status.
// */
// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   // Load initial session from localStorage
//   const initial = loadAuth();

//   const [token, setToken] = useState(initial?.token ?? null);
//   const [user, _setUser] = useState(initial?.user ?? null);
//   const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? null);
//   const [isHydrating, setIsHydrating] = useState(true);

//   /*
//     Derived Data: Computes profile and verification flags 
//     automatically whenever the user state changes.
//   */
//   const derived = useMemo(() => {
//     if (!user) {
//       return {
//         userWithProfile: null,
//         missingProfileFields: [],
//         profileComplete: false,
//         requiresLocationConfirmation: false,
//         emailVerified: false,
//       };
//     }

//     const role = canonicalizeRole(user?.role);

//     // Normalize email verification from multiple backend formats
//     // Added support for 'isVerified' as an alias used in some OAuth responses
//     const emailVerified =
//       typeof user?.email_verified === "boolean"
//         ? user.email_verified
//         : typeof user?.isVerified === "boolean"
//         ? user.isVerified
//         : Boolean(user?.email_verified_at);

//     const userWithProfile = {
//       ...user,
//       role,
//       email_verified: emailVerified,
//       requiresLocationConfirmation: Boolean(user?.requiresLocationConfirmation),
//       // Determine if the user has finished setting up their profile
//       profile_complete:
//         typeof user?.profile_complete === "boolean"
//           ? user.profile_complete
//           : computeProfileComplete({ ...user, role }),
//     };

//     return {
//       userWithProfile,
//       missingProfileFields: computeMissingProfileFields(userWithProfile),
//       profileComplete: Boolean(userWithProfile.profile_complete),
//       requiresLocationConfirmation: Boolean(userWithProfile.requiresLocationConfirmation),
//       emailVerified,
//     };
//   }, [user]);

//   /*
//     logout: Clears all local state and storage.
//   */
//   const logout = useCallback(() => {
//     setToken(null);
//     _setUser(null);
//     setExpiresAt(null);
//     clearAuth();
//   }, []);

//   /**
//    * setUser: Updates user data and ensures roles are formatted correctly.
//    */
//   const setUser = useCallback((next) => {
//     _setUser((prev) => {
//       const resolved = typeof next === "function" ? next(prev) : next;
//       if (!resolved) return null;
//       return {
//         ...resolved,
//         role: canonicalizeRole(resolved?.role),
//       };
//     });
//   }, []);

//   /**
//    * Update specific flags like location or email verification.
//    */
//   const setRequiresLocationConfirmation = useCallback((flag) => {
//     setUser((prev) => ({ ...prev, requiresLocationConfirmation: Boolean(flag) }));
//   }, [setUser]);

//   const setEmailVerified = useCallback((flag) => {
//     setUser((prev) => ({
//       ...prev,
//       email_verified: Boolean(flag),
//       email_verified_at: flag ? (prev?.email_verified_at || new Date().toISOString()) : null,
//     }));
//   }, [setUser]);

//   /**
//    * Hydration: Validate session on app startup.
//    */
//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     if (token && !user) logout();
//     setIsHydrating(false);
//   }, [token, user, logout]);

//   /**
//    * Persistence: Syncs state to localStorage and monitors session expiry.
//    */
//   useEffect(() => {
//     if (!token || !user) {
//       clearAuth();
//       return;
//     }

//     const exp = ensureExpiresAt(expiresAt);
//     if (isSessionExpired(exp)) {
//       // eslint-disable-next-line react-hooks/set-state-in-effect
//       logout();
//       return;
//     }

//     if (!expiresAt) setExpiresAt(exp);

//     // Save current session data to storage
//     saveAuth({ token, user: derived.userWithProfile || user, expiresAt: exp });
//   }, [token, user, expiresAt, derived.userWithProfile, logout]);

//   /*
//     login: Sets up a new session after successful authentication.
//   */
//   const login = useCallback(({ token: t, user: u }) => {
//     const exp = makeExpiresAt();
//     const requireLoc = String(import.meta.env.VITE_REQUIRE_LOC_CONFIRM || "").toLowerCase() === "true";
//     const role = canonicalizeRole(u?.role);

//     // Ensure we capture verification status correctly during login
//     const emailVerified = 
//       typeof u?.email_verified === "boolean" 
//         ? u.email_verified 
//         : typeof u?.isVerified === "boolean"
//         ? u.isVerified
//         : Boolean(u?.email_verified_at);

//     const userWithFlags = {
//       ...u,
//       role,
//       email_verified: emailVerified,
//       requiresLocationConfirmation: u?.requiresLocationConfirmation ?? requireLoc,
//     };

//     const finalUser = {
//       ...userWithFlags,
//       profile_complete: u?.profile_complete ?? computeProfileComplete(userWithFlags),
//     };

//     setToken(t);
//     _setUser(finalUser);
//     setExpiresAt(exp);
//   }, []);

//   /*
//     Context Value: Exposed to the entire app via useAuth.
//   */
//   const value = useMemo(() => {
//     const activeUser = derived.userWithProfile ?? user;
//     return {
//       token,
//       user: activeUser,
//       expiresAt,
//       isAuthenticated: Boolean(token && activeUser),
//       role: activeUser?.role ?? null,
//       emailVerified: derived.emailVerified,
//       profileComplete: derived.profileComplete,
//       missingProfileFields: derived.missingProfileFields,
//       requiresLocationConfirmation: derived.requiresLocationConfirmation,
//       setRequiresLocationConfirmation,
//       setEmailVerified,
//       isHydrating,
//       loading: isHydrating,
//       ready: !isHydrating,
//       login,
//       logout,
//       setUser,
//     };
//   }, [token, user, expiresAt, isHydrating, derived, login, logout, setUser, setRequiresLocationConfirmation, setEmailVerified]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// /*
//   useAuth hook: Provides easy access to authentication state.
// */
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }