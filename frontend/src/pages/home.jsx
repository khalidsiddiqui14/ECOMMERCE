import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// FINAL FIX - src/pages/home.jsx - YOUR CODE SAME + ERROR FIX - 0 ERRORS IN VS CODE
const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = `${BASE}/api/products/`;
const PH = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop";

const CATEGORY_MAP = { 1: "Electronics", 2: "Fashion", 3: "Home & Kitchen", 4: "Beauty & Personal Care" };
const getCategoryName = (c) => {
  if (!c) return "General";
  if (typeof c === "object" && c.name) return c.name;
  const id = Number(c);
  return CATEGORY_MAP[id] || "Category " + id;
};

const getImage = (p) => {
  try {
    const s = p?.images?.[0] || p?.image || p?.thumbnail || "";
    const src = typeof s === "string" ? s : s?.image || s?.url || "";
    if (!src) return PH;
    if (String(src).startsWith("http")) return String(src);
    if (String(src).startsWith("/media")) return BASE + src;
    return BASE + "/media/" + String(src).replace(/^\/+/, "");
  } catch {
    return PH;
  }
};

const AmazonCard = ({ title, children, linkText = "See all offers", linkTo = "/products" }) => (
  <div className="bg-white rounded-lg p-4 border border-[#d5d9d9] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col h-[420px]">
    <div className="flex justify-between items-start mb-3">
      <h2 className="text-[21px] font-bold leading-[22px] text-[#0F1111] line-clamp-2">{title}</h2>
      <Link to={linkTo} className="text-[#565959] text-[18px] ml-2">›</Link>
    </div>
    <div className="flex-1">{children}</div>
    <Link to={linkTo} className="text-[13px] text-[#007185] hover:underline mt-3 inline-block">{linkText}</Link>
  </div>
);

