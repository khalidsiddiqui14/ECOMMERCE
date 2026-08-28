import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>E-Shop</h2>

          <p>
            Your trusted online store for quality
            products at great prices.
          </p>
        </div>

        <div className="footer-section">
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
        </div>

        <div className="footer-section">
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
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>
            Email: support@eshop.com
          </p>

          <p>
            Phone: +91 98765 43210
          </p>

          <p>
            India
          </p>
        </div>
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