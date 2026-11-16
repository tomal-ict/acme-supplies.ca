import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchPublicSettings, submitInquiry } from "../api";
import ProductCard from "../components/ProductCard";

const HERO_SLIDES = [
  {
    image: "./images/banner-1.png",
    tag: "25+ Years Manufacturer • OEM / ODM",
    title: "High-Yield Compatible Toner Cartridges & Imaging Solutions",
    desc: "1,000,000+ monthly capacity across 48 automated production lines. ISO9001, ISO14001 & STMC certified quality.",
    ctaText: "Explore Full Catalog",
    ctaLink: "/products",
  },
  {
    image: "./images/banner-2.jpg",
    tag: "Factory Direct • 75,000 m² Industrial Park",
    title: "Automated Robotic Production & Overseas Warehousing",
    desc: "Fast dispatch from our main manufacturing campus and European overseas warehouse to 120+ countries.",
    ctaText: "View Company Profile",
    ctaLink: "/company-profile",
  },
  {
    image: "./images/banner-3.jpg",
    tag: "Wholesale Promotions • Up to 12% Off",
    title: "Patent Gear Toner & Thermal POS Printer Specials",
    desc: "Lock in factory-tier FOB pricing on Brother, HP, Canon compatible cartridges and A4 laser printers.",
    ctaText: "See Hot Deals",
    ctaLink: "/promotion",
  },
  {
    image: "./images/banner-4.jpg",
    tag: "Global Exhibitions & R&D Innovation",
    title: "Certified OEM/ODM Partner for Global Distributors",
    desc: "100% post-production print inspection and dedicated export support team.",
    ctaText: "Contact Us",
    ctaLink: "/company-profile",
  },
];

const EXHIBITIONS = {
  "2024": "RemaxWorld Expo • Paperworld Frankfurt • GITEX Global Dubai — Showcasing next-gen patent gear cartridges and 80mm thermal POS hardware.",
  "2023": "RemaxWorld Expo • Ambiente Frankfurt — Unveiled automated robotic assembly line products and eco-friendly toner formulas.",
  "2022": "Digital & Hybrid Imaging Trade Summit — Expanded European distributor network.",
  "2019": "Paperworld Frankfurt • RemaxWorld Expo — Launched high-yield color laser series.",
  "2018": "GITEX Technology Week • Canton Fair — Introduced bulk ink & printer consumables.",
  "2016": "RemaxWorld Expo — Celebrated 10+ years of international OEM/ODM exports.",
};

const SALES_TEAM = [
  { initials: "SB", name: "Swapan Kumar Bairagi", role: "Chief Executive Officer (CEO)" },
  { initials: "CL", name: "Clara Lin", role: "Senior Export Manager" },
  { initials: "JH", name: "Jett Hu", role: "EU & Americas Sales" },
  { initials: "TZ", name: "Taka Zhou", role: "OEM / ODM Specialist" },
  { initials: "WL", name: "Waymen Lin", role: "Key Account Director" },
  { initials: "SC", name: "Stacy Chen", role: "APAC Sales Lead" },
];

