import { Link } from "react-router-dom";

export default function ProductCard({ product, showPromoBadge = false, onOpenModal }) {
  return (
    <article className="product-card">
      <Link to={`/product/${product.sku}`} className="product-thumb">
        {showPromoBadge && product.promo_discount > 0 && (
          <span className="discount-badge">-{product.promo_discount}% OFF</span>
        )}
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-body">
        <div className="product-tags">
          {(product.tags || []).map((tag, idx) => (
            <span key={tag} className={`p-tag ${idx > 0 ? "p-tag-main" : ""}`}>
              {tag}
            </span>
          ))}
        </div>
        <Link to={`/product/${product.sku}`} className="product-title" title={product.title}>
          {product.title}
        </Link>
        {product.compatible_printers && (
          <div
            style={{
              fontSize: "11px",
              color: "#0284c7",
              margin: "3px 0 6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
            title={`Compatible Printers: ${product.compatible_printers}`}
          >
            🖨️ {product.compatible_printers}
          </div>
        )}
        <div className="product-price">
          ${Number(product.price_min).toFixed(2)} - ${Number(product.price_max).toFixed(2)}
        </div>
        <div className="product-meta">
          MOQ: {product.moq} &bull; {product.sold}
        </div>
        <div className="product-actions" style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className="btn btn-orange"
            style={{ flex: "1.2", padding: "6px 8px", fontSize: "11.5px", background: "var(--accent-orange)" }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("acme-add-to-cart", { detail: { product, quantity: 1 } }));
            }}
            title="Add to wholesale order cart"
          >
            🛒 + Cart
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: "1", padding: "6px 8px", fontSize: "11.5px" }}
            onClick={() => onOpenModal("chat", product.title)}
          >
            Chat
          </button>
          <button
            type="button"
            className="btn btn-outline-orange"
            style={{ padding: "6px 8px", fontSize: "11.5px" }}
            onClick={() => onOpenModal("rfq", product.title)}
            title="Request Quotation"
          >
            RFQ
          </button>
        </div>
      </div>
    </article>
  );
}
