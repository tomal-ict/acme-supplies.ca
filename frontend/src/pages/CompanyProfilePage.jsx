import { useState } from "react";
import { Link } from "react-router-dom";

const MEDIA_TABS = {
  overview: [
    { title: "Industrial Park & Factory Overview", img: "./images/company/factory-overview.jpg", desc: "75,000 m² owned manufacturing campus & logistics center." },
    { title: "Automated Assembly & Production", img: "./images/company/machinery-1.jpg", desc: "48 production lines with 1,000,000+ monthly output." },
    { title: "European Overseas Warehouse", img: "./images/fac-warehouse.jpg", desc: "Rapid 2–4 day regional delivery & customs-cleared stock." },
  ],
  production: [
    { title: "Injection Molding Hall", img: "./images/company/tab-production.jpg", desc: "High-precision automated plastic shell molding machines." },
    { title: "Robotic Cartridge Assembly", img: "./images/company/machinery-1.jpg", desc: "10 automated robotic arms for consistent toner filling." },
    { title: "Cleanroom Production Lines", img: "./images/company/machinery-2.jpg", desc: "Dust-controlled cleanroom assembly & ultrasonic sealing." },
  ],
  qc: [
    { title: "3D Measure Testing Machine", img: "./images/company/tab-qc.jpg", desc: "Micron-level gear & housing dimensional accuracy." },
    { title: "100% Post-Production Print Test", img: "./images/company/machinery-3.jpg", desc: "Every cartridge verified by 15 dedicated QA/QC inspectors." },
    { title: "9 Specialized Testing Instruments", img: "./images/fac-meeting.jpg", desc: "Optical density, page-yield & drop-test verification." },
  ],
  rd: [
    { title: "Resistance & Environmental Testing", img: "./images/company/tab-rd.jpg", desc: "-20°C to +55°C climate & transit stress simulation." },
    { title: "10 R&D Engineers & Patent Lab", img: "./images/fac-team.jpg", desc: "Non-infringing patent gear design & smart chip firmware." },
    { title: "Custom OEM / ODM Packaging", img: "./images/fac-equipment.jpg", desc: "Tailored private-label branding and sample processing." },
  ],
};

const CAPABILITIES = [
  { icon: "./images/company/cap-custom.png", title: "Customization", desc: "Customized on Demand • Sample Processing" },
  { icon: "./images/company/cap-trade.png", title: "Trade & Market", desc: "25 Years Exporting • T/T, L/C Supported" },
  { icon: "./images/company/cap-rd.png", title: "R&D", desc: "10 R&D Engineers • Media Package Available" },
  { icon: "./images/company/cap-prod.png", title: "Production", desc: "48 Production Lines • 75,000 m² Floor Space" },
  { icon: "./images/company/cap-qc.png", title: "Quality Control", desc: "15 QA/QC Inspectors • 9 Testing Instruments" },
  { icon: "./images/company/cap-service.png", title: "Featured Services", desc: "Offline Trade Shows • E-Commerce Capability" },
];

