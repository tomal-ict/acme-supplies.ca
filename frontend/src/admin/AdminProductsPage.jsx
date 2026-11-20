import { useEffect, useState, useRef } from "react";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminGetProducts,
  adminToggleTopPick,
  adminUpdateProduct,
  adminUploadProductImage,
} from "../adminApi";
import ImageCropperModal from "../components/ImageCropperModal";

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
  const defaultTiers = [
    { min_qty: 20, max_qty: 99, price: 3.50 },
    { min_qty: 100, max_qty: 499, price: 2.80 },
    { min_qty: 500, max_qty: 99999, price: 2.20 },
    { min_qty: 100000, max_qty: null, price: 1.80 },
  ];

  const defaultSpecs = [
    { key: "Brand Name", value: "Amida® / OEM" },
    { key: "Cartridge / Status", value: "Full (Brand New Grade-A Components)" },
    { key: "Feature", value: "Compatible with Patented Gear • 100% Testing Before Delivery" },
    { key: "Page Yield", value: "Standard OEM Equivalent Page Yield" },
    { key: "Smart Chip", value: "Pre-installed Auto-Reset Smart Microchip" },
    { key: "Certification", value: "ISO 9001 / ISO 14001 / CE / STMC / RoHS" },
    { key: "Warranty", value: "18 Months (100% Satisfaction Guaranteed)" },
    { key: "Place of Origin", value: "Guangdong, China" },
  ];

  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    category: "Monochrome Cartridges",
    sub_category: "for HP",
    price_mode: "single", // 'single' | 'tiered'
    single_price: 3.50,
    tiered_prices: defaultTiers,
    price_min: 1.80,
    price_max: 3.50,
    moq: "20 Pieces",
    sold: "1,000+ sold",
    image: "./images/products/P001.png",
    gallery_images: [],
    compatible_printers: "",
    description: "",
    specifications: defaultSpecs,
    promo_discount: 0,
    is_top_pick: false,
  });

  // Image Upload, Cropping & Optimization States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropImageSource, setCropImageSource] = useState(null);
  const [cropTargetType, setCropTargetType] = useState("primary"); // 'primary' | 'gallery_new' | 'gallery_edit'
  const [cropGalleryIndex, setCropGalleryIndex] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const primaryFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  const handlePrimaryFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropImageSource(file);
    setCropTargetType("primary");
    setCropGalleryIndex(null);
    setCropperOpen(true);
    e.target.value = "";
  };

  const handleGalleryFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setCropImageSource(files[0]);
    setCropTargetType("gallery_new");
    setCropGalleryIndex(null);
    setCropperOpen(true);
    e.target.value = "";
  };

  const handleReCropImage = (targetType, imgUrl, index = null) => {
    setCropImageSource(imgUrl);
    setCropTargetType(targetType);
    setCropGalleryIndex(index);
    setCropperOpen(true);
  };

  const handleCropComplete = async ({ blob, base64 }) => {
    setUploadingImage(true);
    try {
      const res = await adminUploadProductImage(blob);
      const finalUrl = res && res.success ? res.url : base64;

      if (cropTargetType === "primary") {
        setFormData((prev) => ({ ...prev, image: finalUrl }));
        onToast("Primary product image uploaded and optimized successfully!", "success");
      } else if (cropTargetType === "gallery_new") {
        setFormData((prev) => ({
          ...prev,
          gallery_images: [...(prev.gallery_images || []), finalUrl],
        }));
        onToast("Gallery image cropped and added successfully!", "success");
      } else if (cropTargetType === "gallery_edit" && cropGalleryIndex !== null) {
        setFormData((prev) => {
          const updated = [...(prev.gallery_images || [])];
          updated[cropGalleryIndex] = finalUrl;
          return { ...prev, gallery_images: updated };
        });
        onToast("Gallery image re-cropped and updated successfully!", "success");
      }
      setCropperOpen(false);
      setCropImageSource(null);
    } catch (err) {
      console.warn("Upload API error, using optimized base64 as fallback:", err);
      const finalUrl = base64;
      if (cropTargetType === "primary") {
        setFormData((prev) => ({ ...prev, image: finalUrl }));
      } else if (cropTargetType === "gallery_new") {
        setFormData((prev) => ({
          ...prev,
          gallery_images: [...(prev.gallery_images || []), finalUrl],
        }));
      } else if (cropTargetType === "gallery_edit" && cropGalleryIndex !== null) {
        setFormData((prev) => {
          const updated = [...(prev.gallery_images || [])];
          updated[cropGalleryIndex] = finalUrl;
          return { ...prev, gallery_images: updated };
        });
      }
      onToast("Image cropped and applied!", "success");
      setCropperOpen(false);
      setCropImageSource(null);
    } finally {
      setUploadingImage(false);
    }
  };

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
      price_mode: "single",
      single_price: 3.50,
      tiered_prices: [...defaultTiers],
      price_min: 1.80,
      price_max: 3.50,
      moq: "20 Pieces",
      sold: "100+ sold",
      image: "./images/products/P001.png",
      gallery_images: [],
      compatible_printers: "",
      description: "",
      specifications: [...defaultSpecs],
      promo_discount: 0,
      is_top_pick: false,
    });
    setModalMode("create");
  };

  const handleOpenEdit = (p) => {
    setCurrentProduct(p);
    const hasTiers = Array.isArray(p.tiered_prices) && p.tiered_prices.length > 0;
    const initialTiers = hasTiers
      ? p.tiered_prices
      : [
          { min_qty: 20, max_qty: 99, price: Number(p.price_max) || 3.5 },
          { min_qty: 100, max_qty: 499, price: Number((p.price_max - (p.price_max - p.price_min) * 0.25).toFixed(2)) || 2.8 },
          { min_qty: 500, max_qty: 99999, price: Number((p.price_max - (p.price_max - p.price_min) * 0.55).toFixed(2)) || 2.2 },
          { min_qty: 100000, max_qty: null, price: Number(p.price_min) || 1.8 },
        ];

    const initialSpecs = Array.isArray(p.specifications) && p.specifications.length > 0
      ? p.specifications
      : [
          { key: "Brand Name", value: "Amida® / OEM" },
          { key: "Cartridge / Status", value: "Full (Brand New Grade-A Components)" },
          { key: "Compatible Printers", value: p.compatible_printers || "Universal Compatible" },
          { key: "Feature", value: "Compatible with Patented Gear • 100% Testing Before Delivery" },
          { key: "Page Yield", value: "Standard OEM Equivalent Page Yield" },
          { key: "Smart Chip", value: "Pre-installed Auto-Reset Smart Microchip" },
          { key: "Certification", value: "ISO 9001 / ISO 14001 / CE / STMC / RoHS" },
          { key: "Warranty", value: "18 Months (100% Satisfaction Guaranteed)" },
          { key: "Place of Origin", value: "Guangdong, China" },
        ];

    setFormData({
      title: p.title || "",
      sku: p.sku || "",
      category: p.category || categories[0]?.name || "Monochrome Cartridges",
      sub_category: p.sub_category || "",
      price_mode: p.price_mode || (hasTiers ? "tiered" : "single"),
      single_price: p.single_price ? Number(p.single_price) : (Number(p.price_max) || Number(p.price_min) || 0),
      tiered_prices: initialTiers,
      price_min: Number(p.price_min) || 0,
      price_max: Number(p.price_max) || 0,
      moq: p.moq || "20 Pieces",
      sold: p.sold || "100+ sold",
      image: p.image || "./images/products/P001.png",
      gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
      compatible_printers: p.compatible_printers || "",
      description: p.description || "",
      specifications: initialSpecs,
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
      const payload = { ...formData };
      if (payload.price_mode === "single") {
        const sp = parseFloat(payload.single_price) || 0;
        payload.single_price = sp;
        payload.price_min = sp;
        payload.price_max = sp;
        payload.tiered_prices = [];
      } else {
        const cleanTiers = (payload.tiered_prices || [])
          .filter((t) => t.price !== undefined && t.price !== "")
          .map((t) => ({
            min_qty: parseInt(t.min_qty, 10) || 1,
            max_qty: t.max_qty ? parseInt(t.max_qty, 10) : null,
            price: parseFloat(t.price) || 0,
          }));
        payload.tiered_prices = cleanTiers;
        if (cleanTiers.length > 0) {
          const prices = cleanTiers.map((t) => t.price);
          payload.price_min = Math.min(...prices);
          payload.price_max = Math.max(...prices);
          payload.single_price = payload.price_max;
        }
      }

      payload.gallery_images = (payload.gallery_images || []).filter((img) => img && typeof img === "string" && img.trim().length > 0);
      payload.specifications = (payload.specifications || []).filter((s) => s.key && s.key.trim().length > 0);

      if (modalMode === "create") {
        const res = await adminCreateProduct(payload);
        if (res.success) {
          onToast("Product created successfully!", "success");
          setModalMode(null);
          loadProducts();
        }
      } else if (modalMode === "edit") {
        const res = await adminUpdateProduct(currentProduct.id, payload);
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
                      {p.price_mode === "single" || Number(p.price_min) === Number(p.price_max) ? (
                        <span>${Number(p.single_price || p.price_min).toFixed(2)} <span style={{ fontSize: "11px", color: "var(--adm-text-subtle)", fontWeight: 400 }}>(Single)</span></span>
                      ) : (
                        <span>${Number(p.price_min).toFixed(2)} - ${Number(p.price_max).toFixed(2)} <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 400 }}>(Tiered)</span></span>
                      )}
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
          <div className="adm-modal" style={{ maxWidth: "860px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h2 className="adm-modal-title">
                  {modalMode === "create" ? "Add New Product" : `Edit Product (${formData.sku})`}
                </h2>
                <div style={{ fontSize: "12px", color: "var(--adm-text-muted)", marginTop: "2px" }}>
                  Set titles, single or tiered rates, multiple gallery pictures, description, and specifications.
                </div>
              </div>
              <button type="button" className="adm-modal-close" onClick={() => setModalMode(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
                
                {/* Section 1: Basic Information */}
                <div style={{ background: "#0f172a", border: "1px solid var(--adm-border)", borderRadius: "8px", padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--adm-accent-cyan)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📦 1. Basic Information</span>
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="adm-form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="adm-label">Product Title *</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Amida Patent Gear Toner Cartridge TN770 Compatible for Brother"
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
                        placeholder="Leave blank to auto-generate SKU"
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
                        placeholder="e.g. 20 Pieces, 100 Pieces"
                        value={formData.moq}
                        onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Sold Counter Text</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="e.g. 1,000+ sold"
                        value={formData.sold}
                        onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
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
                </div>

                {/* Section 2: Pricing Setup (Single Rate vs Multiple / Tiered Rates) */}
                <div style={{ background: "#0f172a", border: "1px solid var(--adm-border)", borderRadius: "8px", padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--adm-accent-cyan)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>💰 2. Price Rates Setup (Single Rate vs. Tiered Wholesale Pricing)</span>
                  </h3>
                  
                  {/* Mode Selector */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "16px", padding: "10px", background: "#1e293b", borderRadius: "6px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: formData.price_mode === "single" ? "#38bdf8" : "#94a3b8", fontWeight: 600, fontSize: "13.5px" }}>
                      <input
                        type="radio"
                        name="price_mode"
                        value="single"
                        checked={formData.price_mode === "single"}
                        onChange={() => setFormData({ ...formData, price_mode: "single" })}
                      />
                      <span>🔘 Single Rate (Fixed Wholesale Price)</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: formData.price_mode === "tiered" ? "#38bdf8" : "#94a3b8", fontWeight: 600, fontSize: "13.5px" }}>
                      <input
                        type="radio"
                        name="price_mode"
                        value="tiered"
                        checked={formData.price_mode === "tiered"}
                        onChange={() => setFormData({ ...formData, price_mode: "tiered" })}
                      />
                      <span>📊 Tiered / Volume Rates (Quantity Discount Brackets)</span>
                    </label>
                  </div>

                  {formData.price_mode === "single" ? (
                    /* Single Rate Input */
                    <div style={{ background: "#1e293b", padding: "14px", borderRadius: "6px", border: "1px solid #334155" }}>
                      <div className="adm-form-group" style={{ maxWidth: "320px", margin: 0 }}>
                        <label className="adm-label">Single Unit FOB Price ($) *</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "var(--adm-accent-cyan)", fontWeight: 700 }}>$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="adm-input"
                            value={formData.single_price}
                            onChange={(e) => setFormData({ ...formData, single_price: parseFloat(e.target.value) || 0 })}
                            placeholder="e.g. 4.50"
                            required
                          />
                        </div>
                        <small style={{ color: "var(--adm-text-subtle)", fontSize: "11.5px", marginTop: "4px", display: "block" }}>
                          The product will sell at this fixed unit rate regardless of order quantity.
                        </small>
                      </div>
                    </div>
                  ) : (
                    /* Multiple / Tiered Rates Table */
                    <div style={{ background: "#1e293b", padding: "14px", borderRadius: "6px", border: "1px solid #334155" }}>
                      <div style={{ display: "flex", borderBottom: "1px solid #334155", paddingBottom: "10px", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                            Quantity Tiered Pricing List
                          </div>
                          <div style={{ fontSize: "11.5px", color: "var(--adm-text-subtle)" }}>
                            Define wholesale volume discount brackets (e.g. 20-99 pcs: $3.50, 100-499 pcs: $2.80)
                          </div>
                        </div>
                        <button
                          type="button"
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          onClick={() => {
                            const lastTier = formData.tiered_prices[formData.tiered_prices.length - 1];
                            const nextMin = lastTier && lastTier.max_qty ? lastTier.max_qty + 1 : 100;
                            setFormData({
                              ...formData,
                              tiered_prices: [
                                ...(formData.tiered_prices || []),
                                { min_qty: nextMin, max_qty: nextMin + 499, price: 2.50 },
                              ],
                            });
                          }}
                        >
                          + Add Rate Tier
                        </button>
                      </div>

                      <div className="adm-table-container">
                        <table className="adm-table" style={{ fontSize: "12.5px" }}>
                          <thead>
                            <tr>
                              <th>Min Quantity (Pcs)</th>
                              <th>Max Quantity (Pcs)</th>
                              <th>Unit Price ($)</th>
                              <th style={{ textAlign: "right", width: "80px" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(formData.tiered_prices || []).map((tier, idx) => (
                              <tr key={idx}>
                                <td>
                                  <input
                                    type="number"
                                    min="1"
                                    className="adm-input"
                                    style={{ padding: "6px 8px", fontSize: "12px" }}
                                    value={tier.min_qty || ""}
                                    onChange={(e) => {
                                      const updated = [...formData.tiered_prices];
                                      updated[idx].min_qty = parseInt(e.target.value, 10) || 1;
                                      setFormData({ ...formData, tiered_prices: updated });
                                    }}
                                    placeholder="e.g. 20"
                                    required
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="1"
                                    className="adm-input"
                                    style={{ padding: "6px 8px", fontSize: "12px" }}
                                    value={tier.max_qty || ""}
                                    onChange={(e) => {
                                      const updated = [...formData.tiered_prices];
                                      updated[idx].max_qty = e.target.value ? parseInt(e.target.value, 10) : null;
                                      setFormData({ ...formData, tiered_prices: updated });
                                    }}
                                    placeholder="Leave blank for +"
                                  />
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ color: "#f87171", fontWeight: 700 }}>$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="adm-input"
                                      style={{ padding: "6px 8px", fontSize: "12px" }}
                                      value={tier.price || ""}
                                      onChange={(e) => {
                                        const updated = [...formData.tiered_prices];
                                        updated[idx].price = parseFloat(e.target.value) || 0;
                                        setFormData({ ...formData, tiered_prices: updated });
                                      }}
                                      placeholder="e.g. 3.50"
                                      required
                                    />
                                  </div>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-danger adm-btn-sm"
                                    style={{ padding: "4px 8px", fontSize: "11px" }}
                                    onClick={() => {
                                      const updated = formData.tiered_prices.filter((_, i) => i !== idx);
                                      setFormData({ ...formData, tiered_prices: updated });
                                    }}
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Tier Preview summary */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                        {(formData.tiered_prices || []).map((t, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#0f172a",
                              border: "1px solid #0284c7",
                              padding: "4px 10px",
                              borderRadius: "14px",
                              fontSize: "11.5px",
                              color: "#e2e8f0",
                            }}
                          >
                            <strong>{t.min_qty}{t.max_qty ? `–${t.max_qty}` : "+"} pcs:</strong>{" "}
                            <span style={{ color: "#38bdf8", fontWeight: 700 }}>${Number(t.price).toFixed(2)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Pictures & Gallery with Interactive Upload & Cropping */}
                <div style={{ background: "#0f172a", border: "1px solid var(--adm-border)", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--adm-accent-cyan)", margin: 0 }}>
                        🖼️ 3. Product Images &amp; Gallery Pictures
                      </h3>
                      <div style={{ fontSize: "11.5px", color: "var(--adm-text-subtle)", marginTop: "2px" }}>
                        Upload files directly or provide image paths. Built-in interactive cropper auto-normalizes images to 800×800px.
                      </div>
                    </div>
                  </div>

                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={primaryFileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePrimaryFileSelect}
                  />
                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleGalleryFileSelect}
                  />

                  {/* Primary Featured Image Card */}
                  <div
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    <label className="adm-label" style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>⭐ Primary Featured Image</span>
                      <span style={{ fontSize: "11px", color: "var(--adm-accent-cyan)", fontWeight: 400 }}>(Main Catalog &amp; Detail Thumbnail)</span>
                    </label>

                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginTop: "8px", flexWrap: "wrap" }}>
                      {/* Thumbnail Preview Box */}
                      <div
                        style={{
                          width: "90px",
                          height: "90px",
                          background: "#ffffff",
                          borderRadius: "8px",
                          border: "2px solid #38bdf8",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                          position: "relative",
                        }}
                      >
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Featured Preview"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <span style={{ fontSize: "28px" }}>📦</span>
                        )}
                      </div>

                      {/* Controls & Path Input */}
                      <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="adm-btn adm-btn-primary adm-btn-sm"
                            onClick={() => primaryFileInputRef.current?.click()}
                            style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                          >
                            <span>📁 Upload &amp; Crop Image</span>
                          </button>

                          {formData.image && (
                            <button
                              type="button"
                              className="adm-btn adm-btn-secondary adm-btn-sm"
                              onClick={() => handleReCropImage("primary", formData.image)}
                              style={{ display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              <span>✂️ Re-Crop Current</span>
                            </button>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="text"
                            className="adm-input"
                            style={{ fontSize: "12px", fontFamily: "monospace" }}
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="./images/products/P001.png"
                            required
                          />
                        </div>

                        <div style={{ fontSize: "11px", color: "#38bdf8" }}>
                          ✓ Any image format (JPG, PNG, WEBP) of any resolution will be auto-converted and optimized.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Gallery Images Section */}
                  <div
                    style={{
                      background: "#162032",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <label className="adm-label" style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", margin: 0 }}>
                          📸 Multiple Gallery Angles &amp; Views ({(formData.gallery_images || []).length})
                        </label>
                        <div style={{ fontSize: "11px", color: "var(--adm-text-subtle)", marginTop: "2px" }}>
                          Add packaging views, side angles, high-res internals, or OEM comparison photos.
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-primary adm-btn-sm"
                          onClick={() => galleryFileInputRef.current?.click()}
                          style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}
                        >
                          <span>📁 Upload Gallery Image(s)</span>
                        </button>
                        <button
                          type="button"
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              gallery_images: [...(formData.gallery_images || []), ""],
                            });
                          }}
                        >
                          + Add URL
                        </button>
                      </div>
                    </div>

                    {/* Drag & Drop Visual Zone */}
                    <div
                      onClick={() => galleryFileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = Array.from(e.dataTransfer.files || []);
                        if (files.length > 0) {
                          setCropImageSource(files[0]);
                          setCropTargetType("gallery_new");
                          setCropGalleryIndex(null);
                          setCropperOpen(true);
                        }
                      }}
                      style={{
                        border: "2px dashed #475569",
                        borderRadius: "8px",
                        padding: "14px",
                        textAlign: "center",
                        background: "rgba(15, 23, 42, 0.4)",
                        cursor: "pointer",
                        marginBottom: "14px",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <div style={{ fontSize: "22px", marginBottom: "4px" }}>📥</div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#cbd5e1" }}>
                        Click here or drag &amp; drop images to crop and add to gallery
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        Supports JPG, PNG, WEBP, GIF &bull; Any size or resolution accepted
                      </div>
                    </div>

                    {/* Gallery Cards Grid */}
                    {(formData.gallery_images || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: "16px", color: "var(--adm-text-subtle)", fontSize: "12px" }}>
                        No additional gallery pictures uploaded yet. Click <strong>📁 Upload Gallery Image(s)</strong> above.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
                        {(formData.gallery_images || []).map((imgUrl, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              background: "#0f172a",
                              border: "1px solid #334155",
                              borderRadius: "6px",
                              padding: "8px 10px",
                            }}
                          >
                            {/* Thumbnail Preview */}
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                background: "#ffffff",
                                borderRadius: "4px",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: "1px solid #475569",
                              }}
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={`Gallery ${idx + 1}`}
                                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                />
                              ) : (
                                <span style={{ fontSize: "16px", color: "#64748b" }}>?</span>
                              )}
                            </div>

                            {/* Details & Actions */}
                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#38bdf8" }}>
                                  Gallery View #{idx + 1}
                                </span>
                                <div style={{ display: "flex", gap: "4px" }}>
                                  {imgUrl && (
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn-secondary adm-btn-sm"
                                      style={{ padding: "2px 6px", fontSize: "10.5px" }}
                                      onClick={() => handleReCropImage("gallery_edit", imgUrl, idx)}
                                      title="Re-crop this gallery image"
                                    >
                                      ✂️ Crop
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="adm-btn adm-btn-danger adm-btn-sm"
                                    style={{ padding: "2px 6px", fontSize: "10.5px" }}
                                    onClick={() => {
                                      const updated = formData.gallery_images.filter((_, i) => i !== idx);
                                      setFormData({ ...formData, gallery_images: updated });
                                    }}
                                    title="Delete this image"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                className="adm-input"
                                style={{ fontSize: "11px", padding: "4px 8px" }}
                                value={imgUrl}
                                onChange={(e) => {
                                  const updated = [...formData.gallery_images];
                                  updated[idx] = e.target.value;
                                  setFormData({ ...formData, gallery_images: updated });
                                }}
                                placeholder="Image path or URL..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Description & Specifications */}
                <div style={{ background: "#0f172a", border: "1px solid var(--adm-border)", borderRadius: "8px", padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--adm-accent-cyan)", marginBottom: "12px" }}>
                    📝 4. Description, Compatibility &amp; Specifications
                  </h3>

                  <div className="adm-form-group" style={{ marginBottom: "14px" }}>
                    <label className="adm-label">Compatible Printer Models</label>
                    <textarea
                      className="adm-textarea"
                      rows={3}
                      value={formData.compatible_printers}
                      onChange={(e) => setFormData({ ...formData, compatible_printers: e.target.value })}
                      placeholder="e.g. HP LaserJet Pro M102a, M102w, LaserJet Pro MFP M130a, M130fn, Canon LBP 6000, 6030..."
                    />
                    <small style={{ color: "var(--adm-text-subtle)", fontSize: "11.5px" }}>
                      Separate models with commas. These appear in the green verified compatibility badge on the product page.
                    </small>
                  </div>

                  <div className="adm-form-group" style={{ marginBottom: "14px" }}>
                    <label className="adm-label">Product Full Description</label>
                    <textarea
                      className="adm-textarea"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter detailed wholesale description, chip status, toner quality, page yields, packaging..."
                    />
                  </div>

                  {/* Specifications Key/Value Pairs */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label className="adm-label" style={{ margin: 0 }}>Key Specifications:</label>
                      <button
                        type="button"
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            specifications: [...(formData.specifications || []), { key: "", value: "" }],
                          });
                        }}
                      >
                        + Add Attribute
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(formData.specifications || []).map((spec, idx) => (
                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: "8px", alignItems: "center" }}>
                          <input
                            type="text"
                            className="adm-input"
                            style={{ padding: "6px 8px", fontSize: "12px" }}
                            value={spec.key}
                            onChange={(e) => {
                              const updated = [...formData.specifications];
                              updated[idx].key = e.target.value;
                              setFormData({ ...formData, specifications: updated });
                            }}
                            placeholder="e.g. Page Yield"
                          />
                          <input
                            type="text"
                            className="adm-input"
                            style={{ padding: "6px 8px", fontSize: "12px" }}
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...formData.specifications];
                              updated[idx].value = e.target.value;
                              setFormData({ ...formData, specifications: updated });
                            }}
                            placeholder="e.g. 2,000 Standard Pages (5% Coverage)"
                          />
                          <button
                            type="button"
                            className="adm-btn adm-btn-danger adm-btn-sm"
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            onClick={() => {
                              const updated = formData.specifications.filter((_, i) => i !== idx);
                              setFormData({ ...formData, specifications: updated });
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              <div className="adm-modal-footer" style={{ borderTop: "1px solid var(--adm-border)", padding: "14px 20px" }}>
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

      {/* Modal: Interactive Image Cropper & Resizer */}
      {cropperOpen && cropImageSource && (
        <ImageCropperModal
          imageSrc={cropImageSource}
          title={
            cropTargetType === "primary"
              ? "Crop & Optimize Primary Featured Image"
              : cropTargetType === "gallery_edit"
              ? `Re-Crop Gallery View #${(cropGalleryIndex || 0) + 1}`
              : "Crop & Add to Gallery"
          }
          targetWidth={800}
          targetHeight={800}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropperOpen(false);
            setCropImageSource(null);
          }}
        />
      )}
    </div>
  );
}
