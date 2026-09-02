import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const saveUser = (data) => {
  const user = data?.user || data?.profile || data;
  if (user && typeof user === "object") {
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
    })();
    const merged = { ...existing, ...user };
    localStorage.setItem("user", JSON.stringify(merged));
    window.dispatchEvent(new Event("auth-change"));
  }
  return user;
};

// ── Get Profile ──────────────────────────────────────────────────
// EXACT same API as yours - no change
export const getProfile = async () => {
  const response = await api.get("auth/profile/");
  const user = response.data?.user || response.data?.profile || response.data;
  if (user) saveUser(user);
  return response.data;
};

// ── Extra - Flipkart My Account 11/10 ────────────────────────────
export const updateProfile = async (profileData) => {
  if (!profileData || typeof profileData !== "object") throw new Error("Invalid profile data.");
  const response = await api.patch("auth/profile/", profileData);
  saveUser(response.data);
  return response.data;
};

export const updateAvatar = async (file) => {
  if (!file) throw new Error("Avatar file required.");
  const fd = new FormData();
  fd.append("avatar", file);
  const response = await api.patch("auth/profile/avatar/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  saveUser(response.data);
  return response.data;
};

export const getAddresses = async () => {
  const response = await api.get("auth/addresses/");
  return response.data;
};

export const addAddress = async (data) => {
  const response = await api.post("auth/addresses/", data);
  return response.data;
};

export const updateAddress = async (id, data) => {
  const response = await api.put(`auth/addresses/${Number(id)}/`, data);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`auth/addresses/${Number(id)}/`);
  return response.data;
};

export const getWishlist = async () => {
  const response = await api.get("wishlist/");
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post("wishlist/", { product: Number(productId) });
  window.dispatchEvent(new Event("wishlist-change"));
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`wishlist/${Number(productId)}/`);
  window.dispatchEvent(new Event("wishlist-change"));
  return response.data;
};