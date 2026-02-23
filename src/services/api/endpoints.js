// filepath: src/services/api/endpoints.js
export const ENDPOINTS = Object.freeze({
  /* --- Auth & Registration --- */
  REGISTER: "/auth/register",
  LOGIN_EMAIL: "/auth/login",
  RESEND_VERIFICATION: "/auth/resend-verification",
  LOGOUT: "/auth/logout",
  ME: "/me",

  /* --- OAuth (Google & Facebook) --- */
  // الرابط اللي بيودي المستخدم لعند جوجل أو فيسبوك في البداية
  OAUTH_REDIRECT: (provider) => `/oauth/${provider}/redirect`,

  // الرابط اللي بنبعث عليه الـ (Code) عشان نستلم الـ JSON المتفق عليه
  // عدلت الاسم ليكون OAUTH_VERIFY ليتماشى مع منطق التحقق من الكود
  OAUTH_VERIFY: (provider) => `/oauth/${provider}/callback`,
  UPDATE_OAUTH_EMAIL: "/auth/oauth/update-email", // الرابط الذي سيستقبل الإيميل الجديد

  /* --- Profile & Onboarding --- */
  GET_PROFILE: "/profile",
  UPDATE_PROFILE: "/profile", // لتعديل البيانات العامة
  COMPLETE_PROFILE: "/profile/complete", // لإرسال (المحفظة + الموقع) لأول مرة

  // رابط لجلب قائمة المهن أو التصنيفات (مهم لصفحة إكمال الملف)
  GET_CATEGORIES: "/categories",

  /* --- Location Services --- */
  LOCATION_LOOKUP: "/location/lookup",
  CONFIRM_LOCATION: "/location/confirm",

  /* --- Knowledge Requests (KRS) --- */
  GET_REQUESTS: "/requests",
  CREATE_REQUEST: "/requests",
  GET_REQUEST_DETAILS: (id) => `/requests/${id}`,
});
