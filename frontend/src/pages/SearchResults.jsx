import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop";

const resolveImg = (p) => {
  try {
    if (!p) return "";
    const srcObj = p.image || p.images?.[0] || p.thumbnail || p.product_image;
    if (!srcObj) return "";
    let s = typeof srcObj === "string"? srcObj : srcObj.image || srcObj.url || srcObj.src || "";
    if (!s) return "";
    s = String(s);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    if (s.startsWith("media/")) return `${BASE}/${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [products, setProducts] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    if (!q.trim()) {
      setLoading(false);
      setProducts([]);
      setAiSuggestion("");
      return;
    }
    let cancelled = false;
    (async()=>{
      setLoading(true);
      setError("");
      setAiSuggestion("");
      try {
        const safeQ = encodeURIComponent(q.trim());
        const [aiRes, prodRes] = await Promise.allSettled([
          api.get(`ai/search/?q=${safeQ}`),
          api.get(`products/?search=${safeQ}&page_size=50`)
        ]);

        if (cancelled) return;

        let finalProducts = [];
        let suggestion = "";

        if (aiRes.status==="fulfilled") {
          const d = aiRes.value.data;
          if (d?.suggestion || d?.answer || d?.message) suggestion = d.suggestion || d.answer || d.message || "";
          const aiProducts = d?.products || d?.results || d?.data || d?.items || [];
          if (Array.isArray(aiProducts) && aiProducts.length>0) finalProducts = aiProducts;
        }

        if (finalProducts.length===0 && prodRes.status==="fulfilled") {
          const pd = prodRes.value.data;
          const list = Array.isArray(pd)? pd : pd?.results || pd?.products || pd?.items || [];
          finalProducts = Array.isArray(list)? list : [];
        }

        if (suggestion) setAiSuggestion(suggestion);

        if (finalProducts.length===0 && aiRes.status==="rejected" && prodRes.status==="rejected") {
          setError("Search failed. Backend check karo — /api/products/?search= and /api/ai/search/ ");
        }

        const unique = Array.from(new Map(finalProducts.map(p=>[p.id || p._id, p])).values());
        setProducts(unique);

      } catch (e) {
        console.error("SEARCH ERROR", e);
        if (!cancelled) {
          setError("Search me error aaya. Backend running check karo.");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-6">
      <div className="bg-white border-b border-[#d5d9d9] p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w- mx-auto">
          <h1 className="text- flex items-center gap-2 flex-wrap">
            <span className="text-[#565959]">{loading? "Searching ShopZone..." : `${products.length} results for`}</span>
            <strong className="text-[#E77600] text-">"{q || "All"}"</strong>
            <span className="text- text-[#067D62] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full">Prime • FREE delivery</span>
            {q && <Link to="/products" className="text- text-[#007185] border border-[#d5d9d9] px-2.5 py-1 rounded-full ml-2 hover:bg-[#f7fafa] bg-white">Clear Search ✕</Link>}
          </h1>
          {aiSuggestion && (
            <div className="mt-3 bg-[#f0f8ff] border border-[#a4c7e5] rounded- p-3 flex gap-2 shadow-sm">
              <span className="text-">🤖</span>
              <div>
                <div className="text- font-bold text-[#067D62] uppercase tracking-wide">AI Recommendation • Powered by ShopZone AI • Rufus Style</div>
                <p className="text- mt-1 leading- text-[#0F1111]">{aiSuggestion}</p>
              </div>
            </div>
          )}
          {error && <div className="mt-2 text- text-[#CC0C39] bg-[#fff6f6] border border-[#fecaca] p-2 rounded-">⚠ {error}</div>}
        </div>
      </div>

      <div className="max-w- mx-auto p-3">
        <div className="bg-white border border-[#d5d9d9] rounded- p-3 mb-3 flex gap-2 overflow-auto whitespace-nowrap text- shadow-sm items-center">
          <span className="font-bold text-[#0F1111]">Related searches:</span>
          {["mobile", "laptop", "shoes", "watch", "headphones", "t-shirt", "kurta"].map(k=>(
            <Link key={k} to={`/search?q=${encodeURIComponent(k)}`} className={`px-3 py-1 rounded-full border font-medium transition ${q.toLowerCase()===k? 'bg-[#232f3e] text-white border-[#232f3e] shadow-sm' : 'bg-[#f0f2f2] border-[#d5d9d9] hover:bg-[#e3e6e6] text-[#0F1111]'}`}>{k}</Link>
          ))}
          <span className="ml-auto text- text-[#565959]">{products.length} products • AI sorted</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading? Array.from({length:10}).map((_,i)=><div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />) :
            products.length===0? (
              <div className="col-span-full bg-white border border-[#d5d9d9] rounded- p-10 text-center shadow-sm">
                <div className="text- mb-3">🔍</div>
                <h3 className="font-bold text-">No products found for "{q}"</h3>
                <p className="text- text-[#565959] mt-2 max-w- mx-auto">Try different keywords, check spelling, use related searches above, or browse all categories. Our AI is learning — try "mobile under 20000" or "running shoes".</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Link to="/products" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-6 h-9 leading-9 rounded- text- shadow-sm font-bold inline-block">Browse All Products</Link>
                  <Link to="/" className="border border-[#d5d9d9] px-6 h-9 leading-9 rounded- text- bg-white shadow-sm inline-block hover:bg-[#f7fafa]">Go Home</Link>
                </div>
                <div className="mt-6 text- text-[#565959]">Popular: <Link to="/search?q=mobile" className="text-[#0066c0] hover:underline">Mobiles</Link> • <Link to="/search?q=laptop" className="text-[#0066c0] hover:underline">Laptops</Link> • <Link to="/search?q=shoes" className="text-[#0066c0] hover:underline">Shoes</Link></div>
              </div>
            ) :
            products.map(p=>{
              const img = resolveImg(p) || PLACEHOLDER;
              const price = Number(p.price||0);
              const mrp = Number(p.original_price || p.mrp || price*1.2);
              const disc = mrp>price? Math.round((1-price/mrp)*100) : 0;
              const rating = Number(p.rating || 4.3);
              return (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-white border border-[#d5d9d9] rounded- p-3 shadow-sm hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] transition flex flex-col group">
                  <div className="aspect-square bg-[#f7fafa] rounded- grid place-items-center overflow-hidden relative border border-[#f0f2f2]">
                    <img src={img} alt={p.name || "product"} className="w-full h-full object-contain p-2 group-hover:scale-[1.05] transition duration-200" onError={(e)=> e.target.src=PLACEHOLDER} />
                    {disc>0 && <span className="absolute top-1 left-1 bg-[#CC0C39] text-white text- px-1.5 py-0.5 rounded- font-bold">{disc}% off</span>}
                    <span className="absolute bottom-1 right-1 bg-white border border-[#d5d9d9] text- px-1 rounded-full">Prime</span>
                  </div>
                  <h3 className="text- line-clamp-2 mt-2 min-h- leading- text-[#0F1111] group-hover:text-[#C45500]">{p.name || p.title || "Product"}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="bg-[#067D62] text-white text- px-1 rounded- font-bold">{rating} ★</span>
                    <span className="text- text-[#565959]">(2k+ ratings) • Prime</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1"><span className="text- font-bold text-[#0F1111]">₹{price.toLocaleString("en-IN")}</span> {mrp>price && <span className="text- text-[#565959] line-through">₹{mrp.toLocaleString("en-IN")}</span>}</div>
                  <div className="text- text-[#067D62] font-medium">✓ Prime FREE Delivery • Tomorrow • EMI • 10 days return</div>
                </Link>
              );
            })
          }
        </div>

        {products.length>0 && (
          <div className="mt-4 bg-white border border-[#d5d9d9] rounded- p-3 text- text-[#565959] text-center">
            Search: <strong>"{q}"</strong> • {products.length} results • AI Recommendation: {aiSuggestion? "Yes • ShopZone AI" : "Using keyword search"} • Prime • FREE delivery over ₹499 • <Link to="/products" className="text-[#0066c0] hover:underline">Browse all {products.length}+ products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
export default SearchResults;