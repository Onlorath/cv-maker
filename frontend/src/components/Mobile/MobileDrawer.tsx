import React, { useState } from "react";
import {
  X,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Award,
  FolderGit2,
  Layers,
  Plus,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useCVStore } from "../../store/useCVStore";
import { ATSClassicTemplate } from "../../templates/ATSClassicTemplate";
import { WailsBridge } from "../../lib/wailsBridge";
import { sortByOrderKey } from "../../lib/cvUtils";
import { useTranslation, getSectionDisplayTitle } from "../../i18n";
import { toast } from "sonner";
import type { CVSection } from "../../types/cv";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddSection: () => void;
  onSelectSection: () => void;
}

const getSectionIcon = (type: string) => {
  switch (type) {
    case "experience":
      return <Briefcase className="w-4 h-4" />;
    case "education":
      return <GraduationCap className="w-4 h-4" />;
    case "skills":
      return <Wrench className="w-4 h-4" />;
    case "languages":
      return <Languages className="w-4 h-4" />;
    case "certifications":
      return <Award className="w-4 h-4" />;
    case "projects":
      return <FolderGit2 className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAddSection,
  onSelectSection,
}) => {
  const { t, lang } = useTranslation();
  const activePanel = useCVStore((state) => state.activePanel);
  const setActivePanel = useCVStore((state) => state.setActivePanel);
  const deleteSection = useCVStore((state) => state.deleteSection);
  const rawSections = useCVStore((state) => state.cv?.sections);
  const sections = rawSections || [];
  const [isExporting, setIsExporting] = useState(false);

  const sortedSections = sortByOrderKey(sections);

  if (!isOpen) return null;

  const handleSelect = (panelKey: string) => {
    setActivePanel(panelKey);
    onSelectSection();
    onClose();
  };

  const handleExportPDF = async () => {
    const { cv: currentCV, isCompactMode } = useCVStore.getState();
    if (!currentCV) return;
    try {
      setIsExporting(true);
      const doc = <ATSClassicTemplate data={currentCV} compact={isCompactMode} />;
      const blob = await pdf(doc).toBlob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(",")[1];
        const fileName = `${(currentCV.fullName || "CV").replace(/\s+/g, "_")}_Resume.pdf`;
        await WailsBridge.savePDF(base64data, fileName);
        toast.success(t("sidebar.exportPdfSuccess"));
        setIsExporting(false);
      };
    } catch (err) {
      toast.error(t("sidebar.exportPdfError"), { description: String(err) });
      setIsExporting(false);
    }
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className="relative w-[82vw] max-w-[320px] h-full bg-[var(--panel-solid)] text-[var(--ink)] shadow-2xl flex flex-col z-10 border-r border-[var(--border)]"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--sidebar-bg)]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold tracking-tight">{t("mobile.sectionsTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section List Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {/* General group */}
          <div>
            <div className="text-[10px] font-bold tracking-[1.1px] text-[var(--ink-faint)] uppercase px-2 pb-1.5">
              {t("sidebar.general")}
            </div>
            <ul className="flex flex-col gap-1 m-0 p-0 list-none">
              <li
                onClick={() => handleSelect("personal")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                  activePanel === "personal"
                    ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-bold shadow-2xs"
                    : "text-[var(--ink)] hover:bg-[var(--border)] font-medium"
                }`}
              >
                <User className="w-4 h-4 text-[var(--accent)]" />
                <span className="truncate flex-1">{t("sidebar.personal")}</span>
              </li>

              <li
                onClick={() => handleSelect("summary")}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                  activePanel === "summary"
                    ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-bold shadow-2xs"
                    : "text-[var(--ink)] hover:bg-[var(--border)] font-medium"
                }`}
              >
                <FileText className="w-4 h-4 text-[var(--accent)]" />
                <span className="truncate flex-1">{t("sidebar.summary")}</span>
              </li>
            </ul>
          </div>

          {/* Dynamic Sections */}
          <div>
            <div className="text-[10px] font-bold tracking-[1.1px] text-[var(--ink-faint)] uppercase px-2 pb-1.5 flex items-center justify-between">
              <span>{t("sidebar.sections")}</span>
              <span className="text-[10px] text-[var(--ink-faint)] font-normal">{sortedSections.length}</span>
            </div>

            <ul className="flex flex-col gap-1 m-0 p-0 list-none">
              {sortedSections.map((sec: CVSection) => {
                const isActive = activePanel === sec.id || activePanel === sec.sectionType;
                return (
                  <li
                    key={sec.id}
                    onClick={() => handleSelect(sec.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-bold shadow-2xs"
                        : "text-[var(--ink)] hover:bg-[var(--border)] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className={isActive ? "text-[var(--accent)]" : "text-[var(--ink-secondary)]"}>
                        {getSectionIcon(sec.sectionType)}
                      </span>
                      <span className="truncate flex-1">
                        {getSectionDisplayTitle(sec, lang)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(sec.id);
                      }}
                      className="p-1 text-[var(--ink-faint)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title={t("sidebar.deleteSectionTitle")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Add Section Trigger */}
            <div className="mt-2.5 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddSection();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft-strong)] rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t("sidebar.addNewSection")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Export PDF */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--sidebar-bg)] shrink-0">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] text-white rounded-xl py-3 px-3 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{t("sidebar.exportPdf")}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
