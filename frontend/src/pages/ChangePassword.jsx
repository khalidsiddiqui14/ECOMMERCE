import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


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
              <div className="products-empty">

                <p>
                  {error}
                </p>

              </div>
            )}


            {success && (
              <div className="products-empty">

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


                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

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


                <input
                  type="password"
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
                />

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


                <input
                  type="password"
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
                />

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