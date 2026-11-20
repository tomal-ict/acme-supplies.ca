import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";

const GALLERY_BY_SKU = {
  P005: [
    "./images/detail/85a-1.jpg",
    "./images/detail/85a-2.jpg",
    "./images/detail/85a-3.jpg",
    "./images/detail/85a-4.jpg",
    "./images/detail/85a-5.jpg",
    "./images/detail/85a-6.jpg",
  ],
  P067: [
    "./images/products/P067.jpg",
    "./images/detail/85a-2.jpg",
    "./images/detail/85a-3.jpg",
    "./images/detail/85a-4.jpg",
    "./images/detail/85a-5.jpg",
    "./images/detail/85a-6.jpg",
  ],
  P068: [
    "./images/products/P068.jpg",
    "./images/detail/85a-2.jpg",
    "./images/detail/85a-3.jpg",
    "./images/detail/85a-4.jpg",
    "./images/detail/85a-5.jpg",
    "./images/detail/85a-6.jpg",
  ],
};

const TONER_DETAIL_IMAGES = [
  "./images/detail/desc-1.jpg",
  "./images/detail/desc-2.jpg",
  "./images/detail/desc-3.jpg",
  "./images/detail/desc-4.jpg",
  "./images/detail/desc-5.jpg",
  "./images/detail/desc-6.jpg",
  "./images/detail/desc-7.jpg",
  "./images/detail/desc-8.jpg",
];

const GENERAL_FACTORY_IMAGES = [
  "./images/company/factory-overview.jpg",
  "./images/company/machinery-1.jpg",
  "./images/company/tab-qc.jpg",
  "./images/fac-warehouse.jpg",
];

