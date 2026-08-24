import api from "./api";

export const getNotifications = async () => {
  const response = await api.get(
    "notifications/"
  );

  return response.data;
};

export const getNotification = async (id) => {
  const response = await api.get(
    `notifications/${id}/`
  );

  return response.data;
};

export const markNotificationRead = async (
  id
) => {
  const response = await api.patch(
    `notifications/${id}/read/`
  );

  return response.data;
};
export const getNotificationPreferences = async () => {
  const response = await api.get(
    "notifications/preferences/"
  );

  return response.data;
};

export const updateNotificationPreferences = async (
  data
) => {
  const response = await api.patch(
    "notifications/preferences/",
    data
  );

  return response.data;
};