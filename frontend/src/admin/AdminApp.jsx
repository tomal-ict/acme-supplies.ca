import { useEffect, useState } from "react";
import { getAdminToken, getStoredAdminUser } from "../adminApi";
import AdminCategoriesPage from "./AdminCategoriesPage";
import AdminDashboardPage from "./AdminDashboardPage";
import AdminGeneralSettingsPage from "./AdminGeneralSettingsPage";
import AdminInquiriesPage from "./AdminInquiriesPage";
import AdminLayout from "./AdminLayout";
import AdminLoginPage from "./AdminLoginPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminProductsPage from "./AdminProductsPage";
import AdminSecurityPage from "./AdminSecurityPage";
import AdminWebsiteSetupPage from "./AdminWebsiteSetupPage";

export default function AdminApp() {
  const [token, setToken] = useState(getAdminToken());
  const [user, setUser] = useState(getStoredAdminUser());
  const [activePage, setActivePage] = useState("dashboard");
  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken("");
      setUser(null);
    };
    window.addEventListener("acme-admin-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("acme-admin-unauthorized", handleUnauthorized);
  }, []);

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setToken(getAdminToken());
    setUser(loggedInUser);
    setActivePage("dashboard");
    showToast(`Welcome back, ${loggedInUser.name}!`, "success");
  };

  if (!token) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <AdminLayout
        activePage={activePage}
        setActivePage={setActivePage}
        unreadInquiries={unreadInquiries}
        onToast={showToast}
      >
        {activePage === "dashboard" && (
          <AdminDashboardPage setActivePage={setActivePage} onToast={showToast} />
        )}
        {activePage === "orders" && (
          <AdminOrdersPage onToast={showToast} initialTab="active" />
        )}
        {activePage === "incomplete_orders" && (
          <AdminOrdersPage onToast={showToast} initialTab="incomplete" />
        )}
        {activePage === "products" && <AdminProductsPage onToast={showToast} />}
        {activePage === "categories" && <AdminCategoriesPage onToast={showToast} />}
        {activePage === "inquiries" && (
          <AdminInquiriesPage
            onToast={showToast}
            onRefreshBadge={(count) => setUnreadInquiries(count)}
          />
        )}
        {activePage === "website_setup" && <AdminWebsiteSetupPage onToast={showToast} />}
        {activePage === "settings" && <AdminGeneralSettingsPage onToast={showToast} />}
        {activePage === "security" && <AdminSecurityPage onToast={showToast} />}
      </AdminLayout>

      {/* Floating Toast Alerts */}
      <div className="adm-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.type}`}>
            <span>{t.type === "success" ? "✓" : "⚠"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
