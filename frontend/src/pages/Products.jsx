import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";

const BASE = "http://127.0.0.1:8000";

const FIXED_CATEGORIES = [
  { label: "All Products", value: "", slug: "" },
  { label: "Electronics", value: "Electronics", slug: "electronics" },
  { label: "Fashion", value: "Fashion", slug: "fashion" },
  { label: "Home & Kitchen", value: "Home & Kitchen", slug: "home-kitchen" },
  { label: "Beauty", value: "Beauty", slug: "beauty" },
  { label: "Today's Deals", value: "__DEALS__", slug: "deals" },
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(() => {
    const deals = searchParams.get("deals") === "true";
    if (deals) return "__DEALS__";
    const cat = searchParams.get("category") || "";
    if (!cat) return "";
    const match = FIXED_CATEGORIES.find(c => c.slug === cat.toLowerCase() || c.value.toLowerCase() === cat.toLowerCase());
    return match? match.value : cat;
  });
  const [sort, setSort] = useState("latest");
  const [addingId, setAddingId] = useState(null);
  const [wishId, setWishId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = {};
    if (category && category!== "__DEALS__") params.category = category.toLowerCase();
    if (category === "__DEALS__") params.deals = "true";
    if (search.trim()) params.search = search.trim();
    setSearchParams(params, { replace: true });
  }, [category, search, setSearchParams]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts({ page_size: 100 });
      console.log("API Response:", data);
      const list = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : data?.data || [];
      const unique = Array.from(new Map(list.map(p => [p.id, p])).values());
      console.log(`Loaded ${unique.length} products`);
      setProducts(unique);
    } catch (err) {
      console.error("Load error:", err);
      setError(err.response?.data?.detail || "Products load nahi ho paaye. Backend check karo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    let res = [...products];
    const q = search.trim().toLowerCase();
    if (category === "__DEALS__") {
      res = res.filter(p => {
        const price = Number(p.price || 0);
        const mrp = Number(p.original_price || p.mrp || p.originalPrice || 0);
        return (mrp > price) || p.is_deal || Number(p.discount_percent) > 0;
      });
    } else if (category) {
      res = res.filter(p => {
        const catName = String(p.category_name || p.categoryName || "").toLowerCase();
        const catSlug = String(p.category_slug || "").toLowerCase();
        const target = category.toLowerCase();
        if (catName.includes(target) || target.includes(catName)) return true;
        if (catSlug.includes(target)) return true;
        const fixedMatch = FIXED_CATEGORIES.find(c => c.value.toLowerCase() === target);
        if (fixedMatch && catSlug === fixedMatch.slug) return true;
        return false;
      });
    }
    if (q) {
      res = res.filter(p =>
        String(p.name||"").toLowerCase().includes(q) ||
        String(p.description||"").toLowerCase().includes(q) ||
        String(p.category_name||p.category||"").toLowerCase().includes(q)
      );
    }
    if (sort === "price-low") res.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    if (sort === "price-high") res.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    if (sort === "latest") res.sort((a,b)=> new Date(b.created_at||0) - new Date(a.created_at||0));
    return res;
  }, [products, search, category, sort]);

  const clearFilters = () => { setSearch(""); setCategory(""); setSort("latest"); setSearchParams({}); };

  const handleAddToCart = async (product) => {
    if (!product?.id || Number(product.stock) === 0) return;
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setCartMessage(`${product.name} cart mein add ho gaya.`);
      window.dispatchEvent(new Event("cart-change"));
      setTimeout(()=>setCartMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setCartMessage("Login required for cart!");
      setTimeout(()=>setCartMessage(""), 3000);
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlist = async (product) => {
    if (!product?.id) return;
    setWishId(product.id);
    try {
      await addToWishlist(product.id);
      setCartMessage(`${product.name} wishlist mein add ho gaya.`);
      window.dispatchEvent(new Event("wishlist-change"));
      setTimeout(()=>setCartMessage(""), 3000);
    } catch (err) {
      setCartMessage("Wishlist: Login required!");
      setTimeout(()=>setCartMessage(""), 3000);
    } finally {
      setWishId(null);
    }
  };

  // IMPROVED IMAGE - NO ERROR, ALWAYS WITH BASE
  const getProductImage = (product) => {
    try {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const first = product.images[0];
        let src = typeof first === 'string'? first : first.image || first.url || first.src || "";
        if (!src) return "https://via.placeholder.com/400x400?text=No+Image";
        if (src.startsWith("http")) return src;
        if (src.startsWith("/media")) return `${BASE}${src}`;
        return `${BASE}/media/${src.replace(/^\/+/, "")}`;
      }
      const direct = product.image || product.image_url || product.thumbnail || "";
      if (direct) {
        if (direct.startsWith("http")) return direct;
        if (direct.startsWith("/media")) return `${BASE}${direct}`;
        if (direct) return `${BASE}/media/${direct.replace(/^\/+/, "")}`;
      }
    } catch {}
    return "https://via.placeholder.com/400x400?text=No+Image";
  };

  const activeLabel = FIXED_CATEGORIES.find(c => c.value === category)?.label || (category || "All Products");

  if (loading) return <div className="bg-[#f1f3f6] min-h-screen grid place-items-center"><div className="w-12 h-12 border-4 border-[#FFD814] border-t-transparent rounded-full animate-spin" /></div>;

  if (error) {
    return (
      <div className="bg-[#f1f3f6] min-h-screen grid place-items-center p-4">
        <div className="bg-white p-8 rounded shadow text-center max-w-md">
          <div className="text-5xl mb-4">⚠</div>
          <h2 className="font-bold text-lg mb-2">Error Loading Products</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={loadProducts} className="bg-[#2874f0] text-white px-6 py-2 rounded text-sm font-bold">Retry</button>
          <p className="text-xs text-gray-500 mt-4">Check: Backend running? http://127.0.0.1:8000/api/products/</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f6] min-h-screen pb-6">
      {cartMessage && (
        <div className="max-w- mx-auto px-2 pt-2">
          <div className="bg-white p-3 border-l-4 border-[#388e3c] shadow-sm text-sm flex gap-2">
            <span className="text-[#388e3c]">✓</span> {cartMessage}
            <Link to="/cart" className="ml-auto text-[#2874f0] font-bold">Go to Cart →</Link>
          </div>
        </div>
      )}

      {/* NEW SECTION: Deals Banner */}
      {category==="__DEALS__" && (
        <div className="max-w- mx-auto px-2 pt-2">
          <div className="bg-[#fff8e1] border border-[#ffe082] p-3 rounded flex items-center gap-3 text-">
            <span className="bg-[#CC0C39] text-white px-2 py-0.5 rounded text- font-bold">DEALS</span>
            <span className="font-bold">Today's Deals ends in 12:45:30</span>
            <span className="text-[#565959]">• Extra 10% off with EMI • FREE Delivery</span>
          </div>
        </div>
      )}

      <div className="max-w- mx-auto px-2 py-2 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-2 items-start">
        <aside className="bg-white shadow-sm sticky top- rounded-">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-sm">Filters</h3>
            {(search || category) && <button onClick={clearFilters} className="text-xs font-bold text-[#2874f0]">CLEAR ALL</button>}
          </div>
          <div className="p-4 border-b">
            <label className="block text-xs font-bold uppercase mb-2">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-9 border border-[#e0e0e0] px-2 text-sm outline-none rounded">
              {FIXED_CATEGORIES.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="p-4 border-b">
            <label className="block text-xs font-bold uppercase mb-2">Sort By</label>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full h-9 border border-[#e0e0e0] px-2 text-sm outline-none rounded">
              <option value="latest">Popularity</option>
              <option value="price-low">Price -- Low to High</option>
              <option value="price-high">Price -- High to Low</option>
            </select>
          </div>
          <div className="p-4">
            <label className="block text-xs font-bold uppercase mb-2">Search</label>
            <input type="search" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full h-9 border border-[#e0e0e0] pl-3 text-sm outline-none rounded" />
            <div className="mt-3 text-xs text-[#878787] bg-[#f5f5f5] p-2 rounded">
              Showing <strong>{filteredProducts.length}</strong> of {products.length} products {category && <span className="ml-1 bg-[#e0e0e0] px-2 py-0.5 rounded">{activeLabel}</span>}
            </div>
          </div>
        </aside>

        <div className="bg-white shadow-sm rounded-">
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="font-bold text-sm">{activeLabel} <span className="font-normal text-[#878787]">- {filteredProducts.length} items</span></h1>
            <div className="flex items-center gap-2">
              <span className="text- bg-[#26a541] text-white px-2 py-0.5 rounded">✓ Assured</span>
              <span className="text-xs text-[#878787]">{filteredProducts.length} items</span>
            </div>
          </div>

          {filteredProducts.length===0? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="font-bold">No Products Found in {activeLabel}</h2>
              <p className="text-sm text-gray-500 mt-2">Total in DB: {products.length}. Try Clear All.</p>
              <button onClick={clearFilters} className="mt-4 bg-[#2874f0] text-white px-4 py-2 rounded text-sm">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[#f1f3f6]">
              {filteredProducts.map((product)=>{
                const stock = Number(product.stock);
                const hasStock = product.stock===undefined || stock>0;
                const price = Number(product.price||0);
                const mrp = Number(product.original_price || product.mrp || price*1.2);
                const disc = mrp>price? Math.round((1-price/mrp)*100) : 0;
                const imgUrl = getProductImage(product);
                return (
                  <article key={product.id} className="bg-white p-3 flex flex-col hover:shadow-lg transition-shadow group relative">
                    {/* WISHLIST HEART - NEW */}
                    <button onClick={()=>handleWishlist(product)} disabled={wishId===product.id} className="absolute top-2 right-2 w-7 h-7 bg-white border border-[#e0e0e0] rounded-full grid place-items-center shadow-sm hover:bg-[#fff0f0] z-10">
                      <span className="text-">{wishId===product.id? '...' : '♡'}</span>
                    </button>

                    <Link to={`/products/${product.id}`}>
                      <div className="relative h- flex items-center justify-center bg-white">
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform"
                          onError={(e)=>{ e.target.src="https://via.placeholder.com/300?text=No+Image"; }}
                        />
                        {disc>0 && <span className="absolute top-1 left-1 bg-[#388e3c] text-white text-xs px-1.5 py-0.5 rounded">{disc}% OFF</span>}
                        {hasStock && <span className="absolute bottom-1 left-1 bg-[#26a541] text-white text- px-1 rounded">Assured</span>}
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-[#878787] truncate">{product.category_name || product.categoryName || product.category || "General"}</div>
                        <h3 className="text-sm font-medium line-clamp-2 h-10 mt-1 group-hover:text-[#2874f0]">{product.name}</h3>
                        {/* RATING - NEW SECTION */}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="bg-[#26a541] text-white text- px-1 rounded flex items-center gap-0.5">4.3 ★</span>
                          <span className="text- text-[#878787]">(2,456)</span>
                          <span className="text- text-[#26a541] ml-1">✓ FREE Delivery</span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-bold text-sm">₹{price.toLocaleString("en-IN")}</span>
                          {mrp>price && <span className="text-xs text-[#878787] line-through">₹{mrp.toLocaleString("en-IN")}</span>}
                        </div>
                        <div className="text- text-[#26a541] font-medium">{hasStock? "In Stock • EMI available" : "Out of Stock"}</div>
                      </div>
                    </Link>
                    <button disabled={!hasStock || addingId===product.id} onClick={()=>handleAddToCart(product)} className={`mt-3 h-8 rounded-sm text-xs font-bold shadow-sm ${hasStock? 'bg-[#ff9f00] text-white hover:bg-[#ff8f00]' : 'bg-[#f5f5f5] text-[#878787]'}`}>
                      {addingId===product.id? 'ADDING...' : hasStock? 'ADD TO CART' : 'OUT OF STOCK'}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;