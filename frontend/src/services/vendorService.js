import api, { uploadWithProgress } from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "ID") => {
  try {
    const n = Number(v);
    if (!Number.isInteger(n) || n <=0) throw new Error(`Invalid ${name}.`);
    return n;
  } catch { throw new Error(`Invalid ${name}.`); }
};

const safeDispatch = (name) => {
  try { window.dispatchEvent(new Event(name)); } catch {}
};

// ── Dashboard ────────────────────────────────────────────────────
export const getVendorDashboard = async (params = {}) => {
  try {
    const response = await api.get("orders/vendor-dashboard/", { params });
    return response.data;
  } catch (err) {
    console.warn("getVendorDashboard failed", err?.message);
    return { total_orders: 0, total_revenue: 0, pending_orders: 0, products: 0 };
  }
};

export const getVendorStats = async () => {
  try {
    const response = await api.get("vendors/me/stats/");
    return response.data;
  } catch {
    try {
      const dash = await getVendorDashboard();
      return dash;
    } catch { return { revenue: 0, orders: 0, products: 0, rating: 4.5 }; }
  }
};

// ── Vendor Profile ───────────────────────────────────────────────
export const getVendorProfile = async () => {
  try {
    const response = await api.get("vendors/me/");
    return response.data;
  } catch (err) {
    console.error("getVendorProfile error", err?.message);
    throw err;
  }
};

