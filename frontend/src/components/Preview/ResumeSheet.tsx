import React, { useEffect, useRef, useState, useCallback } from "react";
import type { CVData } from "../../types/cv";
import { ATSClassicTemplate } from "../../templates/ATSClassicTemplate";
import { pdf } from "@react-pdf/renderer";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Loader2 } from "lucide-react";
import { useTranslation } from "../../i18n";

// Configure PDF.js worker for Vite
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface ResumeSheetProps {
  cv: CVData;
  onPageCountChange?: (totalPages: number) => void;
}

interface PDFPageCanvasProps {
  pageNumber: number;
  pdfDoc: PDFDocumentProxy;
}

const PDFPageCanvas: React.FC<PDFPageCanvasProps> = React.memo(({ pageNumber, pdfDoc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageHeight, setPageHeight] = useState(842);

  useEffect(() => {
    let isCancelled = false;
    let renderTask: any = null;

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const baseViewport = page.getViewport({ scale: 1.0 });
        setPageHeight(baseViewport.height);

        // 2x scale for crisp Retina / High-DPI display
        const renderScale = 2.0;
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        await renderTask.promise;
        page.cleanup();
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Page ${pageNumber} render error:`, err);
        }
      }
    })();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // Ignore cancellation errors
        }
      }
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      className="resume-sheet-page !p-0 !overflow-hidden bg-white shadow-xl rounded-sm"
      style={{
        width: "595.28px",
        height: `${pageHeight}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block select-none pointer-events-none"
        style={{
          width: "595.28px",
          height: `${pageHeight}px`,
        }}
      />
    </div>
  );
});

PDFPageCanvas.displayName = "PDFPageCanvas";

export const ResumeSheet: React.FC<ResumeSheetProps> = ({ cv, onPageCountChange }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5647);
  const [activePdfDoc, setActivePdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const renderSeqRef = useRef(0);
  const previousDocRef = useRef<PDFDocumentProxy | null>(null);

  // ResizeObserver for Container Width Scaling
  useEffect(() => {
    if (!containerRef.current) return;
    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const availableWidth = entry.contentRect.width - 24;
      let newScale = availableWidth / 595.28;
      if (newScale > 1) newScale = 1;
      if (newScale < 0.2) newScale = 0.2;

      newScale = Math.round(newScale * 1000) / 1000;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setScale((prev) => (Math.abs(prev - newScale) > 0.005 ? newScale : prev));
      });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Compile PDF with debouncing & direct Canvas rendering
  const compilePDF = useCallback(async (cvData: CVData, seq: number) => {
    try {
      setIsRendering(true);
      const doc = <ATSClassicTemplate data={cvData} compact={false} />;
      const blob = await pdf(doc).toBlob();

      // If a newer render was triggered while pdf() was compiling, discard this obsolete result
      if (seq !== renderSeqRef.current) return;

      const arrayBuffer = await blob.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      const pdfDoc = await loadingTask.promise;

      if (seq !== renderSeqRef.current) {
        pdfDoc.destroy();
        return;
      }

      // Cleanup previous document from memory
      if (previousDocRef.current) {
        previousDocRef.current.destroy();
      }
      previousDocRef.current = pdfDoc;

      setActivePdfDoc(pdfDoc);
      setPageCount(pdfDoc.numPages);
      setInitialLoaded(true);
      setIsRendering(false);
      onPageCountChange?.(pdfDoc.numPages);
    } catch (err) {
      console.error("PDF preview compilation error:", err);
      if (seq === renderSeqRef.current) {
        setIsRendering(false);
      }
    }
  }, [onPageCountChange]);

  // Debounced trigger whenever `cv` data updates
  useEffect(() => {
    renderSeqRef.current += 1;
    const currentSeq = renderSeqRef.current;

    // Instant on first load, 200ms debounce on keystrokes
    const delay = initialLoaded ? 200 : 0;
    const timeoutId = setTimeout(() => {
      compilePDF(cv, currentSeq);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [cv, initialLoaded, compilePDF]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (previousDocRef.current) {
        previousDocRef.current.destroy();
      }
    };
  }, []);

  const pageHeight = 842;
  const pageGap = 24;
  const totalUnscaledHeight = pageCount * pageHeight + (pageCount - 1) * pageGap;
  const scaledHeight = totalUnscaledHeight * scale;
  const marginBottom = -(totalUnscaledHeight - scaledHeight);

  // Array of page numbers 1..pageCount
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="resume-sheet-wrapper relative" ref={containerRef}>
      {isRendering && initialLoaded && (
        <div className="absolute top-0 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--panel-chip)]/90 backdrop-blur-md text-[var(--ink)] border border-[var(--border)] text-[10.5px] font-semibold shadow-xs animate-fade-in pointer-events-none">
          <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
          <span>{t("preview.updating") || "Senkronize ediliyor..."}</span>
        </div>
      )}

      {!initialLoaded || !activePdfDoc ? (
        <div className="w-[595px] h-[842px] bg-white rounded-md shadow-lg flex flex-col items-center justify-center gap-3 text-[var(--ink-secondary)] border border-[var(--border)]">
          <Loader2 className="w-7 h-7 text-[var(--accent)] animate-spin" />
          <span className="text-xs font-semibold">{t("preview.loading")}</span>
        </div>
      ) : (
        <div
          className="resume-sheet-container"
          style={{
            transform: `scale(${scale})`,
            marginBottom: `${marginBottom}px`,
          }}
        >
          {pageNumbers.map((num) => (
            <PDFPageCanvas key={num} pageNumber={num} pdfDoc={activePdfDoc} />
          ))}
        </div>
      )}
    </div>
  );
};
