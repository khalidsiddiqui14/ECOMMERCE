import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "ID") => {
  try {
    const n = Number(v);
    if (!Number.isInteger(n) || n <=0) throw new Error(`Invalid ${name}.`);
    return n;
  } catch { throw new Error(`Invalid ${name}.`); }
};

const PAYMENT_METHODS = ["COD", "UPI", "CARD", "NETBANKING", "WALLET", "EMI", "PAYLATER"];

const safeDispatch = (name, detail) => {
  try {
    if (detail) window.dispatchEvent(new CustomEvent(name, { detail }));
    else window.dispatchEvent(new Event(name));
  } catch {}
};

// ── Create Payment ───────────────────────────────────────────────
export const createPayment = async (orderId, paymentMethod = "COD") => {
  try {
    const validOrderId = toId(orderId, "order ID");
    const method = String(paymentMethod || "").trim().toUpperCase();
    if (!method) throw new Error("Invalid payment method.");
    if (!PAYMENT_METHODS.includes(method)) {
      console.warn(`[Payment] Unknown method: ${method}, proceeding...`);
    }

    const response = await api.post("payments/", {
      order: validOrderId,
      payment_method: method,
      method: method // backend compat
    });

    safeDispatch("order-updated");
    safeDispatch("notifications-change");
    return response.data;
  } catch (err) {
    console.error("createPayment error", err?.response?.data || err?.message);
    const d = err?.response?.data;
    if (d?.order) throw new Error(typeof d.order==="string"? d.order : d.order[0] || "Invalid order");
    throw err;
  }
};

// ── Get Payment ──────────────────────────────────────────────────
export const getPayment = async (id) => {
  try {
    const pid = toId(id, "payment ID");
    const response = await api.get(`payments/${pid}/`);
    return response.data;
  } catch (err) {
    console.error("getPayment error", err?.message);
    throw err;
  }
};

// ── Get Payments List ────────────────────────────────────────────
export const getPayments = async (params = {}) => {
  try {
    const response = await api.get("payments/", { params });
    return response.data;
  } catch (err) {
    console.warn("getPayments failed", err?.message);
    return { results: [], payments: [], count: 0 };
  }
};

// ── Get Payment by Order ─────────────────────────────────────────
export const getPaymentByOrder = async (orderId) => {
  try {
    const oid = toId(orderId, "order ID");
    const response = await api.get(`payments/order/${oid}/`);
    return response.data;
  } catch {
    try {
      const oid = toId(orderId, "order ID");
      const res = await api.get(`payments/?order=${oid}`);
      const list = res.data?.results || res.data || [];
      return Array.isArray(list)? list[0] : list;
    } catch (err) {
      console.warn("getPaymentByOrder failed", err?.message);
      return null;
    }
  }
};

// ── Verify Payment (UPI/Card) ────────────────────────────────────
export const verifyPayment = async (paymentId, verificationData = {}) => {
  try {
    const pid = toId(paymentId, "payment ID");
    const response = await api.post(`payments/${pid}/verify/`, {
     ...verificationData,
    });
    safeDispatch("order-updated");
    return response.data;
  } catch (err) {
    console.error("verifyPayment error", err?.response?.data || err?.message);
    throw err;
  }
};

// ── Create Razorpay Order (if using Razorpay) ────────────────────
export const createRazorpayOrder = async (orderId) => {
  try {
    const oid = toId(orderId, "order ID");
    const response = await api.post("payments/razorpay/create/", {
      order: oid,
    });
    return response.data;
  } catch (err) {
    console.error("createRazorpayOrder failed", err?.message);
    // Mock for dev - so checkout never breaks
    return {
      razorpay_order_id: "order_dev_"+Date.now(),
      amount: 10000,
      currency: "INR",
      key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_key",
      dev_mode: true
    };
  }
};

// ── Razorpay Checkout Helper ─────────────────────────────────────
export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => openRazorpayCheckout(options).then(resolve).catch(reject);
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
        return;
      }
      const rzp = new window.Razorpay({
       ...options,
        handler: function(response) { resolve(response); },
        modal: { ondismiss: function() { reject(new Error("Payment cancelled")); } }
      });
      rzp.open();
    } catch (err) { reject(err); }
  });
};

// ── Create UPI Payment ───────────────────────────────────────────
export const createUpiPayment = async (orderId, upiId = "") => {
  try {
    const oid = toId(orderId, "order ID");
    if (upiId &&!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      throw new Error("Invalid UPI ID. Example: name@upi");
    }
    const response = await api.post("payments/upi/", {
      order: oid,
      upi_id: upiId || undefined,
    });
    return response.data;
  } catch (err) {
    console.error("createUpiPayment error", err?.message);
    throw err;
  }
};

// ── Retry Payment (Amazon style) ─────────────────────────────────
export const retryPayment = async (orderId, paymentMethod = "COD") => {
  try {
    const oid = toId(orderId, "order ID");
    const response = await api.post(`payments/${oid}/retry/`, {
      payment_method: String(paymentMethod).trim().toUpperCase(),
    });
    return response.data;
  } catch {
    try {
      const oid = toId(orderId, "order ID");
      const res = await api.post("payments/retry/", { order: oid, payment_method: paymentMethod });
      return res.data;
    } catch (err) {
      console.error("retryPayment failed", err?.message);
      throw err;
    }
  }
};

// ── Get Payment Methods ──────────────────────────────────────────
export const getPaymentMethods = async () => {
  try {
    const response = await api.get("payments/methods/");
    return response.data?.methods || response.data || PAYMENT_METHODS;
  } catch {
    return PAYMENT_METHODS.map(m => ({
      id: m,
      name: m==="COD"? "Cash on Delivery (Pay at Doorstep)" : m==="UPI"? "UPI (GPay, PhonePe, Paytm)" : m==="CARD"? "Credit/Debit Card" : m==="NETBANKING"? "Net Banking" : m==="WALLET"? "Wallet" : m==="EMI"? "EMI (Easy Installments)" : m==="PAYLATER"? "Pay Later" : m,
      enabled: true,
      icon: m==="COD"? "💵" : m==="UPI"? "📱" : m==="CARD"? "💳" : m==="WALLET"? "👛" : "🏦",
      extra: m==="COD"? "₹49 extra" : m==="UPI"? "₹0 extra - Instant" : "Secure"
    }));
  }
};

// ── Refund ───────────────────────────────────────────────────────
export const requestRefund = async (paymentId, reason = "") => {
  try {
    const pid = toId(paymentId, "payment ID");
    const response = await api.post(`payments/${pid}/refund/`, {
      reason: reason || "Requested by customer",
      refund_reason: reason || "Requested by customer"
    });
    safeDispatch("order-updated");
    return response.data || { success: true };
  } catch (err) {
    console.error("requestRefund error", err?.message);
    throw err;
  }
};

// ── COD Confirm ──────────────────────────────────────────────────
export const confirmCodOrder = async (orderId) => {
  return createPayment(orderId, "COD");
};

export default {
  createPayment,
  getPayment,
  getPayments,
  getPaymentByOrder,
  verifyPayment,
  createRazorpayOrder,
  openRazorpayCheckout,
  createUpiPayment,
  retryPayment,
  getPaymentMethods,
  requestRefund,
  confirmCodOrder,
  PAYMENT_METHODS
};