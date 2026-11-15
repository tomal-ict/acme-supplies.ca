import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogout, getStoredAdminUser } from "../adminApi";
import "./AdminStyles.css";

export default function AdminLayout({ activePage, setActivePage, children, unreadInquiries = 0, onToast }) {
  const [user, setUser] = useState(getStoredAdminUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getStoredAdminUser());
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to end your administration session?")) {
      await adminLogout();
      navigate("/myadmin");
      window.location.reload();
    }
  };

  const navGroups = [
    {
      group: "Overview",
      items: [
        { key: "dashboard", label: "Dashboard", icon: "📊" },
      ],
    },
    {
      group: "Sales & Orders",
      items: [
        { key: "orders", label: "All Orders", icon: "🛒" },
        { key: "incomplete_orders", label: "Incomplete Orders", icon: "⏳" },
      ],
    },
    {
      group: "Catalog Management",
      items: [
        { key: "products", label: "Products Catalog", icon: "📦" },
        { key: "categories", label: "Categories & Tree", icon: "🏷️" },
      ],
    },
    {
      group: "Customer Communications",
      items: [
        { key: "inquiries", label: "Inquiries & RFQs", icon: "💬", badge: unreadInquiries },
      ],
    },
    {
      group: "Storefront Design",
      items: [
        { key: "website_setup", label: "Website Setup & Sliders", icon: "🖼️" },
      ],
    },
    {
      group: "Setup & Configurations",
      items: [
        { key: "settings", label: "General Settings", icon: "⚙️" },
      ],
    },
    {
      group: "Security & Firewall",
      items: [
        { key: "security", label: "IP Blocklist & 404 Defense", icon: "🛡️" },
      ],
    },
  ];

  const getPageTitle = () => {
    for (const g of navGroups) {
      const match = g.items.find((item) => item.key === activePage);
      if (match) return match.label;
    }
    return "Dashboard";
  };

  return (
    <div className="adm-app">
      {/* Sidebar (Deep Midnight Navy - AIZ / Active eCommerce Style) */}
      <aside className={`adm-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="adm-sidebar-brand">
          <span className="adm-brand-badge">AMIDA</span>
          <div>
            <div className="adm-brand-text">Admin Panel</div>
            <span className="adm-brand-sub">Enterprise Suite</span>
          </div>
        </div>

        <nav className="adm-sidebar-nav">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: "12px" }}>
              <div className="adm-nav-group-label">{group.group}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`adm-nav-item ${activePage === item.key ? "active" : ""}`}
                    onClick={() => {
                      setActivePage(item.key);
                      setMobileOpen(false);
                    }}
                  >
                    <span>
                      <span className="adm-nav-icon">{item.icon}</span>
                      {item.label}
                    </span>
                    {item.badge > 0 && <span className="adm-nav-pill">{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

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
            className="adm-btn-logout"
            onClick={handleLogout}
            title="Log out"
            style={{ padding: "5px 9px", fontSize: "11px" }}
          >
            Exit
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="adm-main-wrapper">
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button
              type="button"
              className="adm-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation"
            >
              &#9776;
            </button>
            <div className="adm-breadcrumbs">
              AMIDA Admin &bull; <strong>{getPageTitle()}</strong>
            </div>
          </div>

          <div className="adm-topbar-actions">
            <a
              href="#/"
              target="_blank"
              rel="noreferrer"
              className="adm-btn-store"
              title="Open Storefront in new tab"
            >
              <span>View Live Store</span> &#8599;
            </a>
            <button
              type="button"
              className="adm-btn-logout"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </header>

        <main className="adm-content">
          {children}
        </main>
      </div>
    </div>
  );
}
