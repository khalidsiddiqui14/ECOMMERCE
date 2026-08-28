import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getVendorProfile,
  updateVendorProfile,
} from "../../services/vendorService";

const INITIAL_PROFILE = {
  username: "",
  email: "",
  phone: "",
  role: "VENDOR",
  business_name: "",
  gst_number: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postal_code: "",
  is_verified: false,
  is_active: true,
};

function normalizeProfile(data) {
  return {
    ...INITIAL_PROFILE,
    ...(data || {}),
    username:
      data?.username ||
      data?.user ||
      "",
    email:
      data?.email ||
      "",
    role:
      data?.role ||
      "VENDOR",
    business_name:
      data?.business_name ||
      "",
    gst_number:
      data?.gst_number ||
      "",
    phone:
      data?.phone ||
      "",
    address:
      data?.address ||
      "",
    city:
      data?.city ||
      "",
    state:
      data?.state ||
      "",
    country:
      data?.country ||
      "India",
    postal_code:
      data?.postal_code ||
      "",
    is_verified:
      Boolean(
        data?.is_verified
      ),
    is_active:
      data?.is_active !== false,
  };
}

function VendorProfile() {
  const [profile, setProfile] =
    useState(INITIAL_PROFILE);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadProfile = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        const data =
          await getVendorProfile();

        setProfile(
          normalizeProfile(data)
        );
      } catch (error) {
        console.error(
          "VENDOR PROFILE ERROR:",
          error
        );

        setError(
          error.response?.data
            ?.detail ||
            error.response?.data
              ?.message ||
            error.message ||
            "Vendor profile load nahi ho paaya."
        );
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getVendorProfile();

        if (!cancelled) {
          setProfile(
            normalizeProfile(data)
          );
        }
      } catch (error) {
        console.error(
          "VENDOR PROFILE ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data
              ?.detail ||
              error.response?.data
                ?.message ||
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

    setError("");
    setSuccess("");
  };

  const validateProfile = () => {
    const businessName =
      profile.business_name.trim();

    const phone =
      profile.phone.trim();

    const gstNumber =
      profile.gst_number.trim();

    const address =
      profile.address.trim();

    const city =
      profile.city.trim();

    const state =
      profile.state.trim();

    const country =
      profile.country.trim();

    const postalCode =
      profile.postal_code.trim();

    if (!businessName) {
      return "Business name is required.";
    }

    if (!phone) {
      return "Phone number is required.";
    }

    if (
      !/^[0-9+\-\s()]{7,20}$/.test(
        phone
      )
    ) {
      return "Please enter a valid phone number.";
    }

    if (
      gstNumber &&
      !/^[0-9A-Z]{15}$/i.test(
        gstNumber
      )
    ) {
      return "GST number must contain 15 characters.";
    }

    if (!address) {
      return "Address is required.";
    }

    if (!city) {
      return "City is required.";
    }

    if (!state) {
      return "State is required.";
    }

    if (!country) {
      return "Country is required.";
    }

    if (!postalCode) {
      return "Postal code is required.";
    }

    if (
      !/^[A-Za-z0-9\s-]{3,12}$/.test(
        postalCode
      )
    ) {
      return "Please enter a valid postal code.";
    }

    return "";
  };

  const formatApiError = (
    error
  ) => {
    const data =
      error.response?.data;

    if (!data) {
      return (
        error.message ||
        "Vendor profile update nahi ho paaya."
      );
    }

    if (
      typeof data === "string"
    ) {
      return data;
    }

    if (data.detail) {
      return Array.isArray(
        data.detail
      )
        ? data.detail.join(", ")
        : String(data.detail);
    }

    if (data.message) {
      return Array.isArray(
        data.message
      )
        ? data.message.join(", ")
        : String(data.message);
    }

    const messages =
      Object.entries(data)
        .map(
          ([field, message]) => {
            const text =
              Array.isArray(message)
                ? message.join(", ")
                : typeof message ===
                    "object" &&
                  message !== null
                ? JSON.stringify(
                    message
                  )
                : String(message);

            return `${field}: ${text}`;
          }
        )
        .join(" | ");

    return (
      messages ||
      "Vendor profile update nahi ho paaya."
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateProfile();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

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

      setProfile(
        normalizeProfile({
          ...profile,
          ...data,
          username:
            profile.username,
          email:
            profile.email,
          role:
            profile.role,
          is_verified:
            profile.is_verified,
          is_active:
            profile.is_active,
        })
      );

      setSuccess(
        "Vendor profile updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE VENDOR PROFILE ERROR:",
        error
      );

      setError(
        formatApiError(error)
      );
    } finally {
      setSaving(false);
    }
  };

  const avatarName =
    profile.username ||
    profile.business_name ||
    "Vendor";

  const avatarLetter =
    avatarName
      .charAt(0)
      .toUpperCase();

  if (loading) {
    return (
      <main className="vendor-profile-page">
        <div className="vendor-container">
          <div
            className="products-loading"
            role="status"
            aria-live="polite"
          >
            Loading profile...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-profile-page">
      <div className="vendor-container">

        {/* HEADER */}

        <div className="vendor-profile-header">
          <div className="vendor-profile-avatar">
            {avatarLetter}
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

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              loadProfile(true)
            }
            disabled={
              refreshing ||
              saving
            }
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="auth-success"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        {/* PROFILE FORM */}

        <section className="vendor-profile-card">
          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* ACCOUNT INFORMATION */}

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

                  <small>
                    Username cannot be
                    changed here.
                  </small>
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

                  <small>
                    Email cannot be
                    changed here.
                  </small>
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
                    disabled={saving}
                    maxLength={20}
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

            {/* BUSINESS INFORMATION */}

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
                    disabled={saving}
                    maxLength={255}
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
                    disabled={saving}
                    maxLength={15}
                    style={{
                      textTransform:
                        "uppercase",
                    }}
                    placeholder="Optional"
                  />

                  <small>
                    Example:
                    22AAAAA0000A1Z5
                  </small>
                </div>

              </div>
            </div>

            {/* ADDRESS */}

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
                  disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                    maxLength={12}
                    required
                  />
                </div>

              </div>
            </div>

            {/* ACCOUNT STATUS */}

            <div className="vendor-account-status">

              <div>
                <span>
                  Account Status
                </span>

                <strong
                  className={
                    profile.is_active
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {profile.is_active
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

              <div>
                <span>
                  Vendor Status
                </span>

                <strong
                  className={
                    profile.is_verified
                      ? "status-verified"
                      : "status-pending"
                  }
                >
                  {profile.is_verified
                    ? "Verified"
                    : "Pending Verification"}
                </strong>
              </div>

            </div>

            {/* ACTIONS */}

            <div className="vendor-profile-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving Changes..."
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