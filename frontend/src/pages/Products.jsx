import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";

function Products() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [sort, setSort] = useState("latest");

  const [addingProductId, setAddingProductId] =
    useState(null);

  const [cartMessage, setCartMessage] =
    useState("");

  const [cartError, setCartError] =
    useState("");

  // Load products
  const loadProducts = useCallback(
    async (isMounted = true) => {
      setLoading(true);
      setError("");

      try {
        const data = await getProducts();

        if (!isMounted) {
          return;
        }

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setProducts(productList);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "PRODUCTS ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            "Products load nahi ho paaye."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    loadProducts(isMounted);

    return () => {
      isMounted = false;
    };
  }, [loadProducts]);

  const categories = useMemo(() => {
    const values = products
      .map(
        (product) =>
          product.category_name ||
          product.category
      )
      .filter(Boolean);

    return [
      ...new Set(values),
    ].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue = search
      .trim()
      .toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name = String(
          product.name || ""
        ).toLowerCase();

        const description = String(
          product.description || ""
        ).toLowerCase();

        const categoryName = String(
          product.category_name ||
            product.category ||
            ""
        ).toLowerCase();

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          categoryName.includes(searchValue)
        );
      });
    }

    if (category) {
      result = result.filter((product) => {
        const productCategory = String(
          product.category_name ||
            product.category ||
            ""
        );

        return productCategory === category;
      });
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sort === "latest") {
      result.sort((a, b) => {
        const dateA = new Date(
          a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || 0
        ).getTime();

        return dateB - dateA;
      });
    }

    return result;
  }, [
    products,
    search,
    category,
    sort,
  ]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(category) ||
    sort !== "latest";

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("latest");
    setCartMessage("");
    setCartError("");
  };

  const handleAddToCart = async (product) => {
    if (!product?.id) {
      return;
    }

    const hasStock =
      product.stock === undefined ||
      Number(product.stock) > 0;

    if (!hasStock) {
      return;
    }

    setAddingProductId(product.id);
    setCartMessage("");
    setCartError("");

    try {
      await addToCart(
        product.id,
        1
      );

      setCartMessage(
        `${
          product.name || "Product"
        } cart mein add ho gaya.`
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      setCartError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Product cart mein add nahi ho paaya."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return (
      <main className="products-page">
        <section className="products-header">
          <h1>All Products</h1>

          <p>
            Discover our collection
            of quality products.
          </p>
        </section>

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

  if (error) {
    return (
      <main className="products-page">
        <section className="products-header">
          <h1>All Products</h1>

          <p>
            Discover our collection
            of quality products.
          </p>
        </section>

        <div
          className="products-error"
          role="alert"
        >
          <h2>
            Unable to load products
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              loadProducts()
            }
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="products-page">
      <section className="products-header">
        <h1>All Products</h1>

        <p>
          Discover our collection
          of quality products.
        </p>
      </section>

      {cartMessage && (
        <div
          className="auth-success"
          role="status"
          aria-live="polite"
        >
          {cartMessage}
        </div>
      )}

      {cartError && (
        <div
          className="auth-error"
          role="alert"
          aria-live="assertive"
        >
          {cartError}
        </div>
      )}

      <section className="products-content">
        <aside
          className="products-filter"
          aria-label="Product filters"
        >
          <h3>Filters</h3>

          <div className="filter-group">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
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

              {categories.map((item) => (
                <option
                  key={String(item)}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">
              Sort By
            </label>

            <select
              id="sort"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value
                )
              }
            >
              <option value="latest">
                Latest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </aside>

        <div className="products-area">
          <div className="products-topbar">
            <span>
              Showing{" "}
              {
                filteredProducts.length
              }{" "}
              of{" "}
              {products.length} Products
            </span>

            <div className="product-search">
              <label
                htmlFor="product-search"
                className="sr-only"
              >
                Search products
              </label>

              <input
                id="product-search"
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                autoComplete="off"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear product search"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              className="products-empty"
              role="status"
            >
              <h2>
                No Products Found
              </h2>

              <p>
                Try changing your
                search or filters.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(
                (product) => {
                  const stock = Number(
                    product.stock
                  );

                  const hasStock =
                    product.stock ===
                      undefined ||
                    stock > 0;

                  const isAdding =
                    addingProductId ===
                    product.id;

                  const productName =
                    product.name ||
                    "Product";

                  const productCategory =
                    product.category_name ||
                    product.category ||
                    "Product";

                  const productPrice =
                    Number(
                      product.price || 0
                    );

                  return (
                    <article
                      className="shop-product-card"
                      key={product.id}
                    >
                      <Link
                        to={`/products/${product.id}`}
                        aria-label={`View ${productName}`}
                      >
                        <div className="shop-product-image">
                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={productName}
                              loading="lazy"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";

                                event.currentTarget.parentElement.classList.add(
                                  "image-fallback"
                                );
                              }}
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                            >
                              📦
                            </span>
                          )}

                          <span
                            className="image-fallback-icon"
                            aria-hidden="true"
                          >
                            📦
                          </span>
                        </div>
                      </Link>

                      <div className="shop-product-info">
                        <span className="shop-product-category">
                          {
                            productCategory
                          }
                        </span>

                        <h3>
                          {productName}
                        </h3>

                        <p className="shop-product-price">
                          ₹
                          {productPrice.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p
                          className={`stock-status ${
                            hasStock
                              ? "stock-available"
                              : "stock-out"
                          }`}
                        >
                          {hasStock
                            ? product.stock !==
                              undefined
                              ? `${stock} items available`
                              : "Available"
                            : "Out of stock"}
                        </p>

                        <div className="product-actions">
                          <Link
                            to={`/products/${product.id}`}
                            className="btn btn-secondary"
                          >
                            View Details
                          </Link>

                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={
                              !hasStock ||
                              isAdding
                            }
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                          >
                            {isAdding
                              ? "Adding..."
                              : hasStock
                                ? "Add to Cart"
                                : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Products;