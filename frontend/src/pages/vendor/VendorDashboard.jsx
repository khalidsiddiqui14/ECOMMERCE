import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getVendorDashboard } from "../../services/vendorService";

function VendorDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getVendorDashboard();

        console.log(
          "VENDOR DASHBOARD:",
          data
        );

        setDashboard(data || {});
      } catch (error) {
        console.error(
          "VENDOR DASHBOARD ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Dashboard load nahi ho paaya."
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

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getVendorDashboard();

        if (!cancelled) {
          setDashboard(data || {});
        }
      } catch (error) {
        console.error(
          "VENDOR DASHBOARD ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
              error.message ||
              "Dashboard load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboard?.stats || {};

  const recentOrders = Array.isArray(
    dashboard?.recent_orders
  )
    ? dashboard.recent_orders
    : [];

  const storeName =
    dashboard?.store?.name ||
    "Your Store";

  const totalProducts = Number(
    stats.total_products || 0
  );

  const totalOrders = Number(
    stats.total_orders || 0
  );

  const pendingOrders = Number(
    stats.pending_orders || 0
  );

  const revenue = Number(
    stats.revenue || 0
  );

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <main className="vendor-dashboard-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (error && !dashboard) {
    return (
      <main className="vendor-dashboard-page">
        <div className="products-empty">
          <h2>Dashboard Error</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              loadDashboard(true)
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Retrying..."
              : "Try Again"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">
        {/* HEADER */}

        <div className="vendor-dashboard-header">
          <div>
            <span className="vendor-label">
              VENDOR DASHBOARD
            </span>

            <h1>
              Welcome to {storeName}
            </h1>

            <p>
              Manage your store, products
              and orders from one place.
            </p>
          </div>

          <div className="vendor-dashboard-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link
              to="/vendor/products"
              className="btn btn-primary"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* STATS */}

        <section
          className="vendor-stats-grid"
          aria-label="Store statistics"
        >
          <div className="vendor-stat-card">
            <div
              className="vendor-stat-icon"
              aria-hidden="true"
            >
              📦
            </div>

            <div>
              <span>
                Total Products
              </span>

              <strong>
                {totalProducts}
              </strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div
              className="vendor-stat-icon"
              aria-hidden="true"
            >
              🛒
            </div>

            <div>
              <span>
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div
              className="vendor-stat-icon"
              aria-hidden="true"
            >
              ⏳
            </div>

            <div>
              <span>
                Pending Orders
              </span>

              <strong>
                {pendingOrders}
              </strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div
              className="vendor-stat-icon"
              aria-hidden="true"
            >
              💰
            </div>

            <div>
              <span>
                Revenue
              </span>

              <strong>
                {formatCurrency(
                  revenue
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* DASHBOARD CONTENT */}

        <section className="vendor-dashboard-content">
          {/* RECENT ORDERS */}

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

            {recentOrders.length ===
            0 ? (
              <div className="vendor-empty">
                <div
                  aria-hidden="true"
                >
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Orders containing your
                  products will appear
                  here.
                </p>

                <Link
                  to="/vendor/products"
                  className="btn btn-primary"
                >
                  Manage Products
                </Link>
              </div>
            ) : (
              <div className="vendor-orders-list">
                {recentOrders.map(
                  (order) => {
                    const items =
                      Array.isArray(
                        order?.items
                      )
                        ? order.items
                        : [];

                    return (
                      <article
                        className="vendor-order-card"
                        key={
                          order.id
                        }
                      >
                        <div className="vendor-order-header">
                          <div>
                            <span>
                              Order Number
                            </span>

                            <strong>
                              {order.order_number ||
                                `#${order.id}`}
                            </strong>
                          </div>

                          <span className="vendor-order-status">
                            {order.status ||
                              "PLACED"}
                          </span>
                        </div>

                        <div className="vendor-order-items">
                          {items.length ===
                          0 ? (
                            <span>
                              No item details
                              available.
                            </span>
                          ) : (
                            items.map(
                              (item) => (
                                <div
                                  className="vendor-order-item"
                                  key={
                                    item.id
                                  }
                                >
                                  <div
                                    className="vendor-product-icon"
                                    aria-hidden="true"
                                  >
                                    📦
                                  </div>

                                  <div>
                                    <strong>
                                      {item.product_name ||
                                        item.product?.name ||
                                        `Product #${item.product || "-"}`}
                                    </strong>

                                    <span>
                                      SKU:{" "}
                                      {item.sku ||
                                        "-"}
                                    </span>

                                    <span>
                                      Qty:{" "}
                                      {Number(
                                        item.quantity ||
                                          0
                                      )}
                                    </span>
                                  </div>

                                  <strong>
                                    {formatCurrency(
                                      item.total_price
                                    )}
                                  </strong>
                                </div>
                              )
                            )
                          )}
                        </div>

                        <div className="vendor-order-footer">
                          <div>
                            <span>
                              Payment
                            </span>

                            <strong>
                              {order.payment_status ||
                                "-"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Order Total
                            </span>

                            <strong>
                              {formatCurrency(
                                order.total_amount
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Date
                            </span>

                            <strong>
                              {formatDate(
                                order.created_at
                              )}
                            </strong>
                          </div>
                        </div>

                        <div className="vendor-order-footer">
                          <Link
                            to={`/orders/${order.id}`}
                            className="back-link"
                          >
                            View Order →
                          </Link>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}

          <aside className="vendor-quick-actions">
            <h2>
              Quick Actions
            </h2>

            <Link
              to="/vendor/products"
              className="vendor-action-card"
            >
              <span aria-hidden="true">
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
              to="/vendor/products/create"
              className="vendor-action-card"
            >
              <span aria-hidden="true">
                ➕
              </span>

              <div>
                <strong>
                  Add Product
                </strong>

                <small>
                  Create a new product
                </small>
              </div>
            </Link>

            <Link
              to="/vendor/orders"
              className="vendor-action-card"
            >
              <span aria-hidden="true">
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
              <span aria-hidden="true">
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
              <span aria-hidden="true">
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