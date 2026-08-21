import React, { useState, useEffect } from "react";
import { Key, ShieldCheck, X, CheckCircle2, AlertCircle, Sun, Moon } from "lucide-react";
import { WailsBridge } from "../lib/wailsBridge";
import { useCVStore } from "../store/useCVStore";
import { useTranslation } from "../i18n";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useCVStore();
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      WailsBridge.getGeminiAPIKey()
        .then((key) => setApiKey(key || ""))
        .catch(() => setApiKey(""));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setErrorMessage(t("settings.apiKeyEmptyError"));
      setStatus("error");
      return;
    }

    setStatus("saving");
    try {
      await WailsBridge.setGeminiAPIKey(apiKey.trim());
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || t("settings.apiKeySaveError"));
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md p-5 rounded-[var(--radius-lg)] bg-[var(--modal-bg)] border border-[var(--border-strong)] shadow-2xl space-y-4 text-[var(--ink)] transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold m-0 text-[var(--ink)]">{t("settings.title")}</h2>
              <p className="text-[11.5px] text-[var(--ink-secondary)] mt-0.5">{t("settings.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. API Key Section */}
        <div className="space-y-3">
          <label className="field-label">{t("settings.geminiApiKey")}</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={t("settings.apiKeyPlaceholder")}
            className="native-input font-mono text-xs"
          />

          <div className="flex items-start gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--modal-card)] border border-[var(--border)] text-[11px] text-[var(--ink-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{t("settings.keychainNotice")}</span>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "saved" && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("settings.apiKeySaveSuccess")}</span>
            </div>
          )}
        </div>

        {/* 2. Theme Selection Section */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
          <div>
            <label className="field-label m-0">{t("settings.themeTitle")}</label>
            <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
              {t("settings.themeSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2.5 p-2.5 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-[var(--accent-soft-strong)] border-[var(--accent)] text-[var(--accent)] font-semibold shadow-xs"
                  : "bg-[var(--modal-card)] border-[var(--border)] text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--modal-card-hover)]"
              }`}
            >
              <div className={`p-1.5 rounded-md ${theme === "light" ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--ink-secondary)]"}`}>
                <Sun className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] block">{t("settings.lightTheme")}</span>
                <span className="text-[10px] opacity-75 block">{t("settings.lightThemeDesc")}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2.5 p-2.5 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-[var(--accent-soft-strong)] border-[var(--accent)] text-[var(--accent)] font-semibold shadow-xs"
                  : "bg-[var(--modal-card)] border-[var(--border)] text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--modal-card-hover)]"
              }`}
            >
              <div className={`p-1.5 rounded-md ${theme === "dark" ? "bg-[var(--accent)] text-black font-bold" : "bg-[var(--border)] text-[var(--ink-secondary)]"}`}>
                <Moon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] block">{t("settings.darkTheme")}</span>
                <span className="text-[10px] opacity-75 block">{t("settings.darkThemeDesc")}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--ink-secondary)] hover:bg-[var(--border)] transition-colors cursor-pointer"
          >
            {t("common.close")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving" || status === "saved"}
            className="px-4 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
          >
            {status === "saving" ? t("common.saving") : status === "saved" ? t("common.saved") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
};
