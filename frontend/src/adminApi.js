function getApiBase() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname || "/";
    const base = pathname
      .replace(/\/myadmin.*$/i, "")
      .replace(/\/index\.(html|php).*$/i, "")
      .replace(/\/+$/, "");
    return `${base}/backend/public/api`;
  }
  return "/backend/public/api";
}

export { getApiBase };

const API_BASE = getApiBase();

export function getAdminToken() {
  return localStorage.getItem("acme_admin_token") || "";
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem("acme_admin_token", token);
  } else {
    localStorage.removeItem("acme_admin_token");
  }
}

export function getStoredAdminUser() {
  try {
    const raw = localStorage.getItem("acme_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user) {
  if (user) {
    localStorage.setItem("acme_admin_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("acme_admin_user");
  }
}

async function adminRequest(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    setAdminToken(null);
    setStoredAdminUser(null);
    if (!endpoint.includes("/login")) {
      window.dispatchEvent(new CustomEvent("acme-admin-unauthorized"));
    }
  }

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}

// Auth
export async function adminLogin(login, password) {
  const data = await adminRequest("/admin/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });
  if (data.token) {
    setAdminToken(data.token);
    setStoredAdminUser(data.user);
  }
  return data;
}

export async function adminLogout() {
  try {
    await adminRequest("/admin/logout", { method: "POST" });
  } finally {
    setAdminToken(null);
    setStoredAdminUser(null);
  }
}

export async function adminGetMe() {
  return adminRequest("/admin/me");
}

// Dashboard Analytics & Charts
export async function adminGetDashboardStats() {
  return adminRequest("/admin/dashboard/stats");
}

// Products
export async function adminGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/products${qs ? `?${qs}` : ""}`);
}

export async function adminCreateProduct(payload) {
  return adminRequest("/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateProduct(id, payload) {
  return adminRequest(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteProduct(id) {
  return adminRequest(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function adminToggleTopPick(id) {
  return adminRequest(`/admin/products/${id}/toggle-top-pick`, {
    method: "POST",
  });
}

export async function adminUploadProductImage(fileOrBlobOrBase64) {
  const token = getAdminToken();
  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (typeof fileOrBlobOrBase64 === "string") {
    // Base64 string upload
    const res = await fetch(`${API_BASE}/admin/products/upload-image`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_base64: fileOrBlobOrBase64 }),
    });
    return res.json();
  } else {
    // File or Blob upload via multipart/form-data
    const formData = new FormData();
    formData.append("image", fileOrBlobOrBase64);
    const res = await fetch(`${API_BASE}/admin/products/upload-image`, {
      method: "POST",
      headers,
      body: formData,
    });
    return res.json();
  }
}

// Sales Orders (Active & Incomplete Orders)
export async function adminGetOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/orders${qs ? `?${qs}` : ""}`);
}

export async function adminGetOrder(id) {
  return adminRequest(`/admin/orders/${id}`);
}

export async function adminUpdateOrderStatus(id, payload) {
  return adminRequest(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteOrder(id) {
  return adminRequest(`/admin/orders/${id}`, {
    method: "DELETE",
  });
}

// Categories
export async function adminGetCategories() {
  return adminRequest("/admin/categories");
}

export async function adminCreateCategory(payload) {
  return adminRequest("/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateCategory(id, payload) {
  return adminRequest(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteCategory(id) {
  return adminRequest(`/admin/categories/${id}`, {
    method: "DELETE",
  });
}

// Inquiries / RFQ
export async function adminGetInquiries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/inquiries${qs ? `?${qs}` : ""}`);
}

export async function adminGetInquiry(id) {
  return adminRequest(`/admin/inquiries/${id}`);
}

export async function adminUpdateInquiryStatus(id, status, notes = "") {
  return adminRequest(`/admin/inquiries/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, admin_notes: notes }),
  });
}

export async function adminReplyInquiry(id, replyMessage, subject = "") {
  return adminRequest(`/admin/inquiries/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ reply_message: replyMessage, subject }),
  });
}

export async function adminDeleteInquiry(id) {
  return adminRequest(`/admin/inquiries/${id}`, {
    method: "DELETE",
  });
}

// Website Setup: Sliders, Banners, Appearance
export async function adminGetWebsiteSetup() {
  return adminRequest("/admin/website/setup");
}

export async function adminUpdateSliders(sliders) {
  return adminRequest("/admin/website/sliders", {
    method: "POST",
    body: JSON.stringify({ sliders }),
  });
}

export async function adminUpdateSectionBanners(section_banners) {
  return adminRequest("/admin/website/section-banners", {
    method: "POST",
    body: JSON.stringify({ section_banners }),
  });
}

export async function adminUpdateAppearance(payload) {
  return adminRequest("/admin/website/appearance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Settings
export async function adminGetSettings() {
  return adminRequest("/admin/settings");
}

export async function adminUpdateSettings(settings, group = "general") {
  return adminRequest("/admin/settings", {
    method: "POST",
    body: JSON.stringify({ settings, group }),
  });
}

export async function adminTestSmtp(payload) {
  return adminRequest("/admin/settings/test-smtp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Users
export async function adminGetUsers() {
  return adminRequest("/admin/users");
}

export async function adminCreateUser(payload) {
  return adminRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateUser(id, payload) {
  return adminRequest(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteUser(id) {
  return adminRequest(`/admin/users/${id}`, {
    method: "DELETE",
  });
}

// SEO
export async function adminGetSeo() {
  return adminRequest("/admin/seo");
}

export async function adminUpdateSeo(payload) {
  return adminRequest("/admin/seo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Security & IP Firewall
export async function adminGetBlockedIps(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/security/blocked-ips${qs ? `?${qs}` : ""}`);
}

export async function adminUnblockIp(ip_address) {
  return adminRequest("/admin/security/unblock-ip", {
    method: "POST",
    body: JSON.stringify({ ip_address }),
  });
}

export async function adminBlockIp(ip_address, reason = "") {
  return adminRequest("/admin/security/block-ip", {
    method: "POST",
    body: JSON.stringify({ ip_address, reason }),
  });
}

export async function adminDeleteBlockedIp(id) {
  return adminRequest(`/admin/security/blocked-ips/${id}`, {
    method: "DELETE",
  });
}

// Database Synchronization & Codebase Backup
export async function adminGetDbSyncStatus() {
  return adminRequest("/admin/database/status");
}

export async function adminBackupDatabase() {
  return adminRequest("/admin/database/backup", {
    method: "POST",
  });
}

export async function adminRestoreDatabase() {
  return adminRequest("/admin/database/restore", {
    method: "POST",
  });
}

export function getDbBackupDownloadUrl() {
  return `${getApiBase()}/admin/database/download`;
}

