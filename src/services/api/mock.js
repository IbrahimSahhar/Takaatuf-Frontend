// filepath: src/services/api/mock.js
import { ENDPOINTS } from "./endpoints"; 

/* Storage keys */
const USERS_KEY = "takaatuf_users";
const CURRENT_USER_KEY = "takaatuf_current_user";
const TOKEN_KEY = "token"; 
const SESSION_KEY = "takaatuf_auth";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const normalizeRole = (role) => {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "kp" || r === "knowledge_provider") return "kp";
  if (r === "kr" || r === "requester" || r === "user") return "kr";
  return r;
};

const makeUserKey = (email, provider = "email") =>
  `${provider}:${String(email || "").toLowerCase()}`;

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveCurrentUserKey(key) {
  localStorage.setItem(CURRENT_USER_KEY, key);
}

function getCurrentUser() {
  const users = loadUsers();
  const key = localStorage.getItem(CURRENT_USER_KEY);
  if (!key) return null;
  return users[key] || null;
}

function persistAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  const ttl = 365 * 24 * 60 * 60 * 1000;
  const expiresAt = Date.now() + ttl;
  const authData = { token, user, expiresAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(authData));
}

export const mockApi = {
  /* ---------- Auth ---------- */
  // filepath: src/services/api/mock.js

  async loginEmail(payload) {
    await wait(600); // محاكاة وقت فحص السيرفر
    const email = String(payload?.email || "").trim().toLowerCase();
    const users = loadUsers();
    const key = makeUserKey(email, "email");

    // 1. استثناء للأدمن (دخول مباشر للـ Admin لتسهيل العمل)
    if (email === "admin@test.com") {
      const adminUser = {
        id: "admin-id",
        provider: "email",
        email: "admin@test.com",
        name: "Admin User",
        role: "admin", 
        email_verified: true,
        profile_complete: true,
      };
      const token = "admin-token-direct";
      persistAuth(token, adminUser);
      saveCurrentUserKey(key); // حفظ المفتاح لضمان بقاء الجلسة
      return { ok: true, token, user: adminUser };
    }

    // 2. الفحص الطبيعي للمستخدمين الآخرين
    const existingUser = users[key];

    if (!existingUser) {
      // إذا لم يجد الإيميل في التخزين، يرجع خطأ ولا ينشئ حساباً جديداً
      return { 
        ok: false, 
        error: "This account does not exist. Please check your details or create a new account.",
        status: 401 
      };
    }

    // 3. إذا وجده، يسجل دخوله ببياناته الأصلية المخزنة (سواء كان مؤكداً أم لا)
    saveCurrentUserKey(key);
    const token = "mock-token-" + existingUser.id;
    persistAuth(token, existingUser);
    
    return { ok: true, token, user: existingUser };
  },
  // async loginEmail(payload) {
  //   await wait(400);
  //   const email = String(payload?.email || "").trim().toLowerCase();
  //   const users = loadUsers();
  //   const key = makeUserKey(email, "email");
  //   if (email === "admin@test.com") {
  //     const adminUser = {
  //       id: "admin-id",
  //       provider: "email",
  //       email: "admin@test.com",
  //       name: "Admin User",
  //       role: "admin", // تأكد أنها admin
  //       email_verified: true,
  //       profile_complete: true,
  //     };
  //     const token = "admin-token";
  //     persistAuth(token, adminUser);
  //     return { ok: true, token, user: adminUser };
  //   }

  //   if (!users[key]) {
  //     users[key] = {
  //       id: `mock-${Math.random().toString(16).slice(2)}`,
  //       provider: "email",
  //       email,
  //       name: payload.name || "New User",
  //       role: "kr",
  //       email_verified: false,
  //       profile_complete: false,
  //     };
  //     saveUsers(users);
  //   }
    
  //   saveCurrentUserKey(key);
  //   const token = "mock-token-123";
  //   persistAuth(token, users[key]);
  //   return { ok: true, token, user: users[key] };
  // },

  async register(payload) {
    await wait(300);
    const email = String(payload?.email || "").trim().toLowerCase();
    const users = loadUsers();
    const key = makeUserKey(email, "email");

    if (users[key]) return { ok: false, error: "Email already exists", status: 409 };

    const newUser = {
      id: `mock-${Date.now()}`,
      email,
      name: payload.name,
      role: "kr",
      email_verified: false, // يبدأ غير مفعّل
      profile_complete: false,
    };

    users[key] = newUser;
    saveUsers(users);
    saveCurrentUserKey(key);
    
    const token = "mock-reg-token-" + Date.now();
    persistAuth(token, newUser);
    
    // التعديل: نرجع الـ token مع الـ user لضمان نجاح دالة login في الـ AuthContext
    return { ok: true, token, user: newUser };
  },

  async me() {
    await wait(150);
    const user = getCurrentUser();
    if (!user) return { ok: false, error: "Unauthenticated", status: 401 };
    return { ok: true, user };
  },

  /* ---------- OAuth ---------- */
  oauthRedirectUrl(provider) {
    const baseUrl = window.location.origin; 
    return `${baseUrl}/auth/callback?code=mock_code&mock_provider=${provider}`;
  },

  async verifyOAuth(provider, searchParams) {
    await wait(1000); 
    const urlParams = new URLSearchParams(searchParams);
    const mockProvider = urlParams.get("mock_provider") || provider;

    let userObj;
    let needEmail = false;

    if (mockProvider === "facebook") {
      needEmail = true;
      userObj = {
        id: 24,
        name: "Nevin Shabat",
        email: null,
        email_verified: false,
        role: "kr",
        provider: "facebook",
        profile_complete: false
      };
    } else {
      userObj = {
        id: 9,
        name: "Nivin (Google Mock)",
        email: "nivin20012001@gmail.com",
        email_verified: true,
        role: "kr",
        provider: "google",
        profile_complete: false
      };
    }

    const token = "mock-oauth-token";
    persistAuth(token, userObj);

    if (userObj.email) {
      const key = makeUserKey(userObj.email, mockProvider);
      const users = loadUsers();
      users[key] = userObj;
      saveUsers(users);
      saveCurrentUserKey(key);
    }

    return { ok: true, token, user: userObj, needEmail, profile_complete: userObj.profile_complete };
  },

  async completeOAuthEmail(payload) {
    await wait(800);
    const users = loadUsers();
    const email = payload.email.toLowerCase();
    
    const updatedUser = {
      id: 24,
      name: "Nevin Shabat",
      email: email,
      email_verified: false, 
      role: "kr",
      provider: "facebook",
      profile_complete: false
    };

    const key = makeUserKey(email, "facebook");
    users[key] = updatedUser;
    saveUsers(users);
    saveCurrentUserKey(key);
    persistAuth("mock-token-fb-updated", updatedUser);

    return { ok: true, token: "mock-token-fb-updated", user: updatedUser, profile_complete: false };
  },

  async resendVerificationEmail(payload) {
    await wait(500);
    return { ok: true, message: "Mock: Verification email sent to " + payload.email };
  },

  /* ---------- Profile ---------- */
  async completeProfile(payload) {
    await wait(600);
    const users = loadUsers();
    const key = localStorage.getItem(CURRENT_USER_KEY);
    if (!key) return { ok: false, error: "Session lost", status: 401 };

    const existing = users[key] || {};
    const updatedUser = {
      ...existing,
      ...payload,
      role: normalizeRole(payload?.role || existing?.role),
      profile_complete: true,
      email_verified: true, // في الموك: نعتبره مفعلاً بعد إكمال الملف
    };

    users[key] = updatedUser;
    saveUsers(users);
    persistAuth(localStorage.getItem(TOKEN_KEY), updatedUser);

    return { ok: true, user: updatedUser };
  },

  async getProfile() {
    await wait(200);
    const user = getCurrentUser();
    return user ? { ok: true, user } : { ok: false, status: 401 };
  },

  /* ---------- Location ---------- */
  async confirmLocation(choice) {
    await wait(400);
    const user = getCurrentUser();
    const newRole = choice === "IN_GAZA" ? "kp" : "kr";
    const updatedUser = { ...user, role: newRole };
    
    // تحديث المستخدم في الموك أيضاً
    const key = localStorage.getItem(CURRENT_USER_KEY);
    if (key) {
        const users = loadUsers();
        users[key] = updatedUser;
        saveUsers(users);
    }

    return { ok: true, role: newRole, user: updatedUser };
  },

  async locationLookup() {
    await wait(300);
    return { ok: true, status: "SUCCESS", country: "PS", city: "Gaza" };
  }
};

