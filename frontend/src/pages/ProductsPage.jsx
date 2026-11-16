import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { key: "All", label: "All Products" },
  {
    key: "Monochrome Cartridges",
    label: "Amida Compatible",
    children: ["for HP", "for Canon", "for Brother", "for Samsung", "for Epson"],
  },
  { key: "Patent Gear Products", label: "Amida Patent Product Toner" },
  { key: "Color Cartridges", label: "Amida Color Toner" },
  { key: "Inks & Inkjets", label: "Amida Ink Cartridge" },
  { key: "Bulk Inks", label: "Amida Bulk Ink" },
  { key: "Toner Powder", label: "Amida Toner Powder" },
  { key: "Printers", label: "Amida Printer (A4 Laser)" },
  { key: "Thermal Printers", label: "Amida Thermal Printer (POS)" },
  {
    key: "Thermal Paper Rolls",
    label: "Amida Thermal Paper Rolls",
    children: ["2-1/4 Inch", "3-1/8 Inch", "3 Inch"],
  },
];

export default function ProductsPage({ onOpenModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "All";
  const initialSub = searchParams.get("sub") || "";
  const initialQ = searchParams.get("q") || "";

  const [category, setCategory] = useState(initialCat);
  const [subCategory, setSubCategory] = useState(initialSub);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const perPage = 24;

  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
    setSubCategory(searchParams.get("sub") || "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const params = { sort };
    if (category !== "All") params.category = category;
    if (subCategory) params.sub = subCategory;
    if (initialQ) params.q = initialQ;
    fetchProducts(params).then(setProducts);
  }, [category, subCategory, sort, initialQ]);

  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const paged = products.slice((page - 1) * perPage, page * perPage);

  const selectCategory = (cat) => {
    setCategory(cat);
    setSubCategory("");
    setPage(1);
    setSearchParams(cat === "All" ? {} : { category: cat });
  };

  const selectSub = (sub) => {
    setCategory("All");
    setSubCategory(sub);
    setPage(1);
    setSearchParams({ sub });
  };

  return (
    <main className="container page-section">
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <button
            type="button"
            className="btn btn-orange cat-tree-btn"
            style={{ marginBottom: "14px", color: "#fff", background: "var(--accent-orange)", justifyContent: "center" }}
            onClick={() => selectCategory("TopPicks")}
          >
            &#9733; Top Picks
          </button>

          <h3 className="sidebar-heading">Product Categories</h3>
          <div>
            {CATEGORIES.map((c) => (
              <div key={c.key}>
                <button
                  type="button"
                  className={`cat-tree-btn ${category === c.key && !subCategory ? "active" : ""}`}
                  onClick={() => selectCategory(c.key)}
                >
                  <span>{c.label}</span>
                </button>
                {c.children && (
                  <div className="sidebar-sublist">
                    {c.children.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        className={`cat-tree-btn ${subCategory === sub ? "active" : ""}`}
                        onClick={() => selectSub(sub)}
                      >
                        <span>{sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <section>
          <div className="catalog-toolbar">
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 700 }}>All Products</h1>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Showing {paged.length} of {products.length} products ({subCategory || category}{initialQ ? ` • "${initialQ}"` : ""})
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="catalogSort" style={{ fontSize: "13px", fontWeight: 600 }}>Sort by:</label>
              <select
                id="catalogSort"
                className="form-control"
                style={{ width: "auto", padding: "6px 10px" }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {paged.length > 0 ? (
              paged.map((p) => <ProductCard key={p.sku} product={p} onOpenModal={onOpenModal} />)
            ) : (
              <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                No matching products found.
              </div>
            )}
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                className={`page-btn ${num === page ? "active" : ""}`}
                onClick={() => {
                  setPage(num);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
