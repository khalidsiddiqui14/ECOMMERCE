// frontend/src/services/adminService.js — Amazon Admin Panel API • ShopZone Admin • PRO
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?.*$/, "") || "http://127.0.0.1:8000";
const ADMIN_PREFIX = "/api/admin-panel";

const adminApi = axios.create({
  baseURL: `${API_BASE}${ADMIN_PREFIX}`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request — token from all possible keys + ShopZone
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken") || localStorage.getItem("token") || localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Amazon-style request ID
  config.headers["X-Request-ID"] = `admin-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  return config;
});

// Response — 401 auto logout + refresh try
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // 401 — try refresh once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token") || localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
          const newAccess = res.data.access || res.data.access_token;
          if (newAccess) {
            localStorage.setItem("access_token", newAccess);
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return adminApi(originalRequest);
          }
        } catch (refreshErr) {
          console.error("ADMIN REFRESH FAILED", refreshErr);
        }
      }
      // refresh failed — logout
      localStorage.removeItem("access_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login?next=/admin&reason=session_expired";
      return Promise.reject(error);
    }

    // Log Amazon-style
    console.error(`[Admin API ${error.config?.method?.toUpperCase()} ${error.config?.url}]`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper — unwrap .data + fallback
const unwrap = (promise) => promise.then(r => r.data).catch(err => {
  const msg = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error || err.message || "Admin API failed";
  throw new Error(msg);
});

export const AdminService = {
  // Dashboard — stats, revenue, orders, users
  dashboard: () => unwrap(adminApi.get("/dashboard/")),
  analytics: () => unwrap(adminApi.get("/analytics/")),
  stats: () => unwrap(adminApi.get("/stats/")),

  // Users — list, detail, toggle active, delete, ban
  users: (params = {}) => unwrap(adminApi.get("/users/", { params })),
  userDetail: (id) => unwrap(adminApi.get(`/users/${id}/`)),
  toggleUser: (id) => unwrap(adminApi.post(`/users/${id}/toggle-active/`)),
  banUser: (id, reason) => unwrap(adminApi.post(`/users/${id}/ban/`, { reason })),
  deleteUser: (id) => unwrap(adminApi.delete(`/users/${id}/`)),

  // Vendors — approve flow
  vendors: (params = {}) => unwrap(adminApi.get("/vendors/", { params })),
  vendorDetail: (id) => unwrap(adminApi.get(`/vendors/${id}/`)),
  approveVendor: (id) => unwrap(adminApi.post(`/vendors/${id}/approve/`)),
  rejectVendor: (id, reason) => unwrap(adminApi.post(`/vendors/${id}/reject/`, { reason })),
  toggleVendor: (id) => unwrap(adminApi.post(`/vendors/${id}/toggle-active/`)),

  // Stores — brand stores
  stores: (params = {}) => unwrap(adminApi.get("/stores/", { params })),
  storeDetail: (id) => unwrap(adminApi.get(`/stores/${id}/`)),
  approveStore: (id) => unwrap(adminApi.post(`/stores/${id}/approve/`)),
  rejectStore: (id, reason) => unwrap(adminApi.post(`/stores/${id}/reject/`, { reason })),
  toggleStore: (id) => unwrap(adminApi.post(`/stores/${id}/toggle-active/`)),

  // Products — approve, reject, featured
  products: (params = {}) => unwrap(adminApi.get("/products/", { params })),
  productDetail: (id) => unwrap(adminApi.get(`/products/${id}/`)),
  approveProduct: (id) => unwrap(adminApi.post(`/products/${id}/approve/`)),
  rejectProduct: (id, reason) => unwrap(adminApi.post(`/products/${id}/reject/`, { reason })),
  toggleFeatured: (id) => unwrap(adminApi.post(`/products/${id}/toggle-featured/`)),
  deleteProduct: (id) => unwrap(adminApi.delete(`/products/${id}/`)),

  // Orders — list, detail, update status, refund
  orders: (params = {}) => unwrap(adminApi.get("/orders/", { params })),
  orderDetail: (id) => unwrap(adminApi.get(`/orders/${id}/`)),
  updateOrderStatus: (id, status) => unwrap(adminApi.patch(`/orders/${id}/`, { status })),
  refundOrder: (id, amount, reason) => unwrap(adminApi.post(`/orders/${id}/refund/`, { amount, reason })),

  // Payments — transactions, settlements
  payments: (params = {}) => unwrap(adminApi.get("/payments/", { params })),
  paymentDetail: (id) => unwrap(adminApi.get(`/payments/${id}/`)),
  refundPayment: (id, reason) => unwrap(adminApi.post(`/payments/${id}/refund/`, { reason })),

  // Returns & Refunds
  returns: (params = {}) => unwrap(adminApi.get("/returns/", { params })),
  approveReturn: (id) => unwrap(adminApi.post(`/returns/${id}/approve/`)),
  rejectReturn: (id, reason) => unwrap(adminApi.post(`/returns/${id}/reject/`, { reason })),

  // Categories & Brands
  categories: (params) => unwrap(adminApi.get("/categories/", { params })),
  createCategory: (data) => unwrap(adminApi.post("/categories/", data)),
  updateCategory: (id, data) => unwrap(adminApi.patch(`/categories/${id}/`, data)),

  // Coupons & Deals
  coupons: (params) => unwrap(adminApi.get("/coupons/", { params })),
  createCoupon: (data) => unwrap(adminApi.post("/coupons/", data)),

  // Reports — Amazon Admin Reports
  exportUsers: (params) => unwrap(adminApi.get("/exports/users/", { params, responseType: "blob" })),
  exportOrders: (params) => unwrap(adminApi.get("/exports/orders/", { params, responseType: "blob" })),

  // Settings
  settings: () => unwrap(adminApi.get("/settings/")),
  updateSettings: (data) => unwrap(adminApi.patch("/settings/", data)),
};

export default AdminService;

// Also export api instance for custom calls
export { adminApi };