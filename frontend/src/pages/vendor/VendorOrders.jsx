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
      const list = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : [];
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
      setOrders(prev => prev.map(o => o.id===orderId? {...o, status: updated} : o));
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
      if (st==="DELIVERED") { s.delivered++; s.revenue += Number(o.total?? o.total_amount?? 0); }
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
  const getCount = (o) => Array.isArray(o?.items)? o.items.reduce((t,i)=>t+Number(i?.quantity||0),0) : 0;
  const getName = (o) => o?.customer || o?.customer_name || o?.user?.username || "Customer";
  const getPhone = (o) => o?.phone || o?.customer_phone || o?.user?.phone || "";
  const getTotal = (o) => o?.total?? o?.total_amount?? 0;
  const getDate = (o) => o?.date || o?.created_at || o?.created;
  const getStatusLabel = (s) => s? String(s).replaceAll("_"," ").toLowerCase().replace(/^\w/,(c)=>c.toUpperCase()) : "Unknown";

  const statusStyle = (s) => {
    const m = {
      PENDING:{bg:'#fefce8',border:'#fde68a',color:'#854d0e',dot:'#eab308'},
      CONFIRMED:{bg:'#eff6ff',border:'#bfdbfe',color:'#1e40af',dot:'#3b82f6'},
      PROCESSING:{bg:'#eff6ff',border:'#bfdbfe',color:'#1e40af',dot:'#3b82f6'},
      SHIPPED:{bg:'#fef8f2',border:'#f3a847',color:'#C45500',dot:'#e47911'},
      DELIVERED:{bg:'#f0fdf4',border:'#bbf7d0',color:'#067D62',dot:'#067D62'},
      CANCELLED:{bg:'#fef2f2',border:'#fecaca',color:'#CC0C39',dot:'#CC0C39'},
    };
    return m[s] || m.PENDING;
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto flex flex-col gap-3">
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">{[1,2,3,4,5,6].map(i=><div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />)}</div>
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-start shadow-sm">
          <div>
            <div className="text- font-bold uppercase text-[#C45500]">SELLER CENTRAL • {stats.total} ORDERS</div>
            <h1 className="text- font-bold">Manage Orders</h1>
            <p className="text- text-[#565959]">Manage and update your customer orders. Revenue: <strong className="text-[#067D62]">₹{fmt(stats.revenue)}</strong></p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order, customer..." className="min-w- h-8 pl-7 pr-2 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]" />
              <span className="absolute left-2 top-1.5 text-">🔍</span>
            </div>
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-8 px-2 pr-6 border border-[#a6a6a6] rounded- bg-[#f0f2f2] text- font-medium">
              <option value="All">All Orders</option>
              {ORDER_STATUSES.map(s=><option key={s} value={s}>{getStatusLabel(s)}</option>)}
            </select>
            <button onClick={()=>loadOrders(true)} disabled={refreshing} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">{refreshing? "↻ Refreshing..." : "↻ Refresh"}</button>
          </div>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text- text-[#c40000] shadow-sm flex justify-between">⚠ {error}<button onClick={()=>loadOrders(true)} className="h-6 px-2 bg-white border border-[#d5d9d9] rounded- text-">Try Again</button></div>}

        <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            {k:'Total',v:stats.total,sub:'All time'},
            {k:'Pending',v:stats.pending,sub:'Needs action',color:'#854d0e',bg:'#fefce8'},
            {k:'Processing',v:stats.processing,sub:'In progress',color:'#1e40af',bg:'#eff6ff'},
            {k:'Shipped',v:stats.shipped,sub:'On the way',color:'#C45500',bg:'#fef8f2'},
            {k:'Delivered',v:stats.delivered,sub:`₹${fmt(stats.revenue)}`,color:'#067D62',bg:'#f0fdf4'},
            {k:'Cancelled',v:stats.cancelled,sub:'Lost',color:'#CC0C39',bg:'#fef2f2'},
          ].map(s=>(
            <div key={s.k} className="bg-white border border-[#d5d9d9] rounded- p-2.5 shadow-sm" style={{background: s.bg || '#fff'}}>
              <div className="text- font-bold uppercase text-[#565959]">{s.k}</div>
              <div className="flex items-baseline gap-1 mt-1"><strong className="text- font-bold" style={{color: s.color || '#0F1111'}}>{s.v}</strong><span className="text- text-[#767676]">{s.sub}</span></div>
            </div>
          ))}
        </div>

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded- overflow-hidden shadow-sm">
          {filtered.length===0? (
            <div className="p-10 text-center">
              <div className="text-5xl">📦</div>
              <h2 className="font-bold mt-2">No Orders Found</h2>
              <p className="text- text-[#565959] mt-1">{orders.length===0? "There are no customer orders yet." : "No orders matching this filter."}</p>
              {orders.length>0 && filter!=="All" && <button onClick={()=>{setFilter("All"); setSearch("");}} className="mt-3 h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded- text- shadow-sm">View All Orders</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-">
                <thead>
                  <tr className="bg-[#f0f2f2] border-b border-[#d5d9d9] text-left">
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Order ID</th>
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Customer</th>
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Products</th>
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Qty</th>
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Total</th>
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Date</th>
                    <th className="p-3 text- font-bold uppercase text-[#565959]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order=>{
                    const st = String(order.status||"PENDING").toUpperCase();
                    const stStyle = statusStyle(st);
                    const isUpdating = updatingId===order.id;
                    const items = Array.isArray(order.items)? order.items : [];
                    return (
                      <tr key={order.id} className="border-b border-[#f0f2f2] hover:bg-[#f7f7f7]">
                        <td className="p-3"><strong className="text-">#{order.order_number || order.id}</strong><div className="text- text-[#767676]">{getCount(order)} items</div></td>
                        <td className="p-3"><div className="font-bold text-">{getName(order)}</div>{getPhone(order) && <div className="text- text-[#565959]">📞 {getPhone(order)}</div>}</td>
                        <td className="p-3 max-w-">
                          {items.length>0? items.map(it=>(
                            <div key={it.id || `${order.id}-${it.product}`} className="mb-1">
                              <div className="font-medium text- truncate">{it.product || it.product_name || `Product #${it.product_id||""}`}</div>
                              {it.sku && <div className="text- text-[#767676]">SKU: {it.sku} • Qty {it.quantity}</div>}
                            </div>
                          )) : "-"}
                        </td>
                        <td className="p-3"><span className="w-6 h-6 grid place-items-center bg-[#f0f2f2] border border-[#d5d9d9] rounded- text- font-bold">{getCount(order)}</span></td>
                        <td className="p-3"><strong className="text-">₹{fmt(getTotal(order))}</strong></td>
                        <td className="p-3 text- text-[#565959]">{formatDate(getDate(order))}</td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 min-w-">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text- font-bold w-fit" style={{background:stStyle.bg, borderColor:stStyle.border, color:stStyle.color}}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{background:stStyle.dot}} />{getStatusLabel(st)}
                            </div>
                            <select value={st} onChange={e=>updateStatus(order.id, e.target.value)} disabled={isUpdating || updatingId!==null} className="h-7 px-1 border border-[#a6a6a6] rounded- text- font-medium bg-white">
                              {ORDER_STATUSES.map(s=><option key={s} value={s}>{getStatusLabel(s)}</option>)}
                            </select>
                            {isUpdating && <span className="text- text-[#767676]">Updating...</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorOrders;