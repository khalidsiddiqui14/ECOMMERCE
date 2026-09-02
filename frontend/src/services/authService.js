import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const normalizeEmail = (v) => String(v || "").trim().toLowerCase();
const normalizePhone = (v) => String(v || "").trim().replace(/\s+/g, " ");

const saveAuthData = (data) => {
  // Support multiple backend response shapes
  const access =
    data?.access_token ||
    data?.access ||
    data?.tokens?.access ||
    data?.data?.access_token;
  const refresh =
    data?.refresh_token ||
    data?.refresh ||
    data?.tokens?.refresh ||
    data?.data?.refresh_token;
  const user =
    data?.user ||
    data?.data?.user ||
    data?.profile ||
    null;

  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
  if (user) localStorage.setItem("user", JSON.stringify(user));

  if (access) {
    window.dispatchEvent(new Event("auth-change"));
  }

  return { access, refresh, user, raw: data };
};

// ── Login ────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) throw new Error("Email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email.");
  if (!password) throw new Error("Password is required.");
  if (String(password).length < 6) throw new Error("Password must be at least 6 characters.");

  const response = await api.post("auth/login/", {
    email: cleanEmail,
    password,
  });

  const saved = saveAuthData(response.data);
  return { ...response.data, _saved: saved };
};

// ── Register ─────────────────────────────────────────────────────
export const registerUser = async (username, email, password, phone) => {
  const cleanUsername = String(username || "").trim();
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  if (!cleanUsername) throw new Error("Username is required.");
  if (cleanUsername.length < 3) throw new Error("Username must be at least 3 characters.");
  if (!cleanEmail) throw new Error("Email is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Please enter a valid email.");
  if (!password) throw new Error("Password is required.");
  if (String(password).length < 8) throw new Error("Password must be at least 8 characters.");
  if (!cleanPhone) throw new Error("Phone is required.");
  if (!/^[0-9+\-\s()]{7,20}$/.test(cleanPhone)) throw new Error("Please enter a valid phone number.");

  const response = await api.post("auth/register/", {
    username: cleanUsername,
    email: cleanEmail,
    password,
    phone: cleanPhone,
  });

  // Some backends auto-login on register
  if (response.data?.access_token || response.data?.access) {
    saveAuthData(response.data);
  }

  return response.data;
};

// ── Logout ───────────────────────────────────────────────────────
export const logoutUser = async () => {
  try {
    // Tell backend to blacklist refresh token (if API supports)
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      await api.post("auth/logout/", { refresh }).catch(() => {});
    }
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.Authorization;
    window.dispatchEvent(new Event("auth-change"));
  }
};

// ── Get Current User (refresh profile) ───────────────────────────
export const getCurrentUser = async () => {
  const response = await api.get("auth/me/");
  const user = response.data?.user || response.data;
  if (user) localStorage.setItem("user", JSON.stringify(user));
  return user;
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
  if (!password || String(password).length < 8) throw new Error("Password must be at least 8 characters.");
  const response = await api.post("auth/password/reset/", { token, password });
  return response.data;
};

// ── Change Password ──────────────────────────────────────────────
export const changePassword = async (oldPassword, newPassword) => {
  if (!oldPassword) throw new Error("Old password is required.");
  if (!newPassword || String(newPassword).length < 8) throw new Error("New password must be at least 8 characters.");
  const response = await api.post("auth/password/change/", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

// ── Verify helpers ───────────────────────────────────────────────
export const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;
  } catch {}
  return true;
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};