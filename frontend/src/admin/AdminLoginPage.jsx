import { useState } from "react";
import { adminLogin } from "../adminApi";

export default function AdminLoginPage({ onLoginSuccess }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin(login, password);
      if (res.success && res.token) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Check server connection or credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-header">
          <div className="adm-login-logo-badge">
            <img src="./images/logo.png" alt="AMIDA OFFICE SUPPLIES LIMITED" className="adm-login-logo" />
          </div>
          <h1 className="adm-login-title">Control Center Login</h1>
          <p className="adm-login-subtitle">
            Secure Backend Administration &bull; AMIDA Imaging Global
          </p>
        </div>

        {error && <div className="adm-alert adm-alert-error">&#9888; {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label" htmlFor="admLogin">
              Username or Administrator Email
            </label>
            <input
              id="admLogin"
              type="text"
              className="adm-input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Enter username or email"
              required
              autoFocus
            />
          </div>

          <div className="adm-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="adm-label" htmlFor="admPass">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--adm-primary)",
                  fontSize: "11.5px",
                  cursor: "pointer",
                  padding: "0 4px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="admPass"
              type={showPassword ? "text" : "password"}
              className="adm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="adm-btn adm-btn-primary"
            style={{ width: "100%", padding: "11px", fontSize: "14px", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Authenticating Security Token..." : "Sign In to Admin Panel →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <a
            href="#/"
            style={{ fontSize: "12.5px", color: "var(--adm-text-subtle)", textDecoration: "none" }}
          >
            &larr; Back to Public Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
