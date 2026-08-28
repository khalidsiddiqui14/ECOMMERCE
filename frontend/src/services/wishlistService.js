import api from "./api";

// Get Wishlist
export const getWishlist = async () => {
  const response = await api.get(
    "wishlist/"
  );

  return response.data;
};

// Add Wishlist Item
export const addToWishlist = async (
  productId
) => {
  const validProductId =
    Number(productId);

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

  const response = await api.post(
    "wishlist/",
    {
      product: validProductId,
    }
  );

  return response.data;
};

// Remove Wishlist Item
export const removeFromWishlist = async (
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
      "Invalid wishlist item ID."
    );
  }

  const response = await api.delete(
    `wishlist/${validItemId}/`
  );

  return response.data;
};