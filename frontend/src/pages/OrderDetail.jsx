import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../services/orderService";

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getOrder(id);
      if (!data) throw new Error("Order data was not returned.");
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Order load nahi ho paaya.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
        <div style={{maxWidth:1120,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
          <div style={{height:60,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />
          <div style={{height:400,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <div style={{width:64,height:64,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fef2f2',borderRadius:'50%',fontSize:28}}>⚠️</div>
          <h2 style={{margin:'0 0 8px',fontWeight:900}}>Unable to Load Order</h2>
          <p style={{margin:'0 0 20px',color:'#8c8881',fontSize:14}}>{error || "This order does not exist."}</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={()=>loadOrder()} style={{minHeight:42,padding:'0 20px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700}}>Try Again</button>
            <Link to="/orders" style={{minHeight:42,padding:'0 20px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontWeight:700,fontSize:13}}>Back to Orders</Link>
          </div>
        </div>
      </main>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const orderNumber = order.order_number || `#${order.id}`;
  const status = order.status || "PLACED";
  const payStatus = order.payment_status || "PENDING";
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "-";
  const subtotal = Number(order.subtotal || 0);
  const shippingCost = Number(order.shipping_cost || 0);
  const totalAmount = Number(order.total_amount || 0);

  const statusMap = {
    PLACED: {label:'Placed', color:'#3b82f6', bg:'#eff6ff', bd:'#bfdbfe'},
    CONFIRMED: {label:'Confirmed', color:'#8b5cf6', bg:'#f5f3ff', bd:'#ddd6fe'},
    SHIPPED: {label:'Shipped', color:'#f59e0b', bg:'#fffbeb', bd:'#fde68a'},
    DELIVERED: {label:'Delivered', color:'#10b981', bg:'#f0fdf4', bd:'#bbf7d0'},
    CANCELLED: {label:'Cancelled', color:'#ef4444', bg:'#fef2f2', bd:'#fecaca'},
  };
  const s = statusMap[status.toUpperCase()] || statusMap.PLACED;

  const steps = ["PLACED","CONFIRMED","SHIPPED","DELIVERED"];
  const currentStepIndex = steps.indexOf(status.toUpperCase());

  return (
    <main className="order-detail-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
      <div className="order-detail-container" style={{maxWidth:1120,margin:'0 auto'}}>
        {/* Header */}
        <div className="order-detail-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <Link to="/orders" style={{width:36,height:36,borderRadius:'50%',background:'#fff',border:'1px solid #ece8de',display:'grid',placeItems:'center'}}>←</Link>
              <span style={{fontSize:12,fontWeight:700,color:'#8c8881'}}>Orders / {orderNumber}</span>
            </div>
            <h1 style={{margin:'0 0 6px',fontSize:'clamp(26px,4vw,34px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816',display:'flex',alignItems:'center',gap:12}}>
              Order {orderNumber}
              <span style={{padding:'6px 12px',borderRadius:999,background:s.bg,border:`1px solid ${s.bd}`,color:s.color,fontSize:11,fontWeight:800,letterSpacing:'.04em'}}>{s.label}</span>
            </h1>
            <p style={{margin:0,color:'#8c8881',fontSize:13}}>Placed on {orderDate} • {items.length} item{items.length===1?'':'s'}</p>
          </div>
          <Link to="/orders" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:700}}>Back to Orders</Link>
        </div>

        {/* Status Timeline */}
        <div className="order-detail-status" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:16,marginBottom:24}}>
          <div style={{background:'#fff',border:'1px solid #ece8de',borderRadius:16,padding:18}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              {steps.map((step,i)=>{
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <div key={step} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flex:1,position:'relative'}}>
                    {i>0 && <div style={{position:'absolute',top:14,left:'-50%',right:'50%',height:2,background: done ? '#10b981' : '#f1eee8',zIndex:0}} />}
                    <div style={{width:28,height:28,borderRadius:'50%',background: done ? (active ? '#1a1816' : '#10b981') : '#fff',border:`1px solid ${done ? '#10b981' : '#ece8de'}`,color: done ? '#fff' : '#b8b3a9',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,zIndex:1}}>
                      {done ? (active ? '●' : '✓') : i+1}
                    </div>
                    <span style={{fontSize:10,fontWeight:800,letterSpacing:'.06em',color: done ? '#1a1816' : '#b8b3a9',textTransform:'uppercase'}}>{step}</span>
                  </div>
                );
              })}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,paddingTop:12,borderTop:'1px solid #f5f2eb'}}>
              <span style={{color:'#8c8881'}}>Payment</span>
              <strong style={{padding:'4px 10px',borderRadius:999,background: payStatus==='PAID' ? '#f0fdf4' : '#fffbeb',border:`1px solid ${payStatus==='PAID' ? '#bbf7d0' : '#fde68a'}`,color: payStatus==='PAID' ? '#166534' : '#92400e',fontSize:11}}>{payStatus}</strong>
            </div>
          </div>

          <div style={{background:'#fff',border:'1px solid #ece8de',borderRadius:16,padding:18}}>
            <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9'}}>Order Date</span>
            <strong style={{display:'block',marginTop:6,fontSize:14,color:'#1a1816'}}>{orderDate}</strong>
            <span style={{fontSize:11,color:'#8c8881',marginTop:4,display:'block'}}>ID: {order.id}</span>
          </div>

          <div style={{background:'#1a1816',color:'#fff',borderRadius:16,padding:18,position:'relative',overflow:'hidden'}}>
            <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.6)'}}>Total Amount</span>
            <strong style={{display:'block',marginTop:6,fontSize:20,fontWeight:900}}>₹{totalAmount.toLocaleString("en-IN")}</strong>
            <span style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>{items.length} items • Free delivery</span>
            <div style={{position:'absolute',width:120,height:120,right:-20,top:-20,background:'radial-gradient(circle,rgba(255,255,255,.12),transparent 70%)'}} />
          </div>
        </div>

        {/* Items */}
        <section className="order-detail-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:24,marginBottom:24,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
          <h2 style={{margin:'0 0 16px',fontSize:16,fontWeight:900}}>Items ({items.length})</h2>
          {items.length===0 ? (
            <div style={{textAlign:'center',padding:40,color:'#8c8881'}}>No items were found in this order.</div>
          ) : (
            <div className="order-detail-items" style={{display:'flex',flexDirection:'column',gap:12}}>
              {items.map((item,idx)=>{
                const product = item.product || {};
                const price = Number(item.price || item.product_price || product.price || 0);
                const qty = Number(item.quantity || 0);
                const total = price*qty;
                const name = item.product_name || product.name || `Product #${item.product}`;
                return (
                  <div key={item.id} className="order-detail-item" style={{display:'grid',gridTemplateColumns:'64px 1fr auto',gap:16,padding:16,background:'#fafaf7',border:'1px solid #f5f2eb',borderRadius:16,alignItems:'center'}}>
                    <div className="order-item-image" style={{width:64,height:64,background:'#fff',border:'1px solid #ece8de',borderRadius:12,display:'grid',placeItems:'center',fontSize:28}}>
                      {product.image ? <img src={product.image} alt={name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:12}} /> : '📦'}
                    </div>
                    <div className="order-item-info" style={{minWidth:0}}>
                      <h3 style={{margin:'0 0 4px',fontSize:14,fontWeight:700,color:'#1a1816',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</h3>
                      <p style={{margin:0,fontSize:12,color:'#8c8881'}}>Qty: {qty} • ₹{price.toLocaleString("en-IN")} each</p>
                    </div>
                    <strong style={{fontSize:15,fontWeight:800}}>₹{total.toLocaleString("en-IN")}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Grid */}
        <div className="order-detail-grid" style={{display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:24}}>
          <section className="order-detail-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:24}}>
            <h2 style={{margin:'0 0 16px',fontSize:16,fontWeight:900,display:'flex',alignItems:'center',gap:8}}>📍 Shipping Details</h2>
            <div className="shipping-details" style={{display:'flex',flexDirection:'column',gap:10,fontSize:13,lineHeight:1.5}}>
              {[
                ["Name", order.shipping_name],
                ["Phone", order.shipping_phone],
                ["Address", order.shipping_address],
                ["City", `${order.shipping_city || "-"}, ${order.shipping_state || ""}`],
                ["Country", `${order.shipping_country || "-"} - ${order.shipping_postal_code || ""}`],
              ].map(([label,val])=>(
                <div key={label} style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:12}}>
                  <span style={{color:'#8c8881',fontWeight:600}}>{label}</span>
                  <span style={{color:'#1a1816',fontWeight:500}}>{val || "-"}</span>
                </div>
              ))}
              {order.notes && (
                <div style={{marginTop:8,padding:12,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:10}}>
                  <strong style={{fontSize:11,letterSpacing:'.06em'}}>NOTES</strong>
                  <p style={{margin:'4px 0 0',color:'#3d3935'}}>{order.notes}</p>
                </div>
              )}
            </div>
          </section>

          <section className="order-detail-card order-summary-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:24,alignSelf:'start',position:'sticky',top:96}}>
            <h2 style={{margin:'0 0 16px',fontSize:16,fontWeight:900}}>Order Summary</h2>
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
              <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f5f2eb',fontSize:13}}><span style={{color:'#8c8881'}}>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #f5f2eb',fontSize:13}}><span style={{color:'#8c8881'}}>Shipping</span><strong style={{color: shippingCost===0 ? '#10b981' : '#1a1816'}}>{shippingCost===0 ? 'Free ✓' : `₹${shippingCost.toLocaleString("en-IN")}`}</strong></div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'14px 0',fontSize:15}}><span style={{fontWeight:800}}>Total</span><strong style={{fontWeight:900,fontSize:18}}>₹{totalAmount.toLocaleString("en-IN")}</strong></div>
            </div>
            <div style={{marginTop:16,padding:10,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,fontSize:11,color:'#166534',fontWeight:600,textAlign:'center'}}>
              ✓ Order confirmed • Payment {payStatus}
            </div>
          </section>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:900px){.order-detail-status{grid-template-columns:1fr !important;} .order-detail-grid{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}

export default OrderDetail;