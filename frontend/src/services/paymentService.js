import api from "./api";

export const createPayment = async (
  orderId,
  paymentMethod = "COD"
) => {
  const response = await api.post(
    "payments/",
    {
      order: orderId,
      payment_method: paymentMethod,
    }
  );

  return response.data;
};

export const getPayment = async (id) => {
  const response = await api.get(
    `payments/${id}/`
  );

  return response.data;
};