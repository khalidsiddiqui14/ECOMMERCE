import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProducts();

        setProducts(
          Array.isArray(data)
            ? data
            : data?.results || []
        );
      } catch (error) {
        console.error(
          "PRODUCTS ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            "Products load nahi ho paaye."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map(
        (product) =>
          product.category_name ||
          product.category
      )
      .filter(Boolean);

    return [...new Set(values)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const description =
          product.description?.toLowerCase() ||
          "";

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

  const handleAddToCart = async (product) => {
    if (!product?.id) {
      return;
    }

    if (
      product.stock !== undefined &&
      Number(product.stock) <= 0
    ) {
      return;
    }

    setAddingProductId(product.id);
    setCartMessage("");
    setCartError("");

    try {
      await addToCart(product.id, 1);

      setCartMessage(
        `${product.name} cart mein add ho gaya.`
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      setCartError(
        error.response?.data?.detail ||
          "Product cart mein add nahi ho paaya."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) {
    return (
      <main className="products-page">
        <div className="products-loading">
          Loading products...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="products-page">
        <div className="products-error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="products-page">
      <section className="products-header">
        <h1>All Products</h1>

        <p>
          Discover our collection of quality
          products.
        </p>
      </section>

      {cartMessage && (
        <div className="auth-success">
          {cartMessage}
        </div>
      )}

      {cartError && (
        <div className="auth-error">
          {cartError}
        </div>
      )}

      <section className="products-content">
        <aside className="products-filter">
          <h3>Filters</h3>

          <div className="filter-group">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
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
                setSort(event.target.value)
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
        </aside>

        <div className="products-area">
          <div className="products-topbar">
            <span>
              {filteredProducts.length} Products
            </span>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="products-empty">
              <h2>No Products Found</h2>

              <p>
                Try changing your search or
                filters.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(
                (product) => {
                  const stock =
                    Number(product.stock);

                  const hasStock =
                    product.stock === undefined ||
                    stock > 0;

                  const isAdding =
                    addingProductId ===
                    product.id;

                  return (
                    <div
                      className="shop-product-card"
                      key={product.id}
                    >
                      <div className="shop-product-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          "📦"
                        )}
                      </div>

                      <div className="shop-product-info">
                        <span className="shop-product-category">
                          {product.category_name ||
                            product.category ||
                            "Product"}
                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <p className="shop-product-price">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="stock-status">
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
                    </div>
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