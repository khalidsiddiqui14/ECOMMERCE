import api from "./api";

// Vendor Dashboard
export const getVendorDashboard = async () => {
  const response = await api.get(
    "orders/vendor-dashboard/"
  );

  return response.data;
};

// Vendor Profile
export const getVendorProfile = async () => {
  const response = await api.get(
    "vendors/me/"
  );

  return response.data;
};

export const updateVendorProfile = async (
  profileData
) => {
  const response = await api.patch(
    "vendors/me/",
    profileData
  );

  return response.data;
};

// Vendor Store
export const getVendorStore = async () => {
  const response = await api.get(
    "stores/me/"
  );

  return response.data;
};

export const updateVendorStore = async (
  storeData
) => {
  const response = await api.patch(
    "stores/me/",
    storeData
  );

  return response.data;
};

// Vendor Products
export const getVendorProducts = async () => {
  const response = await api.get(
    "products/"
  );

  return response.data;
};

export const createVendorProduct = async (
  productData
) => {
  const response = await api.post(
    "products/",
    productData
  );

  return response.data;
};

export const uploadVendorProductImage = async (
  productId,
  imageData
) => {
  const response = await api.post(
    `products/${productId}/images/`,
    imageData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateVendorProduct = async (
  productId,
  productData
) => {
  const response = await api.patch(
    `products/${productId}/`,
    productData
  );

  return response.data;
};

export const deleteVendorProduct = async (
  productId
) => {
  const response = await api.delete(
    `products/${productId}/`
  );

  return response.data;
};

// Vendor Orders
export const getVendorOrders = async () => {
  const response = await api.get(
    "orders/vendor-orders/"
  );

  return response.data;
};

export const updateVendorOrderStatus = async (
  orderId,
  status
) => {
  const response = await api.patch(
    `orders/${orderId}/vendor-status/`,
    {
      status,
    }
  );

  return response.data;
};