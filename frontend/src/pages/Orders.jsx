import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load orders
  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getOrders();

        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setOrders(orderList);
      } catch (error) {
        console.error(
          "ORDERS ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Orders load nahi ho paaye."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <main className="orders-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading orders...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="products-empty">
          <h2>
            Unable to Load Orders
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => loadOrders()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1>My Orders</h1>

            <p>
              {orders.length} order
              {orders.length === 1
                ? ""
                : "s"} placed.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div
              className="orders-empty-icon"
              aria-hidden="true"
            >
              📦
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p>
              Your placed orders will
              appear here.
            </p>

            <Link
              to="/products"
              className="btn btn-primary"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const orderNumber =
                order.order_number ||
                `#${order.id}`;

              const itemCount =
                Array.isArray(order.items)
                  ? order.items.length
                  : Number(
                      order.item_count || 0
                    );

              const totalAmount = Number(
                order.total_amount || 0
              );

              const orderDate =
                order.created_at
                  ? new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "-";

              const orderStatus =
                order.status ||
                "PLACED";

              return (
                <article
                  className="order-card"
                  key={order.id}
                >
                  <div className="order-card-header">
                    <div>
                      <span>
                        Order Number
                      </span>

                      <strong>
                        {orderNumber}
                      </strong>
                    </div>

                    <div
                      className="order-status"
                      aria-label={`Order status: ${orderStatus}`}
                    >
                      {orderStatus}
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div>
                      <span>
                        Order Date
                      </span>

                      <strong>
                        {orderDate}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Items
                      </span>

                      <strong>
                        {itemCount}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        ₹
                        {totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-secondary"
                    >
                      View Order
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;