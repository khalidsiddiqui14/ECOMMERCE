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
    if (profile.gst_number.trim() && !/^[0-9A-Z]{15}$/i.test(profile.gst_number.trim())) return "GST number must contain 15 characters.";
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
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join(", ") : String(data.detail);
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
      setProfile(normalizeProfile({ ...profile, ...data, username: profile.username, email: profile.email, role: profile.role, is_verified: profile.is_verified, is_active: profile.is_active }));
      setSuccess("Vendor profile updated successfully.");
    } catch (err) {
      setError(formatApiError(err));
    } finally { setSaving(false); }
  };

  const avatarName = profile.username || profile.business_name || "Vendor";
  const avatarLetter = avatarName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <div style={{height:120,background:'#fff',border:'1px solid #ece8de',borderRadius:20,marginBottom:16,animation:'pulse 1.5s infinite'}} />
          <div style={{height:500,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
        </div>
      </main>
    );
  }

  const Input = ({ label, id, readOnly, small, ...props }) => (
    <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6}}>
      <label htmlFor={id} style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816'}}>{label}</label>
      <input id={id} {...props} readOnly={readOnly} style={{
        minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,
        background: readOnly ? '#fafaf7' : '#fff',outline:'none',fontSize:13,
        color: readOnly ? '#8c8881' : '#1a1816',fontWeight: readOnly ? 500 : 600
      }} />
      {small && <small style={{fontSize:11,color:'#8c8881'}}>{small}</small>}
    </div>
  );

  return (
    <main className="vendor-profile-page" style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
      <div className="vendor-container" style={{maxWidth:800,margin:'0 auto'}}>
        {/* Header like Flipkart Seller KYC */}
        <div className="vendor-profile-header" style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:20,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
          <div className="vendor-profile-avatar" style={{width:64,height:64,borderRadius:16,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:24,fontWeight:900,flexShrink:0}}>{avatarLetter}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{padding:'3px 8px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800}}>VENDOR PANEL</span>
              {profile.is_verified ? <span style={{padding:'3px 8px',borderRadius:999,background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#166534',fontSize:10,fontWeight:800}}>✓ VERIFIED</span> : <span style={{padding:'3px 8px',borderRadius:999,background:'#fefce8',border:'1px solid #fde68a',color:'#854d0e',fontSize:10,fontWeight:800}}>⏳ PENDING</span>}
              <span style={{padding:'3px 8px',borderRadius:999,background: profile.is_active ? '#f0fdf4' : '#fef2f2',border:`1px solid ${profile.is_active ? '#bbf7d0' : '#fecaca'}`,color: profile.is_active ? '#166534' : '#991b1b',fontSize:10,fontWeight:800}}>{profile.is_active ? "● ACTIVE" : "● INACTIVE"}</span>
            </div>
            <h1 style={{margin:'6px 0 2px',fontSize:20,fontWeight:900}}>Vendor Profile</h1>
            <p style={{margin:0,fontSize:13,color:'#8c8881'}}>{profile.business_name || "Manage your vendor account information."} • {profile.email}</p>
          </div>
          <button onClick={()=>loadProfile(true)} disabled={refreshing||saving} style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',flexShrink:0}}>
            {refreshing ? "↻ Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}
        {success && <div role="status" style={{padding:'12px 16px',marginBottom:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>✓ {success}</div>}

        <section className="vendor-profile-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,boxShadow:'0 4px 20px rgba(0,0,0,.04)',overflow:'hidden'}}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{display:'flex',gap:0,borderBottom:'1px solid #f5f2eb'}}>
              {[{n:'1',t:'Account',active:false},{n:'2',t:'Business',active:false},{n:'3',t:'Address',active:true}].map(s=>(
                <div key={s.n} style={{flex:1,padding:'12px 16px',display:'flex',alignItems:'center',gap:8,background: s.active ? '#1a1816' : '#fafaf7',color: s.active ? '#fff' : '#8c8881',fontSize:11,fontWeight:800,borderRight:'1px solid #f5f2eb'}}>
                  <span style={{width:18,height:18,borderRadius:'50%',background: s.active ? '#fff' : '#ece8de',color: s.active ? '#1a1816' : '#8c8881',display:'grid',placeItems:'center',fontSize:10}}>{s.n}</span>{s.t}
                </div>
              ))}
            </div>

            <div style={{padding:24}}>
            {/* Account Information */}
            <div className="vendor-profile-section" style={{marginBottom:28}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>👤</span> Account Information</h2>
              <div className="vendor-profile-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Input label="Username" id="username" name="username" type="text" value={profile.username} readOnly small="Username cannot be changed here." />
                <Input label="Email" id="email" name="email" type="email" value={profile.email} readOnly small="Email cannot be changed here." />
                <Input label="Phone *" id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} disabled={saving} maxLength={20} required placeholder="+91 98765 43210" />
                <Input label="Role" id="role" name="role" type="text" value={profile.role} readOnly />
              </div>
            </div>

            {/* Business */}
            <div className="vendor-profile-section" style={{marginBottom:28,padding:20,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:16}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>🏢</span> Business Information • KYC</h2>
              <div className="vendor-profile-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Input label="Business Name *" id="business_name" name="business_name" type="text" value={profile.business_name} onChange={handleChange} disabled={saving} maxLength={255} required placeholder="Khalid Traders Pvt Ltd" />
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <label htmlFor="gst_number" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>GST Number</label>
                  <input id="gst_number" name="gst_number" type="text" value={profile.gst_number} onChange={handleChange} disabled={saving} maxLength={15} style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,textTransform:'uppercase',background:'#fff'}} placeholder="22AAAAA0000A1Z5" />
                  <small style={{fontSize:11,color:'#8c8881'}}>Example: 22AAAAA0000A1Z5 • 15 chars • Optional but builds trust</small>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="vendor-profile-section" style={{marginBottom:24}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>📍</span> Address • For pickup & returns</h2>
              <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                <label htmlFor="address" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Full Address *</label>
                <textarea id="address" name="address" rows={3} value={profile.address} onChange={handleChange} disabled={saving} required placeholder="Building, Street, Area, Landmark..." style={{padding:14,border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,resize:'vertical'}} />
              </div>
              <div className="vendor-profile-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <Input label="City *" id="city" name="city" type="text" value={profile.city} onChange={handleChange} disabled={saving} required placeholder="New Delhi" />
                <Input label="State *" id="state" name="state" type="text" value={profile.state} onChange={handleChange} disabled={saving} required placeholder="Delhi" />
                <Input label="Country *" id="country" name="country" type="text" value={profile.country} onChange={handleChange} disabled={saving} required placeholder="India" />
                <Input label="Postal Code *" id="postal_code" name="postal_code" type="text" value={profile.postal_code} onChange={handleChange} disabled={saving} maxLength={12} required placeholder="110001" />
              </div>
            </div>

            {/* Account Status */}
            <div className="vendor-account-status" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,padding:16,background:'#fafaf7',border:'1px solid #ece8de',borderRadius:12,marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Account Status</span>
                <strong style={{padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:800,background: profile.is_active ? '#f0fdf4' : '#fef2f2',border:`1px solid ${profile.is_active ? '#bbf7d0' : '#fecaca'}`,color: profile.is_active ? '#166534' : '#991b1b'}}>{profile.is_active ? "● Active" : "● Inactive"}</strong>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>Vendor Status</span>
                <strong style={{padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:800,background: profile.is_verified ? '#f0fdf4' : '#fefce8',border:`1px solid ${profile.is_verified ? '#bbf7d0' : '#fde68a'}`,color: profile.is_verified ? '#166534' : '#854d0e'}}>{profile.is_verified ? "✓ Verified" : "⏳ Pending"}</strong>
              </div>
            </div>

            </div>

            <div className="vendor-profile-actions" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',background:'#fafaf7',borderTop:'1px solid #f5f2eb'}}>
              <span style={{fontSize:11,color:'#8c8881'}}>🔒 Your data is secure & encrypted. Flipkart standard KYC.</span>
              <button type="submit" disabled={saving} style={{minHeight:44,padding:'0 24px',borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',fontSize:13,fontWeight:800,cursor: saving ? 'not-allowed' : 'pointer',opacity: saving ? .7 : 1,display:'flex',alignItems:'center',gap:8,boxShadow:'0 6px 18px rgba(0,0,0,.18)'}}>
                {saving ? (<><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} /> Saving...</>) : "💾 Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:700px){.vendor-profile-grid{grid-template-columns:1fr !important;} .vendor-account-status{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}

export default VendorProfile;