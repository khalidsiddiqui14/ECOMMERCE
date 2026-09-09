import { useState } from "react";
import { Link } from "react-router-dom";

const items = [
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
  { l: "Beauty", path: "/category/beauty" },
  { l: "Wishlist", icon: "♡", path: "/wishlist" },
];

export default function SecondaryNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Main Bar - Amazon exact 39px */}
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
        {items.map((it, i) => (
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
              fontWeight: it.isAll ? "500" : "400",
              flexShrink: 0
            }}
            onMouseEnter={e => e.currentTarget.style.border = "1px solid white"}
            onMouseLeave={e => e.currentTarget.style.border = "1px solid transparent"}
          >
            {it.icon && <span style={{ fontSize: it.isAll ? "17px" : "14px" }}>{it.icon}</span>}
            {it.l}
            {it.drop && <span style={{ fontSize: "10px", marginLeft: "2px" }}>▼</span>}
          </Link>
        ))}
      </div>

      {/* Drawer - Amazon style */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />
          <div style={{ position: "relative", width: "365px", maxWidth: "80vw", height: "100vh", background: "white", overflowY: "auto" }}>
            <div style={{ background: "#232f3e", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "27px", height: "27px", background: "white", borderRadius: "50%", display: "grid", placeItems: "center", color: "#232f3e" }}>👤</div>
              <span style={{ fontSize: "19px", fontWeight: "bold" }}>Hello, sign in</span>
              <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }}>×</button>
            </div>

            <div>
              <h3 style={{ padding: "12px 24px", fontSize: "18px", fontWeight: "bold", borderBottom: "1px solid #eaeded" }}>Digital Content & Devices</h3>
              {["Amazon Music", "Kindle E-readers & Books", "Amazon Appstore"].map(t => (
                <div key={t} style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", fontSize: "14px" }}>{t} <span>›</span></div>
              ))}

              <h3 style={{ padding: "12px 24px", fontSize: "18px", fontWeight: "bold", borderTop: "4px solid #eaeded", marginTop: "8px" }}>Shop by Department</h3>
              {["Electronics", "Computers", "Smart Home", "Arts & Crafts", "Fashion", "Home & Kitchen", "Beauty", "Mobiles", "Today's Deals", "Prime", "Wishlist"].map(t => (
                <Link key={t} to={`/category/${t.toLowerCase().replace(/ & /g,"-").replace(/ /g,"-")}`} onClick={()=>setOpen(false)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", textDecoration: "none", color: "#111", fontSize: "14px" }}>
                  {t} <span>›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{` div::-webkit-scrollbar{ display:none } `}</style>
    </>
  );
}