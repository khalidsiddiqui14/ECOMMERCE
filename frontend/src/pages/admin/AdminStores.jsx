import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminService from "../../services/adminService";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const resolveImg = (s) => {
  try {
    let src = typeof s==="string"? s : s?.logo || s?.image;
    if (!src) return "";
    if (src.startsWith("http")) return src;
    if (src.startsWith("/media")) return `${BASE}${src}`;
    return `${BASE}/media/${src}`;
  } catch { return ""; }
};

export default function AdminStores() {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status!=="all") params.is_approved = status==="approved";
      const res = await AdminService.stores(params);
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(()=>{ load(); }, [load]);

  const list = data.results || (Array.isArray(data)? data : data.stores || []);

  const approve = async (id) => {
    setActionId(id);
    try {
      await AdminService.approveStore(id);
      setData(prev => {
        const arr = prev.results || prev;
        const upd = (Array.isArray(arr)? arr : []).map(s=> s.id===id? {...s, is_approved: true} : s);
        return Array.isArray(prev)? upd : {...prev, results: upd};
      });
    } catch (e) { alert(e.message || "Approve failed"); }
    finally { setActionId(null); }
  };

  const reject = async (id) => {
    const reason = prompt("Reject reason?");
    if (reason===null) return;
    setActionId(id);
    try {
      await AdminService.rejectStore(id, reason);
      setData(prev => {
        const arr = prev.results || prev;
        const upd = (Array.isArray(arr)? arr : []).map(s=> s.id===id? {...s, is_approved: false, status: "rejected"} : s);
        return Array.isArray(prev)? upd : {...prev, results: upd};
      });
    } catch (e) { alert(e.message); }
    finally { setActionId(null); }
  };

  if (loading) return <div className="p-6 bg-[#f6f6f6] min-h-screen"><div className="h- bg-white rounded-xl animate-pulse border" /></div>;

  return (
    <div className="p-4 md:p-6 bg-[#f6f6f6] min-h-screen">
      <div className="flex justify-between flex-wrap gap-2">
        <div>
          <h1 className="text- font-bold">All Brand Stores • {data.count || list.length} Stores • Official Stores</h1>
          <p className="text- text-[#565959] mt-1">{list.filter(s=>!s.is_approved).length} pending approval • Amazon Brand Stores style • Official verification</p>
        </div>
        <Link to="/admin/dashboard" className="h-8 px-3 bg-[#131921] text-white rounded- text- grid place-items-center">Dashboard →</Link>
      </div>

      <div className="mt-4 bg-white rounded-xl border shadow-sm p-3 flex gap-2 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search store name, owner..." className="h-8 px-3 w- border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="h-8 px-2 border rounded- text- bg-white">
          <option value="all">All ({list.length})</option>
          <option value="pending">Pending ({list.filter(s=>!s.is_approved).length})</option>
          <option value="approved">Approved ({list.filter(s=>s.is_approved).length})</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto mt-3">
        <table className="w-full text-">
          <thead><tr className="bg-[#f0f2f2] border-b text-left text- uppercase text-[#565959]"><th className="p-3">Logo</th><th className="p-3">ID</th><th className="p-3 text-left">Store Name • Official</th><th className="p-3">Owner • Vendor</th><th className="p-3">Products</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>{list.map(s=>(
            <tr key={s.id} className="border-b border-[#f0f2f2] hover:bg-[#f7fafa]">
              <td className="p-2"><img src={resolveImg(s.logo) || `https://ui-avatars.com/api/?name=${s.name}&background=f0f2f2`} alt="" className="w-10 h-10 rounded-full border object-contain bg-white" /></td>
              <td className="p-3 text-[#0066c0]">#{s.id}</td>
              <td className="p-3"><b className="text-[#0F1111]">{s.name}</b><br/><span className="text- text-[#565959]">{s.slug} • {s.description?.slice(0,40) || "Official Brand Store"}</span></td>
              <td className="p-3 truncate max-w-">{s.owner_email || s.owner?.email || s.vendor_email || s.vendor || "-"}<br/><span className="text- text-[#767676]">{s.created_at? new Date(s.created_at).toLocaleDateString("en-IN") : ""}</span></td>
              <td className="p-3">{s.products_count || s.total_products || "-"} products</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text- font-bold border ${s.is_approved? 'bg-[#f0fdf4] text-[#067D62] border-[#bbf7d0]' : 'bg-[#fef8f2] text-[#e47911] border-[#f3a847]'}`}>{s.is_approved? '✓ Approved • Live • Official' : '⏳ Pending • Review'}</span></td>
              <td className="p-3">
                <div className="flex gap-1">
                  {!s.is_approved && <button onClick={()=>approve(s.id)} disabled={actionId===s.id} className="px-3 py-1 bg-[#067D62] text-white rounded- text- font-bold disabled:opacity-50">{actionId===s.id? '...' : '✓ Approve'}</button>}
                  <button onClick={()=>reject(s.id)} disabled={actionId===s.id} className="px-3 py-1 bg-white border rounded- text-">Reject</button>
                  <Link to={`/store/${s.slug || s.id}`} className="px-2 py-1 bg-[#f0f2f2] border rounded- text- grid place-items-center">View</Link>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}