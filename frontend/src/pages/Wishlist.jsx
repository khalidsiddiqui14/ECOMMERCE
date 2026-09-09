import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const PLACEHOLDER = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop";

const resolveImg = (product) => {
  try {
    const imgs = product?.images;
    if (Array.isArray(imgs) && imgs.length>0) {
      let s = typeof imgs[0]==="string"? imgs[0] : imgs[0]?.image || imgs[0]?.url || imgs[0]?.src || "";
      if (s) {
        s = String(s);
        if (s.startsWith("http")) return s;
        if (s.startsWith("/media")) return `${BASE}${s}`;
        return `${BASE}/media/${s.replace(/^\/+/, "")}`;
      }
    }
    const direct = product?.image || product?.thumbnail || product?.product_image || "";
    if (direct) {
      const s = String(direct);
      if (s.startsWith("http")) return s;
      if (s.startsWith("/media")) return `${BASE}${s}`;
      return `${BASE}/media/${s.replace(/^\/+/, "")}`;
    }
  } catch {}
  return PLACEHOLDER;
};

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const loadWishlist = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      const items = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : Array.isArray(data?.items)? data.items : data?.wishlist || [];
      setWishlist(Array.isArray(items)? items : []);
      window.dispatchEvent(new Event("wishlist-change"));
    } catch (err) {
      console.error("WISHLIST ERROR:", err);
      setError(err.response?.data?.detail || err.message || "Wishlist load failed.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const handleRemove = async (itemId) => {
    if (!itemId || removingId === itemId) return;
    setRemovingId(itemId);
    setError("");
    try {
      await removeFromWishlist(itemId);
      setWishlist((prev) => prev.filter((i) => i.id!== itemId));
      window.dispatchEvent(new Event("wishlist-change"));
      setMsg("Removed from wishlist • Saved for later moved");
      setTimeout(()=>setMsg(""), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Remove failed.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (item) => {
    const product = item.product || item;
    const pid = product.id || item.product || item.product_id;
    if (!pid) return;
    setAddingCartId(item.id);
    setError("");
    try {
      await addToCart(pid, 1);
      window.dispatchEvent(new Event("cart-change"));
      setMsg(`${product.name || "Product"} moved to Cart • Prime FREE delivery!`);
      setTimeout(()=>setMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.detail || "Add to cart failed. Login required.");
    } finally {
      setAddingCartId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="h- bg-white shadow-sm animate-pulse rounded- border border-[#d5d9d9]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && wishlist.length === 0) {
    return (
      <div className="bg-[#EAEDED] min-h-screen grid place-items-center p-4">
        <div className="bg-white p-8 shadow-sm text-center rounded- border border-[#d5d9d9] max-w-">
          <div className="text-">♡</div>
          <h2 className="font-bold text- mt-2">Unable to Load Wishlist</h2>
          <p className="text- text-[#565959] mt-2">{error}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button type="button" className="bg-[#FFD814] border border-[#FCD200] px-6 h-8 rounded- text- font-bold shadow-sm" onClick={() => loadWishlist()}>Try Again</button>
            <Link to="/products" className="bg-white border border-[#d5d9d9] px-6 h-8 rounded- text- grid place-items-center">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-6">
      <div className="max-w- mx-auto px-2 py-2">
        <div className="bg-white shadow-sm p-4 flex justify-between items-center rounded- border border-[#d5d9d9] flex-wrap gap-2">
          <div>
            <h1 className="text- font-medium text-[#0F1111]">Your Lists • Wish List • ShopZone</h1>
            <p className="text- text-[#565959] mt-1">
              {wishlist.length === 0? "Save products you love • Prime FREE delivery • Price drop alerts" : `${wishlist.length} items saved • Updated just now • FREE delivery • Price alerts on • Prime`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/cart" className="text- border border-[#d5d9d9] rounded- px-4 h-8 grid place-items-center shadow-sm bg-white hover:bg-[#f7fafa]">Go to Cart</Link>
            <Link to="/products" className="text- bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- px-4 h-8 grid place-items-center shadow-sm font-bold">Continue Shopping • Prime</Link>
          </div>
        </div>

        {error && <div className="mt-2 bg-white p-3 border-l- border-[#CC0C39] text- text-[#CC0C39] shadow-sm rounded- flex justify-between">⚠ {error} <button onClick={()=>setError("")} className="text-[#0066c0] font-bold">Dismiss</button></div>}
        {msg && <div className="mt-2 bg-white p-3 border-l- border-[#067D62] text- text-[#067D62] shadow-sm rounded- flex justify-between">✓ {msg} <Link to="/cart" className="text-[#0066c0] font-bold">View Cart →</Link></div>}

        {wishlist.length === 0? (
          <div className="bg-white p-12 text-center shadow-sm mt-2 rounded- border border-[#d5d9d9]">
            <div className="text- mb-4">♡</div>
            <h2 className="text- font-bold text-[#0F1111]">Your ShopZone Wish List is empty</h2>
            <p className="text- text-[#565959] mt-2 max-w- mx-auto">Save products you love and find them here later. Get price drop alerts, back in stock notifications, and Prime FREE delivery. Start exploring our deals.</p>
            <div className="flex gap-2 justify-center mt-6">
              <Link to="/products" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] px-6 h-9 leading-9 rounded- text- shadow-sm font-bold">Browse Products • Prime FREE</Link>
              <Link to="/" className="border border-[#d5d9d9] px-6 h-9 leading-9 rounded- text- bg-white shadow-sm hover:bg-[#f7fafa]">Go Home</Link>
            </div>
            <div className="mt-6 text- text-[#565959]">Prime • FREE One-Day Delivery • 10 days return • EMI • COD • <Link to="/deals" className="text-[#0066c0] hover:underline">Today's Deals</Link></div>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {wishlist.map((item) => {
              const product = item.product || item;
              const productId = product.id || item.product || item.product_id;
              const productName = product.name || `Product #${productId}`;
              const productPrice = Number(product.price || 0);
              const originalPrice = Number(product.original_price || product.mrp || product.compare_price || 0);
              const hasDiscount = originalPrice > productPrice && originalPrice > 0;
              const discount = hasDiscount? Math.round(((originalPrice - productPrice) / originalPrice) * 100) : 0;
              const image = resolveImg(product);
              const isRemoving = removingId === item.id;
              const isAddingCart = addingCartId === item.id;

              return (
                <div key={item.id || productId} className={`bg-white p-3 flex flex-col rounded- border border-[#d5d9d9] shadow-sm hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] transition-shadow ${isRemoving?'opacity-50':''}`}>
                  <Link to={`/product/${productId}`} className="block">
                    <div className="relative h- grid place-items-center bg-[#f7fafa] rounded- overflow-hidden border border-[#f0f2f2]">
                      <img src={image} alt={productName} className="max-h-full max-w-full object-contain p-2" onError={(e)=> e.target.src=PLACEHOLDER} />
                      {hasDiscount && <span className="absolute top-1.5 left-1.5 bg-[#CC0C39] text-white text- px-1.5 py-0.5 rounded- font-bold">{discount}% off • Deal</span>}
                      <button onClick={(e)=>{e.preventDefault(); handleRemove(item.id);}} disabled={isRemoving} className="absolute top-1.5 right-1.5 w-7 h-7 bg-white border border-[#d5d9d9] rounded-full grid place-items-center text- shadow-sm hover:bg-[#fff0f0] hover:border-[#CC0C39] disabled:opacity-50">✕</button>
                      <span className="absolute bottom-1 left-1 bg-white border text- px-1 rounded-full">Prime</span>
                    </div>
                    <div className="mt-2.5">
                      <div className="text- line-clamp-2 min-h- leading- hover:text-[#C45500] text-[#0F1111]">{productName}</div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-bold text- text-[#0F1111]">₹{productPrice.toLocaleString("en-IN")}</span>
                        {hasDiscount && <span className="text- text-[#565959] line-through">₹{originalPrice.toLocaleString("en-IN")}</span>}
                      </div>
                      <div className="text- text-[#067D62] mt-1 font-medium">✓ In stock • FREE Delivery • 10 days return • Prime</div>
                      <div className="text- mt-1 flex items-center gap-1"><span className="bg-[#067D62] text-white px-1 rounded- text-">4.4 ★</span><span className="text-[#565959]">(1.2k) • Prime Verified</span></div>
                    </div>
                  </Link>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link to={`/product/${productId}`} className="h-8 border border-[#d5d9d9] rounded- grid place-items-center text- shadow-sm bg-white hover:bg-[#f7fafa] font-medium">View • Details</Link>
                    <button onClick={()=>handleMoveToCart(item)} disabled={isAddingCart || isRemoving} className="h-8 bg-[#FFD814] hover:bg-[#F7CA00] rounded- grid place-items-center text- shadow-sm border border-[#FCD200] font-bold disabled:opacity-50">
                      {isAddingCart? 'Moving...' : 'Move to Cart • Prime'}
                    </button>
                  </div>
                  <div className="mt-2 text- text-center text-[#565959]">Added on {item.created_at? new Date(item.created_at).toLocaleDateString() : "Today"} • Price alert on</div>
                </div>
              );
            })}
          </div>
        )}

        {wishlist.length>0 && (
          <div className="mt-4 bg-white border border-[#d5d9d9] rounded- p-3 text- text-center text-[#565959]">
            Your Lists • {wishlist.length} items • Prime FREE delivery • Price drop alerts active • Share list with friends • <Link to="/products" className="text-[#0066c0] hover:underline">Discover more</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;