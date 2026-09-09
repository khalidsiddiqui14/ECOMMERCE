import { useEffect, useState } from "react";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../services/userService";

const emptyForm = { name:"", phone:"", pincode:"", locality:"", address:"", city:"", state:"", landmark:"", alternate_phone:"", address_type:"HOME", is_default:false };

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAddresses();
      const d = res?.data || res || [];
      const list = Array.isArray(d)? d : d.results || d.addresses || [];
      setAddresses(Array.isArray(list)? list : []);
    } catch (err) {
      console.warn("getAddresses failed", err?.message);
      // Fallback local
      try {
        const local = JSON.parse(localStorage.getItem("user_addresses")||"[]");
        setAddresses(local);
      } catch { setAddresses([]); }
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const validate = () => {
    if (!form.name.trim()) return "Full Name required";
    if (!/^[0-9]{10}$/.test(form.phone.replace(/\D/g,""))) return "Enter valid 10-digit mobile number";
    if (!/^[0-9]{6}$/.test(form.pincode.replace(/\D/g,""))) return "Enter valid 6-digit pincode";
    if (!form.address.trim()) return "Address required";
    if (!form.city.trim()) return "City required";
    if (!form.state.trim()) return "State required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {...form, pincode: form.pincode.replace(/\D/g,""), phone: form.phone.replace(/\D/g,"") };
      if (editingId) await updateAddress(editingId, payload);
      else await addAddress(payload);
      setShowForm(false); setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || "Failed to save address");
    } finally { setSaving(false); }
  };

  const handleEdit = (addr) => {
    setForm({...emptyForm,...addr, address_type: addr.address_type || "HOME" });
    setEditingId(addr.id);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address? This cannot be undone.")) return;
    try {
      await deleteAddress(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await updateAddress(addr.id, {...addr, is_default: true });
      await load();
    } catch (err) {
      console.error("set default failed", err?.message);
    }
  };

  return (
    <div className="bg-[#EAEDED] min-h-screen py-4">
      <div className="max-w- mx-auto px-3">
        {/* Header */}
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
          <h1 className="text- font-bold text-[#0F1111]">Your Addresses</h1>
          <p className="text- text-[#565959] mt-1">Manage your delivery addresses — Add new, edit, remove, or set default. Used for checkout & Prime delivery.</p>
        </div>

        <button onClick={()=>{ if(showForm){ setShowForm(false); setEditingId(null); } else { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); } }} className="mt-4 h-10 px-5 bg-white border border-[#d5d9d9] rounded- text- font-bold shadow-sm flex items-center gap-2 hover:bg-[#f7fafa]">
          <span className="w-6 h-6 border border-dashed border-[#888] rounded- grid place-items-center text-">+</span> {showForm? "Cancel" : "Add a new address"}
        </button>

        {error && <div className="mt-3 bg-[#FFF6F6] border border-[#CC0C39]/30 text-[#CC0C39] text- p-3 rounded-">{error}</div>}

        {showForm && (
          <div className="mt-3 bg-white border border-[#d5d9d9] rounded- p-5 shadow-sm">
            <h3 className="font-bold text- mb-1">{editingId? "Edit address" : "Add a new address"}</h3>
            <p className="text- text-[#565959] mb-4">Amazon-like: Full name, 10-digit mobile, 6-digit pincode required. State/City auto-fill later.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required placeholder="Full Name (First and Last Name)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] focus:shadow-[0_0_3px_#e77600] outline-none" />
              <input required placeholder="10-digit mobile number (without +91)" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,"").slice(0,10)})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />
              <input required placeholder="Pincode (6 digits) - e.g. 110059" value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value.replace(/\D/g,"").slice(0,6)})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />
              <input placeholder="Locality / Area / Sector" value={form.locality} onChange={e=>setForm({...form,locality:e.target.value})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />
              <textarea required placeholder="Address (House No, Building, Street, Area) *" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="md:col-span-2 min-h- border border-[#a6a6a6] rounded- p-3 text- focus:border-[#e77600] outline-none" />
              <input required placeholder="City/District/Town *" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />
              <input required placeholder="State *" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />
              <input placeholder="Landmark (Optional) e.g. Near Metro" value={form.landmark} onChange={e=>setForm({...form,landmark:e.target.value})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />
              <input placeholder="Alternate Phone (Optional)" value={form.alternate_phone} onChange={e=>setForm({...form,alternate_phone:e.target.value.replace(/\D/g,"").slice(0,10)})} className="h-9 border border-[#a6a6a6] rounded- px-3 text- focus:border-[#e77600] outline-none" />

              <div className="md:col-span-2 flex flex-wrap gap-6 py-2 border-y border-[#eaeaea] mt-1">
                <label className="flex items-center gap-2 text- cursor-pointer"><input type="radio" checked={form.address_type==="HOME"} onChange={()=>setForm({...form,address_type:"HOME"})} className="accent-[#e77600]" /> Home (7AM-9PM)</label>
                <label className="flex items-center gap-2 text- cursor-pointer"><input type="radio" checked={form.address_type==="WORK"} onChange={()=>setForm({...form,address_type:"WORK"})} className="accent-[#e77600]" /> Work (10AM-6PM)</label>
                <label className="flex items-center gap-2 text- cursor-pointer"><input type="checkbox" checked={form.is_default} onChange={e=>setForm({...form,is_default:e.target.checked})} className="accent-[#e77600]" /> Make this my default address</label>
              </div>

              <div className="md:col-span-2 flex gap-2 mt-1">
                <button type="submit" disabled={saving} className="h-9 px-6 bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold shadow-sm hover:bg-[#F7CA00] disabled:opacity-60">{saving? "Saving..." : editingId? "Save address" : "Add address"}</button>
                <button type="button" onClick={()=>{ setShowForm(false); setEditingId(null); setError(""); }} className="h-9 px-6 bg-white border border-[#d5d9d9] rounded- text- hover:bg-[#f7fafa]">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="mt-4">
          {loading? (
            <div className="grid md:grid-cols-2 gap-3">
              {[1,2].map(i=><div key={i} className="h-32 bg-white rounded- animate-pulse border border-[#d5d9d9]" />)}
            </div>
          ) : addresses.length===0? (
            <div className="bg-white border border-[#d5d9d9] rounded- p-10 text-center shadow-sm">
              <div className="text-">📍</div>
              <div className="font-bold text- mt-2">No addresses saved yet</div>
              <div className="text- text-[#565959] mt-1">Add your first address to enable fast checkout & Prime delivery</div>
              <button onClick={()=>{ setShowForm(true); }} className="mt-4 h-9 px-6 bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold">Add address now</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {addresses.map(addr=>(
                <div key={addr.id} className={`bg-white border rounded- p-4 shadow-sm relative ${addr.is_default? 'border-[#e77600] ring-1 ring-[#e77600]/30' : 'border-[#d5d9d9]'}`}>
                  {addr.is_default && <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#f0f2f2] border border-[#d5d9d9] rounded text- font-bold">DEFAULT • Prime</span>}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text- font-bold border ${addr.address_type==="WORK"? 'bg-[#e8f6ff] border-[#a5d4ff] text-[#0066c0]' : 'bg-[#f0f2f2] border-[#d5d9d9]'}`}>{addr.address_type || "HOME"}</span>
                    <strong className="text- text-[#0F1111]">{addr.name}</strong>
                    <span className="text- text-[#0F1111]">• {addr.phone}</span>
                  </div>
                  <p className="text- mt-2 leading-[1.45] text-[#0F1111]">{addr.address}{addr.locality? `, ${addr.locality}`: ""}<br/>{addr.city}, {addr.state} - {addr.pincode}<br/>India</p>
                  {addr.landmark && <p className="text- text-[#565959] mt-1">Landmark: {addr.landmark} {addr.alternate_phone? `• Alt: ${addr.alternate_phone}`: ""}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={()=>handleEdit(addr)} className="h-7 px-3 bg-white border border-[#d5d9d9] rounded- text- hover:bg-[#f7fafa]">Edit</button>
                    <button onClick={()=>handleDelete(addr.id)} className="h-7 px-3 bg-white border border-[#d5d9d9] rounded- text- hover:bg-[#FFF6F6] hover:text-[#CC0C39] hover:border-[#CC0C39]/40">Remove</button>
                    {!addr.is_default && <button onClick={()=>handleSetDefault(addr)} className="h-7 px-3 bg-[#FFD814]/70 border border-[#FCD200] rounded- text- font-bold hover:bg-[#FFD814]">Set as Default</button>}
                  </div>
                  {addr.is_default && <div className="mt-2 text- text-[#067D62] font-bold">✓ Deliveries will go to this address by default</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white border border-[#d5d9d9] rounded- p-3 text- text-[#565959]">
          <b>Tip:</b> Amazon uses default address for Buy Now. Keep phone ON for delivery OTP • 6-digit pincode required for Prime • Home = 7AM-9PM, Work = 10AM-6PM
        </div>
      </div>
    </div>
  );
}
export default Addresses;