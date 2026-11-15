import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
    payment_method: "T/T Wire Transfer (30% deposit)",
    notes: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

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
      const { product, quantity = 1 } = e.detail || {};
      if (!product) return;

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.sku === product.sku);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: product.id || Date.now(),
              sku: product.sku,
              title: product.title,
              price: Number(product.price_min || product.price || 10.0),
              price_max: Number(product.price_max || product.price_min || 10.0),
              image: product.image,
              category: product.category,
              quantity: quantity,
            },
          ];
        }
      });

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
        notes: checkoutForm.notes,
        payment_method: checkoutForm.payment_method,
        total_amount: cartTotal,
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
                <Link to="/products?category=Toner%20Powder%20%26%20Chips">Bulk Toner Powder &amp; Chips</Link>
                <Link to="/products?category=Thermal%20Printers">Laser &amp; Thermal POS Printers</Link>
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

      {/* MODAL 1: SHOPPING CART DRAWER / MODAL */}
      {cartOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setCartOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "620px" }}>
            <div className="modal-header">
              <h3>🛒 Wholesale Purchase Cart ({cartItemCount} items)</h3>
              <button type="button" className="modal-close" onClick={() => setCartOpen(false)}>&times;</button>
            </div>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛒</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Your cart is empty</div>
                <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                  Browse our catalog and add toner cartridges or consumables to your order.
                </p>
                <Link
                  to="/products"
                  className="btn btn-orange"
                  onClick={() => setCartOpen(false)}
                  style={{ display: "inline-block", marginTop: "14px" }}
                >
                  Explore Products &rarr;
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: "340px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.sku}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    >
                      <img
                        src={item.image?.startsWith("/") ? `.${item.image}` : item.image}
                        alt={item.title}
                        style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "4px", background: "#f8fafc" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          SKU: {item.sku} &bull; ${item.price.toFixed(2)} / unit
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.sku, -1)}
                          style={{ width: "26px", height: "26px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 700 }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "13px", fontWeight: 700, minWidth: "22px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.sku, 1)}
                          style={{ width: "26px", height: "26px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 700 }}
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#0284c7", minWidth: "65px", textAlign: "right" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.sku)}
                        style={{ border: "none", background: "none", color: "#ef4444", fontSize: "16px", cursor: "pointer", padding: "4px" }}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Checkout Action */}
                <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "16px", paddingTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>Estimated Order Subtotal:</span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#ff6a00" }}>
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className="btn btn-outline-orange"
                      onClick={() => setCartOpen(false)}
                      style={{ flex: 1 }}
                    >
                      Continue Shopping
                    </button>
                    <button
                      type="button"
                      className="btn btn-orange"
                      onClick={() => {
                        setCartOpen(false);
                        setCheckoutOpen(true);
                      }}
                      style={{ flex: 1.5, fontWeight: 700 }}
                    >
                      Proceed to Complete Order &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: CHECKOUT & COMPLETE ORDER (Supports Guest & Registered Customers) */}
      {checkoutOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setCheckoutOpen(false)}>
          <div className="modal-box" style={{ maxWidth: "620px" }}>
            <div className="modal-header">
              <h3>📋 Complete Wholesale Purchase Order</h3>
              <button type="button" className="modal-close" onClick={() => setCheckoutOpen(false)}>&times;</button>
            </div>

            {/* Guest Checkout Banner */}
            {!clientUser ? (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "12.5px",
                  color: "#1e40af",
                  marginBottom: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>🛍️ <strong>Guest Checkout:</strong> No account required to complete this order!</span>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutOpen(false);
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  style={{ background: "none", border: "none", color: "#0284c7", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}
                >
                  Sign in instead
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "6px",
                  padding: "10px 14px",
                  fontSize: "12.5px",
                  color: "#065f46",
                  marginBottom: "14px",
                }}
              >
                ✓ Ordering as registered partner: <strong>{clientUser.name}</strong> ({clientUser.email})
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Customer / Company Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Al-Noor Trading LLC"
                    value={checkoutForm.customer_name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Business Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="procurement@company.com"
                    value={checkoutForm.customer_email}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={checkoutForm.customer_phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, customer_phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                    Payment Terms
                  </label>
                  <select
                    className="form-control"
                    value={checkoutForm.payment_method}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })}
                  >
                    <option value="T/T Wire Transfer (30% deposit)">T/T Wire Transfer (30% deposit)</option>
                    <option value="Letter of Credit (L/C at sight)">Letter of Credit (L/C at sight)</option>
                    <option value="Trade Assurance Escrow">Trade Assurance Escrow</option>
                    <option value="Cash On Delivery / Warehouse Pickup">Cash On Delivery / Warehouse Pickup</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Delivery Destination / Shipping Address *
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Street, City, Port of discharge, Country..."
                  value={checkoutForm.shipping_address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shipping_address: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" }}>
                  Special Instructions / Custom Labeling Notes
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional packing requirements, shipping marks..."
                  value={checkoutForm.notes}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                />
              </div>

              {/* Order Items Summary Box */}
              <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600 }}>
                  <span>Items to be ordered ({cartItemCount}):</span>
                  <span style={{ color: "#ff6a00", fontWeight: 800 }}>Total: ${cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                  {cartItems.map((i) => `${i.title} (${i.quantity} pcs)`).join(" • ")}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button type="button" className="btn btn-outline-orange" onClick={() => setCheckoutOpen(false)} style={{ flex: 1 }}>
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-orange"
                  style={{ flex: 2, fontWeight: 700 }}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Processing Order..." : `Confirm & Complete Order ($${cartTotal.toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ORDER COMPLETION CONFIRMATION INVOICE */}
      {completedOrder && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setCompletedOrder(null)}>
          <div className="modal-box" style={{ maxWidth: "580px" }}>
            <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <div style={{ fontSize: "44px", color: "#10b981", marginBottom: "6px" }}>✓</div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Order Placed Successfully!
              </h2>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                Thank you for your business. Your order is logged and awaiting dispatch.
              </div>

              <div
                style={{
                  display: "inline-block",
                  margin: "16px auto",
                  background: "#f1f5f9",
                  border: "1px dashed #0284c7",
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#0284c7",
                  letterSpacing: "0.5px",
                }}
              >
                Order Code: {completedOrder.order_code}
              </div>

              <div style={{ textAlign: "left", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Customer:</span>
                  <strong>{completedOrder.customer_name}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Email:</span>
                  <span>{completedOrder.customer_email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Delivery Status:</span>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>PENDING (In Processing)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#64748b" }}>Total Amount:</span>
                  <span style={{ color: "#0284c7", fontWeight: 800, fontSize: "15px" }}>${Number(completedOrder.total_amount).toFixed(2)}</span>
                </div>
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Shipping Destination:</span>
                  <div>{completedOrder.shipping_address}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn btn-outline-orange"
                  onClick={() => window.print()}
                  style={{ flex: 1 }}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  type="button"
                  className="btn btn-orange"
                  onClick={() => setCompletedOrder(null)}
                  style={{ flex: 1.5 }}
                >
                  Continue Shopping
                </button>
              </div>
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
    </>
  );
}
