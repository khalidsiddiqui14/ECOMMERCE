import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProducts } from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();

        // DRF pagination ho to results use honge
        setProducts(data.results || data);
      } catch (error) {
        console.error(error);

        setError(
          "Products load nahi ho paaye."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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

      <section className="products-content">
        <aside className="products-filter">
          <h3>Filters</h3>

          <div className="filter-group">
            <label htmlFor="category">
              Category
            </label>

            <select id="category">
              <option value="">
                All Categories
              </option>

              <option value="electronics">
                Electronics
              </option>

              <option value="fashion">
                Fashion
              </option>

              <option value="accessories">
                Accessories
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">
              Sort By
            </label>

            <select id="sort">
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
              {products.length} Products
            </span>

            <input
              type="search"
              placeholder="Search products..."
            />
          </div>

          {products.length === 0 ? (
            <div className="products-empty">
              <h2>No Products Found</h2>

              <p>
                There are currently no products
                available.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
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

                    <h3>{product.name}</h3>

                    <p className="shop-product-price">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <div className="product-actions">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-secondary"
                      >
                        View Details
                      </Link>

                      <button className="btn btn-primary">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Products;  