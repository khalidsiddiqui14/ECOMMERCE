import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = BASE + "/api/products/";
const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };

const getImage = (p) => {
  if (!p.images || !p.images.length) return "https://via.placeholder.com/300?text=Prime+Video";
  const first = p.images[0];
  return typeof first === "string" ? first : first.image || first.url || "";
};

const MOCK_PRODUCTS = Array.from({ length: 10 }, (_, i) => ({
  id: 100 + i,
  name: `Prime Video Original ${i + 1} - 4K Movie`,
  price: 299 + i * 50,
  category: (i % 4) + 1,
  images: [{ id: i, image: `https://picsum.photos/seed/prime${i}/300/300` }],
}));

export default function PrimeVideo() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(28);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}?page=${page}`);
        if (!res.ok) throw new Error("offline");
        const data = await res.json();
        setProducts(data.results || data);
        setCount(data.count || 28);
        setNext(data.next);
        setPrev(data.previous);
      } catch {
        setProducts(MOCK_PRODUCTS);
        setCount(28);
        setNext(page < 3 ? "next" : null);
        setPrev(page > 1 ? "prev" : null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const totalPages = Math.ceil(count / 10);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f2f2f2", minHeight: "100vh" }}>
      <div style={{ background: "#00A8E1", color: "#fff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px" }}>🎬 Prime Video - Watch Movies & TV Shows</h1>
          <small>File: PrimeVideo.jsx | Page {page} of {totalPages} | {count} titles | Amazon Originals, 4K, Watch anywhere</small>
        </div>
        <Link to="/cart" style={{ background: "#fff", color: "#00A8E1", padding: "6px 14px", borderRadius: "20px", textDecoration: "none", fontWeight: "bold" }}>
          Cart {cartCount}
        </Link>
      </div>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <p>Loading Prime Video titles...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <Link to={`/product/${p.id}`}>
                  <img src={getImage(p)} alt={p.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                </Link>
                <div style={{ padding: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#00A8E1", fontWeight: "bold" }}>{CATEGORY_MAP[p.category] || p.category}</div>
                  <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "#0f1111", fontSize: "14px", lineHeight: "18px", display: "block", height: "36px", overflow: "hidden" }}>
                    {p.name}
                  </Link>
                  <div style={{ marginTop: "6px", fontWeight: "bold" }}>Rs. {p.price}</div>
                  <div style={{ marginTop: "4px", fontSize: "12px", color: "#067D62" }}>Prime Included</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "26px", alignItems: "center" }}>
          <button disabled={!prev && page === 1} onClick={() => setPage((s) => Math.max(1, s - 1))} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", background: page === 1 ? "#eee" : "#fff", cursor: "pointer" }}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #00A8E1", background: n === page ? "#00A8E1" : "#fff", color: n === page ? "#fff" : "#00A8E1", cursor: "pointer", fontWeight: "bold" }}>
              {n}
            </button>
          ))}
          <button disabled={!next && page === totalPages} onClick={() => setPage((s) => Math.min(totalPages, s + 1))} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", background: page === totalPages ? "#eee" : "#fff", cursor: "pointer" }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}