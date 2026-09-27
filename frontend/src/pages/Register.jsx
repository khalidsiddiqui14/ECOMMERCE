import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

// ── Password strength ──────────────────────────────────────────

function getPasswordStrength(pwd) {
  if (!pwd) return { label: "", score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = { 1: "Very Weak", 2: "Weak", 3: "Fair", 4: "Strong", 5: "Very Strong" };
  return { label: labels[score] || "", score };
}

function Register() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("CUSTOMER");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessCountry, setBusinessCountry] = useState("India");
  const [businessPostalCode, setBusinessPostalCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = getPasswordStrength(password);
  const match = confirmPassword.length > 0 && password === confirmPassword;
  const colors = ["#CC0C39", "#e47911", "#f08804", "#067D62", "#067D62"];

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfileImage(null);
      setProfilePreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, JPEG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile image size must be less than 2MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleAccountType = (type) => {
    setAccountType(type);
    setError("");
    setSuccess("");
  };

  // ── Submit registration ─────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const u = username.trim();
    const em = email.trim().toLowerCase();
    const ph = phone.replace(/\D/g, "");
    const vendorPh = vendorPhone.replace(/\D/g, "");
    const bn = businessName.trim();
    const ba = businessAddress.trim();
    const bc = businessCity.trim();
    const bs = businessState.trim();
    const bco = businessCountry.trim();
    const bp = businessPostalCode.trim();

    if (!u) { setError("Please enter your name."); return; }
    if (u.length < 3) { setError("Name must be at least 3 characters."); return; }
    if (!em) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError("Please enter a valid email address."); return; }
    if (!ph) { setError("Please enter your mobile number."); return; }
    if (!/^\d{10}$/.test(ph)) { setError("Please enter a valid 10-digit mobile number."); return; }
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (strength.score < 3) { setError("Choose stronger password: uppercase, lowercase, number, symbol."); return; }
    if (!confirmPassword) { setError("Please confirm your password."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    if (accountType === "VENDOR") {
      if (!bn) { setError("Please enter your business name."); return; }
      if (!vendorPh) { setError("Please enter your business phone."); return; }
      if (!/^\d{10,15}$/.test(vendorPh)) { setError("Please enter a valid business phone number."); return; }
      if (!ba) { setError("Please enter your business address."); return; }
      if (!bc) { setError("Please enter your business city."); return; }
      if (!bs) { setError("Please enter your business state."); return; }
      if (!bco) { setError("Please enter your business country."); return; }
      if (!bp) { setError("Please enter your business postal code."); return; }
    }

    setLoading(true);

    try {
      await registerUser(u, em, password, ph, profileImage, {
        role: accountType,
        business_name: bn,
        vendor_phone: vendorPh,
        gst_number: gstNumber.trim(),
        business_address: ba,
        business_city: bc,
        business_state: bs,
        business_country: bco,
        business_postal_code: bp,
      });

      setSuccess(accountType === "VENDOR" ? "Vendor account created! Redirecting to login..." : "Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);

      if (err.response?.data) {
        const data = err.response.data;
        const messages = Object.entries(data).map(([field, value]) => {
          if (Array.isArray(value)) return `${field}: ${value.join(", ")}`;
          if (value && typeof value === "object") return `${field}: ${Object.values(value).join(", ")}`;
          return `${field}: ${value}`;
        }).join(" | ");
        setError(messages || "Registration failed.");
      } else {
        setError(err.message || "Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EAEDED] min-h-[calc(100vh-104px)] grid place-items-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-4">
          <div className="text-3xl font-bold tracking-tight"><span className="text-[#131921]">shop</span><span className="text-[#f08804]">zone</span><span className="text-sm align-super">.in</span></div>
        </Link>

        <div className="bg-white border border-[#d5d9d9] rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-medium text-[#0F1111] leading-none">Create account</h1>

          {error && <div className="mt-3 p-2.5 border border-[#c40000] bg-[#fff6f6] rounded-md text-sm text-[#c40000] flex gap-2"><span>⚠</span><span>{error}</span></div>}

          {success && <div className="mt-3 p-2.5 border border-[#067D62] bg-[#f0fdf4] rounded-md text-sm text-[#067D62]">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">

            <div>
              <label className="text-sm font-bold text-[#0F1111]">Account type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button type="button" onClick={() => handleAccountType("CUSTOMER")} disabled={loading} className={`h-10 border rounded-md text-sm font-medium ${accountType === "CUSTOMER" ? "border-[#e77600] bg-[#fff8e7] shadow-[0_0_3px_1px_rgba(228,121,17,.35)]" : "border-[#a6a6a6] bg-white hover:bg-[#f7f7f7]"}`}>
                  Shop on ShopZone
                </button>
                <button type="button" onClick={() => handleAccountType("VENDOR")} disabled={loading} className={`h-10 border rounded-md text-sm font-medium ${accountType === "VENDOR" ? "border-[#e77600] bg-[#fff8e7] shadow-[0_0_3px_1px_rgba(228,121,17,.35)]" : "border-[#a6a6a6] bg-white hover:bg-[#f7f7f7]"}`}>
                  Sell on ShopZone
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[#0F1111]">Your name</label>
              <input type="text" placeholder="First and last name" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="name" maxLength={150} required disabled={loading}
                className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)] shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-bold text-[#0F1111]">Mobile number</label>
                <input type="tel" inputMode="numeric" placeholder="Mobile" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} autoComplete="tel" maxLength={10} required disabled={loading}
                  className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                <p className="mt-1 text-xs text-[#565959]">10-digit mobile number</p>
              </div>

              <div>
                <label className="text-sm font-bold text-[#0F1111]">Email</label>
                <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" maxLength={254} required disabled={loading}
                  className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
              </div>
            </div>

            {accountType === "VENDOR" && (
              <div className="border border-[#d5d9d9] rounded-md p-3 bg-[#f7fafa] flex flex-col gap-3">
                <div>
                  <p className="text-sm font-bold text-[#0F1111]">Seller information</p>
                  <p className="text-xs text-[#565959] mt-1">Enter your business details to create your vendor account.</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#0F1111]">Business name</label>
                  <input type="text" placeholder="Your business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} maxLength={255} required={accountType === "VENDOR"} disabled={loading}
                    className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-bold text-[#0F1111]">Business phone</label>
                    <input type="tel" inputMode="numeric" placeholder="Business phone" value={vendorPhone} onChange={e=>setVendorPhone(e.target.value.replace(/\D/g,"").slice(0,15))} maxLength={15} required={accountType === "VENDOR"} disabled={loading}
                      className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#0F1111]">GST number <span className="font-normal text-[#565959]">(optional)</span></label>
                    <input type="text" placeholder="GSTIN" value={gstNumber} onChange={e=>setGstNumber(e.target.value.toUpperCase())} maxLength={30} disabled={loading}
                      className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#0F1111]">Business address</label>
                  <textarea placeholder="Full business address" value={businessAddress} onChange={e=>setBusinessAddress(e.target.value)} required={accountType === "VENDOR"} disabled={loading} rows={2}
                    className="w-full mt-1 px-3 py-2 border border-[#a6a6a6] rounded-md text-sm outline-none resize-none focus:border-[#e77600]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-bold text-[#0F1111]">City</label>
                    <input type="text" placeholder="City" value={businessCity} onChange={e=>setBusinessCity(e.target.value)} maxLength={100} required={accountType === "VENDOR"} disabled={loading}
                      className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#0F1111]">State</label>
                    <input type="text" placeholder="State" value={businessState} onChange={e=>setBusinessState(e.target.value)} maxLength={100} required={accountType === "VENDOR"} disabled={loading}
                      className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-bold text-[#0F1111]">Country</label>
                    <input type="text" placeholder="Country" value={businessCountry} onChange={e=>setBusinessCountry(e.target.value)} maxLength={100} required={accountType === "VENDOR"} disabled={loading}
                      className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#0F1111]">Postal code</label>
                    <input type="text" inputMode="numeric" placeholder="Postal code" value={businessPostalCode} onChange={e=>setBusinessPostalCode(e.target.value)} maxLength={20} required={accountType === "VENDOR"} disabled={loading}
                      className="w-full h-9 mt-1 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600]" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-[#0F1111]">Profile image</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileImage} disabled={loading}
                className="w-full h-9 mt-1 px-3 py-1.5 border border-[#a6a6a6] rounded-md text-sm outline-none bg-white" />

              {profilePreview && <div className="mt-2 flex items-center gap-3">
                <img src={profilePreview} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border border-[#d5d9d9]" />
                <div className="text-xs text-[#565959]">
                  <p className="font-medium text-[#0F1111]">Profile image selected</p>
                  <p>Maximum size: 2MB</p>
                </div>
              </div>}

              <p className="mt-1 text-xs text-[#565959]">JPG, PNG, or WEBP • Maximum 2MB</p>
            </div>

            <div>
              <label className="text-sm font-bold text-[#0F1111]">Password</label>
              <div className="relative mt-1">
                <input type={showPassword? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" required disabled={loading} minLength={8}
                  className="w-full h-9 px-3 pr-9 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]" />
                <button type="button" onClick={()=>setShowPassword(p=>!p)} disabled={loading} className="absolute right-1 top-1 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded-md grid place-items-center text-sm hover:bg-[#e3e6e6]">
                  {showPassword? "🙈" : "👁"}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span>Strength: <strong style={{color: colors[strength.score-1] || "#565959"}}>{strength.label || "Too short"}</strong></span>
                    <span className="text-[#565959]">{strength.score}/5</span>
                  </div>

                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(lvl=><div key={lvl} className="flex-1 h-1.5 rounded-full transition" style={{background: lvl<=strength.score? colors[strength.score-1] : "#e7e7e7"}} />)}
                  </div>

                  <div className="text-xs text-[#767676] mt-1">Use 8+ chars: uppercase, lowercase, number, symbol (!@#$%).</div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-[#0F1111]">Re-enter password</label>
              <div className="relative mt-1">
                <input type={showConfirm? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={loading} minLength={8}
                  className={`w-full h-9 px-3 pr-9 border rounded-md text-sm outline-none shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] ${confirmPassword? (match? "border-[#067D62] bg-[#f0fdf4] focus:border-[#067D62]" : "border-[#c40000] bg-[#fff6f6] focus:border-[#c40000]") : "border-[#a6a6a6] focus:border-[#e77600]"}`} />
                <button type="button" onClick={()=>setShowConfirm(p=>!p)} disabled={loading} className="absolute right-1 top-1 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded-md grid place-items-center text-sm hover:bg-[#e3e6e6]">
                  {showConfirm? "🙈" : "👁"}
                </button>
              </div>

              {confirmPassword && <div className={`mt-1 text-xs font-medium ${match? "text-[#067D62]" : "text-[#c40000]"}`}>{match? "✓ Passwords match" : "✕ Passwords do not match"}</div>}
            </div>

            <button type="submit" disabled={loading} className="mt-2 h-9 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-md text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading? "Creating account..." : accountType === "VENDOR" ? "Create Vendor Account" : "Create your ShopZone account"}
            </button>

            <p className="text-xs leading-5 text-[#0F1111]">
              By creating an account, you agree to ShopZone&apos;s{" "}
              <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a>{" "}
              and{" "}
              <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice.</a>
            </p>
          </form>

          <div className="mt-4 pt-4 border-t border-[#e7e7e7] text-sm text-[#0F1111]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0066c0] hover:text-[#c45500] hover:underline font-medium">Sign in →</Link>
          </div>

          <div className="mt-3 text-xs text-[#565959] bg-[#f7fafa] border border-[#f0f2f2] rounded-md p-2">
            <b>Prime benefit:</b> FREE One-Day Delivery • 10 days return • Pay on Delivery • ShopZone Business
          </div>

          <div className="mt-3 text-center text-xs text-[#565959]">
            Need help?{" "}
            <Link to="/customer-service" className="text-[#0066c0] hover:underline">Customer Service</Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#767676] space-x-3">
          <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a>
          <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice</a>
          <Link to="/customer-service" className="text-[#0066c0] hover:underline">Help</Link>
          <div className="mt-2">© 1996-2026, ShopZone.com, Inc. or its affiliates • Delhi, India • Prime</div>
        </div>
      </div>
    </div>
  );
}

export default Register;