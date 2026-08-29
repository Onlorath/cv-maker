import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";

interface AITranslateButtonProps {
  fieldKey: string;
  fieldType: "summary" | "bullet" | "title";
  text: string;
  onTranslated: (translatedText: string) => void;
  className?: string;
}

export const AITranslateButton: React.FC<AITranslateButtonProps> = ({
  fieldKey,
  fieldType,
  text,
  onTranslated,
  className = "",
}) => {
  const { translateField, translationState } = useCVStore();
  const { t } = useTranslation();

  const isTranslatingEN =
    translationState[`${fieldKey}-en`] === "translating" ||
    translationState[fieldKey] === "translating-en";
  const isTranslatingTR =
    translationState[`${fieldKey}-tr`] === "translating" ||
    translationState[fieldKey] === "translating-tr";
  const isAnyTranslating = isTranslatingEN || isTranslatingTR;

  const isTextEmpty = !text || !text.trim();

  const handleTranslate = (targetLang: "en" | "tr") => {
    if (isTextEmpty || isAnyTranslating) return;
    const sourceLang = targetLang === "en" ? "tr" : "en";
    translateField(fieldKey, fieldType, text, onTranslated, targetLang, sourceLang);
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* Translate to English Button */}
      <button
        type="button"
        onClick={() => handleTranslate("en")}
        disabled={isTextEmpty || isAnyTranslating}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-strong)] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none"
        title={t("common.translateToEN")}
      >
        {isTranslatingEN ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        <span>EN</span>
      </button>

      {/* Translate to Turkish Button */}
      <button
        type="button"
        onClick={() => handleTranslate("tr")}
        disabled={isTextEmpty || isAnyTranslating}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-strong)] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none"
        title={t("common.translateToTR")}
      >
        {isTranslatingTR ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        <span>TR</span>
      </button>
    </div>
  );
};
