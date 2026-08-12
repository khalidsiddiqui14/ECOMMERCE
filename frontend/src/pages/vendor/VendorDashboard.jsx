import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getVendorDashboard,
} from "../../services/vendorService";

function VendorDashboard() {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data =
          await getVendorDashboard();

        console.log(
          "VENDOR DASHBOARD:",
          data
        );

        setDashboard(data);
      } catch (error) {
        console.error(
          "VENDOR DASHBOARD ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.message ||
            "Dashboard load nahi ho paaya."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="vendor-dashboard-page">
        <div className="products-loading">
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="vendor-dashboard-page">
        <div className="products-empty">
          <h2>Dashboard Error</h2>

          <p>{error}</p>

          <button
            className="btn btn-primary"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const stats =
    dashboard?.stats || {};

  const recentOrders =
    dashboard?.recent_orders || [];

  return (
    <main className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">

        {/* Header */}

        <div className="vendor-dashboard-header">
          <div>
            <span className="vendor-label">
              VENDOR DASHBOARD
            </span>

            <h1>
              Welcome to{" "}
              {dashboard?.store?.name ||
                "Your Store"}
            </h1>

            <p>
              Manage your store, products and
              orders from one place.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="btn btn-primary"
          >
            Manage Products
          </Link>
        </div>

        {/* Stats */}

        <section className="vendor-stats-grid">

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon">
              📦
            </div>

            <div>
              <span>
                Total Products
              </span>

              <strong>
                {stats.total_products || 0}
              </strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon">
              🛒
            </div>

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {stats.total_orders || 0}
              </strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon">
              ⏳
            </div>

            <div>
              <span>
                Pending Orders
              </span>

              <strong>
                {stats.pending_orders || 0}
              </strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon">
              💰
            </div>

            <div>
              <span>
                Revenue
              </span>

              <strong>
                ₹
                {Number(
                  stats.revenue || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>

        </section>

        {/* Dashboard Content */}

        <section className="vendor-dashboard-content">

          <div className="vendor-orders-section">

            <div className="vendor-section-header">
              <div>
                <h2>
                  Recent Orders
                </h2>

                <p>
                  Latest orders containing
                  your products.
                </p>
              </div>

              <Link
                to="/vendor/orders"
                className="back-link"
              >
                View All →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="vendor-empty">
                <div>
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Orders containing your
                  products will appear here.
                </p>
              </div>
            ) : (
              <div className="vendor-orders-list">

                {recentOrders.map(
                  (order) => (
                    <div
                      className="vendor-order-card"
                      key={order.id}
                    >

                      <div className="vendor-order-header">

                        <div>
                          <span>
                            Order Number
                          </span>

                          <strong>
                            {order.order_number}
                          </strong>
                        </div>

                        <span className="vendor-order-status">
                          {order.status}
                        </span>

                      </div>

                      <div className="vendor-order-items">

                        {order.items?.map(
                          (item) => (
                            <div
                              className="vendor-order-item"
                              key={item.id}
                            >

                              <div className="vendor-product-icon">
                                📦
                              </div>

                              <div>
                                <strong>
                                  {
                                    item.product_name
                                  }
                                </strong>

                                <span>
                                  SKU:{" "}
                                  {item.sku}
                                </span>

                                <span>
                                  Qty:{" "}
                                  {item.quantity}
                                </span>
                              </div>

                              <strong>
                                ₹
                                {Number(
                                  item.total_price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                            </div>
                          )
                        )}

                      </div>

                      <div className="vendor-order-footer">

                        <div>
                          <span>
                            Payment
                          </span>

                          <strong>
                            {
                              order.payment_status
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Order Total
                          </span>

                          <strong>
                            ₹
                            {Number(
                              order.total_amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Date
                          </span>

                          <strong>
                            {new Date(
                              order.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* Quick Actions */}

          <aside className="vendor-quick-actions">

            <h2>
              Quick Actions
            </h2>

            <Link
              to="/vendor/products"
              className="vendor-action-card"
            >
              <span>
                📦
              </span>

              <div>
                <strong>
                  Products
                </strong>

                <small>
                  Manage your products
                </small>
              </div>
            </Link>

            <Link
              to="/vendor/orders"
              className="vendor-action-card"
            >
              <span>
                🛒
              </span>

              <div>
                <strong>
                  Orders
                </strong>

                <small>
                  Manage customer orders
                </small>
              </div>
            </Link>

            <Link
              to="/vendor/store"
              className="vendor-action-card"
            >
              <span>
                🏪
              </span>

              <div>
                <strong>
                  Store
                </strong>

                <small>
                  Manage store information
                </small>
              </div>
            </Link>

            <Link
              to="/vendor/profile"
              className="vendor-action-card"
            >
              <span>
                👤
              </span>

              <div>
                <strong>
                  Vendor Profile
                </strong>

                <small>
                  Manage vendor profile
                </small>
              </div>
            </Link>

          </aside>

        </section>

      </div>
    </main>
  );
}

export default VendorDashboard;