const COMPATIBLE_PRINTERS_FALLBACK = {
  P001: "Brother HL-L2350DW, HL-L2370DW, HL-L2370DWXL, HL-L2390DW, HL-L2395DW, DCP-L2550DW, MFC-L2710DW, MFC-L2730DW, MFC-L2750DW, MFC-L2750DWXL",
  P002: "HP LaserJet Pro M102a, M102w, LaserJet Pro MFP M130a, M130fn, M130fw, M130nw",
  P003: "HP LaserJet Enterprise P3010, P3015, P3015d, P3015dn, P3015x, Enterprise 500 MFP M525dn, M525f, Flow M525c, LaserJet Pro M521dn, M521dw MFP",
  P004: "HP Color LaserJet Pro M252dw, M252n, Color LaserJet Pro MFP M277dw, M277n, M277c6, M274n",
  P005: "HP LaserJet P1102, P1102w, P1005, P1006, P1505, P1566, P1606dn, M1120, M1132, M1212nf, M1217nfw, M125a, M127fn, M12a, M26a, Canon LBP 6000, 6030, 6200",
  P006: "HP LaserJet Pro MFP M125a, M125nw, M125rnw, M127fn, M127fp, M127fw, LaserJet Pro M201dw, M201n, LaserJet Pro MFP M225dn, M225dw",
  P007: "HP LaserJet Pro M404n, M404dn, M404dw, LaserJet Pro MFP M428dw, M428fdn, M428fdw, M402d, M402n, M402dn, M402dw, MFP M426fdn, M426fdw",
  P008: "HP LaserJet Pro 4003dn, 4003dw, 4003n, LaserJet Pro MFP 4103dw, 4103fdn, 4103fdw",
  P009: "Brother HL-L2350DW, HL-L2370DW, HL-L2390DW, HL-L2395DW, DCP-L2550DW, MFC-L2710DW, MFC-L2730DW, MFC-L2750DW",
  P010: "Brother HL-1110, HL-1210W, DCP-1510, MFC-1810, HL-2240, HL-2270DW, HL-L2320D, HL-L2340DW, MFC-7360N, MFC-L2700DW",
  P011: "HP Color LaserJet Pro CP1025, CP1025nw, M175a, M175nw, M275, M251n, M276nw, M252dw, M277dw, M452dn, M477fdw",
  P012: "HP Color LaserJet Enterprise M776dn, M776z, Flow M776zs, Color LaserJet Enterprise M856dn, M856x",
  P013: "Samsung Xpress SL-C420, SL-C422, SL-C423, SL-C470, SL-C472, SL-C473, CLP-360, CLP-365, CLX-3300, CLX-3305, CLX-3305FW",
  P014: "Canon i-SENSYS LBP673Cdw, MF752Cdw, MF754Cdw, Color imageCLASS LBP674Cdw, MF753Cdw, MF751Cdw",
  P015: "HP Color LaserJet Enterprise M554dn, M555dn, M555x, Color LaserJet Enterprise MFP M578dn, M578f, Flow M578c",
  P016: "Brother HL-L3210CW, HL-L3230CDW, HL-L3270CDW, HL-L3290CDW, DCP-L3510CDW, DCP-L3550CDW, MFC-L3710CW, MFC-L3750CDW, MFC-L3770CDW",
  P017: "HP DeskJet 1255, 2710, 2720, 2722, 2755, 4155, DeskJet Plus 4122, Envy 6055, 6075, Envy Pro 6455",
  P018: "Epson WorkForce Pro WF-C869R, WF-C869RD3TWFC, WF-C869RDTWF, WF-C869RDWF",
  P019: "Universal CISS Tank Printers: Epson EcoTank L1110/L3110/L3150/L4150, Canon MegaTank G1010/G2010/G3010, HP Smart Tank 500/515/615, Brother DCP-T310/T510W",
  P020: "Operating Systems: Windows 11 / 10 / 8 / 7, macOS 10.14 - 14.x, Ubuntu / Debian Linux, ChromeOS, High-Speed USB 2.0",
  P021: "Operating Systems: Windows 11 / 10 / 8 / 7, macOS, Linux, iOS AirPrint, Android Mopria, Ethernet LAN & WiFi 802.11 b/g/n",
  P022: "For HP Cartridges CF259A, CF276A, CF258A; in HP LaserJet Pro M404n, M404dn, M404dw, MFP M428dw, M428fdn, M428fdw",
  P060: "Ricoh Aficio MP C3003, MP C3003SP, MP C3503, MP C3503SP, MP C3503ZSP Copier System",
  P061: "HP Color Laser 150a, 150nw, HP Color Laser MFP 178nw, 178nwg, 179fnw, 179fwg",
  P062: "HP LaserJet M111a, M111w, HP LaserJet MFP M141a, M141w",
  P063: "HP Color Laser 150a, 150nw, HP Color Laser MFP 178nw, 179fnw",
  P064: "HP LaserJet Enterprise M506n, M506dn, M506x, MFP M527dn, M527f, LaserJet Pro M501dn, M501n",
  P065: "HP Laser 108a, 108w, HP Laser MFP 136a, 136w, 136nw, 138fnw, 138p, 138pnw",
  P066: "ESC/POS Terminals: Windows 11/10/8/7/XP, Android POS, Linux, OPOS, Cash Drawer RJ11 Port, 80mm POS Receipt",
  P067: "HP LaserJet Pro P1102, P1102w, P1566, P1606dn, M1132, M1212nf, M125a, M127fn, HP Laser 107a, 107w, MFP 135a, Canon LBP 2900, 3000, 6000",
  P068: "HP LaserJet P1005, P1006, P1102, P1102w, P1505, P1566, P1606dn, M1120, M1132, M1212nf, M125a, Canon LBP6030, MF3010",
  P069: "HP Laser 107a, 107w, 107r, HP Laser MFP 135a, 135w, 135r, MFP 137fnw",
  P070: "HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227d, M227fdn, M227fdw, M227sdn",
  P071: "HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227fdn, M227fdw, M227sdn",
  P072: "HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227d, M227fdn, M227fdw",
  P073: "HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227fdn, M227fdw, M227sdn",
  P074: "HP LaserJet Pro M203d, M203dn, M203dw, LaserJet Pro MFP M227d, M227fdn, M227fdw",
};

