import React from "react";
import { Edit3, Eye, Sparkles } from "lucide-react";
import { useTranslation } from "../../i18n";

export type MobileTab = "editor" | "preview" | "ats";

interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--panel-solid)] border-t border-[var(--border)] shadow-lg select-none"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {/* 1. Editor Tab */}
        <button
          type="button"
          onClick={() => onTabChange("editor")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "editor"
              ? "text-[var(--accent)] font-bold scale-[1.02]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)] font-medium"
          }`}
        >
          <div className="relative">
            <Edit3 className="w-5 h-5" />
            {activeTab === "editor" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent)] rounded-full animate-scale-in" />
            )}
          </div>
          <span className="text-[10.5px] leading-none tracking-tight">
            {t("mobile.tabEditor")}
          </span>
        </button>

        {/* 2. Live Preview Tab */}
        <button
          type="button"
          onClick={() => onTabChange("preview")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "preview"
              ? "text-[var(--accent)] font-bold scale-[1.02]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)] font-medium"
          }`}
        >
          <div className="relative">
            <Eye className="w-5 h-5" />
            {activeTab === "preview" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--accent)] rounded-full animate-scale-in" />
            )}
          </div>
          <span className="text-[10.5px] leading-none tracking-tight">
            {t("mobile.tabPreview")}
          </span>
        </button>

        {/* 3. ATS Score & AI Tab */}
        <button
          type="button"
          onClick={() => onTabChange("ats")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === "ats"
              ? "text-indigo-600 dark:text-indigo-400 font-bold scale-[1.02]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)] font-medium"
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5" />
            {activeTab === "ats" && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-scale-in" />
            )}
          </div>
          <span className="text-[10.5px] leading-none tracking-tight">
            {t("mobile.tabATS")}
          </span>
        </button>
      </div>
    </nav>
  );
};
