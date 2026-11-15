import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { reportSecurity404 } from "../api";

export default function NotFoundPage() {
  const location = useLocation();
  const [isBlocked, setIsBlocked] = useState(false);
  const [clientIp, setClientIp] = useState("");

  useEffect(() => {
    const attemptedPath = location.pathname + location.search + location.hash;
    reportSecurity404(attemptedPath).then((res) => {
      if (res && res.is_blocked) {
        setIsBlocked(true);
        if (res.ip) setClientIp(res.ip);
      }
    });
  }, [location]);

  if (isBlocked) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.blockedCard}>
          <div style={styles.shieldIcon}>🛡️</div>
          <h1 style={{ ...styles.title, color: "#ef4444" }}>403 • Access Blocked</h1>
          <p style={styles.text}>
            Your IP address ({clientIp}) has been blocked by the security system.
          </p>
          <p style={{ ...styles.text, fontSize: "13px" }}>
            Please contact administrator to unblock:{" "}
            <strong style={{ color: "#38bdf8" }}>acme.info.swapan@gmail.com</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.badge404}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <div style={{ marginTop: "28px" }}>
          <Link to="/" style={styles.homeBtn}>
            Back to Home &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 80%)",
  },
  card: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(14px)",
    borderRadius: "20px",
    maxWidth: "500px",
    width: "100%",
    padding: "50px 32px",
    textAlign: "center",
    boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)",
  },
  blockedCard: {
    background: "rgba(17, 24, 39, 0.95)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "100%",
    padding: "44px 32px",
    textAlign: "center",
    boxShadow: "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(239, 68, 68, 0.15)",
  },
  shieldIcon: {
    fontSize: "52px",
    marginBottom: "16px",
  },
  badge404: {
    fontSize: "96px",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-4px",
    background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 45%, #f97316 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  text: {
    color: "#94a3b8",
    fontSize: "14.5px",
    lineHeight: 1.6,
    margin: "12px 0 0",
  },
  homeBtn: {
    background: "var(--accent-orange, #f97316)",
    color: "#ffffff",
    padding: "12px 28px",
    borderRadius: "8px",
    fontSize: "14.5px",
    fontWeight: 700,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    display: "inline-block",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
    transition: "transform 0.15s ease",
  },
};
