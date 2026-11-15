import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";

export default function PromotionPage({ onOpenModal }) {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    fetchProducts({ promo: "1" }).then(setPromos);
  }, []);

  return (
    <main className="container">
      <section className="page-section">
        <div className="hero-carousel">
          <div className="hero-slide" style={{ backgroundImage: "url(./images/banner-3.jpg)", minHeight: "240px" }}>
            <div className="hero-text">
              <span className="hero-tag">Limited-Time Wholesale Offer</span>
              <h1>Factory Direct Promotions: Save 10% – 12% on Hot Sellers</h1>
              <p>Special tiered FOB pricing on Patent Gear Toners, HP Monochrome Cartridges, Bulk Inkjet Packs &amp; 80mm Thermal POS Printers.</p>
              <button type="button" className="btn btn-orange" onClick={() => onOpenModal("rfq", "Bulk Promotion Quote")}>
                Request Wholesale Price List
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section card">
        <div className="section-header">
          <h2 className="section-title">Discounted Hot-Seller Products</h2>
          <Link to="/products" className="view-more-link">Browse Full Catalog &rarr;</Link>
        </div>
        <div className="product-grid">
          {promos.map((p) => (
            <ProductCard key={p.sku} product={p} showPromoBadge onOpenModal={onOpenModal} />
          ))}
        </div>
      </section>
    </main>
  );
}