export default mockApi;
// // filepath: src/services/api/mock.js
// import { ENDPOINTS } from "./endpoints"; 

// /* Storage keys */
// const USERS_KEY = "takaatuf_users";
// const CURRENT_USER_KEY = "takaatuf_current_user";
// const TOKEN_KEY = "token"; 
// const SESSION_KEY = "takaatuf_auth";

// const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// const normalizeRole = (role) => {
//   const r = String(role || "").toLowerCase();
//   if (r === "admin") return "admin";
//   if (r === "kp" || r === "knowledge_provider") return "kp";
//   if (r === "kr" || r === "requester" || r === "user") return "kr";
//   return r;
// };

// const makeUserKey = (email, provider = "email") =>
//   `${provider}:${String(email || "").toLowerCase()}`;

// function loadUsers() {
//   try {
//     return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
//   } catch {
//     return {};
//   }
// }

// function saveUsers(users) {
//   localStorage.setItem(USERS_KEY, JSON.stringify(users));
// }

// function saveCurrentUserKey(key) {
//   localStorage.setItem(CURRENT_USER_KEY, key);
// }

// function getCurrentUser() {
//   const users = loadUsers();
//   const key = localStorage.getItem(CURRENT_USER_KEY);
//   if (!key) return null;
//   return users[key] || null;
// }

