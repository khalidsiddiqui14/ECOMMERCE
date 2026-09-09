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
      const should =!prev.slug || prev.slug===prevAuto;
      return {...prev, name, slug: should? slugify(name) : prev.slug };
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
    if (data.detail) return Array.isArray(data.detail)? data.detail.join(", ") : String(data.detail);
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
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto">
          <div className="h- bg-white border border-[#d5d9d9] rounded- mb-3 animate-pulse" />
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-center shadow-sm">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded- bg-[#131921] text-white grid place-items-center font-bold">{(store.name||"S")[0].toUpperCase()}</div>
            <div>
              <div className="text- font-bold uppercase text-[#C45500]">SELLER CENTRAL • STORE SETUP</div>
              <h1 className="text- font-bold">Store Settings 🏪</h1>
              <p className="text- text-[#565959]">Manage your store info • <strong className="text-[#0F1111]">{store.name || "Unnamed Store"}</strong></p>
            </div>
          </div>
          <button onClick={()=>loadStore(true)} disabled={refreshing||saving} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">{refreshing? "↻ Refreshing..." : "↻ Refresh"}</button>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text- text-[#c40000] shadow-sm">⚠ {error}</div>}
        {success && <div className="mt-2 bg-white border-l-4 border-[#067D62] p-3 text- text-[#067D62] shadow-sm">✓ {success}</div>}

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded- shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex border-b border-[#e7e7e7]">
              {[{n:'1',t:'Store Info',active:true},{n:'2',t:'Contact'},{n:'3',t:'Address'}].map(s=>(
                <div key={s.n} className={`flex-1 p-2.5 flex items-center gap-2 text- font-bold border-r border-[#e7e7e7] ${s.active? 'bg-[#f0f2f2] text-[#0F1111]' : 'bg-white text-[#565959]'}`}>
                  <span className={`w-4 h-4 rounded-full grid place-items-center text- ${s.active? 'bg-[#131921] text-white' : 'bg-[#e7e7e7]'}`}>{s.n}</span>{s.t}
                </div>
              ))}
            </div>

            <div className="p-5">
              <div className="mb-6">
                <h2 className="font-bold text- flex items-center gap-2"><span className="w-5 h-5 rounded- bg-[#131921] text-white grid place-items-center text-">🏪</span> Store Information • Branding</h2>
                <div className="flex flex-col gap-1 mt-3 mb-3">
                  <label className="text- font-bold uppercase">Store Name *</label>
                  <input name="name" type="text" value={store.name} onChange={handleNameChange} disabled={saving} maxLength={255} required placeholder="Khalid Electronics" className="h-8 px-2 border border-[#a6a6a6] rounded- text- font-bold bg-white outline-none" />
                </div>
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text- font-bold uppercase">Store Slug (URL) *</label>
                  <div className="flex gap-2">
                    <input name="slug" type="text" value={store.slug} onChange={handleChange} disabled={saving} maxLength={255} required placeholder="khalid-electronics" className="flex-1 h-8 px-2 border border-[#a6a6a6] rounded- text- bg-[#f0f2f2] outline-none" />
                    <button type="button" onClick={()=>setStore(p=>({...p, slug: slugify(p.name)}))} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- font-bold shadow-sm">Auto</button>
                  </div>
                  <small className="text- text-[#565959]">Preview: <code className="bg-[#f0f2f2] px-1 rounded">/{store.slug || "your-store"}</code> • lowercase, hyphens only</small>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text- font-bold uppercase">Store Description *</label>
                  <textarea name="description" rows={4} value={store.description} onChange={handleChange} disabled={saving} maxLength={2000} required placeholder="What do you sell? Why should customers trust you?" className="p-2 border border-[#a6a6a6] rounded- text- outline-none resize-y" />
                  <div className="flex justify-between text- text-[#767676]"><span>{store.description.length}/2000 characters</span><span>{store.description.length<80? "Add more for trust" : "✓ Good for SEO"}</span></div>
                </div>
              </div>

              <div className="mb-6 p-3 bg-[#f0f2f2] border border-[#d5d9d9] rounded-">
                <h2 className="font-bold text- flex items-center gap-2"><span className="w-5 h-5 rounded- bg-[#131921] text-white grid place-items-center text-">📞</span> Contact Information • Customer support</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="flex flex-col gap-1"><label className="text- font-bold uppercase">Store Email *</label><input name="email" type="email" value={store.email} onChange={handleChange} disabled={saving} required placeholder="support@yourstore.com" className="h-8 px-2 border border-[#a6a6a6] rounded- text- bg-white outline-none" /></div>
                  <div className="flex flex-col gap-1"><label className="text- font-bold uppercase">Store Phone *</label><input name="phone" type="tel" value={store.phone} onChange={handleChange} disabled={saving} maxLength={20} required placeholder="+91 98765 43210" className="h-8 px-2 border border-[#a6a6a6] rounded- text- bg-white outline-none" /></div>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="font-bold text- flex items-center gap-2"><span className="w-5 h-5 rounded- bg-[#131921] text-white grid place-items-center text-">📍</span> Store Address • Pickup location</h2>
                <div className="flex flex-col gap-1 mt-3 mb-3"><label className="text- font-bold uppercase">Full Address *</label><textarea name="address" rows={3} value={store.address} onChange={handleChange} disabled={saving} required placeholder="Building, Street, Area, Landmark" className="p-2 border border-[#a6a6a6] rounded- text- outline-none resize-y" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1"><label className="text- font-bold uppercase">City *</label><input name="city" type="text" value={store.city} onChange={handleChange} disabled={saving} required placeholder="New Delhi" className="h-8 px-2 border border-[#a6a6a6] rounded- text- bg-white" /></div>
                  <div className="flex flex-col gap-1"><label className="text- font-bold uppercase">State *</label><input name="state" type="text" value={store.state} onChange={handleChange} disabled={saving} required placeholder="Delhi" className="h-8 px-2 border border-[#a6a6a6] rounded- text- bg-white" /></div>
                  <div className="flex flex-col gap-1"><label className="text- font-bold uppercase">Country *</label><input name="country" type="text" value={store.country} onChange={handleChange} disabled={saving} required placeholder="India" className="h-8 px-2 border border-[#a6a6a6] rounded- text- bg-white" /></div>
                  <div className="flex flex-col gap-1"><label className="text- font-bold uppercase">Postal Code *</label><input name="postal_code" type="text" value={store.postal_code} onChange={handleChange} disabled={saving} required maxLength={12} placeholder="110001" className="h-8 px-2 border border-[#a6a6a6] rounded- text- bg-white" /></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#f0f2f2] border-t border-[#d5d9d9]">
              <span className="text- text-[#565959]">🏪 Amazon tip: Good store name + detailed desc builds trust.</span>
              <button type="submit" disabled={saving} className="h-8 px-5 bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold shadow-sm disabled:opacity-50">
                {saving? "Saving..." : "💾 Save Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VendorStore;