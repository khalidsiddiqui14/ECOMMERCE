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
    setError("");
    setSuccess("");

    if (!currentPassword ||!newPassword ||!confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (strength.score < 3) {
      setError("Choose stronger password: use uppercase, lowercase, numbers.");
      return;
    }
    if (newPassword!== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);
    try {
      await api.post("auth/change-password/", { current_password: currentPassword, new_password: newPassword, old_password: currentPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully! Redirecting...");
      setTimeout(() => navigate("/settings"), 1200);
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.detail || d?.message || d?.current_password?.[0] || d?.new_password?.[0] || d?.old_password?.[0] || d?.error || "Unable to change password. Check current password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const colors = ["#CC0C39", "#e47911", "#f08804", "#067D62", "#067D62"];

  return (
    <div className="bg-[#EAEDED] min-h-[calc(100vh-104px)] py-6">
      <div className="max-w- mx-auto px-4">
        <div className="bg-white border border-[#d5d9d9] rounded- shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#eaeaea]">
            <div className="text- text-[#0066c0]"><Link to="/settings" className="hover:underline hover:text-[#C45500]">Your Account</Link> › Change Password</div>
            <h1 className="text- font-medium mt-2 text-[#0F1111]">Change Password</h1>
            <p className="text- text-[#565959] mt-1">Use the form below to change the password for your ShopZone account. Strong password = better security.</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 border border-[#c40000] bg-[#fff6f6] rounded- text- text-[#c40000] flex gap-2">
                <span>⚠</span><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 border border-[#067D62] bg-[#f0fdf4] rounded- text- text-[#067D62] flex gap-2">
                <span>✓</span><span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text- font-bold mb-1 text-[#0F1111]">Current password</label>
                <div className="relative">
                  <input
                    type={showCurrent? "text" : "password"}
                    value={currentPassword}
                    onChange={e=>setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    placeholder="Current password"
                    className="w-full h-9 px-3 pr-10 border border-[#a6a6a6] rounded- text- focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)] outline-none"
                  />
                  <button type="button" onClick={()=>setShowCurrent(p=>!p)} className="absolute right-1 top-1 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded- text- grid place-items-center">{showCurrent? "🙈" : "👁"}</button>
                </div>
              </div>

              <div>
                <label className="block text- font-bold mb-1 text-[#0F1111]">New password</label>
                <div className="relative">
                  <input
                    type={showNew? "text" : "password"}
                    value={newPassword}
                    onChange={e=>setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full h-9 px-3 pr-10 border border-[#a6a6a6] rounded- text- focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)] outline-none"
                  />
                  <button type="button" onClick={()=>setShowNew(p=>!p)} className="absolute right-1 top-1 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded- text- grid place-items-center">{showNew? "🙈" : "👁"}</button>
                </div>

                {newPassword && (
                  <div className="mt-3">
                    <div className="flex justify-between text- mb-1">
                      <span>Password strength: <strong style={{color: colors[strength.score-1] || '#565959'}}>{strength.label}</strong></span>
                      <span className="text-[#565959]">{strength.score}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(lvl=>(
                        <div key={lvl} className="flex-1 h-1.5 rounded-full" style={{background: lvl <= strength.score? colors[strength.score-1] : '#e7e7e7'}} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        {ok: newPassword.length>=8, text:'8+ characters'},
                        {ok: /[A-Z]/.test(newPassword), text:'Uppercase A-Z'},
                        {ok: /[a-z]/.test(newPassword), text:'Lowercase a-z'},
                        {ok: /[0-9]/.test(newPassword), text:'Number 0-9'},
                      ].map(item=>(
                        <div key={item.text} className={`text- flex items-center gap-1 ${item.ok? 'text-[#067D62]' : 'text-[#767676]'}`}>
                          <span className={`w-3.5 h-3.5 rounded-full grid place-items-center text- ${item.ok? 'bg-[#067D62] text-white' : 'bg-[#e7e7e7]'}`}>{item.ok? '✓' : '○'}</span>
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text- font-bold mb-1 text-[#0F1111]">Re-enter new password</label>
                <div className="relative">
                  <input
                    type={showConfirm? "text" : "password"}
                    value={confirmPassword}
                    onChange={e=>setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    placeholder="Re-enter new password"
                    className={`w-full h-9 px-3 pr-10 border rounded- text- outline-none ${confirmPassword? (match? 'border-[#067D62] bg-[#f0fdf4]' : 'border-[#c40000] bg-[#fff6f6]') : 'border-[#a6a6a6]'}`}
                  />
                  <button type="button" onClick={()=>setShowConfirm(p=>!p)} className="absolute right-1 top-1 w-7 h-7 bg-[#f0f2f2] border border-[#d5d9d9] rounded- text- grid place-items-center">{showConfirm? "🙈" : "👁"}</button>
                </div>
                {confirmPassword && (
                  <div className={`mt-1 text- ${match? 'text-[#067D62]' : 'text-[#c40000]'}`}>
                    {match? '✓ Passwords match' : '✕ Passwords do not match'}
                  </div>
                )}
              </div>

              <div className="bg-[#f0f2f2] border border-[#d5d9d9] rounded- p-3 text- text-[#565959]">
                <b>Secure tip:</b> Use unique password not used elsewhere. ShopZone never asks password via email. After change, you will be logged out from other devices.
              </div>

              <div className="flex gap-3 pt-2">
                <Link to="/settings" className="flex-1 h-9 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa]">
                  Cancel
                </Link>
                <button type="submit" disabled={loading} className="flex-[1.3] h-9 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-bold shadow-sm disabled:opacity-50">
                  {loading? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-4 text-center text- text-[#565959]">
          Need help? <Link to="/help" className="text-[#0066c0] hover:underline">Contact Customer Service</Link> • <Link to="/forgot-password" className="text-[#0066c0] hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;