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
    const match = FIXED_CATEGORIES.find((c) => c.slug === cat.toLowerCase() || c.value.toLowerCase() === cat.toLowerCase());
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
      const list = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : data?.data || [];
      const unique = Array.from(new Map(list.map((p) => [p.id, p])).values());
      setProducts(unique);
    } catch (err) {
      setError(err.response?.data?.detail || "Products load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    let res = [...products];
    const q = search.trim().toLowerCase();
    if (category === "__DEALS__") {
      res = res.filter((p) => {
        const price = Number(p.price || 0);
        const mrp = Number(p.original_price || p.mrp || 0);
        return mrp > price || p.is_deal || Number(p.discount_percent) > 0;
      });
    } else if (category) {
      res = res.filter((p) => {
        const catName = String(p.category_name || "").toLowerCase();
        const target = category.toLowerCase();
        return catName.includes(target) || target.includes(catName);
      });
    }
    if (q) {
      res = res.filter(
        (p) =>
          String(p.name || "").toLowerCase().includes(q) ||
          String(p.description || "").toLowerCase().includes(q)
      );
    }
    if (sort === "price-low") res.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === "price-high") res.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sort === "latest") res.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return res;
  }, [products, search, category, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("latest");
    setSearchParams({});
  };

  const handleAddToCart = async (product) => {
    if (!product?.id || Number(product.stock) === 0) return;
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setCartMessage(`${product.name} cart mein add ho gaya.`);
      window.dispatchEvent(new Event("cart-change"));
      setTimeout(() => setCartMessage(""), 3000);
    } catch {
      setCartMessage("Login required for cart!");
      setTimeout(() => setCartMessage(""), 3000);
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
      setTimeout(() => setCartMessage(""), 3000);
    } catch {
      setCartMessage("Wishlist: Login required!");
      setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setWishId(null);
    }
  };

  const getProductImage = (product) => {
    try {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const first = product.images[0];
        let src = typeof first === "string"? first : first.image || first.url || "";
        if (!src) return "https://via.placeholder.com/400x400?text=No+Image";
        if (src.startsWith("http")) return src;
        if (src.startsWith("/media")) return `${BASE}${src}`;
        return `${BASE}/media/${src.replace(/^\/+/, "")}`;
      }
      const direct = product.image || product.image_url || product.thumbnail || "";
      if (direct) {
        if (direct.startsWith("http")) return direct;
        if (direct.startsWith("/media")) return `${BASE}${direct}`;
        return `${BASE}/media/${direct.replace(/^\/+/, "")}`;
      }
    } catch {
      return "https://via.placeholder.com/400x400?text=No+Image";
    }
    return "https://via.placeholder.com/400x400?text=No+Image";
  };

  const activeLabel = FIXED_CATEGORIES.find((c) => c.value === category)?.label || category || "All Products";

  if (loading) return <div className="bg-[#f1f3f6] min-h-screen grid place-items-center"><div className="w-12 h-12 border-4 border-[#FFD814] border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="bg-[#f1f3f6] min-h-screen grid place-items-center p-4"><div className="bg-white p-8 rounded shadow text-center"><p>{error}</p><button onClick={loadProducts} className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded">Retry</button></div></div>;

  return (
    <div className="bg-[#f1f3f6] min-h-screen pb-6">
      {cartMessage && <div className="max-w- mx-auto px-2 pt-2"><div className="bg-white p-3 border-l-4 border-[#388e3c] shadow-sm text-sm">✓ {cartMessage}</div></div>}
      <div className="max-w- mx-auto px-2 py-2 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-2">
        <aside className="bg-white shadow-sm sticky top-2 rounded-lg p-4">
          <h3 className="font-bold text-sm">Filters</h3>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-9 mt-3 border px-2 text-sm rounded">
            {FIXED_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full h-9 mt-3 border px-2 text-sm rounded">
            <option value="latest">Popularity</option>
            <option value="price-low">Low to High</option>
            <option value="price-high">High to Low</option>
          </select>
          <input type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 mt-3 border pl-3 text-sm rounded" />
          {(search || category) && <button onClick={clearFilters} className="mt-3 text-xs text-[#2874f0] font-bold">CLEAR ALL</button>}
        </aside>
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-4 border-b flex justify-between"><h1 className="font-bold text-sm">{activeLabel} - {filteredProducts.length} items</h1></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#f1f3f6]">
            {filteredProducts.map((product) => {
              const hasStock = Number(product.stock)!== 0;
              const price = Number(product.price || 0);
              return (
                <div key={product.id} className="bg-white p-3 flex flex-col">
                  <Link to={`/products/${product.id}`}><img src={getProductImage(product)} alt={product.name} className="h- w-full object-contain" /><h3 className="text-sm mt-2 line-clamp-2">{product.name}</h3><div className="font-bold mt-1">₹{price.toLocaleString("en-IN")}</div></Link>
                  <button disabled={!hasStock || addingId === product.id} onClick={() => handleAddToCart(product)} className="mt-3 h-8 bg-[#ff9f00] text-white rounded text-xs font-bold">{addingId === product.id? "ADDING..." : "ADD TO CART"}</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Products;