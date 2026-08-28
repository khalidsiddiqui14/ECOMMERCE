import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [markingId, setMarkingId] =
    useState(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  const loadNotifications =
    useCallback(
      async (isRefresh = false) => {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const data =
            await getNotifications();

          const notificationList =
            Array.isArray(data)
              ? data
              : Array.isArray(data?.results)
                ? data.results
                : [];

          setNotifications(
            notificationList
          );
        } catch (error) {
          console.error(
            "NOTIFICATIONS ERROR:",
            error
          );

          setError(
            error.response?.data
              ?.detail ||
              error.response?.data
                ?.message ||
              error.message ||
              "Notifications load nahi ho paayi."
          );
        } finally {
          if (isRefresh) {
            setRefreshing(false);
          } else {
            setLoading(false);
          }
        }
      },
      []
    );

  useEffect(() => {
    let cancelled = false;

    const fetchNotifications =
      async () => {
        setLoading(true);
        setError("");

        try {
          const data =
            await getNotifications();

          if (cancelled) {
            return;
          }

          const notificationList =
            Array.isArray(data)
              ? data
              : Array.isArray(
                    data?.results
                  )
                ? data.results
                : [];

          setNotifications(
            notificationList
          );
        } catch (error) {
          console.error(
            "NOTIFICATIONS ERROR:",
            error
          );

          if (!cancelled) {
            setError(
              error.response?.data
                ?.detail ||
                error.response?.data
                  ?.message ||
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

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.is_read
      ).length,
    [notifications]
  );

  const handleMarkRead =
    async (notification) => {
      if (
        !notification?.id ||
        notification.is_read ||
        markingId === notification.id ||
        markingAll
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
              item.id ===
              notification.id
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
          error.response?.data
            ?.detail ||
            error.response?.data
              ?.message ||
            "Notification read mark nahi ho paayi."
        );
      } finally {
        setMarkingId(null);
      }
    };

  const handleMarkAllRead =
    async () => {
      const unreadNotifications =
        notifications.filter(
          (notification) =>
            !notification.is_read
        );

      if (
        unreadNotifications.length ===
        0
      ) {
        return;
      }

      setMarkingAll(true);
      setError("");

      try {
        const results =
          await Promise.allSettled(
            unreadNotifications.map(
              (notification) =>
                markNotificationRead(
                  notification.id
                )
            )
          );

        const successfulIds =
          new Set();

        results.forEach(
          (result, index) => {
            if (
              result.status ===
              "fulfilled"
            ) {
              successfulIds.add(
                unreadNotifications[
                  index
                ].id
              );
            }
          }
        );

        setNotifications(
          (previous) =>
            previous.map(
              (notification) =>
                successfulIds.has(
                  notification.id
                )
                  ? {
                      ...notification,
                      is_read: true,
                    }
                  : notification
            )
        );

        if (
          successfulIds.size !==
          unreadNotifications.length
        ) {
          setError(
            "Some notifications could not be marked as read. Please try again."
          );
        }
      } catch (error) {
        console.error(
          "MARK ALL READ ERROR:",
          error
        );

        setError(
          "Notifications mark as read nahi ho paayi."
        );
      } finally {
        setMarkingAll(false);
      }
    };

  const getNotificationIcon =
    (type) => {
      switch (
        type?.toLowerCase()
      ) {
        case "success":
          return "✓";

        case "warning":
          return "!";

        case "error":
          return "×";

        case "info":
          return "🚚";

        default:
          return "🔔";
      }
    };

  const formatDate = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    const date = new Date(
      createdAt
    );

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  if (loading) {
    return (
      <main className="notifications-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
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
            <h1>
              Notifications
            </h1>

            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount === 1
                      ? ""
                      : "s"
                  }.`
                : "You're all caught up."}
            </p>
          </div>

          <div className="notification-header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-read-button"
                onClick={
                  handleMarkAllRead
                }
                disabled={markingAll}
              >
                {markingAll
                  ? "Marking..."
                  : "Mark all as read"}
              </button>
            )}

            <button
              type="button"
              className="mark-read-button"
              onClick={() =>
                loadNotifications(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {notifications.length ===
        0 ? (
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
              onClick={() =>
                loadNotifications(
                  true
                )
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(
              (notification) => {
                const type =
                  (
                    notification.type ||
                    "info"
                  ).toLowerCase();

                const isUnread =
                  !notification.is_read;

                const isMarking =
                  markingId ===
                  notification.id;

                return (
                  <article
                    className={`notification-card notification-${type} ${
                      isUnread
                        ? "notification-unread"
                        : "notification-read"
                    }`}
                    key={
                      notification.id
                    }
                  >
                    <div
                      className="notification-icon"
                      aria-hidden="true"
                    >
                      {getNotificationIcon(
                        type
                      )}
                    </div>

                    <div className="notification-content">
                      <h3>
                        {notification.title ||
                          "Notification"}
                      </h3>

                      <p>
                        {notification.message ||
                          "You have a new notification."}
                      </p>

                      {notification.created_at && (
                        <time
                          dateTime={
                            notification.created_at
                          }
                        >
                          {formatDate(
                            notification.created_at
                          )}
                        </time>
                      )}
                    </div>

                    {isUnread && (
                      <div className="notification-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkRead(
                              notification
                            )
                          }
                          disabled={
                            isMarking ||
                            markingAll
                          }
                        >
                          {isMarking
                            ? "Saving..."
                            : "Mark as read"}
                        </button>
                      </div>
                    )}
                  </article>
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