import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { reportSecurity404 } from "../api";

export default function NotFoundPage({ onOpenModal }) {
  const location = useLocation();
  const [securityData, setSecurityData] = useState({
    checked: false,
    is_blocked: false,
    attempts: 1,
    ip: "",
  });

  useEffect(() => {
    const attemptedPath = location.pathname + location.search + location.hash;
    reportSecurity404(attemptedPath).then((res) => {
      if (res && res.success) {
        setSecurityData({
          checked: true,
          is_blocked: !!res.is_blocked,
          attempts: res.attempts || 1,
          ip: res.ip || "",
        });
      }
    });
  }, [location]);

  // If the IP has been automatically blocked due to multiple unauthorized queries
  if (securityData.is_blocked) {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.card, borderColor: "rgba(239, 68, 68, 0.4)", boxShadow: "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(239, 68, 68, 0.15)" }}>
          <div style={styles.shieldIcon}>🛡️</div>
          <div style={styles.blockedBadge}>Firewall Protection Active</div>
          <h1 style={{ ...styles.title, color: "#ef4444" }}>403 • Access Blocked</h1>
          <p style={styles.text}>
            Your IP address has been restricted from browsing AMIDA network resources due to repeated access attempts to unauthorized or non-existent URLs.
          </p>

          <div style={styles.infoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Your Client IP:</span>
              <span style={styles.infoVal}>{securityData.ip || "Detected Network IP"}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Violation Status:</span>
              <span style={{ ...styles.infoVal, color: "#ef4444" }}>BLOCKED (Attempts: {securityData.attempts})</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Resolution:</span>
              <span style={styles.infoVal}>Requires Admin Unblock</span>
            </div>
          </div>

          <p style={{ ...styles.text, fontSize: "13px", marginTop: "16px" }}>
            If you are an authorized buyer or reached this by accident, please contact management to unblock your IP:
            <br />
            <strong style={{ color: "#38bdf8" }}>acme.info.swapan@gmail.com</strong> • Swapan Kumar Bairagi (CEO)
          </p>

          <div style={{ marginTop: "24px" }}>
            <Link to="/" style={styles.primaryBtn}>
              &larr; Try Reloading Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Themed 404 Not Found Page
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.badge404}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.text}>
          The link or page you are looking for does not exist on AMIDA OFFICE SUPPLIES LIMITED storefront.
        </p>

        <div style={styles.pathBadge}>
          Attempted Route: <code>{location.pathname || "/unknown"}</code>
        </div>

        <div style={styles.securityWarning}>
          <span style={{ fontSize: "16px" }}>🛡️</span>
          <div>
            <strong>Security Shield Notice:</strong>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#fde68a" }}>
              Unauthorized page scans and automated probes are strictly monitored. Visiting non-existent links multiple times will trigger an automated IP firewall block.
              {securityData.attempts > 1 && (
                <span style={{ display: "block", marginTop: "4px", color: "#f87171", fontWeight: 700 }}>
                  Warning: You have {securityData.attempts} probe strike(s) logged. Next violation will block your IP!
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={styles.btnRow}>
          <Link to="/" style={styles.primaryBtn}>
            Return to Home &rarr;
          </Link>
          <Link to="/products" style={styles.secondaryBtn}>
            Browse Products
          </Link>
          {onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal("rfq", "General Product Inquiry")}
              style={styles.outlineBtn}
            >
              Contact Sales Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "75vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 80%)",
  },
  card: {
    background: "rgba(30, 41, 59, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    maxWidth: "580px",
    width: "100%",
    padding: "44px 32px",
    textAlign: "center",
    boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)",
  },
  badge404: {
    fontSize: "84px",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-3px",
    background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 45%, #f97316 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  shieldIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  blockedBadge: {
    display: "inline-block",
    background: "rgba(239, 68, 68, 0.18)",
    color: "#fca5a5",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    padding: "4px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "10px",
  },
  text: {
    color: "#94a3b8",
    fontSize: "14.5px",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  pathBadge: {
    background: "rgba(15, 23, 42, 0.7)",
    border: "1px dashed #334155",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    color: "#f97316",
    fontFamily: "monospace",
    marginBottom: "20px",
    display: "inline-block",
  },
  securityWarning: {
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    borderRadius: "10px",
    padding: "12px 16px",
    textAlign: "left",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  infoBox: {
    background: "rgba(15, 23, 42, 0.7)",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "14px 18px",
    textAlign: "left",
    marginBottom: "20px",
    fontSize: "13px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  infoLabel: {
    color: "#64748b",
  },
  infoVal: {
    color: "#38bdf8",
    fontFamily: "monospace",
    fontWeight: 600,
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "var(--accent-orange, #f97316)",
    color: "#ffffff",
    padding: "11px 22px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  secondaryBtn: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "11px 22px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  outlineBtn: {
    background: "transparent",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    padding: "11px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