export default function ProductDetailPage({ onOpenModal }) {
  const { sku } = useParams();
  const [products, setProducts] = useState([]);
  const [activeImg, setActiveImg] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [orderQty, setOrderQty] = useState(20);

  useEffect(() => {
    fetchProducts().then((list) => {
      setProducts(list);
      const found = list.find((p) => p.sku === sku) || list[0];
      if (found) {
        let initialGal = [];
        if (Array.isArray(found.gallery_images) && found.gallery_images.length > 0) {
          initialGal = found.image && !found.gallery_images.includes(found.image)
            ? [found.image, ...found.gallery_images]
            : found.gallery_images;
        } else if (GALLERY_BY_SKU[found.sku]) {
          initialGal = GALLERY_BY_SKU[found.sku];
        } else if (found.image) {
          initialGal = [found.image];
        }
        setActiveImg(initialGal[0] || found.image);
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sku]);

  const product = products.find((p) => p.sku === sku) || products[0];

  const compatiblePrinters =
    product?.compatible_printers ||
    COMPATIBLE_PRINTERS_FALLBACK[product?.sku] ||
    "Universal OEM Compatible for Laser and Multifunction Systems";

  if (!product) {
    return (
      <main className="container page-section">
        <div className="card">Loading product details...</div>
      </main>
    );
  }

  // Strictly show ONLY this product's own image(s) — from backend gallery or sku fallback
  let gallery = [];
  if (Array.isArray(product.gallery_images) && product.gallery_images.length > 0) {
    gallery = product.image && !product.gallery_images.includes(product.image)
      ? [product.image, ...product.gallery_images]
      : product.gallery_images;
  } else if (GALLERY_BY_SKU[product.sku]) {
    gallery = GALLERY_BY_SKU[product.sku];
  } else if (product.image) {
    gallery = [product.image];
  } else {
    gallery = ["./images/products/P001.png"];
  }

  const isTonerCategory =
    product.category === "Patent Gear Products" ||
    product.category === "Monochrome Cartridges" ||
    product.category === "Color Cartridges";

  const detailImages = isTonerCategory ? TONER_DETAIL_IMAGES : GENERAL_FACTORY_IMAGES;

  const related = products
    .filter((p) => p.category === product.category && p.sku !== product.sku)
    .slice(0, 4);

  const pMin = Number(product.price_min) || 0;
  const pMax = Number(product.price_max) || pMin;
  const pMid1 = (pMax - (pMax - pMin) * 0.25).toFixed(2);
  const pMid2 = (pMax - (pMax - pMin) * 0.55).toFixed(2);

  // Pricing Mode Detection
  const hasDbTiers = Array.isArray(product.tiered_prices) && product.tiered_prices.length > 0;
  const isSingleRate = product.price_mode === "single" || (!hasDbTiers && pMin === pMax);
  const singlePrice = Number(product.single_price) || pMax || pMin;

  const tiers = hasDbTiers
    ? product.tiered_prices
    : [
        { min_qty: 20, max_qty: 99, price: pMax },
        { min_qty: 100, max_qty: 499, price: Number(pMid1) },
        { min_qty: 500, max_qty: 99999, price: Number(pMid2) },
        { min_qty: 100000, max_qty: null, price: pMin },
      ];

  // Calculate current unit price based on selected quantity
  const calculateUnitPrice = (qty) => {
    if (isSingleRate) return singlePrice;
    const match = tiers.find((t) => qty >= t.min_qty && (!t.max_qty || qty <= t.max_qty));
    if (match) return Number(match.price);
    if (tiers.length > 0) {
      if (qty < tiers[0].min_qty) return Number(tiers[0].price);
      return Number(tiers[tiers.length - 1].price);
    }
    return singlePrice;
  };

  const currentUnitPrice = calculateUnitPrice(orderQty);

  // Specifications
  const specsList = Array.isArray(product.specifications) && product.specifications.length > 0
    ? product.specifications.map((s) => [s.key, s.value])
    : [
        ["Brand Name", "Amida® / OEM"],
        ["Model / SKU", `${product.sku} — ${product.title}`],
        ["Compatible Printers", compatiblePrinters],
        ["Category", `${product.category}${product.sub_category ? ` (${product.sub_category})` : ""}`],
        ["Cartridge / Product Status", "Full (Brand New Grade-A Components)"],
        ["Feature", "Compatible with Patented Gear • 100% Testing Before Delivery"],
        ["Page Yield", "Same Original Yield (Standard & High Yield Option)"],
        ["Smart Chip", "Pre-installed Auto-Reset Smart Microchip (Plug and Play)"],
        ["Certification", "ISO 9001 / ISO 14001 / CE / STMC / RoHS"],
        ["Warranty", "18 Months (100% Satisfaction Guaranteed)"],
        ["Bulk Packaging", "Neutral Packing / Customised Retail Box Packing"],
        ["Single Package Size", "33 × 10.5 × 13 cm (Single Gross Weight: 0.944 kg)"],
        ["Place of Origin", "Guangdong, China (25+ Years Experience)"],
      ];

  return (
    <main className="container page-section">
      {/* Breadcrumb */}
      <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
        <Link to="/" style={{ color: "var(--primary-color)" }}>Home</Link> &rsaquo;{" "}
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: "var(--primary-color)" }}>
          {product.category}
        </Link>{" "}
        &rsaquo; <span>{product.sku}</span>
      </div>

      {/* Top Product Overview */}
      <section className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Left: Strictly Matched Product Gallery */}
          <div>
            <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "#fff", height: "380px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: "12px" }}>
              <img
                src={activeImg || gallery[0]}
                alt={product.title}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: "12px" }}
              />
            </div>
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg(imgUrl)}
                    style={{
                      width: "64px",
                      height: "64px",
                      flexShrink: 0,
                      padding: "3px",
                      borderRadius: "6px",
                      border: activeImg === imgUrl ? "2px solid var(--accent-orange)" : "1px solid var(--border-color)",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <img src={imgUrl} alt={`Angle ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Title, Tiered Pricing, Customization & CTAs */}
          <div>
            <div className="product-tags" style={{ marginBottom: "8px" }}>
              {(product.tags || []).map((t, i) => (
                <span key={t} className={`p-tag ${i > 0 ? "p-tag-main" : ""}`}>{t}</span>
              ))}
              {product.sub_category && <span className="p-tag">{product.sub_category}</span>}
            </div>

            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "10px", lineHeight: 1.35 }}>
              {product.title}
            </h1>

            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
              SKU: <strong>{product.sku}</strong> &bull; {product.sold} &bull; 4.9 &#9733; Verified Factory Direct
            </div>

            {/* Direct Printer Compatibility Callout */}
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "13px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>🖨️</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#0369a1", fontWeight: 700, fontSize: "12.5px", marginBottom: "3px" }}>
                  COMPATIBLE PRINTER MODELS:
                </div>
                <div style={{ color: "#1e293b", fontSize: "12px", lineHeight: 1.5, fontWeight: 500 }}>
                  {compatiblePrinters}
                </div>
              </div>
            </div>

            {/* Single Rate vs Tiered Pricing Grid */}
            {isSingleRate ? (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "16px 20px", marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#9a3412", marginBottom: "6px", textTransform: "uppercase" }}>
                  Wholesale Unit Price
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--price-red)" }}>
                    ${singlePrice.toFixed(2)}
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/ Piece (FOB Single Rate)</span>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "14px", marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#9a3412", marginBottom: "10px", textTransform: "uppercase" }}>
                  Wholesale FOB Tiered Pricing
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(tiers.length, 4)}, 1fr)`, gap: "10px" }}>
                  {tiers.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        background: orderQty >= t.min_qty && (!t.max_qty || orderQty <= t.max_qty) ? "#ffedd5" : "transparent",
                        border: orderQty >= t.min_qty && (!t.max_qty || orderQty <= t.max_qty) ? "1px solid #f97316" : "1px solid transparent",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {t.min_qty} {t.max_qty ? `– ${t.max_qty}` : "+"} pcs
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--price-red)" }}>
                        ${Number(t.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Price Summary */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>Order Quantity (Units):</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setOrderQty(Math.max(1, orderQty - 10))}
                      style={{ width: "32px", height: "34px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", borderRadius: "4px 0 0 4px", fontWeight: 700 }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={orderQty}
                      onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ width: "70px", height: "34px", textAlign: "center", borderTop: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", borderLeft: "none", borderRight: "none", outline: "none", fontWeight: 700 }}
                    />
                    <button
                      type="button"
                      onClick={() => setOrderQty(orderQty + 10)}
                      style={{ width: "32px", height: "34px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", borderRadius: "0 4px 4px 0", fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: "13px", textAlign: "right" }}>
                  <span style={{ color: "var(--text-muted)" }}>Applied Rate: </span>
                  <strong style={{ color: "#0284c7" }}>${currentUnitPrice.toFixed(2)} / pc</strong>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                    Subtotal: ${(currentUnitPrice * orderQty).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Time & Customization */}
            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", padding: "12px", background: "var(--bg-muted)", borderRadius: "6px" }}>
              <div><strong>Min. Order (MOQ):</strong> {product.moq}</div>
              <div><strong>Lead Time:</strong> 1–200 pcs (7 days) &bull; 201–1,000 pcs (12 days) &bull; &gt;1,000 pcs (Negotiable)</div>
              <div><strong>Customization:</strong> Minor customization, Drawing-based, Sample-based &amp; Full OEM/ODM</div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-orange"
                style={{ padding: "12px 26px", fontSize: "14px", fontWeight: 700 }}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("acme-add-to-cart", {
                      detail: { product: { ...product, price: currentUnitPrice }, quantity: orderQty, unitPrice: currentUnitPrice },
                    })
                  );
                }}
              >
                🛒 Add {orderQty} pcs to Cart &bull; Start Order
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: "12px 24px", fontSize: "14px" }}
                onClick={() => onOpenModal("chat", `${product.title} (SKU: ${product.sku})`)}
              >
                Chat Now
              </button>
              <button
                type="button"
                className="btn btn-outline-orange"
                style={{ padding: "12px 24px", fontSize: "14px" }}
                onClick={() => onOpenModal("rfq", `${product.title} (SKU: ${product.sku})`)}
              >
                Request Quotation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs: Product Details & Specifications vs Lead Time */}
      <section className="card" style={{ marginBottom: "20px" }}>
        <div className="media-tabs">
          <button type="button" className={`media-tab ${activeTab === "details" ? "active" : ""}`} onClick={() => setActiveTab("details")}>
            Product Details &amp; Specifications
          </button>
          <button type="button" className={`media-tab ${activeTab === "leadtime" ? "active" : ""}`} onClick={() => setActiveTab("leadtime")}>
            Packaging &amp; Lead Time
          </button>
        </div>

        {activeTab === "details" ? (
          <div>
            {/* Optional Rich Description */}
            {product.description && (
              <div style={{ marginBottom: "22px", background: "#f8fafc", padding: "16px 20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                  Product Overview &amp; Description
                </h3>
                <div style={{ fontSize: "13.5px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {product.description}
                </div>
              </div>
            )}

            <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Key Attributes</h3>
            <div style={{ overflowX: "auto", marginBottom: "24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <tbody>
                  {specsList.map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "9px 12px", background: "var(--bg-muted)", fontWeight: 600, width: "220px", color: "#1e293b" }}>{k}</td>
                      <td style={{ padding: "9px 12px", color: k === "Compatible Printers" ? "#0369a1" : "inherit", fontWeight: k === "Compatible Printers" ? 600 : "normal" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dedicated Printer Compatibility & Equipment Support Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "18px 20px",
                marginBottom: "26px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "22px" }}>🖨️</span>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#166534", margin: 0 }}>
                    Guaranteed Printer Compatibility
                  </h3>
                  <span style={{ fontSize: "12px", color: "#15803d" }}>
                    Engineered to 100% match OEM specifications, slotting smoothly with zero error codes.
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  background: "#ffffff",
                  padding: "14px",
                  borderRadius: "6px",
                  border: "1px solid #dcfce7",
                  marginTop: "10px",
                }}
              >
                {compatiblePrinters
                  .split(/,\s*|\/\s*|;\s*/)
                  .filter((m) => m.trim().length > 0)
                  .map((model, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #86efac",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <span style={{ color: "#16a34a" }}>✓</span> {model.trim()}
                    </span>
                  ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                  marginTop: "14px",
                  fontSize: "12px",
                  color: "#374151",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#16a34a", fontWeight: "bold" }}>✔</span>
                  <span><strong>Zero Firmware Lock:</strong> Direct drop-in fit</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#16a34a", fontWeight: "bold" }}>✔</span>
                  <span><strong>OEM Dark Density:</strong> Optical density &ge; 1.45</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#16a34a", fontWeight: "bold" }}>✔</span>
                  <span><strong>18 Months Guarantee:</strong> 1-to-1 replacement</span>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>
              {isTonerCategory ? "Product Architecture, Quality Testing & Packaging" : "Factory & Quality Control Showcase"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "860px", margin: "0 auto" }}>
              {detailImages.map((img, i) => (
                <img key={i} src={img} alt={`Showcase ${i + 1}`} style={{ width: "100%", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "13.5px", lineHeight: 1.7 }}>
            <p><strong>Standard Packaging:</strong> Anti-static black bag + air-bag cushion + neutral / Amida color box + master export carton.</p>
            <p><strong>Lead Time:</strong> 7 working days for 1–200 pieces; 12 working days for 201–1,000 pieces; container orders negotiated directly.</p>
            <p><strong>Shipping Ports:</strong> Zhuhai Port, Shenzhen Port, Guangzhou Port, or 2–4 day dispatch from our European Overseas Warehouse.</p>
          </div>
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="card">
          <div className="section-header">
            <h2 className="section-title">Related Products in {product.category}</h2>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="view-more-link">View All &rarr;</Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.sku} product={p} onOpenModal={onOpenModal} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