// // تحديث التخزين ليتوافق مع ما يتوقعه AuthContext
// function persistAuth(token, user) {
//   localStorage.setItem(TOKEN_KEY, token);
//   const ttl = 365 * 24 * 60 * 60 * 1000;
//   const expiresAt = Date.now() + ttl;
//   const authData = { token, user, expiresAt };
//   localStorage.setItem(SESSION_KEY, JSON.stringify(authData));
// }

// export const mockApi = {
//   /* ---------- Auth ---------- */
//   async loginEmail(payload) {
//     await wait(400);
//     const email = String(payload?.email || "").trim().toLowerCase();
//     const users = loadUsers();
//     const key = makeUserKey(email, "email");

//     if (!users[key]) {
//       // إنشاء مستخدم جديد إذا لم يكن موجوداً (للتسهيل في الموك)
//       users[key] = {
//         id: `mock-${Math.random().toString(16).slice(2)}`,
//         provider: "email",
//         email,
//         name: payload.name || "New User",
//         role: "kr",
//         email_verified: false, // يبدأ غير مفعل لتجربة الـ Flow
//         profile_complete: false,
//       };
//       saveUsers(users);
//     }
    
//     saveCurrentUserKey(key);
//     const token = "mock-token-123";
//     persistAuth(token, users[key]);
//     return { ok: true, token, user: users[key] };
//   },

//   async me() {
//     await wait(150);
//     const user = getCurrentUser();
//     if (!user) return { ok: false, error: "Unauthenticated", status: 401 };
//     return { ok: true, user };
//   },

//   /* ---------- OAuth (Facebook/Google) ---------- */
//   oauthRedirectUrl(provider) {
//     const baseUrl = window.location.origin; 
//     return `${baseUrl}/auth/callback?code=mock_code&mock_provider=${provider}`;
//   },

//   async verifyOAuth(provider, searchParams) {
//     await wait(1000); 
//     const urlParams = new URLSearchParams(searchParams);
//     const mockProvider = urlParams.get("mock_provider") || provider;

//     let userObj;
//     let needEmail = false;

//     if (mockProvider === "facebook") {
//       needEmail = true;
//       userObj = {
//         id: 24,
//         name: "Nevin Shabat",
//         email: null,
//         email_verified: false,
//         role: null,
//         provider: "facebook",
//         profile_complete: false
//       };
//     } else {
//       userObj = {
//         id: 9,
//         name: "Nivin (Google Mock)",
//         email: "nivin20012001@gmail.com",
//         email_verified: true,
//         role: "kr",
//         provider: "google",
//         profile_complete: false
//       };
//     }

//     const token = "mock-oauth-token";
//     persistAuth(token, userObj);

//     if (userObj.email) {
//       const key = makeUserKey(userObj.email, mockProvider);
//       const users = loadUsers();
//       users[key] = userObj;
//       saveUsers(users);
//       saveCurrentUserKey(key);
//     }

