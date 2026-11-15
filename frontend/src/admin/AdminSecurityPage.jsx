import { useEffect, useState } from "react";
import {
  adminBlockIp,
  adminDeleteBlockedIp,
  adminGetBlockedIps,
  adminUnblockIp,
} from "../adminApi";

export default function AdminSecurityPage({ onToast }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    total_tracked: 0,
    total_blocked: 0,
    total_monitored: 0,
    total_probes: 0,
    threshold: 2,
  });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newReason, setNewReason] = useState("Manual administrator security block");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminGetBlockedIps({
        filter: filter === "all" ? "" : filter,
        q: search,
      });
      if (res && res.success) {
        setData(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch {
      onToast?.("Failed to load security firewall data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleUnblock = async (ip) => {
    if (!window.confirm(`Are you sure you want to unblock IP: ${ip}? They will regain full site access.`)) return;
    try {
      const res = await adminUnblockIp(ip);
      if (res && res.success) {
        onToast?.(res.message || `IP ${ip} successfully unblocked!`, "success");
        loadData();
      } else {
        onToast?.(res?.message || "Failed to unblock IP", "error");
      }
    } catch (err) {
      onToast?.(err.message || "Unblock request failed", "error");
    }
  };

  const handleBlockManual = async (ip, reason) => {
    try {
      const res = await adminBlockIp(ip, reason);
      if (res && res.success) {
        onToast?.(`IP ${ip} is now blocked!`, "success");
        loadData();
      } else {
        onToast?.(res?.message || "Failed to block IP", "error");
      }
    } catch (err) {
      onToast?.(err.message || "Block request failed", "error");
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setSubmitting(true);
    try {
      await handleBlockManual(newIp.trim(), newReason.trim());
      setShowBlockModal(false);
      setNewIp("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, ip) => {
    if (!window.confirm(`Delete log record for ${ip}?`)) return;
    try {
      const res = await adminDeleteBlockedIp(id);
      if (res && res.success) {
        onToast?.("Record deleted", "success");
        loadData();
      }
    } catch {
      onToast?.("Failed to delete record", "error");
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">🛡️ IP Firewall &amp; 404 Intrusion Defense</h1>
          <p className="adm-page-subtitle">
            Monitors unauthorized URL probes. Automatically restricts client IPs after {stats.threshold} invalid page scans.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={loadData} className="adm-btn adm-btn-outline">
            🔄 Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowBlockModal(true)}
            className="adm-btn adm-btn-primary"
            style={{ background: "#dc2626", borderColor: "#dc2626" }}
          >
            + Block IP Manually
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="adm-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="adm-stat-card">
          <div className="adm-stat-header">
            <span className="adm-stat-title">Active Blocked IPs</span>
            <span style={{ fontSize: "20px" }}>🚫</span>
          </div>
          <div className="adm-stat-value" style={{ color: "#ef4444" }}>
            {stats.total_blocked}
          </div>
          <div className="adm-stat-change">Restricted from all storefront endpoints</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-header">
            <span className="adm-stat-title">Tracked Scan Sources</span>
            <span style={{ fontSize: "20px" }}>📡</span>
          </div>
          <div className="adm-stat-value" style={{ color: "#38bdf8" }}>
            {stats.total_tracked}
          </div>
          <div className="adm-stat-change">Total client IPs registered in security log</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-header">
            <span className="adm-stat-title">404 Probes Prevented</span>
            <span style={{ fontSize: "20px" }}>⚡</span>
          </div>
          <div className="adm-stat-value" style={{ color: "#f59e0b" }}>
            {stats.total_probes}
          </div>
          <div className="adm-stat-change">Unauthorized URL requests intercepted</div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-header">
            <span className="adm-stat-title">Firewall Threshold</span>
            <span style={{ fontSize: "20px" }}>🔒</span>
          </div>
          <div className="adm-stat-value" style={{ color: "#10b981" }}>
            {stats.threshold} Strikes
          </div>
          <div className="adm-stat-change">Auto-block triggered on 2nd invalid query</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="adm-card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`adm-btn adm-btn-sm ${filter === "all" ? "adm-btn-primary" : "adm-btn-outline"}`}
            >
              All Records ({stats.total_tracked})
            </button>
            <button
              type="button"
              onClick={() => setFilter("blocked")}
              className={`adm-btn adm-btn-sm ${filter === "blocked" ? "adm-btn-primary" : "adm-btn-outline"}`}
              style={filter === "blocked" ? { background: "#dc2626", borderColor: "#dc2626" } : {}}
            >
              Blocked Only ({stats.total_blocked})
            </button>
            <button
              type="button"
              onClick={() => setFilter("monitored")}
              className={`adm-btn adm-btn-sm ${filter === "monitored" ? "adm-btn-primary" : "adm-btn-outline"}`}
            >
              Monitored (Under Limit)
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="adm-input"
              style={{ width: "260px", padding: "7px 12px", fontSize: "13px" }}
              placeholder="Search IP, path, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="adm-btn adm-btn-outline adm-btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Security Logs Data Table */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--adm-border)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
            Firewall Access Logs &amp; Monitored IP Addresses
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--adm-text-muted)" }}>
            Loading security firewall data...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--adm-text-muted)" }}>
            🛡️ No suspicious IP records found. System is fully protected.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Client IP</th>
                  <th>Firewall Status</th>
                  <th>Probes</th>
                  <th>Last Attempted Route</th>
                  <th>Reason / Notes</th>
                  <th>Last Activity</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code style={{ fontSize: "13px", fontWeight: 700, color: item.is_blocked ? "#f87171" : "#38bdf8" }}>
                        {item.ip_address}
                      </code>
                    </td>
                    <td>
                      {item.is_blocked ? (
                        <span className="adm-badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
                          🔒 BLOCKED
                        </span>
                      ) : (
                        <span className="adm-badge" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fcd34d", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
                          ⚠️ MONITORED
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: item.attempt_count >= stats.threshold ? "#ef4444" : "#94a3b8" }}>
                        {item.attempt_count}
                      </strong>{" "}
                      <span style={{ fontSize: "11px", color: "var(--adm-text-subtle)" }}>strikes</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          maxWidth: "240px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#f59e0b",
                        }}
                        title={item.last_path}
                      >
                        /{item.last_path || "unknown"}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--adm-text-muted)", maxWidth: "220px" }}>
                      {item.notes || item.reason}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--adm-text-subtle)", whiteSpace: "nowrap" }}>
                      {item.updated_at ? new Date(item.updated_at).toLocaleString() : "N/A"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {item.is_blocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnblock(item.ip_address)}
                          className="adm-btn adm-btn-sm"
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            marginRight: "6px",
                            padding: "5px 12px",
                            fontWeight: 600,
                          }}
                        >
                          🔓 Unblock IP
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBlockManual(item.ip_address, "Manually blocked from monitor list")}
                          className="adm-btn adm-btn-sm"
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#fca5a5",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            marginRight: "6px",
                            padding: "5px 10px",
                          }}
                        >
                          🔒 Block
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.ip_address)}
                        className="adm-btn adm-btn-outline adm-btn-sm"
                        style={{ color: "#ef4444", borderColor: "#ef4444" }}
                        title="Delete log"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Block IP Modal */}
      {showBlockModal && (
        <div className="adm-modal-backdrop">
          <div className="adm-modal-card" style={{ maxWidth: "460px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">🔒 Manually Block IP Address</h2>
              <button type="button" onClick={() => setShowBlockModal(false)} className="adm-modal-close">
                &times;
              </button>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div style={{ padding: "20px" }}>
                <div className="adm-form-group">
                  <label className="adm-label">Target IP Address (IPv4 or IPv6)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. 192.168.1.100 or 2001:db8::1"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Block Reason / Reference</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    color: "#fca5a5",
                  }}
                >
                  ⚠️ <strong>Notice:</strong> This IP will be immediately blocked from loading products, checking out, and browsing any storefront APIs.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="adm-btn adm-btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="adm-btn"
                  style={{ background: "#dc2626", color: "#fff", border: "none" }}
                >
                  {submitting ? "Enforcing Block..." : "Enforce IP Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
