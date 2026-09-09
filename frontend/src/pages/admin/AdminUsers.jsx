import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminService from "../../services/adminService";

export default function AdminUsers() {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter!=="all") params.role = roleFilter;
      const d = await AdminService.users(params);
      setData(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    setActionId(id);
    try {
      await AdminService.toggleUser(id);
      setData(prev => {
        const arr = prev.results || prev;
        const upd = (Array.isArray(arr)? arr : []).map(u=> u.id===id? {...u, is_active:!u.is_active} : u);
        return Array.isArray(prev)? upd : {...prev, results: upd};
      });
    } catch (e) { alert(e.message || "Toggle failed"); }
    finally { setActionId(null); }
  };

  const ban = async (id) => {
    const reason = prompt("Ban reason? (spam, fraud, abuse)");
    if (reason===null) return;
    setActionId(id);
    try {
      await AdminService.banUser(id, reason);
      load();
    } catch (e) { alert(e.message); }
    finally { setActionId(null); }
  };

  if (loading) return <div className="p-6 bg-[#f6f6f6] min-h-screen"><div className="h- bg-white rounded-xl border animate-pulse" /></div>;

  const users = data.results || (Array.isArray(data)? data : data.users || []);

  const roleColor = (u) => {
    if (u.is_superuser) return "bg-[#131921] text-white";
    if (u.is_staff) return "bg-[#fef8f2] text-[#e47911] border-[#f3a847]";
    if (u.role==="vendor") return "bg-[#f0f8ff] text-[#0066c0] border-[#a4c7e5]";
    return "bg-[#f0f2f2] text-[#565959] border-[#d5d9d9]";
  };

  return (
    <div className="p-4 md:p-6 bg-[#f6f6f6] min-h-screen">
      <div className="flex justify-between flex-wrap gap-2">
        <div>
          <h1 className="text- font-bold">Users • {data.count || users.length} Customers • Admin</h1>
          <p className="text- text-[#565959] mt-1">{users.filter(u=>u.is_active).length} active • {users.filter(u=>!u.is_active).length} inactive • Amazon customer management</p>
        </div>
        <Link to="/admin/dashboard" className="h-8 px-3 bg-[#131921] text-white rounded- text- grid place-items-center">Dashboard →</Link>
      </div>

      {error && <div className="mt-3 bg-white border-l-4 border-[#CC0C39] p-3 text- text-[#CC0C39] rounded-">{error}</div>}

      <div className="mt-4 bg-white rounded-xl border shadow-sm p-3 flex gap-2 flex-wrap">
        <div className="relative">
          <span className="absolute left-2 top-1.5 text-">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search email, ID..." className="h-8 pl-7 pr-3 w- border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="h-8 px-2 border rounded- text- bg-white">
          <option value="all">All Roles ({users.length})</option>
          <option value="user">Users</option>
          <option value="vendor">Vendors</option>
          <option value="staff">Staff / Admin</option>
        </select>
        <span className="text- text-[#565959] self-center">Toggle active • Ban • Amazon style</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto mt-3">
        <table className="w-full text-">
          <thead><tr className="bg-[#f0f2f2] border-b text-left text- uppercase text-[#565959]"><th className="p-3 text-left">ID</th><th className="p-3 text-left">Email • User</th><th className="p-3">Role • Type</th><th className="p-3">Joined • Orders</th><th className="p-3">Active • Prime</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {users.length===0? <tr><td colSpan={6} className="p-10 text-center text-[#565959]">No users {search? `for "${search}"` : ""}</td></tr> :
            users.map(u => (
              <tr key={u.id} className="border-b border-[#f0f2f2] hover:bg-[#f7fafa]">
                <td className="p-3 text-[#0066c0] font-medium">#{u.id}</td>
                <td className="p-3 max-w- truncate"><b className="text-[#0F1111]">{u.email}</b><br/><span className="text- text-[#565959]">{u.username || ""} • {u.phone || ""}</span></td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text- font-bold border ${roleColor(u)}`}>{u.is_superuser? 'SUPER ADMIN' : u.is_staff? 'ADMIN' : (u.role || 'CUSTOMER').toUpperCase()}</span></td>
                <td className="p-3 text-[#565959]">{u.date_joined? new Date(u.date_joined).toLocaleDateString("en-IN") : "-"}<br/><span className="text-">{u.orders_count || 0} orders • {u.is_prime? "Prime" : "Free"}</span></td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text- font-bold border ${u.is_active? 'bg-[#f0fdf4] text-[#067D62] border-[#bbf7d0]' : 'bg-[#fef2f2] text-[#CC0C39] border-[#fecaca]'}`}>{u.is_active? '✅ Active • Live' : '❌ Inactive • Blocked'}</span></td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={()=>toggle(u.id)} disabled={actionId===u.id} className={`px-3 py-1 rounded- text- font-bold border disabled:opacity-50 ${u.is_active? 'bg-white hover:bg-[#fff0f0] text-[#CC0C39] border-[#fecaca]' : 'bg-[#067D62] text-white border-[#067D62] hover:bg-[#056b53]'}`}>{actionId===u.id? '...' : u.is_active? 'Deactivate' : 'Activate'}</button>
                    <button onClick={()=>ban(u.id)} disabled={actionId===u.id} className="px-2 py-1 bg-[#f0f2f2] border rounded- text- hover:bg-[#f7fafa]">Ban</button>
                    <Link to={`/admin/users/${u.id}`} className="px-2 py-1 bg-white border rounded- text- grid place-items-center hover:bg-[#f7fafa]">View</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 bg-white border rounded- p-3 text- text-center text-[#565959]">
        {users.length} users • {users.filter(u=>u.is_active).length} active • Click Deactivate to block login instantly • All actions logged • <Link to="/admin/analytics" className="text-[#0066c0] hover:underline">View user analytics</Link>
      </div>
    </div>
  );
}