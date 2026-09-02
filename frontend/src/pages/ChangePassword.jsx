import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

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

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = getPasswordStrength(newPassword);
  const match = confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields."); return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long."); return;
    }
    if (strength.score < 3) {
      setError("Please choose a stronger password. Use uppercase, lowercase, numbers, or special characters."); return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match."); return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from your current password."); return;
    }

    setLoading(true);
    try {
      await api.post("auth/change-password/", { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setSuccess("Password changed successfully.");
      setTimeout(() => navigate("/settings"), 1200);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.detail || d?.message || d?.current_password?.[0] || d?.new_password?.[0] || d?.old_password?.[0] || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  };

  const colors = ["#ef4444","#f59e0b","#eab308","#22c55e","#10b981"];

  return (
    <main className="settings-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px'}}>
      <div className="settings-container" style={{maxWidth:720,margin:'0 auto'}}>
        {/* Header */}
        <div className="settings-header" style={{marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 12px',background:'#fff',border:'1px solid #ece8de',borderRadius:999,fontSize:11,fontWeight:800,letterSpacing:'.08em',marginBottom:16}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',display:'inline-block'}} /> SECURITY
          </div>
          <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816'}}>Change Password</h1>
          <p style={{margin:0,color:'#8c8881',fontSize:14,lineHeight:1.6}}>Update your password to keep your account secure. Use a strong unique password.</p>
        </div>

        <div className="settings-content">
          <div className="settings-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:24,padding:28,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
            
            {error && (
              <div role="alert" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:20,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>
                <span>⚠️</span> {error}
              </div>
            )}
            {success && (
              <div role="status" style={{display:'flex',gap:10,padding:'12px 14px',marginBottom:20,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>
                <span>✓</span> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form" style={{display:'flex',flexDirection:'column',gap:24}}>
              
              {/* Current */}
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816',marginBottom:8}}>Current Password</label>
                <div style={{position:'relative'}}>
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={e=>setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    placeholder="Enter current password"
                    style={{width:'100%',minHeight:48,padding:'0 48px 0 16px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',outline:'none',fontSize:14,transition:'.2s'}}
                    onFocus={e=>e.target.style.borderColor='#1a1816'}
                    onBlur={e=>e.target.style.borderColor='#ece8de'}
                  />
                  <button type="button" onClick={()=>setShowCurrent(p=>!p)} disabled={loading}
                    style={{position:'absolute',right:6,top:6,width:36,height:36,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'}}>
                    {showCurrent ? "🙈" : "👁"}
                  </button>
                </div>
                <span style={{fontSize:11,color:'#8c8881',marginTop:6,display:'block'}}>Enter your existing password.</span>
              </div>

              {/* New */}
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816',marginBottom:8}}>New Password</label>
                <div style={{position:'relative'}}>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={e=>setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    style={{width:'100%',minHeight:48,padding:'0 48px 0 16px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',outline:'none',fontSize:14,transition:'.2s'}}
                    onFocus={e=>e.target.style.borderColor='#1a1816'}
                    onBlur={e=>e.target.style.borderColor='#ece8de'}
                  />
                  <button type="button" onClick={()=>setShowNew(p=>!p)} disabled={loading}
                    style={{position:'absolute',right:6,top:6,width:36,height:36,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'}}>
                    {showNew ? "🙈" : "👁"}
                  </button>
                </div>

                {newPassword && (
                  <div style={{marginTop:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{fontSize:11,fontWeight:700,color:'#8c8881'}}>Password strength: <strong style={{color: colors[strength.score-1] || '#8c8881'}}>{strength.label}</strong></span>
                      <span style={{fontSize:11,fontWeight:800,color:'#8c8881'}}>{strength.score}/5</span>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      {[1,2,3,4,5].map(lvl=>(
                        <div key={lvl} style={{
                          flex:1,height:6,borderRadius:999,background: lvl <= strength.score ? colors[strength.score-1] : '#f1eee8',
                          transition:'.3s',opacity: lvl <= strength.score ? 1 : .5
                        }} />
                      ))}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10}}>
                      {[
                        {ok: newPassword.length>=8, text:'8+ characters'},
                        {ok: /[A-Z]/.test(newPassword), text:'Uppercase'},
                        {ok: /[a-z]/.test(newPassword), text:'Lowercase'},
                        {ok: /[0-9]/.test(newPassword), text:'Number'},
                      ].map(item=>(
                        <div key={item.text} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,fontWeight:600,color: item.ok ? '#166534' : '#b8b3a9'}}>
                          <span style={{width:16,height:16,borderRadius:'50%',background: item.ok ? '#dcfce7' : '#f5f2eb',border:`1px solid ${item.ok ? '#bbf7d0' : '#ece8de'}`,display:'grid',placeItems:'center',fontSize:9}}>{item.ok ? '✓' : '○'}</span>
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816',marginBottom:8}}>Confirm New Password</label>
                <div style={{position:'relative'}}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e=>setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
                    placeholder="Re-enter new password"
                    style={{
                      width:'100%',minHeight:48,padding:'0 48px 0 16px',
                      border:`1px solid ${confirmPassword ? (match ? '#bbf7d0' : '#fecaca') : '#ece8de'}`,
                      borderRadius:999,background: confirmPassword ? (match ? '#f0fdf4' : '#fef2f2') : '#fff',
                      outline:'none',fontSize:14,transition:'.2s'
                    }}
                  />
                  <button type="button" onClick={()=>setShowConfirm(p=>!p)} disabled={loading}
                    style={{position:'absolute',right:6,top:6,width:36,height:36,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'}}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {confirmPassword && (
                  <div style={{marginTop:8,display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,color: match ? '#166534' : '#991b1b'}}>
                    <span style={{width:18,height:18,borderRadius:'50%',background: match ? '#dcfce7' : '#fee2e2',display:'grid',placeItems:'center',fontSize:10}}>{match ? '✓' : '✕'}</span>
                    {match ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{display:'flex',gap:12,marginTop:8,paddingTop:20,borderTop:'1px solid #f5f2eb'}}>
                <Link to="/settings" style={{flex:1,minHeight:48,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:14,fontWeight:700,color:'#1a1816'}}>
                  Cancel
                </Link>
                <button type="submit" disabled={loading} style={{
                  flex:1.3,minHeight:48,borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',
                  fontSize:14,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                  boxShadow:'0 8px 20px rgba(0,0,0,.18)',opacity: loading ? .7 : 1,cursor: loading ? 'not-allowed' : 'pointer',transition:'.25s'
                }}>
                  {loading ? (
                    <>
                      <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} />
                      Changing...
                    </>
                  ) : 'Change Password →'}
                </button>
              </div>
            </form>
          </div>

          <div style={{marginTop:16,padding:14,background:'#fff',border:'1px dashed #ece8de',borderRadius:12,display:'flex',gap:10,fontSize:12,lineHeight:1.5,color:'#8c8881'}}>
            <span style={{fontSize:16}}>🔒</span>
            <span><strong style={{color:'#1a1816'}}>Tip:</strong> Use a unique password you don't use elsewhere. Enable 2FA for extra security.</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

export default ChangePassword;