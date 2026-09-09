import { useState } from "react";
import { Link } from "react-router-dom";

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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <>
      {/* TOP HEADER - AMAZON BLACK */}
      <header style={{ background: "#131921", color: "white", position: "sticky", top: 0, zIndex: 100 }}>
        {/* Row 1 */}
        <div style={{ height: "60px", display: "flex", alignItems: "center", gap: "8px", padding: "0 10px" }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", padding: "6px 8px", border: "1px solid transparent", textDecoration: "none", color: "white" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span style={{ fontSize: "22px", fontWeight: "bold" }}>shop</span>
            <span style={{ fontSize: "22px", fontWeight: "bold", color: "#febd69", marginLeft: "4px" }}>zone</span>
          </Link>

          {/* Deliver to */}
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

          {/* Search Bar - Center */}
          <div style={{ flex: 1, display: "flex", height: "40px", borderRadius: "4px", overflow: "hidden", margin: "0 12px" }}>
            <div style={{ background: "#e6e6e6", color: "#555", padding: "0 10px", display: "grid", placeItems: "center", fontSize: "12px", borderRight: "1px solid #ddd" }}>
              All <span style={{ fontSize: "10px", marginLeft: "4px" }}>▼</span>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shopzone - mobiles, laptops, fashion..."
              style={{ flex: 1, border: "none", padding: "0 10px", fontSize: "15px", outline: "none" }}
            />
            <button style={{ background: "#febd69", border: "none", padding: "0 16px", cursor: "pointer", fontSize: "18px" }}>🔍</button>
          </div>

          {/* EN */}
          <div style={{ padding: "8px", border: "1px solid transparent", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span>🇮🇳</span><span style={{ fontSize: "14px", fontWeight: "bold" }}>EN</span><span style={{ fontSize: "10px" }}>▼</span>
          </div>

          {/* Account & Lists */}
          <Link to="/login" style={{ padding: "6px 8px", border: "1px solid transparent", textDecoration: "none", color: "white", lineHeight: "14px" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <div style={{ fontSize: "12px" }}>Hello, sign in</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>Account & Lists <span style={{ fontSize: "10px" }}>▼</span></div>
          </Link>

          {/* Returns */}
          <Link to="/orders" style={{ padding: "6px 8px", border: "1px solid transparent", textDecoration: "none", color: "white", lineHeight: "14px" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <div style={{ fontSize: "12px" }}>Returns</div>
            <div style={{ fontSize: "14px", fontWeight: "bold" }}>& Orders</div>
          </Link>

          {/* Cart */}
          <Link to="/cart" style={{ padding: "6px 8px", border: "1px solid transparent", display: "flex", alignItems: "end", gap: "2px", textDecoration: "none", color: "white" }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            <span style={{ fontSize: "28px" }}>🛒</span><span style={{ fontSize: "14px", fontWeight: "bold" }}>0</span>
          </Link>
        </div>

        {/* SECONDARY NAV - 39px - Amazon exact */}
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
              onClick={(e) => { if (it.isAll) { e.preventDefault(); setOpen(true); } }}
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

      {/* Drawer */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />
          <div style={{ position: "relative", width: "365px", maxWidth: "80vw", height: "100vh", background: "white", overflowY: "auto" }}>
            <div style={{ background: "#232f3e", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "27px", height: "27px", background: "white", borderRadius: "50%", display: "grid", placeItems: "center" }}>👤</div>
              <span style={{ fontSize: "19px", fontWeight: "bold" }}>Hello, sign in</span>
              <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: "12px 0" }}>
              <h3 style={{ padding: "12px 24px", fontSize: "18px", fontWeight: "bold" }}>Shop by Department</h3>
              {["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Today's Deals", "Mobiles", "Prime", "Wishlist"].map(t => (
                <Link key={t} to={`/category/${t.toLowerCase().replace(/ /g,"-")}`} onClick={()=>setOpen(false)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px" }}>
                  {t} <span>›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}