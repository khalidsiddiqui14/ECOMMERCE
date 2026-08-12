import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../services/cartService";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setError("");

      const data = await getCart();

      setCart(data);
    } catch (error) {
      console.error("CART ERROR:", error);

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Cart load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (
    itemId,
    quantity
  ) => {
    if (quantity < 1) return;

    try {
      const data = await updateCartItem(
        itemId,
        quantity
      );

      setCart(data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Quantity update nahi ho paayi."
      );
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);

      await loadCart();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.detail ||
          "Item remove nahi ho paya."
      );
    }
  };

  if (loading) {
    return (
      <main className="cart-page">
        <div className="products-loading">
          Loading cart...
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="products-empty">
          <h2>Cart Error</h2>

          <p>{error}</p>

          <button
            className="btn btn-primary"
            onClick={loadCart}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  const subtotal = items.reduce(
    (total, item) => {
      const price = Number(
        item.price ??
          item.product_price ??
          item.product?.price ??
          0
      );

      return (
        total +
        price * Number(item.quantity || 0)
      );
    },
    0
  );

  return (
    <main className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div>
            <h1>Shopping Cart</h1>

            <p>
              Review your items before checkout.
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
          <div className="auth-error">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Add some products to your cart and
              they will appear here.
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
            <section className="cart-items">
              {items.map((item) => {
                const product =
                  item.product || {};

                const price = Number(
                  item.price ??
                    item.product_price ??
                    product.price ??
                    0
                );

                return (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-item-image">
                      {product.name
                        ? "📦"
                        : "🛍️"}
                    </div>

                    <div className="cart-item-info">
                      <h3>
                        {item.product_name ||
                          product.name ||
                          `Product #${item.product}`}
                      </h3>

                      <p>
                        ₹
                        {price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <div className="cart-item-controls">
                        <label>
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleQuantityChange(
                              item.id,
                              Number(
                                event.target.value
                              )
                            )
                          }
                        />

                        <button
                          onClick={() =>
                            handleRemove(
                              item.id
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      ₹
                      {(
                        price *
                        Number(item.quantity)
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

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

              <Link
                to="/checkout"
                className="btn btn-primary cart-checkout-button"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;