import { useEffect, useState } from "react";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetCategories,
  adminUpdateCategory,
} from "../adminApi";

export default function AdminCategoriesPage({ onToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminGetCategories();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreateParent = () => {
    setParentId(null);
    setName("");
    setSortOrder(categories.length + 1);
    setModalMode("create");
  };

  const handleOpenCreateSub = (parent) => {
    setParentId(parent.id);
    setName("");
    setSortOrder((parent.children?.length || 0) + 1);
    setModalMode("create");
  };

  const handleOpenEdit = (cat) => {
    setCurrentCategory(cat);
    setName(cat.name);
    setSortOrder(cat.sort_order || 0);
    setModalMode("edit");
  };

  const handleOpenDelete = (cat) => {
    setCurrentCategory(cat);
    setModalMode("delete");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        const res = await adminCreateCategory({
          name,
          parent_id: parentId,
          sort_order: sortOrder,
        });
        if (res.success) {
          onToast("Category created successfully!", "success");
          setModalMode(null);
          loadCategories();
        }
      } else if (modalMode === "edit") {
        const res = await adminUpdateCategory(currentCategory.id, {
          name,
          sort_order: sortOrder,
        });
        if (res.success) {
          onToast("Category updated successfully!", "success");
          setModalMode(null);
          loadCategories();
        }
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await adminDeleteCategory(currentCategory.id);
      if (res.success) {
        onToast("Category removed successfully!", "success");
        setModalMode(null);
        loadCategories();
      }
    } catch (err) {
      onToast(err.message, "error");
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>Product Category Classification</h1>
          <p>Configure hierarchical catalog branches and compatibility brand sub-categories.</p>
        </div>
        <div>
          <button type="button" className="adm-btn adm-btn-primary" onClick={handleOpenCreateParent}>
            + Add Main Category
          </button>
        </div>
      </div>

      <div className="adm-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--adm-text-muted)" }}>
            Loading category tree...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  background: "#0f172a",
                  border: "1px solid var(--adm-border)",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>📁</span>
                    <strong style={{ fontSize: "15px", color: "#fff" }}>{cat.name}</strong>
                    <span className="adm-badge adm-badge-blue">Slug: {cat.slug}</span>
                    <span className="adm-badge adm-badge-gray">Sort: {cat.sort_order}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn-primary adm-btn-sm"
                      onClick={() => handleOpenCreateSub(cat)}
                    >
                      + Sub-Category
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-outline adm-btn-sm"
                      onClick={() => handleOpenEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      onClick={() => handleOpenDelete(cat)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Sub-categories */}
                {cat.children && cat.children.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingLeft: "24px",
                      borderLeft: "2px solid #334155",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {cat.children.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12.5px",
                        }}
                      >
                        <span style={{ color: "var(--adm-accent-cyan)" }}>↳ {sub.name}</span>
                        <div style={{ display: "inline-flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sub)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--adm-text-muted)",
                              cursor: "pointer",
                              fontSize: "11px",
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(sub)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#fb7185",
                              cursor: "pointer",
                              fontSize: "11px",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Category */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalMode(null)}>
          <div className="adm-modal" style={{ maxWidth: "480px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">
                {modalMode === "create"
                  ? parentId
                    ? "Add Sub-Category"
                    : "Add Main Category"
                  : `Edit Category (${currentCategory?.name})`}
              </h2>
              <button type="button" className="adm-modal-close" onClick={() => setModalMode(null)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="adm-form-group">
                <label className="adm-label">Category Name *</label>
                <input
                  type="text"
                  className="adm-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. for Canon, Bulk Ink, Color Cartridges"
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">Sort Priority Order</label>
                <input
                  type="number"
                  className="adm-input"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                />
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete */}
      {modalMode === "delete" && currentCategory && (
        <div className="adm-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalMode(null)}>
          <div className="adm-modal" style={{ maxWidth: "440px" }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title" style={{ color: "#fb7185" }}>
                Delete Category
              </h2>
              <button type="button" className="adm-modal-close" onClick={() => setModalMode(null)}>
                &times;
              </button>
            </div>

            <p style={{ color: "var(--adm-text-main)", fontSize: "14px", lineHeight: 1.5 }}>
              Are you sure you want to delete category <strong>{currentCategory.name}</strong>? Any
              nested sub-categories will also be removed.
            </p>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                onClick={() => setModalMode(null)}
              >
                Cancel
              </button>
              <button type="button" className="adm-btn adm-btn-danger" onClick={handleDelete}>
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
