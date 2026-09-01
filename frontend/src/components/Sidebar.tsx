import React, { useState } from "react";
import {
  Download,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Award,
  FolderGit2,
  Layers,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { pdf } from "@react-pdf/renderer";
import { useCVStore } from "../store/useCVStore";
import { ATSClassicTemplate } from "../templates/ATSClassicTemplate";
import { WailsBridge } from "../lib/wailsBridge";
import { sortByOrderKey } from "../lib/cvUtils";
import { useTranslation, getSectionDisplayTitle } from "../i18n";
import { toast } from "sonner";
import type { CVSection } from "../types/cv";

interface SidebarProps {
  onOpenAddSection: () => void;
}

const getSectionIcon = (type: string) => {
  switch (type) {
    case "experience":
      return <Briefcase className="w-3.5 h-3.5" />;
    case "education":
      return <GraduationCap className="w-3.5 h-3.5" />;
    case "skills":
      return <Wrench className="w-3.5 h-3.5" />;
    case "languages":
      return <Languages className="w-3.5 h-3.5" />;
    case "certifications":
      return <Award className="w-3.5 h-3.5" />;
    case "projects":
      return <FolderGit2 className="w-3.5 h-3.5" />;
    default:
      return <Layers className="w-3.5 h-3.5" />;
  }
};

interface SortableSectionItemProps {
  section: CVSection;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  isActive,
  onSelect,
  onDelete,
}) => {
  const { t, lang } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCustom = !["experience", "education", "skills"].includes(section.sectionType);

  return (
    <li
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-[7px] text-[13px] cursor-pointer transition-all ${
        isDragging
          ? "opacity-50 shadow-md ring-2 ring-[var(--accent)] z-20 bg-[var(--panel-card)]"
          : isActive
          ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-semibold"
          : "text-[var(--ink)] hover:bg-[var(--border)]"
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 text-[var(--ink-faint)] hover:text-[var(--ink)] opacity-40 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
          title={t("common.drag")}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <span
          className={`shrink-0 ${
            isActive ? "text-[var(--accent)]" : "text-[var(--ink-secondary)]"
          }`}
        >
          {getSectionIcon(section.sectionType)}
        </span>

        <span className="truncate flex-1 text-[12.5px]">
          {getSectionDisplayTitle(section, lang)}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`p-1 text-[var(--ink-faint)] hover:text-rose-500 rounded transition-opacity shrink-0 cursor-pointer ${
          isCustom ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-70 hover:!opacity-100"
        }`}
        title={t("sidebar.deleteSectionTitle")}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddSection }) => {
  const { t } = useTranslation();
  const activePanel = useCVStore((state) => state.activePanel);
  const setActivePanel = useCVStore((state) => state.setActivePanel);
  const deleteSection = useCVStore((state) => state.deleteSection);
  const reorderSections = useCVStore((state) => state.reorderSections);
  const rawSections = useCVStore((state) => state.cv?.sections);
  const sections = rawSections || [];
  const [isExporting, setIsExporting] = useState(false);

  const sortedSections = sortByOrderKey(sections);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePanelClick = (panelKey: string) => {
    setActivePanel(panelKey);

    // Scroll to section in preview sheet and flash heading
    setTimeout(() => {
      const target = document.querySelector(
        `[data-key="${panelKey}"], [data-section-type="${panelKey}"]`
      );
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
    const newIndex = sortedSections.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(sortedSections, oldIndex, newIndex);
      reorderSections(reordered);
    }
  };

  const handleExportPDF = async () => {
    const { cv: currentCV } = useCVStore.getState();
    if (!currentCV) return;
    try {
      setIsExporting(true);
      const doc = <ATSClassicTemplate data={currentCV} compact={false} />;
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
    <nav
      className="w-[210px] h-full border-r border-[var(--border)] p-3.5 flex flex-col shrink-0 select-none"
      style={{ background: "var(--sidebar-bg)" }}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
        {/* Header / Basics fixed group */}
        <div>
          <div className="text-[10px] font-bold tracking-[1.1px] text-[var(--ink-faint)] uppercase px-2 pb-1.5">
            {t("sidebar.general")}
          </div>
          <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
            <li
              onClick={() => handlePanelClick("personal")}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] text-[12.5px] cursor-pointer transition-colors ${
                activePanel === "personal"
                  ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-semibold"
                  : "text-[var(--ink)] hover:bg-[var(--border)]"
              }`}
            >
              <span
                className={`shrink-0 ${
                  activePanel === "personal" ? "text-[var(--accent)]" : "text-[var(--ink-secondary)]"
                }`}
              >
                <User className="w-3.5 h-3.5" />
              </span>
              <span className="truncate flex-1">{t("sidebar.personal")}</span>
            </li>

            <li
              onClick={() => handlePanelClick("summary")}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] text-[12.5px] cursor-pointer transition-colors ${
                activePanel === "summary"
                  ? "bg-[var(--accent-soft-strong)] text-[var(--accent)] font-semibold"
                  : "text-[var(--ink)] hover:bg-[var(--border)]"
              }`}
            >
              <span
                className={`shrink-0 ${
                  activePanel === "summary" ? "text-[var(--accent)]" : "text-[var(--ink-secondary)]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span className="truncate flex-1">{t("sidebar.summary")}</span>
            </li>
          </ul>
        </div>

        {/* Dynamic Reorderable Sections */}
        <div className="flex-1">
          <div className="text-[10px] font-bold tracking-[1.1px] text-[var(--ink-faint)] uppercase px-2 pb-1.5 flex items-center justify-between">
            <span>{t("sidebar.sections")}</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
                {sortedSections.map((sec) => (
                  <SortableSectionItem
                    key={sec.id}
                    section={sec}
                    isActive={activePanel === sec.id || activePanel === sec.sectionType}
                    onSelect={() => handlePanelClick(sec.id)}
                    onDelete={() => deleteSection(sec.id)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          {/* Add section trigger button */}
          <div className="mt-2 pt-1 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onOpenAddSection}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-[11.5px] text-[var(--ink-secondary)] hover:text-[var(--accent)] hover:bg-[var(--border)] rounded-[7px] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("sidebar.addNewSection")}</span>
            </button>
          </div>
        </div>
      </div>

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
