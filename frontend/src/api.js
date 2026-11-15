import { decryptEnvelope, encryptEnvelope, signRequestHeaders } from "./crypto";
import FALLBACK_PRODUCTS from "./fallback-products.json";

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

function normalizeImage(img) {
  return img && img.startsWith("/") ? `.${img}` : img;
}

export async function fetchProducts(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const headers = await signRequestHeaders("GET", "/api/products");
    const res = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ""}`, { headers });
    if (!res.ok) throw new Error("API error");
    const envelope = await res.json();
    const json = await decryptEnvelope(envelope);
    return (json.data || []).map((p) => ({ ...p, image: normalizeImage(p.image) }));
  } catch {
    let items = [...FALLBACK_PRODUCTS];
    if (params.category && params.category !== "All") {
      items = params.category === "TopPicks"
        ? items.filter((p) => p.is_top_pick)
        : items.filter((p) => p.category === params.category);
    }
    if (params.sub) {
      items = items.filter((p) => p.sub_category === params.sub);
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (params.promo) {
      items = items.filter((p) => p.promo_discount > 0);
    }
    if (params.sort === "price-asc") items.sort((a, b) => a.price_min - b.price_min);
    if (params.sort === "price-desc") items.sort((a, b) => b.price_min - a.price_min);
    return items;
  }
}

export async function fetchPublicSettings() {
  try {
    const headers = await signRequestHeaders("GET", "/api/settings");
    const res = await fetch(`${API_BASE}/settings`, { headers });
    if (!res.ok) throw new Error("Settings fetch failed");
    const envelope = await res.json();
    const json = await decryptEnvelope(envelope);
    return json.settings || {};
  } catch {
    return {
      site_name: "AMIDA OFFICE SUPPLIES LIMITED",
      site_tagline: "Price Quality Service",
      logo_url: "./images/logo.png",
      announcement_text: "Welcome to AMIDA OFFICE SUPPLIES LIMITED • Price Quality Service",
      footer_copyright: "© 2027 Tomal Krishna Howlader. All rights reserved.",
      footer_tagline: "Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada",
      contact_address: "126 Main Street, Acme, AB T0M 0A0, Canada",
      contact_hours: "AM 9:00 - PM 22:00",
      contact_email: "acme.info.swapan@gmail.com",
      contact_phone: "+1 604 316 8138",
      ceo_name: "Swapan Kumar Bairagi",
      ceo_title: "Chief Executive Officer (CEO)",
      site_url: "https://www.acme-supplies.ca",
    };
  }
}

export async function submitInquiry(payload) {
  try {
    const sigHeaders = await signRequestHeaders("POST", "/api/inquiries");
    const encryptedBody = await encryptEnvelope(payload);
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...sigHeaders,
      },
      body: JSON.stringify(encryptedBody),
    });
    if (!res.ok) throw new Error("Request failed");
    const envelope = await res.json();
    return await decryptEnvelope(envelope);
  } catch {
    return { message: "Inquiry recorded locally (start Laravel backend to persist to DB)." };
  }
}

// Customer Auth & Account Management
export async function customerRegister(payload) {
  try {
    const res = await fetch(`${API_BASE}/customer/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
  } catch (err) {
    throw err;
  }
}

export async function customerLogin(payload) {
  try {
    const res = await fetch(`${API_BASE}/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Invalid credentials");
    return data;
  } catch (err) {
    throw err;
  }
}

export async function customerGetOrders(email) {
  try {
    const res = await fetch(`${API_BASE}/customer/orders?email=${encodeURIComponent(email)}`, {
      headers: { Accept: "application/json" },
    });
    return await res.json();
  } catch {
    return { success: false, orders: [] };
  }
}

// Complete Order / Checkout (Both for Logged In Customers and Guests)
export async function customerCheckout(payload) {
  try {
    const res = await fetch(`${API_BASE}/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Checkout failed");
    return data;
  } catch (err) {
    throw err;
  }
}

export async function customerAbandonCart(payload) {
  try {
    const res = await fetch(`${API_BASE}/orders/abandon`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function reportSecurity404(path) {
  try {
    const res = await fetch(`${API_BASE}/security/report-404`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ path }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function checkSecurityStatus() {
  try {
    const res = await fetch(`${API_BASE}/security/check-status`, {
      headers: { Accept: "application/json" },
    });
    return await res.json();
  } catch {
    return { success: false, is_blocked: false };
  }
}
