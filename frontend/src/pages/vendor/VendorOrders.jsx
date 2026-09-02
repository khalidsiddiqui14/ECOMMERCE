import { useCallback, useEffect, useMemo, useState } from "react";
import { getVendorOrders, updateVendorOrderStatus } from "../../services/vendorService";

const ORDER_STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await getVendorOrders();
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setOrders(list);
    } catch (err) {
      setError(err.response?.data?.detail || "Orders load nahi ho paaye.");
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(false); }, [loadOrders]);

  const updateStatus = async (orderId, newStatus) => {
    if (updatingId!==null) return;
    setError(""); setUpdatingId(orderId);
    try {
      const res = await updateVendorOrderStatus(orderId, newStatus);
      const updated = res?.status || newStatus;
      setOrders(prev => prev.map(o => o.id===orderId ? {...o, status: updated} : o));
    } catch (err) {
      setError(err.response?.data?.detail || "Order status update nahi ho paaya.");
    } finally { setUpdatingId(null); }
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (filter!=="All") list = list.filter(o => String(o.status||"").toUpperCase()===filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => 
        String(o.order_number||o.id).toLowerCase().includes(q) ||
        String(o.customer||o.customer_name||o.user?.username||"").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const stats = useMemo(() => {
    const s = {total:orders.length, pending:0, processing:0, shipped:0, delivered:0, cancelled:0, revenue:0};
    orders.forEach(o => {
      const st = String(o.status||"").toUpperCase();
      if (st==="PENDING") s.pending++;
      if (["CONFIRMED","PROCESSING"].includes(st)) s.processing++;
      if (st==="SHIPPED") s.shipped++;
      if (st==="DELIVERED") { s.delivered++; s.revenue += Number(o.total ?? o.total_amount ?? 0); }
      if (st==="CANCELLED") s.cancelled++;
    });
    return s;
  }, [orders]);

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  };
  const fmt = (a) => Number(a||0).toLocaleString("en-IN");
  const getCount = (o) => Array.isArray(o?.items) ? o.items.reduce((t,i)=>t+Number(i?.quantity||0),0) : 0;
  const getName = (o) => o?.customer || o?.customer_name || o?.user?.username || "Customer";
  const getPhone = (o) => o?.phone || o?.customer_phone || o?.user?.phone || "";
  const getTotal = (o) => o?.total ?? o?.total_amount ?? 0;
  const getDate = (o) => o?.date || o?.created_at || o?.created;
  const getStatusLabel = (s) => s ? String(s).replaceAll("_"," ").toLowerCase().replace(/^\w/,(c)=>c.toUpperCase()) : "Unknown";

  const statusStyle = (s) => {
    const m = {
      PENDING:{bg:'#fefce8',border:'#fde68a',color:'#854d0e',dot:'#eab308'},
      CONFIRMED:{bg:'#eff6ff',border:'#bfdbfe',color:'#1e40af',dot:'#3b82f6'},
      PROCESSING:{bg:'#eff6ff',border:'#bfdbfe',color:'#1e40af',dot:'#3b82f6'},
      SHIPPED:{bg:'#f0fdf4',border:'#bbf7d0',color:'#166534',dot:'#22c55e'},
      DELIVERED:{bg:'#f0fdf4',border:'#bbf7d0',color:'#166534',dot:'#16a34a'},
      CANCELLED:{bg:'#fef2f2',border:'#fecaca',color:'#991b1b',dot:'#ef4444'},
    };
    return m[s] || m.PENDING;
  };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',flexDirection:'column',gap:16}}>
          <div style={{height:80,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>{[1,2,3,4,5,6].map(i=><div key={i} style={{height:80,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />)}</div>
          <div style={{height:400,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-orders-page" style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
      <div className="vendor-container" style={{maxWidth:1100,margin:'0 auto'}}>
        {/* Header */}
        <div className="vendor-orders-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:20}}>
          <div>
            <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.06em',marginBottom:8}}>VENDOR PANEL • {stats.total} ORDERS</span>
            <h1 style={{margin:'0 0 6px',fontSize:'clamp(22px,3vw,28px)',fontWeight:900}}>My Orders</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:13}}>Manage and update your customer orders. Revenue: <strong style={{color:'#166534'}}>₹{fmt(stats.revenue)}</strong></p>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <div style={{position:'relative'}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order, customer..." style={{minWidth:200,minHeight:40,padding:'0 14px 0 34px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',outline:'none',fontSize:13}} />
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'#b8b3a9'}}>🔍</span>
            </div>
            <select value={filter} onChange={e=>setFilter(e.target.value)} style={{minHeight:40,padding:'0 32px 0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:13,fontWeight:600,outline:'none'}}>
              <option value="All">All Orders</option>
              {ORDER_STATUSES.map(s=><option key={s} value={s}>{getStatusLabel(s)}</option>)}
            </select>
            <button onClick={()=>loadOrders(true)} disabled={refreshing} style={{minHeight:40,padding:'0 18px',borderRadius:999,background:'#fff',border:'1px solid #ece8de',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              {refreshing ? "↻ Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}><span>⚠️ {error}</span><button onClick={()=>loadOrders(true)} style={{minHeight:32,padding:'0 12px',borderRadius:999,background:'#fff',border:'1px solid #fecaca',fontSize:12,fontWeight:700}}>Try Again</button></div>}

        {/* Stats like Flipkart */}
        <div className="vendor-orders-summary" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
          {[
            {k:'Total',v:stats.total,sub:'All time',color:'#1a1816'},
            {k:'Pending',v:stats.pending,sub:'Needs action',color:'#854d0e',bg:'#fefce8'},
            {k:'Processing',v:stats.processing,sub:'In progress',color:'#1e40af',bg:'#eff6ff'},
            {k:'Shipped',v:stats.shipped,sub:'On the way',color:'#166534',bg:'#f0fdf4'},
            {k:'Delivered',v:stats.delivered,sub:`₹${fmt(stats.revenue)}`,color:'#166534',bg:'#f0fdf4'},
            {k:'Cancelled',v:stats.cancelled,sub:'Lost',color:'#991b1b',bg:'#fef2f2'},
          ].map(s=>(
            <div key={s.k} style={{background: s.bg || '#fff',border:'1px solid #ece8de',borderRadius:16,padding:14}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>{s.k}</span>
              <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:4}}>
                <strong style={{fontSize:22,fontWeight:900,color: s.color || '#1a1816'}}>{s.v}</strong>
                <span style={{fontSize:11,color:'#8c8881'}}>{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="vendor-orders-table-wrapper" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
          {filtered.length===0 ? (
            <div style={{padding:60,textAlign:'center'}}>
              <div style={{width:72,height:72,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',borderRadius:'50%',fontSize:32}}>📦</div>
              <h2 style={{margin:'0 0 8px',fontSize:18,fontWeight:900}}>No Orders Found</h2>
              <p style={{margin:'0 0 16px',color:'#8c8881',fontSize:13}}>{orders.length===0 ? "There are no customer orders yet." : "No orders matching this filter."}</p>
              {orders.length>0 && filter!=="All" && <button onClick={()=>{setFilter("All"); setSearch("");}} style={{minHeight:40,padding:'0 18px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontSize:13,fontWeight:700}}>View All Orders</button>}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div style={{overflowX:'auto'}} className="desktop-only">
                <table className="vendor-orders-table" style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{background:'#fafaf7',borderBottom:'1px solid #ece8de',textAlign:'left'}}>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Order ID</th>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Customer</th>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Products</th>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Qty</th>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Total</th>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Date</th>
                      <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(order=>{
                      const st = String(order.status||"PENDING").toUpperCase();
                      const stStyle = statusStyle(st);
                      const isUpdating = updatingId===order.id;
                      const items = Array.isArray(order.items) ? order.items : [];
                      return (
                        <tr key={order.id} style={{borderBottom:'1px solid #f5f2eb',transition:'.2s'}}>
                          <td style={{padding:'16px'}}><strong style={{fontSize:12}}>#{order.order_number || order.id}</strong><div style={{fontSize:10,color:'#8c8881',marginTop:2}}>{getCount(order)} items</div></td>
                          <td style={{padding:'16px'}}><div style={{fontWeight:700,fontSize:13}}>{getName(order)}</div>{getPhone(order) && <div style={{fontSize:11,color:'#8c8881',marginTop:2}}>📞 {getPhone(order)}</div>}</td>
                          <td style={{padding:'16px',maxWidth:240}}>
                            {items.length>0 ? items.map(it=>(
                              <div key={it.id || `${order.id}-${it.product}`} style={{marginBottom:6}}>
                                <div style={{fontWeight:600,fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:200}}>{it.product || it.product_name || `Product #${it.product_id||""}`}</div>
                                {it.sku && <div style={{fontSize:10,color:'#8c8881'}}>SKU: {it.sku} • Qty {it.quantity}</div>}
                              </div>
                            )) : "-"}
                          </td>
                          <td style={{padding:'16px'}}><span style={{minWidth:28,minHeight:28,display:'inline-grid',placeItems:'center',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:8,fontWeight:800}}>{getCount(order)}</span></td>
                          <td style={{padding:'16px'}}><strong style={{fontSize:13}}>₹{fmt(getTotal(order))}</strong></td>
                          <td style={{padding:'16px',fontSize:12,color:'#8c8881'}}>{formatDate(getDate(order))}</td>
                          <td style={{padding:'16px'}}>
                            <div style={{display:'flex',flexDirection:'column',gap:6,minWidth:140}}>
                              <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 10px',borderRadius:999,background:stStyle.bg,border:`1px solid ${stStyle.border}`,fontSize:11,fontWeight:700,color:stStyle.color,width:'fit-content'}}>
                                <span style={{width:6,height:6,borderRadius:'50%',background:stStyle.dot,display:'inline-block'}} />{getStatusLabel(st)}
                              </div>
                              <select value={st} onChange={e=>updateStatus(order.id, e.target.value)} disabled={isUpdating || updatingId!==null} style={{minHeight:34,padding:'0 8px',borderRadius:8,border:'1px solid #ece8de',fontSize:12,fontWeight:600,outline:'none',background:'#fff'}}>
                                {ORDER_STATUSES.map(s=><option key={s} value={s}>{getStatusLabel(s)}</option>)}
                              </select>
                              {isUpdating && <span style={{fontSize:10,color:'#8c8881'}}>Updating...</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div style={{display:'none'}} className="mobile-only">
                {filtered.map(order=>{
                  const st = String(order.status||"PENDING").toUpperCase();
                  const stStyle = statusStyle(st);
                  return (
                    <div key={order.id} style={{padding:16,borderBottom:'1px solid #f5f2eb',display:'flex',flexDirection:'column',gap:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <strong>#{order.order_number || order.id}</strong>
                        <span style={{padding:'4px 10px',borderRadius:999,background:stStyle.bg,border:`1px solid ${stStyle.border}`,fontSize:11,fontWeight:700,color:stStyle.color}}>{getStatusLabel(st)}</span>
                      </div>
                      <div style={{fontSize:12}}><strong>{getName(order)}</strong> • ₹{fmt(getTotal(order))} • {getCount(order)} items • {formatDate(getDate(order))}</div>
                      <select value={st} onChange={e=>updateStatus(order.id, e.target.value)} disabled={updatingId!==null} style={{minHeight:40,borderRadius:10,border:'1px solid #ece8de',padding:'0 12px',fontSize:13,fontWeight:600}}>
                        {ORDER_STATUSES.map(s=><option key={s} value={s}>{getStatusLabel(s)}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:900px){.desktop-only{display:none !important;} .mobile-only{display:block !important;}} @media(min-width:901px){.mobile-only{display:none !important;}}`}</style>
    </main>
  );
}

export default VendorOrders;