import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getVendorOrders,
  updateVendorOrderStatus,
} from "../../services/vendorService";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const loadOrders = async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getVendorOrders();

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "VENDOR ORDERS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Orders load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      setError("");

      const response =
        await updateVendorOrderStatus(
          orderId,
          newStatus
        );

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: response.status,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Order status update nahi ho paaya."
      );
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "All") {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.status === filter
    );
  }, [orders, filter]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN");
  };

  if (loading) {
    return (
      <main className="vendor-orders-page">
        <div className="vendor-container">
          <div className="products-loading">
            Loading orders...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-orders-page">
      <div className="vendor-container">
        <div className="vendor-orders-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>My Orders</h1>

            <p>
              Manage and update your
              customer orders.
            </p>
          </div>

          <select
            className="vendor-order-filter"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Orders
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="CONFIRMED">
              Confirmed
            </option>

            <option value="PROCESSING">
              Processing
            </option>

            <option value="SHIPPED">
              Shipped
            </option>

            <option value="DELIVERED">
              Delivered
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>

            <button
              className="btn btn-secondary"
              onClick={loadOrders}
              style={{
                marginLeft: "10px",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        <div className="vendor-orders-table-wrapper">
          {filteredOrders.length === 0 ? (
            <div className="products-empty">
              <h2>
                No Orders Found
              </h2>

              <p>
                There are no orders
                matching this filter.
              </p>
            </div>
          ) : (
            <table className="vendor-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          {
                            order.order_number
                          }
                        </strong>
                      </td>

                      <td>
                        <div>
                          <strong>
                            {
                              order.customer
                            }
                          </strong>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                            }}
                          >
                            {order.phone}
                          </small>
                        </div>
                      </td>

                      <td>
                        {order.items &&
                        order.items.length >
                          0 ? (
                          <div>
                            {order.items.map(
                              (item) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  style={{
                                    marginBottom:
                                      "4px",
                                  }}
                                >
                                  <strong>
                                    {
                                      item.product
                                    }
                                  </strong>

                                  <small
                                    style={{
                                      display:
                                        "block",
                                    }}
                                  >
                                    SKU:{" "}
                                    {
                                      item.sku
                                    }
                                  </small>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        {order.items &&
                        order.items.length >
                          0
                          ? order.items.reduce(
                              (
                                total,
                                item
                              ) =>
                                total +
                                Number(
                                  item.quantity ||
                                    0
                                ),
                              0
                            )
                          : 0}
                      </td>

                      <td>
                        ₹
                        {formatCurrency(
                          order.total
                        )}
                      </td>

                      <td>
                        {formatDate(
                          order.date
                        )}
                      </td>

                      <td>
                        <select
                          className={`order-status-select status-${order.status.toLowerCase()}`}
                          value={
                            order.status
                          }
                          onChange={(
                            event
                          ) =>
                            updateStatus(
                              order.id,
                              event.target
                                .value
                            )
                          }
                        >
                          <option value="PENDING">
                            Pending
                          </option>

                          <option value="CONFIRMED">
                            Confirmed
                          </option>

                          <option value="PROCESSING">
                            Processing
                          </option>

                          <option value="SHIPPED">
                            Shipped
                          </option>

                          <option value="DELIVERED">
                            Delivered
                          </option>

                          <option value="CANCELLED">
                            Cancelled
                          </option>
                        </select>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

export default VendorOrders;