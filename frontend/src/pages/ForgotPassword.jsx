import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setMessage(data?.message || "Password reset link has been sent to your email.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Unable to send password reset link.");
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
          <h1 className="text-2xl font-medium text-[#0F1111] mb-2">Forgot password?</h1>
          <p className="text-sm text-[#565959] mb-5">Enter your email address and we'll send you a link to reset your password.</p>
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
              <label className="block text-sm font-bold text-[#0F1111] mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 px-3 border border-[#a6a6a6] rounded-md text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-md text-sm font-medium shadow-sm disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <div className="mt-5 pt-4 border-t border-[#e7e7e7] text-center">
            <button type="button" onClick={() => navigate("/login")} className="text-sm text-[#0066c0] hover:text-[#c45500] hover:underline">
              Back to Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;