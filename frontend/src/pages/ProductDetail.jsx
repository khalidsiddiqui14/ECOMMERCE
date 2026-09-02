import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [wishlistSuccess, setWishlistSuccess] = useState("");
  const [imageError, setImageError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(""); setProduct(null); setImageError(false); setQuantity(1); setActiveImg(0);
      try {
        const data = await getProduct(id);
        if (!data) throw new Error("Product data was not returned.");
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || "Product load nahi ho paaya.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const stock = Number(product?.stock ?? 0);
  const hasStock = stock > 0;

  const handleQuantityChange = (e) => {
    const v = e.target.value;
    if (v === "") { setQuantity(""); return; }
    const num = Number(v);
    if (!Number.isInteger(num)) return;
    if (num < 1) { setQuantity(1); return; }
    if (num > stock) { setQuantity(stock); return; }
    setQuantity(num);
  };

  const handleDecrease = () => setQuantity(c => Math.max(1, Number(c)||1 - 1));
  const handleIncrease = () => setQuantity(c => Math.min(stock, Number(c)||1 + 1));

  const handleAddToCart = async () => {
    if (!product || !hasStock || adding) return;
    const q = Number(quantity);
    if (!Number.isInteger(q) || q < 1 || q > stock) { setError("Please select a valid quantity."); return; }
    setAdding(true); setError(""); setSuccess("");
    try {
      await addToCart(product.id, q);
      setSuccess(`${q} ${q===1?'item':'items'} cart me successfully add ho gaya.`);
    } catch (err) {
      setError(err.response?.data?.detail || "Product cart me add nahi ho paaya.");
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product || wishlistLoading) return;
    setWishlistLoading(true); setError(""); setWishlistSuccess("");
    try {
      await addToWishlist(product.id);
      setWishlistSuccess("Product wishlist me add ho gaya.");
    } catch (err) {
      setError(err.response?.data?.detail || "Product wishlist me add nahi ho paaya.");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px'}}>
        <div style={{maxWidth:1120,margin:'0 auto',display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:32}}>
          <div style={{height:520,background:'#fff',border:'1px solid #ece8de',borderRadius:24,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[1,2,3,4].map(i=>(<div key={i} style={{height:24,background:'#fff',border:'1px solid #ece8de',borderRadius:8,animation:'pulse 1.5s infinite'}} />))}
          </div>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <h2 style={{fontWeight:900}}>Product Not Found</h2>
          <p style={{color:'#8c8881'}}>{error}</p>
          <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:20}}>
            <button onClick={()=>window.location.reload()} style={{minHeight:42,padding:'0 20px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700}}>Try Again</button>
            <Link to="/products" style={{minHeight:42,padding:'0 20px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontWeight:700}}>Back to Products</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const images = Array.isArray(product.images) && product.images.length>0 ? product.images : product.image ? [product.image] : [];
  const primaryImage = images[activeImg] || images[0];
  const category = product.category_name || product.category || "Product";
  const price = Number(product.price || 0);
  const mrp = Number(product.original_price || product.mrp || price*1.25);
  const discount = mrp>price ? Math.round((1-price/mrp)*100) : 0;

  return (
    <main className="product-detail-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
      <div className="product-detail-container" style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:600,color:'#8c8881',marginBottom:20}}>
          <Link to="/" style={{color:'#8c8881'}}>Home</Link><span>/</span><Link to="/products" style={{color:'#8c8881'}}>Products</Link><span>/</span><span style={{color:'#1a1816',fontWeight:800}}>{product.name || "Product"}</span>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.15fr .85fr',gap:32,alignItems:'start'}}>
          {/* Image */}
          <div className="product-detail-image" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:24,padding:16,position:'sticky',top:88}}>
            <div style={{position:'relative',width:'100%',aspectRatio:'1/1',background:'#fafaf7',borderRadius:16,display:'grid',placeItems:'center',overflow:'hidden'}}>
              {primaryImage && !imageError ? (
                <img src={primaryImage} alt={product.name || "Product"} onError={()=>setImageError(true)} style={{width:'100%',height:'100%',objectFit:'contain',padding:20}} />
              ) : (
                <span style={{fontSize:64}}>📦</span>
              )}
              {discount>0 && <span style={{position:'absolute',top:12,left:12,padding:'6px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:11,fontWeight:800}}>{discount}% OFF</span>}
              {hasStock ? <span style={{position:'absolute',top:12,right:12,padding:'6px 10px',borderRadius:999,background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#166534',fontSize:10,fontWeight:800}}>● IN STOCK</span> : <span style={{position:'absolute',top:12,right:12,padding:'6px 10px',borderRadius:999,background:'#fef2f2',border:'1px solid #fecaca',color:'#991b1b',fontSize:10,fontWeight:800}}>OUT OF STOCK</span>}
            </div>
            {images.length>1 && (
              <div style={{display:'flex',gap:8,marginTop:12,overflowX:'auto'}}>
                {images.map((img,i)=>(
                  <button key={i} onClick={()=>setActiveImg(i)} style={{width:64,height:64,flexShrink:0,borderRadius:12,border:`1px solid ${activeImg===i ? '#1a1816' : '#ece8de'}`,background:'#fff',padding:4,overflow:'hidden',cursor:'pointer',opacity: activeImg===i ? 1 : .7}}>
                    <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info" style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#fff',border:'1px solid #ece8de',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#8c8881',marginBottom:10}}>{category}</span>
              <h1 style={{margin:'0 0 10px',fontSize:'clamp(24px,3.5vw,32px)',fontWeight:900,lineHeight:1.1,letterSpacing:'-.03em',color:'#1a1816'}}>{product.name || "Product"}</h1>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'#f59e0b',fontSize:14}}>★★★★★</span>
                <span style={{fontSize:12,fontWeight:700,padding:'2px 8px',background:'#fffbeb',borderRadius:999}}>4.8 (2.4k reviews)</span>
              </div>
            </div>

            <div style={{display:'flex',alignItems:'baseline',gap:12,flexWrap:'wrap'}}>
              <p style={{margin:0,fontSize:28,fontWeight:900,color:'#1a1816'}}>₹{price.toLocaleString("en-IN")}</p>
              {mrp>price && (
                <>
                  <span style={{fontSize:14,color:'#b8b3a9',textDecoration:'line-through'}}>₹{mrp.toLocaleString("en-IN")}</span>
                  <span style={{fontSize:12,fontWeight:800,color:'#166534',background:'#f0fdf4',border:'1px solid #bbf7d0',padding:'4px 8px',borderRadius:999}}>Save ₹{(mrp-price).toLocaleString("en-IN")}</span>
                </>
              )}
            </div>

            <p style={{margin:0,color:'#3d3935',fontSize:14,lineHeight:1.7,padding:16,background:'#fff',border:'1px solid #ece8de',borderRadius:16}}>
              {product.description || "Premium quality product with warranty and fast delivery across India."}
            </p>

            <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background: hasStock ? '#f0fdf4' : '#fef2f2',border:`1px solid ${hasStock ? '#bbf7d0' : '#fecaca'}`,borderRadius:12,fontSize:12,fontWeight:700,color: hasStock ? '#166534' : '#991b1b'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background: hasStock ? '#22c55e' : '#ef4444',display:'inline-block'}} />
              {hasStock ? `${stock} ${stock===1?'item':'items'} available • Free delivery` : "Out of stock • Notify me"}
            </div>

            {error && <div role="alert" style={{padding:'10px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}
            {success && <div role="status" style={{padding:'10px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>✓ {success} <Link to="/cart" style={{marginLeft:8,fontWeight:800,textDecoration:'underline'}}>Go to Cart →</Link></div>}
            {wishlistSuccess && <div role="status" style={{padding:'10px 14px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,color:'#1e40af',fontSize:13,fontWeight:600}}>♡ {wishlistSuccess} <Link to="/wishlist" style={{marginLeft:8,fontWeight:800,textDecoration:'underline'}}>Go to Wishlist →</Link></div>}

            {hasStock && (
              <div className="quantity-control" style={{display:'flex',alignItems:'center',gap:16,padding:16,background:'#fff',border:'1px solid #ece8de',borderRadius:16}}>
                <label htmlFor="quantity" style={{fontSize:12,fontWeight:800,textTransform:'uppercase',letterSpacing:'.06em'}}>Quantity</label>
                <div style={{display:'flex',alignItems:'center',border:'1px solid #ece8de',borderRadius:999,overflow:'hidden',height:40}}>
                  <button type="button" onClick={handleDecrease} disabled={adding || Number(quantity)<=1} style={{width:40,height:40,border:0,background:'#fff',display:'grid',placeItems:'center',fontSize:16,fontWeight:700,cursor:'pointer',opacity: Number(quantity)<=1 ? .3 : 1}}>−</button>
                  <input id="quantity" type="number" min={1} max={stock} value={quantity} onChange={handleQuantityChange} disabled={adding} style={{width:56,height:40,border:'none',borderLeft:'1px solid #ece8de',borderRight:'1px solid #ece8de',textAlign:'center',fontWeight:800,fontSize:14,outline:'none'}} />
                  <button type="button" onClick={handleIncrease} disabled={adding || Number(quantity)>=stock} style={{width:40,height:40,border:0,background:'#fff',display:'grid',placeItems:'center',fontSize:16,fontWeight:700,cursor:'pointer',opacity: Number(quantity)>=stock ? .3 : 1}}>+</button>
                </div>
                <span style={{fontSize:11,color:'#8c8881'}}>Max: {stock}</span>
              </div>
            )}

            <div className="detail-actions" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <button type="button" disabled={!hasStock || adding || wishlistLoading} onClick={handleAddToCart} style={{minHeight:52,borderRadius:999,background:hasStock ? '#1a1816' : '#f5f2eb',color: hasStock ? '#fff' : '#b8b3a9',border:`1px solid ${hasStock ? '#1a1816' : '#ece8de'}`,fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow: hasStock ? '0 8px 20px rgba(0,0,0,.18)' : 'none',cursor: hasStock ? 'pointer' : 'not-allowed',opacity: adding ? .7 : 1}}>
                {adding ? 'Adding...' : hasStock ? `Add to Cart • ₹${(price*Number(quantity||1)).toLocaleString("en-IN")}` : 'Out of Stock'}
              </button>
              <button type="button" onClick={handleAddToWishlist} disabled={wishlistLoading || adding} style={{minHeight:52,borderRadius:999,background:'#fff',color:'#1a1816',border:'1px solid #ece8de',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer'}}>
                {wishlistLoading ? 'Adding...' : '♡ Wishlist'}
              </button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,paddingTop:12}}>
              {[
                {icon:'🚚',t:'Free Delivery',s:'Above ₹999'},
                {icon:'↩',t:'30 Days Return',s:'Easy returns'},
                {icon:'🔒',t:'Secure Payment',s:'100% safe'},
              ].map(b=>(
                <div key={b.t} style={{padding:12,background:'#fff',border:'1px solid #ece8de',borderRadius:12,textAlign:'center'}}>
                  <div style={{fontSize:18}}>{b.icon}</div>
                  <div style={{fontSize:11,fontWeight:800,marginTop:4}}>{b.t}</div>
                  <div style={{fontSize:10,color:'#8c8881'}}>{b.s}</div>
                </div>
              ))}
            </div>

            <Link to="/products" style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:'#8c8881',marginTop:4}}>← Back to Products</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:900px){.product-detail-container > div:nth-child(2){grid-template-columns:1fr !important;} .product-detail-image{position:static !important;}}`}</style>
    </main>
  );
}

export default ProductDetail;