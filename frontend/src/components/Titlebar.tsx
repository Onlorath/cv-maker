import React from "react";
import { Settings } from "lucide-react";
import { useCVStore } from "../store/useCVStore";
import { useTranslation } from "../i18n";

interface TitlebarProps {
  onOpenSettings: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({ onOpenSettings }) => {
  const { cv, updateHeader } = useCVStore();
  const { t } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = cv?.language === "tr" ? "en" : "tr";
    updateHeader({ language: nextLang });
  };

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
        className="flex items-center gap-1.5 shrink-0"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
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
