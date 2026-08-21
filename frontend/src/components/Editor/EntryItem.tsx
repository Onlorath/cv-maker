import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Sparkles, Loader2, Calendar, MapPin, Building } from "lucide-react";
import type { CVEntry, SectionType } from "../../types/cv";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";

interface EntryItemProps {
  sectionId: string;
  sectionType: SectionType;
  entry: CVEntry;
}

export const EntryItem: React.FC<EntryItemProps> = ({ sectionId, sectionType, entry }) => {
  const { updateEntry, deleteEntry, translateField, translationState } = useCVStore();
  const { t } = useTranslation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isChipType = sectionType === "skills" || sectionType === "languages";
  const isTranslatingDesc = translationState[`desc-${entry.id}`] === "translating";
  const isTranslatingTitle = translationState[`title-${entry.id}`] === "translating";

  const handleTranslateDescription = () => {
    if (!entry.description) return;
    translateField(`desc-${entry.id}`, "bullet", entry.description, (translated) => {
      updateEntry(sectionId, entry.id, { description: translated });
    });
  };

  const handleTranslateTitle = () => {
    if (!entry.title) return;
    translateField(`title-${entry.id}`, "title", entry.title, (translated) => {
      updateEntry(sectionId, entry.id, { title: translated });
    });
  };

  // Compact layout for Skills & Languages
  if (isChipType) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 group hover:border-white/10 transition-all ${
          isDragging ? "opacity-40 ring-2 ring-blue-500 z-10" : ""
        }`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <input
          type="text"
          value={entry.title}
          onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
          placeholder={sectionType === "skills" ? t("editor.entryItem.skillsPlaceholder") : t("editor.entryItem.languagesPlaceholder")}
          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <input
          type="text"
          value={(entry.meta?.level as string) || ""}
          onChange={(e) =>
            updateEntry(sectionId, entry.id, {
              meta: { ...entry.meta, level: e.target.value },
            })
          }
          placeholder={t("editor.entryItem.levelPlaceholder")}
          className="w-28 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={() => deleteEntry(sectionId, entry.id)}
          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Full layout for Experience, Education, Projects, Custom
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 group hover:border-white/10 transition-all ${
        isDragging ? "opacity-40 ring-2 ring-blue-500 z-10" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-slate-300"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={entry.title}
            onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
            placeholder={sectionType === "education" ? t("editor.entryItem.titleEducationPlaceholder") : t("editor.entryItem.titleWorkPlaceholder")}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={handleTranslateTitle}
            disabled={isTranslatingTitle || !entry.title}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
            title={t("editor.entryItem.translateTitle")}
          >
            {isTranslatingTitle ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => deleteEntry(sectionId, entry.id)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title={t("editor.entryItem.deleteRecord")}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Building className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={entry.subtitle}
            onChange={(e) => updateEntry(sectionId, entry.id, { subtitle: e.target.value })}
            placeholder={sectionType === "education" ? t("editor.entryItem.subtitleEducationPlaceholder") : t("editor.entryItem.subtitleWorkPlaceholder")}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={entry.location}
            onChange={(e) => updateEntry(sectionId, entry.id, { location: e.target.value })}
            placeholder={t("editor.entryItem.locationPlaceholder")}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="relative">
          <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={entry.dateStart || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { dateStart: e.target.value })}
            placeholder={t("editor.entryItem.dateStartPlaceholder")}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              disabled={entry.isCurrent}
              value={entry.isCurrent ? "" : entry.dateEnd || ""}
              onChange={(e) => updateEntry(sectionId, entry.id, { dateEnd: e.target.value })}
              placeholder={entry.isCurrent ? t("editor.entryItem.isCurrentLabel") : t("editor.entryItem.dateEndPlaceholder")}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-40"
            />
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={entry.isCurrent}
              onChange={(e) => updateEntry(sectionId, entry.id, { isCurrent: e.target.checked })}
              className="rounded bg-slate-900 border-white/20 text-blue-600 focus:ring-0"
            />
            <span>{t("editor.entryItem.isCurrentLabel")}</span>
          </label>
        </div>
      </div>

      {/* Description bullets */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-medium text-slate-400">
            {t("editor.entryItem.descriptionBulletsLabel")}
          </label>
          <button
            type="button"
            onClick={handleTranslateDescription}
            disabled={isTranslatingDesc || !entry.description}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isTranslatingDesc ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
            <span>{t("editor.entryItem.aiBulletTranslate")}</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={entry.description}
          onChange={(e) => updateEntry(sectionId, entry.id, { description: e.target.value })}
          placeholder="- Yüksek performanslı API servisleri geliştirdi&#10;- Ekip liderliği ve mimari tasarım sorumluluğu üstlendi"
          className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
        />
      </div>
    </div>
  );
};
