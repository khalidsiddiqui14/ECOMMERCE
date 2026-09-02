import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "order ID") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${name}.`);
  return n;
};

const normalizeOrders = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.orders)) return data.orders;
  return data;
};

// ── Create Order (Checkout) ──────────────────────────────────────
export const createOrder = async (orderData) => {
  if (!orderData || typeof orderData !== "object") {
    throw new Error("Invalid order data.");
  }

  // Validate required fields - Flipkart checkout standard
  if (orderData.items && Array.isArray(orderData.items)) {
    if (orderData.items.length === 0) throw new Error("Cart is empty.");
    orderData.items.forEach((item, idx) => {
      if (!item.product && !item.product_id) throw new Error(`Item ${idx + 1}: product is required.`);
      if (!item.quantity || Number(item.quantity) < 1) throw new Error(`Item ${idx + 1}: invalid quantity.`);
    });
  }

  const response = await api.post("orders/", orderData);

  // Clear cart event + notify
  window.dispatchEvent(new Event("cart-change"));
  window.dispatchEvent(new Event("order-created"));

  return response.data;
};

// ── Get Orders (with filters) ────────────────────────────────────
export const getOrders = async (params = {}) => {
  // params: { status, page, ordering, search }
  const response = await api.get("orders/", { params });
  return response.data;
};

// ── Get Single Order ─────────────────────────────────────────────
export const getOrder = async (id) => {
  const oid = toId(id);
  const response = await api.get(`orders/${oid}/`);
  return response.data;
};

// ── Cancel Order ─────────────────────────────────────────────────
export const cancelOrder = async (id, reason = "") => {
  const oid = toId(id);
  const response = await api.post(`orders/${oid}/cancel/`, {
    reason: reason || "Cancelled by customer",
  });
  window.dispatchEvent(new Event("order-updated"));
  return response.data;
};

// ── Track Order ──────────────────────────────────────────────────
export const trackOrder = async (id) => {
  const oid = toId(id);
  const response = await api.get(`orders/${oid}/track/`);
  return response.data;
};

// ── Get Order Invoice ────────────────────────────────────────────
export const getOrderInvoice = async (id) => {
  const oid = toId(id);
  const response = await api.get(`orders/${oid}/invoice/`, {
    responseType: "blob",
  });
  return response.data;
};

// ── Reorder (Buy Again - Flipkart style) ─────────────────────────
export const reorder = async (id) => {
  const oid = toId(id);
  const response = await api.post(`orders/${oid}/reorder/`);
  window.dispatchEvent(new Event("cart-change"));
  return response.data;
};

// ── Rate / Review Order ──────────────────────────────────────────
export const rateOrder = async (id, { rating, review = "" }) => {
  const oid = toId(id);
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new Error("Rating must be 1-5.");

  const response = await api.post(`orders/${oid}/review/`, {
    rating: r,
    review: String(review || "").trim(),
  });
  return response.data;
};

// ── Get Order Summary (for checkout page) ────────────────────────
export const getOrderSummary = async () => {
  const response = await api.get("orders/summary/");
  return response.data;
};