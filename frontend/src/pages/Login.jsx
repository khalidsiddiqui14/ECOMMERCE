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


      // Make sure the login response
      // contains the access token.
      if (!data?.access) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }


      // 2. Save JWT tokens
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


      // 3. Get logged-in user's profile
      let user;

      try {
        user = await getProfile();

      } catch (profileError) {
        console.error(
          "PROFILE LOAD ERROR:",
          profileError
        );

        /*
         * Login itself was successful.
         *
         * Do NOT delete the access token here.
         * The session should remain available so
         * the actual authentication problem can
         * be diagnosed separately.
         */

        setError(
          profileError.response?.data?.detail ||
            profileError.response?.data?.message ||
            "Login successful, but the user profile could not be loaded."
        );

        return;
      }


      // 4. Make sure profile data exists
      if (!user) {
        setError(
          "Login successful, but user profile was not returned."
        );

        return;
      }


      console.log(
        "LOGGED IN USER:",
        user
      );


      // 5. Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // 6. Redirect
      const from =
        location.state?.from?.pathname;


      if (user?.role === "VENDOR") {
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


      /*
       * This catch is for an actual login
       * failure.
       *
       * Clear incomplete authentication
       * data only when the login request
       * itself fails.
       */

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );


      if (error.response?.data) {
        const responseData =
          error.response.data;


        if (responseData.detail) {
          setError(
            responseData.detail
          );

        } else if (
          responseData.email
        ) {
          setError(
            responseData.email[0]
          );

        } else if (
          responseData.password
        ) {
          setError(
            responseData.password[0]
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

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to your E-Shop account
          </p>

        </div>


        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
        >

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
              autoComplete="email"
              required
              disabled={loading}
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
              autoComplete="current-password"
              required
              disabled={loading}
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