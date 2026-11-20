import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * ImageCropperModal
 * Interactive HTML5 Canvas Cropper & Optimizer for Product Images
 * Supports: Pan, Zoom, Rotate, Aspect Ratio presets, Output resolution scaling
 */
export default function ImageCropperModal({
  imageSrc, // File, Blob, or Data URL string
  onCropComplete, // (result: { blob, base64, width, height }) => void
  onClose,
  title = "Crop & Optimize Product Image",
  targetWidth = 800,
  targetHeight = 800,
}) {
  const [imageObj, setImageObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1); // 1 = 1:1 square
  const [aspectName, setAspectName] = useState("1:1");
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(0.2);
  const [maxScale, setMaxScale] = useState(4);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Load image from imageSrc (string URL or File/Blob)
  useEffect(() => {
    setLoading(true);
    let url = "";
    if (typeof imageSrc === "string") {
      url = imageSrc;
    } else if (imageSrc instanceof Blob || imageSrc instanceof File) {
      url = URL.createObjectURL(imageSrc);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageObj(img);
      setLoading(false);
      // Center and fit initial scale
      const initialScale = Math.max(360 / img.naturalWidth, 360 / img.naturalHeight, 0.5);
      setScale(initialScale);
      setMinScale(Math.min(initialScale * 0.4, 0.1));
      setMaxScale(Math.max(initialScale * 4, 3));
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    };
    img.onerror = () => {
      setLoading(false);
      alert("Failed to load the selected image. Please try another image file.");
      onClose();
    };
    img.src = url;

    return () => {
      if (url && (imageSrc instanceof Blob || imageSrc instanceof File)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageSrc, onClose]);

  // Viewport dimensions for the interactive editor
  const viewWidth = 440;
  const viewHeight = 440;

  // Crop box dimensions based on chosen aspect ratio
  const getCropBoxDimensions = useCallback(() => {
    const padding = 20;
    const maxBoxW = viewWidth - padding * 2;
    const maxBoxH = viewHeight - padding * 2;

    if (aspectRatio === null) {
      // Freeform default
      return { width: maxBoxW, height: maxBoxH };
    }

    if (aspectRatio >= 1) {
      // Width is larger or square
      const w = maxBoxW;
      const h = Math.min(maxBoxW / aspectRatio, maxBoxH);
      return { width: Math.round(w), height: Math.round(h) };
    } else {
      // Height is larger (portrait)
      const h = maxBoxH;
      const w = Math.min(maxBoxH * aspectRatio, maxBoxW);
      return { width: Math.round(w), height: Math.round(h) };
    }
  }, [aspectRatio, viewWidth, viewHeight]);

  const cropBox = getCropBoxDimensions();

  // Draw Main Interactive Canvas
  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = viewWidth;
    canvas.height = viewHeight;

    // Background workspace pattern
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    // Save state for transform
    ctx.save();
    ctx.translate(viewWidth / 2 + position.x, viewHeight / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw the image centered
    ctx.drawImage(
      imageObj,
      -imageObj.naturalWidth / 2,
      -imageObj.naturalHeight / 2,
      imageObj.naturalWidth,
      imageObj.naturalHeight
    );
    ctx.restore();

    // Darkened overlay outside the crop box
    const boxX = (viewWidth - cropBox.width) / 2;
    const boxY = (viewHeight - cropBox.height) / 2;

    ctx.fillStyle = "rgba(10, 15, 29, 0.72)";
    // Top
    ctx.fillRect(0, 0, viewWidth, boxY);
    // Bottom
    ctx.fillRect(0, boxY + cropBox.height, viewWidth, viewHeight - (boxY + cropBox.height));
    // Left
    ctx.fillRect(0, boxY, boxX, cropBox.height);
    // Right
    ctx.fillRect(boxX + cropBox.width, boxY, viewWidth - (boxX + cropBox.width), cropBox.height);

    // Crop box border
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, cropBox.width, cropBox.height);

    // Rule-of-thirds grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical third lines
    ctx.beginPath();
    ctx.moveTo(boxX + cropBox.width / 3, boxY);
    ctx.lineTo(boxX + cropBox.width / 3, boxY + cropBox.height);
    ctx.moveTo(boxX + (cropBox.width * 2) / 3, boxY);
    ctx.lineTo(boxX + (cropBox.width * 2) / 3, boxY + cropBox.height);

    // Horizontal third lines
    ctx.moveTo(boxX, boxY + cropBox.height / 3);
    ctx.lineTo(boxX + cropBox.width, boxY + cropBox.height / 3);
    ctx.moveTo(boxX, boxY + (cropBox.height * 2) / 3);
    ctx.lineTo(boxX + cropBox.width, boxY + (cropBox.height * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update real-time preview
    if (previewCanvasRef.current) {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas.getContext("2d");
      pCanvas.width = 130;
      pCanvas.height = 130;

      pCtx.fillStyle = "#ffffff";
      pCtx.fillRect(0, 0, 130, 130);

      // Extract image area corresponding to the crop box
      pCtx.drawImage(
        canvas,
        boxX,
        boxY,
        cropBox.width,
        cropBox.height,
        0,
        0,
        130,
        130
      );
    }
  }, [imageObj, scale, position, rotation, cropBox, viewWidth, viewHeight]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setScale((prev) => Math.min(Math.max(prev + delta, minScale), maxScale));
  };

  // Perform Final Crop at Target Resolution (800x800)
  const handleCropSave = () => {
    if (!imageObj) return;
    setProcessing(true);

    try {
      const outW = targetWidth;
      const outH = Math.round(aspectRatio ? targetWidth / aspectRatio : targetHeight);

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const outCtx = outCanvas.getContext("2d");

      // High quality smoothing
      outCtx.imageSmoothingEnabled = true;
      outCtx.imageSmoothingQuality = "high";

      // Fill pure white background for product clarity (standard for e-commerce)
      outCtx.fillStyle = "#ffffff";
      outCtx.fillRect(0, 0, outW, outH);

      // Determine ratio between crop box and output canvas
      const ratio = outW / cropBox.width;

      outCtx.save();
      // Translate to output center
      outCtx.translate(outW / 2, outH / 2);
      outCtx.rotate((rotation * Math.PI) / 180);
      outCtx.scale(scale * ratio, scale * ratio);

      // Translate by user position relative to crop box center
      const offsetX = position.x * ratio;
      const offsetY = position.y * ratio;

      // When rotated, offset directions transform
      const rad = (-rotation * Math.PI) / 180;
      const rotX = offsetX * Math.cos(rad) - offsetY * Math.sin(rad);
      const rotY = offsetX * Math.sin(rad) + offsetY * Math.cos(rad);

      outCtx.translate(rotX / (scale * ratio), rotY / (scale * ratio));

      outCtx.drawImage(
        imageObj,
        -imageObj.naturalWidth / 2,
        -imageObj.naturalHeight / 2,
        imageObj.naturalWidth,
        imageObj.naturalHeight
      );
      outCtx.restore();

      // Export as Blob & Data URL
      outCanvas.toBlob(
        (blob) => {
          const base64 = outCanvas.toDataURL("image/jpeg", 0.92);
          setProcessing(false);
          onCropComplete({
            blob,
            base64,
            width: outW,
            height: outH,
          });
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      setProcessing(false);
      alert("Crop processing failed: " + err.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 15, 29, 0.82)",
        backdropFilter: "blur(6px)",
        zIndex: 10005,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "720px",
          maxWidth: "96vw",
          maxHeight: "92vh",
          backgroundColor: "#0d1322",
          color: "#f8fafc",
          borderRadius: "12px",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(56, 189, 248, 0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "linear-gradient(180deg, #162032 0%, #0d1322 100%)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✂️</span> {title}
            </h3>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              Pan, zoom, or select aspect ratio to auto-resize and optimize for high-speed product display.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              color: "#cbd5e1",
              fontSize: "18px",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "16px 20px", overflowY: "auto", display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          
          {/* Left: Interactive Canvas */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              ref={containerRef}
              style={{
                width: `${viewWidth}px`,
                height: `${viewHeight}px`,
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #334155",
                position: "relative",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                background: "#090d16",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {loading ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#38bdf8", fontSize: "14px" }}>
                  Loading image...
                </div>
              ) : (
                <canvas ref={canvasRef} style={{ display: "block" }} />
              )}
            </div>

            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>
              💡 Drag to pan &bull; Scroll mouse wheel or use slider below to zoom
            </div>
          </div>

          {/* Right: Controls & Preview Sidebar */}
          <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Live Card Preview */}
            <div style={{ background: "#162032", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>
                Live Product Card Preview
              </div>
              <div
                style={{
                  width: "130px",
                  height: "130px",
                  margin: "0 auto",
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: "2px solid #38bdf8",
                  background: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <canvas ref={previewCanvasRef} style={{ width: "100%", height: "100%" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "6px", fontWeight: 600 }}>
                Target Output: {targetWidth} × {Math.round(aspectRatio ? targetWidth / aspectRatio : targetHeight)} px
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
                Aspect Ratio:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {[
                  { name: "1:1", label: "1:1 Square (E-Commerce)", val: 1 },
                  { name: "4:3", label: "4:3 Standard", val: 4 / 3 },
                  { name: "3:4", label: "3:4 Tall", val: 3 / 4 },
                  { name: "16:9", label: "16:9 Banner", val: 16 / 9 },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setAspectRatio(item.val);
                      setAspectName(item.name);
                    }}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: aspectName === item.name ? "1px solid #38bdf8" : "1px solid #334155",
                      background: aspectName === item.name ? "rgba(56, 189, 248, 0.15)" : "#0b111e",
                      color: aspectName === item.name ? "#38bdf8" : "#94a3b8",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>
                  Zoom Level:
                </label>
                <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700 }}>
                  {Math.round(scale * 100)}%
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(s - 0.1, minScale))}
                  style={{ width: "26px", height: "26px", borderRadius: "4px", background: "#1e293b", border: "1px solid #334155", color: "#fff", cursor: "pointer", fontWeight: 700 }}
                >
                  -
                </button>
                <input
                  type="range"
                  min={minScale}
                  max={maxScale}
                  step={0.01}
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#38bdf8", cursor: "pointer" }}
                />
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(s + 0.1, maxScale))}
                  style={{ width: "26px", height: "26px", borderRadius: "4px", background: "#1e293b", border: "1px solid #334155", color: "#fff", cursor: "pointer", fontWeight: 700 }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Rotation & Reset Actions */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🔄 Rotate 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosition({ x: 0, y: 0 });
                  setRotation(0);
                  if (imageObj) {
                    setScale(Math.max(360 / imageObj.naturalWidth, 360 / imageObj.naturalHeight, 0.5));
                  }
                }}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ↺ Reset View
              </button>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "14px 20px",
            background: "#080c14",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            ✓ Auto-compressed &amp; normalized to <strong>{targetWidth}×{targetHeight}px</strong>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="adm-btn adm-btn-secondary"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={handleCropSave}
              disabled={processing || loading}
              style={{ fontWeight: 800, padding: "8px 20px", minWidth: "160px" }}
            >
              {processing ? "Processing & Optimizing..." : "✂️ Crop & Save Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
