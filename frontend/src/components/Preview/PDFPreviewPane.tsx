import React, { useState, useEffect, useMemo } from "react";
import { BlobProvider, pdf } from "@react-pdf/renderer";
import { Download, ZoomIn, ZoomOut, RotateCcw, FileText, Loader2 } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { ATSClassicTemplate } from "../../templates/ATSClassicTemplate";
import { WailsBridge } from "../../lib/wailsBridge";
import { toast } from "sonner";
import type { CVData } from "../../types/cv";

export const PDFPreviewPane: React.FC = () => {
  const { cv, previewZoom, setPreviewZoom, previewLanguage } = useCVStore();
  const [debouncedCV, setDebouncedCV] = useState<CVData | null>(cv);
  const [isDownloading, setIsDownloading] = useState(false);

  // Debounce PDF updates slightly to avoid high CPU load on each keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCV(cv);
    }, 350);
    return () => clearTimeout(timer);
  }, [cv]);

  const viewData: CVData | null = useMemo(() => {
    if (!debouncedCV) return null;
    return {
      ...debouncedCV,
      language: previewLanguage || debouncedCV.language || "tr",
    };
  }, [debouncedCV, previewLanguage]);

  const pdfDocument = useMemo(
    () => (viewData ? <ATSClassicTemplate data={viewData} /> : null),
    [viewData]
  );

  const handleDownload = async () => {
    if (!pdfDocument || !viewData) return;
    try {
      setIsDownloading(true);
      const blob = await pdf(pdfDocument).toBlob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const fileName = `${(viewData.fullName || "CV").replace(/\s+/g, "_")}_Resume.pdf`;
        await WailsBridge.savePDF(base64data, fileName);
        toast.success("PDF başarıyla kaydedildi");
        setIsDownloading(false);
      };
    } catch (err) {
      toast.error("PDF kaydedilemedi", { description: String(err) });
      setIsDownloading(false);
    }
  };

  if (!debouncedCV || !viewData || !pdfDocument) {
    return (
      <div className="flex-1 h-full flex items-center justify-center text-slate-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Önizleme hazırlanıyor...
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col glass-panel border-l border-white/10 overflow-hidden bg-slate-950/40">
      {/* Top Preview Control Bar */}
      <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-200 font-['Outfit']">
            ATS Classic Canlı Önizleme
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            A4 Standard
          </span>
        </div>

        {/* Zoom & Download */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 text-slate-400">
            <button
              onClick={() => setPreviewZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
              title="Uzaklaştır"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              onClick={() => setPreviewZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors"
              title="Yakınlaştır"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPreviewZoom(1.0)}
              className="p-1 rounded hover:text-white hover:bg-white/10 transition-colors ml-0.5"
              title="Sıfırla"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>PDF İndir</span>
          </button>
        </div>
      </div>

      {/* PDF View Container - using BlobProvider + object tag instead of PDFViewer iframe */}
      <div className="flex-1 w-full h-full relative overflow-auto bg-slate-950/80 flex items-center justify-center p-4">
        <div
          className="transition-transform origin-top"
          style={{ transform: `scale(${previewZoom})`, width: "595px", minHeight: "842px" }}
        >
          <BlobProvider document={pdfDocument}>
            {({ url, loading, error }) => {
              if (loading) {
                return (
                  <div className="w-full h-[842px] rounded-xl border border-white/10 bg-white flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <span className="text-xs font-medium">PDF oluşturuluyor...</span>
                    </div>
                  </div>
                );
              }
              if (error) {
                return (
                  <div className="w-full h-[842px] rounded-xl border border-rose-500/30 bg-slate-900 flex items-center justify-center">
                    <div className="text-center text-rose-400 text-xs px-8">
                      <p className="font-bold mb-1">PDF Oluşturma Hatası</p>
                      <p className="text-slate-500">{String(error)}</p>
                    </div>
                  </div>
                );
              }
              if (!url) return null;
              return (
                <object
                  data={`${url}#toolbar=0&navpanes=0`}
                  type="application/pdf"
                  className="w-full rounded-xl border border-white/10 shadow-2xl bg-white"
                  style={{ width: "595px", height: "842px" }}
                >
                  <div className="w-full h-full flex items-center justify-center bg-white text-slate-500 text-xs">
                    PDF önizleme desteklenmiyor. Lütfen PDF İndir butonunu kullanın.
                  </div>
                </object>
              );
            }}
          </BlobProvider>
        </div>
      </div>
    </div>
  );
};
