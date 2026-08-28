import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

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

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const passwordStrength =
    getPasswordStrength(newPassword);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    if (passwordStrength.score < 3) {
      setError(
        "Please choose a stronger password. Use uppercase, lowercase, numbers, or special characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "auth/change-password/",
        {
          current_password:
            currentPassword,

          new_password:
            newPassword,
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        "Password changed successfully."
      );

      setTimeout(() => {
        navigate("/settings");
      }, 1200);
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      const responseData =
        error.response?.data;

      setError(
        responseData?.detail ||
          responseData?.message ||
          responseData?.current_password?.[0] ||
          responseData?.new_password?.[0] ||
          responseData?.old_password?.[0] ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <span className="settings-label">
            SECURITY
          </span>

          <h1>
            Change Password
          </h1>

          <p>
            Update your password to keep your
            account secure.
          </p>
        </div>

        <div className="settings-content">
          <div className="settings-card">
            <div className="settings-card-heading">
              <div>
                <h2>
                  Change Password
                </h2>

                <p>
                  Enter your current password
                  and choose a new password.
                </p>
              </div>
            </div>

            {error && (
              <div
                className="products-empty"
                role="alert"
              >
                <p>
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div
                className="products-empty"
                role="status"
              >
                <p>
                  {success}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="settings-form"
            >
              <div className="settings-option">
                <div>
                  <strong>
                    Current Password
                  </strong>

                  <span>
                    Enter your existing password.
                  </span>
                </div>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    style={{
                      width: "100%",
                      paddingRight: "48px",
                    }}
                    aria-label="Current Password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    title={
                      showCurrentPassword
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
                      background:
                        "transparent",
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                      padding: "4px",
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                  >
                    {showCurrentPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>
              </div>

              <div className="settings-option">
                <div>
                  <strong>
                    New Password
                  </strong>

                  <span>
                    Use at least 8 characters.
                  </span>
                </div>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      paddingRight: "48px",
                    }}
                    aria-label="New Password"
                    aria-describedby="change-password-strength"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    title={
                      showNewPassword
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
                      background:
                        "transparent",
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                      padding: "4px",
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                  >
                    {showNewPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>

                {newPassword && (
                  <div
                    id="change-password-strength"
                    style={{
                      width: "100%",
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
                  </div>
                )}
              </div>

              <div className="settings-option">
                <div>
                  <strong>
                    Confirm New Password
                  </strong>

                  <span>
                    Enter the new password again.
                  </span>
                </div>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    minLength={8}
                    style={{
                      width: "100%",
                      paddingRight: "48px",
                    }}
                    aria-label="Confirm New Password"
                    aria-describedby="confirm-password-status"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
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
                      background:
                        "transparent",
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
                    id="confirm-password-status"
                    style={{
                      width: "100%",
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

              <div className="profile-actions">
                <Link
                  to="/settings"
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ChangePassword;