const CERTIFICATES = [
  { title: "ISO 14001", id: "02424E32281767R0M", img: "./images/company/cert-iso14001.jpg" },
  { title: "ISO 45001", id: "02424S32281385R0M", img: "./images/company/cert-iso45001.png" },
  { title: "ISO 9001", id: "02424Q32282923R0M", img: "./images/company/cert-iso9001.png" },
  { title: "CE Certificate", id: "HK2303060663E", img: "./images/company/cert-ce.png" },
  { title: "CEC Certificate", id: "CEC2024ELP07927212", img: "./images/company/cert-cec.png" },
  { title: "RoHS Certificate", id: "NAP2412065501E", img: "./images/company/cert-rohs.png" },
];

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="container">
      {/* 1. Supplier Performance Overview */}
      <section className="page-section card">
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1 className="section-title">AMIDA OFFICE SUPPLIES LIMITED — Company Profile</h1>
            <img src="./images/company/sgs-badge.png" alt="SGS Verified" style={{ height: "26px" }} />
          </div>
          <Link to="/company-profile/feedback" className="verified-badge">
            4.9 / 5.0 &#9733; (92% 5-Star Reviews) &rarr;
          </Link>
        </div>

        {/* Visiting Card Corporate Profile */}
        <div style={{ background: "linear-gradient(135deg, #f8fafc, #eff6ff)", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "18px 22px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#0284c7", letterSpacing: "1px" }}>
                Official Corporate Executive
              </span>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1e3a8a", margin: "4px 0" }}>
                Swapan Kumar Bairagi
              </h2>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                Chief Executive Officer (CEO) &bull; <strong style={{ color: "#0f172a" }}>AMIDA OFFICE SUPPLIES LIMITED</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#0284c7", fontWeight: 700, marginTop: "4px" }}>
                Motto: Price Quality Service
              </div>
            </div>

            <div style={{ fontSize: "13px", lineHeight: "1.7", color: "#334155" }}>
              <div>📍 <strong>Corporate Office:</strong> 126 Main Street, Acme, AB T0M 0A0, Canada</div>
              <div>📞 <strong>Telephone:</strong> <a href="tel:+16043168138" style={{ color: "#0284c7", fontWeight: 600 }}>+1 604 316 8138</a></div>
              <div>✉️ <strong>Direct Email:</strong> <a href="mailto:acme.info.swapan@gmail.com" style={{ color: "#0284c7" }}>acme.info.swapan@gmail.com</a></div>
              <div>🌐 <strong>Web:</strong> <a href="https://www.acme-supplies.ca" target="_blank" rel="noreferrer" style={{ color: "#0284c7", fontWeight: 600 }}>www.acme-supplies.ca</a></div>
            </div>
          </div>
        </div>

        <div className="facts-grid">
          <div className="fact-item"><div className="fact-label">Supplier Rating</div><div className="fact-value">4.9 &#9733; Satisfied (3.1% higher than industry avg)</div></div>
          <div className="fact-item"><div className="fact-label">Corporate Headquarters</div><div className="fact-value">126 Main Street, Acme, AB T0M 0A0, Canada</div></div>
          <div className="fact-item"><div className="fact-label">Executive Leadership</div><div className="fact-value">Swapan Kumar Bairagi, Chief Executive Officer (CEO)</div></div>
        </div>

        <h3 style={{ fontSize: "15px", margin: "20px 0 12px" }}>Performance Benchmarks</h3>
        <div className="radar-grid">
          <div className="metric-bar-card">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>Response Time</span><span>&le; 2h (96%)</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: "96%" }} /></div>
          </div>
          <div className="metric-bar-card">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>On-Time Dispatch Rate</span><span>98.4%</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: "98%" }} /></div>
          </div>
          <div className="metric-bar-card">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>Product Quality Score</span><span>5.0 / 5.0</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: "100%" }} /></div>
          </div>
          <div className="metric-bar-card">
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}><span>Low Dispute Rate</span><span>99.8% Clean</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: "99%" }} /></div>
          </div>
        </div>
      </section>

      {/* 2. Factory & Facility Media Tabs */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Factory &amp; Facility Tour</h2></div>
        <div className="media-tabs">
          <button type="button" className={`media-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview (14)</button>
          <button type="button" className={`media-tab ${activeTab === "production" ? "active" : ""}`} onClick={() => setActiveTab("production")}>Production (6)</button>
          <button type="button" className={`media-tab ${activeTab === "qc" ? "active" : ""}`} onClick={() => setActiveTab("qc")}>Quality Control (9)</button>
          <button type="button" className={`media-tab ${activeTab === "rd" ? "active" : ""}`} onClick={() => setActiveTab("rd")}>R&amp;D (3)</button>
        </div>
        <div className="grid-3">
          {MEDIA_TABS[activeTab].map((item) => (
            <div key={item.title} className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
              <img src={item.img} alt={item.title} style={{ width: "100%", height: "190px", objectFit: "cover" }} />
              <div style={{ padding: "14px" }}>
                <h4 style={{ marginBottom: "6px" }}>{item.title}</h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Manufacturer Capabilities Cards */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Manufacturer Capabilities</h2></div>
        <div className="grid-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="feature-box" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src={c.icon} alt={c.title} style={{ width: "48px", height: "48px", objectFit: "contain", flexShrink: 0 }} />
              <div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "15px", margin: "20px 0 12px" }}>Global Export Market Share</h3>
        <div className="facts-grid">
          <div className="fact-item"><div className="fact-label">Mid East</div><div className="fact-value">26%</div></div>
          <div className="fact-item"><div className="fact-label">South America</div><div className="fact-value">18%</div></div>
          <div className="fact-item"><div className="fact-label">Eastern Europe</div><div className="fact-value">13%</div></div>
          <div className="fact-item"><div className="fact-label">Africa</div><div className="fact-value">12%</div></div>
          <div className="fact-item"><div className="fact-label">North America</div><div className="fact-value">11%</div></div>
          <div className="fact-item"><div className="fact-label">Other Global Markets</div><div className="fact-value">20%</div></div>
        </div>
      </section>

      {/* 4. Production Machinery Gallery */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Production Machinery &amp; Assembly Lines</h2></div>
        <div className="grid-3">
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/company/machinery-1.jpg" alt="Automatic Assembly Line" style={{ width: "100%", height: "190px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}><h4>Automatic Assembly Line</h4><p>High-speed robotic toner cartridge assembly.</p></div>
          </div>
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/company/machinery-2.jpg" alt="Precision Assembly Line" style={{ width: "100%", height: "190px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}><h4>Cleanroom Assembly Line</h4><p>48 dedicated lines for laser &amp; inkjet units.</p></div>
          </div>
          <div className="feature-box" style={{ padding: 0, overflow: "hidden" }}>
            <img src="./images/company/machinery-3.jpg" alt="Injection Molding Machine" style={{ width: "100%", height: "190px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}><h4>Injection Molding Machine</h4><p>In-house housing &amp; patent gear molding.</p></div>
          </div>
        </div>
      </section>

      {/* 5. Official Certifications */}
      <section className="page-section card">
        <div className="section-header"><h2 className="section-title">Official Certifications &amp; Compliance</h2></div>
        <div className="grid-3">
          {CERTIFICATES.map((cert) => (
            <div key={cert.title} className="feature-box" style={{ textAlign: "center" }}>
              <img src={cert.img} alt={cert.title} style={{ height: "180px", margin: "0 auto 10px", objectFit: "contain" }} />
              <h4>{cert.title}</h4>
              <p>Certificate ID: <strong>{cert.id}</strong></p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
