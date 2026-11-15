import { useEffect, useState } from "react";
import {
  adminDeleteInquiry,
  adminGetInquiries,
  adminReplyInquiry,
  adminUpdateInquiryStatus,
} from "../adminApi";

export default function AdminInquiriesPage({ onToast, onRefreshBadge }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Modals
  const [viewInquiry, setViewInquiry] = useState(null);
  const [replyInquiry, setReplyInquiry] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.q = search;

      const res = await adminGetInquiries(params);
      if (res.success) {
        setInquiries(res.inquiries);
        setPagination(res.pagination);
        if (onRefreshBadge) {
          onRefreshBadge(res.unread_count || 0);
        }
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadInquiries();
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      const res = await adminUpdateInquiryStatus(inquiryId, newStatus);
      if (res.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
        );
        onToast(`Inquiry #${inquiryId} marked as ${newStatus}`, "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleOpenReply = (inq) => {
    setReplyInquiry(inq);
    setReplySubject(`Re: ${inq.subject || "Wholesale Inquiry with AMIDA OFFICE SUPPLIES LIMITED"}`);
    setReplyMessage(
      `Dear ${inq.name},\n\nThank you for reaching out to AMIDA OFFICE SUPPLIES LIMITED regarding your inquiry for "${inq.subject}".\n\nUnder the direction of Swapan Kumar Bairagi (CEO), our export department has verified your requirements (Estimated Quantity: ${
        inq.quantity || "N/A"
      }).\n\nWe are committed to delivering on our promise of "Price Quality Service" and would be delighted to provide you with tiered pricing and arrange samples for testing.\n\nCorporate Office:\n126 Main Street, Acme, AB T0M 0A0, Canada\nTel: +1 604 316 8138\nWeb: www.acme-supplies.ca\n\nBest Regards,\nAMIDA OFFICE SUPPLIES LIMITED`
    );
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setSendingReply(true);
    try {
      const res = await adminReplyInquiry(replyInquiry.id, replyMessage, replySubject);
      if (res.success) {
        onToast(res.message, "success");
        setReplyInquiry(null);
        loadInquiries();
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Permanently remove inquiry #${id}?`)) {
      try {
        const res = await adminDeleteInquiry(id);
        if (res.success) {
          onToast("Inquiry deleted", "success");
          loadInquiries();
        }
      } catch (err) {
        onToast(err.message, "error");
      }
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>RFQ &amp; Customer Inquiries Inbox</h1>
          <p>
            Process wholesale quote requests, sample inquiries, and customer chat messages.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="adm-card" style={{ padding: "16px", marginBottom: "18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div className="adm-tabs" style={{ margin: 0, border: "none" }}>
            {[
              { key: "all", label: "All Inquiries" },
              { key: "new", label: "New Leads" },
              { key: "in_progress", label: "In Progress" },
              { key: "replied", label: "Replied" },
              { key: "archived", label: "Archived" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`adm-tab ${statusFilter === tab.key ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              className="adm-input"
              placeholder="Search name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "240px" }}
            />
            <button type="submit" className="adm-btn adm-btn-primary adm-btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: "95px" }}>Date</th>
                <th>Buyer Name</th>
                <th>Email Address</th>
                <th>Subject / Model</th>
                <th>Quantity</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ textAlign: "right", minWidth: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    Loading customer inquiries...
                  </td>
                </tr>
              ) : inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td style={{ color: "var(--adm-text-subtle)", fontSize: "12px" }}>
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{inq.name}</td>
                    <td>
                      <a
                        href={`mailto:${inq.email}`}
                        style={{ color: "var(--adm-accent-cyan)", textDecoration: "none" }}
                      >
                        {inq.email}
                      </a>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 500,
                          maxWidth: "240px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {inq.subject}
                      </div>
                    </td>
                    <td>{inq.quantity ? `${inq.quantity} pcs` : "-"}</td>
                    <td>
                      <span className="adm-badge adm-badge-blue">
                        {inq.type ? inq.type.toUpperCase() : "RFQ"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="adm-select"
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        style={{ padding: "4px 8px", fontSize: "11.5px", width: "auto" }}
                      >
                        <option value="new">🟡 New</option>
                        <option value="in_progress">🔵 In Progress</option>
                        <option value="replied">🟢 Replied</option>
                        <option value="archived">⚪ Archived</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          onClick={() => setViewInquiry(inq)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-primary adm-btn-sm"
                          onClick={() => handleOpenReply(inq)}
                        >
                          ✉️ Reply
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          onClick={() => handleDelete(inq.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    No inquiries found for this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid var(--adm-border)",
            }}
          >
            <div style={{ fontSize: "12.5px", color: "var(--adm-text-muted)" }}>
              Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="adm-btn adm-btn-secondary adm-btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                &larr; Prev
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-secondary adm-btn-sm"
                disabled={page >= pagination.last_page}
                onClick={() => setPage(page + 1)}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: View Inquiry Details */}
      {viewInquiry && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setViewInquiry(null)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Inquiry Details #{viewInquiry.id}</h2>
              <button type="button" className="adm-modal-close" onClick={() => setViewInquiry(null)}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <div className="adm-label">Buyer Name</div>
                  <div style={{ color: "#fff", fontWeight: 600 }}>{viewInquiry.name}</div>
                </div>
                <div>
                  <div className="adm-label">Email Address</div>
                  <div style={{ color: "var(--adm-accent-cyan)" }}>{viewInquiry.email}</div>
                </div>
                <div>
                  <div className="adm-label">Target Product / Model</div>
                  <div style={{ color: "#fff" }}>{viewInquiry.subject}</div>
                </div>
                <div>
                  <div className="adm-label">Estimated Quantity</div>
                  <div style={{ color: "#fff" }}>{viewInquiry.quantity || "Not specified"}</div>
                </div>
              </div>

              <div>
                <div className="adm-label">Customer Message / Specifications</div>
                <div
                  style={{
                    background: "#0f172a",
                    border: "1px solid var(--adm-border)",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "#e2e8f0",
                    whiteSpace: "pre-wrap",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {viewInquiry.message}
                </div>
              </div>

              {viewInquiry.reply_message && (
                <div>
                  <div className="adm-label" style={{ color: "var(--adm-accent-emerald)" }}>
                    Admin Reply Sent ({new Date(viewInquiry.replied_at).toLocaleString()})
                  </div>
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      borderRadius: "6px",
                      padding: "12px",
                      color: "#6ee7b7",
                      whiteSpace: "pre-wrap",
                      fontSize: "12.5px",
                    }}
                  >
                    {viewInquiry.reply_message}
                  </div>
                </div>
              )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setViewInquiry(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={() => {
                  const inq = viewInquiry;
                  setViewInquiry(null);
                  handleOpenReply(inq);
                }}
              >
                ✉️ Reply to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct Reply via SMTP Email */}
      {replyInquiry && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setReplyInquiry(null)}>
          <div className="adm-modal" style={{ maxWidth: "650px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">
                Send Email Reply to {replyInquiry.name} ({replyInquiry.email})
              </h2>
              <button type="button" className="adm-modal-close" onClick={() => setReplyInquiry(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSendReply}>
              <div className="adm-form-group">
                <label className="adm-label">Email Subject *</label>
                <input
                  type="text"
                  className="adm-input"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Reply Message Body (SMTP Outgoing) *</label>
                <textarea
                  className="adm-textarea"
                  rows={8}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                />
                <div className="adm-hint">
                  This response will be dispatched directly to the buyer&apos;s email address via your configured SMTP mail server.
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setReplyInquiry(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={sendingReply}
                >
                  {sendingReply ? "Dispatching via SMTP..." : "Send Email Response &rarr;"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
