import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "notification ID") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${name}.`);
  return n;
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.notifications)) return data.notifications;
  return data;
};

// ── Get Notifications (with unread count) ────────────────────────
export const getNotifications = async (params = {}) => {
  // params: { page, unread_only, type }
  const response = await api.get("notifications/", { params });
  const data = response.data;

  // Dispatch count for header bell
  const unread = data?.unread_count ?? (Array.isArray(data) ? data.filter(n=>!n.is_read).length : 0);
  window.dispatchEvent(new CustomEvent("notifications-change", { detail: { unread } }));

  return data;
};

// ── Get Single Notification ──────────────────────────────────────
export const getNotification = async (id) => {
  const nid = toId(id);
  const response = await api.get(`notifications/${nid}/`);
  return response.data;
};

// ── Mark Single Read ─────────────────────────────────────────────
export const markNotificationRead = async (id) => {
  const nid = toId(id);
  const response = await api.patch(`notifications/${nid}/read/`);
  window.dispatchEvent(new Event("notifications-change"));
  return response.data;
};

// ── Mark All Read ────────────────────────────────────────────────
export const markAllNotificationsRead = async () => {
  const response = await api.post("notifications/read-all/");
  window.dispatchEvent(new CustomEvent("notifications-change", { detail: { unread: 0 } }));
  return response.data;
};

// ── Delete Notification ──────────────────────────────────────────
export const deleteNotification = async (id) => {
  const nid = toId(id);
  const response = await api.delete(`notifications/${nid}/`);
  window.dispatchEvent(new Event("notifications-change"));
  return response.data;
};

// ── Clear All ────────────────────────────────────────────────────
export const clearAllNotifications = async () => {
  const response = await api.delete("notifications/clear/");
  window.dispatchEvent(new CustomEvent("notifications-change", { detail: { unread: 0 } }));
  return response.data;
};

// ── Unread Count (lightweight) ───────────────────────────────────
export const getUnreadCount = async () => {
  try {
    const response = await api.get("notifications/unread-count/");
    return Number(response.data?.count ?? response.data?.unread_count ?? 0);
  } catch {
    // Fallback to full list
    try {
      const data = await getNotifications();
      const list = normalizeList(data);
      if (Array.isArray(list)) return list.filter(n => !n.is_read && !n.read).length;
      return Number(data?.unread_count || 0);
    } catch {
      return 0;
    }
  }
};

// ── Preferences ──────────────────────────────────────────────────
export const getNotificationPreferences = async () => {
  const response = await api.get("notifications/preferences/");
  return response.data;
};

export const updateNotificationPreferences = async (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid notification preferences.");
  }

  // Validate known keys (Flipkart-style)
  const allowed = ["email_notifications", "push_notifications", "order_updates", "promotional", "sms_notifications"];
  const cleaned = {};
  Object.keys(data).forEach(k => {
    if (allowed.includes(k) || k.startsWith("notify_")) {
      cleaned[k] = Boolean(data[k]);
    }
  });

  const payload = Object.keys(cleaned).length > 0 ? cleaned : data;

  const response = await api.patch("notifications/preferences/", payload);
  return response.data;
};

// ── Real-time Polling helper (use in component) ──────────────────
export const createNotificationPoller = (callback, interval = 30000) => {
  let timer = null;
  let active = true;

  const poll = async () => {
    if (!active) return;
    try {
      const count = await getUnreadCount();
      callback(count);
    } catch {}
    if (active) timer = setTimeout(poll, interval);
  };

  poll();

  return () => {
    active = false;
    if (timer) clearTimeout(timer);
  };
};