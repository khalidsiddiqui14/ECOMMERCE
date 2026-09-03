import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://ecommerce-2-6amy.onrender.com/api/";

const api = axios.create({
  baseURL: API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  else if (!config.headers["Content-Type"]) config.headers["Content-Type"] = "application/json";
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!error.response) {
      error.userMessage = "Server se connect nahi ho pa raha.";
      return Promise.reject(error);
    }
    const status = error.response.status;
    const msg = (error.response.data?.message || error.response.data?.detail || "").toLowerCase();
    const isTokenError = status === 401 && (msg.includes("token") || msg.includes("unauthorized") || msg.includes("expired") || msg.includes("invalid") || msg === "");
    const isAuthUrl = original?.url?.includes("/login") || original?.url?.includes("/register") || original?.url?.includes("/token");
    if (isTokenError && !isAuthUrl) {
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
    if (status >= 500) error.userMessage = "Server error. Thodi der me try karo.";
    else if (status === 429) error.userMessage = "Bohot requests.";
    return Promise.reject(error);
  }
);

function logoutAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event("auth-change"));
  if (!["/login", "/register"].includes(window.location.pathname)) {
    const path = window.location.pathname + window.location.search;
    if (path !== "/") sessionStorage.setItem("redirect_after_login", path);
    window.location.replace("/login");
  }
}

export const uploadWithProgress = (url, formData, onProgress) =>
  api.post(url, formData, {
    onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total)); },
  });

export const checkApiHealth = async () => {
  try { const res = await api.get("health/", { timeout: 5000 }); return res.status === 200; } catch { return false; }
};

export default api;