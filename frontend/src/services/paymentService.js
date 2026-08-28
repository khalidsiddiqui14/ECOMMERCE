import api from "./api";

// Create Payment
export const createPayment = async (
  orderId,
  paymentMethod = "COD"
) => {
  const validOrderId =
    Number(orderId);

  if (
    !Number.isInteger(
      validOrderId
    ) ||
    validOrderId <= 0
  ) {
    throw new Error(
      "Invalid order ID."
    );
  }

  if (
    typeof paymentMethod !==
      "string" ||
    !paymentMethod.trim()
  ) {
    throw new Error(
      "Invalid payment method."
    );
  }

  const response = await api.post(
    "payments/",
    {
      order: validOrderId,
      payment_method:
        paymentMethod.trim(),
    }
  );

  return response.data;
};

// Get Payment
export const getPayment = async (
  id
) => {
  const paymentId =
    Number(id);

  if (
    !Number.isInteger(
      paymentId
    ) ||
    paymentId <= 0
  ) {
    throw new Error(
      "Invalid payment ID."
    );
  }

  const response = await api.get(
    `payments/${paymentId}/`
  );

  return response.data;
};