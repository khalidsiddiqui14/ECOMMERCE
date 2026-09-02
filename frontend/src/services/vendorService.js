import api, { uploadWithProgress } from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "ID") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${name}.`);
  return n;
};

// ── Dashboard ────────────────────────────────────────────────────
export const getVendorDashboard = async (params = {}) => {
  const response = await api.get("orders/vendor-dashboard/", { params });
  return response.data;
};

export const getVendorStats = async () => {
  try {
    const response = await api.get("vendors/me/stats/");
    return response.data;
  } catch {
    const dash = await getVendorDashboard();
    return dash;
  }
};

// ── Vendor Profile ───────────────────────────────────────────────
export const getVendorProfile = async () => {
  const response = await api.get("vendors/me/");
  return response.data;
};

export const updateVendorProfile = async (profileData) => {
  if (!profileData || typeof profileData !== "object") throw new Error("Invalid profile data.");

  const isFormData = profileData instanceof FormData;
  const response = await api.patch("vendors/me/", profileData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

// ── Vendor Store ─────────────────────────────────────────────────
export const getVendorStore = async () => {
  const response = await api.get("stores/me/");
  return response.data;
};

export const updateVendorStore = async (storeData) => {
  if (!storeData || typeof storeData !== "object") throw new Error("Invalid store data.");

  const isFormData = storeData instanceof FormData;
  const response = await api.patch("stores/me/", storeData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

// ── Vendor Products ──────────────────────────────────────────────
export const getVendorProducts = async (params = {}) => {
  const response = await api.get("products/", { params: { vendor: "me", ...params } });
  return response.data;
};

export const getVendorProduct = async (productId) => {
  const pid = toId(productId, "product ID");
  const response = await api.get(`products/${pid}/`);
  return response.data;
};

export const createVendorProduct = async (productData) => {
  if (!productData) throw new Error("Product data required.");

  const isFormData = productData instanceof FormData;
  if (!isFormData) {
    if (!productData.name && !productData.title) throw new Error("Product name is required.");
  }

  const response = await api.post("products/", productData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const updateVendorProduct = async (productId, productData) => {
  const pid = toId(productId, "product ID");
  if (!productData) throw new Error("Product data required.");

  const isFormData = productData instanceof FormData;
  const response = await api.patch(`products/${pid}/`, productData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const deleteVendorProduct = async (productId) => {
  const pid = toId(productId, "product ID");
  const response = await api.delete(`products/${pid}/`);
  return response.data;
};

// ── Product Images (11/10 with progress) ─────────────────────────
export const uploadVendorProductImage = async (productId, imageData, onProgress) => {
  const pid = toId(productId, "product ID");
  if (!imageData) throw new Error("Image data required.");

  const formData = imageData instanceof FormData ? imageData : (() => {
    const fd = new FormData();
    if (imageData instanceof File) fd.append("image", imageData);
    else if (imageData.file) fd.append("image", imageData.file);
    else if (imageData.image) fd.append("image", imageData.image);
    else Object.entries(imageData).forEach(([k,v]) => fd.append(k,v));
    return fd;
  })();

  if (onProgress) {
    return uploadWithProgress(`products/${pid}/images/`, formData, onProgress);
  }

  const response = await api.post(`products/${pid}/images/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteVendorProductImage = async (productId, imageId) => {
  const pid = toId(productId, "product ID");
  const iid = toId(imageId, "image ID");
  const response = await api.delete(`products/${pid}/images/${iid}/`);
  return response.data;
};

// ── Vendor Orders ────────────────────────────────────────────────
export const getVendorOrders = async (params = {}) => {
  const response = await api.get("orders/vendor-orders/", { params });
  return response.data;
};

export const getVendorOrder = async (orderId) => {
  const oid = toId(orderId, "order ID");
  const response = await api.get(`orders/${oid}/`);
  return response.data;
};

export const updateVendorOrderStatus = async (orderId, status) => {
  const oid = toId(orderId, "order ID");
  const cleanStatus = String(status || "").trim().toUpperCase();
  if (!cleanStatus) throw new Error("Status is required.");

  const allowed = ["PENDING", "ACCEPTED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REJECTED"];
  if (!allowed.includes(cleanStatus)) {
    console.warn(`[Vendor] Unknown status ${cleanStatus}, proceeding...`);
  }

  const response = await api.patch(`orders/${oid}/vendor-status/`, {
    status: cleanStatus,
  });

  window.dispatchEvent(new Event("vendor-order-updated"));
  return response.data;
};

// ── Bulk Actions (Flipkart Seller) ───────────────────────────────
export const bulkUpdateStock = async (updates) => {
  // [{ id, stock, price }]
  if (!Array.isArray(updates) || updates.length === 0) throw new Error("No updates.");
  const response = await api.post("products/bulk-update/", { updates });
  return response.data;
};

export const getVendorEarnings = async (params = {}) => {
  try {
    const response = await api.get("vendors/me/earnings/", { params });
    return response.data;
  } catch {
    return null;
  }
};