import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminService from "../../services/adminService";

const fmtMoney = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;
const fmtDate = (v) => { if(!v) return "-"; const d=new Date(v); return isNaN(d)? "-" : d.toLocaleDateString("en-IN", {day:"2-digit", month:"short"}); };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await AdminService.dashboard();
      setStats(data);
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR", err);
      setError(err.message || "Dashboard load failed. Check admin login & token in localStorage.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="p-6 bg-[#f6f6f6] min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i=><div key={i} className="h-24 bg-white rounded-xl border" />)}
          </div>
          <div className="h-64 bg-white rounded-xl border" />
        </div>
      </div>
    );
  }

  if (error &&!stats) {
    return (
      <div className="p-8 bg-[#f6f6f6] min-h-screen grid place-items-center">
        <div className="bg-white rounded-xl shadow p-8 text-center border max-w- w-full">
          <div className="text-">⚠️</div>
          <h2 className="font-bold text- mt-2">Failed to load Admin Dashboard</h2>
          <p className="text- text-[#565959] mt-2">{error}</p>
          <p className="text- text-[#767676] mt-2">Check: 1) Admin login done? 2) Token in localStorage? 3) Backend /api/admin-panel/dashboard/ running? 4) CORS?</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={()=>load()} className="h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold shadow-sm">Try Again</button>
            <Link to="/login" className="h-8 px-4 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center">Admin Login</Link>
          </div>
        </div>
      </div>
    );
  }

  // Flexible stats — backend can return different keys
  const totalUsers = stats?.total_users?? stats?.users_count?? stats?.users?.total?? 0;
  const totalVendors = stats?.total_vendors?? stats?.vendors_count?? 0;
  const totalStores = stats?.total_stores?? stats?.stores_count?? 0;
  const totalOrders = stats?.total_orders?? stats?.orders_count?? 0;
  const totalRevenue = stats?.total_revenue?? stats?.revenue?? stats?.total_sales?? 0;
  const pendingVendors = stats?.pending_vendors?? stats?.vendors_pending?? 0;
  const pendingProducts = stats?.pending_products?? stats?.products_pending?? 0;
  const todayOrders = stats?.today_orders?? stats?.orders_today?? 0;
  const recentOrders = stats?.recent_orders?? stats?.latest_orders?? stats?.orders?? [];

  const cards = [
    { label: "Total Users", value: totalUsers, sub: "Registered • Active", color: "bg-[#f0f8ff] border-[#a4c7e5] text-[#0066c0]", icon: "👥", link: "/admin/users" },
    { label: "Total Vendors", value: totalVendors, sub: `${pendingVendors} pending approval`, color: "bg-[#fef8f2] border-[#f3a847] text-[#e47911]", icon: "🏪", link: "/admin/vendors" },
    { label: "Total Stores", value: totalStores, sub: "Brand Stores • Official", color: "bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]", icon: "🏬", link: "/admin/stores" },
    { label: "Total Orders", value: totalOrders, sub: `${todayOrders} today • Prime`, color: "bg-[#f5f3ff] border-[#ddd6fe] text-[#8b5cf6]", icon: "📦", link: "/admin/orders" },
    { label: "Total Revenue", value: fmtMoney(totalRevenue), sub: "All time • GST included", color: "bg-[#131921] border-[#232f3e] text-white", icon: "💰", link: "/admin/payments" },
    { label: "Pending Approvals", value: (pendingVendors + pendingProducts), sub: `${pendingVendors} vendors • ${pendingProducts} products`, color: "bg-[#fef2f2] border-[#fecaca] text-[#CC0C39]", icon: "⏳", link: "/admin/vendors" },
  ];

  const statusColor = (s) => {
    const st = String(s||"").toUpperCase();
    if (st==="DELIVERED" || st==="PAID" || st==="COMPLETED") return "bg-[#f0fdf4] text-[#067D62] border-[#bbf7d0]";
    if (st==="SHIPPED" || st==="CONFIRMED") return "bg-[#fef8f2] text-[#e47911] border-[#f3a847]";
    if (st==="PENDING" || st==="PLACED") return "bg-[#f0f8ff] text-[#0066c0] border-[#a4c7e5]";
    if (st==="CANCELLED" || st==="FAILED") return "bg-[#fef2f2] text-[#CC0C39] border-[#fecaca]";
    return "bg-[#f0f2f2] text-[#565959] border-[#d5d9d9]";
  };

  return (
    <div className="p-4 md:p-6 bg-[#f6f6f6] min-h-screen">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <h1 className="text- font-bold text-[#0F1111]">Admin Dashboard • ShopZone Seller Central</h1>
          <p className="text- text-[#565959] mt-1">Overview • Users, vendors, stores, orders, revenue • Amazon Seller Central style • Real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>load(true)} disabled={refreshing} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa] disabled:opacity-50">{refreshing? "Refreshing..." : "↻ Refresh"}</button>
          <Link to="/admin/analytics" className="h-8 px-3 bg-[#131921] text-white rounded- text- grid place-items-center">Analytics →</Link>
        </div>
      </div>

      {error && <div className="mt-3 bg-white border-l- border-[#e47911] p-2 text- text-[#8a4a00] rounded- shadow-sm">⚠ {error} — showing cached data</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {cards.map(c => (
          <Link key={c.label} to={c.link} className={`rounded-xl shadow-sm p-5 border hover:shadow-md transition ${c.color} ${c.label==="Total Revenue"? "" : "bg-white"}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text- font-bold uppercase tracking-wide ${c.label==="Total Revenue"? "text-[#febd69]" : "text-[#565959]"}`}>{c.label}</p>
                <p className={`text- font-bold mt-2 ${c.label==="Total Revenue"? "text-white" : "text-[#0F1111]"}`}>{typeof c.value==="number"? c.value.toLocaleString("en-IN") : c.value}</p>
                <p className={`text- mt-1 ${c.label==="Total Revenue"? "text-[#a9a9a9]" : "text-[#767676]"}`}>{c.sub}</p>
              </div>
              <span className="w-10 h-10 bg-white border border-[#f0f2f2] rounded-full grid place-items-center text- shadow-sm">{c.icon}</span>
            </div>
            <div className={`mt-3 text- font-bold ${c.label==="Total Revenue"? "text-[#febd69]" : "text-[#0066c0]"} hover:underline`}>View details →</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-[#d5d9d9]">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-">Recent Orders • Latest {recentOrders.length} • Real-time</h2>
            <Link to="/admin/orders" className="text- text-[#0066c0] hover:underline font-bold">View all orders →</Link>
          </div>
          <div className="overflow-auto mt-4 -mx-2">
            <table className="w-full text-">
              <thead><tr className="text-left border-b border-[#e7e7e7] text-[#565959]"><th className="py-2 px-2 font-bold uppercase text-">Order ID</th><th className="py-2 px-2 font-bold uppercase text-">User / Email</th><th className="py-2 px-2 font-bold uppercase text-">Date</th><th className="py-2 px-2 font-bold uppercase text- text-right">Total</th><th className="py-2 px-2 font-bold uppercase text-">Status</th><th className="py-2 px-2"></th></tr></thead>
              <tbody>
                {recentOrders.length===0? (
                  <tr><td colSpan={6} className="py-10 text-center text-[#565959]">No recent orders • Backend /api/admin-panel/orders/ check karo</td></tr>
                ) : recentOrders.slice(0,8).map(o => (
                  <tr key={o.id} className="border-b border-[#f0f2f2] hover:bg-[#f7fafa]">
                    <td className="py-2.5 px-2 font-medium text-[#0066c0]">#{o.order_number || o.id}</td>
                    <td className="py-2.5 px-2 truncate max-w-">{o.user_email || o.user?.email || o.user || o.customer_email || "-"}</td>
                    <td className="py-2.5 px-2 text-[#565959]">{fmtDate(o.created_at)}</td>
                    <td className="py-2.5 px-2 text-right font-bold">{fmtMoney(o.total_amount || o.total || o.grand_total)}</td>
                    <td className="py-2.5 px-2"><span className={`px-2 py-0.5 rounded-full text- font-bold border ${statusColor(o.status)}`}>{String(o.status||"PLACED").toUpperCase()}</span></td>
                    <td className="py-2.5 px-2 text-right"><Link to={`/admin/orders/${o.id}`} className="text-[#0066c0] hover:underline text-">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-[#d5d9d9]">
            <h3 className="font-bold text-">Quick Actions • Amazon Admin</h3>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link to="/admin/vendors?status=pending" className="h-10 bg-[#fef8f2] border border-[#f3a847] rounded- grid place-items-center text- font-bold text-[#8a4a00] hover:bg-[#fef0d8]">Approve Vendors ({pendingVendors})</Link>
              <Link to="/admin/products?status=pending" className="h-10 bg-[#f0f8ff] border border-[#a4c7e5] rounded- grid place-items-center text- font-bold text-[#0066c0] hover:bg-[#e0efff]">Approve Products ({pendingProducts})</Link>
              <Link to="/admin/orders" className="h-10 bg-white border border-[#d5d9d9] rounded- grid place-items-center text- font-bold hover:bg-[#f7fafa]">All Orders</Link>
              <Link to="/admin/users" className="h-10 bg-white border border-[#d5d9d9] rounded- grid place-items-center text- font-bold hover:bg-[#f7fafa]">All Users</Link>
            </div>
          </div>

          <div className="bg-[#131921] text-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text- text-[#febd69]">Revenue • Today</h3>
            <div className="text- font-bold mt-2">{fmtMoney(totalRevenue)}</div>
            <div className="text- opacity-70 mt-1">{totalOrders} orders • Avg {fmtMoney(totalOrders? totalRevenue/totalOrders : 0)} • {todayOrders} today</div>
            <Link to="/admin/analytics" className="mt-3 inline-block h-8 px-3 bg-white text-[#131921] rounded- text- font-bold grid place-items-center">View Analytics • Sales Report →</Link>
          </div>

          <div className="bg-white rounded-xl border border-[#d5d9d9] p-4 text- text-[#565959] leading-">
            <b className="text-[#0F1111]">Admin Tips:</b> All cards link to detail pages. Use refresh to sync. Pending approvals need quick action. Revenue includes COD + Prepaid. Prime orders marked in orders table.
          </div>
        </div>
      </div>
    </div>
  );
}