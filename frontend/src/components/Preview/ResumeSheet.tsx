import React, { useEffect, useRef, useState } from "react";
import type { CVData, CVEntry, CVSection } from "../../types/cv";
import { useTranslation } from "../../i18n";

interface ResumeSheetProps {
  cv: CVData;
}

function formatDateRange(entry: CVEntry, presentLabel: string): string {
  const start = entry.dateStart ?? "";
  const end = entry.isCurrent ? presentLabel : entry.dateEnd ?? "";
  if (!start && !end) return "";
  return `${start} — ${end}`;
}

const BulletList = ({ text }: { text: string }) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*•]\s*/, ""));

  if (lines.length === 0) return null;

  return (
    <div className="rs-bullet-list">
      {lines.map((line, i) => (
        <div key={i} className="rs-bullet-row">
          <span className="rs-bullet-dot">•</span>
          <span className="rs-bullet-text">{line}</span>
        </div>
      ))}
    </div>
  );
};

const StandardEntry = ({ entry }: { entry: CVEntry }) => {
  const { t } = useTranslation();
  const dateRange = formatDateRange(entry, t("preview.present"));
  return (
    <div className="rs-entry-block">
      <div className="rs-entry-header-row">
        <span className="rs-entry-title">{entry.title || t("preview.defaultRoleDegree")}</span>
        {dateRange && <span className="rs-entry-dates">{dateRange}</span>}
      </div>
      <div className="rs-entry-header-row mt-0.5">
        <span className="rs-entry-subtitle">{entry.subtitle || " "}</span>
        {entry.location && <span className="rs-entry-location">{entry.location}</span>}
      </div>
      {entry.description && <BulletList text={entry.description} />}
    </div>
  );
};

const ChipList = ({ entries }: { entries: CVEntry[] }) => {
  return (
    <div className="rs-skills-wrap">
      {entries.map((e) => {
        const level = (e.meta?.level as string | undefined) ?? "";
        return (
          <span key={e.id} className="rs-skill-chip">
            {e.title}
            {level ? ` (${level})` : ""}
          </span>
        );
      })}
    </div>
  );
};

const Section = ({ section }: { section: CVSection }) => {
  const entries = section.entries || [];
  const sortedEntries = [...entries].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  const isChipStyle = section.sectionType === "skills" || section.sectionType === "languages";

  return (
    <div className="rs-section" data-key={section.id}>
      <h2 className="rs-section-title">{section.title}</h2>
      {isChipStyle ? (
        <ChipList entries={sortedEntries} />
      ) : (
        sortedEntries.map((entry) => (
          <StandardEntry key={entry.id} entry={entry} />
        ))
      )}
    </div>
  );
};

export const ResumeSheet: React.FC<ResumeSheetProps> = ({ cv }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5647);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Leave 20px padding (10px on each side)
        const availableWidth = entry.contentRect.width - 20;
        let newScale = availableWidth / 595;
        if (newScale > 1) newScale = 1;
        setScale(newScale);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const sheetHeight = 842;
  const scaledHeight = sheetHeight * scale;
  const marginBottom = -(sheetHeight - scaledHeight);

  const sortedSections = [...(cv.sections || [])].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  const contactParts = [
    cv.email,
    cv.phone,
    cv.location,
    cv.linkedin,
    cv.github,
    cv.website,
  ].filter(Boolean);

  return (
    <div className="resume-sheet-wrapper" ref={containerRef}>
      <div 
        className="resume-sheet" 
        style={{ 
          transform: `scale(${scale})`, 
          marginBottom: `${marginBottom}px` 
        }}
      >
        {/* Header section */}
        <div className="rs-header-row">
          <div className="rs-header-text">
            <h1 className="rs-name">{cv.fullName || t("preview.defaultName")}</h1>
            {cv.jobTitle && <p className="rs-job-title">{cv.jobTitle}</p>}
            <div className="rs-contact-row">
              {contactParts.map((part, i) => (
                <span key={i} className="rs-contact-item">
                  {part}
                </span>
              ))}
            </div>
          </div>

          {cv.photoPath && (
            <img src={cv.photoPath} alt="Profile" className="rs-photo" />
          )}
        </div>

        {/* Summary section */}
        {cv.summary && (
          <div className="rs-section" data-key="summary">
            <h2 className="rs-section-title">
              {t("preview.summaryTitle")}
            </h2>
            <p className="rs-summary-text">{cv.summary}</p>
          </div>
        )}

        {/* Dynamic Sections */}
        {sortedSections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};
