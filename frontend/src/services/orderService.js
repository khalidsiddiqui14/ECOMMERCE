import api from "./api";

export const createOrder = async (orderData) => {
  const response = await api.post(
    "orders/",
    orderData
  );

  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("orders/");

  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(
    `orders/${id}/`
  );

  return response.data;
};