import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useCVStore } from "./store/useCVStore";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { CVEditorPane } from "./components/Editor/CVEditorPane";
import { PreviewPane } from "./components/Preview/PreviewPane";
import { AddSectionModal } from "./components/Editor/AddSectionModal";
import { SettingsModal } from "./components/SettingsModal";
import { Loader2 } from "lucide-react";
import { useTranslation } from "./i18n";

export const App: React.FC = () => {
  const { t } = useTranslation();
  const loadCV = useCVStore((state) => state.loadCV);
  const isLoading = useCVStore((state) => state.isLoading);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  useEffect(() => {
    loadCV();
  }, [loadCV]);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      toast.error(t("app.globalErrorTitle"), {
        description: event.error?.message || event.message,
        duration: 4000,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      let errorMessage = t("app.unknownAsyncError");
      if (typeof event.reason === "string") {
        errorMessage = event.reason;
      } else if (event.reason instanceof Error) {
        errorMessage = event.reason.message;
      }
      
      toast.error(t("app.asyncErrorTitle"), {
        description: errorMessage,
        duration: 4000,
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [t]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[var(--panel-solid)] text-[var(--ink)] space-y-3">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] border border-[var(--border)] animate-pulse" />
          <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin absolute" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-bold text-[var(--ink)]">{t("app.loadingTitle")}</h2>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5">{t("app.loadingDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster theme="light" position="top-right" richColors closeButton />
      
      {/* Centered Desktop Window Container */}
      <div className="app-window animate-fade-in">
        {/* macOS Titlebar */}
        <Titlebar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* 3-Column Workspace Grid */}
        <div className="workspace-grid">
          {/* 1. Left: Navigation Sidebar (210px) */}
          <Sidebar onOpenAddSection={() => setIsAddSectionOpen(true)} />

          {/* 2. Middle: Modular Editor Panel (minmax 320px, 1fr) */}
          <CVEditorPane />

          {/* 3. Right: Live HTML Resume Sheet & ATS Seal (380px) */}
          <PreviewPane />
        </div>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default App;
