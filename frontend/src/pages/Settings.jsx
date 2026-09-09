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
  const [aiAssistant, setAiAssistant] = useState(localStorage.getItem("ai_assistant")!== "false");
  const [productRecommendations, setProductRecommendations] = useState(localStorage.getItem("product_recommendations")!== "false");

  const loadPreferences = useCallback(async () => {
    setLoadingPreferences(true); setError("");
    try {
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Notification preferences load failed.");
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
    setPreferences(c => ({...c, [field]: value }));
    setSavingPreference(field); setError("");
    try {
      const updated = await updateNotificationPreferences({ [field]: value });
      setPreferences(updated);
    } catch (err) {
      setPreferences(c => ({...c, [field]: prev }));
      setError(err.response?.data?.detail || "Preference update failed.");
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
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3">
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="flex flex-col gap-3">{[1,2,3].map(i=><div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (error &&!preferences) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4 grid place-items-center">
        <div className="bg-white border border-[#d5d9d9] rounded- p-8 text-center shadow-sm max-w- w-full">
          <div className="text-">⚙️</div>
          <h2 className="font-bold text- mt-2">Unable to Load Settings</h2>
          <p className="text- text-[#565959] mt-1">{error}</p>
          <button onClick={loadPreferences} className="mt-4 h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded- text- shadow-sm font-bold">Try Again</button>
        </div>
      </div>
    );
  }

  const Toggle = ({ checked, disabled, onChange }) => (
    <label className={`relative inline-block w-12 h-7 cursor-pointer ${disabled? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="opacity-0 w-0 h-0" />
      <span className="absolute inset-0 rounded-full transition duration-200" style={{background: checked? '#067D62' : '#e7e7e7'}}>
        <span className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition duration-200 grid place-items-center text- font-bold" style={{transform: checked? 'translateX(20px)' : 'translateX(0)', color: checked? '#067D62' : '#767676'}}>{checked? '✓' : ''}</span>
      </span>
    </label>
  );

  const Card = ({ id, title, desc, children }) => (
    <div id={`settings-${id}`} className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm scroll-mt-">
      <div className="mb-4">
        <h2 className="font-bold text- text-[#0F1111]">{title}</h2>
        <p className="text- text-[#565959] mt-1">{desc}</p>
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );

  const Row = ({ title, desc, action, isLast }) => (
    <div className={`flex justify-between items-center py-3.5 gap-4 ${isLast? '' : 'border-b border-[#f0f2f2]'}`}>
      <div className="min-w-0 flex-1">
        <strong className="block text- font-bold text-[#0F1111]">{title} {savingPreference===title.toLowerCase().replace(/\s/g,"_") && <span className="text- text-[#e47911] ml-2">Saving...</span>}</strong>
        <span className="block text- text-[#565959] mt-0.5 leading-">{desc}</span>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );

  const SelectPill = ({ value, onChange, options, label }) => (
    <select value={value} onChange={onChange} aria-label={label} className="h-8 px-3 pr-8 border border-[#d5d9d9] rounded- bg-[#f0f2f2] text- font-bold outline-none hover:bg-[#e3e6e6] focus:border-[#e77600]">
      {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
          <div className="text- font-bold uppercase text-[#C45500] tracking-wide">YOUR ACCOUNT › SETTINGS • Prime • Delhi</div>
          <h1 className="text- font-medium mt-1 text-[#0F1111]">Settings • Manage Your ShopZone Experience</h1>
          <p className="text- text-[#565959] mt-1">Manage your account, preferences, notifications, appearance, shopping, and AI. All changes auto-save • Secure • Prime benefits included.</p>
        </div>

        {error && <div className="mt-2 bg-white border-l- border-[#c40000] p-3 text- text-[#c40000] shadow-sm rounded- flex justify-between">⚠ {error} <button onClick={()=>setError("")} className="text-[#0066c0] font-bold">Dismiss</button></div>}

        <div className="mt-2 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-2 items-start">
          <div className="bg-white border border-[#d5d9d9] rounded- p-2 shadow-sm sticky top-">
            {sections.map(s=>(
              <button key={s.id} onClick={()=>scrollToSection(s.id)} className={`w-full flex items-center gap-2 h-10 px-3 rounded- text- font-medium text-left transition ${activeSection===s.id? 'bg-[#f0f2f2] border border-[#d5d9d9] font-bold text-[#0F1111] shadow-sm' : 'hover:bg-[#f7fafa] text-[#0F1111] border border-transparent'}`}>
                <span className="w-7 h-7 rounded- bg-[#f0f2f2] border border-[#e7e7e7] grid place-items-center text-">{s.icon}</span>
                {s.label}
                {activeSection===s.id && <span className="ml-auto text-[#e77600] font-bold">›</span>}
              </button>
            ))}
            <div className="mt-3 p-2.5 bg-[#fef8f2] border border-[#f0e6d8] rounded- text- text-[#565959] leading-"><b>💡 Auto-save:</b> All toggles save instantly • Theme, language, currency stored locally • Notifications synced to backend</div>
            <div className="mt-2 p-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded- text- text-[#067D62]">✓ Secure • Encrypted • Prime protected • Last saved just now</div>
          </div>

          <div className="flex flex-col gap-2">
            <Card id="general" title="General Settings" desc="Manage your basic shopping preferences. Language, currency, region. Auto-saved locally.">
              <Row title="Language" desc="Choose your preferred language. Interface language for ShopZone." action={<SelectPill value={language} onChange={e=>{setLanguage(e.target.value); localStorage.setItem("language", e.target.value);}} label="Language" options={[{value:"English",label:"English • EN"},{value:"Hindi",label:"Hindi • हिंदी"},{value:"Hinglish",label:"Hinglish • Mix"}]} />} />
              <Row title="Currency & Region" desc="Select your preferred currency and region. Prices displayed in INR." action={<SelectPill value={currency} onChange={e=>{setCurrency(e.target.value); localStorage.setItem("currency", e.target.value);}} label="Currency" options={[{value:"INR",label:"₹ INR • India"},{value:"USD",label:"$ USD • US"},{value:"AED",label:"AED • UAE"}]} />} isLast />
            </Card>

            <Card id="account" title="Account • Your ShopZone Account" desc="Manage your personal account information, addresses, and Prime membership.">
              <Row title="Profile & Personal Info" desc="View and manage your name, email, mobile, addresses. Prime member since 2024." action={<Link to="/profile" className="h-8 px-3 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa] font-medium">View Profile → Prime</Link>} isLast />
            </Card>

            <Card id="security" title="Security • Keep Your Account Secure" desc="Password, 2FA, login history, trusted devices. Amazon-level security.">
              <Row title="Password & Login" desc="Change password, enable 2-step verification, manage trusted devices." action={<Link to="/change-password" className="h-8 px-3 grid place-items-center bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- shadow-sm font-bold">Change Password • Secure</Link>} isLast />
            </Card>

            <Card id="notifications" title="Notifications • Stay Updated" desc="Choose which notifications you want to receive. Order updates, offers, delivery alerts. Backend synced.">
              <Row title="Order Updates & Tracking" desc="Get SMS + Email + Push for order placed, shipped, out for delivery, delivered." action={<Toggle checked={preferences?.order_updates?? preferences?.order_updates_enabled?? true} disabled={savingPreference==="order_updates"} onChange={e=>handlePreferenceChange("order_updates", e.target.checked)} />} />
              <Row title="Promotions & Deals • Prime Early Access" desc="Receive special offers, Great Indian Festival deals, Prime early access, lightning deals." action={<Toggle checked={preferences?.promotions?? false} disabled={savingPreference==="promotions"} onChange={e=>handlePreferenceChange("promotions", e.target.checked)} />} />
              <Row title="Email Notifications • Invoice & Offers" desc="Receive important updates, invoices, return updates by email. Daily digest option." action={<Toggle checked={preferences?.email_notifications?? preferences?.email_enabled?? true} disabled={savingPreference==="email_notifications"} onChange={e=>handlePreferenceChange("email_notifications", e.target.checked)} />} />
              <Row title="Push Notifications • Delivery Alerts" desc="Browser push for delivery boy reaching, OTP, offers near you." action={<Toggle checked={preferences?.push_notifications?? preferences?.push_enabled?? true} disabled={savingPreference==="push_notifications"} onChange={e=>handlePreferenceChange("push_notifications", e.target.checked)} />} isLast />
            </Card>

            <Card id="appearance" title="Appearance • Customize Your Store" desc="Theme, density, font size. Choose how ShopZone looks. Saved locally.">
              <Row title="Theme • Light / Dark / System" desc="Choose your preferred appearance. System follows device. Dark mode for night shopping." action={<SelectPill value={theme} onChange={e=>setTheme(e.target.value)} label="Theme" options={[{value:"system",label:"System • Auto"},{value:"light",label:"Light • Day"},{value:"dark",label:"Dark • Night"}]} />} isLast />
            </Card>

            <Card id="shopping" title="Shopping Preferences • Faster Checkout" desc="Default address, payment, delivery preferences. Prime delivery, COD, EMI.">
              <Row title="Order History • Your Orders" desc="View your previous orders, returns, invoices, track packages." action={<Link to="/orders" className="h-8 px-3 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa]">My Orders • {new Date().getFullYear()} →</Link>} />
              <Row title="Wishlist & Saved for Later" desc="View products you saved. Price drop alerts, back in stock notifications." action={<Link to="/wishlist" className="h-8 px-3 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa]">My Wishlist • Save →</Link>} isLast />
            </Card>

            <Card id="ai" title="AI Preferences • ShopZone AI • Rufus Style" desc="Control your AI shopping experience. Personalized help, recommendations, search.">
              <Row title="AI Shopping Assistant • Rufus" desc="Get personalized help while shopping. Ask: 'mobile under 20000' — AI finds best. Powered by ShopZone AI." action={<Toggle checked={aiAssistant} onChange={e=>{const v=e.target.checked; setAiAssistant(v); localStorage.setItem("ai_assistant", String(v));}} />} />
              <Row title="Product Recommendations • AI Curated" desc="Allow AI to suggest relevant products based on browsing, orders, wishlist. More relevant = better deals." action={<Toggle checked={productRecommendations} onChange={e=>{const v=e.target.checked; setProductRecommendations(v); localStorage.setItem("product_recommendations", String(v));}} />} isLast />
            </Card>

            <div className="bg-[#131921] text-white rounded- p-4 flex justify-between items-center shadow-sm flex-wrap gap-2">
              <div><h2 className="font-bold text-">Account Actions • Prime Protected • Secure</h2><p className="text- opacity-70 mt-0.5">Manage important actions, data, privacy, delete account. All encrypted.</p></div>
              <Link to="/profile" className="h-8 px-4 grid place-items-center bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] rounded- text- font-bold shadow-sm">Manage Account → Prime</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;