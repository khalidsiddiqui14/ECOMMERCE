import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCartCount } from "../services/cartService";
import api, { getImageUrl } from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const activeDeals = searchParams.get("deals") === "true" || searchParams.get("deal") === "today";

  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem("access_token");
      const s = localStorage.getItem("user");
      if (!t ||!s) return null;
      return JSON.parse(s);
    } catch { return null; }
  });
  const [cartCount, setCartCount] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recent_searches")||"[]"); } catch { return []; }
  });
  const searchRef = useRef(null);

  useEffect(() => {
    const load = () => {
      try {
        const t = localStorage.getItem("access_token");
        const s = localStorage.getItem("user");
        setUser(!t ||!s? null : JSON.parse(s));
      } catch { setUser(null); }
    };
    const onCart = async () => {
      try { setCartCount(await getCartCount()); } catch { setCartCount(0); }
    };
    load(); onCart();
    window.addEventListener("auth-change", load);
    window.addEventListener("cart-change", onCart);
    window.addEventListener("wishlist-change", onCart);
    const onClickOutside = (e) => {
      if (searchRef.current &&!searchRef.current.contains(e.target)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("auth-change", load);
      window.removeEventListener("cart-change", onCart);
      window.removeEventListener("wishlist-change", onCart);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  // AMAZON AUTOCOMPLETE - debounced search
  useEffect(() => {
    if (searchQ.trim().length<2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("products/", { params: { search: searchQ.trim(), page_size: 5 } });
        const list = res.data?.results || res.data || [];
        setSuggestions(Array.isArray(list)? list.slice(0,5) : []);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const saveRecent = (q) => {
    try {
      const trimmed = q.trim();
      if (!trimmed) return;
      const updated = [trimmed,...recentSearches.filter(s=> s.toLowerCase()!==trimmed.toLowerCase())].slice(0,5);
      setRecentSearches(updated);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("recent_searches");
      setUser(null);
      setCartCount(0);
      window.dispatchEvent(new Event("auth-change"));
      window.dispatchEvent(new Event("cart-change"));
      navigate("/login");
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    saveRecent(searchQ);
    setShowSuggest(false);
    navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
  };

  const handleSuggestionClick = (item) => {
    if (typeof item==="string") {
      setSearchQ(item);
      saveRecent(item);
      navigate(`/search?q=${encodeURIComponent(item)}`);
    } else {
      saveRecent(item.name);
      navigate(`/products/${item.id}`);
    }
    setShowSuggest(false);
  };

  const isActive = (slug) => {
    if (slug==="deals") return activeDeals;
    if (!slug &&!activeCategory &&!activeDeals) return true;
    return activeCategory.toLowerCase()===slug;
  };

  const linkClass = (slug) => `hover:outline hover:outline-1 p-1 rounded- transition ${isActive(slug)? "bg-[#37475a] outline outline-1 font-bold text-[#febd69]" : ""}`;

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <div className="bg-[#131921] text-white">
        <div className="max-w- mx-auto px-3 h- flex items-center gap-3 md:gap-4">
          <Link to="/" className="flex items-center gap-1 font-bold text- leading-none shrink-0 hover:outline hover:outline-1 p-1 rounded-">
            <span className="text-white">shop</span><span className="text-[#febd69]">zone</span>
            <span className="text- ml-2 self-end hidden lg:block font-normal opacity-80 leading-">Deliver to<br/>📍 India 110059</span>
          </Link>

          <form ref={searchRef} onSubmit={handleSearch} className="flex-1 flex h-10 rounded- overflow-hidden max-w- relative">
            <div className="hidden md:flex bg-[#f3f3f3] text-[#0F1111] text- px-3 items-center border-r border-[#cdcdcd]">All ▾</div>
            <input
              value={searchQ}
              onChange={e=>{ setSearchQ(e.target.value); setShowSuggest(true); }}
              onFocus={()=> setShowSuggest(true)}
              placeholder="Search shopzone - mobiles, laptops, fashion..."
              className="flex-1 px-3 text- text-black outline-none"
              autoComplete="off"
            />
            <button type="submit" className="w-12 bg-[#febd69] hover:bg-[#f3a847] grid place-items-center text-[#131921] text-">🔍</button>

            {/* AMAZON AUTOCOMPLETE DROPDOWN */}
            {showSuggest && (searchQ.trim().length>=1 || recentSearches.length>0) && (
              <div className="absolute top- left-0 right-0 bg-white text-black rounded- shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#d5d9d9] z-50 max-h- overflow-auto">
                {suggestions.length>0? (
                  <>
                    <div className="px-3 py-2 text- font-bold text-[#565959] uppercase tracking-wide bg-[#f0f2f2]">Products</div>
                    {suggestions.map(p=>{
                      const img = getImageUrl(p.images?.[0] || p.image || "");
                      return (
                        <div key={p.id} onClick={()=>handleSuggestionClick(p)} className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f2] cursor-pointer">
                          <img src={img || "https://via.placeholder.com/40"} alt="" className="w-10 h-10 object-contain bg-white border rounded" onError={(e)=>e.target.style.display='none'} />
                          <div className="flex-1 min-w-0">
                            <div className="text- line-clamp-1">{p.name}</div>
                            <div className="text- text-[#067D62]">in {p.category_name || "Electronics"} • ₹{Number(p.price||0).toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : null}

                {recentSearches.length>0 && searchQ.trim().length<2 && (
                  <>
                    <div className="px-3 py-2 text- font-bold text-[#565959] uppercase tracking-wide bg-[#f0f2f2] flex justify-between">
                      <span>Recent searches</span>
                      <button onClick={(e)=>{ e.stopPropagation(); setRecentSearches([]); localStorage.removeItem("recent_searches"); }} className="text-[#0066c0] font-normal normal-case">Clear</button>
                    </div>
                    {recentSearches.map((r,i)=>(
                      <div key={i} onClick={()=>handleSuggestionClick(r)} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f2f2] cursor-pointer text-">
                        <span className="text-[#565959]">🕒</span> {r}
                      </div>
                    ))}
                  </>
                )}

                {searchQ.trim() && (
                  <div onClick={handleSearch} className="px-3 py-2 hover:bg-[#f0f2f2] cursor-pointer text- border-t border-[#f0f2f2] font-medium text-[#0066c0]">
                    Search for "{searchQ}" in All Departments →
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="flex items-center gap-2 md:gap-4 ml-auto text-">
            {!user? (
              <Link to="/login" className="leading-tight hover:outline hover:outline-1 p-2 rounded- hidden md:block">
                <div className="text-">Hello, sign in</div>
                <div className="font-bold text-">Account & Lists ▾</div>
              </Link>
            ) : (
              <div className="leading-tight group relative">
                <div className="text- hidden md:block">Hello, {user.username?.slice(0,10) || user.email?.split("@")[0]?.slice(0,10)}</div>
                <Link to="/profile" className="font-bold text- hover:underline hidden md:block">Account & Lists ▾</Link>
                {/* Dropdown */}
                <div className="hidden group-hover:block absolute top- right-0 bg-white text-black w- rounded- shadow-xl border border-[#d5d9d9] p-3 z-50">
                  <Link to="/profile" className="block text- py-1 hover:text-[#E77600]">Your Account</Link>
                  <Link to="/orders" className="block text- py-1 hover:text-[#E77600]">Your Orders</Link>
                  <Link to="/wishlist" className="block text- py-1 hover:text-[#E77600]">Your Wish List</Link>
                  <button onClick={handleLogout} className="w-full mt-2 h-7 bg-[#FFD814] rounded- text- border border-[#FCD200]">Sign out</button>
                </div>
              </div>
            )}

            <Link to="/orders" className="hidden md:block leading-tight hover:outline hover:outline-1 p-2 rounded-">
              <div className="text-">Returns</div>
              <div className="font-bold text-">& Orders</div>
            </Link>

            <Link to="/cart" className="flex items-end gap-1 hover:outline hover:outline-1 p-2 rounded- relative">
              <div className="relative text- leading-none">🛒
                {cartCount>0 && <span className="absolute -top-2 -right-2 bg-[#f08804] text-[#131921] text- font-bold px- rounded-full min-w- h- grid place-items-center">{cartCount>99? "99+":cartCount}</span>}
              </div>
              <span className="font-bold hidden md:block text-">Cart</span>
            </Link>

            {user && <button onClick={handleLogout} className="text- border border-white px-2 h-7 rounded- hover:bg-white hover:text-black md:hidden">Logout</button>}
          </div>
        </div>
      </div>

      <div className="bg-[#232f3e] text-white">
        <div className="max-w- mx-auto px-3 h-10 flex items-center gap-1 text- overflow-auto whitespace-nowrap scrollbar-hide">
          <button className="flex items-center gap-1 font-medium px-2 py-1 hover:outline hover:outline-1 rounded-">☰ All</button>
          <Link to="/products" className={linkClass("")}>All Products</Link>
          <Link to="/products?category=electronics" className={linkClass("electronics")}>Electronics</Link>
          <Link to="/products?category=fashion" className={linkClass("fashion")}>Fashion</Link>
          <Link to="/products?category=home-kitchen" className={linkClass("home-kitchen")}>Home & Kitchen</Link>
          <Link to="/products?category=beauty" className={linkClass("beauty")}>Beauty</Link>
          <Link to="/products?deals=true" className={linkClass("deals")}>Today's Deals</Link>
          <Link to="/wishlist" className="hover:outline hover:outline-1 p-1 rounded- ml-2">♡ Wishlist</Link>
          {user?.role==="VENDOR" && <Link to="/vendor/dashboard" className="text-[#febd69] font-bold hover:outline hover:outline-1 p-1 ml-3 rounded-">Vendor Dashboard</Link>}
          {(user?.role==="ADMIN" || user?.is_staff) && <Link to="/admin" className="bg-[#febd69] text-[#131921] font-bold px-3 py-1 rounded- ml-3">Admin Panel</Link>}
        </div>
      </div>
    </header>
  );
}
export default Navbar;