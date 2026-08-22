import React, { useState } from "react";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useCVStore } from "../store/useCVStore";
import { ATSClassicTemplate } from "../templates/ATSClassicTemplate";
import { WailsBridge } from "../lib/wailsBridge";
import { useTranslation, getSectionDisplayTitle } from "../i18n";
import { toast } from "sonner";

interface SidebarProps {
  onOpenAddSection: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddSection }) => {
  const { t, lang } = useTranslation();
  const activePanel = useCVStore((state) => state.activePanel);
  const setActivePanel = useCVStore((state) => state.setActivePanel);
  const deleteSection = useCVStore((state) => state.deleteSection);
  const rawSections = useCVStore((state) => state.cv?.sections);
  const sections = rawSections || [];
  const [isExporting, setIsExporting] = useState(false);

  const handlePanelClick = (panelKey: string) => {
    setActivePanel(panelKey);

    // Scroll to section in preview sheet and flash heading
    setTimeout(() => {
      const target = document.querySelector(`[data-key="${panelKey}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        const h2 = target.querySelector("h2");
        if (h2) {
          h2.classList.add("heading-flash");
          setTimeout(() => h2.classList.remove("heading-flash"), 700);
        }
      }
    }, 50);
  };

  const handleExportPDF = async () => {
    const currentCV = useCVStore.getState().cv;
    if (!currentCV) return;
    try {
      setIsExporting(true);
      const doc = <ATSClassicTemplate data={currentCV} />;
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

  // Static standard sections
  const standardItems = [
    { id: "personal", label: t("sidebar.personal") },
    { id: "summary", label: t("sidebar.summary") },
    { id: "experience", label: t("sidebar.experience") },
    { id: "education", label: t("sidebar.education") },
    { id: "skills", label: t("sidebar.skills") },
  ];

  // Additional custom sections (like Projects, Certifications, etc.)
  const customSections = sections.filter(
    (s) => !["experience", "education", "skills"].includes(s.sectionType)
  );

  return (
    <nav
      className="w-[210px] h-full border-r border-[var(--border)] p-3.5 flex flex-col shrink-0 select-none"
      style={{ background: "var(--sidebar-bg)" }}
    >
      <div className="text-[10.5px] font-bold tracking-[1.2px] text-[var(--ink-faint)] uppercase px-2 pb-2.5">
        {t("sidebar.sections")}
      </div>

      <ul className="flex flex-col gap-0.5 m-0 p-0 list-none overflow-y-auto custom-scrollbar flex-1">
        {standardItems.map((item) => {
          const isActive = activePanel === item.id;
          return (
            <li
              key={item.id}
              onClick={() => handlePanelClick(item.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] text-[13px] cursor-pointer transition-colors ${
                isActive
                  ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-semibold"
                  : "text-[var(--ink)] hover:bg-[var(--border)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isActive ? "bg-[var(--accent)]" : "bg-[var(--ink-faint)]"
                }`}
              />
              <span className="truncate flex-1">{item.label}</span>
            </li>
          );
        })}

        {/* Custom Sections */}
        {customSections.length > 0 && (
          <div className="pt-2 mt-1 border-t border-[var(--border)]">
            <div className="text-[9.5px] font-bold tracking-[1px] text-[var(--ink-faint)] uppercase px-2 mb-1">
              {t("sidebar.customSections")}
            </div>
            {customSections.map((sec) => {
              const isActive = activePanel === sec.id;
              return (
                <li
                  key={sec.id}
                  onClick={() => handlePanelClick(sec.id)}
                  className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-[7px] text-[13px] cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-semibold"
                      : "text-[var(--ink)] hover:bg-[var(--border)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isActive ? "bg-[var(--accent)]" : "bg-[var(--ink-faint)]"
                      }`}
                    />
                    <span className="truncate">{getSectionDisplayTitle(sec, lang)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(sec.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--ink-faint)] hover:text-rose-500 rounded transition-opacity"
                    title={t("sidebar.deleteSectionTitle")}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              );
            })}
          </div>
        )}

        {/* Add section trigger button */}
        <li className="mt-1">
          <button
            type="button"
            onClick={onOpenAddSection}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--ink-secondary)] hover:text-[var(--accent)] hover:bg-[var(--border)] rounded-[7px] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("sidebar.addNewSection")}</span>
          </button>
        </li>
      </ul>

      {/* Export Button pinned to bottom */}
      <div className="pt-3 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] text-white rounded-[10px] py-2.5 px-3 text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{t("sidebar.exportPdf")}</span>
        </button>
      </div>
    </nav>
  );
};
