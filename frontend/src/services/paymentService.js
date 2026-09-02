import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "ID") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${name}.`);
  return n;
};

const PAYMENT_METHODS = ["COD", "UPI", "CARD", "NETBANKING", "WALLET", "EMI"];

// ── Create Payment ───────────────────────────────────────────────
export const createPayment = async (orderId, paymentMethod = "COD") => {
  const validOrderId = toId(orderId, "order ID");

  const method = String(paymentMethod || "").trim().toUpperCase();
  if (!method) throw new Error("Invalid payment method.");
  if (!PAYMENT_METHODS.includes(method) && method !== "COD") {
    // Allow but warn - backend may support more
    console.warn(`[Payment] Unknown method: ${method}, proceeding...`);
  }

  const response = await api.post("payments/", {
    order: validOrderId,
    payment_method: method,
  });

  return response.data;
};

// ── Get Payment ──────────────────────────────────────────────────
export const getPayment = async (id) => {
  const pid = toId(id, "payment ID");
  const response = await api.get(`payments/${pid}/`);
  return response.data;
};

// ── Get Payments List ────────────────────────────────────────────
export const getPayments = async (params = {}) => {
  const response = await api.get("payments/", { params });
  return response.data;
};

// ── Get Payment by Order ─────────────────────────────────────────
export const getPaymentByOrder = async (orderId) => {
  const oid = toId(orderId, "order ID");
  const response = await api.get(`payments/order/${oid}/`);
  return response.data;
};

// ── Verify Payment (UPI/Card) ────────────────────────────────────
export const verifyPayment = async (paymentId, verificationData = {}) => {
  const pid = toId(paymentId, "payment ID");

  const response = await api.post(`payments/${pid}/verify/`, {
    ...verificationData,
  });

  return response.data;
};

// ── Create Razorpay Order (if using Razorpay) ────────────────────
export const createRazorpayOrder = async (orderId) => {
  const oid = toId(orderId, "order ID");
  const response = await api.post("payments/razorpay/create/", {
    order: oid,
  });
  return response.data; // { razorpay_order_id, amount, currency, key }
};

// ── Create UPI Payment ───────────────────────────────────────────
export const createUpiPayment = async (orderId, upiId = "") => {
  const oid = toId(orderId, "order ID");

  if (upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
    throw new Error("Invalid UPI ID. Example: name@upi");
  }

  const response = await api.post("payments/upi/", {
    order: oid,
    upi_id: upiId || undefined,
  });
  return response.data;
};

// ── Retry Payment (Flipkart style) ───────────────────────────────
export const retryPayment = async (orderId, paymentMethod = "COD") => {
  const oid = toId(orderId, "order ID");
  const response = await api.post(`payments/${oid}/retry/`, {
    payment_method: String(paymentMethod).trim().toUpperCase(),
  });
  return response.data;
};

// ── Get Payment Methods ──────────────────────────────────────────
export const getPaymentMethods = async () => {
  try {
    const response = await api.get("payments/methods/");
    return response.data;
  } catch {
    // Fallback
    return PAYMENT_METHODS.map(m => ({
      id: m,
      name: m === "COD" ? "Cash on Delivery" : m,
      enabled: true,
    }));
  }
};

// ── Refund ───────────────────────────────────────────────────────
export const requestRefund = async (paymentId, reason = "") => {
  const pid = toId(paymentId, "payment ID");
  const response = await api.post(`payments/${pid}/refund/`, {
    reason: reason || "Requested by customer",
  });
  return response.data;
};