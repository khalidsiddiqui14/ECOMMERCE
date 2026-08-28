import api from "./api";

// Login User
export const loginUser = async (
  email,
  password
) => {
  const cleanEmail =
    email?.trim();

  if (!cleanEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  const response = await api.post(
    "auth/login/",
    {
      email: cleanEmail,
      password,
    }
  );

  return response.data;
};

// Register User
export const registerUser = async (
  username,
  email,
  password,
  phone
) => {
  const cleanUsername =
    username?.trim();

  const cleanEmail =
    email?.trim();

  const cleanPhone =
    phone?.trim();

  if (!cleanUsername) {
    throw new Error(
      "Username is required."
    );
  }

  if (!cleanEmail) {
    throw new Error(
      "Email is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  if (!cleanPhone) {
    throw new Error(
      "Phone is required."
    );
  }

  const response = await api.post(
    "auth/register/",
    {
      username: cleanUsername,
      email: cleanEmail,
      password,
      phone: cleanPhone,
    }
  );

  return response.data;
};