import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  Move,
} from "lucide-react";
import { useTranslation } from "../../i18n";

interface PhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 400;

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      setIsImageLoaded(true);
      // Reset state for new image
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
  }, [isOpen, imageSrc]);

  // Redraw canvas whenever zoom, pan, rotation or image changes
  const drawViewport = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || !isImageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    // Dark neutral background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    const baseScale = Math.max(
      VIEWPORT_SIZE / img.naturalWidth,
      VIEWPORT_SIZE / img.naturalHeight
    );
    const drawW = img.naturalWidth * baseScale * zoom;
    const drawH = img.naturalHeight * baseScale * zoom;

    ctx.save();
    ctx.translate(VIEWPORT_SIZE / 2 + pan.x, VIEWPORT_SIZE / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, pan, rotation, isImageLoaded]);

  useEffect(() => {
    drawViewport();
  }, [drawViewport]);

  if (!isOpen) return null;

  // Mouse / Touch handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setZoom((prev) => Math.min(3, Math.max(1, Math.round((prev + delta) * 100) / 100)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = () => {
    const img = imageObjRef.current;
    if (!img) return;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return;

    const outputRatio = OUTPUT_SIZE / VIEWPORT_SIZE;
    const baseScale = Math.max(
      VIEWPORT_SIZE / img.naturalWidth,
      VIEWPORT_SIZE / img.naturalHeight
    );
    const drawW = img.naturalWidth * baseScale * zoom * outputRatio;
    const drawH = img.naturalHeight * baseScale * zoom * outputRatio;

    outCtx.save();
    outCtx.translate(OUTPUT_SIZE / 2 + pan.x * outputRatio, OUTPUT_SIZE / 2 + pan.y * outputRatio);
    outCtx.rotate((rotation * Math.PI) / 180);
    outCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    outCtx.restore();

    const croppedBase64 = outCanvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(croppedBase64);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-[var(--modal-bg)] border border-[var(--border-strong)] shadow-2xl p-5 text-[var(--ink)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
          <div>
            <h2 className="text-[15px] font-bold text-[var(--ink)] m-0">
              {t("editor.cropModal.title")}
            </h2>
            <p className="text-[11.5px] text-[var(--ink-secondary)] mt-0.5 m-0">
              {t("editor.cropModal.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink)] rounded-md hover:bg-[var(--border)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport with Cutout Mask */}
        <div className="flex justify-center">
          <div
            className="relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-[var(--border-strong)] shadow-inner"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              width={VIEWPORT_SIZE}
              height={VIEWPORT_SIZE}
              className="block"
            />

            {/* SVG Mask Overlay for Circular and Square Guides */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
            >
              <defs>
                <mask id="crop-mask">
                  {/* Fill entire rect with white */}
                  <rect width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} fill="#ffffff" />
                  {/* Cut out circle with black */}
                  <circle
                    cx={VIEWPORT_SIZE / 2}
                    cy={VIEWPORT_SIZE / 2}
                    r={VIEWPORT_SIZE / 2 - 12}
                    fill="#000000"
                  />
                </mask>
              </defs>

              {/* Darkened mask outside the circle */}
              <rect
                width={VIEWPORT_SIZE}
                height={VIEWPORT_SIZE}
                fill="rgba(0, 0, 0, 0.55)"
                mask="url(#crop-mask)"
              />

              {/* Circular framing border */}
              <circle
                cx={VIEWPORT_SIZE / 2}
                cy={VIEWPORT_SIZE / 2}
                r={VIEWPORT_SIZE / 2 - 12}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />

              {/* Center Crosshairs */}
              <line
                x1={VIEWPORT_SIZE / 2 - 10}
                y1={VIEWPORT_SIZE / 2}
                x2={VIEWPORT_SIZE / 2 + 10}
                y2={VIEWPORT_SIZE / 2}
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1.5"
              />
              <line
                x1={VIEWPORT_SIZE / 2}
                y1={VIEWPORT_SIZE / 2 - 10}
                x2={VIEWPORT_SIZE / 2}
                y2={VIEWPORT_SIZE / 2 + 10}
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Drag helper tooltip */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none flex items-center gap-1">
              <Move className="w-2.5 h-2.5" />
              <span>{t("editor.cropModal.dragHint")}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 pt-1">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
              className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink)] cursor-pointer"
              title={t("editor.cropModal.zoomOut")}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--border-strong)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
              className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink)] cursor-pointer"
              title={t("editor.cropModal.zoomIn")}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-[var(--ink-secondary)] min-w-[32px] text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="flex-1 py-1 px-2 text-[11px] font-semibold text-[var(--ink-secondary)] bg-[var(--panel-chip)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{t("editor.cropModal.rotate")}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-1 px-2 text-[11px] font-semibold text-[var(--ink-secondary)] bg-[var(--panel-chip)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("editor.cropModal.reset")}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] font-medium text-[var(--ink-secondary)] hover:bg-[var(--border)] rounded-lg transition-colors cursor-pointer"
          >
            {t("editor.cropModal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[var(--accent)] hover:opacity-90 rounded-lg shadow-sm flex items-center gap-1.5 transition-opacity cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t("editor.cropModal.apply")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
