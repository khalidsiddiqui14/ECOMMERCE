import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || "http://127.0.0.1:8000";

const resolveImage = (img) => {
  try {
    if (!img) return "";
    let s = typeof img === "string"? img : img.image || img.url || img.src || "";
    if (!s) return "";
    s = String(s).trim();
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    if (s.startsWith("media/")) return `${BASE}/${s}`;
    if (s.startsWith("/")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

function Deals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 34, s: 21 });

  useEffect(()=>{
    const timer = setInterval(()=> setTimeLeft(prev=>{
      let {h,m,s} = prev;
      if (s>0) s--; else if (m>0){ m--; s=59; } else if (h>0){ h--; m=59; s=59; } else { h=12; m=34; s=21; }
      return {h,m,s};
    }), 1000);
    return ()=> clearInterval(timer);
  }, []);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const res = await api.get("products/?ordering=-discount&limit=100");
        const d = res.data;
        const list = Array.isArray(d)? d : d.results || d.products || [];
        setProducts(Array.isArray(list)? list : []);
      } catch { setProducts([]); } finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter==="ALL"? products : products.filter(p => {
    const disc = Number(p.discount || p.discount_percent || (p.mrp&&p.price? Math.round((1-p.price/p.mrp)*100) : 0) || 0);
    return disc >= Number(filter);
  });

  return (
    <div className="bg-[#EAEDED] min-h-screen pb-6">
      <div className="bg-white border-b border-[#d5d9d9]">
        <div className="max-w- mx-auto p-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text- font-bold">Today's Deals <span className="text- font-normal text-[#565959] ml-2">See all deals and save big • Lightning Deals • Ends soon</span></h1>
            <span className="ml-auto px-3 py-1 bg-[#CC0C39] text-white rounded- text- font-bold animate-pulse">
              Ends in {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')}
            </span>
          </div>
          <div className="mt-3 flex gap-2 overflow-auto pb-1">
            {["ALL","10","30","50","70"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`h-8 px-4 rounded-full border text- font-bold shrink-0 transition ${filter===f? "bg-[#131921] text-white border-[#131921] shadow-sm" : "bg-white border-[#d5d9d9] hover:bg-[#f7fafa]"}`}>{f==="ALL"? "All Deals • 100+ offers" : `${f}% off or more • Prime`}</button>
            ))}
            <span className="h-8 px-4 rounded-full border bg-[#FFD814] border-[#FCD200] text- font-bold grid place-items-center shrink-0">Prime Early Access</span>
          </div>
          <div className="mt-2 text- text-[#565959]">Amazon-like: Up to 80% off • Electronics, Fashion, Home • Coupon + Bank offers • Prime FREE delivery • {filtered.length} deals live now</div>
        </div>
      </div>

      <div className="max-w- mx-auto p-3">
        {loading? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({length:10}).map((_,i)=><div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />)}
          </div>
        ) : filtered.length===0? (
          <div className="bg-white border border-[#d5d9d9] rounded- p-12 text-center">
            <div className="text-">🏷️</div>
            <div className="font-bold mt-2">No deals for {filter}% filter</div>
            <button onClick={()=>setFilter("ALL")} className="mt-3 h-8 px-5 bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold">Show All Deals</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(p=>{
              const img = resolveImage(p.image || p.images?.[0]) || PLACEHOLDER;
              const price = Number(p.price||0);
              const discount = Number(p.discount || p.discount_percent || (p.original_price&&price? Math.round((1-price/p.original_price)*100) : 25));
              const mrp = Number(p.original_price || p.mrp || (discount>0? price/(1-discount/100) : price*1.4));
              const claimed = Math.floor(Math.random()*60)+20;
              return (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-white border border-[#d5d9d9] rounded- p-3 shadow-sm hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)] flex flex-col transition group">
                  <div className="bg-[#f7fafa] rounded- aspect-square grid place-items-center overflow-hidden relative border border-[#f0f2f2]">
                    <img src={img} alt={p.name||p.title} className="w-full h-full object-contain p-2 group-hover:scale-[1.04] transition" onError={e=> e.currentTarget.src = PLACEHOLDER} />
                    {discount>0 && <span className="absolute bottom-2 left-2 bg-[#CC0C39] text-white px-1.5 py-0.5 rounded- text- font-bold">{discount}% off</span>}
                    <span className="absolute top-2 right-2 bg-white/90 border border-[#d5d9d9] text- px-1.5 py-0.5 rounded-full font-bold">Prime</span>
                  </div>
                  <span className="mt-2 px-2 py-0.5 bg-[#CC0C39] text-white text- font-bold rounded- w-fit flex items-center gap-1">Limited time deal • {claimed}% claimed</span>
                  <div className="mt-1 w-full h-1.5 bg-[#f0f2f2] rounded-full overflow-hidden">
                    <div className="h-full bg-[#CC0C39]" style={{width: `${claimed}%`}} />
                  </div>
                  <h3 className="text- leading- line-clamp-2 mt-2 min-h- text-[#0F1111] group-hover:text-[#C45500]">{p.name || p.title}</h3>
                  <div className="mt-1 flex items-baseline gap-1 flex-wrap">
                    <span className="text- font-bold">₹{price.toLocaleString("en-IN")}</span>
                    <span className="text- line-through text-[#565959]">₹{mrp.toFixed(0)}</span>
                    <span className="text- text-[#565959]">({discount}% off)</span>
                  </div>
                  <div className="text- text-[#007185] mt-1">FREE delivery • Prime • Coupon: +5% off</div>
                  <div className="text- text-[#CC0C39] mt-1 font-medium flex items-center gap-1">⏰ Ends in {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')} • Hurry!</div>
                  <div className="mt-2 h-7 bg-[#FFD814] border border-[#FCD200] rounded- grid place-items-center text- font-medium group-hover:bg-[#F7CA00]">Add to Cart • Deal</div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-6 bg-white border border-[#d5d9d9] rounded- p-4 text- text-[#565959]">
          <b>Today's Deals:</b> Shop Amazon-like lightning deals, coupons, bank offers. Up to 80% off on mobiles, electronics, fashion, home. Prime Early Access, FREE delivery, COD, EMI. Deals refresh every hour. Limited stock — order now!
        </div>
      </div>
    </div>
  );
}
export default Deals;