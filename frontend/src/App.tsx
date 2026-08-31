import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useCVStore } from "./store/useCVStore";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { CVEditorPane } from "./components/Editor/CVEditorPane";
import { PreviewPane } from "./components/Preview/PreviewPane";
import { AddSectionModal } from "./components/Editor/AddSectionModal";
import { SettingsModal } from "./components/SettingsModal";
import { TranslateModal } from "./components/TranslateModal";
import { BottomNav, type MobileTab } from "./components/Mobile/BottomNav";
import { MobileHeader } from "./components/Mobile/MobileHeader";
import { MobileDrawer } from "./components/Mobile/MobileDrawer";
import { MobileATSTab } from "./components/Mobile/MobileATSTab";
import { Loader2 } from "lucide-react";
import { useTranslation } from "./i18n";

export const App: React.FC = () => {
  const { t } = useTranslation();
  const loadCV = useCVStore((state) => state.loadCV);
  const isLoading = useCVStore((state) => state.isLoading);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");

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

  // Android Native Hardware Back Button Handler
  useEffect(() => {
    let removeListener: (() => void) | null = null;
    (async () => {
      try {
        const { App: CapApp } = await import("@capacitor/app");
        const listener = await CapApp.addListener("backButton", ({ canGoBack }) => {
          if (isSettingsOpen) {
            setIsSettingsOpen(false);
          } else if (isAddSectionOpen) {
            setIsAddSectionOpen(false);
          } else if (isTranslateOpen) {
            setIsTranslateOpen(false);
          } else if (isDrawerOpen) {
            setIsDrawerOpen(false);
          } else if (mobileTab !== "editor") {
            setMobileTab("editor");
          } else if (canGoBack) {
            window.history.back();
          } else {
            CapApp.exitApp();
          }
        });
        removeListener = () => {
          listener.remove();
        };
      } catch {
        // Ignored on non-Capacitor environments (Desktop Wails / standard Web)
      }
    })();

    return () => {
      if (removeListener) removeListener();
    };
  }, [isSettingsOpen, isAddSectionOpen, isTranslateOpen, isDrawerOpen, mobileTab]);

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
      
      {/* Centered Window / Mobile Container */}
      <div className="app-window animate-fade-in">
        {/* 1. Desktop Titlebar (>= 1024px) */}
        <div className="hidden lg:block">
          <Titlebar
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTranslate={() => setIsTranslateOpen(true)}
          />
        </div>

        {/* 2. Mobile App Header (< 1024px) */}
        <MobileHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTranslate={() => setIsTranslateOpen(true)}
        />

        {/* 3. Desktop 3-Column Workspace Grid (>= 1024px) */}
        <div className="workspace-grid">
          {/* Left: Navigation Sidebar (210px) */}
          <Sidebar onOpenAddSection={() => setIsAddSectionOpen(true)} />

          {/* Middle: Modular Editor Panel */}
          <CVEditorPane />

          {/* Right: Live HTML Resume Sheet & ATS Seal */}
          <PreviewPane />
        </div>

        {/* 4. Mobile & Tablet Workspace View (< 1024px) */}
        <div className="mobile-workspace">
          {mobileTab === "editor" && <CVEditorPane />}
          {mobileTab === "preview" && <PreviewPane />}
          {mobileTab === "ats" && <MobileATSTab />}
        </div>

        {/* 5. Mobile Bottom Navigation Bar (< 1024px) */}
        <BottomNav
          activeTab={mobileTab}
          onTabChange={(tab) => setMobileTab(tab)}
        />
      </div>

      {/* Mobile Section Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAddSection={() => setIsAddSectionOpen(true)}
        onSelectSection={() => setMobileTab("editor")}
      />

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

      {/* Full CV AI Translate Modal */}
      <TranslateModal
        isOpen={isTranslateOpen}
        onClose={() => setIsTranslateOpen(false)}
      />
    </>
  );
};

export default App;
