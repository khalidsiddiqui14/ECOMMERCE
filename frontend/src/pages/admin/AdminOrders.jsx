import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminService from "../../services/adminService";

const fmtMoney = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;
const fmtDate = (v) => { if(!v) return "-"; const d=new Date(v); return isNaN(d)? "-" : d.toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"}); };

export default function AdminOrders() {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter!=="all") params.status = statusFilter;
      const res = await AdminService.orders(params);
      setData(res);
    } catch (e) {
      setError(e.message || "Orders load failed");
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(()=>{ load(); }, [load]);

  const list = data.results || data.orders || (Array.isArray(data)? data : []);
  const filtered = list; // backend already filters, but keep for local

  const statusColor = (s) => {
    const st = String(s||"").toUpperCase();
    if (st==="DELIVERED") return "bg-[#f0fdf4] text-[#067D62] border-[#bbf7d0]";
    if (st==="SHIPPED") return "bg-[#fef8f2] text-[#e47911] border-[#f3a847]";
    if (st==="CONFIRMED" || st==="PROCESSING") return "bg-[#f0f8ff] text-[#0066c0] border-[#a4c7e5]";
    if (st==="PLACED" || st==="PENDING") return "bg-[#f0f2f2] text-[#565959] border-[#d5d9d9]";
    if (st==="CANCELLED" || st==="FAILED") return "bg-[#fef2f2] text-[#CC0C39] border-[#fecaca]";
    return "bg-[#f0f2f2] text-[#565959] border-[#d5d9d9]";
  };

  const payColor = (s) => {
    const st = String(s||"").toUpperCase();
    if (st==="PAID") return "text-[#067D62] font-bold";
    if (st==="PENDING") return "text-[#e47911]";
    if (st==="FAILED") return "text-[#CC0C39]";
    return "text-[#565959]";
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await AdminService.updateOrderStatus(id, newStatus);
      setData(prev => {
        const l = prev.results || prev;
        const updated = (Array.isArray(l)? l : []).map(o=> o.id===id? {...o, status: newStatus} : o);
        return Array.isArray(prev)? updated : {...prev, results: updated};
      });
    } catch (e) {
      alert(e.message || "Status update failed");
    } finally { setUpdatingId(null); }
  };

  if (loading) {
    return <div className="p-6 bg-[#f6f6f6] min-h-screen"><div className="h- bg-white rounded-xl border animate-pulse" /></div>;
  }

  return (
    <div className="p-4 md:p-6 bg-[#f6f6f6] min-h-screen">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text- font-bold text-[#0F1111]">All Orders • {data.count || list.length} Orders • ShopZone Admin</h1>
          <p className="text- text-[#565959] mt-1">Manage orders, update status, refunds • Amazon Seller Central • Search, filter, 1-click update</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">↻ Refresh</button>
          <Link to="/admin/dashboard" className="h-8 px-3 bg-[#131921] text-white rounded- text- grid place-items-center">Dashboard →</Link>
        </div>
      </div>

      {error && <div className="mt-3 bg-white border-l- border-[#CC0C39] p-3 text- text-[#CC0C39] rounded- shadow-sm">⚠ {error} <button onClick={load} className="ml-2 text-[#0066c0] font-bold">Retry</button></div>}

      <div className="mt-4 bg-white rounded-xl shadow-sm border border-[#d5d9d9] p-3 flex flex-wrap gap-2 items-center">
        <div className="relative">
          <span className="absolute left-2 top-1.5 text- text-[#565959]">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search order ID, user email..." className="h-8 pl-7 pr-3 w- border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-8 px-2 border border-[#d5d9d9] rounded- text- bg-white">
          <option value="all">All Status ({list.length})</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <span className="text- text-[#565959]">• Showing {filtered.length} orders • Click status to update • Prime orders auto-tagged</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#d5d9d9] overflow-auto mt-3">
        <table className="w-full text-">
          <thead><tr className="bg-[#f0f2f2] border-b border-[#d5d9d9] text-left text- uppercase tracking-wide text-[#565959]"><th className="p-3">Order ID</th><th className="p-3">User / Email</th><th className="p-3 text-right">Total</th><th className="p-3">Payment</th><th className="p-3">Status • Click to update</th><th className="p-3">Date • Prime</th><th className="p-3"></th></tr></thead>
          <tbody>
            {filtered.length===0? (
              <tr><td colSpan={7} className="p-10 text-center text-[#565959]">No orders found {search? `for "${search}"` : ""} • Try different filter</td></tr>
            ) : filtered.map(o=>(
            <tr key={o.id} className="border-b border-[#f0f2f2] hover:bg-[#f7fafa]">
              <td className="p-3 font-medium text-[#0066c0]">#{o.order_number || o.id}</td>
              <td className="p-3 max-w- truncate">{o.user_email || o.user?.email || o.user || o.customer_email || "-"}<br/><span className="text- text-[#767676]">{o.shipping_address?.city || ""}</span></td>
              <td className="p-3 text-right font-bold text-[#0F1111]">{fmtMoney(o.total_amount || o.total || o.grand_total)}<br/><span className="text- text-[#565959] font-normal">{o.items_count || o.items?.length || "-"} items</span></td>
              <td className="p-3"><span className={payColor(o.payment_status)}>{String(o.payment_status||"PENDING").toUpperCase()}</span><br/><span className="text- text-[#565959]">{o.payment_method || "COD"}</span></td>
              <td className="p-3">
                <select value={String(o.status||"PLACED").toUpperCase()} onChange={e=>handleStatusChange(o.id, e.target.value)} disabled={updatingId===o.id} className={`px-2 py-1 rounded-full text- font-bold border outline-none ${statusColor(o.status)} disabled:opacity-50`}>
                  <option value="PLACED">PLACED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                {updatingId===o.id && <span className="ml-2 text- text-[#e47911]">Updating...</span>}
              </td>
              <td className="p-3 text-[#565959]">{fmtDate(o.created_at)}<br/><span className="text- bg-[#f0fdf4] border border-[#bbf7d0] text-[#067D62] px-1 rounded-full">Prime FREE</span></td>
              <td className="p-3 text-right"><Link to={`/admin/orders/${o.id}`} className="text-[#0066c0] hover:underline font-bold text-">View →</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="mt-3 bg-white border border-[#d5d9d9] rounded- p-3 text- text-[#565959] text-center">
        Total {filtered.length} orders • Revenue {fmtMoney(filtered.reduce((s,o)=> s+Number(o.total_amount||0),0))} • Use status dropdown to update 1-click • All changes auto-saved • <Link to="/admin/analytics" className="text-[#0066c0] hover:underline">View revenue analytics</Link>
      </div>
    </div>
  );
}