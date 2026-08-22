import React, { useState } from "react";
import { Plus, Trash2, X, Tag } from "lucide-react";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";
import type { CVEntry } from "../../types/cv";

interface SkillCategoryCardProps {
  sectionId: string;
  entry: CVEntry;
}

const SkillCategoryCard: React.FC<SkillCategoryCardProps> = ({ sectionId, entry }) => {
  const { updateEntry, deleteEntry } = useCVStore();
  const { t } = useTranslation();
  const [newSkillText, setNewSkillText] = useState("");

  // Extract skills list from entry.description (comma-separated) or entry.title fallback
  const rawSkills = entry.description ? entry.description.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const handleAddSkill = () => {
    const trimmed = newSkillText.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;

    // Support adding multiple comma-separated items at once
    const additions = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    const updatedSkills = [...rawSkills, ...additions];
    const newDescription = updatedSkills.join(", ");

    updateEntry(sectionId, entry.id, {
      description: newDescription,
    });
    setNewSkillText("");
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    const updatedSkills = rawSkills.filter((_, idx) => idx !== indexToRemove);
    updateEntry(sectionId, entry.id, {
      description: updatedSkills.join(", "),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 bg-[var(--panel-card)] space-y-3 transition-colors">
      {/* Category Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-2 flex-1">
          <Tag className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <input
            type="text"
            value={entry.title || ""}
            onChange={(e) => updateEntry(sectionId, entry.id, { title: e.target.value })}
            placeholder={t("editor.skills.categoryPlaceholder")}
            className="native-input font-bold text-[13.5px] text-[var(--ink)] flex-1 bg-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => deleteEntry(sectionId, entry.id)}
          className="p-1.5 text-[var(--ink-faint)] hover:text-rose-600 rounded transition-colors cursor-pointer"
          title={t("editor.skills.deleteCategory")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Skills Chips */}
      <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
        {rawSkills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 bg-[var(--panel-chip)] border border-[var(--border)] rounded-full pl-2.5 pr-1 py-0.5 text-[12px] text-[var(--ink)] shadow-xs transition-colors"
          >
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => handleRemoveSkill(idx)}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] transition-colors cursor-pointer"
              aria-label={t("editor.skills.removeChip")}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {rawSkills.length === 0 && (
          <span className="text-[11.5px] text-[var(--ink-faint)] italic">
            {t("editor.skills.emptyText")}
          </span>
        )}
      </div>

      {/* Input to add skills to this category */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={newSkillText}
          onChange={(e) => setNewSkillText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("editor.skills.inputPlaceholder")}
          className="native-input flex-1 text-[12.5px]"
        />
        <button
          type="button"
          onClick={handleAddSkill}
          className="bg-[var(--accent-soft-strong)] hover:bg-[var(--accent)] hover:text-white text-[var(--accent)] px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t("common.add")}</span>
        </button>
      </div>
    </div>
  );
};

export const SkillsPanel: React.FC = () => {
  const { cv, addSection, addEntry, updateEntry } = useCVStore();
  const { t } = useTranslation();

  if (!cv) return null;

  const skillsSection = (cv.sections || []).find((s) => s.sectionType === "skills");
  const entries = skillsSection?.entries || [];

  const ensureSectionAndAdd = async (categoryTitle: string, initialSkills: string = "") => {
    let secId = skillsSection?.id;
    if (!secId) {
      await addSection("skills", t("sidebar.skills"));
      const updatedCv = useCVStore.getState().cv;
      const newSec = (updatedCv?.sections || []).find((s) => s.sectionType === "skills");
      if (!newSec) return;
      secId = newSec.id;
    }

    await addEntry(secId, categoryTitle);
    if (initialSkills) {
      const updatedCv = useCVStore.getState().cv;
      const sec = (updatedCv?.sections || []).find((s) => s.id === secId);
      const newEntry = sec?.entries[sec.entries.length - 1];
      if (newEntry) {
        updateEntry(secId, newEntry.id, { description: initialSkills });
      }
    }
  };

  const quickSuggestions = [
    { label: t("editor.skills.categoryLanguages"), title: t("editor.skills.categoryLanguages") },
    { label: t("editor.skills.categoryFrameworks"), title: t("editor.skills.categoryFrameworks") },
    { label: t("editor.skills.categoryDatabases"), title: t("editor.skills.categoryDatabases") },
    { label: t("editor.skills.categoryCloud"), title: t("editor.skills.categoryCloud") },
    { label: t("editor.skills.categoryTools"), title: t("editor.skills.categoryTools") },
  ];

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

      {/* Quick Category Suggestions */}
      <div className="space-y-1.5 bg-[var(--panel-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3">
        <div className="text-[11.5px] font-semibold text-[var(--ink-faint)]">
          {t("editor.skills.quickSuggestions")}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => ensureSectionAndAdd(q.title)}
              className="text-[11.5px] bg-[var(--border)] hover:bg-[var(--accent-soft-strong)] hover:text-[var(--accent)] text-[var(--ink)] px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Cards List */}
      <div className="space-y-3">
        {skillsSection &&
          entries.map((entry) => (
            <SkillCategoryCard
              key={entry.id}
              sectionId={skillsSection.id}
              entry={entry}
            />
          ))}

        {entries.length === 0 && (
          <div className="border border-dashed border-[var(--border-strong)] rounded-[var(--radius-md)] p-6 text-center text-[var(--ink-faint)] text-[12.5px]">
            {t("editor.skills.emptyText")}
          </div>
        )}
      </div>

      {/* Add Custom Category Button */}
      <button
        type="button"
        onClick={() => ensureSectionAndAdd("")}
        className="w-full border border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] text-[var(--ink-secondary)] hover:text-[var(--accent)] rounded-[var(--radius-md)] py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{t("editor.skills.addCategory")}</span>
      </button>
    </section>
  );
};
