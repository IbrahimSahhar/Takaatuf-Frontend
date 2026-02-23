// filepath: src/services/api/real.js
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

/**
 * دالة مساعدة لتوحيد شكل الرد ومعالجة الأخطاء
 */
async function safe(promise) {
  try {
    const res = await promise;
    // استخراج البيانات مع دعم المستويات المختلفة للـ JSON
    const data = res.data;
    return {
      ok: true,
      data: data,
      user: data?.user ?? data?.data?.user,
      token: data?.token ?? data?.data?.token,
      role: data?.role ?? data?.user?.role, // استخراج الدور مباشرة لدعم منطق البروفايل الجديد
    };
  } catch (err) {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Network error. Please try again.";

    return {
      ok: false,
      status,
      error: msg,
    };
  }
}

export const realApi = {
  /* ---------- Auth ---------- */
  loginEmail(payload) {
    return safe(apiClient.post(ENDPOINTS.LOGIN_EMAIL, payload));
  },

  register(payload) {
    return safe(apiClient.post(ENDPOINTS.REGISTER, payload));
  },

  resendVerificationEmail(payload) {
    return safe(apiClient.post(ENDPOINTS.RESEND_VERIFICATION, payload));
  },

  me() {
    return safe(apiClient.get(ENDPOINTS.ME));
  },

  logout() {
    return safe(apiClient.post(ENDPOINTS.LOGOUT));
  },

  /* ---------- OAuth ---------- */
  oauthRedirectUrl(provider, returnUrl) {
    const url = new URL(
      ENDPOINTS.OAUTH_REDIRECT(provider),
      apiClient.defaults.baseURL
    );
    if (returnUrl) url.searchParams.set("returnUrl", returnUrl);
    return url.toString();
  },

  verifyOAuth(provider, searchParams) {
    return safe(
      apiClient.get(`${ENDPOINTS.OAUTH_VERIFY(provider)}${searchParams}`)
    );
  },

  completeOAuthEmail(payload) {
    return safe(apiClient.post(ENDPOINTS.UPDATE_OAUTH_EMAIL, payload));
  },

  /* ---------- Profile ---------- */
  getProfile() {
    return safe(apiClient.get(ENDPOINTS.GET_PROFILE));
  },

  updateProfile(payload) {
    return safe(apiClient.put(ENDPOINTS.UPDATE_PROFILE, payload));
  },

  /**
   * إكمال البروفايل:
   * المرحلة 1: ترسل name و city_neighborhood وترجع الـ role المكتشف.
   * المرحلة 2: ترسل كامل البيانات مع wallet أو paypal والدور.
   */
  completeProfile(payload) {
    return safe(apiClient.post(ENDPOINTS.COMPLETE_PROFILE, payload));
  },

  /* ---------- Location ---------- */
  locationLookup() {
    return safe(apiClient.get(ENDPOINTS.LOCATION_LOOKUP));
  },

  /**
   * تأكيد الموقع يدوياً:
   * ترسل choice (IN_GAZA / OUTSIDE) ليتحدد الدور بناءً عليها.
   */
  confirmLocation(choice, meta = {}) {
    // نرسل الـ choice للباك إند كما هو متوقع في المنطق الجديد
    return safe(
      apiClient.post(ENDPOINTS.CONFIRM_LOCATION, { choice, ...meta })
    );
  },
};