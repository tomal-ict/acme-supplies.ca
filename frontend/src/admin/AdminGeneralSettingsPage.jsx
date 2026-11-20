import { useEffect, useState } from "react";
import {
  adminCreateUser,
  adminDeleteUser,
  adminGetSeo,
  adminGetSettings,
  adminGetUsers,
  adminTestSmtp,
  adminUpdateSeo,
  adminUpdateSettings,
  adminUpdateUser,
} from "../adminApi";

export default function AdminGeneralSettingsPage({ onToast, initialTab = "plugin" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Synchronize when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Settings State
  const [settings, setSettings] = useState({
    // General Site Info
    site_name: "AMIDA OFFICE SUPPLIES LIMITED",
    site_tagline: "Price Quality Service",
    site_url: "https://www.acme-supplies.ca",
    ceo_name: "Swapan Kumar Bairagi",
    ceo_title: "Chief Executive Officer (CEO)",
    contact_address: "126 Main Street, Acme, AB T0M 0A0, Canada",
    contact_phone: "+1 604 316 8138",
    contact_email: "acme.info.swapan@gmail.com",
    currency: "USD",
    timezone: "America/Edmonton",
    date_format: "Y-m-d H:i:s",

    // Delivery & Shipping
    delivery_charge_inside: "60",
    delivery_charge_outside: "120",
    free_shipping_threshold: "5000",
    free_shipping_enabled: "1",
    shipping_policy: "Express Delivery: 24-48 hours inside city, 48-72 hours nationwide.",

    // Order Pause
    order_pause_enabled: "0",
    order_pause_until: "",
    order_pause_message: "Dear Valued Customer, our factory and storefront ordering system is temporarily paused for queue processing. Orders will resume shortly. We apologize for any inconvenience.",

    // SMTP
    smtp_enabled: "1",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_encryption: "tls",
    smtp_username: "",
    smtp_password: "",
    smtp_from_name: "AMIDA OFFICE SUPPLIES LIMITED",
    smtp_from_email: "acme.info.swapan@gmail.com",
    admin_notify_email: "admin@acme.com",
    autoresponder_enabled: "1",
    autoresponder_subject: "Welcome to AMIDA OFFICE SUPPLIES LIMITED - Request Received",
    autoresponder_body: "",

    // Language & Localization
    default_language: "English",
    available_languages: "English, French, Bengali",
    rtl_direction: "0",

    // Static Pages Content
    page_about_title: "About AMIDA Supplies Limited",
    page_about_content: "AMIDA OFFICE SUPPLIES LIMITED is a premier supplier of industrial stationery, printer toners, premium copier paper, and office supplies in Acme, Alberta.",
    page_privacy_title: "Privacy Policy",
    page_privacy_content: "We take customer data confidentiality and transaction safety very seriously under Canadian commercial privacy standards.",
    page_terms_title: "Terms and Conditions",
    page_terms_content: "All orders placed are subject to product availability and standard corporate trading guidelines.",
    page_return_title: "Return and Refund Policy",
    page_return_content: "Damaged or incorrect shipments must be reported within 7 business days of delivery for a full replacement or refund.",

    // SMS Gateway
    sms_provider: "twilio",
    sms_twilio_sid: "",
    sms_twilio_token: "",
    sms_twilio_from: "",
    sms_order_template: "Dear {customer_name}, your AMIDA order #{order_id} of ${total} is confirmed. Thank you!",

    // Notification Toggles (NO sound tune)
    notif_order_placed: "1",
    notif_low_stock: "1",
    notif_inquiry_received: "1",
    notif_customer_receipt: "1",
    notif_customer_dispatch: "1",

    // Third Party Plugins
    plugin_tawk_active: "0",
    plugin_tawk_property_id: "",
    plugin_tawk_widget_id: "",

    plugin_recaptcha_active: "0",
    plugin_recaptcha_site_key: "",
    plugin_recaptcha_secret_key: "",

    plugin_google_analytics_active: "0",
    plugin_google_analytics_id: "",

    plugin_facebook_messenger_active: "0",
    plugin_facebook_page_id: "",
    plugin_facebook_app_id: "",

    plugin_reloadly_active: "0",
    plugin_reloadly_client_id: "",
    plugin_reloadly_client_secret: "",

    plugin_tpaga_active: "0",
    plugin_tpaga_api_key: "",

    plugin_twilio_sms_active: "0",
    plugin_twilio_sid: "",
    plugin_twilio_token: "",
    plugin_twilio_from: "",

    plugin_whatsapp_active: "0",
    plugin_whatsapp_number: "+1 604 316 8138",
    plugin_whatsapp_message: "Hello AMIDA Supplies, I would like to inquire about office products.",

    plugin_custom_script_active: "0",
    plugin_header_script: "",
    plugin_footer_script: "",
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "admin",
    is_active: true,
    permissions: ["products.manage", "inquiries.manage"],
  });

  // SMTP Test State
  const [testEmail, setTestEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // SEO State
  const [seo, setSeo] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    google_tag_manager_id: "",
    google_analytics_id: "",
    google_search_console_code: "",
    robots_txt: "",
    sitemap_enabled: "1",
  });

  // Active Plugin Modal State
  const [activePluginModal, setActivePluginModal] = useState(null);

  // Site Settings Sub-Tab (General vs Pause vs Shipping vs Users)
  const [siteSubTab, setSiteSubTab] = useState("company");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [resSet, resUsr, resSeo] = await Promise.all([
        adminGetSettings(),
        adminGetUsers(),
        adminGetSeo(),
      ]);

      if (resSet.success && resSet.settings) {
        setSettings((prev) => ({ ...prev, ...resSet.settings }));
      }
      if (resUsr.success && resUsr.users) {
        setUsers(resUsr.users);
      }
      if (resSeo.success && resSeo.seo) {
        setSeo((prev) => ({ ...prev, ...resSeo.seo }));
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveSettings = async (group = "general", customToast = null) => {
    try {
      const res = await adminUpdateSettings(settings, group);
      if (res.success) {
        onToast(customToast || `${group.toUpperCase()} settings updated successfully!`, "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleSaveSeo = async (e) => {
    e.preventDefault();
    try {
      const res = await adminUpdateSeo(seo);
      if (res.success) {
        onToast("SEO and Google Marketing settings updated!", "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleTestSmtp = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      onToast("Please enter an email address to send the test message to", "error");
      return;
    }
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await adminTestSmtp({
        test_email: testEmail,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_encryption: settings.smtp_encryption,
        smtp_username: settings.smtp_username,
        smtp_password: settings.smtp_password,
        smtp_from_name: settings.smtp_from_name,
        smtp_from_email: settings.smtp_from_email,
      });
      setTestResult(res);
      if (res.success) {
        onToast(res.message, "success");
      } else {
        onToast(res.message, "error");
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      onToast(err.message, "error");
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (userModal === "create") {
        const res = await adminCreateUser(userForm);
        if (res.success) {
          onToast("User account created successfully!", "success");
          setUserModal(null);
          loadAll();
        }
      } else if (userModal === "edit") {
        const payload = { ...userForm };
        if (!payload.password) delete payload.password;
        const res = await adminUpdateUser(currentUser.id, payload);
        if (res.success) {
          onToast("User account updated successfully!", "success");
          setUserModal(null);
          loadAll();
        }
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this administrator account?")) return;
    try {
      const res = await adminDeleteUser(userId);
      if (res.success) {
        onToast("User account deleted successfully!", "success");
        loadAll();
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  // Third Party Plugins Registry (matching the screenshot exactly)
  const pluginRegistry = [
    {
      id: "tawk",
      name: "Tawk Chat",
      subtitle: "Free Instant Messaging system",
      icon: "🦜",
      activeKey: "plugin_tawk_active",
      fields: [
        { key: "plugin_tawk_property_id", label: "Property ID", placeholder: "e.g. 6428c04e31ebfa0fe7f5xxxx" },
        { key: "plugin_tawk_widget_id", label: "Widget ID", placeholder: "e.g. 1gttxxxxx" },
      ],
      description: "Direct real-time customer messaging widget shown at the bottom corner of your storefront.",
    },
    {
      id: "recaptcha",
      name: "Google reCaptcha",
      subtitle: "reCAPTCHA protects your website from fraud and abuse without creating friction",
      icon: "🛡️",
      activeKey: "plugin_recaptcha_active",
      fields: [
        { key: "plugin_recaptcha_site_key", label: "Site Key (Public)", placeholder: "e.g. 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
        { key: "plugin_recaptcha_secret_key", label: "Secret Key (Private)", placeholder: "e.g. 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
      ],
      description: "Google security service that verifies human interactions and protects checkout and inquiry forms.",
    },
    {
      id: "analytics",
      name: "Google Analytics",
      subtitle: "Analytics will help you to collect data for your website",
      icon: "📊",
      activeKey: "plugin_google_analytics_active",
      fields: [
        { key: "plugin_google_analytics_id", label: "Measurement ID (GA4)", placeholder: "e.g. G-XXXXXXXXXX" },
      ],
      description: "Google Analytics 4 collects storefront visitor traffic, page views, and conversion metrics.",
    },
    {
      id: "messenger",
      name: "Facebook Messenger",
      subtitle: "Messenger is a proprietary instant messaging app and platform developed by Meta",
      icon: "💬",
      activeKey: "plugin_facebook_messenger_active",
      fields: [
        { key: "plugin_facebook_page_id", label: "Facebook Page ID", placeholder: "e.g. 102938475610293" },
        { key: "plugin_facebook_app_id", label: "Meta App ID (Optional)", placeholder: "e.g. 9876543210" },
      ],
      description: "Meta Messenger chat plugin connects customer inquiries directly to your Facebook Page inbox.",
    },
    {
      id: "reloadly",
      name: "Reloadly",
      subtitle: "Payment APIs for Utility Payments Made Easy",
      icon: "💳",
      activeKey: "plugin_reloadly_active",
      fields: [
        { key: "plugin_reloadly_client_id", label: "Client ID", placeholder: "Enter Reloadly Client ID" },
        { key: "plugin_reloadly_client_secret", label: "Client Secret", placeholder: "Enter Reloadly Client Secret" },
      ],
      description: "Automated billing and utility payment gateway integration.",
    },
    {
      id: "tpaga",
      name: "Tpaga",
      subtitle: "Tpaga has hundreds of partners nationwide where you can pay your bills and credits",
      icon: "🏦",
      activeKey: "plugin_tpaga_active",
      fields: [
        { key: "plugin_tpaga_api_key", label: "API Key / Merchant Token", placeholder: "Enter Tpaga API Key" },
      ],
      description: "Digital mobile wallet and payment processing partner system.",
    },
    {
      id: "twilio",
      name: "Twilio SMS Gateway",
      subtitle: "Automated transactional SMS gateway for customer orders, dispatches & OTP alerts",
      icon: "📱",
      activeKey: "plugin_twilio_sms_active",
      fields: [
        { key: "plugin_twilio_sid", label: "Account SID", placeholder: "e.g. ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
        { key: "plugin_twilio_token", label: "Auth Token", placeholder: "e.g. your_auth_token_here" },
        { key: "plugin_twilio_from", label: "From Phone Number / Sender ID", placeholder: "e.g. +16043168138 or AMIDA" },
      ],
      description: "Sends automated SMS messages to customers when orders are confirmed or dispatched.",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Floating Chat",
      subtitle: "Floating customer support widget for direct WhatsApp inquiries and instant orders",
      icon: "🟢",
      activeKey: "plugin_whatsapp_active",
      fields: [
        { key: "plugin_whatsapp_number", label: "WhatsApp Phone Number (with Country Code)", placeholder: "+16043168138" },
        { key: "plugin_whatsapp_message", label: "Default Greeting Message", placeholder: "Hello AMIDA, I would like to inquire about products." },
      ],
      description: "Displays a floating WhatsApp icon on storefront pages for direct chat with your sales team.",
    },
    {
      id: "custom_script",
      name: "Custom Scripts & Webhooks",
      subtitle: "Inject custom header, body, or footer scripts for advertising tags and tracking",
      icon: "💻",
      activeKey: "plugin_custom_script_active",
      fields: [
        { key: "plugin_header_script", label: "Header Scripts (<head>)", type: "textarea", placeholder: "<script>/* Custom header script */</script>" },
        { key: "plugin_footer_script", label: "Footer Scripts (before </body>)", type: "textarea", placeholder: "<script>/* Custom footer script */</script>" },
      ],
      description: "Allows raw script injection for custom tracking pixels, hotjar, or third-party webhooks.",
    },
  ];

  // Quick toggle status inside plugin modal or direct row
  const togglePluginStatus = (activeKey) => {
    const newVal = settings[activeKey] === "1" ? "0" : "1";
    setSettings((prev) => ({ ...prev, [activeKey]: newVal }));
  };

  const getPageHeaderTitle = () => {
    const titles = {
      site: "Site Settings",
      email: "Email Settings",
      seo: "SEO Meta Settings",
      language: "Language Settings",
      page: "Page Settings",
      plugin: "Plugin Settings",
      sms: "SMS Gateway Settings",
      notification: "Notification Settings",
    };
    return titles[activeTab] || "System Settings";
  };

  if (loading) {
    return (
      <div className="adm-loading-state">
        <div className="adm-spinner" />
        <p>Loading enterprise configurations...</p>
      </div>
    );
  }

  return (
    <div className="adm-settings-container">
      {/* Page Title matching reference image */}
      <div className="adm-page-title-row">
        <h1 className="adm-page-main-heading">{getPageHeaderTitle()}</h1>
      </div>

      {/* Horizontal Settings Tabs Bar matching reference image */}
      <div className="adm-settings-pill-nav">
        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "site" ? "active" : ""}`}
          onClick={() => setActiveTab("site")}
        >
          <span className="adm-pill-icon">⚙️</span>
          <span>Site Settings</span>
        </button>

        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "email" ? "active" : ""}`}
          onClick={() => setActiveTab("email")}
        >
          <span className="adm-pill-icon">✉️</span>
          <span>Email</span>
        </button>

        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "seo" ? "active" : ""}`}
          onClick={() => setActiveTab("seo")}
        >
          <span className="adm-pill-icon">🔍</span>
          <span>SEO Meta</span>
        </button>

        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "language" ? "active" : ""}`}
          onClick={() => setActiveTab("language")}
        >
          <span className="adm-pill-icon">文A</span>
          <span>Language</span>
        </button>

        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "page" ? "active" : ""}`}
          onClick={() => setActiveTab("page")}
        >
          <span className="adm-pill-icon">📄</span>
          <span>Page</span>
        </button>

        {/* Plugin Tab: Active in screenshot with deep purple highlight */}
        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "plugin" ? "active" : ""}`}
          onClick={() => setActiveTab("plugin")}
        >
          <span className="adm-pill-icon">🔌</span>
          <span>Plugin</span>
        </button>

        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "sms" ? "active" : ""}`}
          onClick={() => setActiveTab("sms")}
        >
          <span className="adm-pill-icon">💬</span>
          <span>SMS</span>
        </button>

        {/* Notification Tab without sound tune */}
        <button
          type="button"
          className={`adm-nav-pill-btn ${activeTab === "notification" ? "active" : ""}`}
          onClick={() => setActiveTab("notification")}
        >
          <span className="adm-pill-icon">🔔</span>
          <span>Notification</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: THIRD PARTY SYSTEM PLUGINS (Exact visual match with screenshot)  */}
      {/* ========================================================================= */}
      {activeTab === "plugin" && (
        <div className="adm-plugins-card">
          <div className="adm-plugins-card-header">
            <h2 className="adm-plugins-card-title">Third Party System Plugins</h2>
            <div className="adm-plugins-info-banner">
              <span className="adm-info-icon">⚠️</span>
              <span>You can Enable or Disable any of the plugin</span>
            </div>
          </div>

          <div className="adm-plugins-list">
            {pluginRegistry.map((p) => {
              const isActivated = settings[p.activeKey] === "1";
              return (
                <div key={p.id} className="adm-plugin-row">
                  <div className="adm-plugin-left">
                    <div className="adm-plugin-icon-box">
                      <span className="adm-plugin-symbol">{p.icon}</span>
                    </div>
                    <div className="adm-plugin-details">
                      <h3 className="adm-plugin-name">{p.name}</h3>
                      <p className="adm-plugin-subtitle">{p.subtitle}</p>
                    </div>
                  </div>

                  <div className="adm-plugin-right">
                    {/* Status Badge */}
                    <span className={`adm-plugin-badge ${isActivated ? "activated" : "deactivated"}`}>
                      {isActivated ? "Activated" : "DeActivated"}
                    </span>

                    {/* Circular Purple Configure Button */}
                    <button
                      type="button"
                      className="adm-btn-configure-purple"
                      onClick={() => setActivePluginModal(p)}
                      title={`Configure ${p.name}`}
                    >
                      🎛️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SITE SETTINGS (Company, Order Pause, Delivery Charges, Users)      */}
      {/* ========================================================================= */}
      {activeTab === "site" && (
        <div className="adm-site-settings-view">
          {/* Sub Navigation */}
          <div className="adm-subtabs-row">
            <button
              type="button"
              className={`adm-subtab-btn ${siteSubTab === "company" ? "active" : ""}`}
              onClick={() => setSiteSubTab("company")}
            >
              🏢 Company Information
            </button>
            <button
              type="button"
              className={`adm-subtab-btn ${siteSubTab === "pause" ? "active" : ""}`}
              onClick={() => setSiteSubTab("pause")}
            >
              ⏸️ Order Pause System {settings.order_pause_enabled === "1" && "🔴"}
            </button>
            <button
              type="button"
              className={`adm-subtab-btn ${siteSubTab === "delivery" ? "active" : ""}`}
              onClick={() => setSiteSubTab("delivery")}
            >
              🚚 Delivery &amp; Shipping Rates
            </button>
            <button
              type="button"
              className={`adm-subtab-btn ${siteSubTab === "users" ? "active" : ""}`}
              onClick={() => setSiteSubTab("users")}
            >
              👥 Admin Team ({users.length})
            </button>
          </div>

          {/* Sub Tab: Company Profile */}
          {siteSubTab === "company" && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div>
                  <h3 className="adm-card-title">Company Profile &amp; Contact Details</h3>
                  <p className="adm-card-subtitle">Displayed across invoices, vouchers, header, and storefront footer</p>
                </div>
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => handleSaveSettings("general")}
                >
                  Save Changes
                </button>
              </div>

              <div className="adm-form-grid">
                <div className="adm-form-group">
                  <label>Company Legal Name *</label>
                  <input
                    type="text"
                    value={settings.site_name || ""}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Tagline / Motto</label>
                  <input
                    type="text"
                    value={settings.site_tagline || ""}
                    onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>CEO / Managing Director Name</label>
                  <input
                    type="text"
                    value={settings.ceo_name || ""}
                    onChange={(e) => setSettings({ ...settings, ceo_name: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>CEO Title / Designation</label>
                  <input
                    type="text"
                    value={settings.ceo_title || ""}
                    onChange={(e) => setSettings({ ...settings, ceo_title: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Official Contact Phone</label>
                  <input
                    type="text"
                    value={settings.contact_phone || ""}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Customer Support Email</label>
                  <input
                    type="email"
                    value={settings.contact_email || ""}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
                <div className="adm-form-group full-width">
                  <label>Corporate Head Office Address</label>
                  <textarea
                    rows={2}
                    value={settings.contact_address || ""}
                    onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Order Pause System */}
          {siteSubTab === "pause" && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div>
                  <h3 className="adm-card-title">Order Push &amp; Temporary Pause System</h3>
                  <p className="adm-card-subtitle">
                    Temporarily stop incoming customer orders with a timer countdown and welcoming notice message.
                  </p>
                </div>
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => handleSaveSettings("orders", "Order pause system settings updated!")}
                >
                  Save Pause Settings
                </button>
              </div>

              <div className="adm-pause-config-box">
                <div className="adm-pause-switch-row">
                  <div>
                    <strong>Order Pause Status:</strong>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
                      When enabled, checkout and "Confirm Order" buttons will display the welcoming maintenance notice.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`adm-status-toggle-btn ${settings.order_pause_enabled === "1" ? "active" : ""}`}
                    onClick={() =>
                      setSettings({
                        ...settings,
                        order_pause_enabled: settings.order_pause_enabled === "1" ? "0" : "1",
                      })
                    }
                  >
                    {settings.order_pause_enabled === "1" ? "PAUSED (Orders Blocked)" : "ACTIVE (Orders Allowed)"}
                  </button>
                </div>

                <div className="adm-form-group" style={{ marginTop: "16px" }}>
                  <label>Pause Until Specific Date &amp; Time (Countdown Timer)</label>
                  <input
                    type="datetime-local"
                    value={settings.order_pause_until || ""}
                    onChange={(e) => setSettings({ ...settings, order_pause_until: e.target.value })}
                  />
                  <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>
                    Leave blank to pause indefinitely until manually turned back on.
                  </small>
                </div>

                <div className="adm-form-group" style={{ marginTop: "16px" }}>
                  <label>Customer Welcome &amp; Maintenance Notice Message</label>
                  <textarea
                    rows={4}
                    value={settings.order_pause_message || ""}
                    onChange={(e) => setSettings({ ...settings, order_pause_message: e.target.value })}
                    placeholder="Enter the welcoming message explaining why orders are paused and when service will resume..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Delivery & Shipping Rates */}
          {siteSubTab === "delivery" && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div>
                  <h3 className="adm-card-title">Delivery Charges &amp; Free Shipping Rules</h3>
                  <p className="adm-card-subtitle">Configure flat delivery fees applied at checkout and free shipping threshold</p>
                </div>
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => handleSaveSettings("shipping", "Shipping charges updated successfully!")}
                >
                  Save Delivery Rates
                </button>
              </div>

              <div className="adm-form-grid">
                <div className="adm-form-group">
                  <label>Inside City Delivery Charge ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.delivery_charge_inside || "60"}
                    onChange={(e) => setSettings({ ...settings, delivery_charge_inside: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Outside City / Nationwide Delivery Charge ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.delivery_charge_outside || "120"}
                    onChange={(e) => setSettings({ ...settings, delivery_charge_outside: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Free Shipping Minimum Order Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.free_shipping_threshold || "5000"}
                    onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Enable Free Shipping Rule</label>
                  <select
                    value={settings.free_shipping_enabled || "1"}
                    onChange={(e) => setSettings({ ...settings, free_shipping_enabled: e.target.value })}
                  >
                    <option value="1">Enabled (Free delivery over threshold)</option>
                    <option value="0">Disabled (Always charge shipping)</option>
                  </select>
                </div>
                <div className="adm-form-group full-width">
                  <label>Storefront Shipping Policy Note</label>
                  <textarea
                    rows={2}
                    value={settings.shipping_policy || ""}
                    onChange={(e) => setSettings({ ...settings, shipping_policy: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Admin Users Management */}
          {siteSubTab === "users" && (
            <div className="adm-card">
              <div className="adm-card-header">
                <div>
                  <h3 className="adm-card-title">Authorized Admin Users</h3>
                  <p className="adm-card-subtitle">Manage administrative team members and access roles</p>
                </div>
                <button
                  type="button"
                  className="adm-btn-primary"
                  onClick={() => {
                    setCurrentUser(null);
                    setUserForm({
                      name: "",
                      username: "",
                      email: "",
                      password: "",
                      role: "admin",
                      is_active: true,
                      permissions: ["products.manage", "inquiries.manage"],
                    });
                    setUserModal("create");
                  }}
                >
                  + Add New Admin User
                </button>
              </div>

              <div className="adm-table-container">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.name}</strong>
                        </td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className="adm-badge adm-badge-blue">{u.role}</span>
                        </td>
                        <td>
                          <span className={`adm-badge ${u.is_active ? "adm-badge-green" : "adm-badge-red"}`}>
                            {u.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="adm-btn-edit-sm"
                              onClick={() => {
                                setCurrentUser(u);
                                setUserForm({
                                  name: u.name,
                                  username: u.username,
                                  email: u.email,
                                  password: "",
                                  role: u.role,
                                  is_active: !!u.is_active,
                                  permissions: u.permissions || [],
                                });
                                setUserModal("edit");
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="adm-btn-delete-sm"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMAIL (SMTP) SETTINGS                                              */}
      {/* ========================================================================= */}
      {activeTab === "email" && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">SMTP Mail Server &amp; Gateway Configuration</h3>
              <p className="adm-card-subtitle">Deliver automated order vouchers, inquiry replies, and customer notices</p>
            </div>
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => handleSaveSettings("smtp", "SMTP Mail settings saved successfully!")}
            >
              Save SMTP Settings
            </button>
          </div>

          <div className="adm-form-grid">
            <div className="adm-form-group">
              <label>SMTP Host</label>
              <input
                type="text"
                value={settings.smtp_host || ""}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="adm-form-group">
              <label>SMTP Port</label>
              <input
                type="text"
                value={settings.smtp_port || "587"}
                onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                placeholder="587"
              />
            </div>
            <div className="adm-form-group">
              <label>Encryption</label>
              <select
                value={settings.smtp_encryption || "tls"}
                onChange={(e) => setSettings({ ...settings, smtp_encryption: e.target.value })}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="adm-form-group">
              <label>SMTP Username / Email</label>
              <input
                type="text"
                value={settings.smtp_username || ""}
                onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label>SMTP Password / App Password</label>
              <input
                type="password"
                value={settings.smtp_password || ""}
                onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label>Sender From Name</label>
              <input
                type="text"
                value={settings.smtp_from_name || ""}
                onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label>Sender From Email</label>
              <input
                type="email"
                value={settings.smtp_from_email || ""}
                onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label>Admin Notification Recipient Email</label>
              <input
                type="email"
                value={settings.admin_notify_email || ""}
                onChange={(e) => setSettings({ ...settings, admin_notify_email: e.target.value })}
              />
            </div>
          </div>

          {/* Test Email Section */}
          <div className="adm-test-email-box" style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 8px", color: "#1e293b" }}>Send Test Email</h4>
            <div style={{ display: "flex", gap: "10px", maxWidth: "600px" }}>
              <input
                type="email"
                placeholder="Enter recipient email (e.g. your email)"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="adm-btn-secondary"
                disabled={testingSmtp}
                onClick={handleTestSmtp}
              >
                {testingSmtp ? "Sending..." : "Send Test"}
              </button>
            </div>
            {testResult && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: testResult.success ? "#dcfce7" : "#fee2e2",
                  color: testResult.success ? "#15803d" : "#b91c1c",
                }}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SEO META SETTINGS                                                  */}
      {/* ========================================================================= */}
      {activeTab === "seo" && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">SEO Meta Tags &amp; Search Engine Indexing</h3>
              <p className="adm-card-subtitle">Boost Google search rankings, meta descriptions, and sitemap indexing</p>
            </div>
            <button type="button" className="adm-btn-primary" onClick={handleSaveSeo}>
              Save SEO Settings
            </button>
          </div>

          <div className="adm-form-grid">
            <div className="adm-form-group full-width">
              <label>Default Page Meta Title</label>
              <input
                type="text"
                value={seo.meta_title || ""}
                onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
                placeholder="AMIDA Office Supplies Limited - Industrial Toner & Stationery"
              />
            </div>
            <div className="adm-form-group full-width">
              <label>Meta Description</label>
              <textarea
                rows={3}
                value={seo.meta_description || ""}
                onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                placeholder="Leading supplier of office equipment, toners, copiers, paper, and school supplies..."
              />
            </div>
            <div className="adm-form-group full-width">
              <label>Meta Keywords (Comma separated)</label>
              <input
                type="text"
                value={seo.meta_keywords || ""}
                onChange={(e) => setSeo({ ...seo, meta_keywords: e.target.value })}
                placeholder="toner, copier, paper, stationery, office supplies, canada"
              />
            </div>
            <div className="adm-form-group">
              <label>Google Tag Manager Container ID</label>
              <input
                type="text"
                value={seo.google_tag_manager_id || ""}
                onChange={(e) => setSeo({ ...seo, google_tag_manager_id: e.target.value })}
                placeholder="GTM-XXXXXXX"
              />
            </div>
            <div className="adm-form-group">
              <label>Google Search Console Verification Meta Code</label>
              <input
                type="text"
                value={seo.google_search_console_code || ""}
                onChange={(e) => setSeo({ ...seo, google_search_console_code: e.target.value })}
                placeholder="google-site-verification=..."
              />
            </div>
            <div className="adm-form-group full-width">
              <label>Robots.txt Content</label>
              <textarea
                rows={3}
                value={seo.robots_txt || ""}
                onChange={(e) => setSeo({ ...seo, robots_txt: e.target.value })}
                placeholder="User-agent: *&#10;Disallow: /myadmin"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LANGUAGE SETTINGS                                                  */}
      {/* ========================================================================= */}
      {activeTab === "language" && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Language &amp; Internationalization</h3>
              <p className="adm-card-subtitle">Set default platform language and configure international locale switcher</p>
            </div>
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => handleSaveSettings("language", "Language preferences updated!")}
            >
              Save Language Settings
            </button>
          </div>

          <div className="adm-form-grid">
            <div className="adm-form-group">
              <label>System Default Language</label>
              <select
                value={settings.default_language || "English"}
                onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
              >
                <option value="English">English (United States / Canada)</option>
                <option value="English (UK)">English (United Kingdom)</option>
                <option value="French">French (Français)</option>
              </select>
            </div>
            <div className="adm-form-group">
              <label>Text Layout Direction</label>
              <select
                value={settings.rtl_direction || "0"}
                onChange={(e) => setSettings({ ...settings, rtl_direction: e.target.value })}
              >
                <option value="0">LTR (Left to Right - Standard)</option>
                <option value="1">RTL (Right to Left - Arabic / Hebrew)</option>
              </select>
            </div>
            <div className="adm-form-group full-width">
              <label>Active Languages Enabled for Storefront Customers</label>
              <input
                type="text"
                value={settings.available_languages || "English, French"}
                onChange={(e) => setSettings({ ...settings, available_languages: e.target.value })}
              />
              <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>
                Comma separated list of languages shown in the top header language selector dropdown.
              </small>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PAGE SETTINGS (Static Storefront Pages)                            */}
      {/* ========================================================================= */}
      {activeTab === "page" && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">Static Content &amp; Policy Pages</h3>
              <p className="adm-card-subtitle">Manage pages linked in header and footer (About Us, Privacy, Terms, Return Policy)</p>
            </div>
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => handleSaveSettings("pages", "Static pages content saved successfully!")}
            >
              Save Pages
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="adm-form-group full-width">
              <label>About Us Page Title</label>
              <input
                type="text"
                value={settings.page_about_title || ""}
                onChange={(e) => setSettings({ ...settings, page_about_title: e.target.value })}
              />
              <label style={{ marginTop: "8px" }}>About Us Page Content</label>
              <textarea
                rows={3}
                value={settings.page_about_content || ""}
                onChange={(e) => setSettings({ ...settings, page_about_content: e.target.value })}
              />
            </div>

            <div className="adm-form-group full-width">
              <label>Privacy Policy Page Title</label>
              <input
                type="text"
                value={settings.page_privacy_title || ""}
                onChange={(e) => setSettings({ ...settings, page_privacy_title: e.target.value })}
              />
              <label style={{ marginTop: "8px" }}>Privacy Policy Page Content</label>
              <textarea
                rows={3}
                value={settings.page_privacy_content || ""}
                onChange={(e) => setSettings({ ...settings, page_privacy_content: e.target.value })}
              />
            </div>

            <div className="adm-form-group full-width">
              <label>Terms &amp; Conditions Page Title</label>
              <input
                type="text"
                value={settings.page_terms_title || ""}
                onChange={(e) => setSettings({ ...settings, page_terms_title: e.target.value })}
              />
              <label style={{ marginTop: "8px" }}>Terms &amp; Conditions Page Content</label>
              <textarea
                rows={3}
                value={settings.page_terms_content || ""}
                onChange={(e) => setSettings({ ...settings, page_terms_content: e.target.value })}
              />
            </div>

            <div className="adm-form-group full-width">
              <label>Return &amp; Refund Policy Page Title</label>
              <input
                type="text"
                value={settings.page_return_title || ""}
                onChange={(e) => setSettings({ ...settings, page_return_title: e.target.value })}
              />
              <label style={{ marginTop: "8px" }}>Return &amp; Refund Policy Content</label>
              <textarea
                rows={3}
                value={settings.page_return_content || ""}
                onChange={(e) => setSettings({ ...settings, page_return_content: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SMS GATEWAY SETTINGS                                               */}
      {/* ========================================================================= */}
      {activeTab === "sms" && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">SMS Gateway &amp; Automated Order Notifications</h3>
              <p className="adm-card-subtitle">Connect SMS provider to dispatch text message alerts to clients</p>
            </div>
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => handleSaveSettings("sms", "SMS Gateway settings saved!")}
            >
              Save SMS Settings
            </button>
          </div>

          <div className="adm-form-grid">
            <div className="adm-form-group">
              <label>SMS Provider</label>
              <select
                value={settings.sms_provider || "twilio"}
                onChange={(e) => setSettings({ ...settings, sms_provider: e.target.value })}
              >
                <option value="twilio">Twilio Cloud Communications</option>
                <option value="custom">Generic HTTP SMS API</option>
              </select>
            </div>
            <div className="adm-form-group">
              <label>Twilio Account SID</label>
              <input
                type="text"
                value={settings.sms_twilio_sid || ""}
                onChange={(e) => setSettings({ ...settings, sms_twilio_sid: e.target.value })}
                placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
            </div>
            <div className="adm-form-group">
              <label>Twilio Auth Token</label>
              <input
                type="password"
                value={settings.sms_twilio_token || ""}
                onChange={(e) => setSettings({ ...settings, sms_twilio_token: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label>Sender Phone Number / Sender ID</label>
              <input
                type="text"
                value={settings.sms_twilio_from || ""}
                onChange={(e) => setSettings({ ...settings, sms_twilio_from: e.target.value })}
                placeholder="+16043168138"
              />
            </div>
            <div className="adm-form-group full-width">
              <label>Order Confirmation SMS Template</label>
              <textarea
                rows={2}
                value={settings.sms_order_template || ""}
                onChange={(e) => setSettings({ ...settings, sms_order_template: e.target.value })}
              />
              <small style={{ color: "#64748b", marginTop: "4px", display: "block" }}>
                Variables available: {"{customer_name}"}, {"{order_id}"}, {"{total}"}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: NOTIFICATION SETTINGS (User explicitly requested NO sound tune)    */}
      {/* ========================================================================= */}
      {activeTab === "notification" && (
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h3 className="adm-card-title">System &amp; Order Notifications</h3>
              <p className="adm-card-subtitle">Configure administrative email and dashboard alerts (Sound tune disabled)</p>
            </div>
            <button
              type="button"
              className="adm-btn-primary"
              onClick={() => handleSaveSettings("notifications", "Notification alerts updated successfully!")}
            >
              Save Notification Preferences
            </button>
          </div>

          <div className="adm-notif-toggles-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="adm-notif-toggle-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div>
                <strong>New Order Alert</strong>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Notify administrator whenever a customer confirms an order on the storefront.
                </p>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={settings.notif_order_placed === "1"}
                onChange={(e) => setSettings({ ...settings, notif_order_placed: e.target.checked ? "1" : "0" })}
              />
            </div>

            <div className="adm-notif-toggle-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div>
                <strong>Low Stock Alert</strong>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Alert administrator when a product inventory drops below 5 units.
                </p>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={settings.notif_low_stock === "1"}
                onChange={(e) => setSettings({ ...settings, notif_low_stock: e.target.checked ? "1" : "0" })}
              />
            </div>

            <div className="adm-notif-toggle-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div>
                <strong>Customer RFQ / Inquiry Alert</strong>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Notify team when a client sends an RFQ quotation request or contact inquiry.
                </p>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={settings.notif_inquiry_received === "1"}
                onChange={(e) => setSettings({ ...settings, notif_inquiry_received: e.target.checked ? "1" : "0" })}
              />
            </div>

            <div className="adm-notif-toggle-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div>
                <strong>Customer Order Confirmation Email</strong>
                <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Automatically send purchase receipt and invoice to customer upon checkout.
                </p>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={settings.notif_customer_receipt === "1"}
                onChange={(e) => setSettings({ ...settings, notif_customer_receipt: e.target.checked ? "1" : "0" })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLUGIN CONFIGURATION MODAL (Interactive for purple button)                */}
      {/* ========================================================================= */}
      {activePluginModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-plugin-config-modal">
            <div className="adm-plugin-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>{activePluginModal.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{activePluginModal.name} Configuration</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>{activePluginModal.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                className="adm-modal-close-btn"
                onClick={() => setActivePluginModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="adm-plugin-modal-body">
              {/* Status Switch */}
              <div className="adm-modal-status-box">
                <div>
                  <strong>Plugin Activation Status</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                    Enable or disable this integration on the live storefront.
                  </p>
                </div>
                <button
                  type="button"
                  className={`adm-status-toggle-btn ${settings[activePluginModal.activeKey] === "1" ? "active" : ""}`}
                  onClick={() => togglePluginStatus(activePluginModal.activeKey)}
                >
                  {settings[activePluginModal.activeKey] === "1" ? "Activated" : "DeActivated"}
                </button>
              </div>

              {/* Credential Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
                {activePluginModal.fields.map((f) => (
                  <div key={f.key} className="adm-form-group">
                    <label>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={settings[f.key] || ""}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <input
                        type="text"
                        value={settings[f.key] || ""}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="adm-modal-note-box">
                <span style={{ fontSize: "16px" }}>ℹ️</span>
                <span>{activePluginModal.description}</span>
              </div>
            </div>

            <div className="adm-plugin-modal-footer">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setActivePluginModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-primary"
                onClick={async () => {
                  await handleSaveSettings("plugins", `${activePluginModal.name} settings saved successfully!`);
                  setActivePluginModal(null);
                }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Create/Edit Modal */}
      {userModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal-content" style={{ maxWidth: "500px" }}>
            <div className="adm-modal-header">
              <h3>{userModal === "create" ? "Add New Administrator" : "Edit Admin Account"}</h3>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setUserModal(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="adm-modal-body">
                <div className="adm-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label>{userModal === "create" ? "Password *" : "New Password (Optional)"}</label>
                  <input
                    type="password"
                    required={userModal === "create"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={userModal === "edit" ? "Leave blank to keep current" : ""}
                  />
                </div>
                <div className="adm-form-group">
                  <label>Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="super_admin">Super Administrator</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Catalog &amp; Sales Manager</option>
                  </select>
                </div>
                <div className="adm-form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="usr_active"
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="usr_active" style={{ margin: 0, cursor: "pointer" }}>
                    Account Active &amp; Allowed to Log In
                  </label>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={() => setUserModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn-primary">
                  {userModal === "create" ? "Create User" : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
