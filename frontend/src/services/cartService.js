import api from "./api";

// Get Cart
export const getCart = async () => {
  const response = await api.get("cart/");

  return response.data;
};

// Add Cart Item
export const addToCart = async (
  productId,
  quantity = 1
) => {
  const validProductId =
    Number(productId);

  const validQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      validProductId
    ) ||
    validProductId <= 0
  ) {
    throw new Error(
      "Invalid product ID."
    );
  }

  if (
    !Number.isInteger(
      validQuantity
    ) ||
    validQuantity < 1
  ) {
    throw new Error(
      "Quantity must be at least 1."
    );
  }

  const response = await api.post(
    "cart/",
    {
      product: validProductId,
      quantity: validQuantity,
    }
  );

  return response.data;
};

// Update Cart Item
export const updateCartItem = async (
  itemId,
  quantity
) => {
  const validItemId =
    Number(itemId);

  const validQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      validItemId
    ) ||
    validItemId <= 0
  ) {
    throw new Error(
      "Invalid cart item ID."
    );
  }

  if (
    !Number.isInteger(
      validQuantity
    ) ||
    validQuantity < 1
  ) {
    throw new Error(
      "Quantity must be at least 1."
    );
  }

  const response = await api.put(
    `cart/${validItemId}/`,
    {
      quantity: validQuantity,
    }
  );

  return response.data;
};

// Remove Cart Item
export const removeCartItem = async (
  itemId
) => {
  const validItemId =
    Number(itemId);

  if (
    !Number.isInteger(
      validItemId
    ) ||
    validItemId <= 0
  ) {
    throw new Error(
      "Invalid cart item ID."
    );
  }

  const response = await api.delete(
    `cart/${validItemId}/`
  );

  return response.data;
};