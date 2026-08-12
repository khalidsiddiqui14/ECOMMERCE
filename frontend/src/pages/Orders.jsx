import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();

        setOrders(data.results || data);
      } catch (error) {
        console.error("ORDERS ERROR:", error);

        setError(
          error.response?.data?.detail ||
            error.message ||
            "Orders load nahi ho paaye."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="products-loading">
          Loading orders...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="products-empty">
          <h2>Orders Error</h2>

          <p>{error}</p>

          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
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
              View and track your orders.
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
            <div className="orders-empty-icon">
              📦
            </div>

            <h2>No Orders Yet</h2>

            <p>
              Your placed orders will appear here.
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
            {orders.map((order) => (
              <div
                className="order-card"
                key={order.id}
              >
                <div className="order-card-header">
                  <div>
                    <span>Order Number</span>

                    <strong>
                      {order.order_number ||
                        `#${order.id}`}
                    </strong>
                  </div>

                  <div className="order-status">
                    {order.status ||
                      "PLACED"}
                  </div>
                </div>

                <div className="order-card-body">
                  <div>
                    <span>Order Date</span>

                    <strong>
                      {order.created_at
                        ? new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Items</span>

                    <strong>
                      {order.items?.length || 0}
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>

                    <strong>
                      ₹
                      {Number(
                        order.total_amount || 0
                      ).toLocaleString(
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;