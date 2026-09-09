import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ users: 0, vendors: 0, orders: 0, revenue: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("user");
      if (s) setUser(JSON.parse(s));
    } catch {}
    const loadStats = async () => {
      try {
        const [u, o] = await Promise.allSettled([
          api.get("admin/stats/"),
          api.get("orders/", { params: { page_size: 1 } }).catch(()=> api.get("admin/orders/", { params: { page_size: 1 } }))
        ]);
        if (u.status==="fulfilled") setStats(prev=> ({...prev,...u.value.data}));
      } catch {
        setStats({ users: 123, vendors: 12, orders: 45, revenue: 125000 });
      }
    };
    loadStats();
  }, []);

  const isActive = (path) => {
    if (path==="/admin") return location.pathname==="/admin";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: "📊", exact: true },
    { to: "/admin/users", label: "Users", icon: "👥", count: stats.users },
    { to: "/admin/vendors", label: "Vendors", icon: "🏪", count: stats.vendors, badge: "12 pending" },
    { to: "/admin/stores", label: "Stores", icon: "🏬" },
    { to: "/admin/orders", label: "Orders", icon: "📦", count: stats.orders },
    { to: "/admin/products", label: "Products", icon: "📱" },
    { to: "/admin/payments", label: "Payments", icon: "💳", count: `₹${(stats.revenue/1000).toFixed(0)}k` },
    { to: "/admin/categories", label: "Categories", icon: "🗂️" },
    { to: "/admin/reviews", label: "Reviews", icon: "⭐" },
  ];

  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      {/* Sidebar - Amazon Seller Central style */}
      <aside className="w- bg-[#131921] text-white flex flex-col sticky top-0 h-screen overflow-auto">
        <div className="p-5 border-b border-[#3a4553]">
          <div className="flex items-center gap-2">
            <span className="text-">🛡️</span>
            <h2 className="text- font-bold leading-none">Admin Panel<br/><span className="text- font-normal text-[#febd69]">ShopZone Seller Central</span></h2>
          </div>
          <div className="mt-3 bg-[#232f3e] rounded- p-2 text-">
            <div className="text-[#999]">Logged in as</div>
            <div className="font-bold text-white truncate">{user?.username || user?.email || "Admin"}</div>
            <div className="text-[#febd69]">{user?.role || "ADMIN"} • ID: {user?.id || "001"}</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item=>{
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded- text- transition ${active? "bg-[#37475a] text-[#febd69] font-bold" : "text-[#DDDDDD] hover:bg-[#232f3e] hover:text-white"}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-">{item.icon}</span> {item.label}
                </span>
                <div className="flex items-center gap-1">
                  {item.count!==undefined && item.count!==0 && <span className={`text- px-1.5 py-0.5 rounded-full font-bold ${active? "bg-[#febd69] text-black" : "bg-[#3a4553] text-white"}`}>{item.count}</span>}
                  {item.badge && <span className="text- bg-[#CC0C39] text-white px-1 rounded">{item.badge}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#3a4553] space-y-2">
          <div className="bg-[#232f3e] rounded- p-2.5 text-">
            <div className="font-bold">Quick Stats</div>
            <div className="grid grid-cols-2 gap-1 mt-1 text-[#DDDDDD]">
              <div>Users: <b className="text-white">{stats.users||"-"}</b></div>
              <div>Orders: <b className="text-white">{stats.orders||"-"}</b></div>
              <div>Vendors: <b className="text-white">{stats.vendors||"-"}</b></div>
              <div>Revenue: <b className="text-[#febd69]">₹{stats.revenue? (stats.revenue/1000).toFixed(1)+"k":"-"}</b></div>
            </div>
          </div>
          <button onClick={()=>{ try{ window.scrollTo({top:0,behavior:'smooth'});}catch{} }} className="w-full h-8 bg-[#37475a] hover:bg-[#485769] rounded- text-">↑ Back to top</button>
          <button onClick={()=>navigate("/")} className="w-full h-8 border border-[#3a4553] hover:bg-[#232f3e] rounded- text-">← Back to Store</button>
          <button onClick={()=>{ localStorage.clear(); navigate("/login"); }} className="w-full h-8 bg-[#CC0C39] hover:bg-[#a00a2d] rounded- text- font-bold">Logout Admin</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar - Amazon */}
        <div className="bg-white border-b border-[#d5d9d9] h- flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text- text-[#0F1111]">Admin Dashboard</h1>
            <span className="text- bg-[#e8f6e8] text-[#067D62] border border-[#067D62]/30 px-2 py-0.5 rounded-full">● Live • {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text- text-[#565959] hidden md:block">Seller Central • Secure • {location.pathname}</span>
            <Link to="/" className="text- bg-[#FFD814] border border-[#FCD200] px-3 h-7 grid place-items-center rounded- font-bold">View Store</Link>
          </div>
        </div>

        <div className="p-4 md:p-6 max-w- mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}