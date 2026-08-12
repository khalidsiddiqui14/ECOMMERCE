import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProduct } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";

function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [wishlistSuccess, setWishlistSuccess] =
    useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);

        setProduct(data);
      } catch (error) {
        console.error(
          "PRODUCT DETAIL ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.message ||
            "Product load nahi ho paaya."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) {
      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      await addToCart(product.id, quantity);

      setSuccess(
        "Product cart me successfully add ho gaya."
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Product cart me add nahi ho paaya."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) {
      return;
    }

    setWishlistLoading(true);
    setError("");
    setWishlistSuccess("");

    try {
      await addToWishlist(product.id);

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
          "Product wishlist me add nahi ho paaya."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="products-loading">
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

          <Link
            to="/products"
            className="btn btn-primary"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-image">
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

        <div className="product-detail-info">
          <span className="shop-product-category">
            Category #{product.category}
          </span>

          <h1>{product.name}</h1>

          <p className="detail-price">
            ₹
            {Number(
              product.price
            ).toLocaleString("en-IN")}
          </p>

          <p className="detail-description">
            {product.description ||
              "No description available."}
          </p>

          <p className="stock-status">
            {product.stock > 0
              ? `${product.stock} items available`
              : "Out of stock"}
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          {wishlistSuccess && (
            <div className="auth-success">
              {wishlistSuccess}
            </div>
          )}

          {product.stock > 0 && (
            <div className="quantity-control">
              <label htmlFor="quantity">
                Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(event) => {
                  const value = Number(
                    event.target.value
                  );

                  if (
                    value >= 1 &&
                    value <= product.stock
                  ) {
                    setQuantity(value);
                  }
                }}
              />
            </div>
          )}

          <div className="detail-actions">
            <button
              className="btn btn-primary"
              disabled={
                product.stock <= 0 ||
                adding
              }
              onClick={handleAddToCart}
            >
              {adding
                ? "Adding..."
                : product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
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