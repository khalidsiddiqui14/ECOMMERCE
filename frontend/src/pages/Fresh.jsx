import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = `${BASE}/api/products/`;
const PH = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";

const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty" };
const getCatName = (c) => { if (!c) return "General"; if (typeof c === "object" && c.name) return c.name; return CATEGORY_MAP[Number(c)] || "Category " + Number(c); };
const getImage = (p) => {
  try {
    const s = p?.images?.[0] || p?.image || "";
    const src = typeof s === "string" ? s : s?.image || "";
    if (!src) return PH;
    if (String(src).startsWith("http")) return String(src);
    if (String(src).startsWith("/media")) return BASE + src;
    return BASE + "/media/" + String(src).replace(/^\/+/, "");
  } catch { return PH; }
};

// --- Fresh.jsx - src/pages/Fresh.jsx - /fresh route ---
export default function Fresh() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ count: 0, next: null, previous: null, currentPage: 1 });

  const fetchPage = async (url = API_URL) => {
    setLoading(true);
    try {
      const r = await fetch(url);
      const d = await r.json();
      const arr = d.results || [];
      const norm = arr.map(p => ({ ...p, catName: getCatName(p.category), img: getImage(p), priceNum: Number(p.price) || 0 }));
      setProducts(norm);
      let cp = 1;
      if (d.next) { try { cp = Number(new URL(d.next).searchParams.get("page")) - 1 || 1; } catch {} }
      else if (d.previous) { try { cp = Number(new URL(d.previous).searchParams.get("page")) + 1 || 2; } catch { cp = 2; } }
      setPageInfo({ count: d.count || 0, next: d.next, previous: d.previous, currentPage: cp });
    } catch {
      const mock = Array.from({ length: 10 }, (_, i) => ({ id: i+1, name: "Fresh Product " + (i+1) + " - Organic", price: 99 + i*20, category: 3, catName: "Grocery & Fresh", img: PH, priceNum: 99+i*20, stock: 100 }));
      setProducts(mock);
      setPageInfo({ count: 28, next: BASE + "/api/products/?page=2", previous: null, currentPage: 1 });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPage(API_URL); }, []);

  if (loading) return <div className="bg-[#E3E6E6] min-h-screen p-4"><div className="max-w-[1480px] mx-auto grid grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[300px] bg-white rounded animate-pulse" />)}</div></div>;

  return (
    <div className="min-h-screen bg-[#E3E6E6]">
      <div className="bg-[#232F3E] text-white py-1.5 px-4 text-[11px] text-center">Fresh - File: src/pages/Fresh.jsx - Count: {pageInfo.count} - Page {pageInfo.currentPage} - Route: /fresh</div>
      <div className="bg-[#00a300] text-white text-center py-2 font-bold text-[14px]">Fresh - Super Fast Delivery - 2 Hour Delivery - Organic Fruits & Vegetables - Starting Rs 19</div>
      <div className="max-w-[1480px] mx-auto px-3 pt-4">
        <div className="bg-white rounded-lg p-4 border">
          <h2 className="text-[20px] font-bold">Fresh - Grocery - {products.length} products - Page {pageInfo.currentPage}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {products.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="border rounded-lg p-3 bg-white hover:shadow">
                <img src={p.img} alt={p.name} className="h-[120px] w-full object-contain bg-[#f7fafa] rounded" onError={(e) => e.target.src = PH} />
                <p className="text-[12px] mt-2 line-clamp-2">{p.name}</p>
                <p className="text-[10px] text-[#565959]">{p.catName}</p>
                <p className="font-bold text-[14px]">Rs {p.priceNum.toLocaleString("en-IN")}</p>
                <button className="w-full mt-2 bg-[#FFD814] border rounded-full py-1 text-[11px] font-bold">Add to Cart</button>
              </Link>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {pageInfo.previous && <button onClick={() => fetchPage(pageInfo.previous)} className="border px-4 py-2 rounded bg-white text-[12px]">Prev</button>}
            <button onClick={() => fetchPage(BASE + "/api/products/?page=1")} className={`px-4 py-2 rounded text-[12px] font-bold border ${pageInfo.currentPage===1?"bg-[#232F3E] text-white":"bg-white"}`}>1</button>
            <button onClick={() => fetchPage(BASE + "/api/products/?page=2")} className={`px-4 py-2 rounded text-[12px] font-bold border ${pageInfo.currentPage===2?"bg-[#232F3E] text-white":"bg-white"}`}>2</button>
            <button onClick={() => fetchPage(BASE + "/api/products/?page=3")} className={`px-4 py-2 rounded text-[12px] font-bold border ${pageInfo.currentPage===3?"bg-[#232F3E] text-white":"bg-white"}`}>3</button>
            {pageInfo.next && <button onClick={() => fetchPage(pageInfo.next)} className="border px-4 py-2 rounded bg-[#232F3E] text-white text-[12px]">Next</button>}
          </div>
        </div>
      </div>
    </div>
  );
}