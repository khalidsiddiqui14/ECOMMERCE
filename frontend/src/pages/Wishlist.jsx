import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    try {
      setError("");

      const data = await getWishlist();

      setWishlist(
        data.results || data.items || data
      );
    } catch (error) {
      console.error(
        "WISHLIST ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Wishlist load nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchWishlist = async () => {
      try {
        if (!cancelled) {
          setError("");
          setLoading(true);
        }

        const data = await getWishlist();

        if (!cancelled) {
          setWishlist(
            data.results ||
              data.items ||
              data
          );
        }
      } catch (error) {
        console.error(
          "WISHLIST ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.message ||
              "Wishlist load nahi ho paayi."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await removeFromWishlist(itemId);

      await loadWishlist();
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Wishlist item remove nahi ho paaya."
      );
    }
  };

  if (loading) {
    return (
      <main className="wishlist-page">
        <div className="products-loading">
          Loading wishlist...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="wishlist-page">
        <div className="products-empty">
          <h2>Wishlist Error</h2>

          <p>{error}</p>

          <button
            className="btn btn-primary"
            onClick={loadWishlist}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div>
            <h1>My Wishlist</h1>

            <p>
              Products you've saved for later.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              ❤️
            </div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              Save products you love and find
              them here later.
            </p>

            <Link
              to="/products"
              className="btn btn-primary"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const product =
                item.product || item;

              const productId =
                product.id || item.product;

              return (
                <div
                  className="wishlist-card"
                  key={item.id || productId}
                >
                  <div className="wishlist-image">
                    {product.images &&
                    product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                      />
                    ) : (
                      <span>🎧</span>
                    )}
                  </div>

                  <div className="wishlist-info">
                    <h3>
                      {product.name ||
                        `Product #${productId}`}
                    </h3>

                    <p className="wishlist-price">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <div className="wishlist-actions">
                      <Link
                        to={`/products/${productId}`}
                        className="btn btn-primary"
                      >
                        View Product
                      </Link>

                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          handleRemove(
                            item.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;