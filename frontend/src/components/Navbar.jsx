import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const token =
      localStorage.getItem("access_token");

    const storedUser =
      localStorage.getItem("user");

    if (!token || !storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "INVALID STORED USER:",
        error
      );

      localStorage.removeItem("user");

      return null;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const storedUser =
        localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "INVALID STORED USER:",
          error
        );

        localStorage.removeItem("user");
        setUser(null);
      }
    };

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener(
      "auth-change",
      handleAuthChange
    );

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "auth-change",
        handleAuthChange
      );

      window.removeEventListener(
        "storage",
        handleAuthChange
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);

    window.dispatchEvent(
      new Event("auth-change")
    );

    navigate("/login", {
      replace: true,
    });
  };

  const navLinkClass = ({
    isActive,
  }) =>
    `navbar-link${
      isActive
        ? " navbar-link-active"
        : ""
    }`;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="logo"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          E-Shop
        </Link>

        <nav
          className={`nav-links${
            menuOpen
              ? " nav-links-open"
              : ""
          }`}
        >
          <NavLink
            to="/"
            className={navLinkClass}
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={navLinkClass}
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Products
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/wishlist"
                className={navLinkClass}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Wishlist
              </NavLink>

              <NavLink
                to="/cart"
                className={navLinkClass}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Cart
              </NavLink>

              <NavLink
                to="/orders"
                className={navLinkClass}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Orders
              </NavLink>
            </>
          )}

          {user && (
            <NavLink
              to="/settings"
              className={navLinkClass}
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Settings
            </NavLink>
          )}

          {user?.role === "VENDOR" && (
            <NavLink
              to="/vendor/dashboard"
              className={navLinkClass}
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Vendor Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {!user ? (
            <>
              <Link
                to="/login"
                className="nav-auth-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="nav-register-link"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="nav-user-menu">
              <button
                type="button"
                className="nav-user-button"
                onClick={() =>
                  setMenuOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="nav-user-icon">
                  👤
                </span>

                <span className="nav-user-name">
                  {user.username ||
                    user.email ||
                    "Account"}
                </span>

                <span className="nav-user-arrow">
                  {menuOpen
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {menuOpen && (
                <div
                  className="nav-user-dropdown"
                  role="menu"
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    Settings
                  </Link>

                  {user?.role ===
                    "VENDOR" && (
                    <Link
                      to="/vendor/dashboard"
                      role="menuitem"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                    >
                      Vendor Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    role="menuitem"
                    onClick={
                      handleLogout
                    }
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="navbar-menu-button"
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;