import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setOrders(list);
    } catch (err) {
      console.error("ORDERS ERROR:", err);
      setError(err.response?.data?.detail || err.message || "Orders load nahi ho paaye.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
          {[1,2,3].map(i=>(<div key={i} style={{height:160,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <div style={{width:64,height:64,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fef2f2',borderRadius:'50%',fontSize:28}}>⚠️</div>
          <h2 style={{margin:'0 0 8px',fontWeight:900}}>Unable to Load Orders</h2>
          <p style={{margin:'0 0 20px',color:'#8c8881',fontSize:14}}>{error}</p>
          <button onClick={()=>loadOrders()} style={{minHeight:42,padding:'0 20px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700}}>Try Again</button>
        </div>
      </main>
    );
  }

  const statusStyle = (status) => {
    const s = status.toUpperCase();
    if (s==="DELIVERED") return {bg:'#f0fdf4',bd:'#bbf7d0',cl:'#166534',dot:'#10b981'};
    if (s==="SHIPPED") return {bg:'#fffbeb',bd:'#fde68a',cl:'#92400e',dot:'#f59e0b'};
    if (s==="CONFIRMED") return {bg:'#f5f3ff',bd:'#ddd6fe',cl:'#6b21a8',dot:'#8b5cf6'};
    if (s==="CANCELLED") return {bg:'#fef2f2',bd:'#fecaca',cl:'#991b1b',dot:'#ef4444'};
    return {bg:'#eff6ff',bd:'#bfdbfe',cl:'#1e40af',dot:'#3b82f6'};
  };

  return (
    <main className="orders-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
      <div className="orders-container" style={{maxWidth:900,margin:'0 auto'}}>
        <div className="orders-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:28,flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816',display:'flex',alignItems:'center',gap:12}}>
              My Orders
              {orders.length>0 && <span style={{minWidth:32,height:28,padding:'0 10px',display:'inline-flex',alignItems:'center',justifyContent:'center',background:'#1a1816',color:'#fff',borderRadius:999,fontSize:13,fontWeight:800}}>{orders.length}</span>}
            </h1>
            <p style={{margin:0,color:'#8c8881',fontSize:14}}>{orders.length===0 ? "No orders yet" : `${orders.length} order${orders.length===1?'':'s'} placed • Track & manage`}</p>
          </div>
          <Link to="/products" style={{minHeight:42,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:700}}>Continue Shopping →</Link>
        </div>

        {orders.length===0 ? (
          <div className="orders-empty" style={{textAlign:'center',padding:'80px 32px',background:'#fff',border:'1px solid #ece8de',borderRadius:24}}>
            <div style={{width:80,height:80,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:'50%',fontSize:36}}>📦</div>
            <h2 style={{margin:'0 0 8px',fontSize:22,fontWeight:900}}>No Orders Yet</h2>
            <p style={{margin:'0 0 24px',color:'#8c8881',fontSize:14}}>Your placed orders will appear here. Start shopping now!</p>
            <Link to="/products" style={{display:'inline-flex',minHeight:48,padding:'0 24px',alignItems:'center',background:'#1a1816',color:'#fff',borderRadius:999,fontWeight:800}}>Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list" style={{display:'flex',flexDirection:'column',gap:16}}>
            {orders.map((order, idx)=>{
              const orderNumber = order.order_number || `#${order.id}`;
              const itemCount = Array.isArray(order.items) ? order.items.length : Number(order.item_count || 0);
              const totalAmount = Number(order.total_amount || 0);
              const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "-";
              const orderStatus = order.status || "PLACED";
              const st = statusStyle(orderStatus);

              return (
                <article key={order.id} className="order-card" style={{
                  background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:0,overflow:'hidden',
                  boxShadow:'0 2px 10px rgba(0,0,0,.04)',transition:'.2s',animation:`fadeIn .35s both`,animationDelay:`${idx*50}ms`
                }}>
                  <div className="order-card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'#fafaf7',borderBottom:'1px solid #f5f2eb',flexWrap:'wrap',gap:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:16}}>
                      <div>
                        <span style={{display:'block',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9',marginBottom:2}}>Order Number</span>
                        <strong style={{fontSize:13,fontWeight:800,color:'#1a1816'}}>{orderNumber}</strong>
                      </div>
                      <div style={{width:1,height:28,background:'#ece8de'}} />
                      <div>
                        <span style={{display:'block',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9',marginBottom:2}}>Date</span>
                        <strong style={{fontSize:13,fontWeight:600}}>{orderDate}</strong>
                      </div>
                    </div>
                    <div className="order-status" style={{
                      display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:999,
                      background:st.bg,border:`1px solid ${st.bd}`,color:st.cl,fontSize:11,fontWeight:800,letterSpacing:'.04em'
                    }}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:st.dot,display:'inline-block'}} />
                      {orderStatus}
                    </div>
                  </div>

                  <div className="order-card-body" style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:16,padding:'18px 20px',alignItems:'center'}}>
                    <div><span style={{display:'block',fontSize:11,color:'#8c8881',marginBottom:4}}>Items</span><strong style={{fontSize:14}}>{itemCount} item{itemCount===1?'':'s'}</strong></div>
                    <div><span style={{display:'block',fontSize:11,color:'#8c8881',marginBottom:4}}>Total Amount</span><strong style={{fontSize:16,fontWeight:900}}>₹{totalAmount.toLocaleString("en-IN")}</strong></div>
                    <div><span style={{display:'block',fontSize:11,color:'#8c8881',marginBottom:4}}>Delivery</span><strong style={{fontSize:13,color:'#10b981'}}>Free • 3-5 days</strong></div>
                    <Link to={`/orders/${order.id}`} style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>
                      View Order →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:600px){.order-card-body{grid-template-columns:1fr 1fr !important;} .order-card-body a{grid-column:1 / -1;}}`}</style>
    </main>
  );
}

export default Orders;