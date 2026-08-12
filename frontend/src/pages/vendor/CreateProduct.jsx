import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createVendorProduct } from "../../services/vendorService";

function CreateProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "1",
    brand: "",
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: "",
    stock: "",
    status: "PUBLISHED",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleNameChange = (event) => {
    const name = event.target.value;

    setForm((previous) => ({
      ...previous,
      name,
      slug: name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const productData = {
        category: Number(form.category),
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        description:
          form.description.trim(),
        price: form.price,
        stock: Number(form.stock),
        status: form.status,
        is_active: form.is_active,
      };

      if (form.brand) {
        productData.brand =
          Number(form.brand);
      }

      await createVendorProduct(
        productData
      );

      navigate("/vendor/products");
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      const data =
        error.response?.data;

      if (data) {
        const messages =
          Object.entries(data)
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
            "Product create nahi ho paaya."
        );
      } else {
        setError(
          "Product create nahi ho paaya."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="vendor-create-product-page">
      <div className="vendor-container">
        <div className="vendor-products-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              Add Product
            </h1>

            <p>
              Create a new product for your
              store.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="btn btn-secondary"
          >
            Back to Products
          </Link>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="vendor-form-card">
          <form
            onSubmit={handleSubmit}
          >
            <div className="vendor-form-grid">

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
                  placeholder="Bluetooth Speaker"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sku">
                  SKU
                </label>

                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="BS-001"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category ID
                </label>

                <input
                  id="category"
                  name="category"
                  type="number"
                  min="1"
                  value={
                    form.category
                  }
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">
                  Brand ID
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="number"
                  min="1"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

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
                  onChange={handleChange}
                  placeholder="2499.00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">
                  Stock
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="15"
                  required
                />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="slug">
                Slug
              </label>

              <input
                id="slug"
                name="slug"
                type="text"
                value={form.slug}
                onChange={handleChange}
                placeholder="bluetooth-speaker"
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
                rows="5"
                value={
                  form.description
                }
                onChange={handleChange}
                placeholder="Product description..."
              />
            </div>

            <div className="vendor-form-grid">

              <div className="form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
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
                  onChange={handleChange}
                />

                <label htmlFor="is_active">
                  Product is active
                </label>
              </div>

            </div>

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
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateProduct;