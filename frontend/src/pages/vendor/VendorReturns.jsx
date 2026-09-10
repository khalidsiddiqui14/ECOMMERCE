import { useEffect, useState } from "react";
import api from "../../services/api";

function VendorReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("vendor/returns/");
      const d = res.data;
      setReturns(Array.isArray(d) ? d : d.results || []);
    } catch { setReturns([]); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`${action} this return?`)) return;
    try {
      await api.post(`vendor/returns/${id}/${action.toLowerCase()}/`);
      load();
    } catch (e) { alert(e.response?.data?.detail || "Failed"); }
  };

  const fmtMoney = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;
  const filtered = returns.filter(r => filter==="ALL" || r.status===filter);

  return (
    <div className="bg-[#EAEDED] min-h-screen">
      <div className="bg-[#131921] text-white p-4">
        <h1 className="text-[20px] font-bold">Seller Central • Returns Management</h1>
        <p className="text-[12px] text-[#a7acb2]">Manage customer return requests - Approve or Reject with reason</p>
      </div>

      <div className="max-w-[1200px] mx-auto p-3">
        <div className="bg-white border border-[#d5d9d9] rounded-[8px] p-3 flex gap-2 overflow-auto">
          {["ALL","PENDING","APPROVED","REJECTED"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-4 h-8 rounded-full text-[12px] font-bold border ${filter===s ? "bg-[#131921] text-white border-[#131921]" : "bg-white border-[#d5d9d9] text-[#565959]"}`}>{s} ({s==="ALL" ? returns.length : returns.filter(r=>r.status===s).length})</button>
          ))}
        </div>

        <div className="mt-3 bg-white border border-[#d5d9d9] rounded-[8px] shadow-sm overflow-hidden">
          <div className="p-3 border-b bg-[#f0f2f2] font-bold text-[13px]">Return Requests ({filtered.length})</div>
          {loading ? <div className="p-10 text-center text-[#565959]">Loading returns...</div> :
            filtered.length===0 ? <div className="p-12 text-center"><div className="text-[40px]">↩️</div><p className="text-[13px] text-[#565959] mt-2">No {filter.toLowerCase()} returns</p></div> :
            <div className="divide-y divide-[#f0f2f2]">
              {filtered.map(r=>(
                <div key={r.id} className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-[#f0f2f2] border rounded">RETURN #{r.id}</span>
                      <span className="text-[11px]">Order #{r.order} • {r.product_name || `Product #${r.item}`}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.status==="APPROVED"?"bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]":r.status==="REJECTED"?"bg-[#fef2f2] border-[#fecaca] text-[#CC0C39]":"bg-[#fefce8] border-[#fde68a]"}`}>{r.status}</span>
                    </div>
                    <p className="text-[13px] mt-2"><strong>Customer:</strong> {r.user_name || r.customer || "Customer"} • <strong>Reason:</strong> {r.reason}</p>
                    <p className="text-[12px] text-[#565959] mt-1">{r.description || r.customer_comment || "No extra comment"}</p>
                    <p className="text-[12px] mt-1">Refund: <strong>{fmtMoney(r.refund_amount)}</strong> • Requested: {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  {r.status==="PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={()=>handleAction(r.id,"APPROVE")} className="h-9 px-5 bg-[#067D62] text-white rounded-[8px] text-[12px] font-bold">Approve</button>
                      <button onClick={()=>handleAction(r.id,"REJECT")} className="h-9 px-5 bg-white border border-[#d5d9d9] rounded-[8px] text-[12px] font-bold">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}
export default VendorReturns;