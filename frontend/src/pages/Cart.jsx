import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../services/cartService";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const loadCart = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("CART ERROR:", err);
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || "Cart load nahi ho paaya.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCart();
        if (!cancelled) setCart(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || err.message || "Cart load nahi ho paaya.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const updateQuantity = async (itemId, newQty) => {
    const q = Number(newQty);
    if (!Number.isInteger(q) || q < 1) return;
    setUpdatingId(itemId);
    setError("");
    try {
      const data = await updateCartItem(itemId, q);
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Quantity update nahi ho paayi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    if (removingId === itemId) return;
    setRemovingId(itemId);
    setError("");
    try {
      await removeCartItem(itemId);
      await loadCart(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Item remove nahi ho paya.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{height:130,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">⚠️</div>
            <h2>Unable to Load Cart</h2>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={()=>loadCart()}>Try Again</button>
          </div>
        </div>
      </main>
    );
  }

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const subtotal = items.reduce((t,it)=>{
    const p = it.product || {};
    const price = Number(it.price ?? it.product_price ?? p.price ?? 0);
    return t + price * Number(it.quantity || 0);
  },0);
  const totalItems = items.reduce((t,it)=> t + Number(it.quantity||0),0);
  const isBusy = updatingId!==null || removingId!==null;

  return (
    <main className="cart-page" style={{background:'#fafaf7',minHeight:'100vh',padding:'32px 24px'}}>
      <div className="cart-container" style={{maxWidth:1120,margin:'0 auto'}}>
        {/* Header */}
        <div className="cart-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28,flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816'}}>
              Shopping Cart
              {totalItems>0 && <span style={{marginLeft:12,display:'inline-flex',minWidth:32,height:28,padding:'0 10px',alignItems:'center',justifyContent:'center',background:'#1a1816',color:'#fff',borderRadius:999,fontSize:13,fontWeight:800}}>{totalItems}</span>}
            </h1>
            <p style={{margin:0,color:'#8c8881',fontSize:14}}>
              {totalItems===0 ? "Your cart is waiting" : `${totalItems} item${totalItems===1?'':'s'} • Free delivery on orders above ₹999`}
            </p>
          </div>
          <Link to="/products" style={{minHeight:42,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:700,color:'#1a1816'}}>
            Continue Shopping →
          </Link>
        </div>

        {error && (
          <div role="alert" style={{padding:'12px 14px',marginBottom:20,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>
            ⚠️ {error}
          </div>
        )}

        {items.length===0 ? (
          <div className="cart-empty" style={{textAlign:'center',padding:'80px 32px',background:'#fff',border:'1px solid #ece8de',borderRadius:24}}>
            <div style={{width:80,height:80,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:'50%',fontSize:36}}>🛒</div>
            <h2 style={{margin:'0 0 8px',fontSize:24,fontWeight:900}}>Your cart is empty</h2>
            <p style={{margin:'0 0 24px',color:'#8c8881'}}>Add some products to your cart and they will appear here.</p>
            <Link to="/products" style={{display:'inline-flex',minHeight:48,padding:'0 24px',alignItems:'center',background:'#1a1816',color:'#fff',borderRadius:999,fontWeight:800}}>Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout" style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:24,alignItems:'start'}}>
            {/* Items */}
            <section className="cart-items" aria-label="Shopping cart items" style={{display:'flex',flexDirection:'column',gap:16}}>
              {items.map((item, idx)=>{
                const product = item.product || {};
                const price = Number(item.price ?? item.product_price ?? product.price ?? 0);
                const quantity = Number(item.quantity || 0);
                const total = price * quantity;
                const isUpdating = updatingId===item.id;
                const isRemoving = removingId===item.id;
                const name = item.product_name || product.name || `Product #${item.product}`;
                const image = product.image || product.thumbnail;
                const originalPrice = Number(product.original_price || product.mrp || 0);
                const hasDiscount = originalPrice > price;

                return (
                  <article
                    key={item.id}
                    className="cart-item"
                    style={{
                      display:'grid',gridTemplateColumns:'110px 1fr auto',
                      gap:18,padding:20,background:'#fff',border:'1px solid #ece8de',
                      borderRadius:20,boxShadow:'0 2px 10px rgba(0,0,0,.04)',
                      opacity: isRemoving ? .6 : 1, transform: isRemoving ? 'scale(.98)' : 'scale(1)',
                      transition:'.3s cubic-bezier(.16,1,.3,1)', animation:`fadeIn .4s both`,
                      animationDelay:`${idx*50}ms`
                    }}
                  >
                    <div className="cart-item-image" style={{width:110,height:110,background:'#fafaf7',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',border:'1px solid #ece8de'}}>
                      {image ? <img src={image} alt={name} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>e.currentTarget.style.display='none'} /> : <span style={{fontSize:36}}>📦</span>}
                    </div>

                    <div className="cart-item-info" style={{minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9'}}>{product.category || 'E-SHOP'}</span>
                        {product.rating && <span style={{fontSize:11,padding:'2px 6px',background:'#fffbeb',borderRadius:999,fontWeight:700}}>★ {product.rating}</span>}
                      </div>
                      <h3 style={{margin:'0 0 6px',fontSize:16,fontWeight:700,color:'#1a1816',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{name}</h3>
                      <p style={{margin:'0 0 14px',display:'flex',alignItems:'baseline',gap:8}}>
                        <span style={{fontSize:16,fontWeight:800,color:'#1a1816'}}>₹{price.toLocaleString("en-IN")}</span>
                        {hasDiscount && <span style={{fontSize:12,color:'#b8b3a9',textDecoration:'line-through'}}>₹{originalPrice.toLocaleString("en-IN")}</span>}
                      </p>

                      <div className="cart-item-controls" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                        <div style={{display:'flex',alignItems:'center',gap:0,border:'1px solid #ece8de',borderRadius:999,background:'#fff',overflow:'hidden',height:38}}>
                          <button
                            type="button"
                            disabled={isUpdating||isRemoving||quantity<=1}
                            onClick={()=>updateQuantity(item.id,quantity-1)}
                            style={{width:38,height:38,border:0,background:'transparent',display:'grid',placeItems:'center',cursor:'pointer',fontSize:16,fontWeight:700,opacity: quantity<=1 ? .3 : 1}}
                          >−</button>
                          <div style={{width:44,textAlign:'center',fontSize:14,fontWeight:800,borderLeft:'1px solid #ece8de',borderRight:'1px solid #ece8de',height:38,display:'grid',placeItems:'center'}}>
                            {isUpdating ? '...' : quantity}
                          </div>
                          <button
                            type="button"
                            disabled={isUpdating||isRemoving}
                            onClick={()=>updateQuantity(item.id,quantity+1)}
                            style={{width:38,height:38,border:0,background:'transparent',display:'grid',placeItems:'center',cursor:'pointer',fontSize:16,fontWeight:700}}
                          >+</button>
                        </div>

                        <button
                          type="button"
                          disabled={isUpdating||isRemoving}
                          onClick={()=>handleRemove(item.id)}
                          style={{minHeight:36,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:12,fontWeight:700,color:'#8c8881',cursor:'pointer',transition:'.2s'}}
                        >
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </button>

                        {isUpdating && <small style={{fontSize:11,color:'#8c8881',fontWeight:600}}>Updating...</small>}
                      </div>
                    </div>

                    <div className="cart-item-total" style={{textAlign:'right',minWidth:90}}>
                      <div style={{fontSize:18,fontWeight:900,color:'#1a1816'}}>₹{total.toLocaleString("en-IN")}</div>
                      <div style={{fontSize:11,color:'#8c8881',marginTop:4}}>{quantity} × ₹{price.toLocaleString("en-IN")}</div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Summary - Premium */}
            <aside className="cart-summary" style={{
              position:'sticky',top:96,background:'#fff',border:'1px solid #ece8de',
              borderRadius:20,padding:24,boxShadow:'0 8px 24px rgba(0,0,0,.06)'
            }}>
              <h2 style={{margin:'0 0 20px',fontSize:18,fontWeight:900,letterSpacing:'-.02em'}}>Order Summary</h2>

              <div style={{display:'flex',flexDirection:'column',gap:0}}>
                <div className="cart-summary-row" style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontSize:14,borderBottom:'1px solid #f5f2eb'}}>
                  <span style={{color:'#8c8881'}}>Items ({totalItems})</span>
                  <strong style={{fontWeight:700}}>{totalItems}</strong>
                </div>
                <div className="cart-summary-row" style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontSize:14,borderBottom:'1px solid #f5f2eb'}}>
                  <span style={{color:'#8c8881'}}>Subtotal</span>
                  <strong style={{fontWeight:700}}>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>
                <div className="cart-summary-row" style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontSize:14,borderBottom:'1px solid #f5f2eb'}}>
                  <span style={{color:'#8c8881'}}>Shipping</span>
                  <strong style={{color:'#10b981'}}>Free ✓</strong>
                </div>
                <div className="cart-summary-row" style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontSize:14}}>
                  <span style={{color:'#8c8881'}}>Tax</span>
                  <span style={{fontWeight:600}}>Included</span>
                </div>
              </div>

              <div className="cart-summary-total" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12,padding:'16px 0',borderTop:'1px solid #ece8de'}}>
                <span style={{fontSize:16,fontWeight:800,color:'#1a1816'}}>Total</span>
                <strong style={{fontSize:22,fontWeight:900,color:'#1a1816'}}>₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>

              <button
                type="button"
                className="btn btn-primary cart-checkout-button"
                onClick={()=>navigate("/checkout")}
                disabled={isBusy || items.length===0}
                style={{
                  width:'100%',minHeight:52,marginTop:8,borderRadius:999,
                  background:'#1a1816',color:'#fff',border:'1px solid #1a1816',
                  fontSize:15,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  boxShadow:'0 8px 20px rgba(0,0,0,.18)',cursor:'pointer',transition:'.25s',
                  opacity: isBusy||items.length===0 ? .6 : 1
                }}
              >
                Proceed to Checkout <span>→</span>
              </button>

              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:16,fontSize:11,color:'#b8b3a9',fontWeight:600}}>
                <span>🔒</span> Secure checkout • 30 days returns
              </div>

              <div style={{marginTop:20,padding:12,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:12,fontSize:12,lineHeight:1.5}}>
                <strong style={{display:'block',fontSize:11,marginBottom:4,color:'#1a1816'}}>🎁 OFFER</strong>
                Add ₹{Math.max(0,999-subtotal).toLocaleString("en-IN")} more for free delivery!
              </div>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @media(max-width:1100px){
          .cart-layout { grid-template-columns:1fr !important; }
          .cart-summary { position:static !important; }
        }
        @media(max-width:600px){
          .cart-item { grid-template-columns:80px 1fr !important; }
          .cart-item-total { grid-column:1 / -1; text-align:left !important; display:flex; justify-content:space-between; align-items:center; }
        }
      `}</style>
    </main>
  );
}

export default Cart;