import { useEffect, useState } from "react";

import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [markingId, setMarkingId] =
    useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const data =
        await getNotifications();

      setNotifications(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (error) {
      console.error(
        "NOTIFICATIONS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Notifications load nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getNotifications();

        if (!cancelled) {
          setNotifications(
            Array.isArray(data)
              ? data
              : data?.results || []
          );
        }
      } catch (error) {
        console.error(
          "NOTIFICATIONS ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.message ||
              "Notifications load nahi ho paayi."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkRead = async (
    notification
  ) => {
    if (
      notification.is_read ||
      markingId === notification.id
    ) {
      return;
    }

    setMarkingId(notification.id);
    setError("");

    try {
      const updated =
        await markNotificationRead(
          notification.id
        );

      setNotifications(
        (previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  ...updated,
                  is_read: true,
                }
              : item
          )
      );
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Notification read mark nahi ho paayi."
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unread =
      notifications.filter(
        (notification) =>
          !notification.is_read
      );

    for (const notification of unread) {
      try {
        await markNotificationRead(
          notification.id
        );
      } catch (error) {
        console.error(
          "MARK ALL READ ERROR:",
          error
        );
      }
    }

    setNotifications(
      (previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
    );
  };

  if (loading) {
    return (
      <main className="notifications-page">
        <div className="products-loading">
          Loading notifications...
        </div>
      </main>
    );
  }

  return (
    <main className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your
              account and orders.
            </p>
          </div>

          {notifications.some(
            (notification) =>
              !notification.is_read
          ) && (
            <button
              type="button"
              className="mark-read-button"
              onClick={
                handleMarkAllRead
              }
            >
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="products-empty">
            <h2>
              No Notifications
            </h2>

            <p>
              You don't have any
              notifications yet.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                loadNotifications
              }
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(
              (notification) => {
                const type =
                  notification.type ||
                  "info";

                return (
                  <div
                    className={`notification-card notification-${type} ${
                      notification.is_read
                        ? "notification-read"
                        : "notification-unread"
                    }`}
                    key={
                      notification.id
                    }
                    onClick={() =>
                      handleMarkRead(
                        notification
                      )
                    }
                  >
                    <div className="notification-icon">
                      {type ===
                        "success" && "✓"}

                      {type ===
                        "info" && "🚚"}

                      {type ===
                        "warning" && "!"}

                      {![
                        "success",
                        "info",
                        "warning",
                      ].includes(
                        type
                      ) && "🔔"}
                    </div>

                    <div className="notification-content">
                      <h3>
                        {notification.title ||
                          "Notification"}
                      </h3>

                      <p>
                        {notification.message ||
                          ""}
                      </p>

                      <span>
                        {notification.created_at
                          ? new Date(
                              notification.created_at
                            ).toLocaleString(
                              "en-IN"
                            )
                          : ""}
                      </span>
                    </div>

                    {!notification.is_read && (
                      <div className="notification-actions">
                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            handleMarkRead(
                              notification
                            );
                          }}
                          disabled={
                            markingId ===
                            notification.id
                          }
                        >
                          {markingId ===
                          notification.id
                            ? "Saving..."
                            : "Mark as read"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;