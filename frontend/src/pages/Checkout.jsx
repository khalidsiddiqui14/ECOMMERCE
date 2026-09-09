  import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderService";
import { createPayment, initiateRazorpay } from "../services/paymentService";
import { getCart } from "../services/cartService";
import { getAddresses } from "../services/userService";

const BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/.*$/, "") || "http://127.0.0.1:8000";

const getImg = (p) => {
  try {
    const img = p?.images?.[0] || p?.image;
    let s = typeof img === "string"? img : img?.image || p?.image || "";
    if (!s) return "https://via.placeholder.com/60";
    s = String(s);
    if (s.startsWith("http")) return s;
    if (s.startsWith("/media")) return `${BASE}${s}`;
    return `${BASE}/media/${s.replace(/^\/+/, "")}`;
  } catch { return "https://via.placeholder.com/60"; }
};

function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_name: "", shipping_phone: "", shipping_address: "", shipping_city: "",
    shipping_state: "", shipping_country: "India", shipping_postal_code: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    (async () => {
      setCartLoading(true);
      try {
        const [cartData, addrData] = await Promise.allSettled([getCart(), getAddresses()]);
        if (cartData.status==="fulfilled") {
          const items = Array.isArray(cartData.value?.items)? cartData.value.items : cartData.value?.cart_items || [];
          setCartItems(items);
          const total = items.reduce((t,it)=>{
            const p = it.product || {};
            const price = Number(it.price?? p.price?? 0);
            return t + price * Number(it.quantity||0);
          },0);
          setSubtotal(total);
        }
        if (addrData.status==="fulfilled") {
          const d = addrData.value;
          const list = Array.isArray(d)? d : d?.results || d?.addresses || [];
          setSavedAddresses(Array.isArray(list)? list : []);
          const def = list.find(a=>a.is_default);
          if (def) {
            setSelectedAddressId(def.id);
            setForm({
              shipping_name: def.name || "",
              shipping_phone: def.phone || "",
              shipping_address: `${def.address||""} ${def.locality||""}`.trim(),
              shipping_city: def.city || "",
              shipping_state: def.state || "",
              shipping_country: "India",
              shipping_postal_code: def.pincode || "",
              notes: "",
            });
          }
        }
      } catch (e) {
        console.error("Checkout load failed", e);
      } finally {
        setCartLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({...p, [name]: value }));
    if (error) setError("");
    setSelectedAddressId(null);
  };

  const selectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setForm({
      shipping_name: addr.name || "",
      shipping_phone: addr.phone || "",
      shipping_address: `${addr.address||""} ${addr.locality||""}`.trim(),
      shipping_city: addr.city || "",
      shipping_state: addr.state || "",
      shipping_country: "India",
      shipping_postal_code: addr.pincode || "",
      notes: form.notes,
    });
  };

  const validateForm = () => {
    const req = [["shipping_name","Full name"],["shipping_phone","Phone"],["shipping_address","Address"],["shipping_city","City"],["shipping_state","State"],["shipping_postal_code","Postal code"]];
    for (const [field,label] of req) {
      if (!form[field]?.trim()) { setError(`${label} is required.`); return false; }
    }
    if (form.shipping_phone.replace(/\D/g,"").length < 10) { setError("Enter valid 10-digit phone."); return false; }
    if (form.shipping_postal_code.replace(/\D/g,"").length < 4) { setError("Enter valid postal code."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setError(""); setSuccess("");
    if (!validateForm()) return;
    if (cartItems.length===0) { setError("Your cart is empty. Add products first."); return; }
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(Object.entries(form).map(([k,v])=>[k, (v||"").trim()]));
      const order = await createOrder({...cleaned, payment_method: paymentMethod});
      if (!order?.id) throw new Error("Order ID not returned");

      if (paymentMethod==="RAZORPAY" || paymentMethod==="UPI") {
        try {
          await initiateRazorpay(order.id, subtotal);
        } catch (payErr) {
          console.warn("Razorpay init failed, but order created", payErr);
          // Still go to orders, user can pay later
        }
      } else {
        try { await createPayment(order.id, paymentMethod); } catch {}
      }

      setSuccess(`Order #${order.id} placed!`);
      window.dispatchEvent(new Event("cart-change"));
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      let msg = err.message || "Checkout failed";
      if (data?.missing_fields) {
        if (typeof data.missing_fields==="string") msg = data.missing_fields;
        else msg = Object.entries(data.missing_fields).map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):m}`).join(" | ");
      } else if (data?.detail) msg = typeof data.detail==="string"? data.detail : JSON.stringify(data.detail);
      else if (data) msg = Object.entries(data).map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):m}`).join(" | ");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cartItems.reduce((t,it)=> t + Number(it.quantity||0),0);
  const codFee = paymentMethod==="COD"? 49 : 0;
  const finalTotal = subtotal + codFee;

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto">
        <div className="bg-white border-b border-[#d5d9d9] h- flex items-center px-4 sticky top-0 z-10 shadow-sm">
          <Link to="/" className="text- font-bold">shop<span className="text-[#f08804]">zone</span></Link>
          <div className="ml-8 text- font-medium">Checkout ({totalItems} {totalItems===1? 'item':'items'})</div>
          <div className="ml-auto flex items-center gap-2 text- text-[#565959]"><span className="text-">🔒</span> Secure checkout</div>
        </div>

        {error && <div className="m-2 bg-white border-l- border-[#c40000] p-3 text- text-[#c40000] shadow-sm rounded-">⚠ {error}</div>}
        {success && <div className="m-2 bg-white border-l- border-[#067D62] p-3 text- text-[#067D62] shadow-sm rounded-">✓ {success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-2 p-2 items-start">
          <div className="bg-white border border-[#d5d9d9] rounded- shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="p-5">
              {savedAddresses.length>0 && (
                <div className="mb-6">
                  <h2 className="text- font-bold text-[#C45500] mb-2">1 Your Addresses</h2>
                  <div className="grid md:grid-cols-2 gap-2">
                    {savedAddresses.slice(0,4).map(addr=>(
                      <div key={addr.id} onClick={()=>selectAddress(addr)} className={`p-3 border rounded- cursor-pointer text- ${selectedAddressId===addr.id? 'border-[#e77600] bg-[#fef8f2] ring-1 ring-[#e77600]' : 'border-[#d5d9d9] hover:border-[#e77600]'}`}>
                        <div className="font-bold">{addr.name} • {addr.address_type}</div>
                        <div className="mt-1 leading-">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</div>
                        <div className="mt-1 text-[#0066c0] text-">{selectedAddressId===addr.id? '✓ Selected • Deliver to this address' : 'Deliver to this address'}</div>
                      </div>
                    ))}
                  </div>
                  <Link to="/addresses" className="inline-block mt-2 text- text-[#0066c0] hover:underline">+ Add new address / Manage addresses</Link>
                  <hr className="mt-4" />
                </div>
              )}

              <div className="mb-6">
                <h2 className="text- font-bold text-[#C45500] mb-3">1 {savedAddresses.length>0? 'Or enter new' : ''} Shipping address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text- font-bold">Full name *</label>
                    <input name="shipping_name" value={form.shipping_name} onChange={handleChange} required disabled={loading} placeholder="Rahul Sharma"
                      className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded- text- focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)] outline-none" />
                  </div>
                  <div>
                    <label className="text- font-bold">Phone number *</label>
                    <input name="shipping_phone" value={form.shipping_phone} onChange={handleChange} required disabled={loading} placeholder="9876543210"
                      className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text- font-bold">Address (House, Street, Area) *</label>
                    <textarea name="shipping_address" value={form.shipping_address} onChange={handleChange} required disabled={loading} rows={2} placeholder="House no, street, area, landmark"
                      className="w-full mt-1 p-2 border border-[#a6a6a6] rounded- text- outline-none resize-none focus:border-[#e77600]" />
                  </div>
                  <div><label className="text- font-bold">City *</label><input name="shipping_city" value={form.shipping_city} onChange={handleChange} required disabled={loading} placeholder="Delhi" className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" /></div>
                  <div><label className="text- font-bold">State *</label><input name="shipping_state" value={form.shipping_state} onChange={handleChange} required disabled={loading} placeholder="Delhi" className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded- text- outline-none" /></div>
                  <div><label className="text- font-bold">Country *</label><input name="shipping_country" value={form.shipping_country} onChange={handleChange} required disabled={loading} className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded- text- outline-none" /></div>
                  <div><label className="text- font-bold">Postal code *</label><input name="shipping_postal_code" value={form.shipping_postal_code} onChange={handleChange} required disabled={loading} placeholder="110059" className="w-full h-8 mt-1 px-2 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" /></div>
                  <div className="md:col-span-2"><label className="text- font-bold">Order notes (Optional)</label><textarea name="notes" value={form.notes} onChange={handleChange} disabled={loading} rows={2} placeholder="Delivery instructions, e.g. Leave at door" className="w-full mt-1 p-2 border border-[#a6a6a6] rounded- text- outline-none resize-none" /></div>
                </div>
              </div>

              <div className="pt-5 border-t border-[#eaeaea]">
                <h2 className="text- font-bold text-[#C45500] mb-3">2 Payment method • Select a payment method</h2>
                <div className="space-y-2">
                  {[
                    {id:'COD', title:'Cash on Delivery / Pay on Delivery', desc:'Cash, UPI, Cards accepted. ₹49 fee. Pay when delivered.', icon:'💵', fee:49},
                    {id:'RAZORPAY', title:'Razorpay • Cards, UPI, NetBanking, Wallet', desc:'Visa, Mastercard, Rupay, GPay, PhonePe, Paytm • Secure', icon:'💳', fee:0},
                    {id:'UPI', title:'UPI • GPay, PhonePe, Paytm, BHIM', desc:'Instant payment • No extra fee', icon:'📱', fee:0},
                  ].map(m=>(
                    <label key={m.id} className={`flex items-start gap-3 p-3 border rounded- cursor-pointer ${paymentMethod===m.id? 'border-[#e77600] bg-[#fef8f2] shadow-[0_0_0_1px_#e77600]' : 'border-[#d5d9d9] hover:border-[#a6a6a6]'}`}>
                      <input type="radio" name="payment_method" value={m.id} checked={paymentMethod===m.id} onChange={e=>setPaymentMethod(e.target.value)} disabled={loading} className="mt-1 accent-[#e77600]" />
                      <div className="flex-1">
                        <div className="text- font-bold flex items-center gap-2">{m.title} {m.fee>0 && <span className="text- bg-[#f0f2f2] border px-1 rounded">₹{m.fee} fee</span>}</div>
                        <div className="text- text-[#565959] mt-0.5">{m.desc}</div>
                      </div>
                      <span className="text-">{m.icon}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 text- text-[#565959] bg-[#f7fafa] border border-[#d5d9d9] p-2 rounded-">🔒 Your payment is secure • ShopZone uses Razorpay • 256-bit SSL • EMI available on cards • COD: Keep exact change ready</div>
              </div>

              <div className="flex gap-3 mt-6">
                <Link to="/cart" className="flex-1 h-9 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa]">Back to cart</Link>
                <button type="submit" disabled={loading || cartLoading} className="flex-[1.5] h-9 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-bold shadow-sm disabled:opacity-50">
                  {loading? "Placing order..." : `Use this address • Pay ${paymentMethod}`}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-[#d5d9d9] rounded- p-4 sticky top-">
            <button disabled={loading || cartLoading} onClick={handleSubmit} className="w-full h-10 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-bold shadow-sm disabled:opacity-50">
              {loading? "Processing..." : `Place your order • ₹${finalTotal.toLocaleString("en-IN")}`}
            </button>
            <p className="text- mt-3 leading- text-[#565959]">By placing your order, you agree to ShopZone's privacy notice and conditions of use. FREE delivery • 10 days return • 1 year warranty.</p>

            <div className="mt-4 border-t border-[#eaeaea] pt-3">
              <h3 className="font-bold text- mb-2">Order Summary • {totalItems} items</h3>
              {cartLoading? (
                <div className="text- text-[#565959]">Loading cart...</div>
              ) : cartItems.length===0? (
                <div className="text- text-[#c40000]">Cart is empty • <Link to="/products" className="text-[#0066c0] underline">Add products</Link></div>
              ) : (
                <>
                  <div className="max-h- overflow-y-auto space-y-2 mb-3 pr-1">
                    {cartItems.map(it=>{
                      const p = it.product || {};
                      return (
                        <div key={it.id} className="flex gap-2 text- border-b border-[#f0f2f2] pb-2 last:border-0">
                          <img src={getImg(p)} alt="" className="w-10 h-10 object-contain border bg-[#f7f7f7] rounded-" />
                          <div className="flex-1 line-clamp-2 leading-">{it.product_name || p.name} <span className="text-[#565959]">x {it.quantity}</span></div>
                          <div className="font-bold">₹{Number(it.price?? p.price?? 0).toLocaleString("en-IN")}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text- space-y-1.5">
                    <div className="flex justify-between"><span>Items ({totalItems}):</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                    <div className="flex justify-between"><span>Delivery:</span><span className="text-[#067D62] font-bold">FREE Prime Delivery</span></div>
                    {codFee>0 && <div className="flex justify-between"><span>COD fee:</span><span>₹{codFee}</span></div>}
                    <div className="flex justify-between font-bold text- border-t border-[#eaeaea] pt-2 text-[#C45500]"><span>Order Total:</span><span>₹{finalTotal.toLocaleString("en-IN")}</span></div>
                    <div className="text- text-[#067D62]">Inclusive of all taxes • EMI from ₹{Math.round(finalTotal/12)}/month</div>
                  </div>
                  <div className="mt-3 text- text-[#067D62] border border-[#d5d9d9] p-2 rounded- bg-[#f0f8f0] flex gap-1"><span>✓</span><span>Prime FREE One-Day Delivery • EMI • Pay on Delivery • 10 days replacement • Secure transaction</span></div>
                </>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/addresses" className="h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white">Manage Addresses</Link>
              <Link to="/cart" className="h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white">Edit Cart</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;