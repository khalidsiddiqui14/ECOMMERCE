import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorDashboard } from "../../services/vendorService";

function VendorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await getVendorDashboard();
      setDashboard(data || {});
    } catch (err) {
      setError(err.response?.data?.detail || "Dashboard load nahi ho paaya.");
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const data = await getVendorDashboard();
        if (!cancelled) setDashboard(data || {});
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || "Dashboard load nahi ho paaya.");
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = dashboard?.stats || {};
  const recentOrders = Array.isArray(dashboard?.recent_orders) ? dashboard.recent_orders : [];
  const storeName = dashboard?.store?.name || "Your Store";
  const totalProducts = Number(stats.total_products || 0);
  const totalOrders = Number(stats.total_orders || 0);
  const pendingOrders = Number(stats.pending_orders || 0);
  const revenue = Number(stats.revenue || 0);
  const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const formatDate = (v) => { if (!v) return "-"; const d=new Date(v); return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gap:16}}>
          <div style={{height:100,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[1,2,3,4].map(i=><div key={i} style={{height:120,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />)}
          </div>
        </div>
      </main>
    );
  }

  if (error && !dashboard) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <h2 style={{fontWeight:900}}>Dashboard Error</h2>
          <p style={{color:'#8c8881'}}>{error}</p>
          <button onClick={()=>loadDashboard(true)} disabled={refreshing} style={{marginTop:16,minHeight:40,padding:'0 18px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700}}>{refreshing ? "Retrying..." : "Try Again"}</button>
        </div>
      </main>
    );
  }

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:20,position:'relative',overflow:'hidden',boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
        <div style={{width:44,height:44,borderRadius:12,background:color.bg,border:`1px solid ${color.border}`,display:'grid',placeItems:'center',fontSize:20}}>{icon}</div>
        {trend && <span style={{padding:'3px 8px',borderRadius:999,background: trend.startsWith('+') ? '#f0fdf4' : '#fef2f2',border:`1px solid ${trend.startsWith('+') ? '#bbf7d0' : '#fecaca'}`,fontSize:10,fontWeight:800,color: trend.startsWith('+') ? '#166534' : '#991b1b'}}>{trend}</span>}
      </div>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881',marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:900,letterSpacing:'-.02em',color:'#1a1816'}}>{value}</div>
      <div style={{position:'absolute',right:-20,bottom:-20,width:80,height:80,background:`radial-gradient(circle,${color.bg},transparent 70%)`,borderRadius:'50%'}} />
    </div>
  );

  return (
    <main className="vendor-dashboard-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
      <div className="vendor-dashboard-container" style={{maxWidth:1200,margin:'0 auto'}}>
        {/* Header */}
        <div className="vendor-dashboard-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:24}}>
          <div>
            <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.06em',marginBottom:10}}>VENDOR DASHBOARD • LIVE</span>
            <h1 style={{margin:'0 0 6px',fontSize:'clamp(24px,3.5vw,32px)',fontWeight:900,letterSpacing:'-.03em'}}>Welcome to {storeName} 👋</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:14}}>Manage your store, products and orders from one place. • <strong style={{color:'#166534'}}>● {totalProducts} products active</strong></p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>loadDashboard(true)} disabled={refreshing} style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              <span style={{display:'inline-block',animation: refreshing ? 'spin .8s linear infinite' : 'none'}}>↻</span> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <Link to="/vendor/products" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 12px rgba(0,0,0,.15)'}}>Manage Products →</Link>
          </div>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}

        {/* Stats */}
        <section className="vendor-stats-grid" aria-label="Store statistics" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:24}}>
          <StatCard icon="📦" label="Total Products" value={totalProducts} trend="+12%" color={{bg:'#f0fdf4',border:'#bbf7d0'}} />
          <StatCard icon="🛒" label="Total Orders" value={totalOrders} trend="+8%" color={{bg:'#eff6ff',border:'#bfdbfe'}} />
          <StatCard icon="⏳" label="Pending Orders" value={pendingOrders} color={{bg:'#fefce8',border:'#fde68a'}} />
          <StatCard icon="💰" label="Revenue" value={formatCurrency(revenue)} trend="+23%" color={{bg:'#fdf2f8',border:'#fbcfe8'}} />
        </section>

        <section className="vendor-dashboard-content" style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24,alignItems:'start'}}>
          {/* Recent Orders */}
          <div className="vendor-orders-section" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:24,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
            <div className="vendor-section-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{margin:'0 0 4px',fontSize:16,fontWeight:900}}>Recent Orders</h2>
                <p style={{margin:0,fontSize:13,color:'#8c8881'}}>Latest orders containing your products.</p>
              </div>
              <Link to="/vendor/orders" style={{minHeight:32,padding:'0 14px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#fafaf7',border:'1px solid #ece8de',fontSize:12,fontWeight:700,textDecoration:'none',color:'#1a1816'}}>View All →</Link>
            </div>

            {recentOrders.length===0 ? (
              <div className="vendor-empty" style={{textAlign:'center',padding:40,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:16}}>
                <div style={{fontSize:32,marginBottom:8}}>📦</div>
                <h3 style={{margin:'0 0 6px',fontWeight:800}}>No orders yet</h3>
                <p style={{margin:'0 0 16px',fontSize:13,color:'#8c8881'}}>Orders containing your products will appear here.</p>
                <Link to="/vendor/products" style={{minHeight:36,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:12,fontWeight:700,textDecoration:'none'}}>Manage Products</Link>
              </div>
            ) : (
              <div className="vendor-orders-list" style={{display:'flex',flexDirection:'column',gap:12}}>
                {recentOrders.map(order=>{
                  const items = Array.isArray(order?.items) ? order.items : [];
                  return (
                    <article key={order.id} style={{border:'1px solid #f5f2eb',borderRadius:16,padding:16,background:'#fff',transition:'.2s'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                        <div><span style={{fontSize:10,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Order</span><br/><strong style={{fontSize:13}}>{order.order_number || `#${order.id}`}</strong></div>
                        <span style={{padding:'4px 10px',borderRadius:999,background: order.status==="DELIVERED" ? '#f0fdf4' : '#fefce8',border:`1px solid ${order.status==="DELIVERED" ? '#bbf7d0' : '#fde68a'}`,fontSize:10,fontWeight:800}}>{order.status || "PLACED"}</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
                        {items.length===0 ? <span style={{fontSize:12,color:'#8c8881'}}>No item details available.</span> : items.slice(0,2).map(item=>(
                          <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'#fafaf7',borderRadius:10}}>
                            <div style={{width:32,height:32,borderRadius:8,background:'#fff',border:'1px solid #ece8de',display:'grid',placeItems:'center',fontSize:14}}>📦</div>
                            <div style={{flex:1,minWidth:0}}>
                              <strong style={{display:'block',fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.product_name || `Product #${item.product || "-"}`}</strong>
                              <span style={{fontSize:11,color:'#8c8881'}}>SKU: {item.sku || "-"} • Qty: {Number(item.quantity || 0)}</span>
                            </div>
                            <strong style={{fontSize:12}}>{formatCurrency(item.total_price)}</strong>
                          </div>
                        ))}
                        {items.length>2 && <span style={{fontSize:11,color:'#8c8881',textAlign:'center'}}>+{items.length-2} more items</span>}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,paddingTop:12,borderTop:'1px solid #f5f2eb'}}>
                        <div><span style={{fontSize:10,color:'#8c8881',display:'block'}}>Payment</span><strong style={{fontSize:12}}>{order.payment_status || "-"}</strong></div>
                        <div><span style={{fontSize:10,color:'#8c8881',display:'block'}}>Total</span><strong style={{fontSize:12}}>{formatCurrency(order.total_amount)}</strong></div>
                        <div><span style={{fontSize:10,color:'#8c8881',display:'block'}}>Date</span><strong style={{fontSize:12}}>{formatDate(order.created_at)}</strong></div>
                      </div>
                      <div style={{marginTop:12}}><Link to={`/orders/${order.id}`} style={{fontSize:12,fontWeight:700,color:'#1a1816'}}>View Order →</Link></div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions - Flipkart Seller style */}
          <aside className="vendor-quick-actions" style={{display:'flex',flexDirection:'column',gap:12,position:'sticky',top:88}}>
            <div style={{background:'#1a1816',color:'#fff',borderRadius:20,padding:20,position:'relative',overflow:'hidden'}}>
              <h2 style={{margin:'0 0 12px',fontSize:14,fontWeight:800}}>Quick Actions ⚡</h2>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[
                  {to:'/vendor/products',icon:'📦',t:'Products',s:'Manage your products'},
                  {to:'/vendor/products/create',icon:'➕',t:'Add Product',s:'Create a new product',highlight:true},
                  {to:'/vendor/orders',icon:'🛒',t:'Orders',s:'Manage customer orders'},
                  {to:'/vendor/store',icon:'🏪',t:'Store',s:'Manage store info'},
                  {to:'/vendor/profile',icon:'👤',t:'Vendor Profile',s:'Manage profile'},
                ].map(a=>(
                  <Link key={a.to} to={a.to} style={{
                    display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:12,
                    background: a.highlight ? '#fff' : 'rgba(255,255,255,.08)',color: a.highlight ? '#1a1816' : '#fff',
                    border:`1px solid ${a.highlight ? '#fff' : 'rgba(255,255,255,.12)'}`,textDecoration:'none',transition:'.2s'
                  }}>
                    <span style={{width:36,height:36,borderRadius:10,background: a.highlight ? '#1a1816' : 'rgba(255,255,255,.1)',color: a.highlight ? '#fff' : '#fff',display:'grid',placeItems:'center',fontSize:16}}>{a.icon}</span>
                    <div><strong style={{display:'block',fontSize:12}}>{a.t}</strong><small style={{fontSize:11,opacity:.7}}>{a.s}</small></div>
                    <span style={{marginLeft:'auto'}}>→</span>
                  </Link>
                ))}
              </div>
              <div style={{position:'absolute',width:200,height:200,right:-40,top:-40,background:'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)',borderRadius:'50%'}} />
            </div>

            <div style={{background:'#fff',border:'1px solid #ece8de',borderRadius:16,padding:16}}>
              <h3 style={{margin:'0 0 10px',fontSize:12,fontWeight:800}}>💡 Seller Tips</h3>
              <ul style={{margin:0,paddingLeft:16,fontSize:11,color:'#8c8881',lineHeight:1.6}}>
                <li>Update stock daily for better ranking</li>
                <li>Add HD images = +40% sales</li>
                <li>Respond to orders within 2hrs</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @keyframes spin{to{transform:rotate(360deg)}} @media(max-width:900px){.vendor-dashboard-content{grid-template-columns:1fr !important;} .vendor-stats-grid{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </main>
  );
}

export default VendorDashboard;