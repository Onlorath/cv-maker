import React, { useEffect, useRef, useState } from "react";
import type { CVData, CVEntry, CVSection } from "../../types/cv";
import { useTranslation, getSectionDisplayTitle } from "../../i18n";

interface ResumeSheetProps {
  cv: CVData;
}

function cleanUrlDisplay(url: string): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

function getHref(value: string, type: "email" | "phone" | "url"): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (type === "email") {
    return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  }
  if (type === "phone") {
    return `tel:${trimmed.replace(/\s+/g, "")}`;
  }
  if (type === "url") {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }
  return trimmed;
}

function parseBullets(text: string): string[] {
  if (!text) return [];
  const lines = text.split("\n");
  const bullets: string[] = [];
  let currentBullet = "";

  const isBulletStart = (line: string) => /^[-*•]\s*/.test(line.trim());
  const hasAnyBullets = lines.some((l) => isBulletStart(l));

  if (!hasAnyBullets) {
    return lines.map((l) => l.trim()).filter(Boolean);
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (currentBullet) {
        bullets.push(currentBullet);
        currentBullet = "";
      }
      continue;
    }

    if (isBulletStart(trimmed)) {
      if (currentBullet) {
        bullets.push(currentBullet);
      }
      currentBullet = trimmed.replace(/^[-*•]\s*/, "");
    } else {
      if (currentBullet) {
        currentBullet += " " + trimmed;
      } else {
        currentBullet = trimmed;
      }
    }
  }

  if (currentBullet) {
    bullets.push(currentBullet);
  }

  return bullets;
}

function formatDateRange(entry: CVEntry, presentLabel: string): string {
  const start = entry.dateStart ?? "";
  const end = entry.isCurrent ? presentLabel : entry.dateEnd ?? "";
  if (!start && !end) return "";
  return `${start} — ${end}`;
}

const BulletList = ({ text }: { text: string }) => {
  const lines = parseBullets(text);
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

const SkillsList = ({ entries }: { entries: CVEntry[] }) => {
  const hasCategories = entries.some(
    (e) => (e.description || "").trim().length > 0 || (e.title || "").includes(":")
  );

  if (hasCategories) {
    return (
      <div className="rs-skills-categories space-y-1.5 pt-0.5">
        {entries.map((e) => {
          const category = e.title ? `${e.title}: ` : "";
          const skillsText = e.description || "";
          return (
            <div key={e.id} className="rs-skill-category-row text-[11px] leading-snug">
              {e.title && <span className="font-bold text-[#0f172a]">{category}</span>}
              <span className="text-[#334155]">{skillsText || e.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

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

const Section = ({ section, lang }: { section: CVSection; lang: "tr" | "en" }) => {
  const entries = section.entries || [];
  const sortedEntries = [...entries].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  if (section.sectionType === "skills") {
    return (
      <div className="rs-section" data-key={section.id}>
        <h2 className="rs-section-title">{getSectionDisplayTitle(section, lang)}</h2>
        <SkillsList entries={sortedEntries} />
      </div>
    );
  }

  if (section.sectionType === "languages") {
    return (
      <div className="rs-section" data-key={section.id}>
        <h2 className="rs-section-title">{getSectionDisplayTitle(section, lang)}</h2>
        <ChipList entries={sortedEntries} />
      </div>
    );
  }

  return (
    <div className="rs-section" data-key={section.id}>
      <h2 className="rs-section-title">{getSectionDisplayTitle(section, lang)}</h2>
      {sortedEntries.map((entry) => (
        <StandardEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export const ResumeSheet: React.FC<ResumeSheetProps> = ({ cv }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5647);

  useEffect(() => {
    if (!containerRef.current) return;
    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // Leave 20px padding (10px on each side)
      const availableWidth = entry.contentRect.width - 20;
      let newScale = availableWidth / 595;
      if (newScale > 1) newScale = 1;
      if (newScale < 0.2) newScale = 0.2;

      // Round to 3 decimal places to prevent subpixel layout oscillations
      newScale = Math.round(newScale * 1000) / 1000;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setScale((prev) => (Math.abs(prev - newScale) > 0.005 ? newScale : prev));
      });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const sheetHeight = 842;
  const scaledHeight = sheetHeight * scale;
  const marginBottom = -(sheetHeight - scaledHeight);

  const sortedSections = [...(cv.sections || [])].sort((a, b) =>
    (a.orderKey || "").localeCompare(b.orderKey || "")
  );

  const contactItems: { text: string; href?: string }[] = [];
  if (cv.email) {
    contactItems.push({ text: cv.email, href: getHref(cv.email, "email") });
  }
  if (cv.phone) {
    contactItems.push({ text: cv.phone, href: getHref(cv.phone, "phone") });
  }
  if (cv.location) {
    contactItems.push({ text: cv.location });
  }
  if (cv.linkedin) {
    contactItems.push({ text: cleanUrlDisplay(cv.linkedin), href: getHref(cv.linkedin, "url") });
  }
  if (cv.github) {
    contactItems.push({ text: cleanUrlDisplay(cv.github), href: getHref(cv.github, "url") });
  }
  if (cv.website) {
    contactItems.push({ text: cleanUrlDisplay(cv.website), href: getHref(cv.website, "url") });
  }

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
              {contactItems.map((item, i) =>
                item.href ? (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rs-contact-item hover:text-[#0284c7] hover:underline transition-colors"
                  >
                    {item.text}
                  </a>
                ) : (
                  <span key={i} className="rs-contact-item">
                    {item.text}
                  </span>
                )
              )}
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
          <Section
            key={section.id}
            section={section}
            lang={(cv.language || "tr") as "tr" | "en"}
          />
        ))}
      </div>
    </div>
  );
};
