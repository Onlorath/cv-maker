import React, { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { ResumeSheet } from "./ResumeSheet";
import { ATSCheckerModal } from "./ATSCheckerModal";
import { ATSClassicTemplate } from "../../templates/ATSClassicTemplate";
import { WailsBridge } from "../../lib/wailsBridge";
import { useTranslation } from "../../i18n";
import { pdf } from "@react-pdf/renderer";
import { Sparkles, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const PreviewPane: React.FC = () => {
  const cv = useCVStore((state) => state.cv);
  const { t, lang } = useTranslation();
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const { cv: currentCV } = useCVStore.getState();
    if (!currentCV) return;
    try {
      setIsExporting(true);
      const doc = <ATSClassicTemplate data={currentCV} compact={false} />;
      const blob = await pdf(doc).toBlob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(",")[1];
        const fileName = `${(currentCV.fullName || "CV").replace(/\s+/g, "_")}_Resume.pdf`;
        await WailsBridge.savePDF(base64data, fileName);
        toast.success(t("sidebar.exportPdfSuccess"));
        setIsExporting(false);
      };
    } catch (err) {
      toast.error(t("sidebar.exportPdfError"), { description: String(err) });
      setIsExporting(false);
    }
  };

  if (!cv) {
    return (
      <aside
        className="w-full h-full p-6 flex items-center justify-center text-xs text-[var(--ink-faint)]"
        style={{ background: "var(--preview-desk)" }}
      >
        {t("preview.loading")}
      </aside>
    );
  }

  return (
    <>
      <aside
        className="w-full h-full p-3 sm:p-5 overflow-y-auto custom-scrollbar flex flex-col items-center shrink-0 border-l border-[var(--border)] transition-colors"
        style={{ background: "var(--preview-desk)", scrollbarGutter: "stable" }}
      >
        {/* Preview Toolbar */}
        <div className="w-full flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[1px] uppercase text-[var(--ink-faint)]">
              {t("preview.livePreview")}
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--panel-chip)] text-[var(--ink-secondary)] border border-[var(--border)] shadow-2xs">
              <FileText className="w-3 h-3 text-[var(--ink-faint)]" />
              <span>
                {totalPages > 1
                  ? t("preview.pageCount", { count: totalPages, s: "s" })
                  : lang === "tr"
                  ? "1 Sayfa"
                  : "1 Page"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-[0.98] disabled:opacity-60"
              title={t("sidebar.exportPdf")}
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{t("sidebar.exportPdf")}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsATSModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-[0.98]"
              title={t("ats.atsAnalysisButtonTitle")}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t("ats.atsAnalysisButton")}</span>
            </button>
          </div>
        </div>

        {/* A4 Paper Document Preview */}
        <div className="w-full flex justify-center">
          <ResumeSheet cv={cv} onPageCountChange={setTotalPages} />
        </div>
      </aside>

      {/* ATS Checker Modal */}
      <ATSCheckerModal
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
      />
    </>
  );
};
