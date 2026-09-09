import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || "http://127.0.0.1:8000";
const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

// FIXED: catch with error param - no-empty fix
const resolveImg = (src) => {
  try {
    if (!src) return "";
    let s = typeof src === "string"? src : src.image || src.url || "";
    if (!s) return "";
    s = String(s);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch (e) {
    console.error("resolveImg error:", e);
    return "";
  }
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [viewMode, setViewMode] = useState("grid");
  const [addingId, setAddingId] = useState(null);
  const [wishId, setWishId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  // FIXED: No setState in effect directly - useCallback already handles
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      const list = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : data?.products || [];
      setProducts(Array.isArray(list)? list : []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Products load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const vals = products.map(p => p.category_name || p.category?.name || p.category).filter(Boolean);
    return [...new Set(vals.map(v=>String(v)))].sort((a,b)=>a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let res = [...products];
    const q = search.trim().toLowerCase();
    if (q) res = res.filter(p => String(p.name||"").toLowerCase().includes(q) || String(p.description||"").toLowerCase().includes(q) || String(p.category_name||p.category?.name||p.category||"").toLowerCase().includes(q));
    if (category) res = res.filter(p => String(p.category_name||p.category?.name||p.category||"") === category);
    res = res.filter(p => {
      const price = Number(p.price||0);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (sort==="price-low") res.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    if (sort==="price-high") res.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    if (sort==="latest") res.sort((a,b)=> new Date(b.created_at||0).getTime() - new Date(a.created_at||0).getTime());
    return res;
  }, [products, search, category, sort, priceRange]);

  const hasFilters = Boolean(search.trim()) || Boolean(category) || sort!=="latest" || priceRange[0]!==0 || priceRange[1]!==100000;
  const clearFilters = () => { setSearch(""); setCategory(""); setSort("latest"); setPriceRange([0,100000]); setCartMessage(""); setCartError(""); };

  const handleAddToCart = async (product) => {
    if (!product?.id) return;
    if (product.stock!==undefined && Number(product.stock)<=0) return;
    setAddingId(product.id); setCartMessage(""); setCartError("");
    try {
      await addToCart(product.id, 1);
      window.dispatchEvent(new Event("cart-change"));
      setCartMessage(`${product.name || "Product"} added to cart • Prime FREE`);
      setTimeout(()=>setCartMessage(""), 3500);
    } catch (err) {
      setCartError(err.response?.data?.detail || err.message || "Add to cart failed.");
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlist = async (product) => {
    if (!product?.id) return;
    setWishId(product.id);
    try {
      await addToWishlist(product.id);
      window.dispatchEvent(new Event("wishlist-change"));
      setCartMessage(`♡ ${product.name} added to wishlist`);
      setTimeout(()=>setCartMessage(""), 3000);
    } catch (err) {
      setCartError(err.response?.data?.detail || err.message || "Wishlist failed.");
    } finally {
      setWishId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-3">
          <div className="h- bg-white border border-[#d5d9d9] rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i=>(<div key={i} className="h- bg-white border border-[#d5d9d9] rounded-lg animate-pulse" />))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4 grid place-items-center">
        <div className="bg-white border border-[#d5d9d9] rounded-lg p-8 text-center shadow-sm max-w-md">
          <div className="text-3xl">⚠</div>
          <h2 className="font-bold text-lg mt-2">Unable to load products</h2>
          <p className="text-sm text-[#565959] mt-1">{error}</p>
          <button onClick={()=>loadProducts()} className="mt-4 h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded-lg text-sm shadow-sm font-bold">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-4">
      <div className="max-w- mx-auto px-2 pt-2">
        <div className="bg-[#131921] rounded-lg p-4 md:p-5 text-white flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-lg md:text-xl font-bold">All Products • {products.length} results • Prime FREE Delivery</h1>
            <p className="text-sm text-[#febd69] mt-1">Free delivery above ₹499 • EMI • COD • 10 days return • {filteredProducts.length} filtered</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setViewMode("grid")} className={`w-8 h-8 rounded-lg grid place-items-center text-sm border ${viewMode==="grid"? 'bg-white text-[#131921] border-white' : 'bg-[#232f3e] text-white border-[#37475a] hover:bg-[#37475a]'}`}>⊞</button>
            <button onClick={()=>setViewMode("list")} className={`w-8 h-8 rounded-lg grid place-items-center text-sm border ${viewMode==="list"? 'bg-white text-[#131921] border-white' : 'bg-[#232f3e] text-white border-[#37475a] hover:bg-[#37475a]'}`}>☰</button>
          </div>
        </div>
      </div>

      {cartMessage && <div className="max-w- mx-auto px-2 mt-2"><div className="bg-white border border-[#067D62] border-l-4 p-3 text-sm text-[#067D62] shadow-sm rounded-lg flex justify-between items-center">✓ {cartMessage} <Link to="/cart" className="bg-[#067D62] text-white px-3 py-1 rounded-full text-xs font-bold">Go to Cart →</Link></div></div>}
      {cartError && <div className="max-w- mx-auto px-2 mt-2"><div className="bg-white border border-[#c40000] border-l-4 p-3 text-sm text-[#c40000] shadow-sm rounded-lg flex justify-between">⚠ {cartError} <button onClick={()=>setCartError("")} className="text-[#0066c0]">Dismiss</button></div></div>}

      <div className="max-w- mx-auto px-2 mt-2 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-2 items-start">
        <div className="bg-white border border-[#d5d9d9] rounded-lg shadow-sm sticky top-2">
          <div className="p-3 border-b border-[#e7e7e7] flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wide">Filters {hasFilters && <span className="w-2 h-2 bg-[#CC0C39] rounded-full inline-block ml-1 animate-pulse" />}</h3>
            {hasFilters && <button onClick={clearFilters} className="text-xs text-[#CC0C39] bg-[#fef2f2] border border-[#fecaca] px-2 py-1 rounded-full hover:bg-[#fee2e2]">Clear All ×</button>}
          </div>
          <div className="p-3 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#565959] tracking-wide">Search • {filteredProducts.length} results</label>
              <div className="relative mt-1">
                <input type="search" placeholder="Search products, brands..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full h-8 pl-7 pr-7 border border-[#a6a6a6] rounded-lg text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]" />
                <span className="absolute left-2 top-1.5 text-sm">🔍</span>
                {search && <button onClick={()=>setSearch("")} className="absolute right-2 top-1.5 text-xs text-[#565959]">✕</button>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#565959] tracking-wide">Category • {categories.length} categories</label>
              <div className="flex flex-wrap gap-1 mt-2">
                <button onClick={()=>setCategory("")} className={`px-2.5 py-1 rounded-full text-xs border font-medium ${!category? 'bg-[#131921] text-white border-[#131921]' : 'bg-white border-[#d5d9d9] hover:border-[#131921]'}`}>All ({products.length})</button>
                {categories.map(c=>(
                  <button key={String(c)} onClick={()=>setCategory(String(c))} className={`px-2.5 py-1 rounded-full text-xs border font-medium ${category===String(c)? 'bg-[#131921] text-white border-[#131921]' : 'bg-white border-[#d5d9d9] hover:border-[#131921]'}`}>{String(c)}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#565959] tracking-wide">Price • ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}</label>
              <div className="flex gap-2 mt-2">
                <input type="number" value={priceRange[0]} onChange={e=>setPriceRange([Number(e.target.value)||0, priceRange[1]])} placeholder="Min" className="flex-1 h-7 px-2 border border-[#a6a6a6] rounded-lg text-xs outline-none focus:border-[#e77600]" />
                <input type="number" value={priceRange[1]} onChange={e=>setPriceRange([priceRange[0], Number(e.target.value)||100000])} placeholder="Max" className="flex-1 h-7 px-2 border border-[#a6a6a6] rounded-lg text-xs outline-none focus:border-[#e77600]" />
              </div>
              <input type="range" min={0} max={100000} step={500} value={priceRange[1]} onChange={e=>setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full mt-3 accent-[#f08804] h-1" />
              <div className="flex justify-between text-xs text-[#565959] mt-1"><span>₹0</span><span>₹1L+</span></div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#565959] tracking-wide">Sort By</label>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded-lg text-sm bg-white outline-none focus:border-[#e77600]">
                <option value="latest">Latest First • New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low • Premium</option>
              </select>
            </div>
            <div className="p-2.5 bg-[#f0f2f2] border border-[#d5d9d9] rounded-lg text-xs leading-4">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products<br/>
              <span className="text-[#067D62]">✓ Prime FREE delivery • EMI • COD • GST invoice</span>
            </div>
          </div>
        </div>

        <div>
          {filteredProducts.length===0? (
            <div className="bg-white border border-[#d5d9d9] rounded-lg p-10 text-center shadow-sm">
              <div className="text-3xl">🔍</div>
              <h2 className="font-bold mt-2 text-lg">No Products Found for "{search || category}"</h2>
              <p className="text-sm text-[#565959] mt-1">Try adjusting filters or search terms. Prime has {products.length} products.</p>
              {hasFilters && <button onClick={clearFilters} className="mt-3 h-8 px-4 bg-white border border-[#d5d9d9] rounded-lg text-sm shadow-sm hover:bg-[#f7fafa]">Clear All Filters • Show {products.length} products</button>}
            </div>
          ) : (
            <div className={`grid gap-2 ${viewMode==="grid"? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProducts.map((product)=>{
                const stock = Number(product.stock);
                const hasStock = product.stock===undefined || stock>0 || product.in_stock;
                const isAdding = addingId===product.id;
                const isWishing = wishId===product.id;
                const price = Number(product.price||0);
                const mrp = Number(product.original_price || product.mrp || product.compare_price || price*1.25);
                const disc = mrp>price? Math.round((1-price/mrp)*100) : 0;
                const imgSrc = resolveImg(product.image || product.images?.[0]) || PLACEHOLDER;
                return (
                  <div key={product.id} className={`bg-white border border-[#d5d9d9] rounded-lg overflow-hidden shadow-sm flex hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] transition ${viewMode==="list"? 'flex-row' : 'flex-col'}`}>
                    <Link to={`/product/${product.id}`} className={`relative block bg-[#f7fafa] ${viewMode==="list"? 'w-32 h-32 shrink-0' : 'aspect-square'} grid place-items-center border-b md:border-b-0 md:border-r border-[#f0f2f2]`}>
                      <img src={imgSrc} alt={product.name} className="max-h-full max-w-full object-contain p-2" onError={e=> { e.target.src=PLACEHOLDER; }} />
                      {disc>0 && <span className="absolute top-2 left-2 bg-[#CC0C39] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">{disc}% OFF • Deal</span>}
                      <button onClick={(e)=>{e.preventDefault(); handleWishlist(product);}} disabled={isWishing} className="absolute top-2 right-2 w-7 h-7 bg-white border border-[#d5d9d9] rounded-full grid place-items-center text-sm shadow-sm hover:bg-[#f7fafa] disabled:opacity-50">{isWishing? '...' : '♡'}</button>
                      {!hasStock && <span className="absolute inset-0 bg-white/80 grid place-items-center text-sm font-bold text-[#CC0C39]">OUT OF STOCK</span>}
                      <span className="absolute bottom-1 left-1 bg-white border border-[#d5d9d9] text- px-1 rounded-full">Prime</span>
                    </Link>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <div className="text- uppercase font-bold text-[#767676] tracking-wide">{product.category_name || product.category?.name || product.category || "ShopZone"} • {product.brand || "ShopZone"}</div>
                      <Link to={`/product/${product.id}`} className="text-sm font-medium line-clamp-2 min-h-[2.5rem] leading-5 hover:text-[#C45500] hover:underline">{product.name || "Product"}</Link>
                      <div className="flex items-center gap-1 text-xs"><span className="text-[#e47911]">★★★★☆</span><span className="text-[#0066c0]">4.3</span><span className="text-[#565959]">({Math.floor(Math.random()*5000)+100})</span></div>
                      <div className="flex items-baseline gap-1 mt-1"><span className="font-bold text- text-[#0F1111]">₹{price.toLocaleString("en-IN")}</span>{mrp>price && <span className="text-xs line-through text-[#565959]">₹{mrp.toLocaleString("en-IN")}</span>}{disc>0 && <span className="text-xs text-[#CC0C39]">({disc}% off)</span>}</div>
                      <div className="text-xs text-[#067D62]">FREE delivery • Prime • 10 days return • EMI</div>
                      <div className="grid grid-cols-2 gap-1.5 mt-auto pt-2">
                        <Link to={`/product/${product.id}`} className="h-7 grid place-items-center bg-white border border-[#d5d9d9] rounded-lg text-xs shadow-sm hover:bg-[#f7fafa]">View • Prime</Link>
                        <button disabled={!hasStock || isAdding} onClick={()=>handleAddToCart(product)} className={`h-7 rounded-lg text-xs shadow-sm border font-medium ${hasStock? 'bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200]' : 'bg-[#f0f2f2] border-[#d5d9d9] text-[#767676] cursor-not-allowed'}`}>{isAdding? 'Adding...' : hasStock? 'Add to Cart' : 'Out of Stock'}</button>
                      </div>
                    </div>
                  </div>
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