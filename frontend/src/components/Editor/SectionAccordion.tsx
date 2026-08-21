import React, { useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight, Plus, Trash2, Briefcase, GraduationCap, Wrench, Languages, Award, FolderGit2, Layers } from "lucide-react";
import type { CVSection, SectionType } from "../../types/cv";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import { EntryItem } from "./EntryItem";

interface SectionAccordionProps {
  section: CVSection;
}

const sectionIcons: Record<SectionType, React.ReactNode> = {
  experience: <Briefcase className="w-4 h-4 text-blue-400" />,
  education: <GraduationCap className="w-4 h-4 text-indigo-400" />,
  skills: <Wrench className="w-4 h-4 text-emerald-400" />,
  languages: <Languages className="w-4 h-4 text-amber-400" />,
  certifications: <Award className="w-4 h-4 text-purple-400" />,
  projects: <FolderGit2 className="w-4 h-4 text-cyan-400" />,
  custom: <Layers className="w-4 h-4 text-pink-400" />,
};

export const SectionAccordion: React.FC<SectionAccordionProps> = ({ section }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { updateSectionTitle, deleteSection, addEntry, reorderEntries } = useCVStore();
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEntryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const entries = section.entries || [];
    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(entries, oldIndex, newIndex);
      reorderEntries(section.id, reordered);
    }
  };

  const entries = section.entries || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl glass-card border border-white/5 overflow-hidden transition-all ${
        isDragging ? "opacity-30 ring-2 ring-blue-500 z-10" : ""
      }`}
    >
      {/* Accordion Header */}
      <div className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/60 border-b border-white/5 transition-colors">
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300"
            title={t("editor.accordion.dragSection")}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
            {sectionIcons[section.sectionType] || <Layers className="w-4 h-4 text-blue-400" />}
          </div>

          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
            className="flex-1 max-w-xs px-2.5 py-1 rounded-lg bg-transparent hover:bg-slate-950/40 focus:bg-slate-950/80 border border-transparent focus:border-white/10 text-xs font-bold font-['Outfit'] text-slate-200 focus:outline-none transition-all"
          />

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {entries.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => addEntry(section.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("editor.accordion.addRecord")}</span>
          </button>

          <button
            type="button"
            onClick={() => deleteSection(section.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title={t("editor.accordion.deleteSection")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-xl border border-dashed border-white/10 text-slate-500">
              <p className="text-xs">{t("editor.accordion.emptyRecords")}</p>
              <button
                type="button"
                onClick={() => addEntry(section.id)}
                className="mt-2 text-[11px] text-blue-400 hover:underline font-medium"
              >
                {t("editor.accordion.addFirstRecord")}
              </button>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleEntryDragEnd}>
              <SortableContext
                items={entries.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {entries.map((entry) => (
                    <EntryItem
                      key={entry.id}
                      sectionId={section.id}
                      sectionType={section.sectionType}
                      entry={entry}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};
