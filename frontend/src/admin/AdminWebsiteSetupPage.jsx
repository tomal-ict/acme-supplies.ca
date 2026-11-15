import { useEffect, useState } from "react";
import {
  adminGetWebsiteSetup,
  adminUpdateAppearance,
  adminUpdateSectionBanners,
  adminUpdateSliders,
} from "../adminApi";

const DEFAULT_SLIDERS = [
  {
    id: 1,
    image: "./images/banner-1.png",
    tag: "25+ Years Manufacturer • OEM / ODM",
    title: "High-Yield Compatible Toner Cartridges & Imaging Solutions",
    desc: "1,000,000+ monthly capacity across 48 automated production lines. ISO9001, ISO14001 & STMC certified quality.",
    ctaText: "Explore Full Catalog",
    ctaLink: "/products",
  },
  {
    id: 2,
    image: "./images/banner-2.jpg",
    tag: "Factory Direct • 75,000 m² Industrial Park",
    title: "Automated Robotic Production & Overseas Warehousing",
    desc: "Fast dispatch from our main manufacturing campus and European overseas warehouse to 120+ countries.",
    ctaText: "View Company Profile",
    ctaLink: "/company-profile",
  },
  {
    id: 3,
    image: "./images/banner-3.jpg",
    tag: "Wholesale Promotions • Up to 12% Off",
    title: "Patent Gear Toner & Thermal POS Printer Specials",
    desc: "Lock in factory-tier FOB pricing on Brother, HP, Canon compatible cartridges and A4 laser printers.",
    ctaText: "See Hot Deals",
    ctaLink: "/promotion",
  },
  {
    id: 4,
    image: "./images/banner-4.jpg",
    tag: "Global Exhibitions & R&D Innovation",
    title: "Certified OEM/ODM Partner for Global Distributors",
    desc: "100% post-production print inspection and dedicated export support team.",
    ctaText: "Contact Us",
    ctaLink: "/company-profile",
  },
];

const DEFAULT_SECTION_BANNERS = [
  {
    key: "patent",
    name: "Patent Toner Cartridges",
    image: "./images/banner-patent.png",
    tagline: "100% IP Safe • Zero Patent Infringement Risk",
    link: "/products?category=Patent%20Cartridges",
  },
  {
    key: "monochrome",
    name: "Monochrome Cartridges",
    image: "./images/banner-mono.png",
    tagline: "High Page Yield • Crisp Dark Text for Office Workgroups",
    link: "/products?category=Monochrome%20Cartridges",
  },
  {
    key: "color",
    name: "Color Toner Cartridges",
    image: "./images/banner-color.png",
    tagline: "Vivid CMYK Professional Graphic Reproduction",
    link: "/products?category=Color%20Toner",
  },
  {
    key: "ink",
    name: "Ink Cartridges",
    image: "./images/banner-ink.png",
    tagline: "Precision Pigment & Dye Formulations for Canon & Epson",
    link: "/products?category=Ink%20Cartridge",
  },
  {
    key: "bulk",
    name: "Bulk Inks",
    image: "./images/banner-bulk.png",
    tagline: "1000ml & 500ml Bottled Bulk Refill Inks for CISS Systems",
    link: "/products?category=Bulk%20Ink",
  },
  {
    key: "powder",
    name: "Toner Powder",
    image: "./images/banner-powder.png",
    tagline: "Ultra-Fine Chemical Polymerized Toner Resin",
    link: "/products?category=Toner%20Powder",
  },
  {
    key: "printers",
    name: "Laser & Thermal POS Printers",
    image: "./images/banner-printers.png",
    tagline: "Compact High-Speed Desktop Receipt & Monochrome Printers",
    link: "/products?category=Thermal%20Printer",
  },
  {
    key: "chips",
    name: "Toner Chips & Parts",
    image: "./images/banner-chips.png",
    tagline: "Smart Reset Microchips, OPC Drums & Magnetic Rollers",
    link: "/products?category=Toner%20Chip",
  },
];

