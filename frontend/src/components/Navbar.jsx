import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";


function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(
      "access_token"
    );

    const storedUser = localStorage.getItem(
      "user"
    );

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

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);


  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem(
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


  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };


  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem("user");

    setUser(null);

    closeMenus();

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


  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(
      (previous) => !previous
    );

    setUserMenuOpen(false);
  };


  const handleUserMenuToggle = () => {
    setUserMenuOpen(
      (previous) => !previous
    );

    setMobileMenuOpen(false);
  };


  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link
          to="/"
          className="logo"
          onClick={closeMenus}
        >
          E-Shop
        </Link>


        <nav
          className={`nav-links${
            mobileMenuOpen
              ? " nav-links-open"
              : ""
          }`}
          aria-label="Primary navigation"
        >
          <NavLink
            to="/"
            className={navLinkClass}
            onClick={closeMenus}
          >
            Home
          </NavLink>


          <NavLink
            to="/products"
            className={navLinkClass}
            onClick={closeMenus}
          >
            Products
          </NavLink>


          {user && (
            <>
              <NavLink
                to="/wishlist"
                className={navLinkClass}
                onClick={closeMenus}
              >
                Wishlist
              </NavLink>


              <NavLink
                to="/cart"
                className={navLinkClass}
                onClick={closeMenus}
              >
                Cart
              </NavLink>


              <NavLink
                to="/orders"
                className={navLinkClass}
                onClick={closeMenus}
              >
                Orders
              </NavLink>


              <NavLink
                to="/settings"
                className={navLinkClass}
                onClick={closeMenus}
              >
                Settings
              </NavLink>
            </>
          )}


          {user?.role === "VENDOR" && (
            <NavLink
              to="/vendor/dashboard"
              className={navLinkClass}
              onClick={closeMenus}
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
                onClick={closeMenus}
              >
                Login
              </Link>


              <Link
                to="/register"
                className="nav-register-link"
                onClick={closeMenus}
              >
                Register
              </Link>
            </>
          ) : (
            <div className="nav-user-menu">

              <button
                type="button"
                className="nav-user-button"
                onClick={
                  handleUserMenuToggle
                }
                aria-expanded={
                  userMenuOpen
                }
                aria-haspopup="menu"
              >
                <span
                  className="nav-user-icon"
                  aria-hidden="true"
                >
                  👤
                </span>


                <span className="nav-user-name">
                  {user.username ||
                    user.email ||
                    "Account"}
                </span>


                <span
                  className="nav-user-arrow"
                  aria-hidden="true"
                >
                  {userMenuOpen
                    ? "▲"
                    : "▼"}
                </span>
              </button>


              {userMenuOpen && (
                <div
                  className="nav-user-dropdown"
                  role="menu"
                  aria-label="Account menu"
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    Profile
                  </Link>


                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={closeMenus}
                  >
                    Settings
                  </Link>


                  {user.role === "VENDOR" && (
                    <Link
                      to="/vendor/dashboard"
                      role="menuitem"
                      onClick={closeMenus}
                    >
                      Vendor Dashboard
                    </Link>
                  )}


                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
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
            onClick={
              handleMobileMenuToggle
            }
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={
              mobileMenuOpen
            }
            aria-controls="primary-navigation"
          >
            <span aria-hidden="true">
              {mobileMenuOpen
                ? "✕"
                : "☰"}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}


export default Navbar;