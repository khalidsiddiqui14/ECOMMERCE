import api from "./api";

// Create Order
export const createOrder = async (
  orderData
) => {
  if (
    !orderData ||
    typeof orderData !== "object"
  ) {
    throw new Error(
      "Invalid order data."
    );
  }

  const response = await api.post(
    "orders/",
    orderData
  );

  return response.data;
};

// Get Orders
export const getOrders = async () => {
  const response = await api.get(
    "orders/"
  );

  return response.data;
};

// Get Order
export const getOrder = async (id) => {
  const orderId = Number(id);

  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    throw new Error(
      "Invalid order ID."
    );
  }

  const response = await api.get(
    `orders/${orderId}/`
  );

  return response.data;
};