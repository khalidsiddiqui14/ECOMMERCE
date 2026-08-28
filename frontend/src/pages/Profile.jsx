import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProfile } from "../services/userService";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProfile();

      if (!data) {
        throw new Error(
          "Profile data was not returned."
        );
      }

      setUser(data);

      // Keep local user information in sync.
      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Profile load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getProfile();

        if (cancelled) {
          return;
        }

        if (!data) {
          throw new Error(
            "Profile data was not returned."
          );
        }

        setUser(data);

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );
      } catch (error) {
        console.error(
          "PROFILE ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.response?.data?.message ||
              error.message ||
              "Profile load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <div
          className="products-loading"
          role="status"
          aria-live="polite"
        >
          Loading profile...
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="profile-page">
        <div className="products-empty">
          <h2>
            Unable to Load Profile
          </h2>

          <p>
            {error ||
              "Profile information is unavailable."}
          </p>

          <div className="profile-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={loadProfile}
            >
              Try Again
            </button>

            <Link
              to="/login"
              className="btn btn-secondary"
            >
              Login Again
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const username =
    user.username || "My Account";

  const email =
    user.email || "Not provided";

  const phone =
    user.phone || "Not provided";

  const role =
    user.role || "MEMBER";

  const avatar =
    username.charAt(0).toUpperCase();

  const formattedRole =
    role
      .toLowerCase()
      .replace(
        /^./,
        (character) =>
          character.toUpperCase()
      );

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div
            className="profile-avatar"
            aria-hidden="true"
          >
            {avatar}
          </div>

          <div>
            <h1>
              {username}
            </h1>

            <p>
              Manage your account
              information.
            </p>
          </div>
        </div>

        <section className="profile-card">
          <h2>
            Personal Information
          </h2>

          <div className="profile-grid">
            <div className="profile-field">
              <span>
                Username
              </span>

              <strong>
                {username}
              </strong>
            </div>

            <div className="profile-field">
              <span>
                Email
              </span>

              <strong>
                {email}
              </strong>
            </div>

            <div className="profile-field">
              <span>
                Phone
              </span>

              <strong>
                {phone}
              </strong>
            </div>

            <div className="profile-field">
              <span>
                Account Type
              </span>

              <strong>
                {formattedRole}
              </strong>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <h2>
            Account & Security
          </h2>

          <div className="profile-actions">
            <Link
              to="/settings"
              className="btn btn-secondary"
            >
              Account Settings
            </Link>

            <Link
              to="/change-password"
              className="btn btn-secondary"
            >
              Change Password
            </Link>
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