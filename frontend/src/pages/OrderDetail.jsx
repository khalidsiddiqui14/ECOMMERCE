import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getOrder } from "../services/orderService";

function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load order
  const loadOrder = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getOrder(id);

        if (!data) {
          throw new Error(
            "Order data was not returned."
          );
        }

        setOrder(data);
      } catch (error) {
        console.error(
          "ORDER DETAIL ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Order load nahi ho paaya."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <main className="order-detail-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading order...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-detail-page">
        <div className="products-empty">
          <h2>
            Unable to Load Order
          </h2>

          <p>
            {error ||
              "This order does not exist."}
          </p>

          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                loadOrder()
              }
            >
              Try Again
            </button>

            <Link
              to="/orders"
              className="btn btn-secondary"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items = Array.isArray(
    order.items
  )
    ? order.items
    : [];

  const orderNumber =
    order.order_number ||
    `#${order.id}`;

  const orderStatus =
    order.status ||
    "PLACED";

  const paymentStatus =
    order.payment_status ||
    "PENDING";

  const orderDate = order.created_at
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

  const subtotal = Number(
    order.subtotal || 0
  );

  const shippingCost = Number(
    order.shipping_cost || 0
  );

  const totalAmount = Number(
    order.total_amount || 0
  );

  return (
    <main className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <div>
            <h1>
              Order Details
            </h1>

            <p>
              Order {orderNumber}
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
            <span>
              Order Status
            </span>

            <strong>
              {orderStatus}
            </strong>
          </div>

          <div>
            <span>
              Payment Status
            </span>

            <strong>
              {paymentStatus}
            </strong>
          </div>

          <div>
            <span>
              Order Date
            </span>

            <strong>
              {orderDate}
            </strong>
          </div>
        </div>

        <section className="order-detail-card">
          <h2>Items</h2>

          {items.length === 0 ? (
            <div className="products-empty">
              <p>
                No items were found in
                this order.
              </p>
            </div>
          ) : (
            <div className="order-detail-items">
              {items.map((item) => {
                const product =
                  item.product || {};

                const itemPrice =
                  Number(
                    item.price ||
                      item.product_price ||
                      product.price ||
                      0
                  );

                const quantity =
                  Number(
                    item.quantity || 0
                  );

                const itemTotal =
                  itemPrice * quantity;

                const productName =
                  item.product_name ||
                  product.name ||
                  `Product #${item.product}`;

                return (
                  <div
                    className="order-detail-item"
                    key={item.id}
                  >
                    <div
                      className="order-item-image"
                      aria-hidden="true"
                    >
                      📦
                    </div>

                    <div className="order-item-info">
                      <h3>
                        {productName}
                      </h3>

                      <p>
                        Quantity:{" "}
                        {quantity}
                      </p>

                      <p>
                        Price: ₹
                        {itemPrice.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <strong>
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="order-detail-grid">
          <section className="order-detail-card">
            <h2>
              Shipping Details
            </h2>

            <div className="shipping-details">
              <p>
                <strong>
                  Name:
                </strong>{" "}
                {order.shipping_name ||
                  "-"}
              </p>

              <p>
                <strong>
                  Phone:
                </strong>{" "}
                {order.shipping_phone ||
                  "-"}
              </p>

              <p>
                <strong>
                  Address:
                </strong>{" "}
                {order.shipping_address ||
                  "-"}
              </p>

              <p>
                <strong>
                  City:
                </strong>{" "}
                {order.shipping_city ||
                  "-"}
              </p>

              <p>
                <strong>
                  State:
                </strong>{" "}
                {order.shipping_state ||
                  "-"}
              </p>

              <p>
                <strong>
                  Country:
                </strong>{" "}
                {order.shipping_country ||
                  "-"}
              </p>

              <p>
                <strong>
                  Postal Code:
                </strong>{" "}
                {order.shipping_postal_code ||
                  "-"}
              </p>

              {order.notes && (
                <p>
                  <strong>
                    Notes:
                  </strong>{" "}
                  {order.notes}
                </p>
              )}
            </div>
          </section>

          <section className="order-detail-card order-summary-card">
            <h2>
              Order Summary
            </h2>

            <div className="order-summary-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="order-summary-row">
              <span>
                Shipping
              </span>

              <strong>
                ₹
                {shippingCost.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="order-summary-total">
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
          </section>
        </div>
      </div>
    </main>
  );
}

export default OrderDetail;