export default function AdminWebsiteSetupPage({ onToast }) {
  const [activeTab, setActiveTab] = useState("sliders"); // 'sliders' | 'banners' | 'header' | 'footer'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sliders state
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);
  const [editingSlider, setEditingSlider] = useState(null);

  // Section banners state
  const [sectionBanners, setSectionBanners] = useState(DEFAULT_SECTION_BANNERS);

  // Appearance & Header/Footer settings
  const [settings, setSettings] = useState({
    site_name: "AMIDA OFFICE SUPPLIES LIMITED",
    site_tagline: "Price Quality Service",
    logo_url: "./images/logo.png",
    announcement_text: "Welcome to AMIDA OFFICE SUPPLIES LIMITED • Price Quality Service",
    campaign_bar_text: "Get ready for 2027: up to 20% off 5M+ picks",
    campaign_bar_link: "/promotion",
    footer_copyright: "© 2027 Tomal Krishna Howlader. All rights reserved.",
    footer_tagline: "Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada",
    contact_email: "acme.info.swapan@gmail.com",
    contact_phone: "+1 604 316 8138",
    contact_address: "126 Main Street, Acme, AB T0M 0A0, Canada",
    ceo_name: "Swapan Kumar Bairagi",
    ceo_title: "Chief Executive Officer (CEO)",
    site_url: "https://www.acme-supplies.ca",
    contact_hours: "AM 9:00 - PM 22:00",
    facebook_url: "https://facebook.com",
    linkedin_url: "https://linkedin.com",
    youtube_url: "https://youtube.com",
  });

  const loadSetup = async () => {
    try {
      setLoading(true);
      const res = await adminGetWebsiteSetup();
      if (res.success) {
        if (res.sliders && Array.isArray(res.sliders) && res.sliders.length > 0) {
          setSliders(res.sliders);
        }
        if (res.section_banners && Array.isArray(res.section_banners) && res.section_banners.length > 0) {
          setSectionBanners(res.section_banners);
        }
        if (res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetup();
  }, []);

  // Save Sliders
  const handleSaveSliders = async () => {
    setSaving(true);
    try {
      const res = await adminUpdateSliders(sliders);
      if (res.success) {
        onToast("Home hero carousel sliders saved successfully! Storefront updated.", "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Save Section Banners
  const handleSaveBanners = async () => {
    setSaving(true);
    try {
      const res = await adminUpdateSectionBanners(sectionBanners);
      if (res.success) {
        onToast("Product section banners saved successfully!", "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Save Appearance / Header / Footer
  const handleSaveAppearance = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await adminUpdateAppearance(settings);
      if (res.success) {
        onToast("Website appearance, header & footer updated successfully!", "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Slider editing helpers
  const handleAddSlider = () => {
    const newSlide = {
      id: Date.now(),
      image: "./images/banner-1.png",
      tag: "Factory Direct • Special Offer",
      title: "New Featured Product Line",
      desc: "High precision engineering, certified for global export distribution.",
      ctaText: "View Products",
      ctaLink: "/products",
    };
    setSliders([...sliders, newSlide]);
    setEditingSlider(newSlide);
  };

  const handleUpdateSliderItem = (updated) => {
    setSliders(sliders.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSlider(null);
  };

  const handleDeleteSlider = (id) => {
    if (sliders.length <= 1) {
      alert("At least one slider must remain active on the homepage.");
      return;
    }
    if (window.confirm("Are you sure you want to remove this hero slider?")) {
      setSliders(sliders.filter((s) => s.id !== id));
      if (editingSlider?.id === id) setEditingSlider(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--adm-text-muted)" }}>
        Loading website configuration and visual assets...
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>Website Setup &amp; Storefront Customizer</h1>
          <p>
            Directly control public homepage sliders, section promotional banners, header branding, and footer copyright.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <a
            href="#/"
            target="_blank"
            rel="noreferrer"
            className="adm-btn adm-btn-outline"
          >
            Preview Live Store &#8599;
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--adm-border)", marginBottom: "24px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("sliders")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sliders" ? "3px solid #38bdf8" : "3px solid transparent",
            color: activeTab === "sliders" ? "#38bdf8" : "var(--adm-text-muted)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          🖼️ Home Hero Sliders ({sliders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("banners")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "banners" ? "3px solid #38bdf8" : "3px solid transparent",
            color: activeTab === "banners" ? "#38bdf8" : "var(--adm-text-muted)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          🏷️ Section Banners ({sectionBanners.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("header")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "header" ? "3px solid #38bdf8" : "3px solid transparent",
            color: activeTab === "header" ? "#38bdf8" : "var(--adm-text-muted)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          🎨 Header, Logo &amp; Campaign Bar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          style={{
            padding: "10px 18px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "footer" ? "3px solid #38bdf8" : "3px solid transparent",
            color: activeTab === "footer" ? "#38bdf8" : "var(--adm-text-muted)",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          📜 Footer &amp; Copyright Notice
        </button>
      </div>

      {/* TAB 1: HERO SLIDERS */}
      {activeTab === "sliders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "var(--adm-text-muted)", fontSize: "14px", margin: 0 }}>
              These carousel slides rotate automatically on the storefront hero banner.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="adm-btn adm-btn-outline" onClick={handleAddSlider}>
                + Add New Slide
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={handleSaveSliders}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save & Publish Sliders"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {sliders.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="adm-card"
                style={{
                  padding: "16px",
                  border: editingSlider?.id === slide.id ? "2px solid #38bdf8" : "1px solid var(--adm-border)",
                }}
              >
                <div style={{ position: "relative", height: "140px", borderRadius: "8px", overflow: "hidden", background: "#000", marginBottom: "12px" }}>
                  <img
                    src={slide.image?.startsWith("/") ? `.${slide.image}` : slide.image}
                    alt={slide.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "rgba(0,0,0,0.75)",
                      color: "#38bdf8",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Slide #{idx + 1}
                  </span>
                </div>

                <div style={{ fontSize: "11px", color: "var(--adm-accent-cyan)", fontWeight: 700, textTransform: "uppercase" }}>
                  {slide.tag}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--adm-text-main)", margin: "4px 0 8px" }}>
                  {slide.title}
                </div>
                <div style={{ fontSize: "12px", color: "var(--adm-text-muted)", marginBottom: "12px", lineHeight: 1.4 }}>
                  {slide.desc}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--adm-border-light)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#34d399" }}>
                    CTA: <strong>{slide.ctaText}</strong> &rarr; {slide.ctaLink}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn-outline adm-btn-sm"
                      onClick={() => setEditingSlider(slide)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      onClick={() => handleDeleteSlider(slide.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Slider Modal / Drawer */}
          {editingSlider && (
            <div className="adm-modal-overlay">
              <div className="adm-modal" style={{ maxWidth: "560px" }}>
                <div className="adm-modal-header">
                  <h3 className="adm-modal-title">Edit Hero Carousel Slide</h3>
                  <button type="button" className="adm-modal-close" onClick={() => setEditingSlider(null)}>
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSliderItem(editingSlider);
                  }}
                  className="adm-modal-body"
                >
                  <div className="adm-form-group">
                    <label className="adm-label">Slide Image URL or Local Path</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={editingSlider.image}
                      onChange={(e) => setEditingSlider({ ...editingSlider, image: e.target.value })}
                      required
                    />
                    <div style={{ fontSize: "11px", color: "var(--adm-text-subtle)", marginTop: "4px" }}>
                      Example: <code>./images/banner-1.png</code> or direct full HTTPS URL.
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Badge Tagline</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={editingSlider.tag}
                      onChange={(e) => setEditingSlider({ ...editingSlider, tag: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Slide Main Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={editingSlider.title}
                      onChange={(e) => setEditingSlider({ ...editingSlider, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Description Prose</label>
                    <textarea
                      rows="3"
                      className="adm-input"
                      value={editingSlider.desc}
                      onChange={(e) => setEditingSlider({ ...editingSlider, desc: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="adm-form-group">
                      <label className="adm-label">Button Label</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={editingSlider.ctaText}
                        onChange={(e) => setEditingSlider({ ...editingSlider, ctaText: e.target.value })}
                      />
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Target Link</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={editingSlider.ctaLink}
                        onChange={(e) => setEditingSlider({ ...editingSlider, ctaLink: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="adm-modal-footer">
                    <button type="button" className="adm-btn adm-btn-outline" onClick={() => setEditingSlider(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="adm-btn adm-btn-primary">
                      Done
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SECTION BANNERS */}
      {activeTab === "banners" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "var(--adm-text-muted)", fontSize: "14px", margin: 0 }}>
              Customize the promotional image banners displayed atop each product section.
            </p>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={handleSaveBanners}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save All Section Banners"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {sectionBanners.map((b, idx) => (
              <div key={b.key || idx} className="adm-card" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontWeight: 700, color: "#38bdf8", fontSize: "14px" }}>
                    {b.name}
                  </div>
                  <span className="adm-badge adm-badge-blue">Section #{idx + 1}</span>
                </div>

                <div style={{ height: "100px", borderRadius: "6px", overflow: "hidden", background: "#000", marginBottom: "12px" }}>
                  <img
                    src={b.image?.startsWith("/") ? `.${b.image}` : b.image}
                    alt={b.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "./images/banner-1.png";
                    }}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Banner Image URL / File</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={b.image}
                    onChange={(e) => {
                      const updated = [...sectionBanners];
                      updated[idx].image = e.target.value;
                      setSectionBanners(updated);
                    }}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Promo Tagline</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={b.tagline}
                    onChange={(e) => {
                      const updated = [...sectionBanners];
                      updated[idx].tagline = e.target.value;
                      setSectionBanners(updated);
                    }}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Target Destination Link</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={b.link}
                    onChange={(e) => {
                      const updated = [...sectionBanners];
                      updated[idx].link = e.target.value;
                      setSectionBanners(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HEADER, LOGO & CAMPAIGN BAR */}
      {activeTab === "header" && (
        <form onSubmit={handleSaveAppearance}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="adm-card">
              <div className="adm-card-header">
                <h2 className="adm-card-title">
                  <span>🚀</span> Top Campaign Bar (Alibaba Style)
                </h2>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Campaign Announcement Text</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.campaign_bar_text || "Get ready for 2027: up to 20% off 5M+ picks"}
                  onChange={(e) => setSettings({ ...settings, campaign_bar_text: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Campaign Action Link</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.campaign_bar_link || "/promotion"}
                  onChange={(e) => setSettings({ ...settings, campaign_bar_link: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Top Utility Announcement Bar</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.announcement_text}
                  onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-header">
                <h2 className="adm-card-title">
                  <span>🖼️</span> Brand Logo &amp; Identity
                </h2>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Header Logo Image Path</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                />
              </div>

              <div style={{ marginTop: "12px", padding: "16px", background: "#fff", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", fontWeight: 600 }}>
                  CURRENT ACTIVE LOGO PREVIEW
                </div>
                <img
                  src={settings.logo_url?.startsWith("/") ? `.${settings.logo_url}` : settings.logo_url}
                  alt="Logo Preview"
                  style={{ maxHeight: "50px", maxWidth: "100%", objectFit: "contain" }}
                />
              </div>

              <div className="adm-form-group" style={{ marginTop: "16px" }}>
                <label className="adm-label">Store Brand Name</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Update Header & Campaign Settings"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: FOOTER & COPYRIGHT */}
      {activeTab === "footer" && (
        <form onSubmit={handleSaveAppearance}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="adm-card">
              <div className="adm-card-header">
                <h2 className="adm-card-title">
                  <span>©️</span> Copyright &amp; Legal Notices
                </h2>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Footer Copyright Notice (Exact Text)</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.footer_copyright}
                  onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                  required
                />
                <div style={{ fontSize: "11px", color: "var(--adm-accent-cyan)", marginTop: "4px" }}>
                  Active setting: <code>© 2027 Tomal Krishna Howlader. All rights reserved.</code>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Footer Tagline &amp; Manufacturer Summary</label>
                <textarea
                  rows="3"
                  className="adm-input"
                  value={settings.footer_tagline}
                  onChange={(e) => setSettings({ ...settings, footer_tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-header">
                <h2 className="adm-card-title">
                  <span>📞</span> Corporate Contact &amp; Social Links
                </h2>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Support Email Address</label>
                <input
                  type="email"
                  className="adm-input"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Hotline Telephone</label>
                <input
                  type="text"
                  className="adm-input"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div className="adm-form-group">
                  <label className="adm-label">Facebook</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={settings.facebook_url}
                    onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">LinkedIn</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={settings.linkedin_url}
                    onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">YouTube</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={settings.youtube_url}
                    onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "24px", textAlign: "right" }}>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Update Footer & Legal Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
