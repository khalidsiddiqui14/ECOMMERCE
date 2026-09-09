import { useCallback, useEffect, useState } from "react";
import { getVendorProfile, updateVendorProfile } from "../../services/vendorService";

const INITIAL_PROFILE = { username:"", email:"", phone:"", role:"VENDOR", business_name:"", gst_number:"", address:"", city:"", state:"", country:"India", postal_code:"", is_verified:false, is_active:true };

function normalizeProfile(data) {
  return {
   ...INITIAL_PROFILE,
   ...(data||{}),
    username: data?.username || data?.user || "",
    email: data?.email || "",
    role: data?.role || "VENDOR",
    business_name: data?.business_name || "",
    gst_number: data?.gst_number || "",
    phone: data?.phone || "",
    address: data?.address || "",
    city: data?.city || "",
    state: data?.state || "",
    country: data?.country || "India",
    postal_code: data?.postal_code || "",
    is_verified: Boolean(data?.is_verified),
    is_active: data?.is_active!==false,
  };
}

function VendorProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(""); setSuccess("");
    try {
      const data = await getVendorProfile();
      setProfile(normalizeProfile(data));
    } catch (err) {
      setError(err.response?.data?.detail || "Vendor profile load nahi ho paaya.");
    } finally { if (isRefresh) setRefreshing(false); else setLoading(false); }
  }, []);

  useEffect(() => { loadProfile(false); }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(p=>({...p, [name]: value}));
    setError(""); setSuccess("");
  };

  const validateProfile = () => {
    if (!profile.business_name.trim()) return "Business name is required.";
    if (!profile.phone.trim()) return "Phone number is required.";
    if (!/^[0-9+\-\s()]{7,20}$/.test(profile.phone.trim())) return "Please enter a valid phone number.";
    if (profile.gst_number.trim() &&!/^[0-9A-Z]{15}$/i.test(profile.gst_number.trim())) return "GST number must contain 15 characters.";
    if (!profile.address.trim()) return "Address is required.";
    if (!profile.city.trim()) return "City is required.";
    if (!profile.state.trim()) return "State is required.";
    if (!profile.country.trim()) return "Country is required.";
    if (!profile.postal_code.trim()) return "Postal code is required.";
    if (!/^[A-Za-z0-9\s-]{3,12}$/.test(profile.postal_code.trim())) return "Please enter a valid postal code.";
    return "";
  };

  const formatApiError = (err) => {
    const data = err.response?.data;
    if (!data) return err.message || "Vendor profile update nahi ho paaya.";
    if (typeof data==="string") return data;
    if (data.detail) return Array.isArray(data.detail)? data.detail.join(", ") : String(data.detail);
    return Object.entries(data).map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):String(m)}`).join(" | ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const ve = validateProfile();
    if (ve) { setError(ve); return; }
    setSaving(true);
    try {
      const profileData = {
        business_name: profile.business_name.trim(),
        phone: profile.phone.trim(),
        gst_number: profile.gst_number.trim() || null,
        address: profile.address.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        country: profile.country.trim(),
        postal_code: profile.postal_code.trim(),
      };
      const data = await updateVendorProfile(profileData);
      setProfile(normalizeProfile({...profile,...data, username: profile.username, email: profile.email, role: profile.role, is_verified: profile.is_verified, is_active: profile.is_active }));
      setSuccess("Vendor profile updated successfully.");
    } catch (err) {
      setError(formatApiError(err));
    } finally { setSaving(false); }
  };

  const avatarName = profile.username || profile.business_name || "Vendor";
  const avatarLetter = avatarName.charAt(0).toUpperCase();

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

  const Input = ({ label, id, readOnly, small,...props }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text- font-bold uppercase text-[#0F1111]">{label}</label>
      <input id={id} {...props} readOnly={readOnly} className={`h-8 px-2 border border-[#a6a6a6] rounded- text- outline-none ${readOnly? 'bg-[#f0f2f2] text-[#565959]' : 'bg-white text-[#0F1111]'}`} />
      {small && <small className="text- text-[#565959]">{small}</small>}
    </div>
  );

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 rounded- bg-[#131921] text-white grid place-items-center text- font-bold">{avatarLetter}</div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#131921] text-white text- font-bold">SELLER CENTRAL</span>
              {profile.is_verified? <span className="px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#067D62] text- font-bold">✓ VERIFIED</span> : <span className="px-2 py-0.5 rounded-full bg-[#fefce8] border border-[#fde68a] text-[#854d0e] text- font-bold">⏳ PENDING</span>}
              <span className={`px-2 py-0.5 rounded-full border text- font-bold ${profile.is_active? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]' : 'bg-[#fef2f2] border-[#fecaca] text-[#CC0C39]'}`}>{profile.is_active? "● ACTIVE" : "● INACTIVE"}</span>
            </div>
            <h1 className="text- font-bold mt-1">Vendor Profile</h1>
            <p className="text- text-[#565959]">{profile.business_name || "Manage your vendor account"} • {profile.email}</p>
          </div>
          <button onClick={()=>loadProfile(true)} disabled={refreshing||saving} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">{refreshing? "↻ Refreshing..." : "↻ Refresh"}</button>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text- text-[#c40000] shadow-sm">⚠ {error}</div>}
        {success && <div className="mt-2 bg-white border-l-4 border-[#067D62] p-3 text- text-[#067D62] shadow-sm">✓ {success}</div>}

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded- shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex border-b border-[#e7e7e7]">
              {[{n:'1',t:'Account',active:false},{n:'2',t:'Business',active:false},{n:'3',t:'Address',active:true}].map(s=>(
                <div key={s.n} className={`flex-1 p-2.5 flex items-center gap-2 text- font-bold border-r border-[#e7e7e7] ${s.active? 'bg-[#f0f2f2] text-[#0F1111]' : 'bg-white text-[#565959]'}`}>
                  <span className={`w-4 h-4 rounded-full grid place-items-center text- ${s.active? 'bg-[#131921] text-white' : 'bg-[#e7e7e7]'}`}>{s.n}</span>{s.t}
                </div>
              ))}
            </div>

            <div className="p-5">
              <div className="mb-6">
                <h2 className="font-bold text- flex items-center gap-2"><span className="w-5 h-5 rounded- bg-[#131921] text-white grid place-items-center text-">👤</span> Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <Input label="Username" id="username" name="username" type="text" value={profile.username} readOnly small="Username cannot be changed here." />
                  <Input label="Email" id="email" name="email" type="email" value={profile.email} readOnly small="Email cannot be changed here." />
                  <Input label="Phone *" id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} disabled={saving} maxLength={20} required placeholder="+91 98765 43210" />
                  <Input label="Role" id="role" name="role" type="text" value={profile.role} readOnly />
                </div>
              </div>

              <div className="mb-6 p-3 bg-[#f0f2f2] border border-[#d5d9d9] rounded-">
                <h2 className="font-bold text- flex items-center gap-2"><span className="w-5 h-5 rounded- bg-[#131921] text-white grid place-items-center text-">🏢</span> Business Information • KYC</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <Input label="Business Name *" id="business_name" name="business_name" type="text" value={profile.business_name} onChange={handleChange} disabled={saving} maxLength={255} required placeholder="Khalid Traders Pvt Ltd" />
                  <div className="flex flex-col gap-1">
                    <label className="text- font-bold uppercase">GST Number</label>
                    <input name="gst_number" type="text" value={profile.gst_number} onChange={handleChange} disabled={saving} maxLength={15} placeholder="22AAAAA0000A1Z5" className="h-8 px-2 border border-[#a6a6a6] rounded- text- uppercase bg-white outline-none" />
                    <small className="text- text-[#565959]">Example: 22AAAAA0000A1Z5 • 15 chars • Optional but builds trust</small>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="font-bold text- flex items-center gap-2"><span className="w-5 h-5 rounded- bg-[#131921] text-white grid place-items-center text-">📍</span> Address • For pickup & returns</h2>
                <div className="flex flex-col gap-1 mt-3 mb-3">
                  <label className="text- font-bold uppercase">Full Address *</label>
                  <textarea name="address" rows={3} value={profile.address} onChange={handleChange} disabled={saving} required placeholder="Building, Street, Area, Landmark..." className="p-2 border border-[#a6a6a6] rounded- text- outline-none resize-y" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="City *" id="city" name="city" type="text" value={profile.city} onChange={handleChange} disabled={saving} required placeholder="New Delhi" />
                  <Input label="State *" id="state" name="state" type="text" value={profile.state} onChange={handleChange} disabled={saving} required placeholder="Delhi" />
                  <Input label="Country *" id="country" name="country" type="text" value={profile.country} onChange={handleChange} disabled={saving} required placeholder="India" />
                  <Input label="Postal Code *" id="postal_code" name="postal_code" type="text" value={profile.postal_code} onChange={handleChange} disabled={saving} maxLength={12} required placeholder="110001" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-[#f0f2f2] border border-[#d5d9d9] rounded-">
                <div className="flex justify-between items-center"><span className="text- font-bold uppercase text-[#565959]">Account Status</span><strong className={`px-2 py-0.5 rounded-full border text- ${profile.is_active? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]' : 'bg-[#fef2f2] border-[#fecaca] text-[#CC0C39]'}`}>{profile.is_active? "● Active" : "● Inactive"}</strong></div>
                <div className="flex justify-between items-center"><span className="text- font-bold uppercase text-[#565959]">Vendor Status</span><strong className={`px-2 py-0.5 rounded-full border text- ${profile.is_verified? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]' : 'bg-[#fefce8] border-[#fde68a] text-[#854d0e]'}`}>{profile.is_verified? "✓ Verified" : "⏳ Pending"}</strong></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#f0f2f2] border-t border-[#d5d9d9]">
              <span className="text- text-[#565959]">🔒 Your data is secure & encrypted. Amazon standard KYC.</span>
              <button type="submit" disabled={saving} className="h-8 px-5 bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold shadow-sm disabled:opacity-50">
                {saving? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;