import React from "react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";

export const SummaryPanel: React.FC = () => {
  const { cv, updateHeader } = useCVStore();
  const { t } = useTranslation();

  if (!cv) return null;

  return (
    <section className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-[19px] font-bold text-[var(--ink)] m-0 tracking-[-0.2px]">
          {t("editor.summary.title")}
        </h1>
        <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 mb-4">
          {t("editor.summary.subtitle")}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between min-h-[24px]">
          <label className="field-label m-0">{t("editor.summary.fieldLabel")}</label>
        </div>

        <textarea
          rows={5}
          value={cv.summary || ""}
          onChange={(e) => updateHeader({ summary: e.target.value })}
          placeholder={t("editor.summary.placeholder")}
          className="native-textarea font-normal leading-relaxed"
        />
      </div>
    </section>
  );
};
