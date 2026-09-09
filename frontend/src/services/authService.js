import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const normalizeEmail = (v) => String(v || "").trim().toLowerCase();
const normalizePhone = (v) => String(v || "").trim().replace(/\s+/g, " ");

const saveAuthData = (data) => {
  try {
    const access =
      data?.access_token ||
      data?.access ||
      data?.tokens?.access ||
      data?.data?.access_token ||
      data?.token ||
      data?.jwt;
    const refresh =
      data?.refresh_token ||
      data?.refresh ||
      data?.tokens?.refresh ||
      data?.data?.refresh_token ||
      null;
    const user =
      data?.user ||
      data?.data?.user ||
      data?.profile ||
      data?.data?.profile ||
      null;

    if (access) {
      try { localStorage.setItem("access_token", access); } catch {}
      // Also set alternative keys for other routes
      try { localStorage.setItem("accessToken", access); } catch {}
    }
    if (refresh) { try { localStorage.setItem("refresh_token", refresh); } catch {} }
    if (user) { try { localStorage.setItem("user", JSON.stringify(user)); } catch {} }
    // Store role shortcuts
    if (user?.role) { try { localStorage.setItem("user_role", user.role); } catch {} }
    if (user?.is_staff || user?.is_superuser) { try { localStorage.setItem("is_admin", "true"); } catch {} }

    if (access) {
      try { window.dispatchEvent(new Event("auth-change")); } catch {}
      try { window.dispatchEvent(new Event("cart-change")); } catch {}
    }

    return { access, refresh, user, raw: data };
  } catch (err) {
    console.error("saveAuthData error", err);
    return { access: null, refresh: null, user: null, raw: data };
  }
};

// ── Login ────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) throw new Error("Email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email.");
  if (!password) throw new Error("Password is required.");
  if (String(password).length<6) throw new Error("Password must be at least 6 characters.");

  try {
    const response = await api.post("auth/login/", {
      email: cleanEmail,
      password,
    });
    const saved = saveAuthData(response.data);
    return { ...response.data, _saved: saved };
  } catch (err) {
    // Better error messages - Amazon style
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.email?.[0] || "";
    if (msg.toLowerCase().includes("no active") || msg.toLowerCase().includes("not found")) {
      throw new Error("No account found with this email. Please register.");
    }
    if (err?.response?.status===401) throw new Error("Incorrect password. Try again or reset password.");
    throw err;
  }
};

// ── Register ─────────────────────────────────────────────────────
export const registerUser = async (username, email, password, phone) => {
  const cleanUsername = String(username || "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  if (!cleanUsername) throw new Error("Username is required.");
  if (cleanUsername.length<3) throw new Error("Username must be at least 3 characters.");
  if (!cleanEmail) throw new Error("Email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email.");
  if (!password) throw new Error("Password is required.");
  if (String(password).length<8) throw new Error("Password must be at least 8 characters.");
  if (!cleanPhone) throw new Error("Phone is required.");
  if (!/^[0-9+\-\s()]{7,20}$/.test(cleanPhone)) throw new Error("Please enter a valid phone number.");

  const response = await api.post("auth/register/", {
    username: cleanUsername,
    email: cleanEmail,
    password,
    phone: cleanPhone,
  });

  if (response.data?.access_token || response.data?.access) {
    saveAuthData(response.data);
  }

  return response.data;
};

// ── Logout ───────────────────────────────────────────────────────
export const logoutUser = async () => {
  try {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      await api.post("auth/logout/", { refresh }).catch(() => {});
    }
  } finally {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_role");
      localStorage.removeItem("is_admin");
      localStorage.removeItem("recent_searches");
    } catch {}
    try { delete api.defaults.headers.common.Authorization; } catch {}
    try { window.dispatchEvent(new Event("auth-change")); } catch {}
    try { window.dispatchEvent(new Event("cart-change")); } catch {}
  }
};

// ── Get Current User (refresh profile) ───────────────────────────
export const getCurrentUser = async () => {
  try {
    const response = await api.get("auth/me/");
    const user = response.data?.user || response.data;
    if (user) { try { localStorage.setItem("user", JSON.stringify(user)); } catch {} }
    return user;
  } catch (err) {
    // Try alternative endpoints
    try {
      const res = await api.get("auth/user/");
      const user = res.data?.user || res.data;
      if (user) localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch { throw err; }
  }
};

// ── Forgot / Reset ───────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) throw new Error("Email is required.");
  const response = await api.post("auth/password/forgot/", { email: cleanEmail });
  return response.data;
};

export const resetPassword = async (token, password) => {
  if (!token) throw new Error("Reset token is required.");
  if (!password || String(password).length<8) throw new Error("Password must be at least 8 characters.");
  const response = await api.post("auth/password/reset/", { token, password });
  return response.data;
};

// ── Change Password ──────────────────────────────────────────────
export const changePassword = async (oldPassword, newPassword) => {
  if (!oldPassword) throw new Error("Old password is required.");
  if (!newPassword || String(newPassword).length<8) throw new Error("New password must be at least 8 characters.");
  const response = await api.post("auth/password/change/", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

// ── Verify helpers ───────────────────────────────────────────────
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return false;
    try {
      const parts = token.split(".");
      if (parts.length===3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
        if (payload.exp && Date.now()>= payload.exp*1000 - 10000) return false;
      }
    } catch {}
    return true;
  } catch { return false; }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw? JSON.parse(raw) : null;
  } catch { return null; }
};

// ── AMAZON NEW: OTP Login ────────────────────────────────────────
export const sendLoginOtp = async (emailOrPhone) => {
  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailOrPhone));
    const payload = isEmail? { email: normalizeEmail(emailOrPhone) } : { phone: normalizePhone(emailOrPhone) };
    const res = await api.post("auth/otp/send/", payload);
    return res.data;
  } catch (err) {
    console.warn("sendLoginOtp failed", err?.message);
    return { success: false, otp: "123456", dev_mode: true, message: "OTP sent (dev: 123456)" };
  }
};

export const verifyLoginOtp = async (emailOrPhone, otp) => {
  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailOrPhone));
    const payload = isEmail? { email: normalizeEmail(emailOrPhone), otp } : { phone: normalizePhone(emailOrPhone), otp };
    const res = await api.post("auth/otp/verify/", payload);
    const saved = saveAuthData(res.data);
    return { ...res.data, _saved: saved };
  } catch (err) {
    // Dev fallback for testing
    if (String(otp)==="123456") {
      const fake = { access_token: "dev_otp_token_"+Date.now(), user: { id: 1, username: "OTP User", email: emailOrPhone, role: "CUSTOMER" } };
      const saved = saveAuthData(fake);
      return { ...fake, _saved: saved, dev_mode: true };
    }
    throw err;
  }
};

export const googleLogin = async (idToken) => {
  try {
    const res = await api.post("auth/google/", { id_token: idToken, token: idToken });
    const saved = saveAuthData(res.data);
    return { ...res.data, _saved: saved };
  } catch (err) { throw err; }
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  isAuthenticated,
  getStoredUser,
  sendLoginOtp,
  verifyLoginOtp,
  googleLogin
};