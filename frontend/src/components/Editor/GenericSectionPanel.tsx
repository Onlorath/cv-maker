import React from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Link2, ExternalLink, GripVertical, FolderGit2 } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import { AITranslateButton } from "../Common/AITranslateButton";
import { getHref } from "../../lib/cvUtils";
import type { CVSection, CVEntry } from "../../types/cv";

interface GenericSectionPanelProps {
  section: CVSection;
}

interface GenericCardProps {
  sectionId: string;
  entry: CVEntry;
  index: number;
}

const GenericCard: React.FC<GenericCardProps> = ({ sectionId, entry, index }) => {
  const { updateEntry, deleteEntry } = useCVStore();
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const entryLink = (entry.meta?.link as string) ?? "";
  const validHref = entryLink ? getHref(entryLink, "url") : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-[var(--border)] rounded-[var(--radius-lg)] p-4 bg-[var(--panel-card)] space-y-3.5 transition-all shadow-xs ${
        isDragging ? "opacity-50 shadow-xl ring-2 ring-[var(--accent)] z-10" : "hover:border-[var(--border-strong)]"
      }`}
    >
      {/* Card Header: Drag handle, Title summary and Delete button */}
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
            <FolderGit2 className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span className="text-[13px] font-semibold text-[var(--ink)] truncate">
              {entry.title || `${t("editor.generic.titlePlaceholder")} #${index + 1}`}
            </span>
            {entry.subtitle && (
              <span className="text-[12px] text-[var(--ink-secondary)] truncate hidden sm:inline">
                • {entry.subtitle}
              </span>
            )}
            {validHref && (
              <a
                href={validHref}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[var(--accent)] hover:underline inline-flex items-center gap-0.5 ml-1 shrink-0"
                title={validHref}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => deleteEntry(sectionId, entry.id)}
          className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
          title={t("editor.generic.deleteEntry")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: Title & Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <label className="field-label m-0 truncate">{t("editor.generic.titlePlaceholder")}</label>
            <AITranslateButton
              fieldKey={`title-${entry.id}`}
              fieldType="title"
              text={entry.title || ""}
              onTranslated={(val) => updateEntry(sectionId, entry.id, { title: val })}
            />
          </div>
          <input
            type="text"
            value={entry.title || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
            placeholder={t("editor.generic.titlePlaceholder")}
            className="native-input font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <label className="field-label m-0 truncate">{t("editor.generic.subtitlePlaceholder")}</label>
          </div>
          <input
            type="text"
            value={entry.subtitle || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { subtitle: e.target.value })}
            placeholder={t("editor.generic.subtitlePlaceholder")}
            className="native-input"
          />
        </div>
      </div>

      {/* Row 2: Link & Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <label className="field-label m-0 truncate">{t("editor.generic.link")}</label>
            </div>
            {validHref && (
              <a
                href={validHref}
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
            value={entryLink}
            onChange={(e) =>
              updateEntry(sectionId, entry.id, {
                meta: { ...(entry.meta || {}), link: e.target.value },
              })
            }
            placeholder={t("editor.generic.linkPlaceholder")}
            className="native-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between min-h-[24px] mb-1.5">
            <label className="field-label m-0 truncate">{t("editor.generic.dates")}</label>
            <label className="text-[11px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] flex items-center gap-1.5 cursor-pointer select-none shrink-0 ml-1">
              <input
                type="checkbox"
                checked={entry.isCurrent}
                onChange={(e) => updateEntry(sectionId, entry.id, { isCurrent: e.target.checked })}
                className="rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-0 cursor-pointer"
              />
              <span>{t("editor.generic.isCurrent")}</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={entry.dateStart || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateStart: e.target.value })}
              placeholder={t("editor.generic.dateStartPlaceholder")}
              className="native-input"
            />
            <input
              type="text"
              disabled={entry.isCurrent}
              value={entry.isCurrent ? "" : entry.dateEnd || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateEnd: e.target.value })}
              placeholder={entry.isCurrent ? t("editor.generic.isCurrent") : t("editor.generic.dateEndPlaceholder")}
              className="native-input disabled:opacity-50 disabled:bg-[var(--panel-chip)]"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Description */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between min-h-[24px]">
          <label className="field-label m-0 truncate">{t("editor.generic.descriptionPlaceholder")}</label>
          <AITranslateButton
            fieldKey={`desc-${entry.id}`}
            fieldType="bullet"
            text={entry.description || ""}
            onTranslated={(val) => updateEntry(sectionId, entry.id, { description: val })}
          />
        </div>
        <textarea
          rows={2}
          value={entry.description || ""}
          onChange={(e) => updateEntry(sectionId, entry.id, { description: e.target.value })}
          placeholder={t("editor.generic.descriptionPlaceholder")}
          className="native-textarea font-normal leading-relaxed text-[12.5px]"
        />
      </div>
    </div>
  );
};

export const GenericSectionPanel: React.FC<GenericSectionPanelProps> = ({ section }) => {
  const { updateSectionTitle, addEntry, reorderEntries } = useCVStore();
  const { t } = useTranslation();
  const entries = section.entries || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(entries, oldIndex, newIndex);
      reorderEntries(section.id, reordered);
    }
  };

  return (
    <section className="animate-fade-in space-y-4">
      <div>
        <input
          type="text"
          value={section.title}
          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
          className="text-[19px] font-bold text-[var(--ink)] tracking-[-0.2px] bg-transparent border-b border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none w-full pb-0.5"
          placeholder={t("editor.generic.sectionTitlePlaceholder")}
        />
        <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 mb-4">
          {t("editor.generic.subtitle")}
        </p>
      </div>

      {entries.length > 0 && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <GenericCard
                  key={entry.id}
                  sectionId={section.id}
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
        onClick={() => addEntry(section.id)}
        className="w-full border border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] text-[var(--ink-secondary)] hover:text-[var(--accent)] rounded-[var(--radius-md)] py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t("editor.generic.addEntry")}</span>
      </button>
    </section>
  );
};
