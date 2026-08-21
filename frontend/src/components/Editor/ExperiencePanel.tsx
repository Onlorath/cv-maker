import React from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Sparkles, Loader2, Plus } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import type { CVEntry } from "../../types/cv";

interface ExperienceCardProps {
  sectionId: string;
  entry: CVEntry;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ sectionId, entry }) => {
  const { updateEntry, deleteEntry, translateField, translationState } = useCVStore();
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isTranslatingDesc = translationState[`desc-${entry.id}`] === "translating";

  const handleTranslateDesc = () => {
    if (!entry.description || isTranslatingDesc) return;
    translateField(`desc-${entry.id}`, "bullet", entry.description, (translated) => {
      updateEntry(sectionId, entry.id, { description: translated });
    });
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
              <label className="field-label">{t("editor.experience.position")}</label>
              <input
                type="text"
                value={entry.title || ""}
                onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
                placeholder={t("editor.experience.positionPlaceholder")}
                className="native-input"
              />
            </div>

            <div>
              <label className="field-label">{t("editor.experience.company")}</label>
              <input
                type="text"
                value={entry.subtitle || ""}
                onChange={(e) => updateEntry(sectionId, entry.id, { subtitle: e.target.value })}
                placeholder={t("editor.experience.companyPlaceholder")}
                className="native-input"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => deleteEntry(sectionId, entry.id)}
            className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors self-start mt-4 cursor-pointer"
            title={t("editor.experience.deleteEntry")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="field-label">{t("editor.experience.location")}</label>
            <input
              type="text"
              value={entry.location || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
              placeholder={t("editor.experience.locationPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <label className="field-label">{t("editor.experience.dateStart")}</label>
            <input
              type="text"
              value={entry.dateStart || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateStart: e.target.value })}
              placeholder={t("editor.experience.dateStartPlaceholder")}
              className="native-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="field-label m-0">{t("editor.experience.dateEnd")}</label>
              <label className="text-[10px] text-[var(--ink-secondary)] flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entry.isCurrent}
                  onChange={(e) => updateEntry(sectionId, entry.id, { isCurrent: e.target.checked })}
                  className="rounded"
                />
                <span>{t("editor.experience.isCurrent")}</span>
              </label>
            </div>
            <input
              type="text"
              disabled={entry.isCurrent}
              value={entry.isCurrent ? "" : entry.dateEnd || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateEnd: e.target.value })}
              placeholder={entry.isCurrent ? t("editor.experience.isCurrent") : t("editor.experience.dateEndPlaceholder")}
              className="native-input disabled:opacity-50 mt-1"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="field-label m-0">{t("editor.experience.description")}</label>
            <button
              type="button"
              onClick={handleTranslateDesc}
              disabled={isTranslatingDesc || !entry.description}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--accent)] font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              {isTranslatingDesc ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>{t("editor.experience.translateBullet")}</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={entry.description || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { description: e.target.value })}
            placeholder={t("editor.experience.descriptionPlaceholder")}
            className="native-textarea"
          />
        </div>
      </div>
    </div>
  );
};

export const ExperiencePanel: React.FC = () => {
  const { cv, addSection, addEntry, reorderEntries } = useCVStore();
  const { t } = useTranslation();

  if (!cv) return null;

  const experienceSection = (cv.sections || []).find((s) => s.sectionType === "experience");
  const entries = experienceSection?.entries || [];

  const handleAddEntry = async () => {
    if (!experienceSection) {
      await addSection("experience", t("sidebar.experience"));
      const updatedCv = useCVStore.getState().cv;
      const newSec = (updatedCv?.sections || []).find((s) => s.sectionType === "experience");
      if (newSec) {
        await addEntry(newSec.id);
      }
    } else {
      await addEntry(experienceSection.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!experienceSection) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(entries, oldIndex, newIndex);
      reorderEntries(experienceSection.id, reordered);
    }
  };

  return (
    <section className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-[19px] font-bold text-[var(--ink)] m-0 tracking-[-0.2px]">
          {t("editor.experience.title")}
        </h1>
        <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 mb-4">
          {t("editor.experience.subtitle")}
        </p>
      </div>

      {entries.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {entries.map((entry) => (
                <ExperienceCard
                  key={entry.id}
                  sectionId={experienceSection!.id}
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
        <span>{t("editor.experience.addEntry")}</span>
      </button>
    </section>
  );
};
