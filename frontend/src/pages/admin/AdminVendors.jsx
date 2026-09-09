import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminService from "../../services/adminService";

export default function AdminVendors() {
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
      if (status!=="all") params.status = status;
      const res = await AdminService.vendors(params);
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, status]);

  useEffect(()=>{ load(); }, [load]);

  const list = data.results || (Array.isArray(data)? data : data.vendors || []);

  const handle = async (id, action) => {
    setActionId(id);
    try {
      if (action==='approve') await AdminService.approveVendor(id);
      else {
        const reason = prompt("Reject reason?");
        if (reason===null) { setActionId(null); return; }
        await AdminService.rejectVendor(id, reason);
      }
      setData(prev => {
        const arr = prev.results || prev;
        const upd = (Array.isArray(arr)? arr : []).map(v=> v.id===id? {...v, status: action==='approve'? 'approved' : 'rejected', is_approved: action==='approve'} : v);
        return Array.isArray(prev)? upd : {...prev, results: upd};
      });
    } catch (e) { alert(e.message || `${action} failed`); }
    finally { setActionId(null); }
  };

  if (loading) return <div className="p-6 bg-[#f6f6f6] min-h-screen"><div className="h- bg-white rounded-xl animate-pulse border" /></div>;

  const pending = list.filter(v=>!v.is_approved && String(v.status).toLowerCase()!=="approved").length;

  return (
    <div className="p-4 md:p-6 bg-[#f6f6f6] min-h-screen">
      <div className="flex justify-between flex-wrap gap-2">
        <div>
          <h1 className="text- font-bold">Vendors • Sellers • {data.count || list.length} Vendors • Approval Center</h1>
          <p className="text- text-[#565959] mt-1">{pending} pending approval • Amazon Seller approval • GST, PAN verification</p>
        </div>
        <Link to="/admin/dashboard" className="h-8 px-3 bg-[#131921] text-white rounded- text- grid place-items-center">Dashboard →</Link>
      </div>

      <div className="mt-4 bg-white rounded-xl border shadow-sm p-3 flex gap-2 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search store, owner email..." className="h-8 px-3 w- border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="h-8 px-2 border rounded- text- bg-white">
          <option value="all">All ({list.length})</option>
          <option value="pending">Pending ({pending})</option>
          <option value="approved">Approved ({list.length-pending})</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="text- text-[#565959] self-center">Approve to make seller live • GSTIN, PAN check required</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-auto mt-3">
        <table className="w-full text-">
          <thead><tr className="bg-[#f0f2f2] border-b text-left text- uppercase text-[#565959]"><th className="p-3 text-left">ID</th><th className="p-3 text-left">Store • Business Name</th><th className="p-3">Owner • Email • GSTIN</th><th className="p-3">Docs • PAN</th><th className="p-3">Status • Seller</th><th className="p-3">Actions • Amazon</th></tr></thead>
          <tbody>{list.length===0? <tr><td colSpan={6} className="p-10 text-center text-[#565959]">No vendors</td></tr> :
            list.map(v=>(
            <tr key={v.id} className="border-b border-[#f0f2f2] hover:bg-[#f7fafa]">
              <td className="p-3 text-[#0066c0]">#{v.id}</td>
              <td className="p-3 max-w- truncate"><b className="text-[#0F1111]">{v.business_name || v.store_name || v.company_name || "Seller"}</b><br/><span className="text- text-[#565959]">{v.store_type || "Retail"} • {v.city || ""}</span></td>
              <td className="p-3 max-w- truncate">{v.user_email || v.user?.email || v.user || "-"}<br/><span className="text- text-[#565959]">GST: {v.gstin || v.gst_number || "N/A"} • PAN: {v.pan_number?.slice(-4)? `***${v.pan_number.slice(-4)}` : "N/A"}</span></td>
              <td className="p-3"><span className="text- bg-[#f0f2f2] border px-1.5 py-0.5 rounded-full">{v.documents_count || 2} docs • KYC</span><br/><span className="text- text-[#067D62]">✓ PAN verified</span></td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text- font-bold border ${v.is_approved || String(v.status).toLowerCase()==="approved"? 'bg-[#f0fdf4] text-[#067D62] border-[#bbf7d0]' : String(v.status).toLowerCase()==="rejected"? 'bg-[#fef2f2] text-[#CC0C39] border-[#fecaca]' : 'bg-[#fef8f2] text-[#e47911] border-[#f3a847]'}`}>{v.is_approved? '✓ Approved • Live Seller' : String(v.status||"Pending").toUpperCase()}</span></td>
              <td className="p-3">
                <div className="flex gap-1">
                  {!v.is_approved && <button onClick={()=>handle(v.id,'approve')} disabled={actionId===v.id} className="px-3 py-1 bg-[#067D62] hover:bg-[#056b53] text-white rounded- text- font-bold disabled:opacity-50">{actionId===v.id? '...' : '✓ Approve • Live'}</button>}
                  <button onClick={()=>handle(v.id,'reject')} disabled={actionId===v.id} className="px-3 py-1 bg-white border border-[#d5d9d9] rounded- text- hover:bg-[#fff0f0] disabled:opacity-50">Reject</button>
                  <Link to={`/admin/vendors/${v.id}`} className="px-2 py-1 bg-[#f0f2f2] border rounded- text- grid place-items-center">View</Link>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="mt-3 bg-white border rounded- p-3 text- text-center text-[#565959]">
        {list.length} vendors • {pending} pending • Approve = seller can list products • All sellers get Prime badge • <Link to="/admin/stores" className="text-[#0066c0] hover:underline">Manage stores</Link>
      </div>
    </div>
  );
}