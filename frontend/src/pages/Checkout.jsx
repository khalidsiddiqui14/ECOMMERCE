import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../services/orderService";
import { createPayment } from "../services/paymentService";

function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shipping_name: "", shipping_phone: "", shipping_address: "", shipping_city: "",
    shipping_state: "", shipping_country: "India", shipping_postal_code: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const formatError = (err) => {
    const data = err.response?.data;
    if (!data) return err.message || "Order ya payment create nahi ho paaya.";
    if (data.missing_fields) {
      if (typeof data.missing_fields === "string") return data.missing_fields;
      return Object.entries(data.missing_fields).map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):m}`).join(" | ");
    }
    if (data.detail) return typeof data.detail==="string" ? data.detail : JSON.stringify(data.detail);
    const entries = Object.entries(data);
    if (entries.length>0) return entries.map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):typeof m==="object"?JSON.stringify(m):m}`).join(" | ");
    return "Checkout failed. Please try again.";
  };

  const validateForm = () => {
    const req = [["shipping_name","Full name"],["shipping_phone","Phone"],["shipping_address","Address"],["shipping_city","City"],["shipping_state","State"],["shipping_country","Country"],["shipping_postal_code","Postal code"]];
    for (const [field,label] of req) {
      if (!form[field].trim()) { setError(`${label} is required.`); return false; }
    }
    if (form.shipping_phone.trim().length < 10) { setError("Please enter a valid phone number."); return false; }
    if (form.shipping_postal_code.trim().length < 4) { setError("Please enter a valid postal code."); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(""); setSuccess("");
    if (!validateForm()) return;
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(Object.entries(form).map(([k,v])=>[k, v.trim()]));
      const order = await createOrder(cleaned);
      if (!order?.id) throw new Error("Order was created but no order ID was returned.");
      await createPayment(order.id, paymentMethod);
      setSuccess(`Order #${order.id} placed successfully.`);
      navigate("/orders", { replace: true });
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
      <div className="checkout-container" style={{maxWidth:1120,margin:'0 auto'}}>
        {/* Header */}
        <div className="checkout-header" style={{marginBottom:28}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <Link to="/cart" style={{width:36,height:36,borderRadius:'50%',background:'#fff',border:'1px solid #ece8de',display:'grid',placeItems:'center',fontSize:14}}>←</Link>
            <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,fontWeight:700,color:'#8c8881'}}>
              <span style={{color:'#1a1816'}}>Cart</span><span>→</span><span style={{color:'#1a1816',fontWeight:800}}>Checkout</span><span>→</span><span>Orders</span>
            </div>
          </div>
          <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816'}}>Checkout</h1>
          <p style={{margin:0,color:'#8c8881',fontSize:14}}>Enter your shipping information and choose your payment method.</p>
        </div>

        {error && (
          <div role="alert" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:20,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div role="status" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:20,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>
            <span>✓</span> {success}
          </div>
        )}

        <div className="checkout-layout" style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:24,alignItems:'start'}}>
          {/* Form */}
          <section className="checkout-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:28,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
            <form onSubmit={handleSubmit} noValidate>
              <div className="checkout-section">
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                  <div style={{width:32,height:32,borderRadius:10,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:12,fontWeight:800}}>1</div>
                  <h2 style={{margin:0,fontSize:16,fontWeight:800}}>Shipping Information</h2>
                </div>

                <div className="checkout-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                  <div className="form-group">
                    <label htmlFor="shipping_name" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>Full Name *</label>
                    <input id="shipping_name" name="shipping_name" type="text" placeholder="Rahul Sharma" value={form.shipping_name} onChange={handleChange} disabled={loading} required
                      style={{width:'100%',minHeight:46,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:14,transition:'.2s'}} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shipping_phone" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>Phone *</label>
                    <input id="shipping_phone" name="shipping_phone" type="tel" placeholder="+91 98765 43210" value={form.shipping_phone} onChange={handleChange} disabled={loading} required
                      style={{width:'100%',minHeight:46,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:14}} />
                  </div>
                </div>

                <div className="form-group" style={{marginBottom:16}}>
                  <label htmlFor="shipping_address" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>Address *</label>
                  <textarea id="shipping_address" name="shipping_address" rows={3} placeholder="House no, street, area" value={form.shipping_address} onChange={handleChange} disabled={loading} required
                    style={{width:'100%',padding:'12px 16px',border:'1px solid #ece8de',borderRadius:16,outline:'none',fontSize:14,resize:'none'}} />
                </div>

                <div className="checkout-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div className="form-group"><label htmlFor="shipping_city" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>City *</label>
                    <input id="shipping_city" name="shipping_city" type="text" placeholder="Delhi" value={form.shipping_city} onChange={handleChange} disabled={loading} required style={{width:'100%',minHeight:46,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:14}} /></div>
                  <div className="form-group"><label htmlFor="shipping_state" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>State *</label>
                    <input id="shipping_state" name="shipping_state" type="text" placeholder="Delhi" value={form.shipping_state} onChange={handleChange} disabled={loading} required style={{width:'100%',minHeight:46,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:14}} /></div>
                  <div className="form-group"><label htmlFor="shipping_country" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>Country *</label>
                    <input id="shipping_country" name="shipping_country" type="text" value={form.shipping_country} onChange={handleChange} disabled={loading} required style={{width:'100%',minHeight:46,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:14}} /></div>
                  <div className="form-group"><label htmlFor="shipping_postal_code" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>Postal Code *</label>
                    <input id="shipping_postal_code" name="shipping_postal_code" type="text" placeholder="110001" value={form.shipping_postal_code} onChange={handleChange} disabled={loading} required style={{width:'100%',minHeight:46,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:14}} /></div>
                </div>

                <div className="form-group" style={{marginTop:16}}>
                  <label htmlFor="notes" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,display:'block'}}>Order Notes <span style={{textTransform:'none',fontWeight:400,color:'#b8b3a9'}}>(Optional)</span></label>
                  <textarea id="notes" name="notes" rows={2} placeholder="Delivery instructions..." value={form.notes} onChange={handleChange} disabled={loading}
                    style={{width:'100%',padding:'12px 16px',border:'1px solid #ece8de',borderRadius:16,outline:'none',fontSize:14,resize:'none'}} />
                </div>
              </div>

              <div className="checkout-section" style={{marginTop:32,paddingTop:24,borderTop:'1px solid #f5f2eb'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                  <div style={{width:32,height:32,borderRadius:10,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:12,fontWeight:800}}>2</div>
                  <h2 style={{margin:0,fontSize:16,fontWeight:800}}>Payment Method</h2>
                </div>

                <div className="payment-methods" style={{display:'flex',flexDirection:'column',gap:12}}>
                  {[
                    {id:'COD', title:'Cash on Delivery', desc:'Pay when your order arrives.', icon:'💵', badge:'Most Popular'},
                    {id:'UPI', title:'UPI / Wallet', desc:'Pay via GPay, PhonePe, Paytm', icon:'📱', badge:'Instant'},
                  ].map(m=>(
                    <label key={m.id} className="payment-option" style={{
                      display:'flex',alignItems:'center',gap:14,padding:16,
                      border:`1px solid ${paymentMethod===m.id ? '#1a1816' : '#ece8de'}`,
                      background: paymentMethod===m.id ? '#fafaf7' : '#fff',
                      borderRadius:16,cursor:'pointer',transition:'.2s'
                    }}>
                      <input type="radio" name="payment_method" value={m.id} checked={paymentMethod===m.id} onChange={e=>setPaymentMethod(e.target.value)} disabled={loading} style={{width:18,height:18,accentColor:'#1a1816'}} />
                      <div style={{width:44,height:44,borderRadius:12,background:'#fff',border:'1px solid #ece8de',display:'grid',placeItems:'center',fontSize:20}}>{m.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <strong style={{fontSize:14}}>{m.title}</strong>
                          <span style={{padding:'2px 8px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800}}>{m.badge}</span>
                        </div>
                        <span style={{fontSize:12,color:'#8c8881'}}>{m.desc}</span>
                      </div>
                      {paymentMethod===m.id && <span style={{color:'#10b981',fontWeight:800}}>✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="checkout-actions" style={{display:'flex',gap:12,marginTop:28}}>
                <Link to="/cart" style={{flex:1,minHeight:48,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontWeight:700,fontSize:14,opacity: loading ? .6 : 1,pointerEvents: loading ? 'none' : 'auto'}}>
                  ← Back to Cart
                </Link>
                <button type="submit" disabled={loading} style={{
                  flex:1.5,minHeight:48,borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',
                  fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  boxShadow:'0 8px 20px rgba(0,0,0,.18)',opacity: loading ? .7 : 1,cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? (
                    <>
                      <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} />
                      Placing Order...
                    </>
                  ) : 'Place Order →'}
                </button>
              </div>
            </form>
          </section>

          {/* Right Summary - Premium */}
          <aside style={{position:'sticky',top:96,background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:24,boxShadow:'0 8px 24px rgba(0,0,0,.06)'}}>
            <h2 style={{margin:'0 0 16px',fontSize:16,fontWeight:900}}>Order Summary</h2>
            <div style={{padding:12,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:12,marginBottom:16,fontSize:12,lineHeight:1.5}}>
              <strong style={{display:'block',fontSize:11,marginBottom:4}}>🔒 SECURE CHECKOUT</strong>
              Your information is protected with 256-bit SSL encryption.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12,fontSize:14}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#8c8881'}}>Subtotal</span><span style={{fontWeight:700}}>Calculated at next step</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#8c8881'}}>Shipping</span><span style={{color:'#10b981',fontWeight:700}}>Free ✓</span></div>
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid #ece8de'}}><span style={{fontWeight:800}}>Total</span><span style={{fontWeight:900,fontSize:18}}>₹0</span></div>
            </div>
            <div style={{marginTop:16,display:'flex',alignItems:'center',gap:8,fontSize:11,color:'#b8b3a9',fontWeight:600,justifyContent:'center'}}>
              <span>💳</span> UPI • Cards • COD • Net Banking
            </div>
          </aside>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:1100px){.checkout-layout{grid-template-columns:1fr !important;} aside{position:static !important;}} @media(max-width:600px){.checkout-grid{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}

export default Checkout;