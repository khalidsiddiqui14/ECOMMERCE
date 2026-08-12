import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getOrder } from "../services/orderService";

function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(id);

        setOrder(data);
      } catch (error) {
        console.error("ORDER DETAIL ERROR:", error);

        setError(
          error.response?.data?.detail ||
            error.message ||
            "Order load nahi ho paaya."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="order-detail-page">
        <div className="products-loading">
          Loading order...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-detail-page">
        <div className="products-empty">
          <h2>Order Not Found</h2>

          <p>
            {error || "This order does not exist."}
          </p>

          <Link
            to="/orders"
            className="btn btn-primary"
          >
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <div>
            <h1>Order Details</h1>

            <p>
              Order #{order.order_number}
            </p>
          </div>

          <Link
            to="/orders"
            className="btn btn-secondary"
          >
            Back to Orders
          </Link>
        </div>

        <div className="order-detail-status">
          <div>
            <span>Order Status</span>

            <strong>{order.status}</strong>
          </div>

          <div>
            <span>Payment Status</span>

            <strong>
              {order.payment_status}
            </strong>
          </div>

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
        </div>

        <section className="order-detail-card">
          <h2>Items</h2>

          <div className="order-detail-items">
            {order.items?.map((item) => (
              <div
                className="order-detail-item"
                key={item.id}
              >
                <div className="order-item-image">
                  📦
                </div>

                <div className="order-item-info">
                  <h3>
                    {item.product_name ||
                      item.product?.name ||
                      `Product #${item.product}`}
                  </h3>

                  <p>
                    Quantity:{" "}
                    {item.quantity}
                  </p>

                  <p>
                    Price: ₹
                    {Number(
                      item.price || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <strong>
                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(
                      item.quantity || 0
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <div className="order-detail-grid">
          <section className="order-detail-card">
            <h2>Shipping Details</h2>

            <div className="shipping-details">
              <p>
                <strong>Name:</strong>{" "}
                {order.shipping_name}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {order.shipping_phone}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {order.shipping_address}
              </p>

              <p>
                <strong>City:</strong>{" "}
                {order.shipping_city}
              </p>

              <p>
                <strong>State:</strong>{" "}
                {order.shipping_state}
              </p>

              <p>
                <strong>Country:</strong>{" "}
                {order.shipping_country}
              </p>

              <p>
                <strong>Postal Code:</strong>{" "}
                {order.shipping_postal_code}
              </p>

              {order.notes && (
                <p>
                  <strong>Notes:</strong>{" "}
                  {order.notes}
                </p>
              )}
            </div>
          </section>

          <section className="order-detail-card order-summary-card">
            <h2>Order Summary</h2>

            <div className="order-summary-row">
              <span>Subtotal</span>

              <strong>
                ₹
                {Number(
                  order.subtotal || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="order-summary-row">
              <span>Shipping</span>

              <strong>
                ₹
                {Number(
                  order.shipping_cost || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="order-summary-total">
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
          </section>
        </div>
      </div>
    </main>
  );
}

export default OrderDetail;