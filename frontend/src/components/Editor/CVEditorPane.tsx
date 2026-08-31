import React from "react";
import { useCVStore } from "../../store/useCVStore";
import { PersonalDetailsPanel } from "./PersonalDetailsPanel";
import { SummaryPanel } from "./SummaryPanel";
import { ExperiencePanel } from "./ExperiencePanel";
import { EducationPanel } from "./EducationPanel";
import { SkillsPanel } from "./SkillsPanel";
import { GenericSectionPanel } from "./GenericSectionPanel";

export const CVEditorPane: React.FC = () => {
  const hasCV = useCVStore((state) => state.cv !== null);
  const activePanel = useCVStore((state) => state.activePanel);
  const rawSections = useCVStore((state) => state.cv?.sections);
  const sections = rawSections || [];

  if (!hasCV) return null;

  const renderActivePanel = () => {
    switch (activePanel) {
      case "personal":
        return <PersonalDetailsPanel />;
      case "summary":
        return <SummaryPanel />;
      case "experience":
        return <ExperiencePanel />;
      case "education":
        return <EducationPanel />;
      case "skills":
        return <SkillsPanel />;
      default: {
        // Look up by section ID
        const matchedSec = sections.find((s) => s.id === activePanel);
        if (matchedSec) {
          if (matchedSec.sectionType === "experience") return <ExperiencePanel />;
          if (matchedSec.sectionType === "education") return <EducationPanel />;
          if (matchedSec.sectionType === "skills") return <SkillsPanel />;
          return <GenericSectionPanel key={matchedSec.id} section={matchedSec} />;
        }
        return <PersonalDetailsPanel />;
      }
    }

  };

  return (
    <main className="flex-1 h-full p-6 md:p-7 overflow-y-auto custom-scrollbar bg-[var(--panel-solid)] transition-colors">
      <div className="max-w-2xl mx-auto">
        {renderActivePanel()}
      </div>
    </main>
  );
};
