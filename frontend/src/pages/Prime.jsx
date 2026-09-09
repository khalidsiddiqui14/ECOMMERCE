import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = BASE + "/api/products/";
const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };
const THEME = "#00A8E1";

const getImage = (img) => {
  if (!img) return "https://via.placeholder.com/300";
  if (typeof img === "object") return img.image || img.url || "https://via.placeholder.com/300";
  return img;
};

const MOCK = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  title: `Prime Product ${i + 1}`,
  price: 499 + i * 25,
  category: (i % 4) + 1,
  images: [{ id: 1, image: `https://picsum.photos/seed/prime${i}/300/300` }],
}));

export default function Prime() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(28);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(count / perPage));

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(c.reduce((s, it) => s + (it.qty || 1), 0));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}?page=${page}`);
        if (!res.ok) throw new Error("offline");
        const data = await res.json();
        setProducts(data.results || data);
        setCount(data.count || 28);
        setNext(data.next);
        setPrev(data.previous);
      } catch {
        const start = (page - 1) * perPage;
        setProducts(MOCK.slice(start, start + perPage));
        setCount(28);
        setNext(page < 3 ? "mock" : null);
        setPrev(page > 1 ? "mock" : null);
      }
    };
    fetchData();
  }, [page]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#EAEDED", minHeight: "100vh" }}>
      <div style={{ background: THEME, color: "#fff", padding: "14px 20px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>👑 Prime - Membership Benefits</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>File: Prime.jsx | Route: /prime | {count} Products | Page {page} of {totalPages}</p>
          </div>
          <Link to="/cart" style={{ background: "#fff", color: THEME, padding: "6px 14px", borderRadius: 4, textDecoration: "none", fontWeight: "bold" }}>Cart: {cartCount}</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "12px auto", background: "#fff", padding: "12px 16px", borderRadius: 4, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>🚚 Free Delivery</span><span>🎬 Prime Video</span><span>🎵 Prime Music</span><span>⚡ Early Access</span><span>🔥 Prime Deals</span>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, padding: "0 10px 20px" }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 6, padding: 12, display: "flex", flexDirection: "column" }}>
            <Link to={`/product/${p.id}`}><img src={getImage(p.images?.[0])} alt={p.title} style={{ width: "100%", height: 180, objectFit: "contain" }} /></Link>
            <p style={{ fontSize: 12, color: "#007185", margin: "6px 0 0" }}>{CATEGORY_MAP[p.category] || p.category}</p>
            <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "#0F1111", fontSize: 14, lineHeight: "18px", minHeight: 36, display: "block", marginTop: 4 }}>{p.title?.slice(0, 60)}</Link>
            <div style={{ marginTop: "auto", paddingTop: 8 }}>
              <span style={{ fontWeight: "bold", fontSize: 18 }}>₹{p.price}</span>
              <span style={{ background: THEME, color: "#fff", fontSize: 10, padding: "2px 4px", borderRadius: 2, marginLeft: 6 }}>prime</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 30 }}>
        <button disabled={!prev} onClick={() => setPage((x) => Math.max(1, x - 1))} style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4, background: prev ? "#fff" : "#eee", cursor: prev ? "pointer" : "not-allowed" }}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} onClick={() => setPage(i + 1)} style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #ccc", background: page === i + 1 ? THEME : "#fff", color: page === i + 1 ? "#fff" : "#000", cursor: "pointer" }}>{i + 1}</button>
        ))}
        <button disabled={!next} onClick={() => setPage((x) => Math.min(totalPages, x + 1))} style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 4, background: next ? "#fff" : "#eee", cursor: next ? "pointer" : "not-allowed" }}>Next</button>
      </div>
    </div>
  );
}