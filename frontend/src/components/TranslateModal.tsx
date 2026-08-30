import React, { useState } from "react";
import {
  Languages,
  Sparkles,
  CopyPlus,
  RefreshCw,
  Check,
  X,
  Globe2,
} from "lucide-react";
import { useCVStore } from "../store/useCVStore";
import { useTranslation } from "../i18n";

interface TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TranslateModal: React.FC<TranslateModalProps> = ({ isOpen, onClose }) => {
  const { cv, translateFullCV, isTranslatingFullCV } = useCVStore();
  const { t } = useTranslation();

  const currentLang = (cv?.language || "tr") as "tr" | "en";
  // Default target language to the opposite of current CV language
  const [targetLanguage, setTargetLanguage] = useState<"en" | "tr">(
    currentLang === "tr" ? "en" : "tr"
  );
  const [mode, setMode] = useState<"clone" | "update">("clone");

  if (!isOpen) return null;

  const handleStartTranslate = async () => {
    try {
      await translateFullCV(targetLanguage, mode);
      onClose();
    } catch {
      // Error handled inside store toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg p-6 rounded-[var(--radius-lg)] bg-[var(--modal-bg)] border border-[var(--border-strong)] shadow-2xl space-y-5 text-[var(--ink)] transition-colors relative overflow-hidden">
        {/* Loading Overlay */}
        {isTranslatingFullCV && (
          <div className="absolute inset-0 z-20 bg-[var(--modal-bg)]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] animate-pulse shadow-md border border-[var(--accent)]/20">
                <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-[15px] font-bold text-[var(--ink)]">
                {t("translateModal.translatingText")}
              </h3>
              <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
                {targetLanguage === "en"
                  ? "Tüm CV özet, deneyim ve maddeleriyle ATS İngilizce standartlarına uyarlanıyor..."
                  : "All CV summaries, experiences and bullets are being adapted to Turkish resume standards..."}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-500/20 border border-blue-500/30 text-[var(--accent)]">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold m-0 text-[var(--ink)] flex items-center gap-2">
                <span>{t("translateModal.title")}</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] rounded-full border border-[var(--accent)]/20">
                  1 İstek / Full Batch
                </span>
              </h2>
              <p className="text-[11.5px] text-[var(--ink-secondary)] mt-0.5">
                {t("translateModal.subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isTranslatingFullCV}
            className="p-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Language Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--ink-faint)] flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>{t("translateModal.targetLangTitle")}</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* English Card */}
            <div
              onClick={() => setTargetLanguage("en")}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                targetLanguage === "en"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]/50 shadow-xs ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--panel-card)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold flex items-center gap-1.5">
                  <span className="text-base">🇬🇧</span>
                  <span>{t("translateModal.langEnglish")}</span>
                </span>
                {targetLanguage === "en" && (
                  <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[var(--ink-secondary)] leading-snug">
                {t("translateModal.langEnglishDesc")}
              </p>
            </div>

            {/* Turkish Card */}
            <div
              onClick={() => setTargetLanguage("tr")}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                targetLanguage === "tr"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]/50 shadow-xs ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--panel-card)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold flex items-center gap-1.5">
                  <span className="text-base">🇹🇷</span>
                  <span>{t("translateModal.langTurkish")}</span>
                </span>
                {targetLanguage === "tr" && (
                  <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[var(--ink-secondary)] leading-snug">
                {t("translateModal.langTurkishDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold tracking-wider uppercase text-[var(--ink-faint)]">
            {t("translateModal.modeTitle")}
          </label>

          <div className="space-y-2">
            {/* Clone Mode */}
            <div
              onClick={() => setMode("clone")}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                mode === "clone"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-xs ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--panel-card)]"
              }`}
            >
              <div className="p-2 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] shrink-0 mt-0.5">
                <CopyPlus className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-bold text-[var(--ink)]">
                    {t("translateModal.modeClone")}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
                  {t("translateModal.modeCloneDesc")}
                </p>
              </div>
              {mode === "clone" && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>

            {/* In-place Update Mode */}
            <div
              onClick={() => setMode("update")}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                mode === "update"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-xs ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--panel-card)]"
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12.5px] font-bold text-[var(--ink)]">
                  {t("translateModal.modeUpdate")}
                </span>
                <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
                  {t("translateModal.modeUpdateDesc")}
                </p>
              </div>
              {mode === "update" && (
                <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isTranslatingFullCV}
            className="px-4 py-2 rounded-lg text-[12.5px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {t("translateModal.cancelBtn")}
          </button>
          <button
            type="button"
            onClick={handleStartTranslate}
            disabled={isTranslatingFullCV}
            className="px-4 py-2 rounded-lg text-[12.5px] font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("translateModal.startBtn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
