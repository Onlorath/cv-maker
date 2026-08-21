import React from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import type { CVEntry } from "../../types/cv";

interface EducationCardProps {
  sectionId: string;
  entry: CVEntry;
}

const EducationCard: React.FC<EducationCardProps> = ({ sectionId, entry }) => {
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
      className={`border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 bg-[var(--panel-card)] flex gap-2.5 transition-shadow ${
        isDragging ? "opacity-50 shadow-lg ring-2 ring-[var(--accent)] z-10" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-grab active:cursor-grabbing pt-1.5 shrink-0"
        title={t("common.drag")}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
            <div>
              <label className="field-label">{t("editor.education.institution")}</label>
              <input
                type="text"
                value={entry.subtitle || ""}
                onChange={(e) => updateEntry(sectionId, entry.id, { subtitle: e.target.value })}
                placeholder={t("editor.education.institutionPlaceholder")}
                className="native-input"
              />
            </div>

            <div>
              <label className="field-label">{t("editor.education.degree")}</label>
              <input
                type="text"
                value={entry.title || ""}
                onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
                placeholder={t("editor.education.degreePlaceholder")}
                className="native-input"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => deleteEntry(sectionId, entry.id)}
            className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors self-start mt-4 cursor-pointer"
            title={t("editor.education.deleteEntry")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="field-label">{t("editor.education.location")}</label>
            <input
              type="text"
              value={entry.location || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
              placeholder={t("editor.education.locationPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <label className="field-label">{t("editor.education.dateStart")}</label>
            <input
              type="text"
              value={entry.dateStart || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateStart: e.target.value })}
              placeholder={t("editor.education.dateStartPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <label className="field-label">{t("editor.education.dateEnd")}</label>
            <input
              type="text"
              value={entry.dateEnd || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateEnd: e.target.value })}
              placeholder={t("editor.education.dateEndPlaceholder")}
              className="native-input"
            />
          </div>
        </div>
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
              {entries.map((entry) => (
                <EducationCard
                  key={entry.id}
                  sectionId={educationSection!.id}
                  entry={entry}
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