//     return { ok: true, token, user: userObj, needEmail, profile_complete: userObj.profile_complete };
//   },

//   async completeOAuthEmail(payload) {
//     await wait(800);
//     const users = loadUsers();
//     const email = payload.email.toLowerCase();
    
//     const updatedUser = {
//       id: 24,
//       name: "Nevin Shabat",
//       email: email,
//       email_verified: false, // يحتاج تفعيل بعد إضافة الإيميل
//       role: "kr",
//       provider: "facebook",
//       profile_complete: false
//     };

//     const key = makeUserKey(email, "facebook");
//     users[key] = updatedUser;
//     saveUsers(users);
//     saveCurrentUserKey(key);
//     persistAuth("mock-token-fb-updated", updatedUser);

//     return { ok: true, user: updatedUser, profile_complete: false };
//   },

//   async register(payload) {
//     await wait(300);
//     const email = String(payload?.email || "").trim().toLowerCase();
//     const users = loadUsers();
//     const key = makeUserKey(email, "email");

//     if (users[key]) return { ok: false, error: "Email already exists", status: 409 };

//     const newUser = {
//       id: `mock-${Date.now()}`,
//       email,
//       name: payload.name,
//       role: "kr",
//       email_verified: false,
//       profile_complete: false,
//     };

//     users[key] = newUser;
//     saveUsers(users);
//     saveCurrentUserKey(key);
//     persistAuth("mock-reg-token", newUser);
//     return { ok: true, user: newUser };
//   },

//   // مطابقة الاسم المستدعى في صفحة CheckEmailPage
//   async resendVerificationEmail(payload) {
//     await wait(500);
//     return { ok: true, message: "Mock: Verification email sent to " + payload.email };
//   },

//   /* ---------- Profile ---------- */
//   async completeProfile(payload) {
//     await wait(600);
//     const users = loadUsers();
//     const key = localStorage.getItem(CURRENT_USER_KEY);
//     if (!key) return { ok: false, error: "Session lost", status: 401 };

//     const existing = users[key] || {};
//     const updatedUser = {
//       ...existing,
//       ...payload,
//       role: normalizeRole(payload?.role || existing?.role),
//       profile_complete: true,
//       email_verified: true, // في الموك، نعتبره مفعلاً بمجرد إكمال البروفايل لضمان كسر اللوب
//     };

//     users[key] = updatedUser;
//     saveUsers(users);
//     persistAuth(localStorage.getItem(TOKEN_KEY), updatedUser);

//     return { ok: true, user: updatedUser };
//   },

//   async getProfile() {
//     await wait(200);
//     const user = getCurrentUser();
//     return user ? { ok: true, user } : { ok: false, status: 401 };
//   },

//   /* ---------- Location ---------- */
//   async confirmLocation(choice) {
//     await wait(400);
//     const user = getCurrentUser();
//     // محاكاة تغيير الدور بناءً على الموقع
//     const newRole = choice === "IN_GAZA" ? "kp" : "kr";
//     return { ok: true, role: newRole, user: { ...user, role: newRole } };
//   },

//   async locationLookup() {
//     await wait(300);
//     return { ok: true, status: "SUCCESS", country: "PS", city: "Gaza" };
//   }
// };

// export default mockApi;


// // filepath: src/services/api/mock.js
// import { ENDPOINTS } from "./endpoints"; 

// /* Storage keys */
// const USERS_KEY = "takaatuf_users";
// const CURRENT_USER_KEY = "takaatuf_current_user";
// const TOKEN_KEY = "token"; 
// const SESSION_KEY = "takaatuf_auth";

// const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// const normalizeRole = (role) => {
//   const r = String(role || "").toLowerCase();
//   if (r === "admin") return "admin";
//   if (r === "kp" || r === "knowledge_provider") return "kp";
//   if (r === "kr" || r === "requester" || r === "user") return "kr";
//   return r;
// };

// const makeUserKey = (email, provider = "email") =>
//   `${provider}:${String(email || "").toLowerCase()}`;

// function loadUsers() {
//   try {
//     return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
//   } catch {
//     return {};
//   }
// }

// function saveUsers(users) {
//   localStorage.setItem(USERS_KEY, JSON.stringify(users));
// }

// function saveCurrentUserKey(key) {
//   localStorage.setItem(CURRENT_USER_KEY, key);
// }

