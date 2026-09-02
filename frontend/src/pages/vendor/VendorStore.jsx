import { useCallback, useEffect, useState } from "react";
import { getVendorStore, updateVendorStore } from "../../services/vendorService";

const INITIAL_STORE = { name:"", slug:"", description:"", email:"", phone:"", address:"", city:"", state:"", country:"India", postal_code:"" };

function VendorStore() {
  const [store, setStore] = useState(INITIAL_STORE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizeStore = (data) => ({
    name: data?.name || "", slug: data?.slug || "", description: data?.description || "",
    email: data?.email || "", phone: data?.phone || "", address: data?.address || "",
    city: data?.city || "", state: data?.state || "", country: data?.country || "India", postal_code: data?.postal_code || "",
  });

  const loadStore = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try { const data = await getVendorStore(); setStore(normalizeStore(data)); }
    catch (err) { setError(err.response?.data?.detail || "Store load nahi ho paaya."); }
    finally { if (isRefresh) setRefreshing(false); else setLoading(false); }
  }, []);

  useEffect(() => { loadStore(false); }, [loadStore]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStore(prev=>({...prev, [name]: value}));
    if (error) setError(""); if (success) setSuccess("");
  };
  const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  const handleNameChange = (e) => {
    const name = e.target.value;
    setStore(prev=>{
      const prevAuto = slugify(prev.name);
      const should = !prev.slug || prev.slug===prevAuto;
      return { ...prev, name, slug: should ? slugify(name) : prev.slug };
    });
    setError(""); setSuccess("");
  };

  const validateStore = () => {
    if (!store.name.trim()) return "Store name is required.";
    if (!store.slug.trim()) return "Store slug is required.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(store.slug.trim())) return "Store slug can contain only letters, numbers and hyphens.";
    if (!store.description.trim()) return "Store description is required.";
    if (!store.email.trim()) return "Store email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email.trim())) return "Please enter a valid store email.";
    if (!store.phone.trim()) return "Store phone number is required.";
    if (!/^[0-9+\-\s()]{7,20}$/.test(store.phone.trim())) return "Please enter a valid phone number.";
    if (!store.address.trim()) return "Store address is required.";
    if (!store.city.trim()) return "City is required.";
    if (!store.state.trim()) return "State is required.";
    if (!store.country.trim()) return "Country is required.";
    if (!store.postal_code.trim()) return "Postal code is required.";
    if (!/^[A-Za-z0-9\s-]{3,12}$/.test(store.postal_code.trim())) return "Please enter a valid postal code.";
    return "";
  };

  const formatApiError = (err) => {
    const data = err.response?.data;
    if (!data) return err.message || "Store update nahi ho paaya.";
    if (typeof data==="string") return data;
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join(", ") : String(data.detail);
    return Object.entries(data).map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):String(m)}`).join(" | ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const ve = validateStore();
    if (ve) { setError(ve); return; }
    setSaving(true);
    try {
      const storeData = {
        name: store.name.trim(), slug: store.slug.trim(), description: store.description.trim(),
        email: store.email.trim(), phone: store.phone.trim(), address: store.address.trim(),
        city: store.city.trim(), state: store.state.trim(), country: store.country.trim(), postal_code: store.postal_code.trim(),
      };
      const data = await updateVendorStore(storeData);
      setStore(normalizeStore(data));
      setSuccess("Store updated successfully.");
    } catch (err) { setError(formatApiError(err)); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <div style={{height:100,background:'#fff',border:'1px solid #ece8de',borderRadius:20,marginBottom:16,animation:'pulse 1.5s infinite'}} />
          <div style={{height:500,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-store-page" style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
      <div className="vendor-container" style={{maxWidth:800,margin:'0 auto'}}>
        {/* Header */}
        <div className="vendor-store-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:20,background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:20,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
          <div style={{display:'flex',gap:14,alignItems:'center'}}>
            <div style={{width:56,height:56,borderRadius:14,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:24,fontWeight:900}}>{(store.name||"S")[0].toUpperCase()}</div>
            <div>
              <span style={{display:'inline-flex',padding:'3px 8px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800}}>VENDOR PANEL • STORE SETUP</span>
              <h1 style={{margin:'4px 0 2px',fontSize:20,fontWeight:900}}>Store Settings 🏪</h1>
              <p style={{margin:0,fontSize:13,color:'#8c8881'}}>Manage your store information and contact details. • <strong style={{color:'#1a1816'}}>{store.name || "Unnamed Store"}</strong></p>
            </div>
          </div>
          <button onClick={()=>loadStore(true)} disabled={refreshing||saving} style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>
            {refreshing ? "↻ Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}
        {success && <div role="status" style={{padding:'12px 16px',marginBottom:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>✓ {success}</div>}

        <section className="vendor-store-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,boxShadow:'0 4px 20px rgba(0,0,0,.04)',overflow:'hidden'}}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{display:'flex',borderBottom:'1px solid #f5f2eb'}}>
              {[{n:'1',t:'Store Info',active:true},{n:'2',t:'Contact'},{n:'3',t:'Address'}].map(s=>(
                <div key={s.n} style={{flex:1,padding:'12px 16px',display:'flex',alignItems:'center',gap:8,background: s.active ? '#1a1816' : '#fafaf7',color: s.active ? '#fff' : '#8c8881',fontSize:11,fontWeight:800,borderRight:'1px solid #f5f2eb'}}>
                  <span style={{width:18,height:18,borderRadius:'50%',background: s.active ? '#fff' : '#ece8de',color: s.active ? '#1a1816' : '#8c8881',display:'grid',placeItems:'center',fontSize:10}}>{s.n}</span>{s.t}
                </div>
              ))}
            </div>

            <div style={{padding:24}}>
            {/* Store Information */}
            <div className="store-form-section" style={{marginBottom:28}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>🏪</span> Store Information • Branding</h2>
              <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                <label htmlFor="name" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Store Name *</label>
                <input id="name" name="name" type="text" value={store.name} onChange={handleNameChange} disabled={saving} maxLength={255} required placeholder="Khalid Electronics" style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:14,fontWeight:700,background:'#fff'}} />
              </div>
              <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                <label htmlFor="slug" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Store Slug (URL) *</label>
                <div style={{display:'flex',gap:8}}>
                  <input id="slug" name="slug" type="text" value={store.slug} onChange={handleChange} disabled={saving} maxLength={255} required placeholder="khalid-electronics" style={{flex:1,minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,background:'#fafaf7'}} />
                  <button type="button" onClick={()=>setStore(p=>({...p, slug: slugify(p.name)}))} style={{minHeight:44,padding:'0 14px',borderRadius:12,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>Auto</button>
                </div>
                <small style={{fontSize:11,color:'#8c8881'}}>Preview: <code style={{background:'#fafaf7',padding:'2px 6px',borderRadius:6,fontSize:11}}>/{store.slug || "your-store"}</code> • lowercase, hyphens only • Flipkart SEO</small>
              </div>
              <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6}}>
                <label htmlFor="description" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Store Description *</label>
                <textarea id="description" name="description" rows={5} value={store.description} onChange={handleChange} disabled={saving} maxLength={2000} required placeholder="What do you sell? Why should customers trust you? Warranty, return policy..." style={{padding:14,border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,lineHeight:1.5,resize:'vertical'}} />
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <small style={{fontSize:11,color: store.description.length>1800 ? '#ef4444' : '#8c8881'}}>{store.description.length}/2000 characters</small>
                  <small style={{fontSize:11,color:'#8c8881'}}>{store.description.length<80 ? "Add more for trust" : "✓ Good for SEO"}</small>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="store-form-section" style={{marginBottom:28,padding:20,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:16}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>📞</span> Contact Information • Customer support</h2>
              <div className="store-form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <label htmlFor="email" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Store Email *</label>
                  <input id="email" name="email" type="email" value={store.email} onChange={handleChange} disabled={saving} required placeholder="support@yourstore.com" style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,background:'#fff'}} />
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <label htmlFor="phone" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Store Phone *</label>
                  <input id="phone" name="phone" type="tel" value={store.phone} onChange={handleChange} disabled={saving} maxLength={20} required placeholder="+91 98765 43210" style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,background:'#fff'}} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="store-form-section" style={{marginBottom:24}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>📍</span> Store Address • Pickup location</h2>
              <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                <label htmlFor="address" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Full Address *</label>
                <textarea id="address" name="address" rows={3} value={store.address} onChange={handleChange} disabled={saving} required placeholder="Building, Street, Area, Landmark - where couriers pickup" style={{padding:14,border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,resize:'vertical'}} />
              </div>
              <div className="store-form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {[
                  {id:'city',ph:'New Delhi'},
                  {id:'state',ph:'Delhi'},
                  {id:'country',ph:'India'},
                  {id:'postal_code',ph:'110001',max:12},
                ].map(f=>(
                  <div key={f.id} style={{display:'flex',flexDirection:'column',gap:6}}>
                    <label htmlFor={f.id} style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>{f.id.replace('_',' ')} *</label>
                    <input id={f.id} name={f.id} type="text" value={store[f.id]} onChange={handleChange} disabled={saving} required maxLength={f.max} placeholder={f.ph} style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,background:'#fff'}} />
                  </div>
                ))}
              </div>
            </div>

            </div>

            <div className="store-form-actions" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',background:'#fafaf7',borderTop:'1px solid #f5f2eb',flexWrap:'wrap',gap:12}}>
              <span style={{fontSize:11,color:'#8c8881'}}>🏪 Flipkart tip: Good store name + detailed desc builds customer trust & ranking.</span>
              <button type="submit" disabled={saving} style={{minHeight:44,padding:'0 24px',borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',fontSize:13,fontWeight:800,cursor: saving ? 'not-allowed' : 'pointer',opacity: saving ? .7 : 1,display:'flex',alignItems:'center',gap:8,boxShadow:'0 6px 18px rgba(0,0,0,.18)'}}>
                {saving ? (<><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} /> Saving...</>) : "💾 Save Store"}
              </button>
            </div>
          </form>
        </section>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:700px){.store-form-grid{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}

export default VendorStore;