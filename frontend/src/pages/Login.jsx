import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { getProfile } from "../services/userService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (!data?.access) throw new Error("Login succeeded but no access token was returned.");
      
      localStorage.setItem("access_token", data.access);
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

      let user;
      try {
        user = await getProfile();
      } catch (profileError) {
        console.error("PROFILE LOAD ERROR:", profileError);
        setError(profileError.response?.data?.detail || "Login successful, but profile could not be loaded.");
        return;
      }

      if (!user) {
        setError("Login successful, but user profile was not returned.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-change"));

      const from = location.state?.from?.pathname;
      if (user.role === "VENDOR") {
        navigate(from || "/vendor/dashboard", { replace: true });
      } else {
        navigate(from || "/", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      if (err.response?.data) {
        const d = err.response.data;
        if (d.detail) setError(d.detail);
        else if (d.email) setError(Array.isArray(d.email) ? d.email[0] : d.email);
        else if (d.password) setError(Array.isArray(d.password) ? d.password[0] : d.password);
        else setError("Unable to login. Please check your email and password.");
      } else {
        setError(err.message || "Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" style={{
      minHeight:'calc(100vh - 76px)',
      display:'grid',
      gridTemplateColumns:'1.05fr .95fr',
      padding:0,
      background:'#fefefc'
    }}>
      {/* Left - Branding */}
      <div style={{
        position:'relative',
        background:'radial-gradient(800px 500px at 20% 10%, #f3f0ff 0%, transparent 60%), radial-gradient(600px 400px at 80% 20%, #fffbeb 0%, transparent 50%), #1a1816',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        padding:'48px',
        overflow:'hidden',
        color:'#fff'
      }}>
        <div>
          <Link to="/" style={{display:'inline-flex',alignItems:'center',gap:10,color:'#fff',fontWeight:900,fontSize:20,letterSpacing:'-.04em'}}>
            <span style={{width:36,height:36,borderRadius:11,background:'#fff',color:'#1a1816',display:'grid',placeItems:'center',fontSize:16}}>E</span>
            E-Shop
          </Link>
        </div>

        <div style={{maxWidth:420}}>
          <div style={{
            display:'inline-flex',padding:'6px 12px',background:'rgba(255,255,255,.1)',
            border:'1px solid rgba(255,255,255,.15)',borderRadius:999,
            fontSize:11,fontWeight:800,letterSpacing:'.08em',marginBottom:20
          }}>
            NEW COLLECTION • 2026
          </div>
          <h1 style={{
            margin:'0 0 16px',fontFamily:'Instrument Serif, Georgia, serif',
            fontSize:'clamp(32px,4vw,48px)',lineHeight:.95,letterSpacing:'-.04em',fontWeight:700
          }}>
            Welcome back.<br />
            <span style={{
              background:'linear-gradient(100deg,#a78bfa,#fbbf24)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'
            }}>
              We missed you.
            </span>
          </h1>
          <p style={{margin:0,color:'rgba(255,255,255,.65)',lineHeight:1.6,fontSize:15}}>
            Login to track orders, manage your wishlist, and get early access to drops.
          </p>

          <div style={{display:'flex',gap:12,marginTop:32}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'grid',placeItems:'center',fontSize:12}}>✓</div>
              <span style={{fontSize:13,fontWeight:600,opacity:.9}}>Free shipping ₹999+</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'grid',placeItems:'center',fontSize:12}}>✓</div>
              <span style={{fontSize:13,fontWeight:600,opacity:.9}}>Easy returns</span>
            </div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12,opacity:.6,fontSize:12}}>
          <span>© 2026 E-Shop</span>
          <span>•</span>
          <span>India • English</span>
        </div>

        {/* Glow */}
        <div style={{
          position:'absolute',width:500,height:500,left:'-10%',bottom:'-10%',
          background:'radial-gradient(circle,rgba(124,58,237,.35),transparent 70%)',
          filter:'blur(20px)',pointerEvents:'none'
        }} />
      </div>

      {/* Right - Form */}
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'center',
        padding:'40px 24px',background:'#fefefc'
      }}>
        <div className="auth-card" style={{
          width:'min(420px,100%)',padding:0,background:'transparent',border:0,boxShadow:'none'
        }}>
          <div className="auth-header" style={{textAlign:'left',marginBottom:28}}>
            <h1 style={{margin:'0 0 8px',fontSize:30,fontWeight:900,letterSpacing:'-.03em',color:'#1a1816'}}>Welcome Back</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:14,lineHeight:1.5}}>
              Login to your E-Shop account to continue shopping.
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert" style={{
              display:'flex',gap:10,padding:'12px 14px',marginBottom:20,
              background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,
              color:'#991b1b',fontSize:13,fontWeight:600,lineHeight:1.5
            }}>
              <span style={{flexShrink:0}}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" style={{display:'flex',flexDirection:'column',gap:4}}>
            <div className="form-group" style={{marginBottom:18}}>
              <label htmlFor="login-email" style={{fontSize:12,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816'}}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
                style={{
                  minHeight:48,padding:'0 16px',border:'1px solid #ece8de',borderRadius:999,
                  background:'#fff',outline:'none',transition:'.2s',fontSize:14
                }}
                onFocus={(e)=>e.target.style.borderColor='#1a1816'}
                onBlur={(e)=>e.target.style.borderColor='#ece8de'}
              />
            </div>

            <div className="form-group" style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <label htmlFor="login-password" style={{fontSize:12,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816'}}>
                  Password
                </label>
                <Link to="/forgot-password" style={{fontSize:12,fontWeight:700,color:'#8c8881',textDecoration:'underline'}}>Forgot?</Link>
              </div>
              <div className="password-field" style={{position:'relative'}}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="password-input"
                  style={{
                    width:'100%',minHeight:48,padding:'0 48px 0 16px',
                    border:'1px solid #ece8de',borderRadius:999,
                    background:'#fff',outline:'none',fontSize:14,transition:'.2s'
                  }}
                  onFocus={(e)=>e.target.style.borderColor='#1a1816'}
                  onBlur={(e)=>e.target.style.borderColor='#ece8de'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position:'absolute',right:6,top:6,
                    width:36,height:36,borderRadius:'50%',
                    border:'1px solid #ece8de',background:'#fff',
                    display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
              style={{
                width:'100%',minHeight:50,marginTop:12,
                background:'#1a1816',color:'#fff',border:'1px solid #1a1816',
                borderRadius:999,fontSize:15,fontWeight:800,
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                boxShadow:'0 8px 20px rgba(0,0,0,.18)',transition:'.25s cubic-bezier(.16,1,.3,1)',
                opacity: loading ? .7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width:16,height:16,border:'2px solid rgba(255,255,255,.3)',
                    borderTopColor:'#fff',borderRadius:'50%',
                    display:'inline-block',animation:'spin .8s linear infinite'
                  }} />
                  Logging in...
                </>
              ) : (
                <>
                  Login <span>→</span>
                </>
              )}
            </button>

            <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
              <div style={{flex:1,height:1,background:'#ece8de'}} />
              <span style={{fontSize:11,fontWeight:800,letterSpacing:'.1em',color:'#b8b3a9'}}>OR</span>
              <div style={{flex:1,height:1,background:'#ece8de'}} />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <button type="button" style={{
                minHeight:44,border:'1px solid #ece8de',borderRadius:999,
                background:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:8
              }}>
                <span>G</span> Google
              </button>
              <button type="button" style={{
                minHeight:44,border:'1px solid #ece8de',borderRadius:999,
                background:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:8
              }}>
                <span></span> Apple
              </button>
            </div>
          </form>

          <div className="auth-footer" style={{marginTop:24,textAlign:'center'}}>
            <p style={{margin:0,fontSize:13,color:'#8c8881'}}>
              Don't have an account?{" "}
              <Link to="/register" style={{fontWeight:800,color:'#1a1816',textDecoration:'underline'}}>
                Create Account
              </Link>
            </p>
            <p style={{margin:'12px 0 0',fontSize:11,color:'#b8b3a9',lineHeight:1.5}}>
              By logging in, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @media(max-width:900px){
          main.auth-page { grid-template-columns:1fr !important; }
          main.auth-page > div:first-child { display:none !important; }
        }
      `}</style>
    </main>
  );
}

export default Login;