export default function HomePage({ onOpenModal }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [yearTab, setYearTab] = useState("2024");
  const [products, setProducts] = useState([]);
  const [heroSlides, setHeroSlides] = useState(HERO_SLIDES);
  const [dynamicSectionBanners, setDynamicSectionBanners] = useState({});
  const [rfq, setRfq] = useState({ name: "", email: "", subject: "", quantity: "", message: "" });
  const [rfqStatus, setRfqStatus] = useState("");

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchPublicSettings().then((s) => {
      if (s) {
        if (s.home_sliders) {
          try {
            const parsed = typeof s.home_sliders === "string" ? JSON.parse(s.home_sliders) : s.home_sliders;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroSlides(parsed);
            }
          } catch (e) {
            console.error("Failed to parse home_sliders", e);
          }
        }
        if (s.section_banners) {
          try {
            const parsedBanners = typeof s.section_banners === "string" ? JSON.parse(s.section_banners) : s.section_banners;
            if (Array.isArray(parsedBanners)) {
              const bannerMap = {};
              parsedBanners.forEach((b) => {
                if (b.name) bannerMap[b.name] = b.image;
                if (b.key) bannerMap[b.key] = b.image;
              });
              setDynamicSectionBanners(bannerMap);
            }
          } catch (e) {
            console.error("Failed to parse section_banners", e);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[slideIdx] || heroSlides[0] || HERO_SLIDES[0];

  const handleRfqSubmit = async (e) => {
    e.preventDefault();
    const res = await submitInquiry({
      ...rfq,
      quantity: rfq.quantity ? Number(rfq.quantity) : null,
      type: "rfq",
    });
    setRfqStatus(res.message || "RFQ submitted!");
    setRfq({ name: "", email: "", subject: "", quantity: "", message: "" });
  };

  const getCategoryProducts = (cat) => {
    if (cat === "Printers") {
      return products.filter((p) => p.category === "Printers" || p.category === "Thermal Printers").slice(0, 12);
    }
    return products.filter((p) => p.category === cat).slice(0, 12);
  };

  return (
    <main className="container">
      {/* Hero Banner Carousel + 9-Area Quick Hotspots */}
      <section className="page-section">
        <div className="hero-carousel">
          <div className="hero-slide" style={{ backgroundImage: `url(${currentSlide.image})` }}>
            <div className="hero-text">
              <span className="hero-tag">{currentSlide.tag}</span>
              <h1>{currentSlide.title}</h1>
              <p>{currentSlide.desc}</p>
              <Link to={currentSlide.ctaLink} className="btn btn-orange">
                {currentSlide.ctaText}
              </Link>
            </div>
          </div>
          <button
            type="button"
            className="carousel-btn carousel-prev"
            onClick={() => setSlideIdx((slideIdx - 1 + heroSlides.length) % heroSlides.length)}
            aria-label="Previous slide"
          >
            &#8249;
          </button>
          <button
            type="button"
            className="carousel-btn carousel-next"
            onClick={() => setSlideIdx((slideIdx + 1) % heroSlides.length)}
            aria-label="Next slide"
          >
            &#8250;
          </button>
          <div className="carousel-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carousel-dot ${i === slideIdx ? "active" : ""}`}
                onClick={() => setSlideIdx(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="hotspot-grid">
          <Link to="/products?category=Patent%20Gear%20Products" className="hotspot-card">
            <div><h4>Patent Gear Toner</h4><small>Brother TN770 / HP 17A</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/products?category=Monochrome%20Cartridges" className="hotspot-card">
            <div><h4>HP Monochrome Series</h4><small>85A / 78A / 12A / 59A</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/products?category=Color%20Cartridges" className="hotspot-card">
            <div><h4>Color Laser Cartridges</h4><small>HP 125A / 212A / Canon 069</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/products?category=Inks%20%26%20Inkjets" className="hotspot-card">
            <div><h4>Inkjet Cartridges</h4><small>HP 67XL / 305XL / Epson</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/products?category=Inks%20%26%20Inkjets" className="hotspot-card">
            <div><h4>1000ml Bulk Refill Ink</h4><small>Universal Dye &amp; Pigment</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/products?category=Thermal%20Printers" className="hotspot-card">
            <div><h4>Thermal POS Printers</h4><small>AK-80250 80mm Receipt</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/products?category=Toner%20Powder" className="hotspot-card">
            <div><h4>Bulk Toner Powder</h4><small>1000g Japanese Formula</small></div>
            <span>View &rarr;</span>
          </Link>
          <Link to="/promotion" className="hotspot-card">
            <div><h4>Hot Wholesale Deals</h4><small>Up to 12% Discount</small></div>
            <span>View &rarr;</span>
          </Link>
        </div>
      </section>

      {/* Service / Contact Team */}
      <section className="page-section card">
        <div className="section-header">
          <h2 className="section-title">SERVICE / CONTACT US (AM 9:00 - PM 22:00)</h2>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Average Response Time: &le; 2 Hours</span>
        </div>
        <div className="service-team-grid">
          {SALES_TEAM.map((rep) => (
            <div key={rep.name} className="rep-card">
              <div className="rep-avatar">{rep.initials}</div>
              <div className="rep-name">{rep.name}</div>
              <div className="rep-role">{rep.role}</div>
              <button type="button" className="btn btn-primary" onClick={() => onOpenModal("chat", `Chat with ${rep.name}`)}>
                Chat Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Fast Facts */}
      <section className="page-section card">
        <div className="section-header">
          <h2 className="section-title">Company Overview &amp; Fast Facts</h2>
          <Link to="/company-profile" className="view-more-link">Full Verification Report &rarr;</Link>
        </div>
        <div className="facts-grid">
          <div className="fact-item"><div className="fact-label">Corporate Office &amp; Address</div><div className="fact-value">126 Main Street, Acme, AB T0M 0A0, Canada</div></div>
          <div className="fact-item"><div className="fact-label">Chief Executive Officer</div><div className="fact-value">Swapan Kumar Bairagi (CEO)</div></div>
          <div className="fact-item"><div className="fact-label">Company Motto</div><div className="fact-value">Price Quality Service &bull; AMIDA OFFICE SUPPLIES LIMITED</div></div>
          <div className="fact-item"><div className="fact-label">Direct Contact</div><div className="fact-value">+1 604 316 8138 &bull; acme.info.swapan@gmail.com</div></div>
          <div className="fact-item"><div className="fact-label">Facilities &amp; Workforce</div><div className="fact-value">75,000 m&sup2; Floorspace &bull; 500+ Employees</div></div>
          <div className="fact-item"><div className="fact-label">Annual Revenue &amp; Certs</div><div className="fact-value">US $50M – $100M &bull; ISO9001, ISO14001, REACH, RoHS, CE, STMC</div></div>
        </div>
      </section>

      {/* Stepped Milestones */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Company Milestones (1999 – 2024)</h2></div>
        <div className="milestone-staircase">
          <div className="milestone-step"><div className="milestone-year">1999</div><div className="milestone-desc">Retail foundation serving end customers.</div></div>
          <div className="milestone-step"><div className="milestone-year">2001</div><div className="milestone-desc">Official proprietary brand launched to market.</div></div>
          <div className="milestone-step"><div className="milestone-year">2007</div><div className="milestone-desc">Overseas market entry &amp; international brand established.</div></div>
          <div className="milestone-step"><div className="milestone-year">2012</div><div className="milestone-desc">Amida Technology Industrial Park completed.</div></div>
          <div className="milestone-step"><div className="milestone-year">2022</div><div className="milestone-desc">Annual output value exceeded US $30M.</div></div>
          <div className="milestone-step"><div className="milestone-year">2023</div><div className="milestone-desc">New smart factory operational, multiplying capacity.</div></div>
          <div className="milestone-step"><div className="milestone-year">2024</div><div className="milestone-desc">Integration of 10 automated robotic production lines.</div></div>
        </div>
      </section>

      {/* Exhibition Archive */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Exhibition &amp; Trade Fair Archive</h2></div>
        <div className="year-tabs">
          {Object.keys(EXHIBITIONS).sort((a, b) => Number(b) - Number(a)).map((y) => (
            <button key={y} type="button" className={`year-tab ${yearTab === y ? "active" : ""}`} onClick={() => setYearTab(y)}>
              {y}
            </button>
          ))}
        </div>
        <div className="exhibition-panel">
          <strong>{yearTab} Global Expos:</strong> {EXHIBITIONS[yearTab]}
        </div>
      </section>

      {/* Global Infrastructure & Facilities with Real Photos */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Global Infrastructure &amp; Facilities</h2></div>
        <div className="grid-4">
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/fac-warehouse.jpg" alt="Overseas Warehouse" style={{ width: "100%", height: "145px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}>
              <h4>Overseas Warehouse</h4>
              <p>Local European stock hub for rapid 2–4 day delivery.</p>
            </div>
          </div>
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/fac-equipment.jpg" alt="Automated Equipment" style={{ width: "100%", height: "145px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}>
              <h4>Automated Equipment</h4>
              <p>10 robotic assembly lines &amp; automated filling.</p>
            </div>
          </div>
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/fac-team.jpg" alt="Export & Engineering Team" style={{ width: "100%", height: "145px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}>
              <h4>R&amp;D &amp; Export Team</h4>
              <p>500+ staff &amp; dedicated OEM/ODM specialists.</p>
            </div>
          </div>
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/fac-meeting.jpg" alt="Executive & QC Center" style={{ width: "100%", height: "145px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}>
              <h4>QC &amp; Conference Center</h4>
              <p>100% post-production print inspection labs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* All 8 Categorized Product Sections with Real Section Banners */}
      {[
        { cat: "Patent Gear Products", banner: "./images/sec-patent.jpg", key: "patent" },
        { cat: "Monochrome Cartridges", banner: "./images/sec-mono.jpg", key: "monochrome" },
        { cat: "Color Cartridges", banner: "./images/sec-color.jpg", key: "color" },
        { cat: "Inks & Inkjets", banner: "./images/sec-inkjet.jpg", key: "ink" },
        { cat: "Bulk Inks", banner: "./images/sec-bulk-ink.jpg", key: "bulk" },
        { cat: "Toner Powder", banner: "./images/sec-powder.jpg", key: "powder" },
        { cat: "Printers", banner: "./images/sec-printer.jpg", key: "printers" },
        { cat: "Thermal Paper Rolls", banner: "./images/sec-paper.jpg", key: "paper" },
      ].map(({ cat, banner, key }) => {
        const activeBanner = dynamicSectionBanners[cat] || dynamicSectionBanners[key] || banner;
        return (
          <section key={cat} className="page-section card">
            <div style={{ marginBottom: "14px", borderRadius: "6px", overflow: "hidden" }}>
              <img
                src={activeBanner?.startsWith("/") ? `.${activeBanner}` : activeBanner}
                alt={cat}
                style={{ width: "100%", maxHeight: "140px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = banner;
                }}
              />
            </div>
            <div className="section-header">
              <h2 className="section-title">{cat}</h2>
              <Link to={`/products?category=${encodeURIComponent(cat)}`} className="view-more-link">View All &rarr;</Link>
            </div>
            <div className="product-grid">
              {getCategoryProducts(cat).map((p) => (
                <ProductCard key={p.sku} product={p} onOpenModal={onOpenModal} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Direct RFQ Form */}
      <section className="page-section rfq-banner">
        <h2 className="section-title" style={{ marginBottom: "6px" }}>Send Your Inquiry Here</h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Need OEM pricing, custom packaging, or sample orders? Send a direct RFQ to our sales team.
        </p>
        <form className="rfq-form" onSubmit={handleRfqSubmit}>
          <input type="text" className="form-control" placeholder="Your Name / Company Name" value={rfq.name} onChange={(e) => setRfq({ ...rfq, name: e.target.value })} required />
          <input type="email" className="form-control" placeholder="Business Email Address" value={rfq.email} onChange={(e) => setRfq({ ...rfq, email: e.target.value })} required />
          <input type="text" className="form-control" placeholder="Product Model (e.g. TN770, 85A, 1000ml Ink)" value={rfq.subject} onChange={(e) => setRfq({ ...rfq, subject: e.target.value })} required />
          <input type="number" className="form-control" placeholder="Estimated Order Quantity (pcs)" min="1" value={rfq.quantity} onChange={(e) => setRfq({ ...rfq, quantity: e.target.value })} required />
          <textarea className="form-control full-width" rows={3} placeholder="Describe your packaging, shipping port, or customization requirements..." value={rfq.message} onChange={(e) => setRfq({ ...rfq, message: e.target.value })} required />
          <div className="full-width" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button type="submit" className="btn btn-orange">Send Inquiry Now</button>
            {rfqStatus && <span style={{ color: "green", fontWeight: 600 }}>{rfqStatus}</span>}
          </div>
        </form>
      </section>
    </main>
  );
}
