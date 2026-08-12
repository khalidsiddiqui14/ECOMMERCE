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

          <a href="/">Home</a>
          <a href="/products">Products</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/cart">Cart</a>
        </div>

        <div className="footer-section">
          <h3>Customer</h3>

          <a href="/orders">My Orders</a>
          <a href="/profile">My Profile</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>

          <p>Email: support@eshop.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>India</p>
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