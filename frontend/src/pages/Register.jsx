import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = getPasswordStrength(password);
  const match = confirmPassword.length > 0 && password === confirmPassword;
  const colors = ["#CC0C39","#e47911","#f08804","#067D62","#067D62"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const u = username.trim();
    const em = email.trim();
    const ph = phone.trim();
    if (!u) { setError("Please enter your name."); return; }
    if (!em) { setError("Please enter your email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (strength.score < 3) { setError("Choose stronger password: uppercase, lowercase, number, symbol."); return; }
    if (!confirmPassword) { setError("Please confirm your password."); return; }
    if (password!== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await registerUser(u, em, password, ph);
      setSuccess("Account created! Redirecting to login...");
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
      <div className="w-full max-w-">
        <Link to="/" className="flex justify-center mb-4">
          <div className="text- font-bold tracking-tight"><span className="text-[#131921]">shop</span><span className="text-[#f08804]">zone</span><span className="text- align-super">.in</span></div>
        </Link>

        <div className="bg-white border border-[#d5d9d9] rounded- p-6 shadow-sm">
          <h1 className="text- font-medium text-[#0F1111] leading-none">Create account</h1>

          {error && <div className="mt-3 p-2.5 border border-[#c40000] bg-[#fff6f6] rounded- text- text-[#c40000] flex gap-2"><span>⚠</span><span>{error}</span></div>}
          {success && <div className="mt-3 p-2.5 border border-[#067D62] bg-[#f0fdf4] rounded- text- text-[#067D62]">✓ {success}</div>}

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <div>
              <label className="text- font-bold text-[#0F1111]">Your name</label>
              <input type="text" placeholder="First and last name" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="name" required disabled={loading}
                className="w-full h-8 mt-1 px-3 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)] shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text- font-bold text-[#0F1111]">Mobile number</label>
                <input type="tel" placeholder="Mobile" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} autoComplete="tel" disabled={loading}
                  className="w-full h-8 mt-1 px-3 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
              </div>
              <div>
                <label className="text- font-bold text-[#0F1111]">Email</label>
                <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required disabled={loading}
                  className="w-full h-8 mt-1 px-3 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600]" />
              </div>
            </div>

            <div>
              <label className="text- font-bold text-[#0F1111]">Password</label>
              <div className="relative mt-1">
                <input type={showPassword? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" required disabled={loading} minLength={8}
                  className="w-full h-8 px-3 pr-9 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]" />
                <button type="button" onClick={()=>setShowPassword(p=>!p)} disabled={loading} className="absolute right-1 top-0.5 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded- grid place-items-center text- hover:bg-[#e3e6e6]">{showPassword? "🙈" : "👁"}</button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between text-"><span>Strength: <strong style={{color: colors[strength.score-1] || "#565959"}}>{strength.label || "Too short"}</strong></span><span className="text-[#565959]">{strength.score}/5</span></div>
                  <div className="flex gap-1 mt-1">{[1,2,3,4,5].map(lvl=><div key={lvl} className="flex-1 h-1.5 rounded-full transition" style={{background: lvl<=strength.score? colors[strength.score-1] : '#e7e7e7'}} />)}</div>
                  <div className="text- text-[#767676] mt-1">Use 8+ chars: uppercase, lowercase, number, symbol (!@#$%).</div>
                </div>
              )}
            </div>

            <div>
              <label className="text- font-bold text-[#0F1111]">Re-enter password</label>
              <div className="relative mt-1">
                <input type={showConfirm? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={loading} minLength={8}
                  className={`w-full h-8 px-3 pr-9 border rounded- text- outline-none shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] ${confirmPassword? (match? 'border-[#067D62] bg-[#f0fdf4] focus:border-[#067D62]' : 'border-[#c40000] bg-[#fff6f6] focus:border-[#c40000]') : 'border-[#a6a6a6] focus:border-[#e77600]'}`} />
                <button type="button" onClick={()=>setShowConfirm(p=>!p)} disabled={loading} className="absolute right-1 top-0.5 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded- grid place-items-center text- hover:bg-[#e3e6e6]">{showConfirm? "🙈" : "👁"}</button>
              </div>
              {confirmPassword && <div className={`mt-1 text- font-medium ${match? 'text-[#067D62]' : 'text-[#c40000]'}`}>{match? '✓ Passwords match • Strong account' : '✕ Passwords do not match'}</div>}
            </div>

            <button type="submit" disabled={loading} className="mt-2 h-8 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-medium shadow-sm disabled:opacity-50">
              {loading? "Creating account..." : "Create your ShopZone account"}
            </button>

            <p className="text- leading- text-[#0F1111]">By creating an account, you agree to ShopZone's <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a> and <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice.</a> Prime FREE delivery, EMI, COD.</p>
          </form>

          <div className="mt-4 pt-4 border-t border-[#e7e7e7] text- text-[#0F1111]">
            Already have an account? <Link to="/login" className="text-[#0066c0] hover:text-[#c45500] hover:underline font-medium">Sign in →</Link>
          </div>

          <div className="mt-3 text- text-[#565959] bg-[#f7fafa] border border-[#f0f2f2] rounded- p-2">
            <b>Prime benefit:</b> FREE One-Day Delivery • 10 days return • Pay on Delivery • ShopZone Business
          </div>
        </div>

        <div className="mt-6 text-center text- text-[#767676] space-x-3">
          <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a>
          <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice</a>
          <a href="#" className="text-[#0066c0] hover:underline">Help</a>
          <div className="mt-2">© 1996-2026, ShopZone.com, Inc. or its affiliates • Delhi, India • Prime</div>
        </div>
      </div>
    </div>
  );
}

export default Register;