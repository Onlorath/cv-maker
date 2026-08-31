import React from "react";
import { Menu, Settings, Sparkles, Undo2 } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";

interface MobileHeaderProps {
  onOpenDrawer: () => void;
  onOpenSettings: () => void;
  onOpenTranslate: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenDrawer,
  onOpenSettings,
  onOpenTranslate,
}) => {
  const { cv, toggleLanguage, lastTranslationSnapshot, undoTranslation } = useCVStore();
  const { t } = useTranslation();

  return (
    <header
      className="lg:hidden h-14 flex items-center justify-between px-3.5 border-b border-[var(--border)] bg-[var(--titlebar-bg)] select-none shrink-0 shadow-xs z-30"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Left: Hamburger menu for section drawer */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="p-2 text-[var(--ink)] hover:bg-[var(--border)] active:bg-[var(--border-strong)] rounded-xl transition-colors cursor-pointer"
          title={t("mobile.menuTitle")}
          aria-label={t("mobile.menuTitle")}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="max-w-[140px] sm:max-w-[220px] truncate text-[13px] font-bold text-[var(--ink)]">
          {cv?.title || t("titlebar.defaultTitle")}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {lastTranslationSnapshot && (
          <button
            type="button"
            onClick={undoTranslation}
            className="p-1.5 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all cursor-pointer"
            title={t("titlebar.undoTranslationTooltip")}
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}

        {/* AI Translate Trigger */}
        <button
          type="button"
          onClick={onOpenTranslate}
          className="p-1.5 text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-strong)] border border-[var(--accent)]/30 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
          title={t("translateModal.triggerBtn")}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px]">{t("translateModal.triggerBtn")}</span>
        </button>

        {/* Language Switch */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="px-2 py-1 text-[11.5px] font-bold text-[var(--ink-secondary)] bg-[var(--border)] hover:bg-[var(--border-strong)] rounded-lg transition-colors cursor-pointer"
          title={t("titlebar.toggleLanguage")}
        >
          <span>{cv?.language === "en" ? "EN" : "TR"}</span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--border)] rounded-lg transition-colors cursor-pointer"
          title={t("titlebar.settingsTitle")}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
