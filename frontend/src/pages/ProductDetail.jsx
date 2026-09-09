import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getProduct, getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import { toggleWishlist, isInWishlist } from "../services/wishlistService";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const resolveImage = (img) => {
  try {
    if (!img) return "";
    let s = typeof img === "string"? img : img.image || img.url || img.src || img.file || "";
    if (!s) return "";
    s = String(s).trim();
    if (s.startsWith("http")) return s;
    if (s.startsWith("blob:")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    if (s.startsWith("media/")) return `${BASE}/${s}`;
    if (s.startsWith("/")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      setProduct(null);
      setImgError(false);
      setQuantity(1);
      setActiveImg(0);
      try {
        const data = await getProduct(id);
        if (!data) throw new Error("Product not found");
        if (!cancelled) {
          setProduct(data);
          setSelectedVariant(data.variants?.[0] || null);
          try { const exists = await isInWishlist(data.id || id); setInWishlist(!!exists); } catch {}
          try {
            const cat = data.category?.id || data.category_id || data.category;
            if (cat) {
              const r = await getProducts({ category: cat, page_size: 6 });
              const list = r.results || r.products || r || [];
              setRelated(Array.isArray(list)? list.filter(p=> String(p.id)!==String(data.id)).slice(0,4) : []);
            }
          } catch {}
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || "Product load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const stock = Number(product?.stock?? product?.quantity?? 0);
  const hasStock = stock>0 || product?.in_stock===true || product?.is_in_stock===true || product?.stock_status==="in_stock";

  const handleAddToCart = async (buyNow=false) => {
    if (!product ||!hasStock || adding) return;
    const q = Number(quantity)||1;
    if (q<1 || (stock>0 && q>stock)) { setError(`Only ${stock} left in stock`); return; }
    setAdding(true); setError(""); setSuccess("");
    try {
      await addToCart(product.id, q, selectedVariant?.id);
      setSuccess(`${q} item added to Cart • Prime FREE delivery`);
      window.dispatchEvent(new Event("cart-change"));
      if (buyNow) navigate("/checkout");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Add to cart failed");
    } finally { setAdding(false); }
  };

  const handleWishlist = async () => {
    if (!product || wishLoading) return;
    setWishLoading(true);
    try {
      const res = await toggleWishlist(product.id);
      setInWishlist(res.inWishlist?? res.in_wishlist??!inWishlist);
      window.dispatchEvent(new Event("wishlist-change"));
    } catch (err) {
      setError(err.response?.data?.detail || "Wishlist failed");
    } finally { setWishLoading(false); }
  };

  const checkDelivery = () => {
    if (!pincode || pincode.length!==6) { setDeliveryMsg("Enter valid 6-digit pincode like 110059"); return; }
    const d = new Date(Date.now()+24*3600*1000);
    setDeliveryMsg(`✓ FREE delivery by Tomorrow, ${d.toLocaleDateString("en-IN",{weekday:"short", day:"2-digit", month:"short"})} • COD available • 10 days Returnable • Pincode: ${pincode} • Prime`);
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-2">
          <div className="bg-white h- animate-pulse rounded- border border-[#d5d9d9]" />
          <div className="bg-white h- animate-pulse rounded- border border-[#d5d9d9]" />
        </div>
      </div>
    );
  }

  if (error &&!product) {
    return (
      <div className="bg-[#EAEDED] min-h-screen grid place-items-center p-4">
        <div className="bg-white p-8 rounded- shadow-sm text-center max-w- w-full border border-[#d5d9d9]">
          <div className="text-">😕</div>
          <h2 className="font-bold text- mt-2">Product Not Found</h2>
          <p className="text- text-[#565959] mt-2">{error}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={()=>window.location.reload()} className="bg-[#FFD814] border border-[#FCD200] px-6 h-9 rounded- text- font-bold shadow-sm">Try Again</button>
            <Link to="/products" className="border border-[#d5d9d9] px-6 h-9 grid place-items-center rounded- text- bg-white shadow-sm">Back to Products</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const rawImages = Array.isArray(product.images)&&product.images.length>0? product.images : product.image? [product.image] : [];
  const resolvedImages = rawImages.map(resolveImage).filter(Boolean);
  const images = resolvedImages.length>0? resolvedImages : [PLACEHOLDER];
  const primaryImage = images[activeImg] || images[0];

  const price = Number(selectedVariant?.price || product.price || 0);
  const mrp = Number(product.original_price || product.mrp || product.compare_price || (price*1.25));
  const discount = mrp>price? Math.round((1-price/mrp)*100) : 0;
  const rating = Number(product.rating || product.avg_rating || 4.5);
  const reviews = Number(product.review_count || product.num_reviews || 2456);
  const category = product.category_name || product.category?.name || (typeof product.category==="string"? product.category : "General");

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-6">
      <div className="bg-white border-b border-[#ddd] sticky top-0 z-10">
        <div className="max-w- mx-auto px-3 h-10 flex items-center gap-2 text- text-[#565959] overflow-hidden">
          <Link to="/" className="hover:text-[#C45500] hover:underline">Home</Link><span>›</span>
          <Link to="/products" className="hover:text-[#C45500] hover:underline">Products</Link><span>›</span>
          <Link to={`/category/${String(category).toLowerCase()}`} className="hover:text-[#C45500] hover:underline truncate">{category}</Link><span>›</span>
          <span className="text-[#0F1111] truncate max-w-">{product.name}</span>
        </div>
      </div>

      <div className="max-w- mx-auto px-2 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-2 items-start">
          <div className="bg-white p-3 md:p-4 shadow-sm rounded- border border-[#d5d9d9]">
            <div className="grid grid-cols-1 md:grid-cols-[72px_1fr_1fr] gap-4">
              <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-1">
                {images.map((src,i)=>(
                  <button key={i} onClick={()=>{ setActiveImg(i); setImgError(false); }} className={`w-14 h-14 border p-1 shrink-0 rounded- bg-white ${activeImg===i? 'border-[#e77600] shadow-[0_0_3px_#e77600] ring-1 ring-[#e77600]' : 'border-[#d5d9d9] hover:border-[#e77600]'}`}>
                    <img src={src} alt={`thumb ${i}`} className="w-full h-full object-contain" onError={(e)=> e.currentTarget.src = PLACEHOLDER} />
                  </button>
                ))}
              </div>

              <div className="h- md:h- grid place-items-center order-1 md:order-2 relative bg-white border border-[#f0f2f2] rounded- p-2">
                {!imgError? (
                  <img src={primaryImage} alt={product.name} onError={()=>setImgError(true)} className="max-h-full max-w-full object-contain hover:scale-[1.02] transition" />
                ) : (
                  <div className="grid place-items-center text-center">
                    <span className="text-">📦</span>
                    <img src={PLACEHOLDER} alt="fallback" className="w-40 h-40 object-contain opacity-60 mt-2" />
                  </div>
                )}
                {discount>0 && <span className="absolute top-2 left-2 bg-[#CC0C39] text-white text- font-bold px-2 py-1 rounded-">{discount}% OFF • Deal • Prime</span>}
                {hasStock && <span className="absolute bottom-2 right-2 bg-[#067D62] text-white text- px-2 py-0.5 rounded-full font-bold">Prime ✓ FREE</span>}
              </div>

              <div className="order-3">
                <h1 className="text- md:text- leading- text-[#0F1111] font-normal">{product.name}</h1>
                <div className="text- text-[#007185] mt-1 hover:text-[#C45500] cursor-pointer hover:underline">Visit the {category} Store • Brand: {product.brand || "ShopZone"} • Seller: ShopZone Retail</div>

                <div className="flex items-center gap-2 mt-2 text- flex-wrap">
                  <span className="flex items-center gap-0.5">
                    <span className="text-[#e47911] text-">{"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))}</span>
                    <span className="text-[#007185] hover:underline cursor-pointer ml-1">{rating.toFixed(1)}</span>
                  </span>
                  <span className="text-[#007185] hover:underline cursor-pointer">{reviews.toLocaleString()} ratings</span>
                  <span className="text-[#565959]">|</span>
                  <span className="text-[#007185] hover:underline cursor-pointer">500+ answered questions</span>
                </div>

                <hr className="my-3 border-[#e7e7e7]" />
                <div className="flex items-baseline gap-2 flex-wrap">
                  {discount>0 && <span className="text-[#CC0C39] text- font-light">- {discount}%</span>}
                  <span className="text- font-medium text-[#0F1111]">₹{price.toLocaleString("en-IN")}</span>
                  <span className="text-">.00</span>
                </div>
                <div className="text- text-[#565959]">M.R.P: <span className="line-through">₹{mrp.toLocaleString("en-IN")}</span> • Inclusive of all taxes • <span className="text-[#067D62] font-bold">Prime FREE</span></div>
                <div className="mt-2 text-"><span className="bg-[#067D62] text-white px-1.5 py-0.5 rounded- text- font-bold">Prime</span> <span className="text-[#067D62] font-bold">FREE delivery</span> Tomorrow by 9 PM • <b>Fulfilled</b> • EMI from ₹{Math.round(price/12)}/mo</div>

                {product.variants && product.variants.length>0 && (
                  <div className="mt-4">
                    <div className="text- font-bold">Style: <span className="font-normal">{selectedVariant?.name || product.variants[0].name || "Default"}</span></div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {product.variants.map((v,i)=>(
                        <button key={v.id || i} onClick={()=>setSelectedVariant(v)} className={`border px-3 py-1.5 rounded- text- font-medium ${selectedVariant?.id===v.id? 'border-[#e77600] bg-[#fef8f2] ring-1 ring-[#e77600]' : 'border-[#d5d9d9] hover:border-[#e77600] bg-white'}`}>
                          {v.name} {v.price? `₹${v.price}` : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text- leading- text-[#0F1111]">
                  <b>About this item:</b>
                  <p className="mt-1 text- text-[#565959] line-clamp-6 leading-">{product.description || "Premium quality product with 1 year manufacturer warranty, fast Prime delivery across India. 10 days replacement, cash on delivery, EMI available, GST invoice, made in India. Secure transaction."}</p>
                  <Link to="#details" className="text- text-[#0066c0] hover:underline mt-1 inline-block">See more product details</Link>
                </div>

                <div className="mt-4 border border-[#d5d9d9] rounded- p-2.5 flex gap-2 bg-white">
                  <input value={pincode} onChange={e=>setPincode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="Enter pincode 110059" className="flex-1 border border-[#888] rounded- px-2 h-8 text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_#e77600]" />
                  <button onClick={checkDelivery} className="h-8 px-4 border border-[#d5d9d9] rounded- text- bg-white hover:bg-[#f0f2f2] shadow-sm">Check</button>
                </div>
                {deliveryMsg && <div className="mt-2 text- text-[#067D62] bg-[#E8F6EF] border border-[#A4D4AE] p-2 rounded- leading-">{deliveryMsg}</div>}

                {hasStock && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text- font-bold">Quantity:</span>
                    <div className="flex items-center border border-[#d5d9d9] rounded- overflow-hidden h-8 shadow-sm bg-white">
                      <button onClick={()=>setQuantity(c=>Math.max(1,(Number(c)||1)-1))} className="w-8 bg-[#f0f2f2] hover:bg-[#e7e9ec] text- h-full grid place-items-center">−</button>
                      <input type="number" value={quantity} onChange={e=>{ const v=e.target.value; if(v==="") {setQuantity(""); return;} const num=Number(v); if(Number.isInteger(num)&&num>=1&& (stock===0||num<=stock)) setQuantity(num); }} className="w-12 text-center border-x border-[#d5d9d9] outline-none text- h-full" />
                      <button onClick={()=>setQuantity(c=> stock>0? Math.min(stock,(Number(c)||1)+1) : (Number(c)||1)+1)} className="w-8 bg-[#f0f2f2] hover:bg-[#e7e9ec] text- h-full grid place-items-center">+</button>
                    </div>
                    <span className="text- text-[#067D62] font-bold">{stock>0? `${stock} left - order soon • Prime` : "In stock • Prime"}</span>
                  </div>
                )}

                {error && <div className="mt-3 text- text-[#CC0C39] border border-[#CC0C39]/30 p-2 rounded- bg-[#FFF6F6]">⚠ {error}</div>}
                {success && <div className="mt-3 text- text-[#067D62] bg-[#E8F6EF] border border-[#A4D4AE] p-2 rounded- flex justify-between items-center">{success} <Link to="/cart" className="text-[#007185] font-bold underline ml-2">Go to Cart →</Link></div>}
              </div>
            </div>

            <div id="details" className="mt-6 border-t border-[#e7e7e7] pt-4">
              <h3 className="font-bold text-">Customer Reviews • {rating} ★ • {reviews.toLocaleString()} ratings • Prime Verified Purchase</h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text- space-y-1.5">
                  {[5,4,3,2,1].map(s=>(
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-[#007185] w-12 text- hover:underline cursor-pointer">{s} star</span>
                      <div className="flex-1 h-4 bg-[#f0f2f2] border border-[#d5d9d9] rounded- overflow-hidden"><div className="h-full bg-[#FFA41C]" style={{width: `${s===5?70:s===4?20:s===3?6:s===2?2:2}%`}} /></div>
                      <span className="text-[#007185] w-8 text-">{s===5?70:s===4?20:s*2}%</span>
                    </div>
                  ))}
                  <Link to="#reviews" className="text- text-[#0066c0] hover:underline inline-block mt-2">See all {reviews} reviews →</Link>
                </div>
                <div className="md:col-span-2 text- text-[#565959] bg-[#f7fafa] border border-[#f0f2f2] rounded- p-3">
                  <b className="text-[#0F1111]">Top reviews from India</b><br/>
                  <span className="text-[#e47911]">★★★★★</span> <b>Great quality, fast Prime delivery, value for money.</b> Highly recommended! Product exactly as described. 10/10 for packaging and delivery. Will buy again. — Verified Purchase • Prime Member • Delhi
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 shadow-sm border border-[#d5d9d9] rounded- sticky top- h-fit">
            <div className="text- font-medium text-[#0F1111]">₹{price.toLocaleString("en-IN")}<span className="text-">.00</span> {discount>0 && <span className="ml-2 text- text-[#565959] line-through">₹{mrp.toLocaleString("en-IN")}</span>}</div>
            <div className="text- text-[#565959] mt-1 leading-">₹{(price*0.18).toFixed(0)} delivery charge waived on Prime • <span className="text-[#067D62] font-bold">FREE delivery</span> <span className="font-bold text-[#0F1111]">Tomorrow 9 AM - 9 PM</span> • Details</div>
            <div className="text- text-[#007185] mt-1 hover:underline cursor-pointer">Deliver to Delhi 110059 - Update location • Prime</div>
            <div className={`text- mt-2 font-medium ${hasStock? 'text-[#067D62]' : 'text-[#CC0C39]'}`}>{hasStock? '✓ In stock • Ready to ship' : '✗ Currently unavailable • Notify me'}</div>
            <div className="text- text-[#565959] mt-1">Ships from: <b>ShopZone Fulfilled</b> • Sold by: <b>ShopZone Retail Pvt Ltd</b> • GST invoice</div>

            <div className="mt-3 text- bg-[#f7fafa] border border-[#f0f2f2] rounded- p-2">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#e77600]" /> Add 2-year Prime protection plan • ₹149 • 1-click</label>
              <div className="text- text-[#067D62] ml-6">✓ Accidental damage • ✓ Free replacement</div>
            </div>

            <button disabled={!hasStock || adding} onClick={()=>handleAddToCart(false)} className={`mt-4 w-full h-9 rounded- text- shadow-sm border font-medium ${hasStock? 'bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200]' : 'bg-[#f0f2f2] text-[#565959] border-[#d5d9d9] cursor-not-allowed'}`}>
              {adding? 'Adding...' : 'Add to Cart • Prime FREE'}
            </button>
            <button onClick={()=>handleAddToCart(true)} disabled={!hasStock || adding} className="mt-2 w-full h-9 rounded- bg-[#FFA41C] hover:bg-[#FA8900] text- shadow-sm border border-[#FF8F00] font-medium disabled:opacity-50">Buy Now • 1-Click • Prime</button>

            <button onClick={handleWishlist} disabled={wishLoading} className={`mt-3 w-full h-8 border rounded- text- shadow-sm flex items-center justify-center gap-1.5 ${inWishlist? 'bg-[#FFF6F6] border-[#CC0C39]/40 text-[#CC0C39]' : 'bg-white border-[#d5d9d9] hover:bg-[#f7f7f7] text-[#0F1111]'}`}>
              <span className="text-">{inWishlist? '♥' : '♡'}</span> {wishLoading? 'Adding...' : inWishlist? 'Added to Wishlist • View' : 'Add to Wishlist • Save for later'}
            </button>

            <div className="mt-4 text- text-[#565959] space-y-1.5 border-t border-[#e7e7e7] pt-3 leading-">
              <div className="flex gap-2"><span className="text-[#067D62]">✓</span> <span><b>Secure transaction</b> • UPI, Cards, NetBanking, Wallet, COD</span></div>
              <div className="flex gap-2"><span className="text-[#067D62]">✓</span> <span>Ships from & sold by ShopZone • Prime • Fulfilled by ShopZone</span></div>
              <div className="flex gap-2"><span className="text-[#067D62]">✓</span> <span>10 days Replacement • 1 Year Warranty • GST Invoice</span></div>
              <div className="flex gap-2"><span className="text-[#067D62]">✓</span> <span>Cash on Delivery • EMI from ₹{Math.round(price/12)}/mo • Pay on Delivery</span></div>
            </div>

            <div className="mt-3 flex gap-2">
              <Link to="/cart" className="flex-1 h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white hover:bg-[#f7fafa] shadow-sm">Go to Cart</Link>
              <Link to="/wishlist" className="flex-1 h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white hover:bg-[#f7fafa] shadow-sm">Wishlist ({inWishlist?1:0})</Link>
            </div>

            <div className="mt-3 text- text-center text-[#767676]">Add to Cart = Prime FREE Delivery • EMI • COD • 10 days return</div>
          </div>
        </div>

        {related.length>0 && (
          <div className="mt-4 bg-white p-4 rounded- shadow-sm border border-[#d5d9d9]">
            <h3 className="font-bold text-">Products related to this item • Customers who viewed this also viewed • Prime</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {related.map(r=>(
                <Link key={r.id} to={`/product/${r.id}`} className="border border-[#d5d9d9] rounded- p-2 hover:shadow-md hover:border-[#a6a6a6] bg-white">
                  <div className="bg-[#f7fafa] rounded- h-32 grid place-items-center"><img src={resolveImage(r.image || r.images?.[0]) || PLACEHOLDER} alt={r.name} className="h-full w-full object-contain p-1" onError={e=> e.target.src=PLACEHOLDER} /></div>
                  <div className="text- mt-2 line-clamp-2 leading- min-h- hover:text-[#C45500]">{r.name}</div>
                  <div className="text- font-bold mt-1">₹{Number(r.price||0).toLocaleString("en-IN")}</div>
                  <div className="text- text-[#067D62]">Prime FREE • 4.3 ★</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;