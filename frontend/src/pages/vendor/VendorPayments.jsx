import { useEffect, useState } from "react";
import api from "../../services/api";

function VendorPayments() {
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    try{
      const res = await api.get("vendor/payments/");
      const d = res.data;
      setPayments(Array.isArray(d) ? d : d.results || d.payments || []);
      setBalance(d.balance || 0);
    } catch{} finally{ setLoading(false); }
  })(); },[]);

  return (
    <div className="bg-[#EAEDED] min-h-screen p-4">
      <div className="max-w-[1100px] mx-auto space-y-4">
        <h1 className="text-[21px] font-bold">Payments - Seller Central</h1>
        <div className="bg-white border rounded-[8px] p-5 flex justify-between items-center">
          <div><div className="text-[13px] text-[#565959]">Available Balance</div><div className="text-[28px] font-bold">₹{Number(balance).toLocaleString("en-IN")}</div></div>
          <button className="h-9 px-5 bg-[#FFD814] border border-[#FCD200] rounded-[8px] text-[13px] font-bold shadow">Request Payout</button>
        </div>
        <div className="bg-white border rounded-[8px] p-4">
          <h2 className="font-bold text-[14px] mb-3">Transaction History</h2>
          {loading ? <div className="text-[13px]">Loading...</div> :
            payments.length===0 ? <div className="text-[13px] text-[#565959]">No payments yet.</div> :
            <div className="space-y-2">{payments.map((p,i)=><div key={i} className="flex justify-between text-[13px] border-b py-2"><span>{p.date || p.created_at}</span><span>₹{p.amount}</span><span className="text-[#067D62]">{p.status || "Completed"}</span></div>)}</div>
          }
        </div>
      </div>
    </div>
  );
}
export default VendorPayments;