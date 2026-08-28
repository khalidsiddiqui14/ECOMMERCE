import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getVendorOrders,
  updateVendorOrderStatus,
} from "../../services/vendorService";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function VendorOrders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data =
          await getVendorOrders();

        const orderList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.results
              )
            ? data.results
            : [];

        setOrders(orderList);
      } catch (error) {
        console.error(
          "VENDOR ORDERS ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Orders load nahi ho paaye."
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

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getVendorOrders();

        if (cancelled) {
          return;
        }

        const orderList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.results
              )
            ? data.results
            : [];

        setOrders(orderList);
      } catch (error) {
        console.error(
          "VENDOR ORDERS ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
              error.message ||
              "Orders load nahi ho paaye."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = async (
    orderId,
    newStatus
  ) => {
    if (
      updatingOrderId !== null
    ) {
      return;
    }

    setError("");
    setUpdatingOrderId(orderId);

    try {
      const response =
        await updateVendorOrderStatus(
          orderId,
          newStatus
        );

      const updatedStatus =
        response?.status ||
        newStatus;

      setOrders(
        (previousOrders) =>
          previousOrders.map(
            (order) =>
              order.id === orderId
                ? {
                    ...order,
                    status:
                      updatedStatus,
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
          error.response?.data?.message ||
          error.message ||
          "Order status update nahi ho paaya."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "All") {
      return orders;
    }

    return orders.filter(
      (order) =>
        String(
          order.status || ""
        ).toUpperCase() ===
        filter
    );
  }, [orders, filter]);

  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status =
        String(
          order.status || ""
        ).toUpperCase();

      if (status === "PENDING") {
        stats.pending += 1;
      }

      if (
        status ===
          "CONFIRMED" ||
        status === "PROCESSING"
      ) {
        stats.processing += 1;
      }

      if (status === "SHIPPED") {
        stats.shipped += 1;
      }

      if (status === "DELIVERED") {
        stats.delivered += 1;
      }

      if (status === "CANCELLED") {
        stats.cancelled += 1;
      }
    });

    return stats;
  }, [orders]);

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatCurrency = (
    amount
  ) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN");
  };

  const getOrderItemCount = (
    order
  ) => {
    if (
      !Array.isArray(
        order?.items
      )
    ) {
      return 0;
    }

    return order.items.reduce(
      (total, item) =>
        total +
        Number(
          item?.quantity || 0
        ),
      0
    );
  };

  const getCustomerName = (
    order
  ) => {
    return (
      order?.customer ||
      order?.customer_name ||
      order?.user?.username ||
      "Customer"
    );
  };

  const getCustomerPhone = (
    order
  ) => {
    return (
      order?.phone ||
      order?.customer_phone ||
      order?.user?.phone ||
      ""
    );
  };

  const getOrderTotal = (
    order
  ) => {
    return (
      order?.total ??
      order?.total_amount ??
      0
    );
  };

  const getOrderDate = (
    order
  ) => {
    return (
      order?.date ||
      order?.created_at ||
      order?.created
    );
  };

  const getStatusLabel = (
    status
  ) => {
    if (!status) {
      return "Unknown";
    }

    return String(status)
      .replaceAll("_", " ")
      .replace(
        /^./,
        (character) =>
          character.toUpperCase()
      );
  };

  if (loading) {
    return (
      <main className="vendor-orders-page">
        <div className="vendor-container">
          <div
            className="products-loading"
            role="status"
            aria-live="polite"
          >
            Loading orders...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-orders-page">
      <div className="vendor-container">

        {/* HEADER */}

        <div className="vendor-orders-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              My Orders
            </h1>

            <p>
              Manage and update your
              customer orders.
            </p>
          </div>

          <div className="vendor-orders-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <select
              className="vendor-order-filter"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              aria-label="Filter orders by status"
            >
              <option value="All">
                All Orders
              </option>

              {ORDER_STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {getStatusLabel(
                      status
                    )}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            <span>
              {error}
            </span>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Retrying..."
                : "Try Again"}
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="vendor-orders-summary">
          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {orderStats.total}
            </strong>
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {orderStats.pending}
            </strong>
          </div>

          <div>
            <span>
              Processing
            </span>

            <strong>
              {orderStats.processing}
            </strong>
          </div>

          <div>
            <span>
              Shipped
            </span>

            <strong>
              {orderStats.shipped}
            </strong>
          </div>

          <div>
            <span>
              Delivered
            </span>

            <strong>
              {orderStats.delivered}
            </strong>
          </div>

          <div>
            <span>
              Cancelled
            </span>

            <strong>
              {orderStats.cancelled}
            </strong>
          </div>
        </div>

        {/* TABLE */}

        <div className="vendor-orders-table-wrapper">
          {filteredOrders.length ===
          0 ? (
            <div className="products-empty">
              <h2>
                No Orders Found
              </h2>

              <p>
                {orders.length === 0
                  ? "There are no customer orders yet."
                  : "There are no orders matching this filter."}
              </p>

              {orders.length >
                0 &&
                filter !==
                  "All" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setFilter(
                        "All"
                      )
                    }
                  >
                    View All Orders
                  </button>
                )}
            </div>
          ) : (
            <table className="vendor-orders-table">
              <thead>
                <tr>
                  <th>
                    Order ID
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => {
                    const status =
                      String(
                        order.status ||
                          "PENDING"
                      ).toUpperCase();

                    const isUpdating =
                      updatingOrderId ===
                      order.id;

                    const items =
                      Array.isArray(
                        order.items
                      )
                        ? order.items
                        : [];

                    return (
                      <tr
                        key={
                          order.id
                        }
                      >
                        {/* ORDER */}

                        <td>
                          <strong>
                            {order.order_number ||
                              `#${order.id}`}
                          </strong>
                        </td>

                        {/* CUSTOMER */}

                        <td>
                          <div>
                            <strong>
                              {getCustomerName(
                                order
                              )}
                            </strong>

                            {getCustomerPhone(
                              order
                            ) && (
                              <small
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                {
                                  getCustomerPhone(
                                    order
                                  )
                                }
                              </small>
                            )}
                          </div>
                        </td>

                        {/* PRODUCTS */}

                        <td>
                          {items.length >
                          0 ? (
                            <div>
                              {items.map(
                                (
                                  item
                                ) => (
                                  <div
                                    key={
                                      item.id ||
                                      `${order.id}-${item.product}`
                                    }
                                    style={{
                                      marginBottom:
                                        "6px",
                                    }}
                                  >
                                    <strong>
                                      {item.product ||
                                        item.product_name ||
                                        `Product #${item.product_id || ""}`}
                                    </strong>

                                    {item.sku && (
                                      <small
                                        style={{
                                          display:
                                            "block",
                                          marginTop:
                                            "2px",
                                        }}
                                      >
                                        SKU:{" "}
                                        {
                                          item.sku
                                        }
                                      </small>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* QUANTITY */}

                        <td>
                          {getOrderItemCount(
                            order
                          )}
                        </td>

                        {/* TOTAL */}

                        <td>
                          ₹
                          {formatCurrency(
                            getOrderTotal(
                              order
                            )
                          )}
                        </td>

                        {/* DATE */}

                        <td>
                          {formatDate(
                            getOrderDate(
                              order
                            )
                          )}
                        </td>

                        {/* STATUS */}

                        <td>
                          <select
                            className={`order-status-select status-${status.toLowerCase()}`}
                            value={
                              status
                            }
                            onChange={(
                              event
                            ) =>
                              updateStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            disabled={
                              isUpdating ||
                              updatingOrderId !==
                                null
                            }
                            aria-label={`Update order ${
                              order.order_number ||
                              order.id
                            } status`}
                          >
                            {ORDER_STATUSES.map(
                              (
                                orderStatus
                              ) => (
                                <option
                                  key={
                                    orderStatus
                                  }
                                  value={
                                    orderStatus
                                  }
                                >
                                  {getStatusLabel(
                                    orderStatus
                                  )}
                                </option>
                              )
                            )}
                          </select>

                          {isUpdating && (
                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "5px",
                              }}
                            >
                              Updating...
                            </small>
                          )}
                        </td>
                      </tr>
                    );
                  }
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