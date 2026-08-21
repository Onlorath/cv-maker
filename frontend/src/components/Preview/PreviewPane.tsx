import React, { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { ResumeSheet } from "./ResumeSheet";
import { ATSCheckerModal } from "./ATSCheckerModal";
import { useTranslation } from "../../i18n";
import { Sparkles } from "lucide-react";

export const PreviewPane: React.FC = () => {
  const cv = useCVStore((state) => state.cv);
  const { t } = useTranslation();
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);

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
        style={{ background: "var(--preview-desk)" }}
      >
        {/* Preview Toolbar */}
        <div className="w-full flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold tracking-[1px] uppercase text-[var(--ink-faint)]">
            {t("preview.livePreview")}
          </span>
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
          <ResumeSheet cv={cv} />
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

