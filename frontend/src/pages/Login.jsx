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
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // 1. Login
      const data = await loginUser(
        email,
        password
      );

      // 2. Save JWT tokens
      localStorage.setItem(
        "access_token",
        data.access
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh
      );

      // 3. Get logged-in user profile
      const user = await getProfile();

      console.log(
        "LOGGED IN USER:",
        user
      );

      // 4. Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // 5. Redirect
      const from =
        location.state?.from?.pathname;

      if (user?.role === "VENDOR") {
        navigate(
          from || "/vendor/dashboard",
          { replace: true }
        );
      } else {
        navigate(
          from || "/",
          { replace: true }
        );
      }
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      // Remove incomplete login data
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem("user");

      if (error.response?.data) {
        const responseData =
          error.response.data;

        if (responseData.detail) {
          setError(
            responseData.detail
          );
        } else {
          setError(
            "Unable to load user profile."
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
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
            />
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