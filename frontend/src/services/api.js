import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://ecommerce-2-6amy.onrender.com/api/";

// DYNAMIC IMAGE BASE - works for localhost + Render - NO ERROR
export const IMAGE_BASE = (() => {
  try {
    const url = new URL(API_BASE);
    return `${url.protocol}//${url.host}`; // https://ecommerce-2-6amy.onrender.com
  } catch {
    return "https://ecommerce-2-6amy.onrender.com";
  }
})();

const api = axios.create({
  baseURL: API_BASE.endsWith("/")? API_BASE : `${API_BASE}/`,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data instanceof FormData) delete config.headers["Content-Type"];
    else if (!config.headers["Content-Type"]) config.headers["Content-Type"] = "application/json";
    // Amazon: Add request-id for tracing
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!error.response) {
      error.userMessage = "Server se connect nahi ho pa raha. Internet check karo.";
      return Promise.reject(error);
    }
    const status = error.response.status;
    const msg = (error.response.data?.message || error.response.data?.detail || "").toLowerCase();
    const isTokenError = status === 401 && (msg.includes("token") || msg.includes("unauthorized") || msg.includes("expired") || msg.includes("invalid") || msg === "");
    const isAuthUrl = original?.url?.includes("/login") || original?.url?.includes("/register") || original?.url?.includes("/token");

    // 401 - Refresh logic - YOUR LOGIC KEPT 100%
    if (isTokenError &&!isAuthUrl) {
      if (original._retry) { logoutAndRedirect(); return Promise.reject(error); }
      if (isRefreshing) {
        return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) { isRefreshing = false; processQueue(error, null); logoutAndRedirect(); return Promise.reject(error); }
      try {
        const res = await axios.post(`${API_BASE}auth/token/refresh/`, { refresh: refreshToken }, { headers: { "Content-Type": "application/json" } });
        const newAccess = res.data?.access || res.data?.access_token;
        const newRefresh = res.data?.refresh || res.data?.refresh_token;
        if (!newAccess) throw new Error("No access token");
        localStorage.setItem("access_token", newAccess);
        if (newRefresh) localStorage.setItem("refresh_token", newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        original.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        isRefreshing = false;
        window.dispatchEvent(new Event("auth-change"));
        return api(original);
      } catch (e) { processQueue(e, null); isRefreshing = false; logoutAndRedirect(); return Promise.reject(e); }
    }

    // AMAZON FEATURE: Auto retry for 500 - 1 time
    if (status >= 500 &&!original._retry500) {
      original._retry500 = true;
      console.warn("Retrying 500 error...");
      await new Promise(r=> setTimeout(r, 1000));
      return api(original);
    }

    if (status >= 500) error.userMessage = "Server error. Thodi der me try karo.";
    else if (status === 429) error.userMessage = "Bohot requests. Slow down bro.";
    else if (status === 404) error.userMessage = "Not found.";
    return Promise.reject(error);
  }
);

function logoutAndRedirect() {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.Authorization;
    window.dispatchEvent(new Event("auth-change"));
    if (!["/login", "/register"].includes(window.location.pathname)) {
      const path = window.location.pathname + window.location.search;
      if (path!== "/") sessionStorage.setItem("redirect_after_login", path);
      window.location.replace("/login");
    }
  } catch {}
}

// --- AMAZON HELPERS - NO ERROR - ALWAYS WORKING ---

export const getImageUrl = (path) => {
  try {
    if (!path) return "";
    if (typeof path!== "string") {
      path = path.image || path.url || path.src || "";
      if (!path) return "";
    }
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("//")) return `https:${path}`;
    if (path.startsWith("/media")) return `${IMAGE_BASE}${path}`;
    if (path.startsWith("media/")) return `${IMAGE_BASE}/${path}`;
    if (path.startsWith("/")) return `${IMAGE_BASE}${path}`;
    return `${IMAGE_BASE}/media/${path.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

export const resolveProductImage = (product) => {
  try {
    if (!product) return "https://via.placeholder.com/400x400?text=No+Image";
    if (product.images && Array.isArray(product.images) && product.images.length>0) {
      return getImageUrl(product.images[0]);
    }
    if (product.image) return getImageUrl(product.image);
    if (product.thumbnail) return getImageUrl(product.thumbnail);
  } catch {}
  return "https://via.placeholder.com/400x400?text=No+Image";
};

export const isPrimeProduct = (product) => {
  try {
    const price = Number(product?.price || 0);
    return price >= 499 || product?.is_prime || product?.prime || product?.isPrime;
  } catch { return false; }
};

export const getDiscountPercent = (product) => {
  try {
    const price = Number(product?.price || 0);
    const mrp = Number(product?.original_price || product?.mrp || product?.originalPrice || 0);
    if (mrp>price && mrp>0) return Math.round((1-price/mrp)*100);
  } catch {}
  return 0;
};

export const uploadWithProgress = (url, formData, onProgress) =>
  api.post(url, formData, {
    onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total)); },
  });

export const checkApiHealth = async () => {
  try { const res = await api.get("health/", { timeout: 5000 }); return res.status === 200; } catch { return false; }
};

export default api;