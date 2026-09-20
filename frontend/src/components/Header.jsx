import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const secondaryItems = [
  { l: "All", icon: "☰", isAll: true },
  { l: "Fresh", drop: true, path: "/fresh" },
  { l: "Prime Video", path: "/prime-video" },
  { l: "Sell", path: "/sell" },
  { l: "Bestsellers", path: "/bestsellers" },
  { l: "Today's Deals", path: "/deals" },
  { l: "Mobiles", path: "/category/electronics" },
  { l: "Customer Service", path: "/customer-service" },
  { l: "New Releases", path: "/new-releases" },
  { l: "Prime", drop: true, path: "/prime" },
  { l: "Amazon Pay", path: "/amazon-pay" },
  { l: "Electronics", path: "/category/electronics" },
  { l: "Fashion", path: "/category/fashion" },
  { l: "Home & Kitchen", path: "/category/home-kitchen" },
  { l: "Gift Cards", path: "/gift-cards" },
];

export default function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const load = () => {
      try {
        const s = localStorage.getItem("user");
        setUser(s ? JSON.parse(s) : null);
      } catch { setUser(null); }
    };

    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(Array.isArray(cart) ? cart.reduce((total, item) => total + Number(item.quantity || 1), 0) : 0);
      } catch {
        setCartCount(0);
      }
    };

    load();
    loadCart();

    window.addEventListener("auth-change", load);
    window.addEventListener("cart-change", loadCart);
    window.addEventListener("storage", loadCart);

    return () => {
      window.removeEventListener("auth-change", load);
      window.removeEventListener("cart-change", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("recent_searches");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    window.location.href = "/login";
  };

  const handleSearch = e => {
    e.preventDefault();
    const value = search.trim();
    if (!value) return;
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setSearch("");
  };

  const isAdmin = user?.role === "ADMIN" || user?.is_staff === true || user?.is_superuser === true;
  const isVendor = user?.role === "VENDOR" || isAdmin;

  return (
    <>
      <header style={{ background: "#131921", color: "white", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ height: "60px", display: "flex", alignItems: "center", gap: "8px", padding: "0 10px" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", padding: "6px 8px", border: "1px solid transparent", textDecoration: "none", color: "white" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span style={{ fontSize: "22px", fontWeight: "bold" }}>shop</span>
            <span style={{ fontSize: "22px", fontWeight: "bold", color: "#febd69", marginLeft: "4px" }}>zone</span>
          </Link>

          <div style={{ padding: "6px 8px", border: "1px solid transparent", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span style={{ fontSize: "18px" }}>📍</span>
            <div style={{ lineHeight: "14px" }}>
              <div style={{ fontSize: "12px", color: "#ccc" }}>Delivering to Delhi 110008</div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>Update location</div>
            </div>
          </div>

          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", height: "40px", borderRadius: "4px", overflow: "hidden", margin: "0 12px" }}>
            <div style={{ background: "#e6e6e6", color: "#555", padding: "0 10px", display: "grid", placeItems: "center", fontSize: "12px", borderRight: "1px solid #ddd" }}>
              All <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shopzone - mobiles, laptops, fashion..."
              style={{ flex: 1, border: "none", padding: "0 10px", fontSize: "15px", outline: "none" }}
            />
            <button type="submit" style={{ background: "#febd69", border: "none", padding: "0 16px", cursor: "pointer", fontSize: "18px" }}>🔍</button>
          </form>

          <div style={{ padding: "8px", border: "1px solid transparent", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span>🇮🇳</span><span style={{ fontSize: "14px", fontWeight: "bold" }}>EN</span><span style={{ fontSize: "10px" }}>▼</span>
          </div>

          <div style={{ position: "relative" }}
            onMouseEnter={e => {
              const menu = e.currentTarget.querySelector(".account-menu");
              if (menu) menu.style.display = "block";
            }}
            onMouseLeave={e => {
              const menu = e.currentTarget.querySelector(".account-menu");
              if (menu) menu.style.display = "none";
            }}
          >
            <div style={{ padding: "6px 8px", border: "1px solid transparent", color: "white", lineHeight: "14px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
              onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
            >
              <div style={{ fontSize: "12px" }}>Hello, {user?.username?.slice(0,10) || user?.email?.split("@")[0]?.slice(0,10) || "sign in"}</div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>Account & Lists <span style={{ fontSize: "10px" }}>▼</span></div>
            </div>

            <div className="account-menu" style={{ display: "none", position: "absolute", top: "100%", right: 0, width: "230px", background: "white", color: "#111", padding: "12px", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 9999 }}>
              {user ? (
                <>
                  <div style={{ padding: "8px 9px", borderBottom: "1px solid #ddd", marginBottom: "6px" }}>
                    <div style={{ fontSize: "13px", color: "#666" }}>Signed in as</div>
                    <div style={{ fontSize: "15px", fontWeight: "bold" }}>{user.username || user.email}</div>
                    {user.role && <div style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}>{user.role}</div>}
                  </div>

                  <Link to="/profile" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none" }}>Your Account</Link>
                  <Link to="/orders" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none" }}>Your Orders</Link>
                  <Link to="/wishlist" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none" }}>Your Wish List</Link>

                  {isVendor && (
                    <Link to="/vendor/dashboard" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none", fontWeight: "bold" }}>Vendor Dashboard</Link>
                  )}

                  {isAdmin && (
                    <>
                      <Link to="/admin" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none", fontWeight: "bold" }}>Admin Panel</Link>
                      <Link to="/admin/dashboard" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none", fontWeight: "bold" }}>Admin Dashboard</Link>
                    </>
                  )}

                  <div style={{ borderTop: "1px solid #ddd", margin: "8px 0" }} />

                  <button onClick={handleLogout} style={{ width: "100%", padding: "9px", background: "#FFD814", border: "1px solid #FCD200", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Sign out</button>
                </>
              ) : (
                <Link to="/login" style={{ display: "block", padding: "9px", color: "#111", textDecoration: "none", fontWeight: "bold" }}>Sign in</Link>
              )}
            </div>
          </div>

          <Link to="/orders" style={{ padding: "6px 8px", border: "1px solid transparent", textDecoration: "none", color: "white", lineHeight: "14px" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <div style={{ fontSize: "12px" }}>Returns</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>& Orders</div>
          </Link>

          <Link to="/cart" style={{ padding: "6px 8px", border: "1px solid transparent", display: "flex", alignItems: "end", gap: "2px", textDecoration: "none", color: "white" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span style={{ fontSize: "28px", position: "relative" }}>
              🛒
              {cartCount > 0 && <span style={{ position: "absolute", top: "-5px", right: "-8px", background: "#f08804", color: "white", borderRadius: "50%", minWidth: "18px", height: "18px", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "bold" }}>{cartCount}</span>}
            </span>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Cart</span>
          </Link>
        </div>

        <div style={{
          background: "#232f3e",
          height: "39px",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: "2px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none"
        }}>
          {secondaryItems.map((it, i) => (
            <Link
              key={i}
              to={it.path || "/"}
              onClick={e => {
                if (it.isAll) {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                padding: "6px 9px",
                border: "1px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0
              }}
              onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
              onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
            >
              {it.icon && <span style={{ fontSize: "17px" }}>{it.icon}</span>}
              {it.l}
              {it.drop && <span style={{ fontSize: "10px", marginLeft: "2px" }}>▼</span>}
            </Link>
          ))}
        </div>
      </header>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />

          <div style={{ position: "relative", width: "365px", maxWidth: "80vw", height: "100vh", background: "white", overflowY: "auto" }}>
            <div style={{ background: "#232f3e", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "27px", height: "27px", background: "white", borderRadius: "50%", display: "grid", placeItems: "center" }}>👤</div>
              <span style={{ fontSize: "19px", fontWeight: "bold" }}>{user ? `Hello, ${user.username || user.email}` : "Hello, sign in"}</span>
              <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ padding: "12px 0" }}>
              <h3 style={{ padding: "12px 24px", fontSize: "18px", fontWeight: "bold" }}>Shop by Department</h3>

              {["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Today's Deals", "Mobiles", "Prime"].map(t => (
                <Link
                  key={t}
                  to={t === "Today's Deals" ? "/deals" : t === "Prime" ? "/prime" : `/category/${t.toLowerCase().replace(/ /g, "-")}`}
                  onClick={() => setOpen(false)}
                  style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px" }}
                >
                  {t} <span>›</span>
                </Link>
              ))}

              <Link to="/wishlist" onClick={() => setOpen(false)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px" }}>
                Wishlist <span>›</span>
              </Link>

              {isVendor && (
                <Link to="/vendor/dashboard" onClick={() => setOpen(false)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px", fontWeight: "bold" }}>
                  Vendor Dashboard <span>›</span>
                </Link>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setOpen(false)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px", fontWeight: "bold" }}>
                    Admin Panel <span>›</span>
                  </Link>
                  <Link to="/admin/dashboard" onClick={() => setOpen(false)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px", fontWeight: "bold" }}>
                    Admin Dashboard <span>›</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}