import { useEffect, useState } from "react";
import {
  adminDeleteOrder,
  adminGetOrders,
  adminGetSettings,
  adminUpdateOrderStatus,
} from "../adminApi";
import OrderVoucher from "../components/OrderVoucher";

export default function AdminOrdersPage({ onToast, initialTab = "active" }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(initialTab); // 'active' | 'incomplete'

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [counts, setCounts] = useState({});

  // View / Edit Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [voucherOrder, setVoucherOrder] = useState(null);
  const [siteSettings, setSiteSettings] = useState({});
  const [newDeliveryStatus, setNewDeliveryStatus] = useState("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState("unpaid");
  const [orderNotes, setOrderNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetSettings()
      .then((res) => {
        if (res.success && res.settings) {
          setSiteSettings(res.settings);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (tab === "incomplete") {
        params.incomplete = "1";
      } else {
        params.active_only = "1";
      }
      if (deliveryFilter !== "all") params.delivery_status = deliveryFilter;
      if (paymentFilter !== "all") params.payment_status = paymentFilter;
      if (search) params.q = search;

      const res = await adminGetOrders(params);
      if (res.success) {
        setOrders(res.orders);
        setPagination(res.pagination);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [tab, page, deliveryFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const handleOpenDetails = (ord) => {
    setSelectedOrder(ord);
    setNewDeliveryStatus(ord.delivery_status);
    setNewPaymentStatus(ord.payment_status);
    setOrderNotes(ord.notes || "");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminUpdateOrderStatus(selectedOrder.id, {
        delivery_status: newDeliveryStatus,
        payment_status: newPaymentStatus,
        notes: orderNotes,
      });
      if (res.success) {
        onToast(`Order ${selectedOrder.order_code} updated successfully!`, "success");
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete order ${code}?`)) {
      try {
        const res = await adminDeleteOrder(id);
        if (res.success) {
          onToast("Order deleted", "success");
          loadOrders();
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
          <h1>Sales &amp; Orders Management</h1>
          <p>
            Track wholesale purchase orders, invoices, shipment delivery pipelines, and abandoned carts.
          </p>
        </div>
      </div>

      {/* Pipeline Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "var(--adm-text-subtle)", textTransform: "uppercase" }}>Total Orders</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginTop: "2px" }}>
            {counts.total_orders || 0}
          </div>
        </div>
        <div style={{ background: "#1e293b", border: "1px solid #f59e0b", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#fbbf24", textTransform: "uppercase" }}>Pending</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24", marginTop: "2px" }}>
            {counts.pending || 0}
          </div>
        </div>
        <div style={{ background: "#1e293b", border: "1px solid #3b82f6", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#60a5fa", textTransform: "uppercase" }}>Confirmed</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#60a5fa", marginTop: "2px" }}>
            {counts.confirmed || 0}
          </div>
        </div>
        <div style={{ background: "#1e293b", border: "1px solid #06b6d4", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#22d3ee", textTransform: "uppercase" }}>On The Way</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#22d3ee", marginTop: "2px" }}>
            {counts.on_delivery || 0}
          </div>
        </div>
        <div style={{ background: "#1e293b", border: "1px solid #10b981", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#34d399", textTransform: "uppercase" }}>Delivered</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>
            {counts.delivered || 0}
          </div>
        </div>
        <div style={{ background: "#1e293b", border: "1px solid #f43f5e", borderRadius: "8px", padding: "12px 14px" }}>
          <div style={{ fontSize: "11px", color: "#fda4af", textTransform: "uppercase" }}>Incomplete</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fda4af", marginTop: "2px" }}>
            {counts.incomplete_orders || 0}
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="adm-card" style={{ padding: "16px", marginBottom: "18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div className="adm-tabs" style={{ margin: 0, border: "none" }}>
            <button
              type="button"
              className={`adm-tab ${tab === "active" ? "active" : ""}`}
              onClick={() => {
                setTab("active");
                setPage(1);
              }}
            >
              🛒 All Customer Orders ({counts.total_orders || 0})
            </button>
            <button
              type="button"
              className={`adm-tab ${tab === "incomplete" ? "active" : ""}`}
              onClick={() => {
                setTab("incomplete");
                setPage(1);
              }}
            >
              ⏳ Incomplete Orders / Cart Abandonments ({counts.incomplete_orders || 0})
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <select
              className="adm-select"
              value={deliveryFilter}
              onChange={(e) => {
                setDeliveryFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: "auto" }}
            >
              <option value="all">All Delivery Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="on_delivery">On The Way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="adm-select"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: "auto" }}
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <input
              type="text"
              className="adm-input"
              placeholder="Search order code, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "220px" }}
            />
            <button type="submit" className="adm-btn adm-btn-primary adm-btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: "170px" }}>Order Code</th>
                <th>Customer Details</th>
                <th>Items Count</th>
                <th>Total Amount</th>
                <th>Delivery Status</th>
                <th>Payment Status</th>
                <th style={{ textAlign: "right", minWidth: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--adm-accent-cyan)" }}>
                        {ord.order_code}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adm-text-subtle)" }}>
                        {new Date(ord.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.customer_name}</div>
                      <div style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>
                        {ord.customer_email}
                      </div>
                      {ord.customer_phone && (
                        <div style={{ fontSize: "11.5px", color: "var(--adm-text-subtle)" }}>
                          {ord.customer_phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-blue">
                        {(ord.items || []).length} Products
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#fff", fontSize: "14px" }}>
                      ${Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          ord.delivery_status === "delivered"
                            ? "adm-badge-green"
                            : ord.delivery_status === "confirmed"
                            ? "adm-badge-blue"
                            : ord.delivery_status === "on_delivery"
                            ? "adm-badge-blue"
                            : ord.delivery_status === "cancelled"
                            ? "adm-badge-rose"
                            : "adm-badge-amber"
                        }`}
                      >
                        {ord.delivery_status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          ord.payment_status === "paid" ? "adm-badge-green" : "adm-badge-amber"
                        }`}
                      >
                        {ord.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-primary adm-btn-sm"
                          onClick={() => handleOpenDetails(ord)}
                        >
                          View &amp; Edit
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          onClick={() => handleDelete(ord.id, ord.order_code)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    No {tab === "incomplete" ? "incomplete orders" : "orders"} found.
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

      {/* Modal: View & Update Order */}
      {selectedOrder && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="adm-modal" style={{ maxWidth: "780px" }}>
            <div className="adm-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <h2 className="adm-modal-title" style={{ margin: 0 }}>
                  Order Invoice: {selectedOrder.order_code}
                </h2>
                <button
                  type="button"
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  onClick={() => setVoucherOrder(selectedOrder)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                >
                  🖨️ Print Voucher
                </button>
              </div>
              <button type="button" className="adm-modal-close" onClick={() => setSelectedOrder(null)}>
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  background: "#0f172a",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "1px solid var(--adm-border)",
                }}
              >
                <div>
                  <div className="adm-label">Customer Name</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{selectedOrder.customer_name}</div>
                </div>
                <div>
                  <div className="adm-label">Customer Email</div>
                  <div style={{ color: "var(--adm-accent-cyan)" }}>{selectedOrder.customer_email}</div>
                </div>
                <div>
                  <div className="adm-label">Phone Contact</div>
                  <div style={{ color: "#fff" }}>{selectedOrder.customer_phone || "N/A"}</div>
                </div>
                <div>
                  <div className="adm-label">Order Date &amp; Time</div>
                  <div style={{ color: "#fff" }}>{new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="adm-label">Delivery Destination Area</div>
                  <div style={{ color: "#38bdf8", fontWeight: 600 }}>
                    {selectedOrder.delivery_area === "outside_city"
                      ? "Outside City"
                      : selectedOrder.delivery_area === "inside_city"
                      ? "Inside City"
                      : selectedOrder.delivery_area || "Standard Delivery"}
                  </div>
                </div>
                <div>
                  <div className="adm-label">Payment Method</div>
                  <div style={{ color: "#facc15", fontWeight: 600 }}>
                    {selectedOrder.payment_method || "Cash on Delivery"}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="adm-label">Shipping / Port Delivery Destination</div>
                  <div style={{ color: "#cbd5e1", fontSize: "13px" }}>
                    {selectedOrder.shipping_address || "Standard Ex-Works / Factory Dispatch"}
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  Ordered Items &amp; Wholesale Quantities
                </h3>
                <div className="adm-table-container">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product Specification</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th style={{ textAlign: "right" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((it, idx) => {
                        const qty = Number(it.quantity || it.qty || 1);
                        const price = Number(it.price || 0);
                        return (
                          <tr key={idx}>
                            <td style={{ color: "var(--adm-accent-cyan)", fontWeight: 700 }}>{it.sku || "N/A"}</td>
                            <td>{it.title}</td>
                            <td>${price.toFixed(2)}</td>
                            <td>{qty} pcs</td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#fff" }}>
                              ${(price * qty).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>
                          Items Subtotal:
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#fff" }}>
                          ${(
                            Number(selectedOrder.subtotal) ||
                            (selectedOrder.items || []).reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || it.qty || 1), 0)
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>
                          Delivery Charge:
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: Number(selectedOrder.delivery_charge) <= 0 ? "#34d399" : "#fff" }}>
                          {Number(selectedOrder.delivery_charge) <= 0 ? "FREE ($0.00)" : `$${Number(selectedOrder.delivery_charge).toFixed(2)}`}
                        </td>
                      </tr>
                      <tr style={{ background: "#1e293b" }}>
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 800, fontSize: "14px" }}>
                          Grand Total Payable:
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 800, color: "#34d399", fontSize: "17px" }}>
                          ${Number(selectedOrder.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleSaveStatus}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Update Delivery Status</label>
                    <select
                      className="adm-select"
                      value={newDeliveryStatus}
                      onChange={(e) => setNewDeliveryStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="picked">Picked</option>
                      <option value="on_delivery">On The Way</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Update Payment Status</label>
                    <select
                      className="adm-select"
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="adm-label">Order Notes / Bill of Lading / Airway Bill</label>
                    <textarea
                      className="adm-textarea"
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="adm-modal-footer">
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                    {saving ? "Saving Changes..." : "Update Order Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Official Voucher Printable Modal */}
      {voucherOrder && (
        <OrderVoucher
          order={voucherOrder}
          settings={siteSettings}
          onClose={() => setVoucherOrder(null)}
        />
      )}
    </div>
  );
}
