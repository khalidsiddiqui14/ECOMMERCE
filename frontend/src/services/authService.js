import api from "./api";

export const loginUser = async (email, password) => {
  const response = await api.post("auth/login/", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (
  username,
  email,
  password,
  phone
) => {
  const response = await api.post("auth/register/", {
    username,
    email,
    password,
    phone,
  });

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("auth/profile/");

  return response.data;
};