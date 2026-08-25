import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getVendorProducts,
  deleteVendorProduct,
} from "../../services/vendorService";

function VendorProducts() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [status, setStatus] =
    useState("");

  // =========================
  // Load Products
  // =========================

  const loadProducts = async () => {
    try {
      setError("");
      setLoading(true);

      const data =
        await getVendorProducts();

      setProducts(
        data.results || data
      );
    } catch (error) {
      console.error(
        "VENDOR PRODUCTS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Products load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        if (!cancelled) {
          setError("");
          setLoading(true);
        }

        const data =
          await getVendorProducts();

        if (!cancelled) {
          setProducts(
            data.results || data
          );
        }
      } catch (error) {
        console.error(
          "VENDOR PRODUCTS ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.message ||
              "Products load nahi ho paaye."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // Delete Product
  // =========================

  const handleDelete = async (
    productId,
    productName
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${productName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteVendorProduct(
        productId
      );

      setProducts((previous) =>
        previous.filter(
          (product) =>
            product.id !== productId
        )
      );
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Product delete nahi ho paaya."
      );
    }
  };

  // =========================
  // Search + Filters
  // =========================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        product.name
          ?.toLowerCase()
          .includes(searchValue) ||
        product.sku
          ?.toLowerCase()
          .includes(searchValue) ||
        product.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        !category ||
        String(product.category) ===
          String(category);

      const matchesStatus =
        !status ||
        product.status?.toLowerCase() ===
          status.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    category,
    status,
  ]);

  // =========================
  // Categories
  // =========================

  const categories = useMemo(() => {
    const uniqueCategories =
      new Set();

    products.forEach((product) => {
      if (product.category) {
        uniqueCategories.add(
          String(product.category)
        );
      }
    });

    return Array.from(
      uniqueCategories
    );
  }, [products]);

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <main className="vendor-products-page">
        <div className="products-loading">
          Loading products...
        </div>
      </main>
    );
  }

  // =========================
  // Main UI
  // =========================

  return (
    <main className="vendor-products-page">
      <div className="vendor-container">

        {/* ==================== */}
        {/* Header */}
        {/* ==================== */}

        <div className="vendor-products-header">

          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              My Products
            </h1>

            <p>
              Manage the products in your
              store.
            </p>
          </div>

          {/* Add Product */}

          <Link
            to="/vendor/products/create"
            className="btn btn-primary"
          >
            + Add Product
          </Link>

        </div>

        {/* ==================== */}
        {/* Error */}
        {/* ==================== */}

        {error && (
          <div className="auth-error">

            <span>
              {error}
            </span>

            <button
              className="btn btn-secondary"
              onClick={loadProducts}
              style={{
                marginLeft: "10px",
              }}
            >
              Try Again
            </button>

          </div>
        )}

        {/* ==================== */}
        {/* Toolbar */}
        {/* ==================== */}

        <div className="vendor-products-toolbar">

          {/* Search */}

          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {/* Category */}

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
          >

            <option value="">
              All Categories
            </option>

            {categories.map(
              (categoryId) => (
                <option
                  key={categoryId}
                  value={categoryId}
                >
                  Category #{categoryId}
                </option>
              )
            )}

          </select>

          {/* Status */}

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >

            <option value="">
              All Status
            </option>

            <option value="published">
              Published
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="out_of_stock">
              Out of Stock
            </option>

          </select>

        </div>

        {/* ==================== */}
        {/* Product Table */}
        {/* ==================== */}

        <div className="vendor-products-table-wrapper">

          {filteredProducts.length ===
          0 ? (

            <div className="products-empty">

              <h2>
                No Products Found
              </h2>

              <p>
                {products.length === 0
                  ? "You haven't created any products yet."
                  : "No products match your search or filters."}
              </p>

              {products.length ===
                0 && (
                <Link
                  to="/vendor/products/create"
                  className="btn btn-primary"
                >
                  + Add Your First Product
                </Link>
              )}

            </div>

          ) : (

            <table className="vendor-products-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (

                    <tr
                      key={product.id}
                    >

                      {/* Product */}

                      <td>
                        <strong>
                          {product.name}
                        </strong>
                      </td>

                      {/* SKU */}

                      <td>
                        {product.sku ||
                          "-"}
                      </td>

                      {/* Category */}

                      <td>
                        Category #
                        {product.category}
                      </td>

                      {/* Price */}

                      <td>
                        ₹
                        {Number(
                          product.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* Stock */}

                      <td>
                        {product.stock}
                      </td>

                      {/* Status */}

                      <td>

                        <span
                          className={`product-status ${
                            product.status
                              ?.toLowerCase()
                          }`}
                        >
                          {product.status}
                        </span>

                      </td>

                      {/* Actions */}

                      <td>

                        <div className="product-table-actions">

                          {/* View */}

                          <Link
                            to={`/products/${product.id}`}
                            className="table-action view"
                          >
                            View
                          </Link>

                          {/* Edit */}

                          <Link
                            to={`/vendor/products/${product.id}/edit`}
                            className="table-action edit"
                          >
                            Edit
                          </Link>

                          {/* Delete */}

                          <button
                            type="button"
                            className="table-action delete"
                            onClick={() =>
                              handleDelete(
                                product.id,
                                product.name
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>
    </main>
  );
}

export default VendorProducts;