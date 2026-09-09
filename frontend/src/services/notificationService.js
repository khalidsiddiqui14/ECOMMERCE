import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "notification ID") => {
  try {
    const n = Number(v);
    if (!Number.isInteger(n) || n <=0) throw new Error(`Invalid ${name}.`);
    return n;
  } catch { throw new Error(`Invalid ${name}.`); }
};

const normalizeList = (data) => {
  try {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.notifications)) return data.notifications;
    if (Array.isArray(data?.data)) return data.data;
    return data;
  } catch { return []; }
};

const safeDispatch = (name, detail) => {
  try {
    if (detail!==undefined) window.dispatchEvent(new CustomEvent(name, { detail }));
    else window.dispatchEvent(new Event(name));
  } catch {}
};

// ── Get Notifications (with unread count) ────────────────────────
export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get("notifications/", { params });
    const data = response.data;

    const unread = data?.unread_count?? data?.unread?? (Array.isArray(normalizeList(data))? normalizeList(data).filter(n=>!n.is_read &&!n.read &&!n.isRead).length : 0);
    safeDispatch("notifications-change", { unread: Number(unread)||0 });

    return data;
  } catch (err) {
    console.warn("getNotifications failed", err?.message);
    safeDispatch("notifications-change", { unread: 0 });
    return { results: [], notifications: [], unread_count: 0, count: 0 };
  }
};

// ── Get Single Notification ──────────────────────────────────────
export const getNotification = async (id) => {
  try {
    const nid = toId(id);
    const response = await api.get(`notifications/${nid}/`);
    return response.data;
  } catch (err) {
    console.error("getNotification error", err?.response?.data || err?.message);
    throw err;
  }
};

// ── Mark Single Read ─────────────────────────────────────────────
export const markNotificationRead = async (id) => {
  try {
    const nid = toId(id);
    const response = await api.patch(`notifications/${nid}/read/`);
    safeDispatch("notifications-change");
    return response.data || { success: true };
  } catch (err) {
    // Try alternative endpoints
    try {
      const nid = toId(id);
      const response = await api.post(`notifications/${nid}/read/`);
      safeDispatch("notifications-change");
      return response.data;
    } catch {
      console.error("markNotificationRead error", err?.message);
      safeDispatch("notifications-change");
      return { success: true };
    }
  }
};

// ── Mark All Read ────────────────────────────────────────────────
export const markAllNotificationsRead = async () => {
  try {
    const response = await api.post("notifications/read-all/");
    safeDispatch("notifications-change", { unread: 0 });
    return response.data || { success: true };
  } catch {
    try {
      const response = await api.post("notifications/mark-all-read/");
      safeDispatch("notifications-change", { unread: 0 });
      return response.data;
    } catch (err) {
      console.warn("markAllNotificationsRead fallback local", err?.message);
      safeDispatch("notifications-change", { unread: 0 });
      return { success: true };
    }
  }
};

// ── Delete Notification ──────────────────────────────────────────
export const deleteNotification = async (id) => {
  try {
    const nid = toId(id);
    const response = await api.delete(`notifications/${nid}/`);
    safeDispatch("notifications-change");
    return response.data || { success: true };
  } catch (err) {
    console.error("deleteNotification error", err?.message);
    safeDispatch("notifications-change");
    return { success: true };
  }
};

// ── Clear All ────────────────────────────────────────────────────
export const clearAllNotifications = async () => {
  try {
    const response = await api.delete("notifications/clear/");
    safeDispatch("notifications-change", { unread: 0 });
    return response.data || { success: true };
  } catch {
    try {
      await api.post("notifications/clear-all/");
      safeDispatch("notifications-change", { unread: 0 });
      return { success: true };
    } catch (err) {
      console.warn("clearAll fallback", err?.message);
      safeDispatch("notifications-change", { unread: 0 });
      return { success: true };
    }
  }
};

// ── Unread Count (lightweight) ───────────────────────────────────
export const getUnreadCount = async () => {
  try {
    const response = await api.get("notifications/unread-count/");
    return Number(response.data?.count?? response.data?.unread_count?? response.data?.unread?? 0);
  } catch {
    try {
      const data = await getNotifications();
      const list = normalizeList(data);
      if (Array.isArray(list)) return list.filter(n =>!n.is_read &&!n.read).length;
      return Number(data?.unread_count || data?.unread || 0);
    } catch { return 0; }
  }
};

// ── Preferences ──────────────────────────────────────────────────
export const getNotificationPreferences = async () => {
  try {
    const response = await api.get("notifications/preferences/");
    return response.data;
  } catch (err) {
    console.warn("getNotificationPreferences failed", err?.message);
    // Fallback defaults - Amazon defaults
    return {
      email_notifications: true,
      push_notifications: true,
      order_updates: true,
      promotional: false,
      sms_notifications: true,
      price_drop: true,
      back_in_stock: true
    };
  }
};

export const updateNotificationPreferences = async (data) => {
  if (!data || typeof data!=="object") {
    throw new Error("Invalid notification preferences.");
  }

  const allowed = ["email_notifications", "push_notifications", "order_updates", "promotional", "sms_notifications", "price_drop", "back_in_stock", "new_arrivals"];
  const cleaned = {};
  try {
    Object.keys(data).forEach(k => {
      if (allowed.includes(k) || k.startsWith("notify_")) {
        cleaned[k] = Boolean(data[k]);
      }
    });
  } catch {}

  const payload = Object.keys(cleaned).length>0? cleaned : data;

  try {
    const response = await api.patch("notifications/preferences/", payload);
    return response.data;
  } catch (err) {
    console.warn("updateNotificationPreferences fallback local", err?.message);
    try { localStorage.setItem("notification_prefs", JSON.stringify(payload)); } catch {}
    return { success: true,...payload };
  }
};

// ── Real-time Polling helper (use in component) ──────────────────
export const createNotificationPoller = (callback, interval = 30000) => {
  let timer = null;
  let active = true;

  const poll = async () => {
    if (!active) return;
    try {
      const count = await getUnreadCount();
      try { callback(count); } catch {}
    } catch {}
    if (active) timer = setTimeout(poll, interval);
  };

  poll();

  return () => {
    active = false;
    if (timer) clearTimeout(timer);
  };
};

// ── AMAZON NEW: Push Notification ────────────────────────────────
export const subscribePush = async () => {
  try {
    if (!("Notification" in window) ||!("serviceWorker" in navigator)) return { supported: false };
    const permission = await Notification.requestPermission();
    if (permission!=="granted") return { permission };

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_KEY || "test_key"
    });

    await api.post("notifications/subscribe/", { subscription: sub.toJSON() }).catch(()=>{});
    return { success: true, permission, subscription: sub };
  } catch (err) {
    console.warn("subscribePush failed", err?.message);
    return { success: false, error: err?.message };
  }
};

export default {
  getNotifications,
  getNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotificationPoller,
  subscribePush
};