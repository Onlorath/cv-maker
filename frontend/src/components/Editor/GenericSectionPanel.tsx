import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import type { CVSection } from "../../types/cv";

interface GenericSectionPanelProps {
  section: CVSection;
}

export const GenericSectionPanel: React.FC<GenericSectionPanelProps> = ({ section }) => {
  const { updateSectionTitle, addEntry, updateEntry, deleteEntry } = useCVStore();
  const { t } = useTranslation();
  const entries = section.entries || [];

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

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 bg-[var(--panel-card)] space-y-2.5 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={entry.title || ""}
                onChange={(e) => updateEntry(section.id, entry.id, { title: e.target.value })}
                placeholder={t("editor.generic.titlePlaceholder")}
                className="native-input flex-1 font-semibold"
              />
              <button
                type="button"
                onClick={() => deleteEntry(section.id, entry.id)}
                className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 rounded transition-colors cursor-pointer"
                title={t("editor.generic.deleteEntry")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={entry.subtitle || ""}
                onChange={(e) => updateEntry(section.id, entry.id, { subtitle: e.target.value })}
                placeholder={t("editor.generic.subtitlePlaceholder")}
                className="native-input"
              />
              <input
                type="text"
                value={entry.dateStart || ""}
                onChange={(e) => updateEntry(section.id, entry.id, { dateStart: e.target.value })}
                placeholder={t("editor.generic.datePlaceholder")}
                className="native-input"
              />
            </div>

            <textarea
              rows={2}
              value={entry.description || ""}
              onChange={(e) => updateEntry(section.id, entry.id, { description: e.target.value })}
              placeholder={t("editor.generic.descriptionPlaceholder")}
              className="native-textarea"
            />
          </div>
        ))}
      </div>

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
