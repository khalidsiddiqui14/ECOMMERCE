import {
  useEffect,
  useState,
} from "react";

import {
  getVendorProfile,
  updateVendorProfile,
} from "../../services/vendorService";

function VendorProfile() {
  const [profile, setProfile] =
    useState({
      username: "",
      email: "",
      phone: "",
      role: "",
      business_name: "",
      gst_number: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
      is_verified: false,
      is_active: true,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data =
        await getVendorProfile();

      setProfile((previous) => ({
        ...previous,
        ...data,
        username:
          data.username ||
          data.user ||
          "",
        email:
          data.email ||
          "",
        role:
          data.role ||
          "VENDOR",
      }));
    } catch (error) {
      console.error(
        "VENDOR PROFILE ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Vendor profile load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        if (!cancelled) {
          setLoading(true);
          setError("");
          setSuccess("");
        }

        const data =
          await getVendorProfile();

        if (!cancelled) {
          setProfile((previous) => ({
            ...previous,
            ...data,
            username:
              data.username ||
              data.user ||
              "",
            email:
              data.email ||
              "",
            role:
              data.role ||
              "VENDOR",
          }));
        }
      } catch (error) {
        console.error(
          "VENDOR PROFILE ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.detail ||
              error.message ||
              "Vendor profile load nahi ho paaya."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const profileData = {
        business_name:
          profile.business_name.trim(),

        phone:
          profile.phone.trim(),

        gst_number:
          profile.gst_number.trim() ||
          null,

        address:
          profile.address.trim(),

        city:
          profile.city.trim(),

        state:
          profile.state.trim(),

        country:
          profile.country.trim(),

        postal_code:
          profile.postal_code.trim(),
      };

      const data =
        await updateVendorProfile(
          profileData
        );

      setProfile((previous) => ({
        ...previous,
        ...data,
        username:
          previous.username,
        email:
          previous.email,
        role:
          previous.role,
      }));

      setSuccess(
        "Vendor profile updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE VENDOR PROFILE ERROR:",
        error
      );

      const responseData =
        error.response?.data;

      if (responseData) {
        const messages =
          Object.entries(
            responseData
          )
            .map(
              ([field, message]) => {
                const text =
                  Array.isArray(message)
                    ? message.join(", ")
                    : message;

                return `${field}: ${text}`;
              }
            )
            .join(" | ");

        setError(
          messages ||
            "Vendor profile update nahi ho paaya."
        );
      } else {
        setError(
          "Vendor profile update nahi ho paaya."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="vendor-profile-page">
        <div className="vendor-container">
          <div className="products-loading">
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-profile-page">
      <div className="vendor-container">

        <div className="vendor-profile-header">

          <div className="vendor-profile-avatar">
            {(
              profile.username ||
              profile.business_name ||
              "V"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <span className="vendor-badge">
              Vendor Panel
            </span>

            <h1>
              Vendor Profile
            </h1>

            <p>
              Manage your vendor account
              information.
            </p>
          </div>

        </div>

        {error && (
          <div className="auth-error">
            {error}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadProfile}
              style={{
                marginLeft: "10px",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <section className="vendor-profile-card">

          <form
            onSubmit={handleSubmit}
          >

            <div className="vendor-profile-section">

              <h2>
                Account Information
              </h2>

              <div className="vendor-profile-grid">

                <div className="form-group">
                  <label htmlFor="username">
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={
                      profile.username
                    }
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={
                      profile.email
                    }
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={
                      profile.phone
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    Role
                  </label>

                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={
                      profile.role
                    }
                    readOnly
                  />
                </div>

              </div>

            </div>

            <div className="vendor-profile-section">

              <h2>
                Business Information
              </h2>

              <div className="vendor-profile-grid">

                <div className="form-group">

                  <label htmlFor="business_name">
                    Business Name
                  </label>

                  <input
                    id="business_name"
                    name="business_name"
                    type="text"
                    value={
                      profile.business_name
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="gst_number">
                    GST Number
                  </label>

                  <input
                    id="gst_number"
                    name="gst_number"
                    type="text"
                    value={
                      profile.gst_number
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

            </div>

            <div className="vendor-profile-section">

              <h2>
                Address
              </h2>

              <div className="form-group">

                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={
                    profile.address
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="vendor-profile-grid">

                <div className="form-group">

                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={
                      profile.city
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={
                      profile.state
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="country">
                    Country
                  </label>

                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={
                      profile.country
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="postal_code">
                    Postal Code
                  </label>

                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    value={
                      profile.postal_code
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

            </div>

            <div className="vendor-account-status">

              <div>
                <span>
                  Account Status
                </span>

                <strong>
                  {profile.is_active
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

              <div>
                <span>
                  Vendor Status
                </span>

                <strong>
                  {profile.is_verified
                    ? "Verified"
                    : "Pending Verification"}
                </strong>
              </div>

            </div>

            <div className="vendor-profile-actions">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </section>

      </div>
    </main>
  );
}

export default VendorProfile;