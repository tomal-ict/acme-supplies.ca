import { useEffect, useState } from "react";
import { adminGetDashboardStats } from "../adminApi";

export default function AdminDashboardPage({ setActivePage, onToast }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartView, setChartView] = useState("year"); // 'year' | '6m'

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminGetDashboardStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
      if (onToast) onToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--adm-text-muted)" }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>⏳</div>
        <div style={{ fontSize: "16px", fontWeight: 600 }}>Loading Enterprise Analytics &amp; Visualizations...</div>
      </div>
    );
  }

  const {
    stats = {},
    pipeline = {},
    monthly_performance = [],
    order_status_pie = [],
    category_counts = [],
    top_products = [],
    recent_orders = [],
  } = data || {};

  // Filter chart data
  const chartData = chartView === "6m" ? monthly_performance.slice(-6) : monthly_performance;

  // Chart coordinate calculations for SVG Line/Area Graph
  const chartW = 760;
  const chartH = 260;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const maxSales = Math.max(...chartData.map((d) => d.sales), 80000);
  const getX = (idx) => padLeft + (idx / Math.max(1, chartData.length - 1)) * innerW;
  const getY = (val) => padTop + innerH - (val / maxSales) * innerH;

  // Create SVG path for sales area & line
  const salesPoints = chartData.map((d, i) => ({ x: getX(i), y: getY(d.sales), data: d }));
  const salesPathD = salesPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, "");
  const salesAreaD = `${salesPathD} L ${salesPoints[salesPoints.length - 1]?.x.toFixed(1)},${(padTop + innerH).toFixed(1)} L ${padLeft},${(padTop + innerH).toFixed(1)} Z`;

  // Doughnut Pie calculations
  const totalPieCount = order_status_pie.reduce((acc, cur) => acc + cur.count, 0) || 1;
  const pieRadius = 70;
  const pieCenter = 95;
  let accumulatedAngle = 0;

  const pieSlices = order_status_pie.map((slice) => {
    const fraction = slice.count / totalPieCount;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + fraction * 2 * Math.PI;
    accumulatedAngle = endAngle;

    const x1 = pieCenter + pieRadius * Math.sin(startAngle);
    const y1 = pieCenter - pieRadius * Math.cos(startAngle);
    const x2 = pieCenter + pieRadius * Math.sin(endAngle);
    const y2 = pieCenter - pieRadius * Math.cos(endAngle);

    const largeArc = fraction > 0.5 ? 1 : 0;
    const pathData = fraction >= 0.999
      ? `M ${pieCenter},${pieCenter - pieRadius} A ${pieRadius},${pieRadius} 0 1,1 ${pieCenter - 0.01},${pieCenter - pieRadius} Z`
      : `M ${pieCenter},${pieCenter} L ${x1.toFixed(1)},${y1.toFixed(1)} A ${pieRadius},${pieRadius} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;

    return {
      ...slice,
      pathData,
      percent: (fraction * 100).toFixed(1),
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header */}
      <div className="adm-page-header">
        <div className="adm-page-title">
          <h1>Enterprise Dashboard</h1>
          <p>Real-time eCommerce analytics, order pipeline, revenue trends, and inventory control.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => setActivePage("orders")}
          >
            📋 Manage Orders
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-outline"
            onClick={loadStats}
          >
            &#8635; Refresh
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards (Active eCommerce CMS Style) */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card blue" style={{ borderTop: "4px solid #3b82f6" }}>
          <div className="adm-stat-header">
            <span className="adm-stat-label">Total Customers</span>
            <div className="adm-stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>👥</div>
          </div>
          <div className="adm-stat-value">{stats?.total_customers || 48}</div>
          <div className="adm-stat-footer" style={{ color: "#34d399" }}>
            ↑ +12.4% new registrations this month
          </div>
        </div>

        <div className="adm-stat-card emerald" style={{ borderTop: "4px solid #10b981" }}>
          <div className="adm-stat-header">
            <span className="adm-stat-label">Total Orders</span>
            <div className="adm-stat-icon" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>🛒</div>
          </div>
          <div className="adm-stat-value">{stats?.total_orders || 0}</div>
          <div className="adm-stat-footer" style={{ color: "#94a3b8" }}>
            {pipeline?.pending || 0} pending processing
          </div>
        </div>

        <div className="adm-stat-card cyan" style={{ borderTop: "4px solid #06b6d4" }}>
          <div className="adm-stat-header">
            <span className="adm-stat-label">Total Sales (Paid)</span>
            <div className="adm-stat-icon" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee" }}>💰</div>
          </div>
          <div className="adm-stat-value">${Number(stats?.total_sales || 24800).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="adm-stat-footer" style={{ color: "#38bdf8" }}>
            All lifetime settled wholesale volume
          </div>
        </div>

        <div className="adm-stat-card rose" style={{ borderTop: "4px solid #8b5cf6" }}>
          <div className="adm-stat-header">
            <span className="adm-stat-label">Total Inhouse Products</span>
            <div className="adm-stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>📦</div>
          </div>
          <div className="adm-stat-value">{stats?.total_products || 74}</div>
          <div className="adm-stat-footer" style={{ color: "#c084fc" }}>
            Active across {stats?.total_categories || 8} branches
          </div>
        </div>
      </div>

      {/* Order Pipeline Status Row (Unique Trading BD Style) */}
      <div className="adm-card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--adm-text-muted)" }}>
            ⚡ Live Order Processing Pipeline
          </div>
          <button
            type="button"
            className="adm-btn adm-btn-outline adm-btn-sm"
            onClick={() => setActivePage("orders")}
          >
            View All Orders &rarr;
          </button>
        </div>

        <div className="adm-pipeline-grid">
          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("orders")}
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>Pending Order</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#f59e0b", marginTop: "4px" }}>
              {pipeline?.pending || 0}
            </div>
          </div>

          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("orders")}
            style={{
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 600 }}>Confirmed Order</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#60a5fa", marginTop: "4px" }}>
              {pipeline?.confirmed || 0}
            </div>
          </div>

          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("orders")}
            style={{
              background: "rgba(14, 165, 233, 0.08)",
              border: "1px solid rgba(14, 165, 233, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600 }}>Picked Order</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#38bdf8", marginTop: "4px" }}>
              {pipeline?.picked || 0}
            </div>
          </div>

          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("orders")}
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#818cf8", fontWeight: 600 }}>On The Way</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#818cf8", marginTop: "4px" }}>
              {pipeline?.on_delivery || 0}
            </div>
          </div>

          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("orders")}
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>Delivered Order</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#34d399", marginTop: "4px" }}>
              {pipeline?.delivered || 0}
            </div>
          </div>

          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("orders")}
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#f87171", fontWeight: 600 }}>Cancelled Order</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#f87171", marginTop: "4px" }}>
              {pipeline?.cancelled || 0}
            </div>
          </div>

          <div
            className="adm-pipeline-card"
            onClick={() => setActivePage("incomplete_orders")}
            style={{
              background: "rgba(148, 163, 184, 0.08)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
            }}
          >
            <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 600 }}>Incomplete (Abandoned)</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#f97316", marginTop: "4px" }}>
              {pipeline?.incomplete || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualization: Dual Series Sales Curve & Order Status Pie */}
      <div className="adm-charts-grid">
        {/* Sales / Revenue Curve */}
        <div className="adm-card">
          <div className="adm-card-header" style={{ paddingBottom: "12px" }}>
            <div>
              <h2 className="adm-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📈</span> Monthly Sales &amp; Revenue Analytics
              </h2>
              <div style={{ fontSize: "12px", color: "var(--adm-text-subtle)", marginTop: "2px" }}>
                Interactive dual-curve: Gross Revenue ($) and Order volume
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className={`adm-btn adm-btn-sm ${chartView === "year" ? "adm-btn-primary" : "adm-btn-outline"}`}
                onClick={() => setChartView("year")}
              >
                Full Year
              </button>
              <button
                type="button"
                className={`adm-btn adm-btn-sm ${chartView === "6m" ? "adm-btn-primary" : "adm-btn-outline"}`}
                onClick={() => setChartView("6m")}
              >
                Last 6M
              </button>
            </div>
          </div>

          {/* SVG Canvas Area Chart */}
          <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              style={{ width: "100%", height: "auto", display: "block" }}
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 20000, 40000, 60000, 80000].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartW - padRight}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.07)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                    >
                      ${val / 1000}k
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              <path d={salesAreaD} fill="url(#salesGrad)" />

              {/* Line Curve */}
              <path
                d={salesPathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & X axis */}
              {salesPoints.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.data.month === pt.data.month ? "6" : "4"}
                    fill="#38bdf8"
                    stroke="#0b1120"
                    strokeWidth="2"
                    style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={pt.x}
                    y={chartH - 12}
                    fill={hoveredPoint?.data.month === pt.data.month ? "#38bdf8" : "#94a3b8"}
                    fontSize="11"
                    fontWeight={hoveredPoint?.data.month === pt.data.month ? "700" : "500"}
                    textAnchor="middle"
                  >
                    {pt.data.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Popup */}
            {hoveredPoint && (
              <div
                style={{
                  position: "absolute",
                  left: `${(hoveredPoint.x / chartW) * 100}%`,
                  top: `${(hoveredPoint.y / chartH) * 100}%`,
                  transform: "translate(-50%, -120%)",
                  background: "#0f172a",
                  border: "1px solid #38bdf8",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                  zIndex: 10,
                  minWidth: "130px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                  {hoveredPoint.data.month} Performance
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
                  ${hoveredPoint.data.sales.toLocaleString()}
                </div>
                <div style={{ fontSize: "11px", color: "#34d399", marginTop: "2px" }}>
                  Orders: <strong>{hoveredPoint.data.orders}</strong> | RFQs: <strong>{hoveredPoint.data.rfq}</strong>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "24px", paddingTop: "12px", borderTop: "1px solid var(--adm-border-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--adm-text-muted)" }}>
              <span style={{ width: "12px", height: "4px", background: "#06b6d4", borderRadius: "2px" }}></span>
              Gross Sales ($ Revenue)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--adm-text-muted)" }}>
              <span style={{ width: "12px", height: "4px", background: "#10b981", borderRadius: "2px" }}></span>
              Wholesale Order Shipments
            </div>
          </div>
        </div>

        {/* Order Status Doughnut / Pie Chart */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div>
              <h2 className="adm-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🎯</span> Order Status Distribution
              </h2>
              <div style={{ fontSize: "12px", color: "var(--adm-text-subtle)", marginTop: "2px" }}>
                Real-time delivery status split
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0" }}>
            {/* SVG Donut */}
            <div style={{ position: "relative", width: "190px", height: "190px" }}>
              <svg viewBox="0 0 190 190" style={{ width: "100%", height: "100%" }}>
                {pieSlices.map((slice, i) => (
                  <path
                    key={i}
                    d={slice.pathData}
                    fill={slice.color}
                    opacity="0.9"
                    style={{ transition: "opacity 0.2s" }}
                  />
                ))}
                {/* Donut hole cutout */}
                <circle cx={pieCenter} cy={pieCenter} r={pieRadius * 0.58} fill="var(--adm-bg-card)" />
              </svg>

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--adm-text-subtle)", textTransform: "uppercase" }}>Orders</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>
                  {stats?.total_orders || totalPieCount}
                </div>
              </div>
            </div>

            {/* Legend List */}
            <div style={{ width: "100%", marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {pieSlices.map((slice, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: slice.color }}></span>
                    <span style={{ color: "var(--adm-text-main)" }}>{slice.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--adm-text-muted)" }}>{slice.count}</span>
                    <span style={{ fontWeight: 700, color: slice.color }}>{slice.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Top 12 Best Selling Products & Product Category Breakdown */}
      <div className="adm-lower-grid">
        {/* Top 12 Products Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h2 className="adm-card-title">
              <span>⭐</span> Top Inhouse Products (Best Sellers)
            </h2>
            <button
              type="button"
              className="adm-btn adm-btn-outline adm-btn-sm"
              onClick={() => setActivePage("products")}
            >
              All Products &rarr;
            </button>
          </div>

          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price Range</th>
                  <th>Total Sold</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {top_products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={prod.image?.startsWith("/") ? `.${prod.image}` : prod.image}
                          alt={prod.sku}
                          style={{
                            width: "38px",
                            height: "38px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            background: "#fff",
                            border: "1px solid var(--adm-border)",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--adm-text-main)" }}>
                            {prod.sku}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--adm-text-subtle)",
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {prod.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-blue" style={{ fontSize: "11px" }}>
                        {prod.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#34d399", fontSize: "13px" }}>
                      ${Number(prod.price_min).toFixed(2)} - ${Number(prod.price_max).toFixed(2)}
                    </td>
                    <td style={{ fontWeight: 700, color: "#f59e0b" }}>
                      {(prod.sold || 0).toLocaleString()} pcs
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="adm-btn adm-btn-outline adm-btn-sm"
                        onClick={() => setActivePage("products")}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h2 className="adm-card-title">
              <span>🏷️</span> Category Distribution
            </h2>
            <button
              type="button"
              className="adm-btn adm-btn-outline adm-btn-sm"
              onClick={() => setActivePage("categories")}
            >
              Manage &rarr;
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {category_counts.map((cat, idx) => {
              const maxCatCount = Math.max(...category_counts.map((c) => c.count), 1);
              const percentage = Math.round((cat.count / (stats?.total_products || 74)) * 100);
              const colors = ["#3b82f6", "#10b981", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];
              const color = colors[idx % colors.length];

              return (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, color: "var(--adm-text-main)" }}>{cat.category}</span>
                    <span style={{ color: "var(--adm-text-muted)" }}>
                      {cat.count} items ({percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(cat.count / maxCatCount) * 100}%`,
                        height: "100%",
                        background: color,
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="adm-card">
        <div className="adm-card-header">
          <h2 className="adm-card-title">
            <span>🛒</span> Recent Sales Orders
          </h2>
          <button
            type="button"
            className="adm-btn adm-btn-primary adm-btn-sm"
            onClick={() => setActivePage("orders")}
          >
            Go to Sales Center &rarr;
          </button>
        </div>

        {recent_orders.length > 0 ? (
          <div className="adm-table-container">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order Code</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Delivery Status</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: 700, color: "#38bdf8" }}>{ord.order_code}</td>
                    <td style={{ fontWeight: 600 }}>{ord.customer_name}</td>
                    <td style={{ color: "var(--adm-text-muted)" }}>{ord.customer_email}</td>
                    <td style={{ fontWeight: 700, color: "#34d399" }}>
                      ${Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          ord.delivery_status === "delivered"
                            ? "adm-badge-emerald"
                            : ord.delivery_status === "cancelled"
                            ? "adm-badge-rose"
                            : "adm-badge-amber"
                        }`}
                      >
                        {ord.delivery_status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          ord.payment_status === "paid" ? "adm-badge-emerald" : "adm-badge-rose"
                        }`}
                      >
                        {ord.payment_status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="adm-btn adm-btn-outline adm-btn-sm"
                        onClick={() => setActivePage("orders")}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--adm-text-muted)" }}>
            No recent orders recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
