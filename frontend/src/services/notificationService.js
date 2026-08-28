import api from "./api";

// Get Notifications
export const getNotifications = async () => {
  const response = await api.get(
    "notifications/"
  );

  return response.data;
};

// Get Notification
export const getNotification = async (
  id
) => {
  const notificationId =
    Number(id);

  if (
    !Number.isInteger(
      notificationId
    ) ||
    notificationId <= 0
  ) {
    throw new Error(
      "Invalid notification ID."
    );
  }

  const response = await api.get(
    `notifications/${notificationId}/`
  );

  return response.data;
};

// Mark Notification Read
export const markNotificationRead =
  async (id) => {
    const notificationId =
      Number(id);

    if (
      !Number.isInteger(
        notificationId
      ) ||
      notificationId <= 0
    ) {
      throw new Error(
        "Invalid notification ID."
      );
    }

    const response =
      await api.patch(
        `notifications/${notificationId}/read/`
      );

    return response.data;
  };

// Get Notification Preferences
export const getNotificationPreferences =
  async () => {
    const response =
      await api.get(
        "notifications/preferences/"
      );

    return response.data;
  };

// Update Notification Preferences
export const updateNotificationPreferences =
  async (data) => {
    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new Error(
        "Invalid notification preferences."
      );
    }

    const response =
      await api.patch(
        "notifications/preferences/",
        data
      );

    return response.data;
  };