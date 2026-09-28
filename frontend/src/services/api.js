import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://ecommerce-2-6amy.onrender.com/api/";

export const IMAGE_BASE = (() => {
  try {
    const url = new URL(API_BASE);
    if (url.protocol !== "https:" && !url.hostname.includes("localhost")) {
      return "https://ecommerce-2-6amy.onrender.com";
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return "https://ecommerce-2-6amy.onrender.com";
  }
})();

const api = axios.create({
  baseURL: API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`,
  timeout: 20000,
  headers: { Accept: "application/json" },
  withCredentials: false,
});

let isRefreshing = false;
let failedQueue = [];

const getAccessToken = () => {
  return localStorage.getItem("access_token") || localStorage.getItem("accessToken") || localStorage.getItem("token") || localStorage.getItem("auth_token") || null;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const isAuthUrl = (url = "") => {
  const requestUrl = String(url).toLowerCase();
  return requestUrl.includes("auth/login") ||
    requestUrl.includes("auth/register") ||
    requestUrl.includes("auth/otp") ||
    requestUrl.includes("auth/google") ||
    requestUrl.includes("auth/token") ||
    requestUrl.includes("auth/password");
};

api.interceptors.request.use((config) => {
  try {
    config.headers = config.headers || {};
    if (!isAuthUrl(config.url)) {
      const token = getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
      const str = JSON.stringify(config.data);
      if (str.includes("<script") || str.includes("javascript:")) {
        throw new Error("Invalid input detected");
      }
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  } catch (e) {
    if (e.message === "Invalid input detected") throw e;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);
    if (!error.response) {
      error.userMessage = "Server se connect nahi ho pa raha. Internet check karo.";
      return Promise.reject(error);
    }
    const status = error.response.status;
    const msg = (error.response.data?.message || error.response.data?.detail || "").toLowerCase();
    const authRequest = isAuthUrl(original.url);
    const isTokenError = status === 401 && !authRequest && (msg.includes("token") || msg.includes("unauthorized") || msg.includes("authentication") || msg.includes("credentials") || msg.includes("expired") || msg.includes("invalid") || msg === "");
    if (isTokenError) {
      if (original._retry) {
        logoutAndRedirect();
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        logoutAndRedirect();
        return Promise.reject(error);
      }
      try {
        const refreshUrl = `${API_BASE.replace(/\/?$/, "/")}auth/token/refresh/`;
        const res = await axios.post(refreshUrl, { refresh: refreshToken }, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const newAccess = res.data?.access || res.data?.access_token;
        const newRefresh = res.data?.refresh || res.data?.refresh_token;
        if (!newAccess) throw new Error("No access token");
        localStorage.setItem("access_token", newAccess);
        localStorage.setItem("accessToken", newAccess);
        if (newRefresh) localStorage.setItem("refresh_token", newRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        isRefreshing = false;
        window.dispatchEvent(new Event("auth-change"));
        return api(original);
      } catch (e) {
        processQueue(e, null);
        isRefreshing = false;
        logoutAndRedirect();
        return Promise.reject(e);
      }
    }
    if (status >= 500 && !original._retry500) {
      original._retry500 = true;
      await new Promise((r) => setTimeout(r, 1000));
      return api(original);
    }
    if (status >= 500) {
      error.userMessage = "Server me kuch problem hai. 1 min baad try karo.";
    } else if (status === 429) {
      error.userMessage = "Bohot tez requests bhej rahe ho. Thoda ruko!";
    } else if (status === 404) {
      error.userMessage = "Ye cheez mili nahi.";
    } else if (status === 403) {
      error.userMessage = "Aapko iska permission nahi hai.";
    }
    return Promise.reject(error);
  }
);

async function logoutAndRedirect() {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) api.post("auth/logout/", { refresh: refreshToken }).catch(() => {});
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_admin");
    delete api.defaults.headers.common.Authorization;
    window.dispatchEvent(new Event("auth-change"));
    if (!["/login", "/register"].includes(window.location.pathname)) {
      const path = window.location.pathname + window.location.search;
      if (path !== "/") sessionStorage.setItem("redirect_after_login", path);
      window.location.replace("/login");
    }
  } catch {}
}

export const getImageUrl = (path) => {
  try {
    if (!path) return "";
    if (typeof path !== "string") {
      path = path.image || path.url || path.src || "";
      if (!path) return "";
    }
    const lower = path.toLowerCase();
    if (lower.includes("javascript:") || lower.includes("data:text")) return "";
    if (lower.startsWith("http")) {
      if (lower.startsWith("https://")) return path;
      if (lower.includes("localhost") || lower.includes("127.0.0.1")) return path;
      return "";
    }
    if (path.startsWith("//")) return "https:" + path;
    if (path.startsWith("/media")) return IMAGE_BASE + path;
    if (path.startsWith("media/")) return IMAGE_BASE + "/" + path;
    if (path.startsWith("/")) return IMAGE_BASE + path;
    return IMAGE_BASE + "/media/" + path.replace(/^\/+/, "");
  } catch {
    return "";
  }
};

export const resolveProductImage = (product) => {
  try {
    if (!product) return "https://via.placeholder.com/400x400?text=No+Image";
    if (product.images && Array.isArray(product.images) && product.images.length > 0) return getImageUrl(product.images[0]);
    if (product.image) return getImageUrl(product.image);
    if (product.thumbnail) return getImageUrl(product.thumbnail);
  } catch {}
  return "https://via.placeholder.com/400x400?text=No+Image";
};

export const isPrimeProduct = (product) => {
  try {
    const price = Number(product?.price || 0);
    return price >= 499 || product?.is_prime || product?.prime || product?.isPrime;
  } catch {
    return false;
  }
};

export const getDiscountPercent = (product) => {
  try {
    const price = Number(product?.price || 0);
    const mrp = Number(product?.original_price || product?.mrp || 0);
    if (mrp > price && mrp > 0) return Math.round((1 - price / mrp) * 100);
  } catch {}
  return 0;
};

export const uploadWithProgress = (url, formData, onProgress) => api.post(url, formData, {
  onUploadProgress: (e) => {
    if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
  },
});

export const checkApiHealth = async () => {
  try {
    const res = await api.get("health/", { timeout: 5000 });
    return res.status === 200;
  } catch {
    return false;
  }
};

export default api;