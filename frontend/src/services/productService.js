import api from "./api";

// Get Products
export const getProducts = async () => {
  const response = await api.get(
    "products/"
  );

  return response.data;
};

// Get Product
export const getProduct = async (id) => {
  const productId = Number(id);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "Invalid product ID."
    );
  }

  const response = await api.get(
    `products/${productId}/`
  );

  return response.data;
};