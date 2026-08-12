import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProfile } from "../services/userService";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setUser(data);
      } catch (error) {
        console.error("PROFILE ERROR:", error);

        setError(
          error.response?.data?.detail ||
            error.message ||
            "Profile load nahi ho paaya."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <div className="products-loading">
          Loading profile...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <div className="products-empty">
          <h2>Profile Error</h2>

          <p>{error}</p>

          <Link
            to="/login"
            className="btn btn-primary"
          >
            Login Again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username
              ? user.username
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <h1>
              {user?.username || "My Account"}
            </h1>

            <p>
              Manage your account information.
            </p>
          </div>
        </div>

        <section className="profile-card">
          <h2>Personal Information</h2>

          <div className="profile-grid">
            <div className="profile-field">
              <span>Username</span>
              <strong>
                {user?.username || "-"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Email</span>
              <strong>
                {user?.email || "-"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Phone</span>
              <strong>
                {user?.phone || "Not provided"}
              </strong>
            </div>

            <div className="profile-field">
              <span>Role</span>
              <strong>
                {user?.role || "MEMBER"}
              </strong>
            </div>
          </div>
        </section>

        <div className="profile-actions">
          <Link
            to="/orders"
            className="btn btn-secondary"
          >
            My Orders
          </Link>

          <Link
            to="/products"
            className="btn btn-primary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Profile;