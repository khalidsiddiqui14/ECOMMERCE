import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const data = await resetPassword(uid, token, password);
      setMessage(data?.message || "Password reset successfully.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EAEDED] min-h-[calc(100vh-104px)] grid place-items-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-4">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-[#131921]">shop</span>
            <span className="text-[#f08804]">zone</span>
            <span className="text-[#131921] align-super text-xs">.in</span>
          </div>
        </Link>
        <div className="bg-white border border-[#d5d9d9] rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-medium text-[#0F1111] mb-2">Create new password</h1>
          <p className="text-sm text-[#565959] mb-5">Choose a new password for your ShopZone account.</p>
          {error && (
            <div className="mb-4 p-3 border border-[#c40000] bg-[#fff6f6] rounded-md text-sm text-[#c40000] flex gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 border border-[#067D62] bg-[#f3fffb] rounded-md text-sm text-[#067D62] flex gap-2">
              <span>✓</span>
              <span>{message}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0F1111] mb-1">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-10 px-3 pr-10 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-1 top-1 w-8 h-8 border border-[#d5d9d9] rounded-md bg-[#f0f2f2] grid place-items-center text-sm hover:bg-[#e3e6e6]">
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              <p className="text-xs text-[#565959] mt-1">Password must be at least 8 characters.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F1111] mb-1">Confirm password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full h-10 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-md text-sm font-medium shadow-sm disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
          <div className="mt-5 pt-4 border-t border-[#e7e7e7] text-center">
            <Link to="/login" className="text-sm text-[#0066c0] hover:text-[#c45500] hover:underline">
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;