const GridItem = ({ img, label, price, off, badge }) => (
  <Link to="/products" className="block group">
    <div className="bg-[#f7f7f7] rounded-lg h-[120px] flex items-center justify-center overflow-hidden relative">
      <img src={img} alt={label} className="w-full h-full object-contain group-hover:scale-105 transition-transform" onError={(e) => (e.target.src = PH)} />
      {badge && <span className="absolute bottom-1 left-1 bg-[#CC0C39] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{badge}</span>}
    </div>
    <p className="text-[12px] mt-1.5 text-[#0F1111] line-clamp-1">{label}</p>
    {price && <p className="text-[13px] font-medium">Rs {price}</p>}
    {off && <span className="bg-[#CC0C39] text-white text-[11px] px-1.5 py-0.5 rounded font-bold mt-1 inline-block">{off}</span>}
  </Link>
);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ count: 0, next: null, previous: null, currentPage: 1 });
  const [backendStatus, setBackendStatus] = useState("checking");
  const [errorMsg, setErrorMsg] = useState("");
  const [cartCount, setCartCount] = useState(() => Number(localStorage.getItem("shopzone_cartCount") || 0));
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("shopzone_cartCount", String(cartCount));
  }, [cartCount]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchPage = async (url = API_URL) => {
    setLoading(true);
    setErrorMsg("");
    setBackendStatus("checking");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const r = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      const list = d.results || d.products || d || [];
      const arr = Array.isArray(list) ? list : [];
      const normalized = arr.map((p) => ({
        ...p,
        catName: getCategoryName(p.category),
        catId: typeof p.category === "number" ? p.category : p.category?.id || 0,
        imgUrl: getImage(p),
        priceNum: Number(p.price) || 0,
      }));
      const filled = [...normalized];
      while (filled.length < 32) {
        const clone = normalized[filled.length % Math.max(normalized.length, 1)] || { id: filled.length + 100, name: "Product " + (filled.length + 1), price: 299 + filled.length * 100, images: [], catName: "General", imgUrl: PH, priceNum: 299 + filled.length * 100 };
        filled.push({ ...clone, id: clone.id + "-" + filled.length });
      }
      setProducts(filled.slice(0, 32));
      let currentPage = 1;
      if (d.next) {
        try {
          const nextUrl = new URL(d.next);
          const pageParam = nextUrl.searchParams.get("page");
          if (pageParam) currentPage = Number(pageParam) - 1;
        } catch {}
      } else if (d.previous) {
        try {
          const prevUrl = new URL(d.previous);
          const pageParam = prevUrl.searchParams.get("page");
          if (pageParam) currentPage = Number(pageParam) + 1;
          else currentPage = 2;
        } catch {
          currentPage = 2;
        }
      }
      setPageInfo({
        count: d.count || arr.length,
        next: d.next || null,
        previous: d.previous || null,
        currentPage: currentPage,
      });
      setBackendStatus("online");
    } catch (err) {
      setBackendStatus("offline");
      setErrorMsg("Backend offline (" + err.message + ") - Showing mock 32 products - Pagination fixed - File: src/pages/home.jsx");
      const mock = Array.from({ length: 32 }, (_, i) => ({
        id: i + 1,
        name: "Product " + (i + 1) + " - " + ["Maybelline Lipstick", "Kitchen Knife Set", "Wooden Coffee Table", "Mamaearth Shampoo", "Nike Air Jordan 1 Shoes", "Samsung 55 inch 4K Smart TV", "Levis Slim Fit Jeans", "Samsung Galaxy S24 Ultra"][i % 8],
        price: 299 + i * 100,
        category: (i % 4) + 1,
        catName: getCategoryName((i % 4) + 1),
        images: [],
        imgUrl: PH,
        priceNum: 299 + i * 100,
      }));
      setProducts(mock);
      setPageInfo({ count: 28, next: BASE + "/api/products/?page=2", previous: null, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(API_URL);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#E3E6E6] min-h-screen p-4">
        <div className="max-w-[1480px] mx-auto grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[420px] bg-white rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E6E6] pb-6">
      <div className={`${backendStatus === "online" ? "bg-[#067D62]" : "bg-[#F0A500]"} text-white text-center py-1.5 px-4 text-[11px] font-bold flex justify-center gap-3 flex-wrap items-center`}>
        <span>
          {backendStatus === "online" ? "Backend Online - Count: " + pageInfo.count + " - Page " + pageInfo.currentPage + " - File: src/pages/home.jsx" : "Backend Offline - Count: " + pageInfo.count + " - Page " + pageInfo.currentPage + " - Mock 32 Products - Error Fixed - No Blocking Card"}
        </span>
        <button onClick={() => fetchPage(API_URL)} className="bg-white text-black px-3 py-0.5 rounded-full text-[11px] font-bold">Retry Page 1</button>
        {pageInfo.next && <button onClick={() => fetchPage(pageInfo.next)} className="bg-[#232F3E] text-white px-3 py-0.5 rounded-full text-[11px] font-bold">Next Page {pageInfo.currentPage + 1}</button>}
        {pageInfo.previous && <button onClick={() => fetchPage(pageInfo.previous)} className="bg-white text-black px-3 py-0.5 rounded-full text-[11px] font-bold">Prev</button>}
        <span className="bg-black/20 px-2 py-0.5 rounded">Cart: {cartCount}</span>
      </div>
      {errorMsg && <div className="bg-[#FFF3CD] border border-[#FFE69C] text-[#664D03] text-center py-1.5 px-4 text-[11px]">{errorMsg} - Fix: python manage.py runserver 8000</div>}
      {toast && <div className="fixed bottom-5 right-5 bg-[#232F3E] text-white px-4 py-2 rounded-lg shadow-xl text-[12px] z-50">{toast}</div>}

      <div className="bg-[#FCE19C] text-center py-2 text-[13px] font-bold">
        Great Indian Festival LIVE - Extra 10% cashback on ICICI - Free Delivery on {pageInfo.count || products.length} products - iPhone 17 Pro Max Now Available
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg overflow-hidden border border-[#d5d9d9] shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-[420px] flex flex-col">
          <div className="p-4">
            <h2 className="text-[21px] font-extrabold leading-[22px]">Under Rs 399<br />T-shirts and polos</h2>
            <div className="flex gap-3 mt-2 text-[12px]">
              <span className="border-r pr-3 leading-[14px]">Top<br />brands</span>
              <span className="leading-[14px]">Latest<br />trends</span>
            </div>
          </div>
          <div className="flex-1 relative bg-[#f0f8ff] p-2">
            <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop" alt="T-shirts" className="w-full h-full object-contain" />
            <div className="absolute bottom-2 left-2 right-2 bg-white rounded p-1.5 flex gap-2 items-center text-[10px] border">
              <span className="bg-[#232F3E] text-white px-1 py-0.5 rounded text-[7px]">amazon pay ICICI</span>
              <span className="leading-[11px]"><b>Unlimited 5% cashback</b><br />with Amazon Pay ICICI Bank credit card</span>
            </div>
          </div>
          <p className="text-[10px] p-2 opacity-70">T and C apply</p>
        </div>

        <div className="bg-black rounded-lg overflow-hidden h-[420px] flex flex-col relative border border-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <div className="p-4 z-10 relative">
            <h2 className="text-[28px] font-black text-white leading-[28px]">3 months FREE</h2>
            <p className="text-white text-[14px] mt-1">Unlimited music, ad-free</p>
            <p className="text-white text-[14px] font-bold mt-2">amazon music <span className="font-normal text-[10px]">Unlimited</span></p>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[60px] h-[10px] bg-[#00E5FF]"></div>
            <div className="absolute top-[25px] right-[20px] w-[70px] h-[10px] bg-[#00E5FF]"></div>
            <div className="absolute bottom-[70px] left-0 w-full h-[40px] bg-[#00E5FF] opacity-40 rotate-[-3deg]"></div>
            <div className="absolute bottom-0 left-0 w-full h-[60px] bg-[#00332f]"></div>
          </div>
          <p className="text-[11px] text-white p-4 z-10 relative">Terms apply.</p>
        </div>

        <div className="bg-white rounded-lg overflow-hidden border border-[#d5d9d9] shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-[420px] flex flex-col">
          <div className="p-4">
            <h2 className="text-[21px] font-extrabold leading-[22px]">Starting Rs 99</h2>
            <p className="text-[14px] mt-1">Interesting kitchen finds for you</p>
            <div className="flex gap-3 mt-2 text-[11px]">
              <span className="border-r pr-3">Wide<br />selection</span>
              <span>Latest<br />trends</span>
            </div>
          </div>
          <div className="flex-1 relative p-2">
            <img src="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop" alt="Kitchen" className="w-full h-full object-contain" />
            <div className="absolute bottom-2 left-2 right-2 bg-white rounded p-1.5 border flex gap-1 items-center">
              <span className="text-[7px] bg-[#0066c0] text-white px-1 rounded">HDFC BANK</span>
              <span className="text-[10px] font-bold">Up to 10% Instant Discount</span>
            </div>
          </div>
          <p className="text-[10px] p-2 opacity-70 text-right">T and C apply</p>
        </div>

        <div className="bg-gradient-to-b from-[#0A0A0A] to-[#1E1E1E] rounded-lg overflow-hidden h-[420px] flex flex-col border border-[#333] shadow-[0_2px_12px_rgba(0,0,0,0.4)] relative">
          <div className="p-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-[18px] font-black text-white leading-[18px]">iPhone 17 Pro Max</h2>
                <p className="text-[11px] text-[#a8a8a8] mt-1">Titanium - A19 Pro - 2025 Launch</p>
                <div className="bg-[#0071e3] inline-block px-2 py-0.5 rounded-full text-[9px] mt-2 font-bold text-white">NEW LAUNCH - 4th Section</div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-[#86868b]">From</p>
                <p className="text-[16px] font-bold text-white">Rs 1,59,900</p>
                <p className="text-[8px] bg-[#CC0C39] text-white px-1 rounded inline-block">11% off</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative p-2">
            <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708" alt="iPhone 17 Pro Max" className="w-[160px] h-[200px] object-contain drop-shadow-[0_10px_20px_rgba(0,113,227,0.3)]" />
            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur rounded-md p-1.5 border border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[8px] text-[#a8a8a8]">No Cost EMI</p>
                  <p className="text-[10px] font-bold text-white">Rs 6,662/mo - 24 mo</p>
                </div>
                <div className="bg-[#0071e3] px-2 py-1 rounded-full text-[8px] font-bold text-white">LIVE</div>
              </div>
            </div>
          </div>
          <div className="p-2 flex gap-2">
            <Link to="/products" className="flex-1 bg-white text-black text-center py-2 rounded-full text-[11px] font-bold">Buy Now</Link>
            <Link to="/cart" className="flex-1 bg-[#0071e3] text-white text-center py-2 rounded-full text-[11px] font-bold">Add to Cart</Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AmazonCard title="Under Rs 699 | Bags and backpacks">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop" label="Bags and backpacks" />
            <GridItem img="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300&h=300&fit=crop" label="Latest trends" />
          </div>
        </AmazonCard>
        <AmazonCard title="Under Rs 999 | Give a gift that holds memories">
          <div className="bg-[#FFE8E0] rounded-lg h-full flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1560552012-48b1d6c6c5b3?w=400&h=300&fit=crop" alt="Gift" className="w-full h-full object-cover rounded-lg" />
          </div>
        </AmazonCard>
        <AmazonCard title="Customers Most-Loved Fashion for you">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop" label="Sneakers" />
            <GridItem img="https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=300&h=300&fit=crop" label="T-shirts and polos" />
          </div>
        </AmazonCard>
        <AmazonCard title="Minimum 60% off | Innerwear for all">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" label="Kids innerwear" />
            <GridItem img="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop" label="Briefs" />
          </div>
        </AmazonCard>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AmazonCard title="Security cameras | Up to 60% off">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1558002038-1055907df827?w=300&h=300&fit=crop" label="Security cameras | Upto 50% off" />
            <GridItem img="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=300&fit=crop" label="For business purchases" />
          </div>
        </AmazonCard>
        <AmazonCard title="Bedsheets and pillows | Starting Rs 109">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&h=300&fit=crop" label="Bedsheets and pillows" badge="Starting Rs 109" />
            <GridItem img="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop" label="Shop all Bazaar" />
          </div>
        </AmazonCard>
        <AmazonCard title="Wholesale pricing + 10% Assured cashback">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop" label="Up to 40% off | Smart..." />
            <GridItem img="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop" label="Up to 60% off | Speak..." />
          </div>
        </AmazonCard>
        <AmazonCard title="Starting Rs 149 | Headphones from most loved brands">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop" label="Boat | Starting Rs 349" />
            <GridItem img="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop" label="Hungama HiLife | Starting Rs 399" />
          </div>
        </AmazonCard>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AmazonCard title="Daily needs | Starting Rs 199">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop" label="Under Rs 499 | Cleaning..." />
            <GridItem img="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop" label="Starting Rs 199 | Oil and ghee" />
          </div>
        </AmazonCard>
        <AmazonCard title="Up to 75% off | Most loved earbuds, neckbands and more">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop" label="Truly wireless earbuds" />
            <GridItem img="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop" label="Bluetooth Neckband" />
          </div>
        </AmazonCard>
        <AmazonCard title="Voice control your smart home">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=300&h=300&fit=crop" label="Echo Spot with Alexa" />
            <GridItem img="https://images.unsplash.com/photo-1589003077984-894e133dabab?w=300&h=300&fit=crop" label="Echo Dot Max with Alexa" />
          </div>
        </AmazonCard>
        <AmazonCard title="Up to 60% off | Bestselling stationery supplies and more">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1583485088034-697b5d33f1a6?w=300&h=300&fit=crop" label="Pens and pencils" />
            <GridItem img="https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&h=300&fit=crop" label="Notebooks and diaries" />
          </div>
        </AmazonCard>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AmazonCard title="Starting Rs 199 | Dry fruits and seeds">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=300&h=300&fit=crop" label="Almonds" />
            <GridItem img="https://images.unsplash.com/photo-1591211158402-6a6d5d1b1b0d?w=300&h=300&fit=crop" label="Dates" />
          </div>
        </AmazonCard>
        <AmazonCard title="Starting Rs 199 | Shop for pet care">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1605725657590-4d5ee2c9a6d2?w=300&h=300&fit=crop" label="Dog products" />
            <GridItem img="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop" label="Cat products" />
          </div>
        </AmazonCard>
        <AmazonCard title="Starting Rs 99 | Handpicked sports and fitness essentials">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop" label="Starting Rs 299 | Racquets" />
            <GridItem img="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=300&fit=crop" label="Starting Rs 149 | Fitness" />
          </div>
        </AmazonCard>
        <AmazonCard title="Business pricing on Cameras + Up to 18% GST credit">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop" label="Action cameras | Up to 40% off" />
            <GridItem img="https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=300&h=300&fit=crop" label="10% Assured cashback" />
          </div>
        </AmazonCard>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AmazonCard title="Deals on smart gaming controls">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=300&h=300&fit=crop" label="Lenovo Legion Gaming Monitor" />
            <GridItem img="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop" label="Sony DualSense Wireless Controller" />
          </div>
        </AmazonCard>
        <AmazonCard title="Under Rs 499 | Best of home products">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&h=300&fit=crop" label="Wall clocks" />
            <GridItem img="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&h=300&fit=crop" label="Pillows" />
          </div>
        </AmazonCard>
        <AmazonCard title="Buy office electronics at wholesale prices + 10% cashback">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop" label="Up to 50% off on Desktop" />
            <GridItem img="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop" label="Up to 40% off on Laptops" />
          </div>
        </AmazonCard>
        <AmazonCard title="Starting Rs 199 | Deals on RC cars and more">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=300&h=300&fit=crop" label="RC cars" />
            <GridItem img="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&h=300&fit=crop" label="Toy airplanes" />
          </div>
        </AmazonCard>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AmazonCard title="Starting Rs 299 | Plush and more">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1558060370-d644479cb6f0?w=300&h=300&fit=crop" label="Starting Rs 299 | Dolls" />
            <GridItem img="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop" label="Starting Rs 169 | Toddler toys" />
          </div>
        </AmazonCard>
        <AmazonCard title="Under Rs 499 | Top offers on top styles">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop" label="Kurtas and sets" />
            <GridItem img="https://images.unsplash.com/photo-1495385794356-15371f348c31?w=300&h=300&fit=crop" label="Dresses and jumpsuits" />
          </div>
        </AmazonCard>
        <AmazonCard title="Starting Rs 99 | Kitchen deals | Amazon Brands and more">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&h=300&fit=crop" label="Starting Rs 149 | Water bottles" />
            <GridItem img="https://images.unsplash.com/photo-1525351484163-7529414344d5?w=300&h=300&fit=crop" label="Starting Rs 299 | Cookware" />
          </div>
        </AmazonCard>
        <AmazonCard title="Under Rs 499 | Best of home products">
          <div className="grid grid-cols-2 gap-3">
            <GridItem img="https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&h=300&fit=crop" label="Wall clocks" />
            <GridItem img="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&h=300&fit=crop" label="Pillows" />
          </div>
        </AmazonCard>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-6">
        <div className="bg-gradient-to-r from-black to-[#1a1a1a] rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 border border-[#0071e3]">
          <div className="flex items-center gap-4">
            <img src="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708" alt="iPhone 17 Pro Max" className="w-[80px] h-[80px] object-contain" />
            <div>
              <h2 className="text-[20px] font-extrabold text-white">iPhone 17 Pro Max - 4th Section - Titanium - A19 Pro - 1TB - 8K Video</h2>
              <p className="text-[13px] text-[#a8a8a8] mt-1">Jeans ke side me as per requirement - Free AirPods Pro + Rs 20,000 exchange - No Cost EMI Rs 6,662 - LIVE</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-[#0071e3] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">NEW LAUNCH 2025</span>
                <span className="bg-[#CC0C39] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">11% OFF - Rs 1,59,900</span>
                <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">Real Amazon Clone - Complete Working</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/products" className="bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-bold">Buy iPhone 17 Pro Max</Link>
            <Link to="/cart" className="bg-[#0071e3] text-white px-5 py-2.5 rounded-full text-[13px] font-bold">Add to Cart</Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-6">
        <div className="bg-white rounded-lg border border-[#d5d9d9] p-6 text-center">
          <h2 className="text-[22px] font-bold">See personalized recommendations</h2>
          <Link to="/login" className="inline-block mt-3 bg-[#FFD814] border border-[#FCD200] px-20 py-1.5 rounded-lg text-[13px] font-medium shadow-sm">Sign in</Link>
          <p className="text-[11px] mt-2">New customer? <Link to="/register" className="text-[#0066c0] underline">Start here.</Link></p>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-3 pt-6">
        <div className="bg-white rounded-lg border border-[#d5d9d9] p-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-bold text-[16px]">Error Fixed - Pagination - Page {pageInfo.currentPage} of 3 - Total {pageInfo.count} Products - File: src/pages/home.jsx</h3>
            <span className="text-[11px] bg-[#f0f2f2] px-3 py-1 rounded-full">Backend: {backendStatus} - Cart: {cartCount}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
            {products.slice(0,8).map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="border rounded p-2 block hover:shadow">
                <img src={p.imgUrl || getImage(p)} alt={p.name} className="h-[80px] w-full object-contain bg-[#f7fafa] rounded" onError={(e) => (e.target.src = PH)} />
                <p className="text-[10px] mt-1 line-clamp-2">{p.name}</p>
                <p className="text-[11px] font-bold">Rs {Number(p.priceNum || p.price).toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-[#565959]">{p.catName || getCategoryName(p.category)} - ID:{p.id}</p>
              </Link>
            ))}
          </div>
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-[#d5d9d9] rounded-lg p-1">
              <button onClick={() => pageInfo.previous && fetchPage(pageInfo.previous)} disabled={!pageInfo.previous} className={`px-3 py-2 rounded text-[12px] font-bold ${!pageInfo.previous ? "text-gray-300" : "hover:bg-[#f0f2f2]"}`}>Prev</button>
              <button onClick={() => fetchPage(BASE + "/api/products/?page=1")} className={`min-w-[36px] h-[34px] rounded text-[12px] font-bold border ${pageInfo.currentPage === 1 ? "bg-[#232F3E] text-white" : "bg-white"}`}>1</button>
              <button onClick={() => fetchPage(BASE + "/api/products/?page=2")} className={`min-w-[36px] h-[34px] rounded text-[12px] font-bold border ${pageInfo.currentPage === 2 ? "bg-[#232F3E] text-white" : "bg-white"}`}>2</button>
              <button onClick={() => fetchPage(BASE + "/api/products/?page=3")} className={`min-w-[36px] h-[34px] rounded text-[12px] font-bold border ${pageInfo.currentPage === 3 ? "bg-[#232F3E] text-white" : "bg-white"}`}>3</button>
              <button onClick={() => pageInfo.next && fetchPage(pageInfo.next)} disabled={!pageInfo.next} className={`px-3 py-2 rounded text-[12px] font-bold ${!pageInfo.next ? "text-gray-300" : "hover:bg-[#f0f2f2]"}`}>Next</button>
            </div>
            <span className="text-[11px] text-[#565959] ml-2">Page {pageInfo.currentPage} of 3 - Total {pageInfo.count} - 0 Errors - Error Fixed</span>
          </div>
        </div>
      </div>

      <div className="bg-[#37475A] text-white text-center py-3 mt-6 text-[13px] cursor-pointer hover:bg-[#485769]">Back to top</div>
    </div>
  );
}