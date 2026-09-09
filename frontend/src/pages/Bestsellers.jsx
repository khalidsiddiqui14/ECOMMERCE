import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = BASE + "/api/products/";
const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };

const MOCK = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: `Top Selling Product ${i + 1}`,
  price: 499 + i * 57,
  category: (i % 4) + 1,
  images: [{ id: i + 1, image: `https://picsum.photos/seed/shop${i + 1}/300/300` }],
  rating: 4.5,
  sold: 1200 - i * 23,
}));

function getImage(p) {
  if (!p.images || !p.images.length) return "https://via.placeholder.com/300";
  const first = p.images[0];
  if (typeof first === "string") return first;
  return first.image || first.url || "https://via.placeholder.com/300";
}

export default function Bestsellers() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(28);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(c.reduce((s, x) => s + (x.qty || 1), 0));
  }, []);

  const fetchPage = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=${page}&ordering=-sold`);
      if (!res.ok) throw new Error("offline");
      const data = await res.json();
      const list = data.results || data;
      setProducts(Array.isArray(list) ? list : []);
      setCount(data.count || 28);
      setNext(data.next || null);
      setPrevious(data.previous || null);
      setCurrentPage(page);
    } catch {
      const start = (page - 1) * 10;
      setProducts(MOCK.slice(start, start + 10));
      setCount(28);
      setNext(page * 10 < 28 ? "mock" : null);
      setPrevious(page > 1 ? "mock" : null);
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(1); }, []);

  const totalPages = Math.ceil(count / 10);

  return (
    <div style={{ background: "#EAEDED", minHeight: "100vh" }}>
      <div style={{ background: "#232F3E", color: "white", padding: "10px 20px", display: "flex", justifyContent: "space-between" }}>
        <span>Bestsellers.jsx - Page {currentPage} of {totalPages} - {count} products</span>
        <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>Cart: {cartCount}</Link>
      </div>

      <div style={{ background: "#E47911", color: "white", padding: "18px 20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>🔥 Bestsellers - Top Selling Products</h1>
        <p style={{ margin: "4px 0 0" }}>Most popular products based on sales - Updated hourly</p>
      </div>

      {loading ? <p style={{ padding: 20 }}>Loading bestsellers...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "14px", padding: "20px" }}>
          {products.map((p, idx) => {
            const rank = (currentPage - 1) * 10 + idx + 1;
            return (
              <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: "none", color: "#0F1111" }}>
                <div style={{ background: "white", padding: "12px", borderRadius: "8px", position: "relative", border: rank === 1 ? "2px solid #E47911" : "1px solid #ddd" }}>
                  {rank === 1 && <span style={{ position: "absolute", top: 8, left: 8, background: "#E47911", color: "white", padding: "2px 8px", fontSize: "12px", borderRadius: "4px" }}>BESTSELLER</span>}
                  <span style={{ position: "absolute", top: 8, right: 8, background: rank <= 3 ? "#E47911" : "#232F3E", color: "white", padding: "2px 7px", fontSize: "12px", borderRadius: "4px" }}>#{rank}</span>
                  <img src={getImage(p)} alt={p.name} style={{ width: "100%", height: "180px", objectFit: "contain", marginTop: "20px" }} />
                  <h3 style={{ fontSize: "14px", margin: "10px 0 4px", height: "36px", overflow: "hidden" }}>{p.name}</h3>
                  <p style={{ fontSize: "12px", color: "#067D62", margin: "2px 0" }}>{CATEGORY_MAP[p.category] || p.category}</p>
                  <p style={{ fontWeight: "bold", margin: "4px 0" }}>Rs. {p.price}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "20px" }}>
        <button disabled={!previous} onClick={() => fetchPage(currentPage - 1)} style={{ padding: "6px 12px", background: previous ? "#E47911" : "#ccc", color: "white", border: "none", borderRadius: "4px", cursor: previous ? "pointer" : "default" }}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} onClick={() => fetchPage(i + 1)} style={{ padding: "6px 12px", background: currentPage === i + 1 ? "#E47911" : "white", color: currentPage === i + 1 ? "white" : "#0F1111", border: "1px solid #D5D9D9", borderRadius: "4px", cursor: "pointer" }}>{i + 1}</button>
        ))}
        <button disabled={!next} onClick={() => fetchPage(currentPage + 1)} style={{ padding: "6px 12px", background: next ? "#E47911" : "#ccc", color: "white", border: "none", borderRadius: "4px", cursor: next ? "pointer" : "default" }}>Next</button>
      </div>
    </div>
  );
}