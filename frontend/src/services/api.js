import axios from "axios";

// API Client
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api/",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Add Authentication Token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "access_token"
      );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

// Handle API Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message =
        "Unable to connect to the server.";

      return Promise.reject(error);
    }

    const status =
      error.response.status;

    const data =
      error.response.data;

    const message =
      data?.message ||
      data?.detail ||
      "";

    const tokenInvalid =
      status === 401 &&
      typeof message === "string" &&
      (
        message
          .toLowerCase()
          .includes("token not valid") ||
        message
          .toLowerCase()
          .includes("token is invalid") ||
        message
          .toLowerCase()
          .includes("token has expired")
      );

    if (tokenInvalid) {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "user"
      );

      window.dispatchEvent(
        new Event("auth-change")
      );

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.replace(
          "/login"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;