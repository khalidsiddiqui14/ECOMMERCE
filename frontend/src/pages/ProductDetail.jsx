import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getProduct } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [wishlistSuccess, setWishlistSuccess] =
    useState("");

  const [imageError, setImageError] =
    useState(false);

  // Load product
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);
      setImageError(false);
      setQuantity(1);

      try {
        const data = await getProduct(id);

        if (!data) {
          throw new Error(
            "Product data was not returned."
          );
        }

        if (!cancelled) {
          setProduct(data);
        }
      } catch (error) {
        console.error(
          "PRODUCT DETAIL ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
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

  const stock = Number(
    product?.stock ?? 0
  );

  const hasStock = stock > 0;

  // Handle quantity input
  const handleQuantityChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const numericValue = Number(value);

    if (!Number.isInteger(numericValue)) {
      return;
    }

    if (numericValue < 1) {
      setQuantity(1);
      return;
    }

    if (numericValue > stock) {
      setQuantity(stock);
      return;
    }

    setQuantity(numericValue);
  };

  // Decrease quantity
  const handleDecrease = () => {
    setQuantity((current) => {
      const currentValue =
        Number(current) || 1;

      return Math.max(
        1,
        currentValue - 1
      );
    });
  };

  // Increase quantity
  const handleIncrease = () => {
    setQuantity((current) => {
      const currentValue =
        Number(current) || 1;

      return Math.min(
        stock,
        currentValue + 1
      );
    });
  };

  // Add product to cart
  const handleAddToCart = async () => {
    if (
      !product ||
      !hasStock ||
      adding
    ) {
      return;
    }

    const selectedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        selectedQuantity
      ) ||
      selectedQuantity < 1 ||
      selectedQuantity > stock
    ) {
      setError(
        "Please select a valid quantity."
      );
      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      await addToCart(
        product.id,
        selectedQuantity
      );

      setSuccess(
        `${selectedQuantity} ${
          selectedQuantity === 1
            ? "item"
            : "items"
        } cart me successfully add ho gaya.`
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Product cart me add nahi ho paaya."
      );
    } finally {
      setAdding(false);
    }
  };

  // Add product to wishlist
  const handleAddToWishlist =
    async () => {
      if (
        !product ||
        wishlistLoading
      ) {
        return;
      }

      setWishlistLoading(true);
      setError("");
      setWishlistSuccess("");

      try {
        await addToWishlist(
          product.id
        );

        setWishlistSuccess(
          "Product wishlist me add ho gaya."
        );
      } catch (error) {
        console.error(
          "WISHLIST ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            "Product wishlist me add nahi ho paaya."
        );
      } finally {
        setWishlistLoading(false);
      }
    };

  if (loading) {
    return (
      <main className="product-detail-page">
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

  if (error && !product) {
    return (
      <main className="product-detail-page">
        <div className="products-empty">
          <h2>Product Not Found</h2>

          <p>{error}</p>

          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

            <Link
              to="/products"
              className="btn btn-secondary"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const productImages =
    Array.isArray(product.images)
      ? product.images
      : [];

  const primaryImage =
    productImages.length > 0
      ? productImages[0]
      : product.image;

  const productCategory =
    product.category_name ||
    product.category ||
    "Product";

  const productPrice = Number(
    product.price || 0
  );

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-image">
          {primaryImage && !imageError ? (
            <img
              src={primaryImage}
              alt={
                product.name ||
                "Product"
              }
              onError={() =>
                setImageError(true)
              }
            />
          ) : (
            <span
              aria-label="Product image unavailable"
              role="img"
            >
              📦
            </span>
          )}
        </div>

        <div className="product-detail-info">
          <span className="shop-product-category">
            {productCategory}
          </span>

          <h1>
            {product.name || "Product"}
          </h1>

          <p className="detail-price">
            ₹
            {productPrice.toLocaleString(
              "en-IN"
            )}
          </p>

          <p className="detail-description">
            {product.description ||
              "No description available."}
          </p>

          <p
            className={`stock-status ${
              hasStock
                ? "stock-available"
                : "stock-out"
            }`}
          >
            {hasStock
              ? `${stock} ${
                  stock === 1
                    ? "item"
                    : "items"
                } available`
              : "Out of stock"}
          </p>

          {error && (
            <div
              className="auth-error"
              role="alert"
              aria-live="assertive"
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

          {wishlistSuccess && (
            <div
              className="auth-success"
              role="status"
              aria-live="polite"
            >
              {wishlistSuccess}
            </div>
          )}

          {hasStock && (
            <div className="quantity-control">
              <label htmlFor="quantity">
                Quantity
              </label>

              <div>
                <button
                  type="button"
                  onClick={
                    handleDecrease
                  }
                  disabled={
                    adding ||
                    Number(quantity) <= 1
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={stock}
                  value={quantity}
                  onChange={
                    handleQuantityChange
                  }
                  disabled={adding}
                  inputMode="numeric"
                  aria-describedby="quantity-help"
                />

                <button
                  type="button"
                  onClick={
                    handleIncrease
                  }
                  disabled={
                    adding ||
                    Number(quantity) >=
                      stock
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span id="quantity-help">
                Maximum available: {stock}
              </span>
            </div>
          )}

          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !hasStock ||
                adding ||
                wishlistLoading
              }
              onClick={
                handleAddToCart
              }
            >
              {adding
                ? "Adding..."
                : hasStock
                  ? "Add to Cart"
                  : "Out of Stock"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={
                handleAddToWishlist
              }
              disabled={
                wishlistLoading ||
                adding
              }
            >
              {wishlistLoading
                ? "Adding..."
                : "Add to Wishlist"}
            </button>
          </div>

          {success && (
            <Link
              to="/cart"
              className="back-link"
            >
              Go to Cart →
            </Link>
          )}

          {wishlistSuccess && (
            <Link
              to="/wishlist"
              className="back-link"
            >
              Go to Wishlist →
            </Link>
          )}

          <Link
            to="/products"
            className="back-link"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;