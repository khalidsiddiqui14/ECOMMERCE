import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <section className="footer-section footer-brand">
          <h2>E-Shop</h2>

          <p>
            Your trusted online store for quality
            products at great prices.
          </p>
        </section>

        <nav
          className="footer-section"
          aria-label="Quick links"
        >
          <h3>Quick Links</h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

          <Link to="/cart">
            Cart
          </Link>
        </nav>

        <nav
          className="footer-section"
          aria-label="Customer links"
        >
          <h3>Customer</h3>

          <Link to="/orders">
            My Orders
          </Link>

          <Link to="/profile">
            My Profile
          </Link>

          <Link to="/settings">
            Settings
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>
        </nav>

        <section className="footer-section footer-contact">
          <h3>Contact</h3>

          <p>
            Email:{" "}
            <a href="mailto:support@eshop.com">
              support@eshop.com
            </a>
          </p>

          <p>
            Phone:{" "}
            <a href="tel:+919876543210">
              +91 98765 43210
            </a>
          </p>

          <p>India</p>
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 E-Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;