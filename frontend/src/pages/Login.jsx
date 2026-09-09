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
        setError(profileError.response?.data?.detail || "Login successful, but profile could not be loaded. Try again.");
        return;
      }

      if (!user) {
        setError("Login successful, but user profile was not returned.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("auth-change"));

      const from = location.state?.from?.pathname;
      if (user.role === "VENDOR" || user.is_vendor || user.role === "vendor") {
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
        else if (d.email) setError(Array.isArray(d.email)? d.email[0] : d.email);
        else if (d.password) setError(Array.isArray(d.password)? d.password[0] : d.password);
        else if (d.non_field_errors) setError(Array.isArray(d.non_field_errors)? d.non_field_errors[0] : d.non_field_errors);
        else setError("Unable to login. Check email and password.");
      } else {
        setError(err.message || "Unable to connect to server. Check backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#EAEDED] min-h-[calc(100vh-104px)] grid place-items-center p-4">
      <div className="w-full max-w-">
        <Link to="/" className="flex justify-center mb-4">
          <div className="text- font-bold tracking-tight">
            <span className="text-[#131921]">shop</span><span className="text-[#f08804]">zone</span>
            <span className="text- align-super">.in</span>
          </div>
        </Link>

        <div className="bg-white border border-[#d5d9d9] rounded- p-6 shadow-sm">
          <h1 className="text- font-medium text-[#0F1111] mb-4">Sign in</h1>

          {error && (
            <div className="mb-4 p-3 border border-[#c40000] bg-[#fff6f6] rounded- text- text-[#c40000] flex gap-2">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="block text- font-bold text-[#0F1111] mb-1">
                Email or mobile phone number
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
                className="w-full h-8 px-3 border border-[#a6a6a6] rounded- text- shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="block text- font-bold text-[#0F1111]">
                  Password
                </label>
                <Link to="/forgot-password" className="text- text-[#0066c0] hover:text-[#c45500] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full h-8 px-3 pr-10 border border-[#a6a6a6] rounded- text- shadow-[0_1px_0_rgba(255,255,255,.5),0_1px_0_rgba(0,0,0,.07)_inset] outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) =>!p)}
                  disabled={loading}
                  aria-label={showPassword? "Hide password" : "Show password"}
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

            <p className="text- text-[#0F1111] leading-">
              By continuing, you agree to ShopZone's{" "}
              <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a> and{" "}
              <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice.</a>
            </p>

            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="keep" className="w-3.5 h-3.5 accent-[#e77600]" />
              <label htmlFor="keep" className="text-">Keep me signed in.</label>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-[#e7e7e7]">
            <div className="text- font-bold mb-1">Buying for work?</div>
            <a href="#" className="text- text-[#0066c0] hover:text-[#c45500] hover:underline">Shop on ShopZone Business</a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e7e7e7]"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#EAEDED] px-2 text- text-[#767676]">New to ShopZone?</span></div>
          </div>
          <Link to="/register" className="mt-3 block w-full h-9 leading-9 bg-white border border-[#d5d9d9] rounded- text- shadow-sm hover:bg-[#f7fafa] text-center">
            Create your ShopZone account
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-[#ddd] text-center text- text-[#767676] space-x-3">
          <a href="#" className="text-[#0066c0] hover:underline">Conditions of Use</a>
          <a href="#" className="text-[#0066c0] hover:underline">Privacy Notice</a>
          <a href="#" className="text-[#0066c0] hover:underline">Help</a>
          <div className="mt-2">© 1996-2026, ShopZone.com, Inc. or its affiliates • Delhi, India</div>
        </div>
      </div>
    </div>
  );
}

export default Login;