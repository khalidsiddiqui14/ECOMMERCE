import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotificationPreferences, updateNotificationPreferences } from "../services/notificationService";

function Settings() {
  const [preferences, setPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [savingPreference, setSavingPreference] = useState("");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "INR");
  const [aiAssistant, setAiAssistant] = useState(localStorage.getItem("ai_assistant") !== "false");
  const [productRecommendations, setProductRecommendations] = useState(localStorage.getItem("product_recommendations") !== "false");

  const loadPreferences = useCallback(async () => {
    setLoadingPreferences(true); setError("");
    try {
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Notification preferences load nahi ho paayi.");
    } finally {
      setLoadingPreferences(false);
    }
  }, []);

  useEffect(() => { loadPreferences(); }, [loadPreferences]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handlePreferenceChange = async (field, value) => {
    if (!preferences) return;
    const prev = preferences[field];
    setPreferences(c => ({ ...c, [field]: value }));
    setSavingPreference(field); setError("");
    try {
      const updated = await updateNotificationPreferences({ [field]: value });
      setPreferences(updated);
    } catch (err) {
      setPreferences(c => ({ ...c, [field]: prev }));
      setError(err.response?.data?.detail || "Preference update nahi ho paayi.");
    } finally {
      setSavingPreference("");
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sections = [
    { id: "general", icon: "⚙", label: "General" },
    { id: "account", icon: "👤", label: "Account" },
    { id: "security", icon: "🔐", label: "Security" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "appearance", icon: "🎨", label: "Appearance" },
    { id: "shopping", icon: "🛒", label: "Shopping" },
    { id: "ai", icon: "🤖", label: "AI Preferences" },
  ];

  if (loadingPreferences) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'220px 1fr',gap:24}}>
          <div style={{height:400,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {[1,2,3].map(i=><div key={i} style={{height:160,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />)}
          </div>
        </div>
      </main>
    );
  }

  if (error && !preferences) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <h2 style={{fontWeight:900}}>Unable to Load Settings</h2>
          <p style={{color:'#8c8881'}}>{error}</p>
          <button onClick={loadPreferences} style={{marginTop:16,minHeight:42,padding:'0 20px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700}}>Try Again</button>
        </div>
      </main>
    );
  }

  const Toggle = ({ checked, disabled, onChange }) => (
    <label style={{position:'relative',display:'inline-block',width:48,height:28,cursor: disabled ? 'not-allowed' : 'pointer',opacity: disabled ? .5 : 1}}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} style={{opacity:0,width:0,height:0}} />
      <span style={{
        position:'absolute',inset:0,background: checked ? '#1a1816' : '#ece8de',borderRadius:999,transition:'.3s',
        boxShadow: checked ? '0 0 0 3px rgba(26,24,22,.1)' : 'none'
      }}>
        <span style={{
          position:'absolute',top:3,left: checked ? 24 : 3,width:22,height:22,background:'#fff',borderRadius:'50%',transition:'.3s cubic-bezier(.16,1,.3,1)',
          boxShadow:'0 2px 6px rgba(0,0,0,.15)',display:'grid',placeItems:'center',fontSize:10
        }}>{checked ? '✓' : ''}</span>
      </span>
    </label>
  );

  const Card = ({ id, title, desc, children }) => (
    <div id={`settings-${id}`} style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:24,boxShadow:'0 2px 10px rgba(0,0,0,.04)',scrollMarginTop:20}}>
      <div style={{marginBottom:20}}>
        <h2 style={{margin:'0 0 6px',fontSize:16,fontWeight:900,color:'#1a1816'}}>{title}</h2>
        <p style={{margin:0,color:'#8c8881',fontSize:13}}>{desc}</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:0}}>{children}</div>
    </div>
  );

  const Row = ({ title, desc, action, isLast }) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0',borderBottom: isLast ? 'none' : '1px solid #f5f2eb',gap:16}}>
      <div style={{minWidth:0}}>
        <strong style={{display:'block',fontSize:13,fontWeight:700,color:'#1a1816'}}>{title}</strong>
        <span style={{display:'block',fontSize:12,color:'#8c8881',marginTop:2}}>{desc}</span>
      </div>
      <div style={{flexShrink:0}}>{action}</div>
    </div>
  );

  const SelectPill = ({ value, onChange, options, label }) => (
    <select value={value} onChange={onChange} aria-label={label} style={{minHeight:38,padding:'0 32px 0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:12,fontWeight:700,outline:'none',cursor:'pointer'}}>
      {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <main className="settings-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
      <div className="settings-container" style={{maxWidth:1100,margin:'0 auto'}}>
        <div className="settings-header" style={{marginBottom:24}}>
          <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.08em',marginBottom:12}}>ACCOUNT</span>
          <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816'}}>Settings</h1>
          <p style={{margin:0,color:'#8c8881',fontSize:14}}>Manage your account, preferences, notifications and security.</p>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}

        <div className="settings-layout" style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:24,alignItems:'start'}}>
          {/* Sidebar */}
          <aside className="settings-sidebar" aria-label="Settings navigation" style={{position:'sticky',top:88,background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:12,display:'flex',flexDirection:'column',gap:4}}>
            {sections.map(s=>(
              <button key={s.id} type="button" onClick={()=>scrollToSection(s.id)} style={{
                display:'flex',alignItems:'center',gap:10,minHeight:42,padding:'0 14px',borderRadius:12,border:'1px solid transparent',
                background: activeSection===s.id ? '#1a1816' : 'transparent',color: activeSection===s.id ? '#fff' : '#3d3935',
                fontSize:13,fontWeight: activeSection===s.id ? 800 : 600,textAlign:'left',cursor:'pointer',transition:'.2s',width:'100%'
              }}>
                <span style={{width:28,height:28,borderRadius:8,background: activeSection===s.id ? 'rgba(255,255,255,.12)' : '#fafaf7',border:`1px solid ${activeSection===s.id ? 'rgba(255,255,255,.15)' : '#ece8de'}`,display:'grid',placeItems:'center',fontSize:14}}>{s.icon}</span>
                {s.label}
                {activeSection===s.id && <span style={{marginLeft:'auto',fontSize:12}}>→</span>}
              </button>
            ))}
            <div style={{marginTop:8,padding:12,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:12,fontSize:11,color:'#8c8881',lineHeight:1.4}}>
              💡 All preferences auto-save
            </div>
          </aside>

          <section className="settings-content" style={{display:'flex',flexDirection:'column',gap:16}}>
            <Card id="general" title="General Settings" desc="Manage your basic shopping preferences.">
              <Row title="Language" desc="Choose your preferred language." action={<SelectPill value={language} onChange={e=>{setLanguage(e.target.value); localStorage.setItem("language", e.target.value);}} label="Language" options={[{value:"English",label:"English"},{value:"Hindi",label:"Hindi"}]} />} />
              <Row title="Currency" desc="Select your preferred currency." action={<SelectPill value={currency} onChange={e=>{setCurrency(e.target.value); localStorage.setItem("currency", e.target.value);}} label="Currency" options={[{value:"INR",label:"₹ INR"},{value:"USD",label:"$ USD"}]} />} isLast />
            </Card>

            <Card id="account" title="Account" desc="Manage your personal account information.">
              <Row title="Profile" desc="View and manage your profile information." action={<Link to="/profile" style={{minHeight:38,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700}}>View Profile →</Link>} isLast />
            </Card>

            <Card id="security" title="Security" desc="Keep your account secure.">
              <Row title="Password" desc="Change your account password." action={<Link to="/change-password" style={{minHeight:38,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:12,fontWeight:700}}>Change Password</Link>} isLast />
            </Card>

            <Card id="notifications" title="Notifications" desc="Choose which notifications you want to receive.">
              <Row title="Order Updates" desc="Get updates about your orders." action={<Toggle checked={preferences?.order_updates ?? false} disabled={savingPreference==="order_updates"} onChange={e=>handlePreferenceChange("order_updates", e.target.checked)} />} />
              <Row title="Promotions" desc="Receive special offers and deals." action={<Toggle checked={preferences?.promotions ?? false} disabled={savingPreference==="promotions"} onChange={e=>handlePreferenceChange("promotions", e.target.checked)} />} />
              <Row title="Email Notifications" desc="Receive important updates by email." action={<Toggle checked={preferences?.email_notifications ?? false} disabled={savingPreference==="email_notifications"} onChange={e=>handlePreferenceChange("email_notifications", e.target.checked)} />} />
              <Row title="Push Notifications" desc="Receive notifications from the store." action={<Toggle checked={preferences?.push_notifications ?? false} disabled={savingPreference==="push_notifications"} onChange={e=>handlePreferenceChange("push_notifications", e.target.checked)} />} isLast />
            </Card>

            <Card id="appearance" title="Appearance" desc="Customize how the store looks for you.">
              <Row title="Theme" desc="Choose your preferred appearance." action={<SelectPill value={theme} onChange={e=>setTheme(e.target.value)} label="Theme" options={[{value:"system",label:"🖥 System"},{value:"light",label:"☀ Light"},{value:"dark",label:"🌙 Dark"}]} />} isLast />
            </Card>

            <Card id="shopping" title="Shopping" desc="Manage your shopping preferences.">
              <Row title="Order History" desc="View your previous orders and purchases." action={<Link to="/orders" style={{minHeight:38,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700}}>My Orders →</Link>} />
              <Row title="Wishlist" desc="View products you have saved." action={<Link to="/wishlist" style={{minHeight:38,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700}}>My Wishlist →</Link>} isLast />
            </Card>

            <Card id="ai" title="AI Preferences" desc="Control your AI shopping experience.">
              <Row title="AI Shopping Assistant" desc="Get personalized help while shopping." action={<Toggle checked={aiAssistant} onChange={e=>{const v=e.target.checked; setAiAssistant(v); localStorage.setItem("ai_assistant", String(v));}} />} />
              <Row title="Product Recommendations" desc="Allow AI to suggest relevant products." action={<Toggle checked={productRecommendations} onChange={e=>{const v=e.target.checked; setProductRecommendations(v); localStorage.setItem("product_recommendations", String(v));}} />} isLast />
            </Card>

            <div style={{background:'#1a1816',color:'#fff',borderRadius:20,padding:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,position:'relative',overflow:'hidden'}}>
              <div>
                <h2 style={{margin:'0 0 4px',fontSize:14,fontWeight:800}}>Account Actions</h2>
                <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,.6)'}}>Manage important account actions.</p>
              </div>
              <Link to="/profile" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#fff',color:'#1a1816',fontSize:12,fontWeight:800}}>Manage Account →</Link>
              <div style={{position:'absolute',width:200,height:200,right:-40,top:-40,background:'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)',borderRadius:'50%'}} />
            </div>
          </section>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @media(max-width:900px){.settings-layout{grid-template-columns:1fr !important;} .settings-sidebar{position:static !important;}}`}</style>
    </main>
  );
}

export default Settings;