// function getCurrentUser() {
//   const users = loadUsers();
//   const key = localStorage.getItem(CURRENT_USER_KEY);
//   if (!key) return null;
//   return users[key] || null;
// }

// function persistAuth(token, user) {
//   localStorage.setItem(TOKEN_KEY, token);
//   try {
//     const ttl = 365 * 24 * 60 * 60 * 1000;
//     const expiresAt = Date.now() + ttl;
//     localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user, expiresAt }));
//   } catch { /* empty */ }
// }

// function ensureSeedUser() {
//   const users = loadUsers();
//   const email = "test@takaatuf.com";
//   const key = makeUserKey(email, "email");

//   if (!users[key]) {
//     users[key] = {
//       id: "mock-1",
//       provider: "email",
//       email,
//       name: "Test User",
//       role: "kr",
//       email_verified: true,
//       profile_complete: true,
//       requiresLocationConfirmation: false,
//       city: "Gaza",
//       neighborhood: "Unknown",
//     };
//     saveUsers(users);
//   }

//   saveCurrentUserKey(key);
//   return users[key];
// }

// export const mockApi = {
//   /* ---------- Auth ---------- */
//   async loginEmail(payload) {
//     await wait(250);
//     const email = String(payload?.email || "").trim().toLowerCase();
//     const password = String(payload?.password || "");
//     const seed = ensureSeedUser();

//     if (email === seed.email) {
//       if (password.length < 1) {
//         return { ok: false, error: "Invalid email or password.", status: 422 };
//       }
//       const token = "mock-token";
//       persistAuth(token, seed);
//       return { ok: true, token, user: seed };
//     }

//     const users = loadUsers();
//     const key = makeUserKey(email, "email");
//     if (!users[key]) {
//       users[key] = {
//         id: `mock-${Math.random().toString(16).slice(2)}`,
//         provider: "email",
//         email,
//         name: "New User",
//         role: "admin",
//         email_verified: true,
//         profile_complete: true,
//         requiresLocationConfirmation: false,
//       };
//       saveUsers(users);
//     }
//     saveCurrentUserKey(key);

//     const token = "mock-token";
//     persistAuth(token, users[key]);
//     return { ok: true, token, user: users[key] };
//   },

//   async me() {
//     await wait(150);
//     const user = getCurrentUser();
//     if (!user) return { ok: false, error: "Unauthenticated", status: 401 };
//     return { ok: true, user };
//   },

//   /* ---------- OAuth (Updated Mock) ---------- */
  
//   // eslint-disable-next-line no-unused-vars
//   oauthRedirectUrl(provider, returnUrl) {
//     const baseUrl = window.location.origin; 
//     // نضيف الـ provider للرابط عشان الموك يعرف أي حالة يشغل
//     return `${baseUrl}/auth/callback?code=mock_code_123&state=mock_state&mock_provider=${provider}`;
//   },

//   async verifyOAuth(provider, searchParams) {
//     await wait(1000); 
//     const urlParams = new URLSearchParams(searchParams);
//     const mockProvider = urlParams.get("mock_provider") || provider;

//     let mockData;

//     // حالة الفيسبوك (سيناريو نقص الإيميل)
//     if (mockProvider === "facebook") {
//       mockData = {
//         status: "success",
//         needEmail: true,
//         message: "Please enter your email to complete login",
//         token: "109|mock_fb_token_4F4pHNCBu7oet4v",
//         profile_completed: false,
//         return_url: "/update-email",
//         user: {
//           id: 24,
//           name: "Nevin Shabat",
//           email: null, // الإيميل مفقود كما في الصورة
//           email_verified: false,
//           avatar: null,
//           role: null,
//           provider: "facebook",
//           provider_id: "4215913371980077"
//         }
//       };
//     } 
//     // حالة جوجل (السيناريو الطبيعي)
//     else {
//       mockData = {
//         token: "78|mock_token_google_UiKFR7ZiKVF2BTl",
//         needEmail: false,
//         profile_completed: false,
//         user: {
//           id: 9,
//           name: "نيفين شبات (تجريبي)",
//           email: "nivin20012001@gmail.com",
//           email_verified: true,
//           avatar: "https://ui-avatars.com/api/?name=Nivin+Shabat&background=random", 
//           role: "KR"
//         },
//         returnUrl: "/dashboard"
//       };
//     }

