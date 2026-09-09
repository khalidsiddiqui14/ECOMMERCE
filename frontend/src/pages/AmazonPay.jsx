import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = BASE + "/api/products/";
const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };

const getImage = (p) => {
  if (!p?.images?.length) return "https://via.placeholder.com/300";
  const first = p.images[0];
  return typeof first === "string" ? first : first.image || first.url || "https://via.placeholder.com/300";
};

const MOCK = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  title: `Amazon Pay Offer ${i + 1}`,
  name: `Amazon Pay Offer ${i + 1}`,
  price: 99 + i * 10,
  category: (i % 4) + 1,
  images: [{ id: i + 1, image: `https://picsum.photos/seed/pay${i}/300/300` }],
}));

export default function AmazonPay() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(28);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [page, setPage] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  const totalPages = Math.ceil(count / 10);

  const fetchPage = async (p) => {
    try {
      const res = await fetch(`${API_URL}?page=${p}`);
      if (!res.ok) throw new Error("offline");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setProducts(list);
      setCount(data.count || list.length || 28);
      setNext(data.next || null);
      setPrev(data.previous || null);
      setPage(p);
    } catch {
      const start = (p - 1) * 10;
      setProducts(MOCK.slice(start, start + 10));
      setCount(28);
      setNext(p < 3 ? "mock" : null);
      setPrev(p > 1 ? "mock" : null);
      setPage(p);
    }
  };

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(c.reduce((s, it) => s + (it.qty || 1), 0));
    fetchPage(1);
  }, []);

  return (
    <div style={{ background: "#EAEDED", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ background: "#232F3E", color: "white", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>💳 Amazon Pay - UPI, Wallet, Recharges</div>
          <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>AmazonPay.jsx | {count} products | Page {page} of {totalPages} | UPI, wallet, bill payments & cashback offers</div>
        </div>
        <Link to="/cart" style={{ background: "#FEBD69", color: "#232F3E", padding: "6px 14px", borderRadius: "4px", textDecoration: "none", fontWeight: "bold" }}>Cart {cartCount}</Link>
      </div>

      <div style={{ background: "white", margin: "12px", padding: "12px", borderRadius: "4px", display: "flex", gap: "12px", fontSize: "13px" }}>
        <span style={{ background: "#232F3E", color: "white", padding: "4px 10px", borderRadius: "12px" }}>UPI</span>
        <span style={{ border: "1px solid #ddd", padding: "4px 10px", borderRadius: "12px" }}>Wallet</span>
        <span style={{ border: "1px solid #ddd", padding: "4px 10px", borderRadius: "12px" }}>Recharges</span>
        <span style={{ border: "1px solid #ddd", padding: "4px 10px", borderRadius: "12px" }}>Bill Payments</span>
        <span style={{ background: "#CC0C39", color: "white", padding: "4px 10px", borderRadius: "12px" }}>Cashback Offers</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", padding: "0 12px 20px" }}>
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} style={{ background: "white", padding: "12px", borderRadius: "4px", textDecoration: "none", color: "#0F1111" }}>
            <img src={getImage(p)} alt={p.title || p.name} style={{ width: "100%", height: "180px", objectFit: "contain" }} />
            <div style={{ marginTop: "8px", fontSize: "14px", height: "34px", overflow: "hidden" }}>{p.title || p.name}</div>
            <div style={{ fontSize: "12px", color: "#067D62", marginTop: "4px" }}>{CATEGORY_MAP[p.category] || "General"}</div>
            <div style={{ fontWeight: "bold", marginTop: "6px" }}>₹{p.price}</div>
            <div style={{ background: "#232F3E", color: "white", textAlign: "center", padding: "6px", borderRadius: "6px", marginTop: "8px", fontSize: "13px" }}>Pay with Amazon Pay</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", paddingBottom: "30px" }}>
        <button disabled={!prev} onClick={() => fetchPage(page - 1)} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #888", cursor: prev ? "pointer" : "not-allowed" }}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} onClick={() => fetchPage(i + 1)} style={{ padding: "6px 12px", borderRadius: "4px", border: i + 1 === page ? "1px solid #232F3E" : "1px solid #888", background: i + 1 === page ? "#232F3E" : "white", color: i + 1 === page ? "white" : "black", cursor: "pointer" }}>{i + 1}</button>
        ))}
        <button disabled={!next} onClick={() => fetchPage(page + 1)} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #888", cursor: next ? "pointer" : "not-allowed" }}>Next</button>
      </div>
    </div>
  );
}