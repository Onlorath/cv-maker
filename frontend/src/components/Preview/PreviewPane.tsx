import React, { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { ResumeSheet } from "./ResumeSheet";
import { ATSCheckerModal } from "./ATSCheckerModal";
import { useTranslation } from "../../i18n";
import { Sparkles, FileText } from "lucide-react";

export const PreviewPane: React.FC = () => {
  const cv = useCVStore((state) => state.cv);
  const { t, lang } = useTranslation();
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

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
        className="w-full h-full p-5 overflow-y-auto custom-scrollbar flex flex-col items-center shrink-0 border-l border-[var(--border)] transition-colors"
        style={{ background: "var(--preview-desk)", scrollbarGutter: "stable" }}
      >
        {/* Preview Toolbar */}
        <div className="w-full flex items-center justify-between mb-4">
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

          <button
            type="button"
            onClick={() => setIsATSModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-[0.98]"
            title={t("ats.atsAnalysisButtonTitle")}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t("ats.atsAnalysisButton")}</span>
          </button>
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
