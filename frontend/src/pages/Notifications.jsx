const notifications = [
  {
    id: 1,
    title: "Order Delivered",
    message: "Your order ORD-A1B2C3D4 has been delivered.",
    time: "2 hours ago",
    type: "success",
  },
  {
    id: 2,
    title: "Order Shipped",
    message: "Your order ORD-E5F6G7H8 is on the way.",
    time: "1 day ago",
    type: "info",
  },
  {
    id: 3,
    title: "Payment Pending",
    message: "Payment is pending for order ORD-I9J0K1L2.",
    time: "2 days ago",
    type: "warning",
  },
];

function Notifications() {
  return (
    <main className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your account and orders.</p>
          </div>

          <button className="mark-read-button">
            Mark all as read
          </button>
        </div>

        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              className={`notification-card notification-${notification.type}`}
              key={notification.id}
            >
              <div className="notification-icon">
                {notification.type === "success" && "✓"}
                {notification.type === "info" && "🚚"}
                {notification.type === "warning" && "!"}
              </div>

              <div className="notification-content">
                <h3>{notification.title}</h3>

                <p>{notification.message}</p>

                <span>{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Notifications;