import api from "./api";

// Get Profile
export const getProfile = async () => {
  const response = await api.get(
    "auth/profile/"
  );

  return response.data;
};