//     persistAuth(mockData.token, mockData.user);
    
//     // إذا كان هناك إيميل، نحفظه في اليوزرز
//     if (mockData.user.email) {
//       const key = makeUserKey(mockData.user.email, mockProvider);
//       const users = loadUsers();
//       users[key] = { ...mockData.user, profile_complete: mockData.profile_completed };
//       saveUsers(users);
//       saveCurrentUserKey(key);
//     }

//     return { ok: true, ...mockData };
//   },

//   // الدالة الجديدة لإكمال إرسال الإيميل (فيسبوك)
//   async completeOAuthEmail(payload) {
//     await wait(800);
    
//     // محاكاة البيانات الكاملة التي تعود بعد إدخال الإيميل
//     const updatedUser = {
//       id: 24,
//       name: "Nevin Shabat",
//       email: payload.email,
//       email_verified: false,
//       avatar: null,
//       role: "KR", // نعطيه دور افتراضي
//       profile_complete: false // كما قلت، بديهي يكون لسه مش مكمل بروفايله
//     };

//     const token = localStorage.getItem(TOKEN_KEY) || "mock_token_updated";
//     persistAuth(token, updatedUser);

//     return { 
//       ok: true, 
//       user: updatedUser, 
//       profile_completed: false,
//       message: "Email updated successfully" 
//     };
//   },

//   /* ---------- Remaining Auth ---------- */

//   async register(payload) {
//     await wait(300);
//     const email = String(payload?.email || "").trim().toLowerCase();
//     const name = String(payload?.name || "").trim();
//     if (!email || !name) return { ok: false, error: "Invalid input", status: 422 };
//     const users = loadUsers();
//     const key = makeUserKey(email, "email");
//     if (users[key]) return { ok: false, error: "Email already in use.", status: 409 };
//     users[key] = {
//       id: `mock-${Math.random().toString(16).slice(2)}`,
//       provider: "email",
//       email,
//       name: name,
//       role: "kr",
//       email_verified: false,
//       profile_complete: false,
//       requiresLocationConfirmation: false,
//     };
//     saveUsers(users);
//     saveCurrentUserKey(key);
//     return { ok: true, message: "Registered. Verification email sent (mock)." };
//   },

//   async resendVerification() {
//     await wait(250);
//     return { ok: true, message: "Verification email resent (mock)." };
//   },

//   /* ---------- Profile ---------- */
//   async getProfile() {
//     await wait(150);
//     const user = getCurrentUser();
//     if (!user) return { ok: false, error: "Unauthenticated", status: 401 };
//     return { ok: true, user };
//   },

//   async updateProfile(payload) {
//     await wait(250);
//     const users = loadUsers();
//     const key = localStorage.getItem(CURRENT_USER_KEY);
//     if (!key) return { ok: false, error: "Unauthenticated", status: 401 };
//     const existing = users[key] || {};
//     const updated = { ...existing, ...payload };
//     users[key] = updated;
//     saveUsers(users);
//     return { ok: true, user: updated };
//   },

//   async completeProfile(payload) {
//     await wait(250);
//     const users = loadUsers();
//     const key =
//       payload?.email
//         ? makeUserKey(payload.email, payload.provider || "email")
//         : localStorage.getItem(CURRENT_USER_KEY);
//     if (!key) return { ok: false, error: "Unauthenticated", status: 401 };
//     const existing = users[key] || {};
//     const updatedUser = {
//       ...existing,
//       ...payload,
//       role: normalizeRole(payload?.role || existing?.role),
//       profile_complete: true,
//     };
//     users[key] = updatedUser;
//     saveUsers(users);
//     saveCurrentUserKey(key);
//     const token = localStorage.getItem(TOKEN_KEY) || "mock-token";
//     persistAuth(token, updatedUser);
//     return { ok: true, user: updatedUser };
//   },

//   /* ---------- Location ---------- */
//   async confirmLocation(choice, meta = {}) {
//     await wait(200);
//     if (!choice) return { ok: false, error: "Missing choice", status: 422 };
//     const user = getCurrentUser();
//     return { ok: true, user, meta };
//   },

//   async locationLookup() {
//     await wait(120);
//     return { ok: true, location: "unknown" };
//   },
// };
