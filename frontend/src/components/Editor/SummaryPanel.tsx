import React, { useState } from "react";
import { Check } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import { AITranslateButton } from "../Common/AITranslateButton";

export const SummaryPanel: React.FC = () => {
  const { cv, updateHeader } = useCVStore();
  const { t } = useTranslation();
  const [successNote, setSuccessNote] = useState(false);

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
        <div className="flex items-center justify-between">
          <label className="field-label m-0">{t("editor.summary.fieldLabel")}</label>
          <AITranslateButton
            fieldKey="summary"
            fieldType="summary"
            text={cv.summary || ""}
            onTranslated={(translated) => {
              updateHeader({ summary: translated });
              setSuccessNote(true);
              setTimeout(() => setSuccessNote(false), 4000);
            }}
          />
        </div>

        <textarea
          rows={5}
          value={cv.summary || ""}
          onChange={(e) => updateHeader({ summary: e.target.value })}
          placeholder={t("editor.summary.placeholder")}
          className="native-textarea font-normal leading-relaxed"
        />

        {successNote && (
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--seal)] mt-2">
            <Check className="w-3.5 h-3.5" />
            <span>{t("editor.summary.successNote")}</span>
          </div>
        )}
      </div>
    </section>
  );
};
