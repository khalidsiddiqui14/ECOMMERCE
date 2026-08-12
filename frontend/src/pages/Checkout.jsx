import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createOrder } from "../services/orderService";
import { createPayment } from "../services/paymentService";

function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_country: "India",
    shipping_postal_code: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Create Order
      const order = await createOrder(form);

      console.log("ORDER CREATED:", order);

      // 2. Create Payment
      const payment = await createPayment(
        order.id,
        paymentMethod
      );

      console.log(
        "PAYMENT CREATED:",
        payment
      );

      setSuccess(
        "Order and payment created successfully."
      );

      // 3. Go to Orders page
      setTimeout(() => {
        navigate("/orders");
      }, 1000);
    } catch (error) {
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      const data = error.response?.data;

      if (data?.missing_fields) {
        setError(
          typeof data.missing_fields === "string"
            ? data.missing_fields
            : JSON.stringify(
                data.missing_fields
              )
        );
      } else if (data?.detail) {
        setError(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail)
        );
      } else if (data) {
        setError(
          Object.entries(data)
            .map(([field, message]) => {
              const value = Array.isArray(
                message
              )
                ? message.join(", ")
                : message;

              return `${field}: ${value}`;
            })
            .join(" | ")
        );
      } else {
        setError(
          error.message ||
            "Order ya payment create nahi ho paaya."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>

          <p>
            Enter your shipping information and
            choose your payment method.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <div className="checkout-layout">
          <section className="checkout-card">
            <form onSubmit={handleSubmit}>
              <div className="checkout-section">
                <h2>
                  Shipping Information
                </h2>

                <div className="checkout-grid">
                  <div className="form-group">
                    <label htmlFor="shipping_name">
                      Full Name
                    </label>

                    <input
                      id="shipping_name"
                      name="shipping_name"
                      type="text"
                      placeholder="Enter full name"
                      value={
                        form.shipping_name
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shipping_phone">
                      Phone
                    </label>

                    <input
                      id="shipping_phone"
                      name="shipping_phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={
                        form.shipping_phone
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shipping_address">
                    Address
                  </label>

                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    rows="3"
                    placeholder="Enter complete address"
                    value={
                      form.shipping_address
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="checkout-grid">
                  <div className="form-group">
                    <label htmlFor="shipping_city">
                      City
                    </label>

                    <input
                      id="shipping_city"
                      name="shipping_city"
                      type="text"
                      placeholder="City"
                      value={
                        form.shipping_city
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shipping_state">
                      State
                    </label>

                    <input
                      id="shipping_state"
                      name="shipping_state"
                      type="text"
                      placeholder="State"
                      value={
                        form.shipping_state
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shipping_country">
                      Country
                    </label>

                    <input
                      id="shipping_country"
                      name="shipping_country"
                      type="text"
                      value={
                        form.shipping_country
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shipping_postal_code">
                      Postal Code
                    </label>

                    <input
                      id="shipping_postal_code"
                      name="shipping_postal_code"
                      type="text"
                      placeholder="Postal code"
                      value={
                        form.shipping_postal_code
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">
                    Order Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    placeholder="Optional"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-section">
                <h2>
                  Payment Method
                </h2>

                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={
                        paymentMethod === "COD"
                      }
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value
                        )
                      }
                    />

                    <div>
                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your order
                        arrives.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="checkout-actions">
                <Link
                  to="/cart"
                  className="btn btn-secondary"
                >
                  Back to Cart
                </Link>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Placing Order..."
                    : "Place Order"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Checkout;