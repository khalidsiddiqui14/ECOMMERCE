import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getMyOrders, getMyReturns } from "../services/userService";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || "http://127.0.0.1:8000";
const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop";

const resolveImg = (src) => {
  try {
    if (!src) return "";
    let s = typeof src === "string"? src : src.image || src.url || src.src || "";
    if (!s) return "";
    s = String(s);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

function ReturnsAndOrdersPro() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.includes("returns")) setActiveTab("returns");
    else setActiveTab("orders");
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [oRes, rRes] = await Promise.allSettled([getMyOrders(), getMyReturns()]);
        if (oRes.status === "fulfilled") {
          const d = oRes.value?.data || oRes.value || [];
          const list = Array.isArray(d)? d : d.results || d.orders || [];
          setOrders(Array.isArray(list)? list : []);
        }
        if (rRes.status === "fulfilled") {
          const d = rRes.value?.data || rRes.value || [];
          const list = Array.isArray(d)? d : d.results || d.returns || [];
          setReturns(Array.isArray(list)? list : []);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  const fmtMoney = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const fmtDate = (v) => { if (!v) return "-"; const d = new Date(v); return isNaN(d)? "-" : d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); };

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(o =>
        String(o.order_number || o.id).toLowerCase().includes(s) ||
        (o.items || o.order_items || []).some(i => String(i.product_name || i.product?.name || "").toLowerCase().includes(s))
      );
    }
    if (yearFilter!== "all") {
      list = list.filter(o => new Date(o.created_at).getFullYear().toString() === yearFilter);
    }
    return list.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
  }, [orders, search, yearFilter]);

  const years = useMemo(() => [...new Set(orders.map(o => { try { return new Date(o.created_at).getFullYear(); } catch { return null; }}).filter(Boolean))].sort((a,b)=>b-a), [orders]);

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen">
        <div className="max-w- mx-auto p-4 space-y-3">
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-3">
      <div className="max-w- mx-auto px-3">
        <div className="text- text-[#565959] mb-2">
          <Link to="/" className="hover:text-[#E77600] hover:underline">Your Account</Link> › <span className="text-[#E77600] font-bold">Your Orders</span> • <span className="text-[#067D62]">Prime • FREE Returns</span>
        </div>

        <div className="bg-white border border-[#d5d9d9] rounded- shadow-sm">
          <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text- font-bold text-[#0F1111] leading-none">Your Orders</h1>
              <div className="mt-2 flex items-center gap-2 text- flex-wrap">
                <span className="text-[#565959]">{orders.length} orders placed in</span>
                <select value={yearFilter} onChange={e=>setYearFilter(e.target.value)} className="h-6 px-1 border border-[#d5d9d9] rounded- text- bg-white">
                  <option value="all">All Years</option>
                  {years.map(y=><option key={y} value={String(y)}>{y}</option>)}
                </select>
                <span className="w-1 h-1 bg-[#565959] rounded-full" />
                <span className="text-[#067D62] font-bold">{returns.length} returns • FREE 10 days return</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-">
                <span className="absolute left-2 top-2 text-[#565959] text-">🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search all orders..." className="w-full h-9 pl-7 pr-3 border border-[#a6a6a6] rounded- shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] text- focus:border-[#E77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)] outline-none" />
              </div>
              <div className="flex bg-[#f0f2f2] border border-[#d5d9d9] rounded- p-1 h-9">
                <button onClick={()=>{setActiveTab("orders"); navigate("/orders");}} className={`px-4 rounded- text- font-bold transition ${activeTab==="orders"? "bg-[#131921] text-white shadow" : "text-[#0F1111] hover:bg-white"}`}>Orders</button>
                <button onClick={()=>{setActiveTab("returns"); navigate("/returns");}} className={`px-4 rounded- text- font-bold transition ${activeTab==="returns"? "bg-[#131921] text-white shadow" : "text-[#0F1111] hover:bg-white"}`}>Returns <span className="ml-1 bg-[#FED813] text-[#0F1111] px-1.5 py-0.5 rounded-full text-">{returns.length}</span></button>
              </div>
            </div>
          </div>

          {activeTab==="orders" && filteredOrders.length>0 && (
            <div className="border-t border-[#e7e7e7] px-4 py-2.5 flex flex-wrap gap-2 items-center bg-[#f6f6f6] rounded-b-">
              <span className="text- text-[#565959]">{filteredOrders.length} orders • {filteredOrders.reduce((t,o)=> t + (o.items?.length || o.order_items?.length || 0),0)} items • FREE delivery on Prime orders</span>
              {search && <button onClick={()=>setSearch("")} className="text- text-[#0066c0] hover:underline">Clear search ✕</button>}
            </div>
          )}
        </div>

        {activeTab==="orders"? (
          <div className="mt-3 space-y-3">
            {filteredOrders.length===0? (
              <div className="bg-white border border-[#d5d9d9] rounded- p-12 text-center shadow-sm">
                <div className="text-">📦</div>
                <h3 className="font-bold text- mt-3">No orders found</h3>
                <p className="text- text-[#565959] mt-1 max-w- mx-auto">{search? `No orders matching "${search}". Try different keyword.` : "You have not placed any orders yet. Start shopping now!"}</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Link to="/products" className="h-9 px-6 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-bold grid place-items-center shadow-sm">Continue Shopping</Link>
                  {search && <button onClick={()=>setSearch("")} className="h-9 px-4 bg-white border border-[#d5d9d9] rounded- text-">Clear Search</button>}
                </div>
              </div>
            ) : filteredOrders.map(order=> {
              const items = order.items || order.order_items || [];
              return (
              <div key={order.id} className="bg-white border border-[#d5d9d9] rounded- shadow-sm overflow-hidden hover:shadow-[0_2px_8px_rgba(0,0,0,.12)] transition">
                <div className="bg-[#f0f2f2] border-b border-[#d5d9d9] p-3.5 grid grid-cols-2 md:grid-cols-[160px_120px_1fr_220px] gap-3 text-">
                  <div><span className="text- font-bold uppercase text-[#565959] tracking-wide">Order Placed</span><div className="font-medium mt-0.5 text-[#0F1111]">{fmtDate(order.created_at)}</div></div>
                  <div><span className="text- font-bold uppercase text-[#565959] tracking-wide">Total</span><div className="font-medium mt-0.5 text-[#0F1111]">{fmtMoney(order.total_amount || order.total)}</div></div>
                  <div><span className="text- font-bold uppercase text-[#565959] tracking-wide">Ship To</span><div className="font-medium mt-0.5 truncate flex items-center gap-1 text-[#0066c0]">{order.shipping_name || "You"} <span className="text-">▼</span></div></div>
                  <div className="text-left md:text-right col-span-2 md:col-span-1">
                    <span className="text- font-bold uppercase text-[#565959] tracking-wide">Order # {order.order_number || order.id}</span>
                    <div className="flex md:justify-end gap-3 mt-0.5">
                      <Link to={`/orders/${order.id}`} className="text-[#0066c0] hover:text-[#c45500] hover:underline font-medium">Order Details</Link>
                      <span className="text-[#d5d9d9]">|</span>
                      <button onClick={()=>window.print()} className="text-[#0066c0] hover:text-[#c45500] hover:underline font-medium">Invoice</button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {items.map(item=> {
                    const img = resolveImg(item.image || item.product?.image || item.product_image) || PLACEHOLDER;
                    return (
                    <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0 border-b last:border-0 border-[#f0f2f2]">
                      <Link to={`/product/${item.product || item.product_id}`} className="w- h- bg-[#f7fafa] border border-[#e7e7e7] rounded- grid place-items-center shrink-0 overflow-hidden hover:border-[#d5d9d9]">
                        <img src={img} alt="" className="w-full h-full object-contain p-1" onError={e=> e.target.src=PLACEHOLDER} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product || item.product_id}`} className="text- text-[#0066c0] hover:text-[#c45500] hover:underline line-clamp-2 leading-">{item.product_name || item.product?.name || item.name || "Product"}</Link>
                        <div className="text- text-[#565959] mt-1">Sold by: <span className="text-[#0F1111]">{item.seller || "ShopZone Fulfilled"}</span> • Prime • FREE Delivery</div>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded- text- font-bold text-white ${String(order.status).toUpperCase()==="DELIVERED"? "bg-[#067D62]" : String(order.status).toUpperCase()==="SHIPPED"? "bg-[#e47911]" : "bg-[#3b82f6]"}`}>{order.status || "Delivered"}</span>
                          <span className="text- text-[#067D62]">✓ Delivered on {fmtDate(order.delivered_at || order.created_at)} • 10 days return</span>
                        </div>
                        <div className="text- mt-1"><span className="text-[#565959]">Qty:</span> {item.quantity} • <span className="font-bold">{fmtMoney(item.price)}</span> <span className="text-[#565959] line-through ml-1">{fmtMoney(Number(item.price)*1.2)}</span> <span className="text-[#CC0C39] font-bold ml-1">17% off</span></div>
                      </div>
                      <div className="w- hidden md:flex flex-col gap-2 shrink-0">
                        <Link to={`/orders/${order.id}`} className="h-8 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-bold grid place-items-center shadow-sm">Buy Again</Link>
                        <Link to={`/orders/${order.id}?return=${item.id}`} className="h-8 bg-white hover:bg-[#f7fafa] border border-[#d5d9d9] rounded- text- grid place-items-center shadow-sm">Return / Replace</Link>
                        <Link to={`/product/${item.product || item.product_id}#reviews`} className="h-8 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center hover:bg-[#f7fafa]">Write a review</Link>
                      </div>
                    </div>
                  )})}
                </div>

                <div className="px-4 py-2.5 bg-[#fcfcfc] border-t border-[#f0f2f2] flex justify-between items-center">
                  <button className="text- text-[#0066c0] hover:underline">Archive order • Delete from list</button>
                  <Link to={`/orders/${order.id}`} className="text- font-bold text-[#0066c0] hover:text-[#c45500] hover:underline">Track Package → Prime Delivery</Link>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {returns.length===0? (
              <div className="bg-white border border-[#d5d9d9] rounded- p-12 text-center shadow-sm">
                <div className="text-">↩️</div>
                <h3 className="font-bold text- mt-3">No returns yet</h3>
                <p className="text- text-[#565959] mt-1">Your return requests will appear here with refund timeline. 10 days FREE return on Prime orders.</p>
                <Link to="/orders" className="mt-4 inline-flex h-9 px-6 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center">Go to Orders</Link>
              </div>
            ) : returns.map(r=>(
              <div key={r.id} className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text- font-bold uppercase tracking-wide bg-[#f0f2f2] border border-[#d5d9d9] px-2 py-0.5 rounded-full">Return #{r.id}</span>
                      <span className="text- text-[#565959]">Order #{r.order} • {fmtDate(r.created_at)}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text- font-bold border ${r.status==="APPROVED"? "bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]" : r.status==="REJECTED"? "bg-[#fef2f2] border-[#fecaca] text-[#CC0C39]" : "bg-[#fefce8] border-[#fde68a] text-[#946800]"}`}>{r.status}</span>
                    </div>
                    <h4 className="font-bold text- mt-2 text-[#0F1111]">{r.product_name || `Product in Order #${r.order}`}</h4>
                    <p className="text- text-[#565959] mt-1">Reason: <strong className="text-[#0F1111]">{r.reason}</strong> • Refund to original payment method</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1"><div className="w-5 h-5 bg-[#067D62] rounded-full grid place-items-center text-white text-">✓</div><span className="text- font-medium">Requested</span></div>
                      <div className="w-8 h- bg-[#067D62]" />
                      <div className="flex items-center gap-1"><div className={`w-5 h-5 rounded-full grid place-items-center text- font-bold ${r.status==="APPROVED"||r.status==="REFUNDED"? "bg-[#067D62] text-white" : "bg-[#f0f2f2] border border-[#d5d9d9] text-[#565959]"}`}>{r.status==="APPROVED"||r.status==="REFUNDED"? "✓" : "2"}</div><span className="text-">Approved</span></div>
                      <div className={`w-8 h- ${r.status==="APPROVED"||r.status==="REFUNDED"? "bg-[#067D62]" : "bg-[#e7e7e7]"}`} />
                      <div className="flex items-center gap-1"><div className={`w-5 h-5 rounded-full grid place-items-center text- font-bold ${r.status==="REFUNDED"? "bg-[#067D62] text-white" : "bg-[#f0f2f2] border text-[#565959]"}`}>{r.status==="REFUNDED"? "✓" : "3"}</div><span className="text-">Refund</span></div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-">Refund: <strong className="text- text-[#0F1111]">{fmtMoney(r.refund_amount)}</strong></div>
                    <div className="text- text-[#565959]">to original payment • 5-7 days</div>
                    <Link to={`/orders/${r.order}`} className="inline-block mt-2 text- text-[#0066c0] hover:underline">View Order →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReturnsAndOrdersPro;