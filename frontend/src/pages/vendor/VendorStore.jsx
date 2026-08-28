import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getVendorStore,
  updateVendorStore,
} from "../../services/vendorService";

const INITIAL_STORE = {
  name: "",
  slug: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postal_code: "",
};

function VendorStore() {
  const [store, setStore] =
    useState(INITIAL_STORE);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const normalizeStore = (data) => ({
    name: data?.name || "",
    slug: data?.slug || "",
    description:
      data?.description || "",
    email: data?.email || "",
    phone: data?.phone || "",
    address: data?.address || "",
    city: data?.city || "",
    state: data?.state || "",
    country:
      data?.country || "India",
    postal_code:
      data?.postal_code || "",
  });

  const loadStore = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data =
          await getVendorStore();

        setStore(
          normalizeStore(data)
        );
      } catch (error) {
        console.error(
          "VENDOR STORE ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.detail ||
            error.response?.data
              ?.message ||
            error.message ||
            "Store load nahi ho paaya."
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

    const fetchStore = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getVendorStore();

        if (!cancelled) {
          setStore(
            normalizeStore(data)
          );
        }
      } catch (error) {
        console.error(
          "VENDOR STORE ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data
              ?.detail ||
              error.response?.data
                ?.message ||
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

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setStore((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        "");

  const handleNameChange = (
    event
  ) => {
    const name =
      event.target.value;

    setStore((previous) => {
      const previousAutoSlug =
        slugify(previous.name);

      const shouldUpdateSlug =
        !previous.slug ||
        previous.slug ===
          previousAutoSlug;

      return {
        ...previous,

        name,

        slug: shouldUpdateSlug
          ? slugify(name)
          : previous.slug,
      };
    });

    setError("");
    setSuccess("");
  };

  const validateStore = () => {
    const name =
      store.name.trim();

    const slug =
      store.slug.trim();

    const description =
      store.description.trim();

    const email =
      store.email.trim();

    const phone =
      store.phone.trim();

    const address =
      store.address.trim();

    const city =
      store.city.trim();

    const state =
      store.state.trim();

    const country =
      store.country.trim();

    const postalCode =
      store.postal_code.trim();

    if (!name) {
      return "Store name is required.";
    }

    if (!slug) {
      return "Store slug is required.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
      return "Store slug can contain only letters, numbers and hyphens.";
    }

    if (!description) {
      return "Store description is required.";
    }

    if (!email) {
      return "Store email is required.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return "Please enter a valid store email.";
    }

    if (!phone) {
      return "Store phone number is required.";
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return "Please enter a valid phone number.";
    }

    if (!address) {
      return "Store address is required.";
    }

    if (!city) {
      return "City is required.";
    }

    if (!state) {
      return "State is required.";
    }

    if (!country) {
      return "Country is required.";
    }

    if (!postalCode) {
      return "Postal code is required.";
    }

    if (!/^[A-Za-z0-9\s-]{3,12}$/.test(postalCode)) {
      return "Please enter a valid postal code.";
    }

    return "";
  };

  const formatApiError = (
    error
  ) => {
    const data =
      error.response?.data;

    if (!data) {
      return (
        error.message ||
        "Store update nahi ho paaya."
      );
    }

    if (
      typeof data === "string"
    ) {
      return data;
    }

    if (data.detail) {
      return Array.isArray(
        data.detail
      )
        ? data.detail.join(", ")
        : String(data.detail);
    }

    if (data.message) {
      return Array.isArray(
        data.message
      )
        ? data.message.join(", ")
        : String(data.message);
    }

    const messages =
      Object.entries(data)
        .map(
          ([field, message]) => {
            const value =
              Array.isArray(message)
                ? message.join(", ")
                : typeof message ===
                    "object" &&
                  message !== null
                ? JSON.stringify(
                    message
                  )
                : String(message);

            return `${field}: ${value}`;
          }
        )
        .join(" | ");

    return (
      messages ||
      "Store update nahi ho paaya."
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateStore();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

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
        country:
          store.country.trim(),
        postal_code:
          store.postal_code.trim(),
      };

      const data =
        await updateVendorStore(
          storeData
        );

      setStore(
        normalizeStore(data)
      );

      setSuccess(
        "Store updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE STORE ERROR:",
        error
      );

      setError(
        formatApiError(error)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="vendor-store-page">
        <div className="vendor-container">
          <div
            className="products-loading"
            role="status"
            aria-live="polite"
          >
            Loading store...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-store-page">
      <div className="vendor-container">

        {/* HEADER */}

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
              information and
              contact details.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              loadStore(true)
            }
            disabled={
              refreshing ||
              saving
            }
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="auth-success"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        {/* STORE FORM */}

        <section className="vendor-store-card">
          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* STORE INFORMATION */}

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
                    handleNameChange
                  }
                  disabled={saving}
                  maxLength={255}
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
                  disabled={saving}
                  maxLength={255}
                  required
                />

                <small>
                  Use lowercase letters,
                  numbers and hyphens.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={
                    store.description
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  maxLength={2000}
                  required
                />

                <small>
                  {
                    store.description
                      .length
                  }
                  /2000 characters
                </small>
              </div>
            </div>

            {/* CONTACT */}

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
                    value={
                      store.email
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    required
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
                    value={
                      store.phone
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    maxLength={20}
                    required
                  />
                </div>

              </div>
            </div>

            {/* ADDRESS */}

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
                  disabled={saving}
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
                    disabled={saving}
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
                    value={
                      store.state
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                    maxLength={12}
                    required
                  />
                </div>

              </div>
            </div>

            {/* ACTIONS */}

            <div className="store-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving Changes..."
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