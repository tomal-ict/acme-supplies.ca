import { useEffect, useState } from "react";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminGetProducts,
  adminToggleTopPick,
  adminUpdateProduct,
} from "../adminApi";

export default function AdminProductsPage({ onToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    category: "Monochrome Cartridges",
    sub_category: "for HP",
    price_min: 1.0,
    price_max: 3.5,
    moq: "20 Pieces",
    sold: "1,000+ sold",
    image: "./images/products/P001.png",
    promo_discount: 0,
    is_top_pick: false,
  });

  const loadCategories = async () => {
    try {
      const res = await adminGetCategories();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { page, sort };
      if (search) params.q = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await adminGetProducts(params);
      if (res.success) {
        setProducts(res.products);
        setPagination(res.pagination);
      }
    } catch (err) {
      onToast("Failed to load products: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, categoryFilter, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      sku: "",
      category: categories[0]?.name || "Monochrome Cartridges",
      sub_category: "for HP",
      price_min: 1.0,
      price_max: 3.5,
      moq: "20 Pieces",
      sold: "100+ sold",
      image: "./images/products/P005.jpg",
      promo_discount: 0,
      is_top_pick: false,
    });
    setModalMode("create");
  };

  const handleOpenEdit = (p) => {
    setCurrentProduct(p);
    setFormData({
      title: p.title,
      sku: p.sku,
      category: p.category,
      sub_category: p.sub_category || "",
      price_min: p.price_min,
      price_max: p.price_max,
      moq: p.moq,
      sold: p.sold,
      image: p.image,
      promo_discount: p.promo_discount || 0,
      is_top_pick: Boolean(p.is_top_pick),
    });
    setModalMode("edit");
  };

  const handleOpenDelete = (p) => {
    setCurrentProduct(p);
    setModalMode("delete");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        const res = await adminCreateProduct(formData);
        if (res.success) {
          onToast("Product created successfully!", "success");
          setModalMode(null);
          loadProducts();
        }
      } else if (modalMode === "edit") {
        const res = await adminUpdateProduct(currentProduct.id, formData);
        if (res.success) {
          onToast("Product updated successfully!", "success");
          setModalMode(null);
          loadProducts();
        }
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await adminDeleteProduct(currentProduct.id);
      if (res.success) {
        onToast("Product deleted successfully!", "success");
        setModalMode(null);
        loadProducts();
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleToggleTopPick = async (p) => {
    try {
      const res = await adminToggleTopPick(p.id);
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, is_top_pick: res.is_top_pick } : item))
        );
        onToast(res.message, "success");
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>Product Catalog Management</h1>
          <p>
            Manage wholesale inventory, FOB price tiers, categories, and storefront visibility.
          </p>
        </div>
        <div>
          <button type="button" className="adm-btn adm-btn-primary" onClick={handleOpenCreate}>
            + Add New Product
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="adm-card" style={{ padding: "16px", marginBottom: "18px" }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label className="adm-label">Search SKU or Title</label>
            <input
              type="text"
              className="adm-input"
              placeholder="e.g. 85A, TN770, Ink..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="adm-label">Filter Category</label>
            <select
              className="adm-select"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="adm-label">Sort Order</label>
            <select
              className="adm-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular (Sold)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="sku">SKU Alphabetical</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button type="submit" className="adm-btn adm-btn-primary" style={{ flex: 1 }}>
              Search
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={() => {
                setSearch("");
                setCategoryFilter("");
                setSort("newest");
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Product Table */}
      <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: "65px" }}>Image</th>
                <th style={{ width: "85px" }}>SKU</th>
                <th>Product Title</th>
                <th>Category</th>
                <th>Sub-Category</th>
                <th>FOB Price</th>
                <th>MOQ</th>
                <th>Discount</th>
                <th style={{ textAlign: "center" }}>Top Pick</th>
                <th style={{ textAlign: "right", minWidth: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.image}
                        alt={p.sku}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "contain",
                          background: "#fff",
                          borderRadius: "4px",
                          padding: "2px",
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: "var(--adm-accent-cyan)" }}>{p.sku}</strong>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          maxWidth: "280px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={p.title}
                      >
                        {p.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adm-text-subtle)" }}>
                        {p.sold}
                      </div>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-blue">{p.category}</span>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-gray">{p.sub_category || "Standard"}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: "#f87171" }}>
                      ${Number(p.price_min).toFixed(2)} - ${Number(p.price_max).toFixed(2)}
                    </td>
                    <td>{p.moq}</td>
                    <td>
                      {p.promo_discount > 0 ? (
                        <span className="adm-badge adm-badge-rose">-{p.promo_discount}%</span>
                      ) : (
                        <span style={{ color: "var(--adm-text-subtle)", fontSize: "12px" }}>-</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleTopPick(p)}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "18px",
                          cursor: "pointer",
                          color: p.is_top_pick ? "#fbbf24" : "#475569",
                        }}
                        title={p.is_top_pick ? "Top Pick active. Click to remove." : "Click to set as Top Pick"}
                      >
                        {p.is_top_pick ? "★" : "☆"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-outline adm-btn-sm"
                          onClick={() => handleOpenEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-danger adm-btn-sm"
                          onClick={() => handleOpenDelete(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                    No products matched your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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
              Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total products)
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
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(pagination.last_page, page + 2))
                .map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`adm-btn adm-btn-sm ${num === page ? "adm-btn-primary" : "adm-btn-secondary"}`}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}
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

      {/* Modal: Create or Edit Product */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalMode(null)}>
          <div className="adm-modal" style={{ maxWidth: "700px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">
                {modalMode === "create" ? "Add New Product" : `Edit Product (${formData.sku})`}
              </h2>
              <button type="button" className="adm-modal-close" onClick={() => setModalMode(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="adm-label">Product Title *</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">SKU (e.g. P075, TN770, 85A)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Leave blank to auto-generate"
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Category *</label>
                  <select
                    className="adm-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Sub-Category (Brand compatibility)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. for HP, for Brother, for Canon"
                    value={formData.sub_category}
                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">MOQ (Minimum Order Quantity)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. 20 Pieces, 500 Pieces"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">FOB Price Min ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="adm-input"
                    value={formData.price_min}
                    onChange={(e) => setFormData({ ...formData, price_min: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">FOB Price Max ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="adm-input"
                    value={formData.price_max}
                    onChange={(e) => setFormData({ ...formData, price_max: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Promo Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    className="adm-input"
                    value={formData.promo_discount}
                    onChange={(e) => setFormData({ ...formData, promo_discount: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Sold Counter Text</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. 4,500+ sold"
                    value={formData.sold}
                    onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
                  />
                </div>

                <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="adm-label">Product Image Path / URL</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      className="adm-input"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="./images/products/P001.png"
                      required
                    />
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          width: "42px",
                          height: "42px",
                          objectFit: "contain",
                          background: "#fff",
                          borderRadius: "4px",
                          padding: "2px",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff" }}>
                    <input
                      type="checkbox"
                      checked={formData.is_top_pick}
                      onChange={(e) => setFormData({ ...formData, is_top_pick: e.target.checked })}
                    />
                    <span>Highlight as <strong>Top Pick</strong> on website homepage and sidebar</span>
                  </label>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary"
                  onClick={() => setModalMode(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="adm-btn adm-btn-primary">
                  {modalMode === "create" ? "Save New Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {modalMode === "delete" && currentProduct && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalMode(null)}>
          <div className="adm-modal" style={{ maxWidth: "460px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title" style={{ color: "#fb7185" }}>
                Confirm Product Deletion
              </h2>
              <button type="button" className="adm-modal-close" onClick={() => setModalMode(null)}>
                &times;
              </button>
            </div>

            <p style={{ color: "var(--adm-text-main)", fontSize: "14px", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete product{" "}
              <strong>{currentProduct.sku}</strong> ({currentProduct.title})? This will immediately remove it from all storefront categories and search.
            </p>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setModalMode(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-danger"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
