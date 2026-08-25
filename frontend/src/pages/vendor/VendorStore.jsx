import {
  useEffect,
  useState,
} from "react";

import {
  getVendorStore,
  updateVendorStore,
} from "../../services/vendorService";

function VendorStore() {
  const [store, setStore] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadStore = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data =
        await getVendorStore();

      setStore({
        name: data.name || "",
        slug: data.slug || "",
        description:
          data.description || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        postal_code:
          data.postal_code || "",
      });
    } catch (error) {
      console.error(
        "VENDOR STORE ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Store load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchStore = async () => {
      try {
        if (!cancelled) {
          setLoading(true);
          setError("");
          setSuccess("");
        }

        const data =
          await getVendorStore();

        if (!cancelled) {
          setStore({
            name: data.name || "",
            slug: data.slug || "",
            description:
              data.description || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            country: data.country || "",
            postal_code:
              data.postal_code || "",
          });
        }
      } catch (error) {
        console.error(
          "VENDOR STORE ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.message ||
              "Store load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchStore();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setStore((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const storeData = {
        name: store.name.trim(),
        slug: store.slug.trim(),
        description:
          store.description.trim(),
        email: store.email.trim(),
        phone: store.phone.trim(),
        address: store.address.trim(),
        city: store.city.trim(),
        state: store.state.trim(),
        country: store.country.trim(),
        postal_code:
          store.postal_code.trim(),
      };

      const data =
        await updateVendorStore(
          storeData
        );

      setStore({
        name: data.name || "",
        slug: data.slug || "",
        description:
          data.description || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        postal_code:
          data.postal_code || "",
      });

      setSuccess(
        "Store updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE STORE ERROR:",
        error
      );

      const responseData =
        error.response?.data;

      if (responseData) {
        const messages =
          Object.entries(
            responseData
          )
            .map(
              ([field, message]) => {
                const text =
                  Array.isArray(message)
                    ? message.join(", ")
                    : message;

                return `${field}: ${text}`;
              }
            )
            .join(" | ");

        setError(
          messages ||
            "Store update nahi ho paaya."
        );
      } else {
        setError(
          "Store update nahi ho paaya."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="vendor-store-page">
        <div className="vendor-container">
          <div className="products-loading">
            Loading store...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-store-page">
      <div className="vendor-container">

        <div className="vendor-store-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              Store Settings
            </h1>

            <p>
              Manage your store
              information and contact
              details.
            </p>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            {error}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadStore}
              style={{
                marginLeft: "10px",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <section className="vendor-store-card">
          <form
            onSubmit={handleSubmit}
          >
            <div className="store-form-section">
              <h2>
                Store Information
              </h2>

              <div className="form-group">
                <label htmlFor="name">
                  Store Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={store.name}
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">
                  Store Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={store.slug}
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={
                    store.description
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            <div className="store-form-section">
              <h2>
                Contact Information
              </h2>

              <div className="store-form-grid">
                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={store.email}
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={store.phone}
                    onChange={
                      handleChange
                    }
                  />
                </div>
              </div>
            </div>

            <div className="store-form-section">
              <h2>
                Address
              </h2>

              <div className="form-group">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={
                    store.address
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>

              <div className="store-form-grid">
                <div className="form-group">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={store.city}
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={store.state}
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="country">
                    Country
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={
                      store.country
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postal_code">
                    Postal Code
                  </label>

                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    value={
                      store.postal_code
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="store-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default VendorStore;