import { useState } from "react";
import { Link } from "react-router-dom";

import { addToWishlist } from "../services/wishlistService";

const categories = [
  {
    name: "Smartphones",
    icon: "📱",
    text: "Latest smartphones",
  },
  {
    name: "Laptops",
    icon: "💻",
    text: "Powerful laptops",
  },
  {
    name: "Smart Watches",
    icon: "⌚",
    text: "Wearable technology",
  },
  {
    name: "Audio",
    icon: "🎧",
    text: "Premium sound",
  },
];

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Audio",
    icon: "🎧",
    price: "3,999",
    oldPrice: "4,999",
    rating: "4.8",
  },
  {
    id: 2,
    name: "Premium Smartphone",
    category: "Electronics",
    icon: "📱",
    price: "29,999",
    oldPrice: "34,999",
    rating: "4.9",
  },
  {
    id: 3,
    name: "Performance Laptop",
    category: "Computers",
    icon: "💻",
    price: "59,999",
    oldPrice: "69,999",
    rating: "4.8",
  },
  {
    id: 4,
    name: "Smart Watch Pro",
    category: "Wearables",
    icon: "⌚",
    price: "4,999",
    oldPrice: "6,499",
    rating: "4.7",
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    category: "Audio",
    icon: "🔊",
    price: "2,499",
    oldPrice: "3,299",
    rating: "4.8",
  },
];

const productTabs = [
  "All Products",
  "Electronics",
  "Accessories",
  "Fashion",
];

