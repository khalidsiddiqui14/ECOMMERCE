import { useEffect, useState } from "react";
import api from "../../services/api";

function VendorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    try{
      const res = await api.get("vendor/reviews/");
      const d = res.data;
      setReviews(Array.isArray(d) ? d : d.results || d.reviews || []);
    } catch{} finally{ setLoading(false); }
  })(); },[]);

  return (
    <div className="bg-[#EAEDED] min-h-screen p-4">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-[21px] font-bold">Customer Reviews - Seller Central</h1>
        <div className="bg-white border rounded-[8px] p-4 mt-4">
          {loading ? <div className="text-[13px]">Loading...</div> :
            reviews.length===0 ? <div className="text-[13px] text-[#565959]">No reviews yet.</div> :
            <div className="space-y-3">{reviews.map(r=>(
              <div key={r.id} className="border border-[#d5d9d9] rounded-[8px] p-3">
                <div className="flex justify-between"><span className="font-bold text-[13px]">{r.product_name || r.product}</span><span className="text-[#FFA41C] text-[13px]">{"★".repeat(r.rating||5)}</span></div>
                <p className="text-[13px] mt-1">{r.comment || r.review}</p>
                <div className="text-[11px] text-[#565959] mt-1">{r.user || r.customer} • {r.created_at}</div>
              </div>
            ))}</div>
          }
        </div>
      </div>
    </div>
  );
}
export default VendorReviews;