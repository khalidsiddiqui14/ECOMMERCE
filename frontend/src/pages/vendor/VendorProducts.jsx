import {
  useCallback,
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

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const loadProducts = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data =
          await getVendorProducts();

        const productList =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : [];

        setProducts(productList);
      } catch (error) {
        console.error(
          "VENDOR PRODUCTS ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Products load nahi ho paaye."
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

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getVendorProducts();

        if (cancelled) {
          return;
        }

        const productList =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : [];

        setProducts(productList);
      } catch (error) {
        console.error(
          "VENDOR PRODUCTS ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
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

  const handleDelete = async (
    productId,
    productName
  ) => {
    if (deletingId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(productId);
    setError("");

    try {
      await deleteVendorProduct(
        productId
      );

      setProducts(
        (previous) =>
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
          error.response?.data?.message ||
          error.message ||
          "Product delete nahi ho paaya."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return products.filter(
      (product) => {
        const productName =
          String(
            product.name || ""
          ).toLowerCase();

        const sku =
          String(
            product.sku || ""
          ).toLowerCase();

        const description =
          String(
            product.description || ""
          ).toLowerCase();

        const productStatus =
          String(
            product.status || ""
          ).toLowerCase();

        const matchesSearch =
          !searchValue ||
          productName.includes(
            searchValue
          ) ||
          sku.includes(
            searchValue
          ) ||
          description.includes(
            searchValue
          );

        const matchesCategory =
          !category ||
          String(
            product.category
          ) === String(category);

        const matchesStatus =
          !status ||
          productStatus ===
            status.toLowerCase();

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      }
    );
  }, [
    products,
    search,
    category,
    status,
  ]);

  const categories = useMemo(() => {
    const uniqueCategories =
      new Set();

    products.forEach(
      (product) => {
        if (
          product.category !==
            null &&
          product.category !==
            undefined &&
          product.category !== ""
        ) {
          uniqueCategories.add(
            String(product.category)
          );
        }
      }
    );

    return Array.from(
      uniqueCategories
    ).sort(
      (a, b) =>
        Number(a) - Number(b)
    );
  }, [products]);

  const totalProducts =
    products.length;

  const publishedProducts =
    products.filter(
      (product) =>
        String(
          product.status || ""
        ).toLowerCase() ===
        "published"
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(product.stock || 0) <=
        0
    ).length;

  const formatPrice = (value) =>
    `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;

  const formatStatus = (
    value
  ) => {
    if (!value) {
      return "Unknown";
    }

    return String(value)
      .replaceAll("_", " ")
      .replace(
        /^./,
        (character) =>
          character.toUpperCase()
      );
  };

  if (loading) {
    return (
      <main className="vendor-products-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading products...
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-products-page">
      <div className="vendor-container">
        {/* HEADER */}

        <div className="vendor-products-header">
          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              My Products
            </h1>

            <p>
              Manage the products in
              your store.
            </p>
          </div>

          <div className="vendor-products-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                loadProducts(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link
              to="/vendor/products/create"
              className="btn btn-primary"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            <span>
              {error}
            </span>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                loadProducts(true)
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Retrying..."
                : "Try Again"}
            </button>
          </div>
        )}

        {/* SUMMARY */}

        <div className="vendor-products-summary">
          <div>
            <span>
              Total Products
            </span>

            <strong>
              {totalProducts}
            </strong>
          </div>

          <div>
            <span>
              Published
            </span>

            <strong>
              {publishedProducts}
            </strong>
          </div>

          <div>
            <span>
              Out of Stock
            </span>

            <strong>
              {outOfStockProducts}
            </strong>
          </div>

          <div>
            <span>
              Showing
            </span>

            <strong>
              {filteredProducts.length}
            </strong>
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="vendor-products-toolbar">
          <input
            type="search"
            placeholder="Search by name, SKU or description..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            aria-label="Search products"
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            aria-label="Filter by category"
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
                  Category #
                  {categoryId}
                </option>
              )
            )}
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            aria-label="Filter by status"
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

          {(search ||
            category ||
            status) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setCategory("");
                setStatus("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* TABLE */}

        <div className="vendor-products-table-wrapper">
          {filteredProducts.length ===
          0 ? (
            <div className="products-empty">
              <h2>
                No Products Found
              </h2>

              <p>
                {products.length ===
                0
                  ? "You haven't created any products yet."
                  : "No products match your search or filters."}
              </p>

              {products.length ===
                0 && (
                <Link
                  to="/vendor/products/create"
                  className="btn btn-primary"
                >
                  + Add Your First
                  Product
                </Link>
              )}

              {products.length >
                0 &&
                (search ||
                  category ||
                  status) && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setStatus("");
                    }}
                  >
                    Clear Filters
                  </button>
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
                  (product) => {
                    const isDeleting =
                      deletingId ===
                      product.id;

                    const stock =
                      Number(
                        product.stock ||
                          0
                      );

                    return (
                      <tr
                        key={
                          product.id
                        }
                      >
                        <td>
                          <strong>
                            {product.name ||
                              `Product #${product.id}`}
                          </strong>
                        </td>

                        <td>
                          {product.sku ||
                            "-"}
                        </td>

                        <td>
                          {product.category
                            ? `Category #${product.category}`
                            : "-"}
                        </td>

                        <td>
                          {formatPrice(
                            product.price
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              stock <= 0
                                ? "stock-status out-of-stock"
                                : "stock-status"
                            }
                          >
                            {stock}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`product-status ${
                              String(
                                product.status ||
                                  "unknown"
                              ).toLowerCase()
                            }`}
                          >
                            {formatStatus(
                              product.status
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="product-table-actions">
                            <Link
                              to={`/products/${product.id}`}
                              className="table-action view"
                            >
                              View
                            </Link>

                            <Link
                              to={`/vendor/products/${product.id}/edit`}
                              className="table-action edit"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="table-action delete"
                              onClick={() =>
                                handleDelete(
                                  product.id,
                                  product.name ||
                                    `Product #${product.id}`
                                )
                              }
                              disabled={
                                isDeleting ||
                                deletingId !==
                                  null
                              }
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
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