import React from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, GraduationCap, Link2, ExternalLink } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import { getHref } from "../../lib/cvUtils";
import type { CVEntry } from "../../types/cv";

interface EducationCardProps {
  sectionId: string;
  entry: CVEntry;
  index: number;
}

const EducationCard: React.FC<EducationCardProps> = ({ sectionId, entry, index }) => {
  const { updateEntry, deleteEntry } = useCVStore();
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-[var(--border)] rounded-[var(--radius-lg)] p-4 bg-[var(--panel-card)] space-y-3.5 transition-all shadow-xs ${
        isDragging ? "opacity-50 shadow-xl ring-2 ring-[var(--accent)] z-10" : "hover:border-[var(--border-strong)]"
      }`}
    >
      {/* Card Header: Drag handle, Title/Degree summary, Delete action */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--accent-soft)] rounded cursor-grab active:cursor-grabbing transition-colors shrink-0"
            title={t("common.drag")}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <GraduationCap className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span className="text-[13px] font-semibold text-[var(--ink)] truncate">
              {entry.title || `${t("editor.education.entryDefaultTitle")} #${index + 1}`}
            </span>
            {entry.subtitle && (
              <span className="text-[12px] text-[var(--ink-secondary)] truncate hidden sm:inline">
                • {entry.subtitle}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => deleteEntry(sectionId, entry.id)}
          className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
          title={t("editor.education.deleteEntry")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: University / School (Title) & Degree / Major (Subtitle) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <label className="field-label m-0 truncate">{t("editor.education.institution")}</label>
          </div>
          <input
            type="text"
            value={entry.title || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
            placeholder={t("editor.education.institutionPlaceholder")}
            className="native-input font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <label className="field-label m-0 truncate">{t("editor.education.degree")}</label>
          </div>
          <input
            type="text"
            value={entry.subtitle || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { subtitle: e.target.value })}
            placeholder={t("editor.education.degreePlaceholder")}
            className="native-input"
          />
        </div>
      </div>

      {/* Row 2: Location & Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <label className="field-label m-0 truncate">{t("editor.education.location")}</label>
          </div>
          <input
            type="text"
            value={entry.location || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
            placeholder={t("editor.education.locationPlaceholder")}
            className="native-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <label className="field-label m-0 truncate">{t("editor.education.link")}</label>
            </div>
            {entry.meta?.link && (
              <a
                href={getHref(entry.meta.link, "url")}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[var(--accent)] hover:underline inline-flex items-center gap-0.5 shrink-0 ml-1 font-medium"
              >
                <span>{t("common.openLink")}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="text"
            value={entry.meta?.link || ""}
            onChange={(e) =>
              updateEntry(sectionId, entry.id, {
                meta: { ...(entry.meta || {}), link: e.target.value },
              })
            }
            placeholder={t("editor.education.linkPlaceholder")}
            className="native-input"
          />
        </div>
      </div>

      {/* Row 3: Dates (with Ongoing / Present toggle) */}
      <div>
        <div className="flex items-center justify-between min-h-[24px] mb-1.5">
          <label className="field-label m-0 truncate">{t("editor.education.dates")}</label>
          <label className="text-[11px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] flex items-center gap-1.5 cursor-pointer select-none shrink-0 ml-1">
            <input
              type="checkbox"
              checked={entry.isCurrent}
              onChange={(e) => updateEntry(sectionId, entry.id, { isCurrent: e.target.checked })}
              className="rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-0 cursor-pointer"
            />
            <span>{t("editor.education.isCurrent")}</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={entry.dateStart || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { dateStart: e.target.value })}
            placeholder={t("editor.education.dateStartPlaceholder")}
            className="native-input"
          />
          <input
            type="text"
            disabled={entry.isCurrent}
            value={entry.isCurrent ? "" : entry.dateEnd || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { dateEnd: e.target.value })}
            placeholder={entry.isCurrent ? t("editor.education.isCurrent") : t("editor.education.dateEndPlaceholder")}
            className="native-input disabled:opacity-50 disabled:bg-[var(--panel-chip)]"
          />
        </div>
      </div>

      {/* Row 4: Description & Achievements */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between min-h-[24px]">
          <label className="field-label m-0 truncate">{t("editor.education.description")}</label>
        </div>
        <textarea
          rows={3}
          value={entry.description || ""}
          onChange={(e) => updateEntry(sectionId, entry.id, { description: e.target.value })}
          placeholder={t("editor.education.descriptionPlaceholder")}
          className="native-textarea font-normal leading-relaxed text-[12.5px]"
        />
      </div>
    </div>
  );
};

export const EducationPanel: React.FC = () => {
  const { cv, addSection, addEntry, reorderEntries } = useCVStore();
  const { t } = useTranslation();

  if (!cv) return null;

  const educationSection = (cv.sections || []).find((s) => s.sectionType === "education");
  const entries = educationSection?.entries || [];

  const handleAddEntry = async () => {
    if (!educationSection) {
      await addSection("education", t("sidebar.education"));
      const updatedCv = useCVStore.getState().cv;
      const newSec = (updatedCv?.sections || []).find((s) => s.sectionType === "education");
      if (newSec) {
        await addEntry(newSec.id);
      }
    } else {
      await addEntry(educationSection.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!educationSection) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(entries, oldIndex, newIndex);
      reorderEntries(educationSection.id, reordered);
    }
  };

  return (
    <section className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-[19px] font-bold text-[var(--ink)] m-0 tracking-[-0.2px]">
          {t("editor.education.title")}
        </h1>
        <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 mb-4">
          {t("editor.education.subtitle")}
        </p>
      </div>

      {entries.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <EducationCard
                  key={entry.id}
                  sectionId={educationSection!.id}
                  entry={entry}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        onClick={handleAddEntry}
        className="w-full border border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] text-[var(--ink-secondary)] hover:text-[var(--accent)] rounded-[var(--radius-md)] py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t("editor.education.addEntry")}</span>
      </button>
    </section>
  );
};
