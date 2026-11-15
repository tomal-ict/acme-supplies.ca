import { useState } from "react";

const REVIEWS = [
  {
    id: 1,
    buyer: "A***d M.",
    country: "United Arab Emirates",
    rating: 5,
    date: "2026-09-18",
    tag: "With pictures",
    productTitle: "Amida Compatible Toner Cartridge for Xerox B310 / B305",
    productImg: "./images/company/rev-prod-1.jpg",
    comment: "Very consistent print density and zero leakage across 500+ units. Packaging arrived intact and custom OEM boxes look sharp.",
    photos: ["./images/company/rev-photo-1.jpg", "./images/company/rev-photo-2.jpg"],
  },
  {
    id: 2,
    buyer: "C***s R.",
    country: "Brazil",
    rating: 5,
    date: "2026-08-29",
    tag: "Professional supplier",
    productTitle: "Amida EcoTank 112 Pigment Refill Ink Bottles (CMYK)",
    productImg: "./images/company/rev-prod-2.jpg",
    comment: "Clara and the export team handled customs documentation smoothly. Color reproduction matches OEM standards.",
    photos: ["./images/company/rev-photo-3.jpg"],
  },
  {
    id: 3,
    buyer: "M***a K.",
    country: "Poland",
    rating: 5,
    date: "2026-08-12",
    tag: "Excellent service",
    productTitle: "Amida Compatible Toner W1107A 107A with Smart Chip",
    productImg: "./images/company/rev-prod-3.jpg",
    comment: "Dispatched from overseas warehouse in 3 days! Chips recognized immediately on HP 107w/135w printers.",
    photos: ["./images/company/rev-photo-4.jpg"],
  },
  {
    id: 4,
    buyer: "J***n D.",
    country: "United States",
    rating: 5,
    date: "2026-07-25",
    tag: "With pictures",
    productTitle: "Amida Brother TN630 / TN660 High Yield Toner Cartridge",
    productImg: "./images/company/rev-prod-4.jpg",
    comment: "Ordered 1,200 pieces for our wholesale distribution. Defect rate under 0.2%. Will reorder next month.",
    photos: ["./images/company/rev-photo-5.jpg"],
  },
  {
    id: 5,
    buyer: "S***h L.",
    country: "South Africa",
    rating: 4,
    date: "2026-07-04",
    tag: "Professional supplier",
    productTitle: "Amida Patent Gear Toner CE255A 55A / 55X",
    productImg: "./images/company/rev-prod-6.jpg",
    comment: "Strong build quality and clean drum gears. Shipping took an extra 2 days due to port congestion, supplier kept us updated.",
    photos: [],
  },
];

export default function RatingsReviewsPage({ onOpenModal }) {
  const [filter, setFilter] = useState("ALL");

  const filtered = REVIEWS.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "With pictures") return r.photos.length > 0;
    return r.tag === filter;
  });

  return (
    <main className="container page-section">
      <div className="catalog-layout">
        {/* Left Sidebar Contact Card */}
        <aside className="catalog-sidebar">
          <h3 className="sidebar-heading">AMIDA OFFICE SUPPLIES LIMITED</h3>
          <div style={{ fontSize: "12px", color: "#0284c7", fontWeight: 700, marginBottom: "4px" }}>
            Swapan Kumar Bairagi (CEO)
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
            Price Quality Service &bull; 126 Main Street, Acme, AB T0M 0A0, Canada &bull; 4.9/5.0 Rating
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button type="button" className="btn btn-orange" onClick={() => onOpenModal("chat", "Chat with Supplier")}>
              Chat Now
            </button>
            <button type="button" className="btn btn-outline-orange" onClick={() => onOpenModal("rfq", "Send Supplier Inquiry")}>
              Send Inquiry
            </button>
          </div>
        </aside>

        {/* Right Content: Ratings Scorecard & Review Cards */}
        <section>
          <div className="card" style={{ marginBottom: "18px" }}>
            <div className="section-header">
              <h1 className="section-title">Ratings &amp; Reviews</h1>
              <span className="verified-badge">990+ Verified Orders</span>
            </div>

            <div className="facts-grid" style={{ marginBottom: "16px" }}>
              <div className="fact-item">
                <div className="fact-label">Overall Score</div>
                <div className="fact-value" style={{ fontSize: "24px", color: "var(--accent-orange)" }}>4.9 / 5.0 &#9733;</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Satisfied (12 in-depth reviews)</div>
              </div>
              <div className="fact-item">
                <div className="fact-label">Sub-Scores</div>
                <div className="fact-value" style={{ fontSize: "13px" }}>
                  Supplier Service: <strong>4.9</strong><br />
                  On-time Shipment: <strong>4.8</strong><br />
                  Product Quality: <strong>5.0</strong>
                </div>
              </div>
              <div className="fact-item">
                <div className="fact-label">Rating Breakdown</div>
                <div className="fact-value" style={{ fontSize: "13px" }}>
                  5 Stars: <strong>92%</strong><br />
                  4 Stars: <strong>8%</strong><br />
                  1–3 Stars: <strong>0%</strong>
                </div>
              </div>
            </div>

            <div className="year-tabs" style={{ marginBottom: 0 }}>
              {[
                { key: "ALL", label: "ALL" },
                { key: "With pictures", label: "With pictures (54)" },
                { key: "Professional supplier", label: "Professional supplier (4)" },
                { key: "Excellent service", label: "Excellent service (2)" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  className={`year-tab ${filter === pill.key ? "active" : ""}`}
                  onClick={() => setFilter(pill.key)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.map((rev) => (
              <article key={rev.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src="./images/company/avatar-default.jpg"
                      alt={rev.buyer}
                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13px" }}>{rev.buyer} &bull; <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>{rev.country}</span></div>
                      <div style={{ color: "#f59e0b", fontSize: "13px" }}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{rev.date}</span>
                </div>

                <p style={{ marginBottom: "12px", fontSize: "13.5px" }}>{rev.comment}</p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-muted)", padding: "10px", borderRadius: "6px", marginBottom: rev.photos.length ? "12px" : 0 }}>
                  <img src={rev.productImg} alt={rev.productTitle} style={{ width: "52px", height: "52px", objectFit: "contain", borderRadius: "4px", background: "#fff" }} />
                  <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{rev.productTitle}</div>
                </div>

                {rev.photos.length > 0 && (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {rev.photos.map((ph, idx) => (
                      <img key={idx} src={ph} alt="Buyer verification" style={{ width: "110px", height: "110px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--border-color)" }} />
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
