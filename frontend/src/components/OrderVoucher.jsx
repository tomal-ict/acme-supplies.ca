import React, { useRef } from "react";

export default function OrderVoucher({ order, settings = {}, onClose }) {
  const voucherRef = useRef(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const companyName = settings.site_name || "AMIDA OFFICE SUPPLIES LIMITED";
  const companyTagline = settings.site_tagline || "Price Quality Service";
  const companyAddress = settings.contact_address || "126 Main Street, Acme, AB T0M 0A0, Canada";
  const companyPhone = settings.contact_phone || "+1 604 316 8138";
  const companyEmail = settings.contact_email || "acme.info.swapan@gmail.com";
  const logoUrl = settings.logo_url || "./images/logo.png";

  const isPaid = (order.payment_status || "unpaid").toLowerCase() === "paid";
  const deliveryAreaLabel =
    order.delivery_area === "outside_city"
      ? "Outside City Courier"
      : order.delivery_area === "inside_city"
      ? "Inside City Express"
      : order.delivery_area || "Standard Delivery";

  const deliveryCharge = Number(order.delivery_charge) || 0;
  const items = Array.isArray(order.items) ? order.items : [];

  const subtotal = order.subtotal
    ? Number(order.subtotal)
    : items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || it.quantity || 1), 0);

  const grandTotal = order.total_amount ? Number(order.total_amount) : subtotal + deliveryCharge;

  return (
    <div className="voucher-overlay" onClick={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className="voucher-modal">
        {/* Action Bar (Hidden in Print) */}
        <div className="voucher-actions no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🧾</span>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
              Official Purchase Order Voucher / Commercial Invoice
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-orange"
              onClick={handlePrint}
              style={{ padding: "8px 18px", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}
            >
              🖨️ Print Voucher
            </button>
            {onClose && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Printable Voucher Sheet */}
        <div className="voucher-sheet" ref={voucherRef}>
          {/* Header */}
          <div className="voucher-header">
            <div className="voucher-brand">
              <img src={logoUrl} alt={companyName} className="voucher-logo" onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <h1 className="voucher-company-name">{companyName}</h1>
                <div className="voucher-company-tagline">{companyTagline}</div>
                <div className="voucher-company-info">
                  {companyAddress} &bull; Hotline: {companyPhone} &bull; Email: {companyEmail}
                </div>
              </div>
            </div>

            <div className="voucher-meta">
              <div className="voucher-title">PURCHASE ORDER INVOICE</div>
              <div className="voucher-code">{order.order_code}</div>
              <div className="voucher-date">
                Date: {new Date(order.created_at || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          {/* Status Badges Row */}
          <div className="voucher-badges-row">
            <div className="voucher-badge-item">
              <span className="badge-label">Payment Method:</span>
              <strong className="badge-val">{order.payment_method || "Cash on Delivery"}</strong>
            </div>
            <div className="voucher-badge-item">
              <span className="badge-label">Payment Status:</span>
              <span className={`status-pill ${isPaid ? "paid" : "unpaid"}`}>
                {isPaid ? "✓ PAID" : "⚠ UNPAID"}
              </span>
            </div>
            <div className="voucher-badge-item">
              <span className="badge-label">Delivery Status:</span>
              <span className="status-pill delivery">
                {(order.delivery_status || "Pending").toUpperCase()}
              </span>
            </div>
            <div className="voucher-badge-item">
              <span className="badge-label">Delivery Area:</span>
              <strong className="badge-val">{deliveryAreaLabel}</strong>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="voucher-party-grid">
            <div className="voucher-party-box">
              <div className="party-box-title">BILL TO / CUSTOMER INFORMATION</div>
              <div className="party-name">{order.customer_name || "Valued Customer"}</div>
              <div className="party-detail"><strong>Phone / WhatsApp:</strong> {order.customer_phone || "N/A"}</div>
              <div className="party-detail"><strong>Email:</strong> {order.customer_email || "N/A"}</div>
            </div>

            <div className="voucher-party-box">
              <div className="party-box-title">SHIPPING &amp; DELIVERY DESTINATION</div>
              <div className="party-address">{order.shipping_address || "Standard Ex-Works / Warehouse Dispatch"}</div>
              {order.notes && (
                <div className="party-notes">
                  <strong>Special Instructions:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="voucher-table-wrap">
            <table className="voucher-table">
              <thead>
                <tr>
                  <th style={{ width: "35px", textAlign: "center" }}>#</th>
                  <th style={{ width: "90px" }}>SKU</th>
                  <th>Product Specification &amp; Description</th>
                  <th style={{ width: "95px", textAlign: "center" }}>Qty (Pcs)</th>
                  <th style={{ width: "105px", textAlign: "right" }}>Unit Price</th>
                  <th style={{ width: "115px", textAlign: "right" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((it, idx) => {
                    const q = Number(it.quantity || it.qty || 1);
                    const p = Number(it.price || 0);
                    const lineTotal = p * q;
                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: "#0369a1" }}>{it.sku || "N/A"}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{it.title}</div>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>{q} pcs</td>
                        <td style={{ textAlign: "right" }}>${p.toFixed(2)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          ${lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "16px", color: "#94a3b8" }}>
                      No item breakdown found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="voucher-calculation">
            <div className="voucher-calc-left">
              <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>
                <strong>Terms &amp; Important Notice:</strong><br />
                • Please inspect all factory-sealed cartons upon physical receipt.<br />
                • Warranty replacement claims require preservation of this purchase voucher.<br />
                • For support or shipment tracking, reference voucher code: <strong>{order.order_code}</strong>.
              </div>
            </div>

            <div className="voucher-calc-right">
              <div className="calc-row">
                <span>Items Subtotal:</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className="calc-row">
                <span>Delivery Charge ({deliveryAreaLabel}):</span>
                <span>
                  {deliveryCharge <= 0 ? (
                    <strong style={{ color: "#16a34a" }}>FREE SHIPPING ($0.00)</strong>
                  ) : (
                    <strong>${deliveryCharge.toFixed(2)}</strong>
                  )}
                </span>
              </div>
              <div className="calc-row grand-total">
                <span>Grand Total:</span>
                <span className="total-amount">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="voucher-signatures">
            <div className="sign-box">
              <div className="sign-line"></div>
              <div className="sign-label">Customer Signature &amp; Acceptance</div>
            </div>
            <div className="sign-box">
              <div className="sign-line"></div>
              <div className="sign-label">Authorized Executive Signature &amp; Seal</div>
            </div>
          </div>

          <div className="voucher-footer">
            <div>{companyName} &bull; International Office Equipment &amp; High-Reliability Supplies</div>
            <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
              Computer generated purchase order voucher. No alteration permitted without authorized corporate endorsement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
