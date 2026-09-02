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
  const colors = ["#ef4444","#f59e0b","#eab308","#22c55e","#10b981"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const u = username.trim();
    const em = email.trim();
    const ph = phone.trim();
    if (!u) { setError("Please enter a username."); return; }
    if (!em) { setError("Please enter your email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters long."); return; }
    if (strength.score < 3) { setError("Please choose a stronger password. Use uppercase, lowercase, numbers, or special characters."); return; }
    if (!confirmPassword) { setError("Please confirm your password."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await registerUser(u, em, password, ph);
      setSuccess("Account created successfully. Redirecting to login...");
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
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1.1fr .9fr',background:'#fafaf7'}}>
      {/* Left - Branding */}
      <div style={{background:'#1a1816',color:'#fff',padding:'48px 40px',display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:48}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#fff',color:'#1a1816',display:'grid',placeItems:'center',fontWeight:900}}>E</div>
            <span style={{fontWeight:800,letterSpacing:'-.02em'}}>E-SHOP</span>
            <span style={{marginLeft:8,padding:'4px 8px',borderRadius:999,background:'rgba(255,255,255,.1)',fontSize:10,fontWeight:700}}>JOIN 50K+ USERS</span>
          </div>
          <h1 style={{margin:'0 0 16px',fontSize:'clamp(32px,4vw,44px)',fontWeight:900,lineHeight:.95,letterSpacing:'-.04em'}}>Create your<br/>account today.</h1>
          <p style={{margin:0,color:'rgba(255,255,255,.6)',fontSize:14,lineHeight:1.6,maxWidth:320}}>Join thousands of shoppers. Fast checkout, free delivery, secure payments.</p>

          <div style={{marginTop:32,display:'flex',flexDirection:'column',gap:14}}>
            {[
              {icon:'⚡',t:'Fast Checkout',d:'One-click buy in seconds'},
              {icon:'🚚',t:'Free Delivery',d:'On orders above ₹999'},
              {icon:'🔒',t:'Secure & Private',d:'256-bit encrypted'},
            ].map(f=>(
              <div key={f.t} style={{display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',display:'grid',placeItems:'center',fontSize:18}}>{f.icon}</div>
                <div><div style={{fontSize:13,fontWeight:700}}>{f.t}</div><div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{f.d}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12,marginTop:24}}>
          <div style={{display:'flex',marginLeft:8}}>
            {[1,2,3].map(i=><div key={i} style={{width:32,height:32,borderRadius:'50%',background:'#fff',border:'2px solid #1a1816',marginLeft:-8,display:'grid',placeItems:'center',fontSize:12,fontWeight:800}}>{String.fromCharCode(64+i)}</div>)}
          </div>
          <span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}><strong style={{color:'#fff'}}>4.9/5</strong> from 2,400+ reviews</span>
        </div>

        <div style={{position:'absolute',width:400,height:400,right:-80,bottom:-80,background:'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)',borderRadius:'50%'}} />
      </div>

      {/* Right - Form */}
      <div style={{padding:'32px 24px',display:'grid',placeItems:'center',overflowY:'auto'}}>
        <div className="auth-card" style={{width:'100%',maxWidth:440,background:'#fff',border:'1px solid #ece8de',borderRadius:24,padding:32,boxShadow:'0 12px 40px rgba(0,0,0,.06)'}}>
          <div className="auth-header" style={{marginBottom:24}}>
            <h1 style={{margin:'0 0 6px',fontSize:24,fontWeight:900,letterSpacing:'-.02em',color:'#1a1816'}}>Create Account</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:13}}>Join E-Shop today — it takes 30 seconds</p>
          </div>

          {error && <div role="alert" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}
          {success && <div role="status" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>✓ {success}</div>}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group">
                <label htmlFor="username" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6,display:'block'}}>Username *</label>
                <input id="username" type="text" placeholder="rahul_dev" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" required disabled={loading}
                  style={{width:'100%',minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:13,background:'#fff'}} />
              </div>
              <div className="form-group">
                <label htmlFor="phone" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6,display:'block'}}>Phone</label>
                <input id="phone" type="tel" placeholder="+91 98765" value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" disabled={loading}
                  style={{width:'100%',minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:13,background:'#fff'}} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6,display:'block'}}>Email *</label>
              <input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required disabled={loading}
                style={{width:'100%',minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:13,background:'#fff'}} />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6,display:'block'}}>Password *</label>
              <div style={{position:'relative'}}>
                <input id="register-password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" required disabled={loading} minLength={8}
                  style={{width:'100%',minHeight:44,padding:'0 44px 0 14px',border:'1px solid #ece8de',borderRadius:999,outline:'none',fontSize:13,background:'#fff'}} aria-describedby="password-strength" />
                <button type="button" onClick={()=>setShowPassword(p=>!p)} disabled={loading} style={{position:'absolute',right:5,top:5,width:34,height:34,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'}}>{showPassword ? "🙈" : "👁"}</button>
              </div>

              {password && (
                <div id="password-strength" style={{marginTop:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:11,fontWeight:700,color:'#8c8881'}}>Strength: <strong style={{color: colors[strength.score-1] || '#8c8881'}}>{strength.label}</strong></span>
                    <span style={{fontSize:11,fontWeight:800}}>{strength.score}/5</span>
                  </div>
                  <div style={{display:'flex',gap:4,marginBottom:8}}>
                    {[1,2,3,4,5].map(lvl=>(
                      <div key={lvl} style={{flex:1,height:6,borderRadius:999,background: lvl<=strength.score ? colors[strength.score-1] : '#f1eee8',transition:'.3s'}} />
                    ))}
                  </div>
                  <span style={{fontSize:10,color:'#8c8881',lineHeight:1.4}}>Use 8+ characters with uppercase, lowercase, numbers, and symbols.</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:6,display:'block'}}>Confirm Password *</label>
              <div style={{position:'relative'}}>
                <input id="confirm-password" type={showConfirm ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={loading} minLength={8}
                  style={{width:'100%',minHeight:44,padding:'0 44px 0 14px',border:`1px solid ${confirmPassword ? (match ? '#bbf7d0' : '#fecaca') : '#ece8de'}`,borderRadius:999,outline:'none',fontSize:13,background: confirmPassword ? (match ? '#f0fdf4' : '#fef2f2') : '#fff'}} aria-describedby="password-match" />
                <button type="button" onClick={()=>setShowConfirm(p=>!p)} disabled={loading} style={{position:'absolute',right:5,top:5,width:34,height:34,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'}}>{showConfirm ? "🙈" : "👁"}</button>
              </div>
              {confirmPassword && (
                <span id="password-match" style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:6,fontSize:11,fontWeight:700,color: match ? '#166534' : '#991b1b',padding:'4px 8px',borderRadius:999,background: match ? '#f0fdf4' : '#fef2f2',border:`1px solid ${match ? '#bbf7d0' : '#fecaca'}`}}>
                  {match ? '✓ Match' : '✕ No match'}
                </span>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              minHeight:48,borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',
              fontWeight:800,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              boxShadow:'0 8px 20px rgba(0,0,0,.18)',opacity: loading ? .7 : 1,cursor: loading ? 'not-allowed' : 'pointer',marginTop:6
            }}>
              {loading ? (
                <>
                  <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} />
                  Creating Account...
                </>
              ) : 'Create Account →'}
            </button>

            <div style={{textAlign:'center',fontSize:11,color:'#b8b3a9',lineHeight:1.4,marginTop:4}}>
              By creating an account, you agree to our <strong style={{color:'#1a1816'}}>Terms</strong> & <strong style={{color:'#1a1816'}}>Privacy</strong>
            </div>
          </form>

          <div className="auth-footer" style={{marginTop:20,paddingTop:16,borderTop:'1px solid #f5f2eb',textAlign:'center'}}>
            <p style={{margin:0,fontSize:13,color:'#8c8881'}}>Already have an account? <Link to="/login" style={{fontWeight:800,color:'#1a1816',textDecoration:'underline'}}>Login →</Link></p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:900px){main{grid-template-columns:1fr !important;} main > div:first-child{display:none !important;}}`}</style>
    </main>
  );
}

export default Register;