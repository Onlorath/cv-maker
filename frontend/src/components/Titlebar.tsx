import React from "react";
import { Settings, Sparkles, Undo2 } from "lucide-react";
import { useCVStore } from "../store/useCVStore";
import { useTranslation } from "../i18n";

interface TitlebarProps {
  onOpenSettings: () => void;
  onOpenTranslate: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({ onOpenSettings, onOpenTranslate }) => {
  const { cv, toggleLanguage, lastTranslationSnapshot, undoTranslation } = useCVStore();
  const { t } = useTranslation();

  return (
    <div
      className="h-[38px] flex items-center justify-between px-4 border-b border-[var(--border)] select-none shrink-0"
      style={{
        background: "var(--titlebar-bg)",
        WebkitAppRegion: "drag",
      } as React.CSSProperties}
    >
      {/* Left spacer — leaves room for native macOS traffic lights */}
      <div className="w-[68px] shrink-0" />

      {/* App Title (centered) */}
      <div className="text-[12.5px] font-semibold text-[var(--ink-secondary)] tracking-[0.1px] truncate">
        {cv?.title || t("titlebar.defaultTitle")}
      </div>

      {/* Right Controls — must be non-draggable */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {lastTranslationSnapshot && (
          <button
            type="button"
            onClick={undoTranslation}
            className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer animate-fade-in"
            title={t("titlebar.undoTranslationTooltip")}
          >
            <Undo2 className="w-3 h-3 text-amber-500" />
            <span>{t("titlebar.undoTranslation")}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenTranslate}
          className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-strong)] border border-[var(--accent)]/30 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          title={t("translateModal.triggerBtn")}
        >
          <Sparkles className="w-3 h-3 text-[var(--accent)]" />
          <span>{t("translateModal.triggerBtn")}</span>
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className="text-[11px] font-semibold text-[var(--ink-secondary)] bg-[var(--border)] hover:bg-[var(--border-strong)] border border-[var(--border)] rounded-full px-2.5 py-0.5 flex items-center gap-1 transition-colors cursor-pointer"
          title={t("titlebar.toggleLanguage")}
        >
          <span>{cv?.language === "en" ? "🇺🇸 EN" : "🇹🇷 TR"}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)] rounded-md transition-colors cursor-pointer"
          title={t("titlebar.settingsTitle")}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
