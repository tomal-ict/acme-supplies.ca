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
  getApiBase,
} from "../adminApi";

export default function AdminGeneralSettingsPage({ onToast }) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    site_name: "AMIDA OFFICE SUPPLIES LIMITED",
    site_tagline: "Price Quality Service",
    site_url: "https://www.acme-supplies.ca",
    ceo_name: "Swapan Kumar Bairagi",
    ceo_title: "Chief Executive Officer (CEO)",
    contact_address: "126 Main Street, Acme, AB T0M 0A0, Canada",
    contact_phone: "+1 604 316 8138",
    contact_email: "acme.info.swapan@gmail.com",
    currency: "USD",
    timezone: "Asia/Dhaka",
    date_format: "Y-m-d H:i:s",

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
  });

  // Users State
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState(null); // 'create' | 'edit'
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

  // Save General or SMTP Settings
  const handleSaveSettings = async (group) => {
    try {
      const res = await adminUpdateSettings(settings, group);
      if (res.success) {
        onToast(`${group.toUpperCase()} settings saved successfully!`, "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  // Save SEO
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

  // Test SMTP
  const handleRunSmtpTest = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      onToast("Please enter an email address to receive test message.", "error");
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

      setTestResult({ success: res.success, message: res.message });
      onToast(res.message, res.success ? "success" : "error");
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      onToast(err.message, "error");
    } finally {
      setTestingSmtp(false);
    }
  };

  // User Actions
  const handleOpenCreateUser = () => {
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
  };

  const handleOpenEditUser = (u) => {
    setCurrentUser(u);
    setUserForm({
      name: u.name,
      username: u.username || "",
      email: u.email,
      password: "",
      role: u.role,
      is_active: Boolean(u.is_active),
      permissions: u.permissions || [],
    });
    setUserModal("edit");
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (userModal === "create") {
        const res = await adminCreateUser(userForm);
        if (res.success) {
          onToast("User account created!", "success");
          setUserModal(null);
          loadAll();
        }
      } else if (userModal === "edit") {
        const res = await adminUpdateUser(currentUser.id, userForm);
        if (res.success) {
          onToast("User account updated!", "success");
          setUserModal(null);
          loadAll();
        }
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Permanently remove this administrator account?")) {
      try {
        const res = await adminDeleteUser(id);
        if (res.success) {
          onToast("User removed", "success");
          loadAll();
        }
      } catch (err) {
        onToast(err.message, "error");
      }
    }
  };

  const togglePermission = (perm) => {
    setUserForm((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>Enterprise Settings &amp; Configuration</h1>
          <p>
            Multi-User Roles, SMTP Mail Gateway, Global Preferences &amp; Google SEO Optimization.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        <button
          type="button"
          className={`adm-tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          🏢 General Information
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Multi-User &amp; Permissions ({users.length})
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === "smtp" ? "active" : ""}`}
          onClick={() => setActiveTab("smtp")}
        >
          ✉️ SMTP Server &amp; Autoresponder
        </button>
        <button
          type="button"
          className={`adm-tab ${activeTab === "seo" ? "active" : ""}`}
          onClick={() => setActiveTab("seo")}
        >
          🌐 SEO, GTM &amp; Marketing
        </button>
      </div>

      {/* TAB 1: General Info */}
      {activeTab === "general" && (
        <div className="adm-card" style={{ maxWidth: "800px" }}>
          <div className="adm-card-header">
            <h2 className="adm-card-title">Global Storefront Parameters</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="adm-form-group">
              <label className="adm-label">Company / Legal Store Name</label>
              <input
                type="text"
                className="adm-input"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Primary Currency</label>
              <select
                className="adm-select"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
              </select>
            </div>

            <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="adm-label">Global Tagline / Industry Classification</label>
              <input
                type="text"
                className="adm-input"
                value={settings.site_tagline}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Executive Leadership / CEO Name</label>
              <input
                type="text"
                className="adm-input"
                value={settings.ceo_name || ""}
                onChange={(e) => setSettings({ ...settings, ceo_name: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Executive Title / Designation</label>
              <input
                type="text"
                className="adm-input"
                value={settings.ceo_title || ""}
                onChange={(e) => setSettings({ ...settings, ceo_title: e.target.value })}
              />
            </div>

            <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="adm-label">Corporate Office Headquarters Address</label>
              <input
                type="text"
                className="adm-input"
                value={settings.contact_address || ""}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Official Hotline Telephone</label>
              <input
                type="text"
                className="adm-input"
                value={settings.contact_phone || ""}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Official Business Email</label>
              <input
                type="email"
                className="adm-input"
                value={settings.contact_email || ""}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Server Timezone</label>
              <input
                type="text"
                className="adm-input"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Canonical Store URL</label>
              <input
                type="text"
                className="adm-input"
                value={settings.site_url}
                onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={() => handleSaveSettings("general")}
            >
              Save General Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-User & Permissions */}
      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ color: "var(--adm-text-muted)", fontSize: "13.5px" }}>
              Manage administrative staff, sales engineers, and role-based access permissions.
            </p>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={handleOpenCreateUser}
            >
              + Add New Administrator
            </button>
          </div>

          <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="adm-table-container">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>
                        <code style={{ color: "var(--adm-accent-cyan)" }}>{u.username || "-"}</code>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`adm-badge ${
                            u.role === "super_admin"
                              ? "adm-badge-rose"
                              : u.role === "admin"
                              ? "adm-badge-blue"
                              : "adm-badge-green"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`adm-badge ${u.is_active ? "adm-badge-green" : "adm-badge-gray"}`}
                        >
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--adm-text-subtle)" }}>
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleString()
                          : "Never logged in"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            className="adm-btn adm-btn-outline adm-btn-sm"
                            onClick={() => handleOpenEditUser(u)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="adm-btn adm-btn-danger adm-btn-sm"
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
        </div>
      )}

      {/* TAB 3: SMTP Server Configuration */}
      {activeTab === "smtp" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          {/* SMTP Server Form */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h2 className="adm-card-title">
                <span>✉️</span> SMTP Outgoing Mail Gateway
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="adm-form-group">
                <label className="adm-label">SMTP Host (Server) *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="smtp.gmail.com or mail.yourdomain.com"
                  value={settings.smtp_host}
                  onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Port *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="587 (TLS) or 465 (SSL)"
                  value={settings.smtp_port}
                  onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Encryption Protocol</label>
                <select
                  className="adm-select"
                  value={settings.smtp_encryption}
                  onChange={(e) => setSettings({ ...settings, smtp_encryption: e.target.value })}
                >
                  <option value="tls">TLS (Recommended - Port 587)</option>
                  <option value="ssl">SSL (Port 465)</option>
                  <option value="none">None / Open (Port 25)</option>
                </select>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">SMTP Username / Email *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="your-email@gmail.com"
                  value={settings.smtp_username}
                  onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                />
              </div>

              <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="adm-label">SMTP Password / Google App Password *</label>
                <input
                  type="password"
                  className="adm-input"
                  placeholder="••••••••••••••••"
                  value={settings.smtp_password}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                />
                <div className="adm-hint">
                  For Gmail, generate an <strong>App Password</strong> in your Google Account security settings.
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Sender &quot;From&quot; Name</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.smtp_from_name}
                  onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Sender &quot;From&quot; Email</label>
                <input
                  type="email"
                  className="adm-input"
                  value={settings.smtp_from_email}
                  onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                />
              </div>

              <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="adm-label">Admin Alert Recipient Email</label>
                <input
                  type="email"
                  className="adm-input"
                  placeholder="admin@acme.com"
                  value={settings.admin_notify_email}
                  onChange={(e) => setSettings({ ...settings, admin_notify_email: e.target.value })}
                />
                <div className="adm-hint">
                  Instant notification alerts will be dispatched here whenever a client submits an RFQ or chat lead.
                </div>
              </div>
            </div>

            {/* Autoresponder Section */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--adm-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "15px", color: "#fff", fontWeight: 700 }}>
                  Client Instant Welcome Autoresponder
                </h3>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                  <input
                    type="checkbox"
                    checked={settings.autoresponder_enabled === "1"}
                    onChange={(e) =>
                      setSettings({ ...settings, autoresponder_enabled: e.target.checked ? "1" : "0" })
                    }
                  />
                  <span>Enable Autoresponder</span>
                </label>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Autoresponder Email Subject</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.autoresponder_subject}
                  onChange={(e) => setSettings({ ...settings, autoresponder_subject: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Autoresponder Body Template</label>
                <textarea
                  className="adm-textarea"
                  rows={5}
                  value={settings.autoresponder_body}
                  onChange={(e) => setSettings({ ...settings, autoresponder_body: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => handleSaveSettings("smtp")}
              >
                Save SMTP Configuration
              </button>
            </div>
          </div>

          {/* Test SMTP Connection Card */}
          <div>
            <div className="adm-card">
              <div className="adm-card-header">
                <h2 className="adm-card-title">
                  <span>⚡</span> Live SMTP Test Diagnostic
                </h2>
              </div>

              <p style={{ color: "var(--adm-text-muted)", fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                Send a real test email to verify authentication handshake, ports, and TLS handshake with your mail server.
              </p>

              <form onSubmit={handleRunSmtpTest}>
                <div className="adm-form-group">
                  <label className="adm-label">Recipient Test Email Address</label>
                  <input
                    type="email"
                    className="adm-input"
                    placeholder="your-personal@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="adm-btn adm-btn-success"
                  style={{ width: "100%", padding: "10px" }}
                  disabled={testingSmtp}
                >
                  {testingSmtp ? "Testing SMTP Handshake..." : "🚀 Send Test Email Now"}
                </button>
              </form>

              {testResult && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    borderRadius: "6px",
                    background: testResult.success ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                    border: `1px solid ${testResult.success ? "#10b981" : "#f43f5e"}`,
                    color: testResult.success ? "#6ee7b7" : "#fda4af",
                    fontSize: "13px",
                  }}
                >
                  <strong>{testResult.success ? "Success!" : "Failed!"}</strong>
                  <div style={{ marginTop: "4px" }}>{testResult.message}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO, GTM & Marketing */}
      {activeTab === "seo" && (
        <form onSubmit={handleSaveSeo} style={{ maxWidth: "860px" }}>
          <div className="adm-card">
            <div className="adm-card-header">
              <h2 className="adm-card-title">
                <span>🔍</span> Global Search Engine Optimization (SEO)
              </h2>
            </div>

            <div className="adm-form-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="adm-label">Global Meta Title (Browser &amp; Google Snippet)</label>
                <span style={{ fontSize: "11px", color: "var(--adm-text-subtle)" }}>
                  {seo.meta_title.length} / 65 recommended
                </span>
              </div>
              <input
                type="text"
                className="adm-input"
                value={seo.meta_title}
                onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
                required
              />
            </div>

            <div className="adm-form-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="adm-label">Meta Description</label>
                <span style={{ fontSize: "11px", color: "var(--adm-text-subtle)" }}>
                  {seo.meta_description.length} / 160 recommended
                </span>
              </div>
              <textarea
                className="adm-textarea"
                rows={3}
                value={seo.meta_description}
                onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                required
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Target Keywords (Comma Separated)</label>
              <input
                type="text"
                className="adm-input"
                value={seo.meta_keywords}
                onChange={(e) => setSeo({ ...seo, meta_keywords: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="adm-form-group">
                <label className="adm-label">Google Tag Manager Container ID</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="GTM-XXXXXXX"
                  value={seo.google_tag_manager_id}
                  onChange={(e) => setSeo({ ...seo, google_tag_manager_id: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Google Analytics 4 (GA4) ID</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="G-XXXXXXXXXX"
                  value={seo.google_analytics_id}
                  onChange={(e) => setSeo({ ...seo, google_analytics_id: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Google Search Console Verification Tag / Code</label>
              <input
                type="text"
                className="adm-input"
                placeholder="google-site-verification=xxxx..."
                value={seo.google_search_console_code}
                onChange={(e) => setSeo({ ...seo, google_search_console_code: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Robots.txt Content</label>
              <textarea
                className="adm-textarea"
                rows={4}
                style={{ fontFamily: "monospace", fontSize: "12px" }}
                value={seo.robots_txt}
                onChange={(e) => setSeo({ ...seo, robots_txt: e.target.value })}
              />
            </div>

            <div
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                borderRadius: "6px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <div>
                <strong style={{ color: "#60a5fa", fontSize: "14px" }}>
                  Dynamic XML Sitemap Active
                </strong>
                <p style={{ color: "var(--adm-text-muted)", fontSize: "12px", marginTop: "2px" }}>
                  Automatically generates valid XML urlsets containing public product URLs for Google, Bing, and Yandex.
                </p>
              </div>
              <a
                href={`${getApiBase()}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="adm-btn adm-btn-outline adm-btn-sm"
              >
                Open sitemap.xml &#8599;
              </a>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button type="submit" className="adm-btn adm-btn-primary">
                Save SEO &amp; Marketing Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Modal: Create/Edit Admin User */}
      {userModal && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setUserModal(null)}>
          <div className="adm-modal" style={{ maxWidth: "540px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">
                {userModal === "create" ? "Add New Administrator" : `Edit User (${currentUser?.email})`}
              </h2>
              <button type="button" className="adm-modal-close" onClick={() => setUserModal(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="adm-form-group">
                <label className="adm-label">Full Name *</label>
                <input
                  type="text"
                  className="adm-input"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="adm-form-group">
                  <label className="adm-label">Username</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="e.g. jsmith"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Email Address *</label>
                  <input
                    type="email"
                    className="adm-input"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">
                  {userModal === "create" ? "Password *" : "Reset Password (Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  className="adm-input"
                  placeholder="Min 8 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required={userModal === "create"}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Assigned Role</label>
                <select
                  className="adm-select"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="super_admin">Super Administrator (Full Unrestricted Access)</option>
                  <option value="admin">Administrator</option>
                  <option value="sales_manager">Sales Manager (Inquiries &amp; RFQ Leads)</option>
                  <option value="editor">Editor (Product Catalog &amp; SEO)</option>
                </select>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Granular Permissions</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { key: "products.manage", label: "Manage Products" },
                    { key: "categories.manage", label: "Manage Categories" },
                    { key: "inquiries.manage", label: "Manage Inquiries & RFQs" },
                    { key: "settings.manage", label: "Manage System Settings" },
                    { key: "users.manage", label: "Manage Multi-Users" },
                    { key: "seo.manage", label: "Manage SEO & Marketing" },
                  ].map((p) => (
                    <label
                      key={p.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12.5px",
                        color: "#e2e8f0",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes(p.key) || userForm.role === "super_admin"}
                        disabled={userForm.role === "super_admin"}
                        onChange={() => togglePermission(p.key)}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="adm-form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff" }}>
                  <input
                    type="checkbox"
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                  />
                  <span>Active User Account (Able to login)</span>
                </label>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setUserModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {userModal === "create" ? "Create Account" : "Update Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
