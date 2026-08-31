import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  getWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] =
    useState(null);
  const [error, setError] = useState("");

  // Load wishlist
  const loadWishlist = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const data = await getWishlist();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.items)
              ? data.items
              : [];

        setWishlist(items);
      } catch (error) {
        console.error(
          "WISHLIST ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Wishlist load nahi ho paayi."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Remove wishlist item
  const handleRemove = async (itemId) => {
    if (
      !itemId ||
      removingItemId === itemId
    ) {
      return;
    }

    setRemovingItemId(itemId);
    setError("");

    try {
      await removeFromWishlist(itemId);

      setWishlist((previous) =>
        previous.filter(
          (item) => item.id !== itemId
        )
      );
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Wishlist item remove nahi ho paaya."
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  if (loading) {
    return (
      <main className="wishlist-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading wishlist...
        </div>
      </main>
    );
  }

  if (error && wishlist.length === 0) {
    return (
      <main className="wishlist-page">
        <div className="products-empty">
          <h2>
            Unable to Load Wishlist
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              loadWishlist()
            }
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
              {wishlist.length} saved product
              {wishlist.length === 1
                ? ""
                : "s"}.
            </p>
          </div>

          <Link
            to="/products"
            className="btn btn-secondary"
          >
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div
              className="wishlist-empty-icon"
              aria-hidden="true"
            >
              ❤️
            </div>

            <h2>
              Your Wishlist is Empty
            </h2>

            <p>
              Save products you love and
              find them here later.
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
                product.id ||
                item.product;

              const productName =
                product.name ||
                `Product #${productId}`;

              const productPrice = Number(
                product.price || 0
              );

              const image =
                Array.isArray(
                  product.images
                ) &&
                product.images.length > 0
                  ? product.images[0]
                  : product.image;

              const isRemoving =
                removingItemId ===
                item.id;

              return (
                <article
                  className="wishlist-card"
                  key={
                    item.id ||
                    productId
                  }
                >
                  <div className="wishlist-image">
                    {image ? (
                      <img
                        src={image}
                        alt={productName}
                        loading="lazy"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label="Product image unavailable"
                      >
                        📦
                      </span>
                    )}
                  </div>

                  <div className="wishlist-info">
                    <h3>
                      {productName}
                    </h3>

                    <p className="wishlist-price">
                      ₹
                      {productPrice.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <div className="wishlist-actions">
                      <Link
                        to={`/products/${productId}`}
                        className="btn btn-primary"
                        aria-label={`View ${productName}`}
                      >
                        View Product
                      </Link>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          handleRemove(
                            item.id
                          )
                        }
                        disabled={
                          isRemoving
                        }
                      >
                        {isRemoving
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;