function Home() {
  const [activeCategory, setActiveCategory] =
    useState("All Products");

  const [wishlistLoadingId, setWishlistLoadingId] =
    useState(null);

  const [wishlistMessage, setWishlistMessage] =
    useState("");

  const [newsletterEmail, setNewsletterEmail] =
    useState("");

  const [newsletterMessage, setNewsletterMessage] =
    useState("");

  // Filter products
  const filteredProducts =
    activeCategory === "All Products"
      ? products
      : activeCategory === "Electronics"
        ? products.filter(
            (product) =>
              product.category ===
                "Electronics" ||
              product.category ===
                "Computers"
          )
        : activeCategory === "Accessories"
          ? products.filter(
              (product) =>
                product.category ===
                  "Audio" ||
                product.category ===
                  "Wearables"
            )
          : [];

  // Add Product To Wishlist
  const handleAddToWishlist = async (
    product
  ) => {
    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      setWishlistMessage(
        "Please login to add products to your wishlist."
      );

      return;
    }

    setWishlistLoadingId(
      product.id
    );

    setWishlistMessage("");

    try {
      await addToWishlist(
        product.id
      );

      setWishlistMessage(
        `${product.name} added to your wishlist.`
      );
    } catch (error) {
      console.error(
        "HOME WISHLIST ERROR:",
        error
      );

      setWishlistMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Product wishlist me add nahi ho paaya."
      );
    } finally {
      setWishlistLoadingId(
        null
      );
    }
  };

  // Newsletter Submit
  const handleNewsletterSubmit = (
    event
  ) => {
    event.preventDefault();

    const email =
      newsletterEmail.trim();

    if (!email) {
      return;
    }

    setNewsletterMessage(
      "Thanks for subscribing! We'll keep you updated."
    );

    setNewsletterEmail("");
  };

  return (
    <main className="home">
      {/* TOP BAR */}

      <div className="home-top-bar">
        <div className="home-container home-top-inner">
          <span>
            Free shipping on orders above ₹999
          </span>

          <div className="home-top-links">
            <span>🇮🇳 India</span>
            <span>English</span>

            <Link to="/notifications">
              Help & Updates
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}

      <section className="home-hero">
        <div className="home-container home-hero-grid">
          <div className="home-hero-content">
            <span className="home-hero-badge">
              NEW COLLECTION · 2026
            </span>

            <h1>
              Discover a New
              <br />
              <strong>
                Shopping Experience
              </strong>
            </h1>

            <p>
              Premium electronics, smart
              accessories and everyday
              essentials from trusted
              vendors.
            </p>

            <div className="home-hero-buttons">
              <Link
                to="/products"
                className="home-primary-button"
              >
                Shop Now <span>→</span>
              </Link>

              <Link
                to="/products"
                className="home-outline-button"
              >
                Explore Products
              </Link>
            </div>

            <div className="home-hero-stats">
              <div>
                <strong>
                  1000+
                </strong>

                <span>
                  Products
                </span>
              </div>

              <div>
                <strong>
                  50+
                </strong>

                <span>
                  Vendors
                </span>
              </div>

              <div>
                <strong>
                  4.8★
                </strong>

                <span>
                  Rating
                </span>
              </div>
            </div>
          </div>

          <div className="home-hero-product">
            <div className="home-hero-glow" />

            <div className="home-hero-product-image">
              🎧
            </div>

            <div className="home-hero-product-info">
              <span>
                FEATURED PRODUCT
              </span>

              <h2>
                Wireless
                <br />
                Headphones
              </h2>

              <div className="home-hero-price">
                ₹3,999
              </div>

              <Link
                to="/products/1"
                className="home-primary-button"
              >
                Buy Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="home-benefits">
        <div className="home-container home-benefits-grid">
          <div className="home-benefit">
            <div className="home-benefit-icon">
              🚚
            </div>

            <div>
              <strong>
                Fast Delivery
              </strong>

              <span>
                Across India
              </span>
            </div>
          </div>

          <div className="home-benefit">
            <div className="home-benefit-icon">
              🔒
            </div>

            <div>
              <strong>
                Secure Payments
              </strong>

              <span>
                Protected checkout
              </span>
            </div>
          </div>

          <div className="home-benefit">
            <div className="home-benefit-icon">
              ✓
            </div>

            <div>
              <strong>
                Trusted Vendors
              </strong>

              <span>
                Verified sellers
              </span>
            </div>
          </div>

          <div className="home-benefit">
            <div className="home-benefit-icon">
              ↩
            </div>

            <div>
              <strong>
                Easy Returns
              </strong>

              <span>
                Simple return policy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-label">
                EXPLORE
              </span>

              <h2>
                Shop by Category
              </h2>

              <p>
                Find everything you need
                in one place.
              </p>
            </div>

            <Link
              to="/products"
              className="home-view-all"
            >
              View All →
            </Link>
          </div>

          <div className="home-category-grid">
            {categories.map(
              (category) => (
                <Link
                  to="/products"
                  className="home-category-card"
                  key={category.name}
                >
                  <div className="home-category-icon">
                    {category.icon}
                  </div>

                  <div>
                    <span>
                      {category.text}
                    </span>

                    <h3>
                      {category.name}
                    </h3>

                    <strong>
                      Shop Now →
                    </strong>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}

      <section className="home-section home-products-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-label">
                TRENDING NOW
              </span>

              <h2>
                Featured Products
              </h2>

              <p>
                Discover our most popular
                products.
              </p>
            </div>

            <Link
              to="/products"
              className="home-view-all"
            >
              View All →
            </Link>
          </div>

          <div className="home-product-tabs">
            {productTabs.map(
              (tab) => (
                <button
                  type="button"
                  key={tab}
                  className={
                    activeCategory ===
                    tab
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveCategory(
                      tab
                    )
                  }
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {wishlistMessage && (
            <div
              className="auth-success"
              role="status"
              aria-live="polite"
            >
              {wishlistMessage}
            </div>
          )}

          {filteredProducts.length ===
          0 ? (
            <div className="products-empty">
              <h2>
                No Products Found
              </h2>

              <p>
                No products are available
                in this category right now.
              </p>

              <Link
                to="/products"
                className="btn btn-primary"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="home-product-grid">
              {filteredProducts.map(
                (product) => {
                  const isWishlistLoading =
                    wishlistLoadingId ===
                    product.id;

                  return (
                    <article
                      className="home-product-card"
                      key={product.id}
                    >
                      <div className="home-product-image">
                        <span className="home-sale-badge">
                          SALE
                        </span>

                        <button
                          type="button"
                          className="home-heart"
                          aria-label={`Add ${product.name} to wishlist`}
                          onClick={() =>
                            handleAddToWishlist(
                              product
                            )
                          }
                          disabled={
                            isWishlistLoading
                          }
                        >
                          {isWishlistLoading
                            ? "..."
                            : "♡"}
                        </button>

                        <div className="home-product-emoji">
                          {product.icon}
                        </div>
                      </div>

                      <div className="home-product-content">
                        <span className="home-product-category">
                          {product.category}
                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <div className="home-product-rating">
                          <span>
                            ★★★★★
                          </span>

                          <small>
                            {product.rating}
                          </small>
                        </div>

                        <div className="home-product-price">
                          <strong>
                            ₹
                            {
                              product.price
                            }
                          </strong>

                          <del>
                            ₹
                            {
                              product.oldPrice
                            }
                          </del>
                        </div>

                        <Link
                          to={`/products/${product.id}`}
                          className="home-cart-button"
                        >
                          View Product →
                        </Link>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* DEAL */}

      <section className="home-deal">
        <div className="home-container home-deal-grid">
          <div>
            <span className="home-label">
              LIMITED TIME OFFER
            </span>

            <h2>
              Big Savings.
              <br />
              Better Shopping.
            </h2>

            <p>
              Get up to 30% off on selected
              electronics and accessories.
            </p>

            <Link
              to="/products"
              className="home-primary-button"
            >
              Shop Deals →
            </Link>
          </div>

          <div className="home-deal-visual">
            <div className="home-discount-circle">
              <span>UP TO</span>
              <strong>30%</strong>
              <span>OFF</span>
            </div>

            <div className="home-deal-icons">
              📱 💻 🎧 ⌚
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}

      <section className="home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-label">
                BEST SELLERS
              </span>

              <h2>
                Trending Products
              </h2>

              <p>
                Products customers are
                loving right now.
              </p>
            </div>

            <Link
              to="/products"
              className="home-view-all"
            >
              Explore All →
            </Link>
          </div>

          <div className="home-trending-grid">
            {products
              .slice(0, 4)
              .map((product) => (
                <Link
                  to={`/products/${product.id}`}
                  className="home-trending-card"
                  key={product.id}
                >
                  <div className="home-trending-image">
                    {product.icon}
                  </div>

                  <div>
                    <span>
                      {product.category}
                    </span>

                    <h3>
                      {product.name}
                    </h3>

                    <strong>
                      ₹{product.price}
                    </strong>
                  </div>

                  <b>→</b>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}

      <section className="home-reviews">
        <div className="home-container">
          <div className="home-section-heading centered">
            <div>
              <span className="home-label">
                CUSTOMER REVIEWS
              </span>

              <h2>
                What Our Customers Say
              </h2>

              <p>
                Real experiences from our
                customers.
              </p>
            </div>
          </div>

          <div className="home-review-grid">
            <article className="home-review-card">
              <div className="home-review-stars">
                ★★★★★
              </div>

              <p>
                "Great products and very
                fast delivery. The shopping
                experience was excellent."
              </p>

              <div className="home-review-user">
                <div>R</div>

                <strong>
                  Rahul Sharma
                </strong>
              </div>
            </article>

            <article className="home-review-card">
              <div className="home-review-stars">
                ★★★★★
              </div>

              <p>
                "Product quality was better
                than expected. I will
                definitely shop again."
              </p>

              <div className="home-review-user">
                <div>A</div>

                <strong>
                  Aman Khan
                </strong>
              </div>
            </article>

            <article className="home-review-card">
              <div className="home-review-stars">
                ★★★★★
              </div>

              <p>
                "Easy ordering, good prices
                and excellent customer
                support."
              </p>

              <div className="home-review-user">
                <div>S</div>

                <strong>
                  Sara Ali
                </strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}

      <section className="home-newsletter">
        <div className="home-container home-newsletter-inner">
          <div>
            <span className="home-label">
              STAY UPDATED
            </span>

            <h2>
              Get the Latest Deals
            </h2>

            <p>
              Subscribe for new products,
              exclusive offers and special
              deals.
            </p>
          </div>

          <div>
            <form
              onSubmit={
                handleNewsletterSubmit
              }
              className="home-newsletter-form"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={
                  newsletterEmail
                }
                onChange={(event) =>
                  setNewsletterEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                aria-label="Email address"
                required
              />

              <button type="submit">
                Subscribe →
              </button>
            </form>

            {newsletterMessage && (
              <p
                className="auth-success"
                role="status"
                aria-live="polite"
              >
                {newsletterMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;