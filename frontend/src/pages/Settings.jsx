import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../services/notificationService";


function Settings() {
  const [preferences, setPreferences] = useState(null);

  const [loadingPreferences, setLoadingPreferences] =
    useState(true);

  const [savingPreference, setSavingPreference] =
    useState("");

  const [error, setError] = useState("");

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "INR"
  );

  const [aiAssistant, setAiAssistant] =
    useState(
      localStorage.getItem("ai_assistant") !==
        "false"
    );

  const [productRecommendations, setProductRecommendations] =
    useState(
      localStorage.getItem(
        "product_recommendations"
      ) !== "false"
    );


  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setError("");

        const data =
          await getNotificationPreferences();

        setPreferences(data);
      } catch (error) {
        console.error(
          "SETTINGS PREFERENCES ERROR:",
          error
        );

        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Notification preferences load nahi ho paayi."
        );
      } finally {
        setLoadingPreferences(false);
      }
    };

    loadPreferences();
  }, []);


  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.setAttribute(
        "data-theme",
        "dark"
      );
    } else if (theme === "light") {
      root.setAttribute(
        "data-theme",
        "light"
      );
    } else {
      root.removeAttribute("data-theme");
    }

    localStorage.setItem(
      "theme",
      theme
    );
  }, [theme]);


  const handleLanguageChange = (
    event
  ) => {
    const value =
      event.target.value;

    setLanguage(value);

    localStorage.setItem(
      "language",
      value
    );
  };


  const handleCurrencyChange = (
    event
  ) => {
    const value =
      event.target.value;

    setCurrency(value);

    localStorage.setItem(
      "currency",
      value
    );
  };


  const handleAiAssistantChange = (
    event
  ) => {
    const value =
      event.target.checked;

    setAiAssistant(value);

    localStorage.setItem(
      "ai_assistant",
      String(value)
    );
  };


  const handleProductRecommendationsChange = (
    event
  ) => {
    const value =
      event.target.checked;

    setProductRecommendations(
      value
    );

    localStorage.setItem(
      "product_recommendations",
      String(value)
    );
  };


  const handlePreferenceChange = async (
    field,
    value
  ) => {
    if (!preferences) {
      return;
    }

    const previousValue =
      preferences[field];

    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));

    setSavingPreference(field);

    setError("");

    try {
      const updated =
        await updateNotificationPreferences({
          [field]: value,
        });

      setPreferences(updated);
    } catch (error) {
      console.error(
        "SETTINGS PREFERENCE UPDATE ERROR:",
        error
      );

      setPreferences((current) => ({
        ...current,
        [field]: previousValue,
      }));

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Preference update nahi ho paayi."
      );
    } finally {
      setSavingPreference("");
    }
  };


  if (loadingPreferences) {
    return (
      <main className="settings-page">

        <div className="settings-container">

          <div className="products-loading">
            Loading settings...
          </div>

        </div>

      </main>
    );
  }


  return (
    <main className="settings-page">

      <div className="settings-container">


        {/* HEADER */}

        <div className="settings-header">

          <span className="settings-label">
            ACCOUNT
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account, preferences,
            notifications and security.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="products-empty">

            <p>
              {error}
            </p>

          </div>
        )}


        <div className="settings-layout">


          {/* SIDEBAR */}

          <aside className="settings-sidebar">

            <button
              type="button"
              className="settings-nav-item active"
            >
              ⚙️ General
            </button>


            <Link
              to="/profile"
              className="settings-nav-item"
            >
              👤 Account
            </Link>


            <button
              type="button"
              className="settings-nav-item"
            >
              🔐 Security
            </button>


            <button
              type="button"
              className="settings-nav-item"
            >
              🔔 Notifications
            </button>


            <button
              type="button"
              className="settings-nav-item"
            >
              🎨 Appearance
            </button>


            <button
              type="button"
              className="settings-nav-item"
            >
              🛒 Shopping
            </button>


            <button
              type="button"
              className="settings-nav-item"
            >
              🤖 AI Preferences
            </button>

          </aside>


          {/* CONTENT */}

          <section className="settings-content">


            {/* GENERAL SETTINGS */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    General Settings
                  </h2>

                  <p>
                    Manage your basic shopping
                    preferences.
                  </p>

                </div>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Language
                  </strong>

                  <span>
                    Choose your preferred language.
                  </span>

                </div>


                <select
                  value={language}
                  onChange={
                    handleLanguageChange
                  }
                >

                  <option value="English">
                    English
                  </option>

                  <option value="Hindi">
                    Hindi
                  </option>

                </select>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Currency
                  </strong>

                  <span>
                    Select your preferred currency.
                  </span>

                </div>


                <select
                  value={currency}
                  onChange={
                    handleCurrencyChange
                  }
                >

                  <option value="INR">
                    ₹ INR
                  </option>

                  <option value="USD">
                    $ USD
                  </option>

                </select>

              </div>

            </div>


            {/* ACCOUNT */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    Account
                  </h2>

                  <p>
                    Manage your personal account
                    information.
                  </p>

                </div>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Profile
                  </strong>

                  <span>
                    View and manage your profile
                    information.
                  </span>

                </div>


                <Link
                  to="/profile"
                  className="btn btn-secondary"
                >
                  View Profile
                </Link>

              </div>

            </div>


            {/* SECURITY */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    Security
                  </h2>

                  <p>
                    Keep your account secure.
                  </p>

                </div>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Password
                  </strong>

                  <span>
                    Change your account password.
                  </span>

                </div>


                <Link
                  to="/change-password"
                  className="btn btn-secondary"
                >
                  Change Password
                </Link>

              </div>

            </div>


            {/* NOTIFICATIONS */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    Notifications
                  </h2>

                  <p>
                    Choose which notifications
                    you want to receive.
                  </p>

                </div>

              </div>


              {/* ORDER UPDATES */}

              <div className="settings-toggle">

                <div>

                  <strong>
                    Order Updates
                  </strong>

                  <span>
                    Get updates about your orders.
                  </span>

                </div>


                <label className="settings-switch">

                  <input
                    type="checkbox"
                    checked={
                      preferences?.order_updates ??
                      false
                    }
                    disabled={
                      savingPreference ===
                      "order_updates"
                    }
                    onChange={(event) =>
                      handlePreferenceChange(
                        "order_updates",
                        event.target.checked
                      )
                    }
                  />

                  <span />

                </label>

              </div>


              {/* PROMOTIONS */}

              <div className="settings-toggle">

                <div>

                  <strong>
                    Promotions
                  </strong>

                  <span>
                    Receive special offers and deals.
                  </span>

                </div>


                <label className="settings-switch">

                  <input
                    type="checkbox"
                    checked={
                      preferences?.promotions ??
                      false
                    }
                    disabled={
                      savingPreference ===
                      "promotions"
                    }
                    onChange={(event) =>
                      handlePreferenceChange(
                        "promotions",
                        event.target.checked
                      )
                    }
                  />

                  <span />

                </label>

              </div>


              {/* EMAIL NOTIFICATIONS */}

              <div className="settings-toggle">

                <div>

                  <strong>
                    Email Notifications
                  </strong>

                  <span>
                    Receive important updates
                    by email.
                  </span>

                </div>


                <label className="settings-switch">

                  <input
                    type="checkbox"
                    checked={
                      preferences?.email_notifications ??
                      false
                    }
                    disabled={
                      savingPreference ===
                      "email_notifications"
                    }
                    onChange={(event) =>
                      handlePreferenceChange(
                        "email_notifications",
                        event.target.checked
                      )
                    }
                  />

                  <span />

                </label>

              </div>


              {/* PUSH NOTIFICATIONS */}

              <div className="settings-toggle">

                <div>

                  <strong>
                    Push Notifications
                  </strong>

                  <span>
                    Receive notifications from
                    the store.
                  </span>

                </div>


                <label className="settings-switch">

                  <input
                    type="checkbox"
                    checked={
                      preferences?.push_notifications ??
                      false
                    }
                    disabled={
                      savingPreference ===
                      "push_notifications"
                    }
                    onChange={(event) =>
                      handlePreferenceChange(
                        "push_notifications",
                        event.target.checked
                      )
                    }
                  />

                  <span />

                </label>

              </div>

            </div>


            {/* APPEARANCE */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    Appearance
                  </h2>

                  <p>
                    Customize how the store
                    looks for you.
                  </p>

                </div>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Theme
                  </strong>

                  <span>
                    Choose your preferred
                    appearance.
                  </span>

                </div>


                <select
                  value={theme}
                  onChange={(event) =>
                    setTheme(
                      event.target.value
                    )
                  }
                >

                  <option value="system">
                    System
                  </option>

                  <option value="light">
                    Light
                  </option>

                  <option value="dark">
                    Dark
                  </option>

                </select>

              </div>

            </div>


            {/* SHOPPING */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    Shopping
                  </h2>

                  <p>
                    Manage your shopping
                    preferences.
                  </p>

                </div>

              </div>


              {/* ORDER HISTORY */}

              <div className="settings-option">

                <div>

                  <strong>
                    Order History
                  </strong>

                  <span>
                    View your previous orders
                    and purchases.
                  </span>

                </div>


                <Link
                  to="/orders"
                  className="btn btn-secondary"
                >
                  My Orders
                </Link>

              </div>


              {/* WISHLIST */}

              <div className="settings-option">

                <div>

                  <strong>
                    Wishlist
                  </strong>

                  <span>
                    View products you have
                    saved.
                  </span>

                </div>


                <Link
                  to="/wishlist"
                  className="btn btn-secondary"
                >
                  My Wishlist
                </Link>

              </div>

            </div>


            {/* AI PREFERENCES */}

            <div className="settings-card">

              <div className="settings-card-heading">

                <div>

                  <h2>
                    AI Preferences
                  </h2>

                  <p>
                    Control your AI shopping
                    experience.
                  </p>

                </div>

              </div>


              {/* AI SHOPPING ASSISTANT */}

              <div className="settings-toggle">

                <div>

                  <strong>
                    AI Shopping Assistant
                  </strong>

                  <span>
                    Get personalized help
                    while shopping.
                  </span>

                </div>


                <label className="settings-switch">

                  <input
                    type="checkbox"
                    checked={aiAssistant}
                    onChange={
                      handleAiAssistantChange
                    }
                  />

                  <span />

                </label>

              </div>


              {/* PRODUCT RECOMMENDATIONS */}

              <div className="settings-toggle">

                <div>

                  <strong>
                    Product Recommendations
                  </strong>

                  <span>
                    Allow AI to suggest
                    relevant products.
                  </span>

                </div>


                <label className="settings-switch">

                  <input
                    type="checkbox"
                    checked={
                      productRecommendations
                    }
                    onChange={
                      handleProductRecommendationsChange
                    }
                  />

                  <span />

                </label>

              </div>

            </div>


            {/* ACCOUNT ACTIONS */}

            <div className="settings-card danger-card">

              <div>

                <h2>
                  Account Actions
                </h2>

                <p>
                  Manage important account
                  actions.
                </p>

              </div>


              <Link
                to="/profile"
                className="settings-danger-button"
              >
                Manage Account
              </Link>

            </div>


          </section>

        </div>

      </div>

    </main>
  );
}


export default Settings;