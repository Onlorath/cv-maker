import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { CVData } from "../../types/cv";
import { useTranslation, getSectionDisplayTitle } from "../../i18n";
import { useCVStore } from "../../store/useCVStore";
import { cleanUrlDisplay, getHref, parseBullets, formatDateRange } from "../../lib/cvUtils";

interface ResumeSheetProps {
  cv: CVData;
  onPageCountChange?: (totalPages: number) => void;
}

interface PageItem {
  key: string;
  node: React.ReactNode;
  height: number;
}

const PAGE_USABLE_HEIGHT = 770; // 842px A4 height minus 64px padding (and 794px printable area for compact)

export const ResumeSheet: React.FC<ResumeSheetProps> = ({ cv, onPageCountChange }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5647);
  const setIsCompactMode = useCVStore((state) => state.setIsCompactMode);

  // ResizeObserver for Container Width Scaling
  useEffect(() => {
    if (!containerRef.current) return;
    let animationFrameId: number;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const availableWidth = entry.contentRect.width - 24;
      let newScale = availableWidth / 595;
      if (newScale > 1) newScale = 1;
      if (newScale < 0.2) newScale = 0.2;

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

  const lang = (cv.language || "tr") as "tr" | "en";

  // Build items function (standard or compact)
  const buildItems = useCallback(
    (isCompact: boolean): PageItem[] => {
      const items: PageItem[] = [];

      // 1. Header item
      const contactItems: { text: string; href?: string }[] = [];
      if (cv.email) contactItems.push({ text: cv.email, href: getHref(cv.email, "email") });
      if (cv.phone) contactItems.push({ text: cv.phone, href: getHref(cv.phone, "phone") });
      if (cv.location) contactItems.push({ text: cv.location });
      if (cv.linkedin) contactItems.push({ text: cleanUrlDisplay(cv.linkedin), href: getHref(cv.linkedin, "url") });
      if (cv.github) contactItems.push({ text: cleanUrlDisplay(cv.github), href: getHref(cv.github, "url") });
      if (cv.website) contactItems.push({ text: cleanUrlDisplay(cv.website), href: getHref(cv.website, "url") });

      const headerHeight = isCompact ? 92 : 110;
      items.push({
        key: "header",
        height: headerHeight,
        node: (
          <div key="header" className="rs-header-row">
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
            {cv.photoPath && <img src={cv.photoPath} alt="Profile" className="rs-photo" />}
          </div>
        ),
      });

      // 2. Summary item
      if (cv.summary) {
        const charPerLine = isCompact ? 100 : 95;
        const summaryLines = Math.ceil(cv.summary.length / charPerLine);
        const summaryHeight = isCompact
          ? 20 + summaryLines * 11.5 + 4
          : 27 + summaryLines * 13.05 + 6;

        items.push({
          key: "summary",
          height: summaryHeight,
          node: (
            <div key="summary" className="rs-section" data-key="summary">
              <h2 className="rs-section-title">{t("preview.summaryTitle")}</h2>
              <p className="rs-summary-text">{cv.summary}</p>
            </div>
          ),
        });
      }

      // 3. Dynamic Sections
      const sortedSections = [...(cv.sections || [])].sort((a, b) =>
        (a.orderKey || "").localeCompare(b.orderKey || "")
      );

      for (const section of sortedSections) {
        const entries = section.entries || [];
        const sortedEntries = [...entries].sort((a, b) =>
          (a.orderKey || "").localeCompare(b.orderKey || "")
        );

        // Section Title
        const secTitleHeight = isCompact ? 21 : 27;
        items.push({
          key: `sec-title-${section.id}`,
          height: secTitleHeight,
          node: (
            <div
              key={`sec-title-${section.id}`}
              className="rs-section"
              data-key={section.id}
              data-section-type={section.sectionType}
            >
              <h2 className="rs-section-title">{getSectionDisplayTitle(section, lang)}</h2>
            </div>
          ),
        });

        if (section.sectionType === "skills" || section.sectionType === "languages") {
          const hasCategories = section.sectionType === "skills" && sortedEntries.some(
            (e) => (e.description || "").trim().length > 0 || (e.title || "").includes(":")
          );

          if (hasCategories) {
            for (const e of sortedEntries) {
              const category = e.title ? `${e.title}: ` : "";
              const skillsText = e.description || "";
              const charPerLine = isCompact ? 85 : 80;
              const lineCount = Math.ceil((category.length + skillsText.length) / charPerLine);
              const rowHeight = isCompact
                ? Math.max(1, lineCount) * 11.5 + 1.5
                : Math.max(1, lineCount) * 12.8 + 2.5;

              items.push({
                key: `skill-${e.id}`,
                height: rowHeight,
                node: (
                  <div key={`skill-${e.id}`} className="rs-skill-category-row">
                    {e.title && <span className="rs-skill-cat-title">{category}</span>}
                    <span className="rs-skill-cat-text">{skillsText || e.title}</span>
                  </div>
                ),
              });
            }
          } else {
            const itemsPerRow = isCompact ? 6 : 5;
            const chipRows = Math.max(1, Math.ceil(sortedEntries.length / itemsPerRow));
            const chipsHeight = isCompact ? chipRows * 17 + 1.5 : chipRows * 20 + 2;

            items.push({
              key: `skills-chips-${section.id}`,
              height: chipsHeight,
              node: (
                <div key={`skills-chips-${section.id}`} className="rs-skills-wrap">
                  {sortedEntries.map((e) => {
                    const level = (e.meta?.level as string | undefined) ?? "";
                    return (
                      <span key={e.id} className="rs-skill-chip">
                        {e.title}
                        {level ? ` (${level})` : ""}
                      </span>
                    );
                  })}
                </div>
              ),
            });
          }
        } else {
          // Standard sections (experience, education, projects, custom)
          for (const entry of sortedEntries) {
            const dateRange = formatDateRange(entry, t("preview.present"));
            const entryHeadHeight = isCompact ? 26 : 34;

            // Entry header block (title, dates, subtitle, location)
            const linkUrl = (entry.meta?.link as string) || (entry.meta?.url as string) || "";
            const href = linkUrl ? getHref(linkUrl, "url") : "";
            const cleanLink = linkUrl ? cleanUrlDisplay(linkUrl) : "";

            items.push({
              key: `entry-head-${entry.id}`,
              height: entryHeadHeight,
              node: (
                <div key={`entry-head-${entry.id}`} className="rs-entry-block mb-1">
                  <div className="rs-entry-header-row">
                    <div className="flex items-baseline gap-1.5 flex-wrap min-w-0 flex-1 mr-2">
                      <span className="rs-entry-title">{entry.title || t("preview.defaultRoleDegree")}</span>
                      {cleanLink && href && (
                        <span className="text-[11px] font-normal text-[#64748b] inline-flex items-center gap-1">
                          <span>|</span>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2563eb] hover:underline inline-flex items-center gap-0.5 cursor-pointer font-medium"
                            title={href}
                          >
                            <span>{cleanLink}</span>
                            <svg
                              className="w-2.5 h-2.5 opacity-70 shrink-0 inline"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        </span>
                      )}
                    </div>
                    {dateRange && <span className="rs-entry-dates shrink-0">{dateRange}</span>}
                  </div>
                  <div className="rs-entry-header-row mt-0.5">
                    <span className="rs-entry-subtitle">{entry.subtitle || " "}</span>
                    {entry.location && <span className="rs-entry-location">{entry.location}</span>}
                  </div>
                </div>
              ),
            });

            // Bullet items
            if (entry.description) {
              const bullets = parseBullets(entry.description);
              for (let bIndex = 0; bIndex < bullets.length; bIndex++) {
                const bulletText = bullets[bIndex];
                const charPerLine = isCompact ? 90 : 85;
                const bulletLines = Math.max(1, Math.ceil(bulletText.length / charPerLine));
                const bulletHeight = isCompact
                  ? bulletLines * 11.5 + 1.5
                  : bulletLines * 12.15 + 2.5;

                items.push({
                  key: `bullet-${entry.id}-${bIndex}`,
                  height: bulletHeight,
                  node: (
                    <div key={`bullet-${entry.id}-${bIndex}`} className="rs-bullet-row">
                      <span className="rs-bullet-dot">•</span>
                      <span className="rs-bullet-text">{bulletText}</span>
                    </div>
                  ),
                });
              }
            }
          }
        }
      }

      return items;
    },
    [cv, lang, t]
  );

  // Determine pagination & compact mode
  const { pages, isCompact } = useMemo(() => {
    const standardItems = buildItems(false);
    const totalStandardHeight = standardItems.reduce((acc, item) => acc + item.height, 0);

    // Auto-Compact Spacing rule:
    // If standard height is > 770px and <= 770 * 1.30 (1001px), i.e. spills into page 2 by <= 30%,
    // apply compact mode to comfortably fit in 1 page.
    const shouldBeCompact =
      totalStandardHeight > PAGE_USABLE_HEIGHT &&
      totalStandardHeight <= PAGE_USABLE_HEIGHT * 1.3;

    const activeItems = shouldBeCompact ? buildItems(true) : standardItems;
    const usableHeight = shouldBeCompact ? 794 : PAGE_USABLE_HEIGHT; // Compact mode has smaller top/bottom padding

    // Partition items into pages
    const pageList: React.ReactNode[][] = [[]];
    let currentHeight = 0;

    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];
      const isHeading = item.key.startsWith("sec-title-") || item.key.startsWith("entry-head-");
      const lookAhead = isHeading && i + 1 < activeItems.length ? activeItems[i + 1].height : 0;

      if (
        currentHeight + item.height + lookAhead > usableHeight &&
        currentHeight > 0
      ) {
        pageList.push([item.node]);
        currentHeight = item.height;
      } else {
        pageList[pageList.length - 1].push(item.node);
        currentHeight += item.height;
      }
    }

    return { pages: pageList, isCompact: shouldBeCompact };
  }, [buildItems]);

  const totalPages = pages.length;

  useEffect(() => {
    setIsCompactMode(isCompact);
  }, [isCompact, setIsCompactMode]);

  useEffect(() => {
    onPageCountChange?.(totalPages);
  }, [totalPages, onPageCountChange]);

  const pageHeight = 842;
  const pageGap = 24;
  const totalUnscaledHeight = totalPages * pageHeight + (totalPages - 1) * pageGap;
  const scaledHeight = totalUnscaledHeight * scale;
  const marginBottom = -(totalUnscaledHeight - scaledHeight);

  return (
    <div className="resume-sheet-wrapper" ref={containerRef}>
      <div
        className="resume-sheet-container"
        style={{
          transform: `scale(${scale})`,
          marginBottom: `${marginBottom}px`,
        }}
      >
        {pages.map((pageNodes, pageIndex) => (
          <div
            key={pageIndex}
            className={`resume-sheet-page ${isCompact ? "compact-mode" : ""}`}
          >
            {pageNodes}
          </div>
        ))}
      </div>
    </div>
  );
};
