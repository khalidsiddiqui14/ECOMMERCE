import { Link } from "react-router-dom";

function Home() {
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
  ];

  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      category: "Accessories",
      icon: "🎧",
      price: "3,999",
      oldPrice: "4,999",
      rating: "4.8",
    },
    {
      id: 2,
      name: "Smartphone",
      category: "Electronics",
      icon: "📱",
      price: "29,999",
      oldPrice: "34,999",
      rating: "4.9",
    },
    {
      id: 3,
      name: "Laptop",
      category: "Electronics",
      icon: "💻",
      price: "59,999",
      oldPrice: "69,999",
      rating: "4.8",
    },
    {
      id: 4,
      name: "Smart Watch",
      category: "Accessories",
      icon: "⌚",
      price: "4,999",
      oldPrice: "6,499",
      rating: "4.7",
    },
    {
      id: 5,
      name: "Bluetooth Speaker",
      category: "Accessories",
      icon: "🔊",
      price: "2,499",
      oldPrice: "3,299",
      rating: "4.8",
    },
  ];

  const reviews = [
    {
      name: "Rahul Sharma",
      text: "Great products and very fast delivery. The shopping experience was excellent.",
      rating: "★★★★★",
    },
    {
      name: "Aman Khan",
      text: "Product quality was better than expected. I will definitely shop again.",
      rating: "★★★★★",
    },
    {
      name: "Sara Ali",
      text: "Easy ordering, good prices and excellent customer support.",
      rating: "★★★★★",
    },
  ];

  return (
    <main className="home">

      <div className="home-top-bar">
        <div>
          Free shipping on orders above ₹999
        </div>

        <div className="home-top-links">
          <span>India</span>
          <span>English</span>
          <span>Help Center</span>
        </div>
      </div>

      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-badge">
            NEW COLLECTION
          </span>

          <h1>
            Discover a New
            <br />
            <strong>Shopping Experience</strong>
          </h1>

          <p>
            Explore premium electronics,
            accessories and everyday essentials
            from trusted vendors.
          </p>

          <div className="home-hero-buttons">
            <Link
              to="/products"
              className="home-primary-button"
            >
              Shop Now →
            </Link>

            <Link
              to="/products"
              className="home-outline-button"
            >
              Explore Products
            </Link>
          </div>

          <div className="home-hero-info">
            <div>
              <strong>1000+</strong>
              <span>Products</span>
            </div>

            <div>
              <strong>50+</strong>
              <span>Vendors</span>
            </div>

            <div>
              <strong>4.8★</strong>
              <span>Customer Rating</span>
            </div>
          </div>
        </div>

        <div className="home-hero-product">
          <div className="home-hero-product-glow">
            🎧
          </div>

          <span>FEATURED PRODUCT</span>

          <h3>
            Wireless
            <br />
            Headphones
          </h3>

          <div className="home-hero-price">
            ₹3,999
          </div>

          <Link
            to="/products/1"
            className="home-primary-button"
          >
            Buy Now
          </Link>
        </div>
      </section>

      <section className="home-promo-section">
        <div className="home-promo-grid">
          {categories.map((category) => (
            <Link
              to="/products"
              className="home-promo-card"
              key={category.name}
            >
              <div className="home-promo-icon">
                {category.icon}
              </div>

              <div>
                <span>{category.text}</span>

                <h3>
                  {category.name}
                </h3>

                <strong>
                  Shop Now →
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-label">
              TRENDING NOW
            </span>

            <h2>
              Featured Products
            </h2>

            <p>
              Discover our most popular products.
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
          <button className="active">
            All Products
          </button>

          <button>
            Electronics
          </button>

          <button>
            Accessories
          </button>

          <button>
            Fashion
          </button>
        </div>

        <div className="home-product-grid">
          {products.map((product) => (
            <article
              className="home-product-card"
              key={product.id}
            >
              <div className="home-product-image">
                <span className="home-sale-badge">
                  SALE
                </span>

                <button
                  className="home-heart"
                  type="button"
                >
                  ♡
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
                  <span>★★★★★</span>
                  <small>
                    {product.rating}
                  </small>
                </div>

                <div className="home-product-price">
                  <strong>
                    ₹{product.price}
                  </strong>

                  <del>
                    ₹{product.oldPrice}
                  </del>
                </div>

                <Link
                  to={`/products/${product.id}`}
                  className="home-cart-button"
                >
                  View Product
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-offer">
        <div className="home-offer-content">
          <span className="home-label">
            LIMITED TIME OFFER
          </span>

          <h2>
            Upgrade Your
            <br />
            Everyday Tech
          </h2>

          <p>
            Get up to 30% off on selected
            electronics and accessories.
          </p>

          <Link
            to="/products"
            className="home-primary-button"
          >
            Shop Offers →
          </Link>
        </div>

        <div className="home-offer-visual">
          <div className="home-offer-circle">
            <span>UP TO</span>
            <strong>30%</strong>
            <span>OFF</span>
          </div>

          <div className="home-offer-products">
            📱 💻 🎧 ⌚
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="home-label">
              BEST SELLERS
            </span>

            <h2>
              Trending Products
            </h2>

            <p>
              Products customers are loving right now.
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
          {products.slice(0, 4).map((product) => (
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
            </Link>
          ))}
        </div>
      </section>

      <section className="home-benefits">
        <div className="home-section-heading centered">
          <div>
            <span className="home-label">
              SHOP WITH CONFIDENCE
            </span>

            <h2>
              Why Choose E-Shop?
            </h2>

            <p>
              Everything you need for a simple
              and reliable shopping experience.
            </p>
          </div>
        </div>

        <div className="home-benefit-grid">
          <div className="home-benefit-card">
            <div>🚚</div>
            <h3>Fast Delivery</h3>
            <p>
              Quick and safe delivery across India.
            </p>
          </div>

          <div className="home-benefit-card">
            <div>🔒</div>
            <h3>Secure Payments</h3>
            <p>
              Your payment information is protected.
            </p>
          </div>

          <div className="home-benefit-card">
            <div>✓</div>
            <h3>Trusted Vendors</h3>
            <p>
              Products from verified sellers.
            </p>
          </div>

          <div className="home-benefit-card">
            <div>↩</div>
            <h3>Easy Returns</h3>
            <p>
              Simple and customer-friendly returns.
            </p>
          </div>
        </div>
      </section>

      <section className="home-reviews">
        <div className="home-section-heading centered">
          <div>
            <span className="home-label">
              CUSTOMER REVIEWS
            </span>

            <h2>
              What Our Customers Say
            </h2>

            <p>
              Real experiences from our customers.
            </p>
          </div>
        </div>

        <div className="home-review-grid">
          {reviews.map((review) => (
            <div
              className="home-review-card"
              key={review.name}
            >
              <div className="home-review-stars">
                {review.rating}
              </div>

              <p>
                "{review.text}"
              </p>

              <div className="home-review-user">
                <div>
                  {review.name.charAt(0)}
                </div>

                <strong>
                  {review.name}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-newsletter">
        <div>
          <span className="home-label">
            STAY UPDATED
          </span>

          <h2>
            Get the Latest Deals
          </h2>

          <p>
            Subscribe for new products,
            exclusive offers and special deals.
          </p>
        </div>

        <form
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <input
            type="email"
            placeholder="Enter your email address"
            required
          />

          <button
            type="submit"
            className="home-primary-button"
          >
            Subscribe
          </button>
        </form>
      </section>

      <section className="home-final-cta">
        <div>
          <span className="home-label">
            START SHOPPING
          </span>

          <h2>
            Find Something
            <br />
            You'll Love.
          </h2>

          <p>
            Explore our complete collection
            and discover your next favorite product.
          </p>
        </div>

        <Link
          to="/products"
          className="home-primary-button"
        >
          Shop All Products →
        </Link>
      </section>

    </main>
  );
}

export default Home;