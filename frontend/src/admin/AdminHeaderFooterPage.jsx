import { useEffect, useState } from "react";
import { adminGetSettings, adminUpdateSettings } from "../adminApi";

export default function AdminHeaderFooterPage({ onToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "AMIDA OFFICE SUPPLIES LIMITED",
    site_tagline: "Price Quality Service",
    logo_url: "./images/logo.png",
    announcement_text: "Welcome to AMIDA OFFICE SUPPLIES LIMITED • Price Quality Service",
    contact_email: "acme.info.swapan@gmail.com",
    contact_phone: "+1 604 316 8138",
    contact_address: "126 Main Street, Acme, AB T0M 0A0, Canada",
    ceo_name: "Swapan Kumar Bairagi",
    ceo_title: "Chief Executive Officer (CEO)",
    site_url: "https://www.acme-supplies.ca",
    contact_hours: "AM 9:00 - PM 22:00",
    footer_copyright: "© 2027 Tomal Krishna Howlader. All rights reserved.",
    footer_tagline: "Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada",
    facebook_url: "https://facebook.com",
    linkedin_url: "https://linkedin.com",
    youtube_url: "https://youtube.com",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminGetSettings();
      if (res.success && res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminUpdateSettings(settings, "header_footer");
      if (res.success) {
        onToast("Header & Footer settings updated successfully! Public storefront updated.", "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>Header &amp; Footer Customizer</h1>
          <p>
            Dynamically adjust website branding, header announcements, logos, contact details, and copyright notices.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Header Configuration */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h2 className="adm-card-title">
                <span>🎨</span> Header &amp; Top Utility Bar
              </h2>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Top Utility Announcement Bar Text</label>
              <input
                type="text"
                className="adm-input"
                value={settings.announcement_text}
                onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                required
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Store Brand Name</label>
              <input
                type="text"
                className="adm-input"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                required
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Brand Subtitle / Tagline</label>
              <input
                type="text"
                className="adm-input"
                value={settings.site_tagline}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Website Logo Path / Image URL</label>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  required
                />
                {settings.logo_url && (
                  <div
                    style={{
                      background: "#fff",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={settings.logo_url}
                      alt="Logo Preview"
                      style={{ height: "36px", width: "auto", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="adm-form-group">
                <label className="adm-label">Contact Email</label>
                <input
                  type="email"
                  className="adm-input"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Contact Phone / Hotline</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Business / Support Hours</label>
              <input
                type="text"
                className="adm-input"
                value={settings.contact_hours}
                onChange={(e) => setSettings({ ...settings, contact_hours: e.target.value })}
              />
            </div>
          </div>

          {/* Footer Configuration */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h2 className="adm-card-title">
                <span>🛡️</span> Footer &amp; Copyright Notice
              </h2>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">
                Official Copyright Line (Footer Base) *
              </label>
              <input
                type="text"
                className="adm-input"
                value={settings.footer_copyright}
                onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                placeholder="© 2027 Tomal Krishna Howlader. All rights reserved."
                required
              />
              <div className="adm-hint">
                This exact text renders directly across all public pages in the bottom footer.
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Footer Brand Subtitle</label>
              <input
                type="text"
                className="adm-input"
                value={settings.footer_tagline}
                onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Social Media: Facebook URL</label>
              <input
                type="url"
                className="adm-input"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Social Media: LinkedIn URL</label>
              <input
                type="url"
                className="adm-input"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">Social Media: YouTube URL</label>
              <input
                type="url"
                className="adm-input"
                value={settings.youtube_url}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
          <button
            type="submit"
            className="adm-btn adm-btn-primary"
            style={{ padding: "10px 24px", fontSize: "14px" }}
            disabled={saving}
          >
            {saving ? "Saving Branding Settings..." : "Save Header & Footer Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
