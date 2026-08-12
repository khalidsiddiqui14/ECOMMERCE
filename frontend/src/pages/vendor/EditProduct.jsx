import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getVendorProducts,
  updateVendorProduct,
} from "../../services/vendorService";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setError("");

        const data =
          await getVendorProducts();

        const products =
          data.results || data;

        const product = products.find(
          (item) =>
            String(item.id) === String(id)
        );

        if (!product) {
          setError(
            "Product not found."
          );

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
            product.status ?? "PUBLISHED",

          is_active:
            product.is_active ?? true,
        });
      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Product load nahi ho paaya."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleChange = (event) => {
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
  };

  const handleNameChange = (event) => {
    const name = event.target.value;

    setForm((previous) => ({
      ...previous,

      name,

      slug:
        previous.slug ===
          previous.name
            .toLowerCase()
            .trim()
            .replace(
              /[^a-z0-9]+/g,
              "-"
            )
            .replace(
              /^-|-$/g,
              ""
            )
          ? name
              .toLowerCase()
              .trim()
              .replace(
                /[^a-z0-9]+/g,
                "-"
              )
              .replace(
                /^-|-$/g,
                ""
              )
          : previous.slug,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
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

        price: form.price,

        stock: Number(form.stock),

        status: form.status,

        is_active: form.is_active,
      };

      if (form.brand !== "") {
        productData.brand = Number(
          form.brand
        );
      } else {
        productData.brand = null;
      }

      await updateVendorProduct(
        id,
        productData
      );

      navigate(
        "/vendor/products"
      );
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
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
            "Product update nahi ho paaya."
        );
      } else {
        setError(
          "Product update nahi ho paaya."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="vendor-products-page">
        <div className="products-loading">
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                  onChange={
                    handleChange
                  }
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
                rows="5"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
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
                  onChange={
                    handleChange
                  }
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
                disabled={saving}
              >
                {saving
                  ? "Saving..."
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