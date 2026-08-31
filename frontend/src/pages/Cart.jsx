import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cartService";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingItemId, setUpdatingItemId] =
    useState(null);

  const [removingItemId, setRemovingItemId] =
    useState(null);

  // Load cart
  const loadCart = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getCart();

        setCart(data);
      } catch (error) {
        console.error(
          "CART ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Cart load nahi ho paaya."
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
    let cancelled = false;

    const fetchCart = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCart();

        if (!cancelled) {
          setCart(data);
        }
      } catch (error) {
        console.error(
          "CART ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
              error.message ||
              "Cart load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update quantity
  const updateQuantity = async (
    itemId,
    newQuantity
  ) => {
    const quantity = Number(
      newQuantity
    );

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return;
    }

    setUpdatingItemId(itemId);
    setError("");

    try {
      const data = await updateCartItem(
        itemId,
        quantity
      );

      setCart(data);
    } catch (error) {
      console.error(
        "CART QUANTITY ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Quantity update nahi ho paayi."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Handle quantity input
  const handleQuantityChange = async (
    itemId,
    value
  ) => {
    await updateQuantity(
      itemId,
      value
    );
  };

  // Decrease quantity
  const handleDecrease = async (
    itemId,
    quantity
  ) => {
    if (quantity <= 1) {
      return;
    }

    await updateQuantity(
      itemId,
      quantity - 1
    );
  };

  // Increase quantity
  const handleIncrease = async (
    itemId,
    quantity
  ) => {
    await updateQuantity(
      itemId,
      quantity + 1
    );
  };

  // Remove cart item
  const handleRemove = async (itemId) => {
    if (removingItemId === itemId) {
      return;
    }

    setRemovingItemId(itemId);
    setError("");

    try {
      await removeCartItem(itemId);

      await loadCart(false);
    } catch (error) {
      console.error(
        "CART REMOVE ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Item remove nahi ho paya."
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  if (loading) {
    return (
      <main className="cart-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading cart...
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="products-empty">
          <h2>Unable to Load Cart</h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              loadCart()
            }
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const items = Array.isArray(
    cart?.items
  )
    ? cart.items
    : [];

  const subtotal = items.reduce(
    (total, item) => {
      const product =
        item.product || {};

      const price = Number(
        item.price ??
          item.product_price ??
          product.price ??
          0
      );

      const quantity = Number(
        item.quantity || 0
      );

      return (
        total +
        price * quantity
      );
    },
    0
  );

  const totalItems = items.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  const isCartBusy =
    updatingItemId !== null ||
    removingItemId !== null;

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div>
            <h1>Shopping Cart</h1>

            <p>
              {totalItems} item
              {totalItems === 1
                ? ""
                : "s"} in your cart.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <div
              className="cart-empty-icon"
              aria-hidden="true"
            >
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Add some products to your
              cart and they will appear
              here.
            </p>

            <Link
              to="/products"
              className="btn btn-primary"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section
              className="cart-items"
              aria-label="Shopping cart items"
            >
              {items.map((item) => {
                const product =
                  item.product || {};

                const price = Number(
                  item.price ??
                    item.product_price ??
                    product.price ??
                    0
                );

                const quantity = Number(
                  item.quantity || 0
                );

                const itemTotal =
                  price * quantity;

                const isUpdating =
                  updatingItemId ===
                  item.id;

                const isRemoving =
                  removingItemId ===
                  item.id;

                const productName =
                  item.product_name ||
                  product.name ||
                  `Product #${item.product}`;

                return (
                  <article
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-item-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={
                            productName
                          }
                          loading="lazy"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span
                          role="img"
                          aria-label="Product image unavailable"
                        >
                          📦
                        </span>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <h3>
                        {productName}
                      </h3>

                      <p>
                        ₹
                        {price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <div className="cart-item-controls">
                        <label
                          htmlFor={`quantity-${item.id}`}
                        >
                          Quantity
                        </label>

                        <div>
                          <button
                            type="button"
                            disabled={
                              isUpdating ||
                              isRemoving ||
                              quantity <= 1
                            }
                            onClick={() =>
                              handleDecrease(
                                item.id,
                                quantity
                              )
                            }
                            aria-label={`Decrease quantity of ${productName}`}
                          >
                            −
                          </button>

                          <input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            value={quantity}
                            disabled={
                              isUpdating ||
                              isRemoving
                            }
                            onChange={(
                              event
                            ) =>
                              handleQuantityChange(
                                item.id,
                                event.target.value
                              )
                            }
                            aria-label={`Quantity for ${productName}`}
                          />

                          <button
                            type="button"
                            disabled={
                              isUpdating ||
                              isRemoving
                            }
                            onClick={() =>
                              handleIncrease(
                                item.id,
                                quantity
                              )
                            }
                            aria-label={`Increase quantity of ${productName}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isRemoving
                          }
                          onClick={() =>
                            handleRemove(
                              item.id
                            )
                          }
                        >
                          {isRemoving
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>

                      {isUpdating && (
                        <small
                          role="status"
                          aria-live="polite"
                        >
                          Updating quantity...
                        </small>
                      )}
                    </div>

                    <div className="cart-item-total">
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items</span>

                <strong>
                  {totalItems}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Shipping</span>

                <strong>Free</strong>
              </div>

              <div className="cart-summary-total">
                <span>Total</span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="btn btn-primary cart-checkout-button"
                onClick={() =>
                  navigate("/checkout")
                }
                disabled={
                  isCartBusy ||
                  items.length === 0
                }
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;