import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { getProfile } from "../services/userService";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google"; // <-- YE ADD KIYA

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginMode, setLoginMode] = useState("password");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [testOtp, setTestOtp] = useState("");

const API = `${import.meta.env.VITE_API_URL}auth`;
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (!data?.access) throw new Error("No access token");
      localStorage.setItem("access_token", data.access);
      if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
      const user = await getProfile();
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-change"));
      const from = location.state?.from?.pathname;
      if (user.role === "VENDOR" || user.is_vendor) {
        navigate(from || "/vendor/dashboard", { replace: true });
      } else {
        navigate(from || "/", { replace: true });
      }
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      const d = err.response?.data;
      if (d?.detail) setError(d.detail);
      else if (d?.non_field_errors) setError(d.non_field_errors[0]);
      else setError("Unable to login. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Enter Email or Phone Number first!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/send-otp/`, {
        email_or_phone: email,
      });
      setTestOtp(res.data.test_otp);
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Enter OTP!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/verify-otp/`, {
        email_or_phone: email,
        otp: otp,
      });
      localStorage.setItem("access_token", res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth-change"));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN HANDLER - NEW
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/google-login/`, {
        token: credentialResponse.credential,
      });
      localStorage.setItem("access_token", res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth-change"));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EAEDED] min-h-[calc(100vh-104px)] grid place-items-center p-4">
      <div className="w-full max-w-">
        <Link to="/" className="flex justify-center mb-4">
          <div className="text- font-bold tracking-tight">
            <span className="text-[#131921]">shop</span>
            <span className="text-[#f08804]">zone</span>
            <span className="text- align-super">.in</span>
          </div>
        </Link>

        <div className="bg-white border border-[#d5d9d9] rounded- p-6 shadow-sm">
          <h1 className="text- font-medium text-[#0F1111] mb-4">Sign in</h1>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setLoginMode("password");
                setOtpSent(false);
                setError("");
              }}
              className={`flex-1 h-8 rounded- text- font-medium border ${
                loginMode === "password"
                ? "bg-[#FFD814] border-[#FCD200]"
                  : "bg-white border-[#d5d9d9]"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("otp");
                setError("");
              }}
              className={`flex-1 h-8 rounded- text- font-medium border ${
                loginMode === "otp"
                ? "bg-[#FFD814] border-[#FCD200]"
                  : "bg-white border-[#d5d9d9]"
              }`}
            >
              OTP Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-[#c40000] bg-[#fff6f6] rounded- text- text-[#c40000] flex gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {loginMode === "password"? (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text- font-bold text-[#0F1111] mb-1">
                  Email or mobile phone number
                </label>
                <input
                  type="text"
                  placeholder="Enter email or phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-8 px-3 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text- font-bold text-[#0F1111]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text- text-[#0066c0] hover:text-[#c45500] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-8 px-3 pr-10 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) =>!p)}
                    className="absolute right-1 top-0.5 w-7 h-7 border border-[#d5d9d9] rounded- bg-[#f0f2f2] grid place-items-center text- hover:bg-[#e3e6e6]"
                  >
                    {showPassword? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-8 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-medium shadow-sm disabled:opacity-60"
              >
                {loading? "Signing in..." : "Sign in"}
              </button>

              {/* GOOGLE LOGIN BUTTON */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e7e7e7]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text- text-[#767676]">or</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                  width="100%"
                />
              </div>

              <p className="text- text-[#0F1111] leading-">
                By continuing, you agree to ShopZone's{" "}
                <a href="#" className="text-[#0066c0] hover:underline">
                  Conditions of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#0066c0] hover:underline">
                  Privacy Notice.
                </a>
              </p>
            </form>
          ) : (
            <form
              onSubmit={otpSent? verifyOtp : sendOtp}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text- font-bold text-[#0F1111] mb-1">
                  Email or mobile phone number
                </label>
                <input
                  type="text"
                  placeholder="Enter email or phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || otpSent}
                  className="w-full h-8 px-3 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                />
              </div>

              {otpSent && (
                <div>
                  <label className="block text- font-bold text-[#0F1111] mb-1">
                    Enter OTP{" "}
                    {testOtp && (
                      <span className="text-green-600">- TEST: {testOtp}</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-8 px-3 border border-[#a6a6a6] rounded- text- tracking-[0.3em] font-bold outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                  />
                  <p className="text- text-[#067D62] mt-1">
                    OTP sent to {email}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-8 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded- text- font-medium shadow-sm disabled:opacity-60"
              >
                {loading
                ? "Please wait..."
                  : otpSent
                ? "Verify OTP & Sign in"
                  : "Continue - Send OTP"}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setTestOtp("");
                    setError("");
                  }}
                  className="w-full h-8 bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa]"
                >
                  Change Email/Phone
                </button>
              )}

              {/* GOOGLE IN OTP MODE TOO */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e7e7e7]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text- text-[#767676]">or</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                  width="100%"
                />
              </div>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-[#e7e7e7]">
            <div className="text- font-bold mb-1">Buying for work?</div>
            <a
              href="#"
              className="text- text-[#0066c0] hover:text-[#c45500] hover:underline"
            >
              Shop on ShopZone Business
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e7e7e7]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#EAEDED] px-2 text- text-[#767676]">
                New to ShopZone?
              </span>
            </div>
          </div>
          <Link
            to="/register"
            className="mt-3 block w-full h-9 leading-9 bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa] text-center"
          >
            Create your ShopZone account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;