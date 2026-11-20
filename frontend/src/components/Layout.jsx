import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import OrderVoucher from "./OrderVoucher";
import {
  customerCheckout,
  customerGetOrders,
  customerLogin,
  customerRegister,
  fetchPublicSettings,
  submitInquiry,
} from "../api";

export default function Layout({ children, onOpenModal, modalState, onCloseModal }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Public Storefront Settings
  const [siteSettings, setSiteSettings] = useState({
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
    campaign_bar_text: "Get ready for 2027: up to 20% off 5M+ picks",
    campaign_bar_link: "/promotion",
  });

  const navigate = useNavigate();

  // Client User Auth State
  const [clientUser, setClientUser] = useState(() => {
    try {
      const stored = localStorage.getItem("acme_client_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Client Auth Modal State ('login' | 'register' | 'orders')
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", phone: "", company: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [customerOrdersList, setCustomerOrdersList] = useState([]);

  // Cart State
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("acme_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Checkout State (Supports Guest Checkout and Logged-in Customers)
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: clientUser?.name || "",
    customer_email: clientUser?.email || "",
    customer_phone: clientUser?.phone || "",
    shipping_address: "",
    delivery_area: "inside_city", // 'inside_city' | 'outside_city'
    payment_method: "Cash on Delivery", // 'Cash on Delivery' | 'Online Payment'
    notes: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [pauseNoticeOpen, setPauseNoticeOpen] = useState(false);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("acme_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Listen to Global "acme-add-to-cart" Event
  useEffect(() => {
    const handleAddToCart = (e) => {
      const { product, quantity = 1, unitPrice } = e.detail || {};
      if (!product) return;

      const finalPrice = Number(unitPrice || product.price || product.price_min || 10.0);

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.sku === product.sku);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          if (unitPrice) updated[existingIdx].price = finalPrice;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: product.id || Date.now(),
              sku: product.sku,
              title: product.title,
              price: finalPrice,
              price_max: Number(product.price_max || finalPrice),
              image: product.image,
              category: product.category,
              quantity: quantity,
            },
          ];
        }
      });

      // Automatically slide in the POS Terminal Drawer
      setCartOpen(true);

      // Show toast alert
      setToastMsg(`✓ Added ${product.title.slice(0, 32)}... to Cart!`);
      setTimeout(() => setToastMsg(""), 3500);
    };

    window.addEventListener("acme-add-to-cart", handleAddToCart);
    return () => window.removeEventListener("acme-add-to-cart", handleAddToCart);
  }, []);

  // Fetch Public Settings on Load
  useEffect(() => {
    fetchPublicSettings().then((s) => {
      if (s && Object.keys(s).length > 0) {
        setSiteSettings((prev) => ({ ...prev, ...s }));
      }
    });
  }, []);

  // Load customer orders if modal opens on orders tab
  useEffect(() => {
    if (authModalOpen && authTab === "orders" && clientUser?.email) {
      customerGetOrders(clientUser.email).then((res) => {
        if (res.success) setCustomerOrdersList(res.orders || []);
      });
    }
  }, [authModalOpen, authTab, clientUser]);

  // Keep checkout form in sync with logged-in user
  useEffect(() => {
    if (clientUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || clientUser.name,
        customer_email: prev.customer_email || clientUser.email,
        customer_phone: prev.customer_phone || clientUser.phone || "",
      }));
    }
  }, [clientUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products${searchTerm.trim() ? `?q=${encodeURIComponent(searchTerm.trim())}` : ""}`);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const res = await submitInquiry({
      email,
      subject: subject || modalState.product || "General B2B Inquiry",
      message,
      type: modalState.mode === "chat" ? "chat" : "rfq",
    });
    setStatusMsg(res.message || "Inquiry sent!");
    setEmail("");
    setMessage("");
    setTimeout(() => {
      setStatusMsg("");
      onCloseModal();
    }, 1200);
  };

  // Cart Helpers
  const updateCartQuantity = (sku, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.sku === sku) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeCartItem = (sku) => {
    setCartItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Delivery & Free Shipping Calculation from Admin Settings
  const insideCityCharge = parseFloat(siteSettings.delivery_charge_inside) || 60;
  const outsideCityCharge = parseFloat(siteSettings.delivery_charge_outside) || 120;
  const freeThreshold = parseFloat(siteSettings.free_shipping_threshold) || 5000;
  const isFreeShippingEnabled = siteSettings.free_shipping_enabled !== "0" && siteSettings.free_shipping_enabled !== false;

  const isFreeDelivery = isFreeShippingEnabled && cartTotal >= freeThreshold;
  const currentDeliveryCharge = isFreeDelivery
    ? 0
    : (checkoutForm.delivery_area === "outside_city" ? outsideCityCharge : insideCityCharge);
  const finalGrandTotal = cartTotal + currentDeliveryCharge;

  // Tawk.to live chat integration if active
  useEffect(() => {
    if (
      siteSettings.plugin_tawk_active === "1" &&
      siteSettings.plugin_tawk_property_id &&
      siteSettings.plugin_tawk_widget_id
    ) {
      if (!document.getElementById("tawk-script")) {
        const s = document.createElement("script");
        s.id = "tawk-script";
        s.async = true;
        s.src = `https://embed.tawk.to/${siteSettings.plugin_tawk_property_id}/${siteSettings.plugin_tawk_widget_id}`;
        s.charset = "UTF-8";
        s.setAttribute("crossorigin", "*");
        document.head.appendChild(s);
      }
    }
  }, [siteSettings.plugin_tawk_active, siteSettings.plugin_tawk_property_id, siteSettings.plugin_tawk_widget_id]);

  // Order Pause / Suspension Calculation
  const isPauseConfigured = siteSettings.order_pause_enabled === "1" || siteSettings.order_pause_enabled === true;
  let isOrderPaused = false;
  let pauseRemainingText = "";

  if (isPauseConfigured) {
    if (siteSettings.order_pause_until) {
      const diffMs = new Date(siteSettings.order_pause_until).getTime() - Date.now();
      if (diffMs > 0) {
        isOrderPaused = true;
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        if (days > 0) {
          pauseRemainingText = `Orders resume in ${days} day(s) ${hours} hr(s)`;
        } else if (hours > 0) {
          pauseRemainingText = `Orders resume in ${hours} hr(s) ${minutes} min(s)`;
        } else {
          pauseRemainingText = `Orders resume in ${minutes} min(s)`;
        }
      } else {
        isOrderPaused = false;
      }
    } else {
      isOrderPaused = true;
      pauseRemainingText = "Ordering is currently paused";
    }
  }

  // Auth Handlers
  const handleClientLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await customerLogin({ email: authForm.email, password: authForm.password });
      if (res.success) {
        setClientUser(res.user);
        localStorage.setItem("acme_client_user", JSON.stringify(res.user));
        localStorage.setItem("acme_client_token", res.token);
        setAuthModalOpen(false);
        setToastMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => setToastMsg(""), 3500);
      }
    } catch (err) {
      setAuthError(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleClientRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await customerRegister(authForm);
      if (res.success) {
        setClientUser(res.user);
        localStorage.setItem("acme_client_user", JSON.stringify(res.user));
        localStorage.setItem("acme_client_token", res.token);
        setAuthModalOpen(false);
        setToastMsg(`Account created! Welcome, ${res.user.name}.`);
        setTimeout(() => setToastMsg(""), 3500);
      }
    } catch (err) {
      setAuthError(err.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleClientLogout = () => {
    setClientUser(null);
    localStorage.removeItem("acme_client_user");
    localStorage.removeItem("acme_client_token");
    setAuthModalOpen(false);
    setToastMsg("You have logged out of your account.");
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Checkout Handler (Both Guest and Logged-in Customer)
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (isOrderPaused) {
      setCheckoutOpen(false);
      setPauseNoticeOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      return;
    }
    setCheckoutLoading(true);
    try {
      const payload = {
        customer_name: checkoutForm.customer_name,
        customer_email: checkoutForm.customer_email,
        customer_phone: checkoutForm.customer_phone,
        shipping_address: checkoutForm.shipping_address,
        delivery_area: checkoutForm.delivery_area,
        delivery_charge: currentDeliveryCharge,
        subtotal: cartTotal,
        total_amount: finalGrandTotal,
        payment_method: checkoutForm.payment_method,
        notes: checkoutForm.notes,
        items: cartItems.map((i) => ({
          title: i.title,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      };

      const res = await customerCheckout(payload);
      if (res.success) {
        setCompletedOrder(res.order);
        setCartItems([]);
        localStorage.removeItem("acme_cart");
        setCheckoutOpen(false);
        setCartOpen(false);
      }
    } catch (err) {
      alert("Checkout error: " + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "30px",
            fontSize: "13.5px",
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid #0284c7",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeUp 0.3s ease",
          }}
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Official Campaign Banner (Top Crimson/Pink Gradient) */}
      <div className="alibaba-campaign-bar">
        <div className="container alibaba-campaign-inner">
          <span className="alibaba-campaign-text">
            {siteSettings.campaign_bar_text || "Get ready for 2027: up to 20% off 5M+ picks"}
          </span>
          <Link to={siteSettings.campaign_bar_link || "/promotion"} className="alibaba-campaign-link">
            Get now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>

      {/* 2. Official Global White Header with Wide Pill Search Bar */}
      <header className="alibaba-global-header">
        <div className="container alibaba-global-inner">
          {/* Rounded Pill Search Container */}
          <form className="alibaba-search-box" onSubmit={handleSearch} role="search">
            <input
              type="text"
              className="alibaba-search-input"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search store products"
            />
            <button type="button" className="alibaba-search-camera-btn" title="Image search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
            <button type="submit" className="alibaba-search-submit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search
            </button>
          </form>

          {/* Right Action Icons & Client Account Controls */}
          <div className="alibaba-global-actions">
            <div className="action-deliver-to" title="Deliver to location">
              <span className="action-deliver-to-label">Deliver to:</span>
              <div className="action-deliver-to-val">
                <span className="flag-bd">🇧🇩</span>
                <strong>BD</strong>
              </div>
            </div>

            <div className="action-lang-currency" title="Language & Currency">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>English-USD</span>
            </div>

            {/* Shopping Cart Button */}
            <button
              type="button"
              className="action-cart"
              title="View Shopping Cart"
              onClick={() => setCartOpen(true)}
              style={{ position: "relative", cursor: "pointer", background: "none", border: "none" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-6px",
                    background: "#ff6a00",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "1px 6px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Client User Profile or Sign In */}
            {clientUser ? (
              <div
                onClick={() => {
                  setAuthTab("orders");
                  setAuthModalOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
                title="Client Account & Orders"
              >
                <span
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#0284c7",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {clientUser.name.charAt(0).toUpperCase()}
                </span>
                <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {clientUser.name}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="action-signin"
                onClick={() => {
                  setAuthTab("login");
                  setAuthModalOpen(true);
                }}
                style={{ cursor: "pointer", background: "none", border: "none" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Sign in</span>
              </button>
            )}

            {/* Create Account or Orders Button */}
            {clientUser ? (
              <button
                type="button"
                className="action-create-account"
                onClick={() => {
                  setAuthTab("orders");
                  setAuthModalOpen(true);
                }}
              >
                My Orders
              </button>
            ) : (
              <button
                type="button"
                className="action-create-account"
                onClick={() => {
                  setAuthTab("register");
                  setAuthModalOpen(true);
                }}
              >
                Create account
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Official Secondary Supplier Identity Header */}
      <header className="store-header">
        <div className="container store-header-inner">
          <div className="brand-block">
            <div className="brand-logo-box">
              <Link to="/" className="brand-logo" title={siteSettings.site_name}>
                <img
                  src={siteSettings.logo_url || "./images/logo.png"}
                  alt={siteSettings.site_name}
                  style={{ height: "54px", width: "auto", objectFit: "contain", display: "block" }}
                />
              </Link>
              <div className="brand-slogan">{siteSettings.site_tagline || "Price Quality Service"}</div>
              <div className="cert-mini-badges">
                <span className="cert-pill">ISO9001</span>
                <span className="cert-pill">ISO14001</span>
                <span className="cert-pill">REACH</span>
                <span className="cert-pill">RoHS</span>
                <span className="cert-pill">CE</span>
              </div>
            </div>

            <div className="company-info-block">
              <div className="company-title-row">
                <h2 className="company-name">{siteSettings.site_name || "AMIDA OFFICE SUPPLIES LIMITED"}</h2>
                <span className="verified-badge">&#10003; Verified Custom Manufacturer (18yrs)</span>
              </div>
              <div className="company-meta">
                Main Products: Toner Cartridge, Ink Cartridge, Ink, Toner Powder, Thermal Printers, Ribbons
              </div>
              <div className="trust-pills">
                <span className="trust-pill" style={{ color: "#0284c7", fontWeight: 700 }}>
                  CEO: {siteSettings.ceo_name || "Swapan Kumar Bairagi"}
                </span>
                <span className="trust-pill">📍 {siteSettings.contact_address ? "Acme, AB, Canada" : "Canada"}</span>
                <span className="trust-pill">Price Quality Service</span>
                <span className="trust-pill">Design-based Customization</span>
                <span className="trust-pill">Years in Industry: 25</span>
                <span className="trust-pill">Floorspace: 75,000 m&sup2;</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-orange"
              onClick={() => setCartOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              🛒 Cart ({cartItemCount})
            </button>
            <button type="button" className="btn btn-outline-orange" onClick={() => onOpenModal("rfq", "General Supplier Inquiry")}>
              Contact Supplier
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onOpenModal("chat", "Live Supplier Chat")}>
              Chat Now
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Bar with Dropdown Sub-Menus */}
      <nav className="main-nav">
        <div className="container main-nav-inner">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
            </li>
            <li className="has-dropdown">
              <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
                Products <span className="caret">&#9662;</span>
              </NavLink>
              <div className="dropdown-menu">
                <Link to="/products?category=Patent%20Gear%20Products">Patent Gear Toner Cartridges</Link>
                <Link to="/products?category=Monochrome%20Cartridges">Monochrome Cartridges</Link>
                <Link to="/products?category=Color%20Cartridges">Color Laser Cartridges</Link>
                <Link to="/products?category=Inks%20%26%20Inkjets">Inks &amp; Inkjet Cartridges</Link>
                <Link to="/products?category=Bulk%20Inks">1000ml / 500ml Bulk Refill Inks</Link>
                <Link to="/products?category=Toner%20Powder">Bulk Toner Powder</Link>
                <Link to="/products?category=Thermal%20Printers">Laser &amp; Thermal POS Printers</Link>
                <Link to="/products?category=Thermal%20Paper%20Rolls">Thermal Paper Rolls</Link>
              </div>
            </li>
            <li className="has-dropdown">
              <NavLink to="/company-profile" className={({ isActive }) => (isActive ? "active" : "")}>
                Company Profile <span className="caret">&#9662;</span>
              </NavLink>
              <div className="dropdown-menu">
                <Link to="/company-profile">Company Overview &amp; Verification</Link>
                <Link to="/company-profile/feedback">Ratings &amp; Reviews (4.9 ★)</Link>
              </div>
            </li>
            <li>
              <NavLink to="/promotion" className={({ isActive }) => (isActive ? "active" : "")}>Promotion</NavLink>
            </li>
          </ul>

          <form className="nav-search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search in this store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </nav>

      {children}

      {/* Footer Section (NO ADMIN LINKS) */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-brand-row">
            <Link to="/" className="footer-logo-link" title={siteSettings.site_name}>
              <img src={siteSettings.logo_url || "./images/logo.png"} alt={siteSettings.site_name} className="footer-logo-img" />
            </Link>
            <div className="footer-brand-text">
              <strong>{siteSettings.site_name}</strong>
              <span>{siteSettings.footer_tagline || "Price Quality Service • 126 Main Street, Acme, AB T0M 0A0, Canada"}</span>
            </div>
          </div>
          <div className="footer-grid">
            <div>
              <h4>{siteSettings.site_name || "AMIDA OFFICE SUPPLIES LIMITED"}</h4>
              <ul>
                <li><Link to="/">Store Home</Link></li>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/company-profile">Company Profile</Link></li>
                <li><Link to="/promotion">Hot Promotions</Link></li>
              </ul>
            </div>
            <div>
              <h4>Product Categories</h4>
              <ul>
                <li><Link to="/products?category=Patent%20Gear%20Products">Patent Gear Toner</Link></li>
                <li><Link to="/products?category=Monochrome%20Cartridges">Monochrome Cartridges</Link></li>
                <li><Link to="/products?category=Color%20Cartridges">Color Cartridges</Link></li>
                <li><Link to="/products?category=Inks%20%26%20Inkjets">Inks &amp; Inkjets</Link></li>
                <li><Link to="/products?category=Thermal%20Paper%20Rolls">Thermal Paper Rolls</Link></li>
              </ul>
            </div>
            <div>
              <h4>Trade Assurance &amp; Service</h4>
              <ul>
                <li><Link to="/company-profile">Quality Control &amp; SGS Audit</Link></li>
                <li><a href="#rfq" onClick={(e) => { e.preventDefault(); onOpenModal("rfq", "OEM / ODM Customization"); }}>OEM / ODM Customization</a></li>
                <li><a href="#sample" onClick={(e) => { e.preventDefault(); onOpenModal("rfq", "Sample Request"); }}>Sample Request</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact &amp; Corporate Office</h4>
              <ul style={{ fontSize: "12.5px", lineHeight: "1.6" }}>
                <li><strong>{siteSettings.site_name || "AMIDA OFFICE SUPPLIES LIMITED"}</strong></li>
                <li style={{ color: "#38bdf8", fontWeight: 600 }}>
                  CEO: {siteSettings.ceo_name || "Swapan Kumar Bairagi"}
                </li>
                <li>📍 {siteSettings.contact_address || "126 Main Street, Acme, AB T0M 0A0, Canada"}</li>
                <li>📞 {siteSettings.contact_phone || "+1 604 316 8138"}</li>
                <li>✉️ {siteSettings.contact_email || "acme.info.swapan@gmail.com"}</li>
                <li>🌐 <a href="https://www.acme-supplies.ca" target="_blank" rel="noreferrer" style={{ color: "var(--primary-color)" }}>www.acme-supplies.ca</a></li>
                <li>Hours: {siteSettings.contact_hours || "AM 9:00 – PM 22:00"}</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            {siteSettings.footer_copyright || "© 2027 Tomal Krishna Howlader. All rights reserved."}
          </div>
        </div>
      </footer>

      {/* Floating Hub */}
      <div className="floating-hub">
        <button
          type="button"
          className="floating-btn btn-orange"
          onClick={() => setCartOpen(true)}
          style={{ position: "relative" }}
        >
          🛒 Cart ({cartItemCount})
        </button>
        <button type="button" className="floating-btn btn-primary" onClick={() => onOpenModal("chat", "Live Chat")}>
          Chat Now!
        </button>
      </div>

      {/* RIGHT-SIDE AI POS TERMINAL & CHECKOUT DRAWER */}
      {(cartOpen || checkoutOpen) && (
        <>
          <div
            className="pos-backdrop"
            onClick={() => {
              setCartOpen(false);
              setCheckoutOpen(false);
            }}
          />

          <div className="pos-drawer">
            {/* POS Header */}
            <div className="pos-header">
              <div className="pos-brand-tag">
                <span className="pos-ai-chip">⚡ AI POS</span>
                <div>
                  <h3 className="pos-title">Point of Sale Terminal</h3>
                  <div className="pos-subtitle">
                    Wholesale Express Checkout &bull; {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="pos-close-btn"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(false);
                }}
                title="Close POS Drawer"
              >
                &times;
              </button>
            </div>

            {/* POS Drawer Body */}
            <div className="pos-body">
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "14px" }}>🛒</div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
                    Your cart is currently empty
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px", maxWidth: "320px", margin: "6px auto 0" }}>
                    Select high-yield toner cartridges or consumables from our wholesale catalog to start your order.
                  </p>
                  <Link
                    to="/products"
                    className="btn btn-orange"
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(false);
                    }}
                    style={{ display: "inline-block", marginTop: "18px", padding: "10px 24px", fontWeight: 700 }}
                  >
                    Browse Wholesale Products &rarr;
                  </Link>
                </div>
              ) : (
                <form id="pos-checkout-form" onSubmit={handleCheckoutSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  {/* Order Pause Alert */}
                  {isOrderPaused && (
                    <div
                      style={{
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>⏳</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#f87171" }}>
                          Ordering is Temporarily Suspended
                        </div>
                        <div style={{ fontSize: "12px", color: "#fca5a5", marginTop: "2px" }}>
                          {pauseRemainingText}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Cart Items */}
                  <div className="pos-card">
                    <div className="pos-card-header">
                      <span className="pos-card-title">
                        <span>📦</span> Cart Line Items ({cartItemCount})
                      </span>
                      <button
                        type="button"
                        onClick={() => setCartItems([])}
                        style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                      >
                        Clear All
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto", paddingRight: "4px" }}>
                      {cartItems.map((item) => (
                        <div key={item.sku} className="pos-item-row">
                          <img
                            src={item.image?.startsWith("/") ? `.${item.image}` : item.image}
                            alt={item.title}
                            className="pos-item-img"
                          />
                          <div className="pos-item-details">
                            <div className="pos-item-name" title={item.title}>
                              {item.title}
                            </div>
                            <div className="pos-item-meta">
                              SKU: <strong style={{ color: "#e2e8f0" }}>{item.sku}</strong> &bull; ${item.price.toFixed(2)}/pc
                            </div>
                          </div>

                          <div className="pos-item-qty-stepper">
                            <button
                              type="button"
                              className="pos-qty-btn"
                              onClick={() => updateCartQuantity(item.sku, -1)}
                            >
                              -
                            </button>
                            <span className="pos-qty-val">{item.quantity}</span>
                            <button
                              type="button"
                              className="pos-qty-btn"
                              onClick={() => updateCartQuantity(item.sku, 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className="pos-item-price">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>

                          <button
                            type="button"
                            className="pos-item-del-btn"
                            onClick={() => removeCartItem(item.sku)}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Delivery Destination Area */}
                  <div className="pos-card">
                    <div className="pos-card-header">
                      <span className="pos-card-title">
                        <span>🚚</span> Select Delivery Area *
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label
                        className={`pos-radio-card ${checkoutForm.delivery_area === "inside_city" ? "active" : ""}`}
                        onClick={() => setCheckoutForm({ ...checkoutForm, delivery_area: "inside_city" })}
                      >
                        <input
                          type="radio"
                          name="pos_delivery_area"
                          value="inside_city"
                          checked={checkoutForm.delivery_area === "inside_city"}
                          onChange={() => setCheckoutForm({ ...checkoutForm, delivery_area: "inside_city" })}
                          style={{ marginTop: "2px" }}
                        />
                        <div>
                          <div className="pos-radio-title">Inside City</div>
                          <div className="pos-radio-sub">
                            {isFreeDelivery ? (
                              <span style={{ color: "#4ade80", fontWeight: 700 }}>FREE ($0.00)</span>
                            ) : (
                              <span>Fee: ${insideCityCharge.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </label>

                      <label
                        className={`pos-radio-card ${checkoutForm.delivery_area === "outside_city" ? "active" : ""}`}
                        onClick={() => setCheckoutForm({ ...checkoutForm, delivery_area: "outside_city" })}
                      >
                        <input
                          type="radio"
                          name="pos_delivery_area"
                          value="outside_city"
                          checked={checkoutForm.delivery_area === "outside_city"}
                          onChange={() => setCheckoutForm({ ...checkoutForm, delivery_area: "outside_city" })}
                          style={{ marginTop: "2px" }}
                        />
                        <div>
                          <div className="pos-radio-title">Outside City</div>
                          <div className="pos-radio-sub">
                            {isFreeDelivery ? (
                              <span style={{ color: "#4ade80", fontWeight: 700 }}>FREE ($0.00)</span>
                            ) : (
                              <span>Fee: ${outsideCityCharge.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Free shipping trigger badge */}
                    {isFreeDelivery ? (
                      <div style={{ marginTop: "10px", padding: "6px 10px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "6px", fontSize: "11.5px", color: "#4ade80", fontWeight: 600 }}>
                        🎉 Congratulations! Your order qualifies for <strong>FREE DELIVERY ($0.00)</strong>!
                      </div>
                    ) : (
                      <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#38bdf8" }}>
                        💡 Add ${(freeThreshold - cartTotal).toFixed(2)} more to activate FREE delivery!
                      </div>
                    )}
                  </div>

                  {/* Section 3: Customer Procurement Details */}
                  <div className="pos-card">
                    <div className="pos-card-header">
                      <span className="pos-card-title">
                        <span>👤</span> Customer Procurement Details *
                      </span>
                      {!clientUser ? (
                        <button
                          type="button"
                          onClick={() => {
                            setCartOpen(false);
                            setCheckoutOpen(false);
                            setAuthTab("login");
                            setAuthModalOpen(true);
                          }}
                          style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
                        >
                          Sign In
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>
                          ✓ Partner: {clientUser.name}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <div>
                        <label className="pos-label">Customer / Company Name *</label>
                        <input
                          type="text"
                          className="pos-input"
                          placeholder="e.g. Al-Noor Trading LLC"
                          value={checkoutForm.customer_name}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="pos-label">Business Email *</label>
                        <input
                          type="email"
                          className="pos-input"
                          placeholder="procurement@company.com"
                          value={checkoutForm.customer_email}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <div>
                        <label className="pos-label">Phone / WhatsApp Number *</label>
                        <input
                          type="text"
                          className="pos-input"
                          placeholder="+880 1XXX-XXXXXX / +1 (555) 000-0000"
                          value={checkoutForm.customer_phone}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="pos-label">Special Packing / Notes</label>
                        <input
                          type="text"
                          className="pos-input"
                          placeholder="Optional packaging or invoice marks..."
                          value={checkoutForm.notes}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="pos-label">Delivery Destination / Full Shipping Address *</label>
                      <textarea
                        className="pos-textarea"
                        rows={2}
                        placeholder="Warehouse, Building, Road, Area, City..."
                        value={checkoutForm.shipping_address}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Section 4: Payment Method */}
                  <div className="pos-card">
                    <div className="pos-card-header">
                      <span className="pos-card-title">
                        <span>💳</span> Select Payment Method *
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <label
                        className={`pos-radio-card ${checkoutForm.payment_method === "Cash on Delivery" ? "active-payment" : ""}`}
                        onClick={() => setCheckoutForm({ ...checkoutForm, payment_method: "Cash on Delivery" })}
                      >
                        <input
                          type="radio"
                          name="pos_payment_method"
                          value="Cash on Delivery"
                          checked={checkoutForm.payment_method === "Cash on Delivery"}
                          onChange={() => setCheckoutForm({ ...checkoutForm, payment_method: "Cash on Delivery" })}
                          style={{ marginTop: "2px" }}
                        />
                        <div>
                          <div className="pos-radio-title">💵 Cash on Delivery</div>
                          <div className="pos-radio-sub">Pay upon physical delivery</div>
                        </div>
                      </label>

                      <label
                        className={`pos-radio-card ${checkoutForm.payment_method === "Online Payment" ? "active-payment" : ""}`}
                        onClick={() => setCheckoutForm({ ...checkoutForm, payment_method: "Online Payment" })}
                      >
                        <input
                          type="radio"
                          name="pos_payment_method"
                          value="Online Payment"
                          checked={checkoutForm.payment_method === "Online Payment"}
                          onChange={() => setCheckoutForm({ ...checkoutForm, payment_method: "Online Payment" })}
                          style={{ marginTop: "2px" }}
                        />
                        <div>
                          <div className="pos-radio-title">💳 Online Payment</div>
                          <div className="pos-radio-sub">Direct Bank Wire / Online Gateway</div>
                        </div>
                      </label>
                    </div>
                  </div>

                </form>
              )}
            </div>

            {/* POS Sticky Footer */}
            {cartItems.length > 0 && (
              <div className="pos-footer">
                <div className="pos-summary-row">
                  <span>Items Subtotal ({cartItemCount} pcs):</span>
                  <span style={{ color: "#ffffff", fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="pos-summary-row">
                  <span>Delivery ({checkoutForm.delivery_area === "outside_city" ? "Outside City" : "Inside City"}):</span>
                  <span>
                    {isFreeDelivery ? (
                      <strong style={{ color: "#4ade80" }}>FREE ($0.00)</strong>
                    ) : (
                      <strong style={{ color: "#ffffff" }}>${currentDeliveryCharge.toFixed(2)}</strong>
                    )}
                  </span>
                </div>
                <div className="pos-grand-row">
                  <div>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px" }}>
                      Grand Total Payable
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Inclusive of all taxes &amp; fees
                    </div>
                  </div>
                  <div className="pos-grand-total">
                    ${finalGrandTotal.toFixed(2)}
                  </div>
                </div>

                <button
                  type="submit"
                  form="pos-checkout-form"
                  className="pos-confirm-btn"
                  disabled={checkoutLoading || isOrderPaused}
                >
                  {checkoutLoading ? (
                    "Processing Order..."
                  ) : isOrderPaused ? (
                    "⏸️ Orders Paused (Checkout Suspended)"
                  ) : (
                    <>
                      <span>⚡ Confirm &amp; Place Order</span>
                      <span>(${finalGrandTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL 3: ORDER COMPLETION CONFIRMATION OFFICIAL VOUCHER */}
      {completedOrder && (
        <OrderVoucher
          order={completedOrder}
          settings={siteSettings}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* MODAL: ORDER PAUSE & TEMPORARY SUSPENSION NOTICE */}
      {pauseNoticeOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setPauseNoticeOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "560px", textAlign: "center", padding: "28px 24px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                background: "#fef3c7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "32px",
                border: "2px solid #f59e0b",
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.2)",
              }}
            >
              ⏳
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              Welcome Valued Customer!
            </h2>

            <div
              style={{
                fontSize: "13.5px",
                color: "#334155",
                lineHeight: 1.65,
                marginBottom: "16px",
                background: "#f8fafc",
                padding: "16px 18px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                whiteSpace: "pre-line",
              }}
            >
              {siteSettings.order_pause_message ||
                "Our factory and storefront ordering is temporarily paused for queue fulfillment. Ordering will resume shortly."}
            </div>

            {pauseRemainingText && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#eff6ff",
                  border: "1px solid #93c5fd",
                  padding: "8px 20px",
                  borderRadius: "30px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: "#1d4ed8",
                  marginBottom: "16px",
                }}
              >
                <span>⏰</span>
                <span>{pauseRemainingText}</span>
              </div>
            )}

            {siteSettings.order_pause_until && (
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "18px" }}>
                Scheduled Ordering Resume Time:{" "}
                <strong style={{ color: "#0f172a" }}>
                  {new Date(siteSettings.order_pause_until).toLocaleString()}
                </strong>
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "14px",
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: 1.5,
              }}
            >
              For any urgent inquiries or priority wholesale quotes: <br />
              <strong>📞 {siteSettings.contact_phone || "+1 604 316 8138"}</strong> &bull;{" "}
              <strong>✉️ {siteSettings.contact_email || "acme.info.swapan@gmail.com"}</strong>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-orange"
                onClick={() => setPauseNoticeOpen(false)}
                style={{ minWidth: "170px", padding: "10px 24px", fontWeight: 700, fontSize: "13.5px" }}
              >
                Got it / Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CLIENT ACCOUNT AUTH (Sign In / Register / My Orders) */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setAuthModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3>
                {authTab === "login" && "Sign In to Client Account"}
                {authTab === "register" && "Create Wholesale Buyer Account"}
                {authTab === "orders" && "My Account & Orders"}
              </h3>
              <button type="button" className="modal-close" onClick={() => setAuthModalOpen(false)}>&times;</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
              {!clientUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setAuthTab("login"); setAuthError(""); }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "none",
                      border: "none",
                      borderBottom: authTab === "login" ? "2px solid #ff6a00" : "none",
                      color: authTab === "login" ? "#ff6a00" : "#64748b",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthTab("register"); setAuthError(""); }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "none",
                      border: "none",
                      borderBottom: authTab === "register" ? "2px solid #ff6a00" : "none",
                      color: authTab === "register" ? "#ff6a00" : "#64748b",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: "none",
                    border: "none",
                    borderBottom: "2px solid #0284c7",
                    color: "#0284c7",
                    fontWeight: 700,
                  }}
                >
                  My Order History ({customerOrdersList.length})
                </button>
              )}
            </div>

            {authError && (
              <div style={{ background: "#fef2f2", color: "#dc2626", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", marginBottom: "12px" }}>
                {authError}
              </div>
            )}

            {/* TAB: LOGIN */}
            {authTab === "login" && !clientUser && (
              <form onSubmit={handleClientLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your-name@company.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-orange" disabled={authLoading} style={{ marginTop: "6px" }}>
                  {authLoading ? "Signing in..." : "Sign In to Account"}
                </button>
                <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b", marginTop: "10px" }}>
                  Don't have an account?{" "}
                  <span
                    onClick={() => setAuthTab("register")}
                    style={{ color: "#ff6a00", fontWeight: 700, cursor: "pointer" }}
                  >
                    Create account here &rarr;
                  </span>
                </div>
              </form>
            )}

            {/* TAB: REGISTER */}
            {authTab === "register" && !clientUser && (
              <form onSubmit={handleClientRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Smith"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Global Supplies Ltd"
                    value={authForm.company}
                    onChange={(e) => setAuthForm({ ...authForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@company.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Password (Min 6 chars) *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Choose a secure password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn btn-orange" disabled={authLoading} style={{ marginTop: "6px" }}>
                  {authLoading ? "Creating Account..." : "Create Account & Register"}
                </button>
              </form>
            )}

            {/* TAB: MY ORDERS / PROFILE (When Logged in) */}
            {clientUser && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", background: "#f8fafc", padding: "10px 14px", borderRadius: "6px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>{clientUser.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{clientUser.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClientLogout}
                    className="btn btn-outline-orange"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                  >
                    Log Out
                  </button>
                </div>

                <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "#334155" }}>
                  Past Orders ({customerOrdersList.length})
                </h4>

                {customerOrdersList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>
                    No orders placed yet. Add products to cart and complete checkout!
                  </div>
                ) : (
                  <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {customerOrdersList.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "10px",
                          fontSize: "12.5px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#0284c7" }}>
                          <span>{ord.order_code}</span>
                          <span>${Number(ord.total_amount).toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "11px", marginTop: "4px" }}>
                          <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                          <span style={{ color: ord.delivery_status === "delivered" ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
                            {ord.delivery_status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RFQ / Chat Modal */}
      {modalState.open && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onCloseModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{modalState.mode === "chat" ? "Chat with Supplier" : "Contact Supplier / Request Quote"}</h3>
              <button type="button" className="modal-close" onClick={onCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleModalSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                className="form-control"
                value={subject || modalState.product}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject / Product"
                required
              />
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Business Email"
                required
              />
              <textarea
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message or inquiry details..."
                required
              />
              {statusMsg && <div style={{ color: "green", fontSize: "13px", fontWeight: 600 }}>{statusMsg}</div>}
              <button type="submit" className="btn btn-orange">Send Message</button>
            </form>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Chat Widget if activated in Admin Plugins */}
      {siteSettings.plugin_whatsapp_active === "1" && siteSettings.plugin_whatsapp_number && (
        <a
          href={`https://wa.me/${siteSettings.plugin_whatsapp_number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
            siteSettings.plugin_whatsapp_message || "Hello AMIDA Supplies, I would like to inquire about products."
          )}`}
          target="_blank"
          rel="noreferrer"
          className="floating-whatsapp-btn"
          title="Chat with us on WhatsApp"
        >
          <span style={{ fontSize: "20px" }}>💬</span>
          <span>WhatsApp Chat</span>
        </a>
      )}
    </>
  );
}
