import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminLogout,
  getStoredAdminUser,
  adminGetDbSyncStatus,
  adminBackupDatabase,
  adminRestoreDatabase,
  getDbBackupDownloadUrl,
} from "../adminApi";
import "./AdminStyles.css";

export default function AdminLayout({ activePage, setActivePage, children, unreadInquiries = 0, onToast }) {
  const [user, setUser] = useState(getStoredAdminUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Accordion state: only one menu open at a time; opening one smoothly auto-minimizes any previously opened menu
  const [openMenu, setOpenMenu] = useState("settings");

  // Topbar dropdown states
  const [langDropdown, setLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Database Synchronization State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncOp, setSyncOp] = useState("idle"); // 'backup' | 'restore' | 'idle'

  const fetchSyncStatus = async () => {
    try {
      setSyncLoading(true);
      const res = await adminGetDbSyncStatus();
      if (res.success) {
        setSyncStatus(res);
      }
    } catch (err) {
      if (onToast) onToast("Failed to fetch database sync status: " + err.message, "error");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleBackupDb = async () => {
    try {
      setSyncOp("backup");
      const res = await adminBackupDatabase();
      if (res.success) {
        if (onToast) onToast(res.message, "success");
        await fetchSyncStatus();
      } else {
        if (onToast) onToast(res.message, "error");
      }
    } catch (err) {
      if (onToast) onToast("Database backup failed: " + err.message, "error");
    } finally {
      setSyncOp("idle");
    }
  };

  const handleRestoreDb = async () => {
    if (!window.confirm("Are you sure you want to merge and restore the codebase database backup into your current MySQL database? Any local changes will be synchronized with the snapshot.")) {
      return;
    }
    try {
      setSyncOp("restore");
      const res = await adminRestoreDatabase();
      if (res.success) {
        if (onToast) onToast(res.message, "success");
        await fetchSyncStatus();
      } else {
        if (onToast) onToast(res.message, "error");
      }
    } catch (err) {
      if (onToast) onToast("Database restore failed: " + err.message, "error");
    } finally {
      setSyncOp("idle");
    }
  };

  const navigate = useNavigate();
  const topbarRef = useRef(null);

  useEffect(() => {
    setUser(getStoredAdminUser());
  }, []);

  // Close topbar dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target)) {
        setLangDropdown(false);
        setNotifDropdown(false);
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-open parent accordion if activePage changes
  useEffect(() => {
    const parentMap = {
      dashboard: null,
      orders: "orders",
      incomplete_orders: "orders",
      shipping_setup: "orders",
      products: "catalog",
      categories: "catalog",
      inquiries: "customer",
      customers: "customer",
      website_setup: "storefront",
      static_pages: "storefront",
      settings: "settings",
      plugins: "settings",
      email_settings: "settings",
      seo_settings: "settings",
      language_settings: "settings",
      page_settings: "settings",
      sms_settings: "settings",
      notification_settings: "settings",
      security: "security",
    };
    if (parentMap[activePage] && parentMap[activePage] !== openMenu) {
      setOpenMenu(parentMap[activePage]);
    }
  }, [activePage]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to end your administration session?")) {
      await adminLogout();
      navigate("/myadmin");
      window.location.reload();
    }
  };

  const toggleAccordion = (menuKey) => {
    // If clicking the already open menu, toggle it shut; otherwise open this one and auto-collapse the previous one
    setOpenMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  // Mock notifications matching the screenshot counter (4)
  const notifications = [
    { id: 1, title: "New Order Placed #ORD-1049", time: "10 mins ago", type: "order" },
    { id: 2, title: "Customer inquiry from Swapan Kumar", time: "25 mins ago", type: "inquiry" },
    { id: 3, title: "Low Stock Alert: A4 Copier Paper", time: "2 hours ago", type: "stock" },
    { id: 4, title: "Automated Backup Completed", time: "5 hours ago", type: "system" },
  ];

  const getPageTitle = () => {
    const map = {
      dashboard: "Dashboard",
      orders: "All Orders",
      incomplete_orders: "Incomplete Orders",
      shipping_setup: "Shipping & Delivery Setup",
      products: "Products Catalog",
      categories: "Categories & Tree",
      inquiries: "Customer Inquiries & RFQs",
      customers: "Customer Management",
      website_setup: "Website Setup & Sliders",
      static_pages: "Static Pages",
      settings: "Site Settings",
      plugins: "Plugin Settings",
      email_settings: "Email (SMTP) Settings",
      seo_settings: "SEO Meta Settings",
      language_settings: "Language Settings",
      page_settings: "Page Settings",
      sms_settings: "SMS Gateway Settings",
      notification_settings: "Notification Settings",
      security: "IP Blocklist & 404 Defense",
    };
    return map[activePage] || "Admin Panel";
  };

  return (
    <div className={`adm-app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar - Dark Navy Theme with Accordions */}
      <aside className={`adm-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Top White Logo Box matching screenshot */}
        <div className="adm-sidebar-logo-card">
          <div className="adm-brand-logo-content">
            <span className="adm-brand-logo-icon">💠</span>
            <div className="adm-brand-logo-text-wrap">
              <span className="adm-brand-logo-main">AMIDA</span>
              <span className="adm-brand-logo-sub">OFFICE SUPPLIES</span>
            </div>
          </div>
        </div>

        {/* Navigation Items with Accordion Behavior */}
        <nav className="adm-sidebar-nav">
          {/* Dashboard Direct Link */}
          <button
            type="button"
            className={`adm-nav-item direct-item ${activePage === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActivePage("dashboard");
              setMobileOpen(false);
            }}
          >
            <span className="adm-nav-label-wrap">
              <span className="adm-nav-icon">📊</span>
              <span className="adm-nav-text">Dashboard</span>
            </span>
          </button>

          {/* CUSTOMER MANAGEMENT ACCORDION */}
          <div className="adm-nav-accordion-group">
            <div className="adm-nav-section-title">CUSTOMER MANAGEMENT</div>
            <button
              type="button"
              className={`adm-accordion-header ${openMenu === "customer" ? "open" : ""}`}
              onClick={() => toggleAccordion("customer")}
            >
              <span className="adm-nav-label-wrap">
                <span className="adm-nav-icon">👥</span>
                <span className="adm-nav-text">Customers</span>
              </span>
              <span className={`adm-nav-arrow ${openMenu === "customer" ? "rotated" : ""}`}>▾</span>
            </button>
            <div className={`adm-submenu-wrapper ${openMenu === "customer" ? "open" : ""}`}>
              <div className="adm-submenu-list">
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "inquiries" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("inquiries");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Inquiries & RFQs</span>
                  {unreadInquiries > 0 && <span className="adm-nav-pill">{unreadInquiries}</span>}
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "customers" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("customers");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Customer Accounts</span>
                </button>
              </div>
            </div>
          </div>

          {/* CATALOG & PRODUCTS ACCORDION */}
          <div className="adm-nav-accordion-group">
            <div className="adm-nav-section-title">CATALOG & PRODUCTS</div>
            <button
              type="button"
              className={`adm-accordion-header ${openMenu === "catalog" ? "open" : ""}`}
              onClick={() => toggleAccordion("catalog")}
            >
              <span className="adm-nav-label-wrap">
                <span className="adm-nav-icon">📦</span>
                <span className="adm-nav-text">Products & Catalog</span>
              </span>
              <span className={`adm-nav-arrow ${openMenu === "catalog" ? "rotated" : ""}`}>▾</span>
            </button>
            <div className={`adm-submenu-wrapper ${openMenu === "catalog" ? "open" : ""}`}>
              <div className="adm-submenu-list">
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "products" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("products");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>All Products</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "categories" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("categories");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Categories & Tree</span>
                </button>
              </div>
            </div>
          </div>

          {/* ORDERS & SALES ACCORDION */}
          <div className="adm-nav-accordion-group">
            <div className="adm-nav-section-title">ORDERS & SALES</div>
            <button
              type="button"
              className={`adm-accordion-header ${openMenu === "orders" ? "open" : ""}`}
              onClick={() => toggleAccordion("orders")}
            >
              <span className="adm-nav-label-wrap">
                <span className="adm-nav-icon">🛒</span>
                <span className="adm-nav-text">Orders & Invoices</span>
              </span>
              <span className={`adm-nav-arrow ${openMenu === "orders" ? "rotated" : ""}`}>▾</span>
            </button>
            <div className={`adm-submenu-wrapper ${openMenu === "orders" ? "open" : ""}`}>
              <div className="adm-submenu-list">
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "orders" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("orders");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>All Orders</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "incomplete_orders" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("incomplete_orders");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Incomplete Orders</span>
                </button>
              </div>
            </div>
          </div>

          {/* STOREFRONT DESIGN ACCORDION */}
          <div className="adm-nav-accordion-group">
            <div className="adm-nav-section-title">STOREFRONT SETUP</div>
            <button
              type="button"
              className={`adm-accordion-header ${openMenu === "storefront" ? "open" : ""}`}
              onClick={() => toggleAccordion("storefront")}
            >
              <span className="adm-nav-label-wrap">
                <span className="adm-nav-icon">🖼️</span>
                <span className="adm-nav-text">Storefront Design</span>
              </span>
              <span className={`adm-nav-arrow ${openMenu === "storefront" ? "rotated" : ""}`}>▾</span>
            </button>
            <div className={`adm-submenu-wrapper ${openMenu === "storefront" ? "open" : ""}`}>
              <div className="adm-submenu-list">
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "website_setup" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("website_setup");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Sliders & Banners</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "page_settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("page_settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Static Pages & Policy</span>
                </button>
              </div>
            </div>
          </div>

          {/* SYSTEM SETTINGS & PLUGINS ACCORDION */}
          <div className="adm-nav-accordion-group">
            <div className="adm-nav-section-title">SETTINGS & PLUGINS</div>
            <button
              type="button"
              className={`adm-accordion-header ${openMenu === "settings" ? "open" : ""}`}
              onClick={() => toggleAccordion("settings")}
            >
              <span className="adm-nav-label-wrap">
                <span className="adm-nav-icon">⚙️</span>
                <span className="adm-nav-text">System Settings</span>
              </span>
              <span className={`adm-nav-arrow ${openMenu === "settings" ? "rotated" : ""}`}>▾</span>
            </button>
            <div className={`adm-submenu-wrapper ${openMenu === "settings" ? "open" : ""}`}>
              <div className="adm-submenu-list">
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "plugins" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("plugins");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>🔌 Plugin Settings</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Site Settings</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "email_settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("email_settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Email (SMTP)</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "seo_settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("seo_settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>SEO Meta</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "language_settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("language_settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Language</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "sms_settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("sms_settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>SMS Gateway</span>
                </button>
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "notification_settings" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("notification_settings");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>Notifications</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECURITY & FIREWALL ACCORDION */}
          <div className="adm-nav-accordion-group">
            <div className="adm-nav-section-title">SECURITY & ACCESS</div>
            <button
              type="button"
              className={`adm-accordion-header ${openMenu === "security" ? "open" : ""}`}
              onClick={() => toggleAccordion("security")}
            >
              <span className="adm-nav-label-wrap">
                <span className="adm-nav-icon">🛡️</span>
                <span className="adm-nav-text">Security Firewall</span>
              </span>
              <span className={`adm-nav-arrow ${openMenu === "security" ? "rotated" : ""}`}>▾</span>
            </button>
            <div className={`adm-submenu-wrapper ${openMenu === "security" ? "open" : ""}`}>
              <div className="adm-submenu-list">
                <button
                  type="button"
                  className={`adm-subnav-item ${activePage === "security" ? "active" : ""}`}
                  onClick={() => {
                    setActivePage("security");
                    setMobileOpen(false);
                  }}
                >
                  <span className="adm-subnav-bullet">•</span>
                  <span>IP Defense & 404 Logs</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Database Synchronization Button matching user request */}
        <div className="adm-sidebar-sync-wrap">
          <button
            type="button"
            className="adm-btn-sidebar-sync"
            onClick={() => {
              setShowSyncModal(true);
              fetchSyncStatus();
            }}
            title="Synchronize and Backup MySQL Database with Codebase"
          >
            <span className="adm-sync-btn-icon">🔄</span>
            <span className="adm-sync-btn-label">Data Synchronize</span>
            <span className="adm-sync-status-dot" title="Database Connected">●</span>
          </button>
        </div>

        {/* Sidebar Footer Mini Profile */}
        <div className="adm-sidebar-footer">
          <div className="adm-user-mini">
            <div className="adm-avatar">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="adm-user-info">
              <div className="adm-user-name">{user?.name || "Administrator"}</div>
              <div className="adm-user-role">{user?.role || "Super Admin"}</div>
            </div>
          </div>
          <button
            type="button"
            className="adm-btn-logout-mini"
            onClick={handleLogout}
            title="Log Out"
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="adm-main-wrapper">
        {/* Topbar matching reference image: White background, hamburger, language dropdown, bell with badge 4, globe storefront, profile */}
        <header className="adm-topbar" ref={topbarRef}>
          <div className="adm-topbar-left">
            <button
              type="button"
              className="adm-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation"
            >
              ☰
            </button>
            <button
              type="button"
              className="adm-desktop-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle Sidebar width"
            >
              ☰
            </button>
            <div className="adm-breadcrumbs-wrap">
              <span className="adm-brand-prefix">AMIDA</span>
              <span className="adm-breadcrumb-sep">/</span>
              <span className="adm-breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="adm-topbar-right">
            {/* Language Selector Dropdown Pill (matching 'English ˅' in screenshot) */}
            <div className="adm-topbar-dropdown-wrap">
              <button
                type="button"
                className="adm-lang-pill-btn"
                onClick={() => {
                  setLangDropdown(!langDropdown);
                  setNotifDropdown(false);
                  setProfileDropdown(false);
                }}
              >
                <span>{selectedLang}</span>
                <span className="adm-dropdown-caret">▾</span>
              </button>
              {langDropdown && (
                <div className="adm-dropdown-menu adm-lang-menu">
                  <button
                    type="button"
                    className={`adm-dropdown-item ${selectedLang === "English" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedLang("English");
                      setLangDropdown(false);
                    }}
                  >
                    🇺🇸 English (US)
                  </button>
                  <button
                    type="button"
                    className={`adm-dropdown-item ${selectedLang === "English (UK)" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedLang("English (UK)");
                      setLangDropdown(false);
                    }}
                  >
                    🇬🇧 English (UK)
                  </button>
                  <button
                    type="button"
                    className={`adm-dropdown-item ${selectedLang === "French" ? "active" : ""}`}
                    onClick={() => {
                      setSelectedLang("French");
                      setLangDropdown(false);
                    }}
                  >
                    🇫🇷 French
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell with Red Badge 4 (matching screenshot '🔔 4') */}
            <div className="adm-topbar-dropdown-wrap">
              <button
                type="button"
                className="adm-icon-btn adm-notif-btn"
                onClick={() => {
                  setNotifDropdown(!notifDropdown);
                  setLangDropdown(false);
                  setProfileDropdown(false);
                }}
                title="System Notifications"
              >
                <span className="adm-bell-icon">🔔</span>
                <span className="adm-notif-badge">4</span>
              </button>
              {notifDropdown && (
                <div className="adm-dropdown-menu adm-notif-menu">
                  <div className="adm-notif-header">
                    <strong>Notifications</strong>
                    <span className="adm-badge-count">4 New</span>
                  </div>
                  <div className="adm-notif-list">
                    {notifications.map((n) => (
                      <div key={n.id} className="adm-notif-item">
                        <div className="adm-notif-dot" />
                        <div className="adm-notif-body">
                          <div className="adm-notif-title">{n.title}</div>
                          <div className="adm-notif-time">{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="adm-notif-footer">
                    <button
                      type="button"
                      className="adm-btn-text"
                      onClick={() => {
                        setActivePage("orders");
                        setNotifDropdown(false);
                      }}
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Storefront Globe Icon Button */}
            <a
              href="#/"
              target="_blank"
              rel="noreferrer"
              className="adm-icon-btn adm-store-btn"
              title="View Live Storefront in new tab"
            >
              <span className="adm-globe-icon">🌐</span>
            </a>

            {/* Admin Profile Avatar Pill */}
            <div className="adm-topbar-dropdown-wrap">
              <button
                type="button"
                className="adm-profile-pill-btn"
                onClick={() => {
                  setProfileDropdown(!profileDropdown);
                  setLangDropdown(false);
                  setNotifDropdown(false);
                }}
              >
                <div className="adm-topbar-avatar">
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </div>
                <span className="adm-profile-name">{user?.name || "Admin"}</span>
                <span className="adm-dropdown-caret">▾</span>
              </button>
              {profileDropdown && (
                <div className="adm-dropdown-menu adm-profile-menu">
                  <div className="adm-profile-dropdown-header">
                    <strong>{user?.name || "Administrator"}</strong>
                    <div className="adm-user-email">{user?.email || "admin@acme.com"}</div>
                  </div>
                  <div className="adm-dropdown-divider" />
                  <button
                    type="button"
                    className="adm-dropdown-item"
                    onClick={() => {
                      setActivePage("settings");
                      setProfileDropdown(false);
                    }}
                  >
                    ⚙️ Account Settings
                  </button>
                  <button
                    type="button"
                    className="adm-dropdown-item"
                    onClick={() => {
                      setActivePage("plugins");
                      setProfileDropdown(false);
                    }}
                  >
                    🔌 Plugin Settings
                  </button>
                  <div className="adm-dropdown-divider" />
                  <button
                    type="button"
                    className="adm-dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="adm-content">
          {children}
        </main>
      </div>

      {/* Database Synchronize & Codebase Backup Modal */}
      {showSyncModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal-content" style={{ maxWidth: "620px" }}>
            <div className="adm-modal-header" style={{ background: "linear-gradient(135deg, #0b132b, #1e293b)", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "24px" }}>🔄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", color: "#fff" }}>Database Codebase Synchronization</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                    Seamlessly backup and merge your MySQL database directly with the source code repository
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                style={{ color: "#fff" }}
                onClick={() => setShowSyncModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="adm-modal-body" style={{ padding: "24px" }}>
              {syncLoading && !syncStatus ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div className="adm-spinner" style={{ margin: "0 auto 12px" }} />
                  <p style={{ color: "#64748b", fontSize: "13px" }}>Inspecting database and codebase snapshot...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {/* Status Banner */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Current MySQL Database</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                        {syncStatus?.current_db?.total_records || 0} Records
                      </div>
                      <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 600, marginTop: "2px" }}>
                        ● {syncStatus?.current_db?.total_tables || 0} Tables Live
                      </div>
                    </div>

                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Codebase SQL Snapshot</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: syncStatus?.has_backup ? "#5b45ff" : "#f59e0b", marginTop: "4px" }}>
                        {syncStatus?.has_backup ? syncStatus.backup_file_size : "No Backup Yet"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {syncStatus?.backup_updated_at ? `Updated: ${syncStatus.backup_updated_at}` : "Never backed up"}
                      </div>
                    </div>
                  </div>

                  {/* Explanatory Info Card */}
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 14px", fontSize: "12.5px", color: "#1e40af", lineHeight: 1.45 }}>
                    💡 <strong>How it works:</strong>
                    <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                      <li><strong>Backup to Codebase:</strong> Exports all products, categories, orders, and settings into <code>backend/database/sync/acme_latest_backup.sql</code>.</li>
                      <li><strong>Merge / Restore to MySQL:</strong> When deploying this code anywhere (another PC, laptop, or live cPanel/VPS), click <strong>Merge &amp; Restore</strong> to immediately populate and sync the database!</li>
                    </ul>
                  </div>

                  {/* Actions Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "4px" }}>
                    {/* Action 1: Export */}
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>💾</span> 1. Backup to Codebase
                        </div>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 14px", lineHeight: 1.4 }}>
                          Dumps the latest MySQL tables &amp; records into source files for version control and migration.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="adm-btn adm-btn-primary"
                        style={{ width: "100%", padding: "10px" }}
                        disabled={syncOp !== "idle"}
                        onClick={handleBackupDb}
                      >
                        {syncOp === "backup" ? "Exporting Database..." : "Export & Backup DB →"}
                      </button>
                    </div>

                    {/* Action 2: Merge / Restore */}
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>⚡</span> 2. Merge to MySQL
                        </div>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 14px", lineHeight: 1.4 }}>
                          Reads the codebase SQL snapshot and merges it directly into the local target MySQL database.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="adm-btn adm-btn-success"
                        style={{ width: "100%", padding: "10px" }}
                        disabled={syncOp !== "idle" || !syncStatus?.has_backup}
                        onClick={handleRestoreDb}
                      >
                        {syncOp === "restore" ? "Merging Database..." : "Merge & Restore DB →"}
                      </button>
                    </div>
                  </div>

                  {/* Direct SQL Download Link */}
                  {syncStatus?.has_backup && (
                    <div style={{ textAlign: "center", paddingTop: "6px" }}>
                      <a
                        href={getDbBackupDownloadUrl()}
                        download="amida_database_backup.sql"
                        className="adm-btn adm-btn-outline adm-btn-sm"
                        style={{ color: "#475569" }}
                      >
                        📥 Download SQL Dump File ({syncStatus.backup_file_size})
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setShowSyncModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
