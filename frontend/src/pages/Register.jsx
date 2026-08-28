import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

function getPasswordStrength(password) {
  if (!password) {
    return {
      label: "",
      score: 0,
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = {
    1: "Very Weak",
    2: "Weak",
    3: "Fair",
    4: "Strong",
    5: "Very Strong",
  };

  return {
    label: labels[score],
    score,
  };
}

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrength =
    getPasswordStrength(password);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedUsername) {
      setError("Please enter a username.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (passwordStrength.score < 3) {
      setError(
        "Please choose a stronger password. Use uppercase, lowercase, numbers, or special characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(
        trimmedUsername,
        trimmedEmail,
        password,
        trimmedPhone
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      if (error.response?.data) {
        const data = error.response.data;

        const messages = Object.entries(data)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field}: ${value.join(", ")}`;
            }

            if (
              value &&
              typeof value === "object"
            ) {
              return `${field}: ${Object.values(
                value
              ).join(", ")}`;
            }

            return `${field}: ${value}`;
          })
          .join(" | ");

        setError(
          messages || "Registration failed."
        );
      } else {
        setError(
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
          <h1>Create Account</h1>

          <p>
            Join E-Shop today
          </p>
        </div>

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="auth-success"
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              autoComplete="tel"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                id="register-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                required
                disabled={loading}
                minLength={8}
                style={{
                  width: "100%",
                  paddingRight: "48px",
                }}
                aria-describedby="password-strength"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
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
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  padding: "4px",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>

            {password && (
              <div
                id="password-strength"
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                }}
              >
                <span>
                  Password strength:{" "}
                  <strong>
                    {passwordStrength.label}
                  </strong>
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginTop: "6px",
                  }}
                  aria-hidden="true"
                >
                  {[1, 2, 3, 4, 5].map(
                    (level) => (
                      <span
                        key={level}
                        style={{
                          height: "4px",
                          flex: 1,
                          background:
                            level <=
                            passwordStrength.score
                              ? "currentColor"
                              : "#ddd",
                          borderRadius:
                            "4px",
                        }}
                      />
                    )
                  )}
                </div>

                <span
                  style={{
                    display: "block",
                    marginTop: "6px",
                  }}
                >
                  Use 8+ characters with a mix
                  of uppercase, lowercase,
                  numbers, and symbols.
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                required
                disabled={loading}
                minLength={8}
                style={{
                  width: "100%",
                  paddingRight: "48px",
                }}
                aria-describedby="password-match"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                title={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  padding: "4px",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>

            {confirmPassword && (
              <span
                id="password-match"
                style={{
                  display: "block",
                  marginTop: "6px",
                  fontSize: "13px",
                }}
              >
                {passwordsMatch
                  ? "✓ Passwords match."
                  : "Passwords do not match."}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;