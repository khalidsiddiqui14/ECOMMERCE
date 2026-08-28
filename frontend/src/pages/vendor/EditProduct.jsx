import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getVendorProducts,
  updateVendorProduct,
} from "../../services/vendorService";

const INITIAL_FORM = {
  category: "",
  brand: "",
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  stock: "",
  status: "PUBLISHED",
  is_active: true,
};

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getVendorProducts();

        const products =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data?.results
                )
              ? data.results
              : [];

        const product =
          products.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (!product) {
          if (!cancelled) {
            setError(
              "Product not found."
            );
          }

          return;
        }

        if (cancelled) {
          return;
        }

        setForm({
          category:
            product.category ?? "",

          brand:
            product.brand ?? "",

          name:
            product.name ?? "",

          slug:
            product.slug ?? "",

          sku:
            product.sku ?? "",

          description:
            product.description ?? "",

          price:
            product.price ?? "",

          stock:
            product.stock ?? "",

          status:
            product.status ??
            "PUBLISHED",

          is_active:
            product.is_active ??
            true,
        });
      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data
              ?.detail ||
              error.response?.data
                ?.message ||
              error.message ||
              "Product load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
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

    setForm((previous) => {
      const generatedSlug =
        slugify(name);

      const previousGeneratedSlug =
        slugify(previous.name);

      const shouldUpdateSlug =
        !previous.slug ||
        previous.slug ===
          previousGeneratedSlug;

      return {
        ...previous,

        name,

        slug: shouldUpdateSlug
          ? generatedSlug
          : previous.slug,
      };
    });

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const category =
      Number(form.category);

    const price =
      Number(form.price);

    const stock =
      Number(form.stock);

    const name =
      form.name.trim();

    const slug =
      form.slug.trim();

    const sku =
      form.sku.trim();

    const description =
      form.description.trim();

    if (
      !Number.isInteger(
        category
      ) ||
      category <= 0
    ) {
      return "Please enter a valid Category ID.";
    }

    if (!name) {
      return "Product name is required.";
    }

    if (!slug) {
      return "Product slug is required.";
    }

    if (!sku) {
      return "SKU is required.";
    }

    if (!description) {
      return "Product description is required.";
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return "Please enter a valid product price.";
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return "Stock must be a whole number greater than or equal to 0.";
    }

    if (
      ![
        "DRAFT",
        "PUBLISHED",
        "OUT_OF_STOCK",
      ].includes(form.status)
    ) {
      return "Please select a valid product status.";
    }

    if (
      form.brand !== "" &&
      (!Number.isInteger(
        Number(form.brand)
      ) ||
        Number(form.brand) <= 0)
    ) {
      return "Please enter a valid Brand ID.";
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
        "Product update nahi ho paaya."
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
        ? data.detail.join(
            ", "
          )
        : String(data.detail);
    }

    if (data.message) {
      return Array.isArray(
        data.message
      )
        ? data.message.join(
            ", "
          )
        : String(data.message);
    }

    return Object.entries(data)
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
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    setSaving(true);

    try {
      const productData = {
        category: Number(
          form.category
        ),

        name: form.name.trim(),

        slug: form.slug.trim(),

        sku: form.sku.trim(),

        description:
          form.description.trim(),

        price: Number(
          form.price
        ).toFixed(2),

        stock: Number(
          form.stock
        ),

        status: form.status,

        is_active:
          form.is_active,

        brand:
          form.brand !== ""
            ? Number(form.brand)
            : null,
      };

      await updateVendorProduct(
        id,
        productData
      );

      setSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        navigate(
          "/vendor/products"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
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
      <main className="vendor-products-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading product...
        </div>
      </main>
    );
  }

  if (error && !form.name) {
    return (
      <main className="vendor-products-page">
        <div className="vendor-container">
          <div className="products-empty">
            <h2>
              Product Not Found
            </h2>

            <p>{error}</p>

            <Link
              to="/vendor/products"
              className="btn btn-primary"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-create-product-page">
      <div className="vendor-container">
        {/* HEADER */}

        <div className="vendor-products-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              Edit Product
            </h1>

            <p>
              Update your product
              information.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="btn btn-secondary"
          >
            Back to Products
          </Link>
        </div>

        {/* MESSAGES */}

        {error && (
          <div
            className="auth-error"
            role="alert"
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

        {/* FORM */}

        <div className="vendor-form-card">
          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="vendor-form-grid">
              {/* NAME */}

              <div className="form-group">
                <label htmlFor="name">
                  Product Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={
                    handleNameChange
                  }
                  disabled={saving}
                  maxLength={255}
                  required
                />
              </div>

              {/* SKU */}

              <div className="form-group">
                <label htmlFor="sku">
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={form.sku}
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  maxLength={100}
                  required
                />
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label htmlFor="category">
                  Category ID
                </label>

                <input
                  id="category"
                  name="category"
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />
              </div>

              {/* BRAND */}

              <div className="form-group">
                <label htmlFor="brand">
                  Brand ID
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="number"
                  min="1"
                  step="1"
                  value={form.brand}
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  placeholder="Optional"
                />
              </div>

              {/* PRICE */}

              <div className="form-group">
                <label htmlFor="price">
                  Price
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />
              </div>

              {/* STOCK */}

              <div className="form-group">
                <label htmlFor="stock">
                  Stock
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  required
                />
              </div>
            </div>

            {/* SLUG */}

            <div className="form-group">
              <label htmlFor="slug">
                Slug
              </label>

              <input
                id="slug"
                name="slug"
                type="text"
                value={form.slug}
                onChange={
                  handleChange
                }
                disabled={saving}
                maxLength={255}
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="6"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                disabled={saving}
                maxLength={5000}
                required
              />

              <small>
                {
                  form.description
                    .length
                }
                /5000 characters
              </small>
            </div>

            {/* STATUS + ACTIVE */}

            <div className="vendor-form-grid">
              <div className="form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                >
                  <option value="PUBLISHED">
                    Published
                  </option>

                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="OUT_OF_STOCK">
                    Out of Stock
                  </option>
                </select>
              </div>

              <div className="form-checkbox">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={
                    form.is_active
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                />

                <label htmlFor="is_active">
                  Product is active
                </label>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="vendor-form-actions">
              <Link
                to="/vendor/products"
                className="btn btn-secondary"
              >
                Cancel
              </Link>

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
        </div>
      </div>
    </main>
  );
}

export default EditProduct;