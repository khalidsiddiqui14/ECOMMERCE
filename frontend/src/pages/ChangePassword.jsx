import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function getPasswordStrength(password) {
  if (!password) {
    return {
      label: "",
      score: 0,
    };
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

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

    setLoading(true);

    try {
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
            Update your password to keep
            your account secure.
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
                className="settings-message settings-message-error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="settings-message settings-message-success"
                role="status"
                aria-live="polite"
              >
                {success}
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

                <div className="password-input-wrapper">
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
                    className="password-input"
                    aria-label="Current Password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
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

                <div className="password-input-wrapper">
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
                    className="password-input"
                    aria-label="New Password"
                    aria-describedby="change-password-strength"
                  />

                  <button
                    type="button"
                    className="password-toggle"
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
                  >
                    {showNewPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>

                {newPassword && (
                  <div
                    id="change-password-strength"
                    className="password-strength"
                  >
                    <span>
                      Password strength:{" "}
                      <strong>
                        {
                          passwordStrength.label
                        }
                      </strong>
                    </span>

                    <div
                      className="password-strength-bars"
                      aria-hidden="true"
                    >
                      {[1, 2, 3, 4, 5].map(
                        (level) => (
                          <span
                            key={level}
                            className={
                              level <=
                              passwordStrength.score
                                ? "password-strength-bar password-strength-bar-active"
                                : "password-strength-bar"
                            }
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

                <div className="password-input-wrapper">
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
                    className="password-input"
                    aria-label="Confirm New Password"
                    aria-describedby="confirm-password-status"
                  />

                  <button
                    type="button"
                    className="password-toggle"
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
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>
                </div>

                {confirmPassword && (
                  <span
                    id="confirm-password-status"
                    className={
                      passwordsMatch
                        ? "password-match password-match-success"
                        : "password-match password-match-error"
                    }
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