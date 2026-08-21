import React from "react";
import { X, Briefcase, GraduationCap, Wrench, Languages, Award, FolderGit2, Layers } from "lucide-react";
import type { SectionType } from "../../types/cv";
import { useCVStore } from "../../store/useCVStore";
import { useTranslation } from "../../i18n";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ isOpen, onClose }) => {
  const { addSection, setActivePanel } = useCVStore();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const sectionOptions: { type: SectionType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: "experience",
      label: t("addSection.experience.label"),
      desc: t("addSection.experience.desc"),
      icon: <Briefcase className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      type: "education",
      label: t("addSection.education.label"),
      desc: t("addSection.education.desc"),
      icon: <GraduationCap className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      type: "skills",
      label: t("addSection.skills.label"),
      desc: t("addSection.skills.desc"),
      icon: <Wrench className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      type: "languages",
      label: t("addSection.languages.label"),
      desc: t("addSection.languages.desc"),
      icon: <Languages className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      type: "certifications",
      label: t("addSection.certifications.label"),
      desc: t("addSection.certifications.desc"),
      icon: <Award className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      type: "projects",
      label: t("addSection.projects.label"),
      desc: t("addSection.projects.desc"),
      icon: <FolderGit2 className="w-4 h-4 text-[var(--accent)]" />,
    },
    {
      type: "custom",
      label: t("addSection.custom.label"),
      desc: t("addSection.custom.desc"),
      icon: <Layers className="w-4 h-4 text-[var(--accent)]" />,
    },
  ];

  const handleSelect = async (type: SectionType, label: string) => {
    await addSection(type, label);
    if (["experience", "education", "skills"].includes(type)) {
      setActivePanel(type);
    } else {
      const state = useCVStore.getState();
      const lastSec = (state.cv?.sections || []).slice(-1)[0];
      if (lastSec) setActivePanel(lastSec.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg p-5 rounded-[var(--radius-lg)] bg-[var(--modal-bg)] border border-[var(--border-strong)] shadow-2xl space-y-4 text-[var(--ink)] transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div>
            <h2 className="text-[16px] font-bold m-0 text-[var(--ink)]">{t("addSection.title")}</h2>
            <p className="text-[12px] text-[var(--ink-secondary)] mt-0.5">
              {t("addSection.subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--border)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-1">
          {sectionOptions.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleSelect(opt.type, opt.label)}
              className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--modal-card)] hover:bg-[var(--modal-card-hover)] border border-[var(--border)] text-left transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-[var(--panel-solid)] border border-[var(--border)] shadow-xs">
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12.5px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  {opt.label}
                </h3>
                <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5 leading-snug">
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
