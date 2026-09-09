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

// ── Auth & Profile (Tera purana wala - same) ────────────────────
export const getProfile = async () => {
  const response = await api.get("auth/profile/");
  const user = response.data?.user || response.data?.profile || response.data;
  if (user) saveUser(user);
  return response.data;
};

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

export const changePassword = async (data) => {
  const response = await api.post("auth/change-password/", data);
  return response.data;
};

// ── Addresses (Tera purana wala) ─────────────────────────────────
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

// ── Wishlist (Tera purana wala) ──────────────────────────────────
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

// ── Orders & Returns (NEW - Amazon Working) ──────────────────────
export const getMyOrders = async () => {
  const response = await api.get("orders/my-orders/");
  return response.data;
};

export const getOrderDetail = async (id) => {
  const response = await api.get(`orders/${id}/`);
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.post(`orders/${id}/cancel/`);
  return response.data;
};

export const getMyReturns = async () => {
  const response = await api.get("orders/returns/");
  return response.data;
};

export const requestReturn = async (orderId, data) => {
  // data = { item, reason, description }
  const response = await api.post(`orders/${orderId}/return/`, data);
  return response.data;
};

export const getReturnDetail = async (returnId) => {
  const response = await api.get(`orders/returns/${returnId}/`);
  return response.data;
};