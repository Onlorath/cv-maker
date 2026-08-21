import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";

export const SkillsPanel: React.FC = () => {
  const { cv, addSection, addEntry, deleteEntry } = useCVStore();
  const { t } = useTranslation();
  const [skillInput, setSkillInput] = useState("");

  if (!cv) return null;

  const skillsSection = (cv.sections || []).find((s) => s.sectionType === "skills");
  const entries = skillsSection?.entries || [];

  const handleAddSkill = async () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (!skillsSection) {
      await addSection("skills", t("sidebar.skills"));
      const updatedCv = useCVStore.getState().cv;
      const newSec = (updatedCv?.sections || []).find((s) => s.sectionType === "skills");
      if (newSec) {
        await addEntry(newSec.id, trimmed);
      }
    } else {
      await addEntry(skillsSection.id, trimmed);
    }
    setSkillInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <section className="animate-fade-in space-y-4">
      <div>
        <h1 className="text-[19px] font-bold text-[var(--ink)] m-0 tracking-[-0.2px]">
          {t("editor.skills.title")}
        </h1>
        <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 mb-4">
          {t("editor.skills.subtitle")}
        </p>
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("editor.skills.inputPlaceholder")}
          className="native-input flex-1"
        />
        <button
          type="button"
          onClick={handleAddSkill}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-[var(--radius-sm)] text-[12.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t("common.add")}</span>
        </button>
      </div>

      {/* Chips Container */}
      <div className="flex flex-wrap gap-2 pt-2">
        {entries.map((entry) => (
          <span
            key={entry.id}
            className="inline-flex items-center gap-1.5 bg-[var(--panel-chip)] border border-[var(--border)] rounded-full pl-3 pr-1.5 py-1 text-[12.5px] text-[var(--ink)] shadow-xs transition-colors"
          >
            <span>{entry.title}</span>
            <button
              type="button"
              onClick={() => deleteEntry(skillsSection!.id, entry.id)}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] transition-colors cursor-pointer"
              aria-label={t("editor.skills.removeChip")}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {entries.length === 0 && (
          <p className="text-[12px] text-[var(--ink-faint)] italic">
            {t("editor.skills.emptyText")}
          </p>
        )}
      </div>
    </section>
  );
};
