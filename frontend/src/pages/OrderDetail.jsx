import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../services/orderService";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || "http://127.0.0.1:8000";
const PLACEHOLDER = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop";

const resolveImg = (product) => {
  try {
    if (!product) return "";
    const src = product.image || product.images?.[0] || product.product_image;
    if (!src) return "";
    let s = typeof src === "string"? src : src.image || src.url || src.src || "";
    if (!s) return "";
    s = String(s);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return ""; }
};

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getOrder(id);
      if (!data) throw new Error("Order data not returned.");
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Order load failed.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto flex flex-col gap-3">
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
        </div>
      </div>
    );
  }

  if (error ||!order) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4 grid place-items-center">
        <div className="bg-white border border-[#d5d9d9] rounded- p-8 text-center max-w- w-full shadow-sm">
          <div className="text- mb-3">⚠</div>
          <h2 className="font-bold text-">Unable to Load Order</h2>
          <p className="text- text-[#565959] mt-1">{error || "This order does not exist."}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={()=>loadOrder()} className="h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded- text- shadow-sm font-bold">Try Again</button>
            <Link to="/orders" className="h-8 px-4 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items)? order.items : order.order_items || order.items_detail || [];
  const orderNumber = order.order_number || `#${order.id}`;
  const status = (order.status || "PLACED").toUpperCase();
  const payStatus = order.payment_status || order.payment?.status || "PENDING";
  const orderDate = order.created_at? new Date(order.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "-";
  const subtotal = Number(order.subtotal || order.items_total || order.total_amount || 0);
  const shippingCost = Number(order.shipping_cost || order.shipping || 0);
  const totalAmount = Number(order.total_amount || order.total || subtotal + shippingCost);

  const statusMap = {
    PLACED: {label:'Ordered', color:'#3b82f6', bg:'#eff6ff', bd:'#bfdbfe'},
    CONFIRMED: {label:'Confirmed', color:'#8b5cf6', bg:'#f5f3ff', bd:'#ddd6fe'},
    PROCESSING: {label:'Processing', color:'#8b5cf6', bg:'#f5f3ff', bd:'#ddd6fe'},
    SHIPPED: {label:'Shipped', color:'#e47911', bg:'#fef8f2', bd:'#f3a847'},
    OUT_FOR_DELIVERY: {label:'Out for Delivery', color:'#e47911', bg:'#fef8f2', bd:'#f3a847'},
    DELIVERED: {label:'Delivered', color:'#067D62', bg:'#f0fdf4', bd:'#bbf7d0'},
    CANCELLED: {label:'Cancelled', color:'#CC0C39', bg:'#fef2f2', bd:'#fecaca'},
  };
  const s = statusMap[status] || statusMap.PLACED;
  const steps = ["PLACED","CONFIRMED","SHIPPED","DELIVERED"];
  const currentStepIndex = Math.max(0, steps.indexOf(status) >=0? steps.indexOf(status) : status==="CANCELLED"? -1 : 0);

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-start shadow-sm flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 text- text-[#0066c0]">
              <Link to="/orders" className="hover:underline hover:text-[#C45500]">‹ Back to orders</Link>
              <span className="text-[#565959]">Orders / {orderNumber}</span>
            </div>
            <h1 className="text- font-medium mt-2 flex items-center gap-2 flex-wrap text-[#0F1111]">
              Order {orderNumber}
              <span className="text- px-2 py-1 rounded-full font-bold border" style={{background:s.bg, borderColor:s.bd, color:s.color}}>{s.label}</span>
              {status==="DELIVERED" && <span className="text- px-2 py-0.5 bg-[#067D62] text-white rounded-full">✓ Delivered</span>}
            </h1>
            <p className="text- text-[#565959] mt-1">Placed on {orderDate} • {items.length} items • Payment: <span className={payStatus==="PAID"? 'text-[#067D62] font-bold' : 'text-[#e47911]'}>{payStatus}</span> • ID: {order.id}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/orders" className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center shadow-sm hover:bg-[#f7fafa]">All Orders</Link>
            <button onClick={()=>window.print()} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">Print Invoice</button>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-2">
          <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
            <div className="text- font-bold text-[#565959] uppercase mb-3">Order Tracking • Amazon Style</div>
            <div className="flex justify-between relative">
              {steps.map((step,i)=>{
                const done = currentStepIndex>=0 && i <= currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5 flex-1 relative">
                    {i>0 && <div className="absolute top- left-[-50%] right-[50%] h-" style={{background: done? '#067D62' : '#e7e7e7'}} />}
                    <div className="w-7 h-7 rounded-full grid place-items-center text- font-bold z-10 border-2" style={{background: done? (active? '#f08804' : '#067D62') : '#fff', borderColor: done? '#067D62' : '#d5d9d9', color: done? '#fff' : '#767676'}}>
                      {done? '✓' : i+1}
                    </div>
                    <span className="text- font-bold uppercase tracking-wide" style={{color: done? '#0F1111' : '#767676'}}>{step}</span>
                    {active && <span className="text- px-1.5 py-0.5 bg-[#f08804] text-white rounded-full animate-pulse">Current</span>}
                  </div>
                );
              })}
            </div>
            {status==="CANCELLED" && <div className="mt-3 p-2 bg-[#fef2f2] border border-[#fecaca] rounded- text- text-[#CC0C39] text-center">❌ This order was cancelled • Refund will be processed in 5-7 days</div>}
          </div>
          <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
            <div className="text- font-bold uppercase text-[#565959]">Order Date & ID</div>
            <div className="font-bold text- mt-1 text-[#0F1111]">{orderDate}</div>
            <div className="text- text-[#767676] mt-1">ID: {order.id} • {orderNumber}</div>
            <div className="text- text-[#067D62] mt-1">✓ Order confirmed • Invoice sent to email</div>
          </div>
          <div className="bg-[#131921] text-white rounded- p-4 shadow-sm">
            <div className="text- uppercase opacity-70">Total Amount • Prime</div>
            <div className="text- font-bold mt-1">₹{totalAmount.toLocaleString("en-IN")}.00</div>
            <div className="text- opacity-70 mt-1">{items.length} items • FREE delivery • EMI from ₹{Math.round(totalAmount/12)}/mo</div>
          </div>
        </div>

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
          <h2 className="font-bold text-">Items in this order ({items.length}) • Sold by ShopZone • Prime Fulfilled</h2>
          <div className="mt-3 flex flex-col gap-2">
            {items.length===0? <div className="text-center py-8 text-[#565959] text-">No items found in this order.</div> :
              items.map((item)=>{
                const product = item.product || {};
                const price = Number(item.price || item.product_price || product.price || 0);
                const qty = Number(item.quantity || 0);
                const name = item.product_name || product.name || `Product #${item.product}`;
                const img = resolveImg(product) || resolveImg(item) || PLACEHOLDER;
                return (
                  <div key={item.id || Math.random()} className="grid grid-cols-[72px_1fr_auto] gap-3 p-3 bg-[#f7fafa] border border-[#f0f2f2] rounded- items-center hover:border-[#d5d9d9]">
                    <Link to={`/product/${product.id || item.product}`} className="w-16 h-16 bg-white border border-[#eaeaea] rounded- grid place-items-center overflow-hidden">
                      <img src={img} alt={name} className="max-h-full max-w-full object-contain p-1" onError={(e)=> e.target.src=PLACEHOLDER} />
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/product/${product.id || item.product}`} className="text- font-medium truncate hover:text-[#C45500] hover:underline block">{name}</Link>
                      <div className="text- text-[#565959] mt-0.5">Qty: {qty} • ₹{price.toLocaleString("en-IN")} each • <span className="text-[#067D62]">✓ Prime</span> • Sold by ShopZone</div>
                      <div className="text- mt-1"><span className="bg-[#067D62] text-white px-1 rounded-">10 days replacement</span> • <span className="text-[#0066c0]">Buy Again</span> • <span className="text-[#0066c0]">Return</span></div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-">₹{(price*qty).toLocaleString("en-IN")}</div>
                      <div className="text- text-[#565959]">Inclusive taxes</div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] gap-2 items-start">
          <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
            <h2 className="font-bold text-">📍 Shipping Details • Deliver to</h2>
            <div className="mt-3 text- space-y-2">
              {[
                ["Full Name", order.shipping_name],
                ["Phone", order.shipping_phone],
                ["Address", order.shipping_address],
                ["City / State", `${order.shipping_city || "-"}, ${order.shipping_state || ""}`],
                ["Country / Pincode", `${order.shipping_country || "India"} - ${order.shipping_postal_code || ""}`],
              ].map(([l,v])=>(
                <div key={l} className="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-[#f7fafa] last:border-0">
                  <span className="text-[#565959]">{l}</span>
                  <span className="font-medium text-[#0F1111]">{v || "-"}</span>
                </div>
              ))}
              {order.notes && <div className="mt-3 p-2 bg-[#fef8f2] border border-[#f0e6d8] rounded- text-"><strong>Delivery Instructions:</strong> {order.notes}</div>}
            </div>
            <div className="mt-3 p-2 bg-[#f0f8f0] border border-[#bbf7d0] rounded- text- text-[#067D62]">✓ Address verified • OTP on delivery • Call {order.shipping_phone} before delivery</div>
          </div>
          <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm sticky top-">
            <h2 className="font-bold text-">Order Summary • Invoice</h2>
            <div className="mt-3 text- space-y-2">
              <div className="flex justify-between py-2 border-b border-[#f0f2f2]"><span className="text-[#565959]">Subtotal ({items.length} items)</span><strong>₹{(subtotal || totalAmount).toLocaleString("en-IN")}</strong></div>
              <div className="flex justify-between py-2 border-b border-[#f0f2f2]"><span className="text-[#565959]">Delivery Charges</span><strong className={shippingCost===0? 'text-[#067D62]' : ''}>{shippingCost===0? 'FREE Prime Delivery' : `₹${shippingCost.toLocaleString("en-IN")}`}</strong></div>
              <div className="flex justify-between py-3 font-bold text-"><span>Total Amount</span><span className="text-[#C45500]">₹{totalAmount.toLocaleString("en-IN")}</span></div>
              <div className="text- text-[#565959]">Inclusive of all taxes • EMI available</div>
            </div>
            <div className="mt-3 p-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded- text- text-[#067D62] text-center">✓ Order confirmed • Payment {payStatus} • Tax invoice sent to email • GST invoice available</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/orders" className="h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white hover:bg-[#f7fafa]">All Orders</Link>
              <Link to="/products" className="h-8 bg-[#FFD814] border border-[#FCD200] rounded- grid place-items-center text- font-bold">Buy Again • Prime</Link>
            </div>
            <div className="mt-3 text- text-[#767676] text-center">Need help? <Link to="/help" className="text-[#0066c0] underline">Contact Us</Link> • <Link to="/returns" className="text-[#0066c0] underline">Returns</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;