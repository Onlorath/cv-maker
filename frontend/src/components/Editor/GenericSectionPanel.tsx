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
              <div className="flex-1">
                <label className="field-label">{t("editor.generic.titlePlaceholder")}</label>
                <input
                  type="text"
                  value={entry.title || ""}
                  onChange={(e) => updateEntry(section.id, entry.id, { title: e.target.value })}
                  placeholder={t("editor.generic.titlePlaceholder")}
                  className="native-input font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={() => deleteEntry(section.id, entry.id)}
                className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 rounded transition-colors cursor-pointer self-start mt-4"
                title={t("editor.generic.deleteEntry")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="field-label">{t("editor.generic.subtitlePlaceholder")}</label>
                <input
                  type="text"
                  value={entry.subtitle || ""}
                  onChange={(e) => updateEntry(section.id, entry.id, { subtitle: e.target.value })}
                  placeholder={t("editor.generic.subtitlePlaceholder")}
                  className="native-input"
                />
              </div>

              <div>
                <label className="field-label">{t("editor.generic.dateStart")}</label>
                <input
                  type="text"
                  value={entry.dateStart || ""}
                  onChange={(e) => updateEntry(section.id, entry.id, { dateStart: e.target.value })}
                  placeholder={t("editor.generic.dateStartPlaceholder")}
                  className="native-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label m-0">{t("editor.generic.dateEnd")}</label>
                  <label className="text-[10px] text-[var(--ink-secondary)] flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entry.isCurrent}
                      onChange={(e) => updateEntry(section.id, entry.id, { isCurrent: e.target.checked })}
                      className="rounded"
                    />
                    <span>{t("editor.generic.isCurrent")}</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={entry.isCurrent}
                  value={entry.isCurrent ? "" : entry.dateEnd || ""}
                  onChange={(e) => updateEntry(section.id, entry.id, { dateEnd: e.target.value })}
                  placeholder={entry.isCurrent ? t("editor.generic.isCurrent") : t("editor.generic.dateEndPlaceholder")}
                  className="native-input disabled:opacity-50 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="field-label">{t("editor.generic.descriptionPlaceholder")}</label>
              <textarea
                rows={2}
                value={entry.description || ""}
                onChange={(e) => updateEntry(section.id, entry.id, { description: e.target.value })}
                placeholder={t("editor.generic.descriptionPlaceholder")}
                className="native-textarea"
              />
            </div>
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
