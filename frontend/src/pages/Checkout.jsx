import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

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

  // Handle form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // Format API errors
  const formatError = (error) => {
    const data = error.response?.data;

    if (!data) {
      return (
        error.message ||
        "Order ya payment create nahi ho paaya."
      );
    }

    if (data.missing_fields) {
      if (
        typeof data.missing_fields ===
        "string"
      ) {
        return data.missing_fields;
      }

      return Object.entries(
        data.missing_fields
      )
        .map(([field, message]) => {
          const value = Array.isArray(
            message
          )
            ? message.join(", ")
            : message;

          return `${field}: ${value}`;
        })
        .join(" | ");
    }

    if (data.detail) {
      return typeof data.detail ===
        "string"
        ? data.detail
        : JSON.stringify(data.detail);
    }

    const entries = Object.entries(data);

    if (entries.length > 0) {
      return entries
        .map(([field, message]) => {
          const value = Array.isArray(
            message
          )
            ? message.join(", ")
            : typeof message === "object"
              ? JSON.stringify(message)
              : message;

          return `${field}: ${value}`;
        })
        .join(" | ");
    }

    return "Checkout failed. Please try again.";
  };

  // Validate checkout form
  const validateForm = () => {
    const requiredFields = [
      ["shipping_name", "Full name"],
      ["shipping_phone", "Phone"],
      ["shipping_address", "Address"],
      ["shipping_city", "City"],
      ["shipping_state", "State"],
      ["shipping_country", "Country"],
      ["shipping_postal_code", "Postal code"],
    ];

    for (const [
      field,
      label,
    ] of requiredFields) {
      if (!form[field].trim()) {
        setError(
          `${label} is required.`
        );

        return false;
      }
    }

    if (
      form.shipping_phone.trim().length <
      10
    ) {
      setError(
        "Please enter a valid phone number."
      );

      return false;
    }

    if (
      form.shipping_postal_code
        .trim().length < 4
    ) {
      setError(
        "Please enter a valid postal code."
      );

      return false;
    }

    return true;
  };

  // Place order and create payment
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const cleanedForm = {
        ...form,
        shipping_name:
          form.shipping_name.trim(),
        shipping_phone:
          form.shipping_phone.trim(),
        shipping_address:
          form.shipping_address.trim(),
        shipping_city:
          form.shipping_city.trim(),
        shipping_state:
          form.shipping_state.trim(),
        shipping_country:
          form.shipping_country.trim(),
        shipping_postal_code:
          form.shipping_postal_code.trim(),
        notes: form.notes.trim(),
      };

      // 1. Create order
      const order =
        await createOrder(cleanedForm);

      console.log(
        "ORDER CREATED:",
        order
      );

      if (!order?.id) {
        throw new Error(
          "Order was created but no order ID was returned."
        );
      }

      // 2. Create payment
      const payment =
        await createPayment(
          order.id,
          paymentMethod
        );

      console.log(
        "PAYMENT CREATED:",
        payment
      );

      setSuccess(
        `Order #${order.id} placed successfully.`
      );

      // Redirect after successful checkout
      navigate("/orders", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      setError(
        formatError(error)
      );
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
            Enter your shipping information
            and choose your payment method.
          </p>
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

        {success && (
          <div
            className="auth-success"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        <div className="checkout-layout">
          <section className="checkout-card">
            <form
              onSubmit={handleSubmit}
              noValidate
            >
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
                      autoComplete="name"
                      disabled={loading}
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
                      autoComplete="tel"
                      inputMode="tel"
                      disabled={loading}
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
                    autoComplete="street-address"
                    disabled={loading}
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
                      autoComplete="address-level2"
                      disabled={loading}
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
                      autoComplete="address-level1"
                      disabled={loading}
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
                      autoComplete="country-name"
                      disabled={loading}
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
                      autoComplete="postal-code"
                      inputMode="numeric"
                      disabled={loading}
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
                    disabled={loading}
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
                        paymentMethod ===
                        "COD"
                      }
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value
                        )
                      }
                      disabled={loading}
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
                  className={`btn btn-secondary${
                    loading
                      ? " checkout-link-disabled"
                      : ""
                  }`}
                  aria-disabled={loading}
                  onClick={(event) => {
                    if (loading) {
                      event.preventDefault();
                    }
                  }}
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