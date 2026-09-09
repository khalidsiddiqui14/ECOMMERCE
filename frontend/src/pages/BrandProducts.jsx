import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const resolveImage = (img) => {
  try {
    if (!img) return "";
    let s = typeof img === "string"? img : img.image || img.url || img.src || "";
    if (!s) return "";
    s = String(s).trim();
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    if (s.startsWith("media/")) return `${BASE}/${s}`;
    if (s.startsWith("/")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

function BrandProducts() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandInfo, setBrandInfo] = useState(null);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        try {
          const bRes = await api.get(`brands/${slug}/`).catch(() => api.get(`brands/?slug=${slug}`));
          if (bRes?.data) setBrandInfo(bRes.data?.results?.[0] || bRes.data);
        } catch {}

        const res = await api.get(`products/?brand=${slug}&page_size=50`);
        const d = res.data;
        const list = Array.isArray(d)? d : d.results || d.products || [];
        if (!cancelled) setProducts(Array.isArray(list)? list : []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_low") return Number(a.price) - Number(b.price);
    if (sort === "price_high") return Number(b.price) - Number(a.price);
    if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
    return 0;
  });

  const brandName = brandInfo?.name || slug?.replace(/-/g, " ") || "Brand";
  const displayName = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-6">
      <div className="bg-white border-b border-[#d5d9d9]">
        <div className="max-w- mx-auto">
          <div className="h- bg-gradient-to-r from-[#131921] via-[#232F3E] to-[#37475A] flex items-center px-6 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w- h- bg-white rounded- grid place-items-center text- font-bold shadow-lg overflow-hidden">
                {brandInfo?.logo? <img src={resolveImage(brandInfo.logo)} alt={displayName} className="w-full h-full object-contain p-2" /> : displayName[0]?.toUpperCase()}
              </div>
              <div className="text-white">
                <h1 className="text- font-bold capitalize">{displayName} Store</h1>
                <p className="text- opacity-90">{products.length} products • Prime • 4.5★</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-">Top Brand</span>
                  <span className="px-2 py-0.5 bg-[#FFD814] text-black rounded-full text- font-bold">Prime</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text- font-bold">All Products from {displayName}</h2>
              <p className="text- text-[#565959]">{products.length} results • FREE delivery • COD • EMI</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text- text-[#565959]">Sort:</span>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="h-8 border border-[#d5d9d9] rounded- text- px-2 bg-[#f0f2f2]">
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Customer Review</option>
              </select>
              <Link to="/products" className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- grid place-items-center text-">All</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w- mx-auto p-3">
        {loading? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({length:10}).map((_,i)=><div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />)}
          </div>
        ) : sorted.length===0? (
          <div className="bg-white border border-[#d5d9d9] rounded- p-12 text-center">
            <div className="text-">🏷️</div>
            <div className="font-bold mt-2">No products for "{displayName}"</div>
            <Link to="/products" className="inline-flex mt-4 h-9 px-6 bg-[#FFD814] border border-[#FCD200] rounded- items-center text- font-bold">Browse All</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sorted.map(p=>{
              const img = resolveImage(p.image || p.images?.[0]) || PLACEHOLDER;
              const price = Number(p.price||0);
              const mrp = Number(p.original_price || p.mrp || price*1.25);
              const disc = mrp>price? Math.round((1-price/mrp)*100) : 0;
              return (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-white border border-[#f0f2f2] hover:border-[#d5d9d9] rounded- p-3 flex flex-col hover:shadow-md transition">
                  <div className="aspect-square bg-[#f7fafa] rounded- grid place-items-center overflow-hidden relative">
                    <img src={img} alt={p.name||p.title} className="w-full h-full object-contain p-2" onError={e=> e.currentTarget.src = PLACEHOLDER} />
                    {disc>0 && <span className="absolute top-1 left-1 bg-[#CC0C39] text-white text- px-1.5 py-0.5 rounded- font-bold">{disc}%</span>}
                  </div>
                  <h3 className="text- line-clamp-2 mt-2 min-h-">{p.name || p.title}</h3>
                  <div className="font-bold text- mt-1">₹{price.toLocaleString("en-IN")}</div>
                  <div className="text- text-[#067D62]">FREE delivery • Prime</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrandProducts;