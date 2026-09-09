import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop";

const resolveImg = (p) => {
  try {
    if (!p) return "";
    if (typeof p === "string") {
      const s = p.trim();
      if (s.startsWith("http")) return s;
      if (s.startsWith("/media")) return `${BASE}${s}`;
      if (s.startsWith("media/")) return `${BASE}/${s}`;
      return `${BASE}/media/${s.replace(/^\/+/, "")}`;
    }
    const imgObj = p.images?.[0] || p.image || p.thumbnail || p.logo || p.banner || p.store_logo;
    if (!imgObj) return "";
    let s = typeof imgObj === "string"? imgObj : imgObj.image || imgObj.url || imgObj.src || imgObj.logo || "";
    if (!s) return "";
    s = String(s);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    if (s.startsWith("media/")) return `${BASE}/${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

function StoreDetail() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    let cancelled = false;
    (async()=>{
      setLoading(true);
      setError("");
      try {
        const [sRes, pRes] = await Promise.allSettled([
          api.get(`stores/${slug}/`),
          api.get(`stores/${slug}/products/`)
        ]);

        if (cancelled) return;

        if (sRes.status==="fulfilled") {
          setStore(sRes.value.data || null);
        } else {
          console.warn("Store fetch failed", sRes.reason?.message);
          setStore({ name: slug?.replace(/-/g, " ") || "Brand Store", slug, description: `Official ${slug} Brand Store` });
        }

        if (pRes.status==="fulfilled") {
          const d = pRes.value.data;
          const list = Array.isArray(d)? d : d?.results || d?.products || d?.items || [];
          setProducts(Array.isArray(list)? list : []);
        } else {
          console.warn("Store products failed", pRes.reason?.message);
          setProducts([]);
        }
      } catch (e) {
        console.error("STORE DETAIL ERROR", e);
        if (!cancelled) {
          setError("Store load failed — showing fallback.");
          setStore({ name: slug?.replace(/-/g," ") || "Store", slug });
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div className="min-h- grid place-items-center bg-[#EAEDED]"><div className="w-10 h-10 border-4 border-[#FFD814] border-t-transparent rounded-full animate-spin" /><span className="ml-3 text- text-[#565959]">Loading store {slug}...</span></div>;

  const storeName = store?.name || slug?.replace(/-/g, " ") || "Store";
  const storeLogo = resolveImg(store) || "";
  const storeBanner = store?.banner? resolveImg({ image: store.banner }) : store?.cover? resolveImg({ image: store.cover }) : "";

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-6">
      <div className="bg-white border-b border-[#d5d9d9] shadow-sm">
        <div className="max-w- mx-auto">
          <div className="h- md:h- bg-gradient-to-r from-[#131921] to-[#232f3e] relative overflow-hidden">
            {storeBanner? (
              <img src={storeBanner} alt="banner" className="w-full h-full object-cover" onError={(e)=> e.target.style.display='none'} />
            ) : (
              <div className="w-full h-full opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop)` }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-4 md:left-8 flex items-end gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border-2 border-white shadow-lg grid place-items-center text- overflow-hidden shrink-0">
                {storeLogo? <img src={storeLogo} alt="logo" className="w-full h-full object-contain p-2" onError={(e)=> e.target.style.display='none'} /> : <span className="text-">🏬</span>}
              </div>
              <div className="text-white pb-1 max-w-[70%]">
                <h1 className="text- md:text- font-bold leading-none capitalize">{storeName}</h1>
                <p className="text- md:text- opacity-90 mt-1 line-clamp-1 leading-">{store?.description || `Official ${storeName} Brand Store on ShopZone • FREE Delivery • Prime • 10 days return • GST Invoice`}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="bg-white text-black text- md:text- px-2.5 py-0.5 rounded-full font-bold">✓ Official Store • Verified</span>
                  <span className="text- opacity-90">★ 4.8 (12k) • {products.length} Products • Prime</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 md:px-8 py-3 flex gap-6 text- border-t border-[#f0f2f2] overflow-auto whitespace-nowrap items-center bg-white">
            <span className="font-bold border-b-2 border-[#E77600] pb-1 text-[#0F1111]">Store Home</span>
            <span className="text-[#0F1111] font-medium">All Products ({products.length})</span>
            <span className="text-[#565959] hover:text-[#E77600] cursor-pointer hover:underline">Best Sellers • Prime</span>
            <span className="text-[#565959] hover:text-[#E77600] cursor-pointer hover:underline">New Arrivals</span>
            <span className="text-[#565959] hover:text-[#E77600] cursor-pointer hover:underline">Top Rated</span>
            <Link to="/products" className="text-[#007185] hover:underline ml-auto font-bold">← Back to ShopZone</Link>
          </div>
        </div>
      </div>

      {error && <div className="max-w- mx-auto mt-2 mx-3 bg-white border-l- border-[#CC0C39] p-3 text- text-[#CC0C39] rounded- shadow-sm">⚠ {error}</div>}

      <div className="max-w- mx-auto p-3 mt-3">
        <div className="bg-white p-4 rounded- border border-[#d5d9d9] shadow-sm mb-3 flex gap-4 items-center flex-wrap">
          <div className="text- flex-1"><span className="font-bold text-[#0F1111]">Shop {storeName} Official</span> <span className="text-[#565959]">• FREE delivery on orders above ₹499 • 10-day FREE returns • Secure payments • EMI • COD • GST invoice • Prime delivery</span></div>
          <div className="flex gap-2">
            <span className="bg-[#E8F6EF] text-[#067D62] text- px-2.5 py-1 rounded-full font-bold border border-[#bbf7d0]">✓ PRIME Eligible • FREE Tomorrow</span>
            <span className="bg-[#fef8f2] text-[#e47911] text- px-2 py-1 rounded-full font-bold border">Top Brand • Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.length===0? (
            <div className="col-span-full bg-white p-10 text-center border border-[#d5d9d9] rounded- shadow-sm">
              <div className="text- mb-3">🏬</div>
              <h3 className="font-bold text-">No products in {storeName} yet</h3>
              <p className="text- text-[#565959] mt-1 max-w- mx-auto">This official store hasn't added products yet. Check back soon or explore ShopZone's {storeName} collection across categories. Prime FREE delivery available.</p>
              <div className="flex gap-2 justify-center mt-4">
                <Link to="/products" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-6 h-9 leading-9 rounded- text- shadow-sm font-bold inline-block">Browse All ShopZone Products</Link>
                <Link to="/" className="bg-white border border-[#d5d9d9] px-6 h-9 leading-9 rounded- text- shadow-sm inline-block">Go Home</Link>
              </div>
            </div>
          ) :
            products.map(p=>{
              const img = resolveImg(p) || PLACEHOLDER;
              const price = Number(p.price||0);
              const mrp = Number(p.original_price || p.mrp || price*1.25);
              const disc = mrp>price? Math.round((1-price/mrp)*100) : 0;
              return (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-white border border-[#d5d9d9] rounded- p-3 shadow-sm hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] transition flex flex-col group">
                  <div className="aspect-square bg-[#f7fafa] rounded- grid place-items-center overflow-hidden relative border border-[#f0f2f2]">
                    <img src={img} alt={p.name || "product"} className="w-full h-full object-contain p-2 group-hover:scale-[1.05] transition duration-200" onError={(e)=> e.target.src=PLACEHOLDER} />
                    {disc>0 && <span className="absolute top-1 left-1 bg-[#CC0C39] text-white text- px-1.5 py-0.5 rounded- font-bold">{disc}% OFF • Deal</span>}
                    <span className="absolute bottom-1 right-1 bg-white border text- px-1 rounded-full">Prime</span>
                  </div>
                  <h3 className="text- line-clamp-2 mt-2 min-h- leading- group-hover:text-[#C45500] text-[#0F1111]">{p.name || p.title || "Product"}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text- font-bold text-[#0F1111]">₹{price.toLocaleString("en-IN")}</span>
                    {mrp>price && <span className="text- text-[#565959] line-through">₹{mrp.toLocaleString("en-IN")}</span>}
                  </div>
                  <div className="text- text-[#067D62] mt-1 font-medium">✓ Prime FREE Delivery Tomorrow • 10 days return</div>
                  <div className="mt-1.5 text- flex items-center gap-1"><span className="bg-[#067D62] text-white px-1 rounded- font-bold">4.3 ★</span> <span className="text-[#565959]">(1,234) • Prime Verified</span></div>
                </Link>
              );
            })
          }
        </div>

        {products.length>0 && (
          <div className="mt-4 bg-white border border-[#d5d9d9] rounded- p-3 text- text-center text-[#565959]">
            Official <strong>{storeName}</strong> Brand Store on ShopZone • {products.length} products • Prime FREE delivery • GST invoice • <Link to="/products" className="text-[#0066c0] hover:underline">Explore more brands</Link>
          </div>
        )}
      </div>
    </div>
  );
}
export default StoreDetail;