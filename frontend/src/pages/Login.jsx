import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../services/authService";
import { getProfile } from "../services/userService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(
        email,
        password
      );

      if (!data?.access) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      localStorage.setItem(
        "access_token",
        data.access
      );

      if (data.refresh) {
        localStorage.setItem(
          "refresh_token",
          data.refresh
        );
      }

      let user;

      try {
        user = await getProfile();
      } catch (profileError) {
        console.error(
          "PROFILE LOAD ERROR:",
          profileError
        );

        setError(
          profileError.response?.data?.detail ||
            profileError.response?.data?.message ||
            "Login successful, but the user profile could not be loaded."
        );

        return;
      }

      if (!user) {
        setError(
          "Login successful, but user profile was not returned."
        );

        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      window.dispatchEvent(
        new Event("auth-change")
      );

      const from =
        location.state?.from?.pathname;

      if (user.role === "VENDOR") {
        navigate(
          from || "/vendor/dashboard",
          {
            replace: true,
          }
        );
      } else {
        navigate(
          from || "/",
          {
            replace: true,
          }
        );
      }
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      if (error.response?.data) {
        const data =
          error.response.data;

        if (data.detail) {
          setError(data.detail);
        } else if (data.email) {
          setError(
            Array.isArray(data.email)
              ? data.email[0]
              : data.email
          );
        } else if (data.password) {
          setError(
            Array.isArray(data.password)
              ? data.password[0]
              : data.password
          );
        } else {
          setError(
            "Unable to login. Please check your email and password."
          );
        }
      } else {
        setError(
          error.message ||
            "Unable to connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Welcome Back</h1>

          <p>
            Login to your E-Shop account
          </p>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Password
            </label>

            <div className="password-field">
              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                required
                disabled={loading}
                className="password-input"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}

            <Link to="/register">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}

export default Login;