export const updateVendorProfile = async (profileData) => {
  if (!profileData || typeof profileData!=="object") throw new Error("Invalid profile data.");
  try {
    const isFormData = profileData instanceof FormData;
    const response = await api.patch("vendors/me/", profileData, {
      headers: isFormData? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (err) {
    console.error("updateVendorProfile error", err?.response?.data || err?.message);
    throw err;
  }
};

// ── Vendor Store ─────────────────────────────────────────────────
export const getVendorStore = async () => {
  try {
    const response = await api.get("stores/me/");
    return response.data;
  } catch {
    try {
      const res = await api.get("stores/my-store/");
      return res.data;
    } catch (err) {
      console.warn("getVendorStore failed", err?.message);
      return null;
    }
  }
};

export const updateVendorStore = async (storeData) => {
  if (!storeData || typeof storeData!=="object") throw new Error("Invalid store data.");
  try {
    const isFormData = storeData instanceof FormData;
    const response = await api.patch("stores/me/", storeData, {
      headers: isFormData? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (err) {
    try {
      const isFormData = storeData instanceof FormData;
      const res = await api.post("stores/me/", storeData, {
        headers: isFormData? { "Content-Type": "multipart/form-data" } : {},
      });
      return res.data;
    } catch (e) {
      console.error("updateVendorStore error", err?.message);
      throw err;
    }
  }
};

// ── Vendor Products ──────────────────────────────────────────────
export const getVendorProducts = async (params = {}) => {
  try {
    const response = await api.get("products/", { params: { vendor: "me", ...params } });
    return response.data;
  } catch (err) {
    console.warn("getVendorProducts failed", err?.message);
    return { results: [], count: 0 };
  }
};

export const getVendorProduct = async (productId) => {
  try {
    const pid = toId(productId, "product ID");
    const response = await api.get(`products/${pid}/`);
    return response.data;
  } catch (err) {
    console.error("getVendorProduct error", err?.message);
    throw err;
  }
};

export const createVendorProduct = async (productData) => {
  if (!productData) throw new Error("Product data required.");
  try {
    const isFormData = productData instanceof FormData;
    if (!isFormData) {
      if (!productData.name &&!productData.title) throw new Error("Product name is required.");
    }
    const response = await api.post("products/", productData, {
      headers: isFormData? { "Content-Type": "multipart/form-data" } : {},
    });
    safeDispatch("vendor-product-created");
    return response.data;
  } catch (err) {
    console.error("createVendorProduct error", err?.response?.data || err?.message);
    throw err;
  }
};

export const updateVendorProduct = async (productId, productData) => {
  try {
    const pid = toId(productId, "product ID");
    if (!productData) throw new Error("Product data required.");
    const isFormData = productData instanceof FormData;
    const response = await api.patch(`products/${pid}/`, productData, {
      headers: isFormData? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (err) {
    console.error("updateVendorProduct error", err?.message);
    throw err;
  }
};

export const deleteVendorProduct = async (productId) => {
  try {
    const pid = toId(productId, "product ID");
    const response = await api.delete(`products/${pid}/`);
    safeDispatch("vendor-product-deleted");
    return response.data || { success: true };
  } catch (err) {
    console.error("deleteVendorProduct error", err?.message);
    throw err;
  }
};

// ── Product Images (11/10 with progress) ─────────────────────────
export const uploadVendorProductImage = async (productId, imageData, onProgress) => {
  try {
    const pid = toId(productId, "product ID");
    if (!imageData) throw new Error("Image data required.");

    const formData = imageData instanceof FormData? imageData : (() => {
      const fd = new FormData();
      if (imageData instanceof File) fd.append("image", imageData);
      else if (imageData.file) fd.append("image", imageData.file);
      else if (imageData.image) fd.append("image", imageData.image);
      else Object.entries(imageData).forEach(([k,v]) => fd.append(k,v));
      return fd;
    })();

    if (onProgress && typeof uploadWithProgress==="function") {
      return uploadWithProgress(`products/${pid}/images/`, formData, onProgress);
    }

    const response = await api.post(`products/${pid}/images/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    console.error("uploadVendorProductImage error", err?.message);
    throw err;
  }
};

export const deleteVendorProductImage = async (productId, imageId) => {
  try {
    const pid = toId(productId, "product ID");
    const iid = toId(imageId, "image ID");
    const response = await api.delete(`products/${pid}/images/${iid}/`);
    return response.data || { success: true };
  } catch (err) {
    console.error("deleteVendorProductImage error", err?.message);
    throw err;
  }
};

// ── Vendor Orders ────────────────────────────────────────────────
export const getVendorOrders = async (params = {}) => {
  try {
    const response = await api.get("orders/vendor-orders/", { params });
    return response.data;
  } catch {
    try {
      const res = await api.get("orders/", { params: { vendor: "me", ...params } });
      return res.data;
    } catch (err) {
      console.warn("getVendorOrders failed", err?.message);
      return { results: [], count: 0 };
    }
  }
};

export const getVendorOrder = async (orderId) => {
  try {
    const oid = toId(orderId, "order ID");
    const response = await api.get(`orders/${oid}/`);
    return response.data;
  } catch (err) {
    console.error("getVendorOrder error", err?.message);
    throw err;
  }
};

export const updateVendorOrderStatus = async (orderId, status) => {
  try {
    const oid = toId(orderId, "order ID");
    const cleanStatus = String(status || "").trim().toUpperCase();
    if (!cleanStatus) throw new Error("Status is required.");

    const allowed = ["PENDING", "ACCEPTED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REJECTED", "OUT_FOR_DELIVERY"];
    if (!allowed.includes(cleanStatus)) {
      console.warn(`[Vendor] Unknown status ${cleanStatus}, proceeding...`);
    }

    const response = await api.patch(`orders/${oid}/vendor-status/`, {
      status: cleanStatus,
    });

    safeDispatch("vendor-order-updated");
    return response.data;
  } catch (err) {
    try {
      const oid = toId(orderId, "order ID");
      const res = await api.patch(`orders/${oid}/`, { status: String(status).toUpperCase(), vendor_status: String(status).toUpperCase() });
      safeDispatch("vendor-order-updated");
      return res.data;
    } catch (e) {
      console.error("updateVendorOrderStatus error", err?.message);
      throw err;
    }
  }
};

// ── Bulk Actions (Flipkart Seller) ───────────────────────────────
export const bulkUpdateStock = async (updates) => {
  if (!Array.isArray(updates) || updates.length===0) throw new Error("No updates.");
  try {
    const response = await api.post("products/bulk-update/", { updates });
    return response.data;
  } catch (err) {
    console.warn("bulkUpdateStock fallback individual", err?.message);
    const results = await Promise.allSettled(updates.map(u=> updateVendorProduct(u.id, { stock: u.stock, price: u.price })));
    return { success: true, results, fallback: true };
  }
};

export const getVendorEarnings = async (params = {}) => {
  try {
    const response = await api.get("vendors/me/earnings/", { params });
    return response.data;
  } catch {
    try {
      const res = await api.get("vendors/me/payouts/", { params });
      return res.data;
    } catch {
      return { total_earnings: 0, pending: 0, paid: 0, next_payout: null };
    }
  }
};

export const getVendorAnalytics = async (period="7d") => {
  try {
    const res = await api.get("vendors/me/analytics/", { params: { period } });
    return res.data;
  } catch {
    return { views: 0, clicks: 0, conversion: 0, chart: [] };
  }
};

export default {
  getVendorDashboard,
  getVendorStats,
  getVendorProfile,
  updateVendorProfile,
  getVendorStore,
  updateVendorStore,
  getVendorProducts,
  getVendorProduct,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  uploadVendorProductImage,
  deleteVendorProductImage,
  getVendorOrders,
  getVendorOrder,
  updateVendorOrderStatus,
  bulkUpdateStock,
  getVendorEarnings,
  getVendorAnalytics
};