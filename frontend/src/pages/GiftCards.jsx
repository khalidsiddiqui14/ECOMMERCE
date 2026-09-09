import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = BASE + "/api/products/";
const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };

const THEME = "#FFD814";

const MOCKS = [
  { id: 101, name: "Birthday Gift Card - ₹500", price: "500", category: 2, images: [{ id: 1, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400" }] },
  { id: 102, name: "Anniversary Gift Card - ₹1000", price: "1000", category: 3, images: [{ id: 2, image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400" }] },
  { id: 103, name: "Wedding Gift Card - ₹2000", price: "2000", category: 3, images: [{ id: 3, image: "https://images.unsplash.com/photo-1520854221256-17451ccdf07b?w=400" }] },
  { id: 104, name: "Corporate Gift Card - ₹5000", price: "5000", category: 1, images: [{ id: 4, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400" }] },
  { id: 105, name: "Amazon Pay Gift Card ₹250", price: "250", category: 4, images: [{ id: 5, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" }] },
  { id: 106, name: "Festival Gift Card - ₹1500", price: "1500", category: 2, images: [{ id: 6, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400" }] },
];

function getImage(p) {
  const img = p.images?.[0];
  if (!img) return "https://via.placeholder.com/300?text=Gift+Card";
  if (typeof img === "string") return img;
  return img.image || img.url || "https://via.placeholder.com/300?text=Gift+Card";
}

export default function GiftCards() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(28);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(c.reduce((s, i) => s + (i.qty || 1), 0));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}?page=${page}`);
        if (!res.ok) throw new Error("offline");
        const data = await res.json();
        setProducts(data.results || data || []);
        setCount(data.count || 28);
        setNext(data.next);
        setPrev(data.previous);
      } catch {
        const perPage = 10;
        const totalPages = Math.ceil(28 / perPage);
        setProducts(MOCKS);
        setCount(28);
        setNext(page < totalPages ? "mock" : null);
        setPrev(page > 1 ? "mock" : null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  const totalPages = Math.ceil(count / 10) || 3;

  return (
    <div style={{ background: "#EAEDED", minHeight: "100vh" }}>
      <div style={{ background: THEME, padding: "12px 20px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
        <div><span>🎁</span> <b>GiftCards.jsx</b> | Gift Cards - Amazon Pay Gift Cards | {count} products</div>
        <Link to="/cart" style={{ textDecoration: "none", color: "#000", fontWeight: "bold" }}>Cart: {cartCount}</Link>
      </div>

      <div style={{ background: "#fff", padding: "16px 20px", margin: "10px", borderRadius: 4 }}>
        <h2 style={{ margin: 0 }}>Amazon Pay Gift Cards</h2>
        <p style={{ color: "#555", margin: "6px 0 0" }}>Birthday, Anniversary, Wedding, Corporate - Page {page} of {totalPages}</p>
      </div>

      {loading ? <div style={{ padding: 20 }}>Loading gift cards...</div> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 15, padding: 10 }}>
          {products.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} style={{ background: "#fff", padding: 12, borderRadius: 6, textDecoration: "none", color: "#000", border: "1px solid #ddd" }}>
              <img src={getImage(p)} alt={p.name} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 4 }} />
              <div style={{ marginTop: 8, fontSize: 14, height: 40, overflow: "hidden" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#067D62" }}>{CATEGORY_MAP[p.category] || "Gift Cards"}</div>
              <div style={{ fontWeight: "bold", marginTop: 4 }}>₹{p.price}</div>
              <div style={{ background: THEME, textAlign: "center", padding: "6px", borderRadius: 20, marginTop: 8, fontSize: 13 }}>Add to Cart</div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 20 }}>
        <button disabled={!prev} onClick={() => setPage((s) => Math.max(1, s - 1))} style={{ padding: "6px 12px", cursor: "pointer", background: prev ? "#fff" : "#eee" }}>Prev</button>
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setPage(n)} style={{ padding: "6px 12px", background: page === n ? THEME : "#fff", border: "1px solid #999", fontWeight: page === n ? "bold" : "normal" }}>{n}</button>
        ))}
        <button disabled={!next} onClick={() => setPage((s) => s + 1)} style={{ padding: "6px 12px", cursor: "pointer", background: next ? "#fff" : "#eee" }}>Next</button>
      </div>
    </div>
  );
}