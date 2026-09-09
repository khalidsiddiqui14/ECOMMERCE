import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = BASE + "/api/products/";
const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };

const MOCK = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: `New Launch Product ${i + 1}`,
  price: (499 + i * 73).toFixed(2),
  category: (i % 4) + 1,
  images: [{ id: i + 1, image: `https://picsum.photos/seed/new${i + 1}/400/400` }],
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

function getImage(p) {
  const img = p?.images?.[0];
  if (!img) return "https://via.placeholder.com/400";
  if (typeof img === "string") return img;
  return img.image || img.url || "https://via.placeholder.com/400";
}

export default function NewReleases() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(28);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [page, setPage] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const perPage = 10;

  const totalPages = Math.ceil(count / perPage);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(c.reduce((s, x) => s + (x.qty || 1), 0));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}?ordering=-created_at&page=${page}`);
        if (!res.ok) throw new Error("offline");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setProducts(list.length ? list : MOCK.slice((page - 1) * perPage, page * perPage));
        setCount(data.count || 28);
        setNext(data.next || null);
        setPrev(data.previous || null);
      } catch {
        const start = (page - 1) * perPage;
        setProducts(MOCK.slice(start, start + perPage));
        setCount(28);
        setNext(page < totalPages ? "mock" : null);
        setPrev(page > 1 ? "mock" : null);
      }
    }
    load();
  }, [page, totalPages]);

  return (
    <div style={{ background: "#EAEDED", minHeight: "100vh" }}>
      <div style={{ background: "#067D62", color: "white", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <p style={{ fontSize: 13, opacity: 0.9 }}>File: NewReleases.jsx | Route: /new-releases</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "4px 0" }}>New Releases - Latest Launches</h1>
          <p style={{ fontSize: 14 }}>Showing {products.length} of {count} new products | Page {page} of {totalPages} | Cart: {cartCount}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "16px auto", padding: "0 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: "white", borderRadius: 8, padding: 12, position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
              <span style={{ position: "absolute", top: 8, left: 8, background: "#067D62", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 4 }}>NEW LAUNCH</span>
              <span style={{ position: "absolute", top: 8, right: 8, background: "#FFD814", fontSize: 10, fontWeight: 700, padding: "3px 6px", borderRadius: 4 }}>JUST LAUNCHED</span>
              <Link to={`/product/${p.id}`}>
                <img src={getImage(p)} alt={p.name} style={{ width: "100%", height: 200, objectFit: "contain", marginTop: 18 }} />
              </Link>
              <p style={{ fontSize: 12, color: "#067D62", marginTop: 8 }}>{CATEGORY_MAP[p.category] || p.category}</p>
              <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "#0F1111" }}>
                <h3 style={{ fontSize: 14, lineHeight: "18px", height: 36, overflow: "hidden", margin: "4px 0" }}>{p.name}</h3>
              </Link>
              <p style={{ fontWeight: 800, fontSize: 16 }}>Rs. {p.price}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
          <button disabled={!prev} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ padding: "8px 14px", borderRadius: 20, border: "1px solid #888", background: prev ? "white" : "#eee", cursor: prev ? "pointer" : "not-allowed" }}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} style={{ padding: "8px 14px", borderRadius: 20, border: n === page ? "2px solid #067D62" : "1px solid #888", background: n === page ? "#067D62" : "white", color: n === page ? "white" : "#0F1111", fontWeight: 700 }}>{n}</button>
          ))}
          <button disabled={!next} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{ padding: "8px 14px", borderRadius: 20, border: "1px solid #888", background: next ? "white" : "#eee", cursor: next ? "pointer" : "not-allowed" }}>Next</button>
        </div>
      </div>
    </div>
  );
}