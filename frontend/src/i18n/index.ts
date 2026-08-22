import { useCallback } from "react";
import { useCVStore } from "../store/useCVStore";
import { tr } from "./locales/tr";
import { en } from "./locales/en";
import type { TranslationKey, InterpolationParams, Language } from "./types";

const dictionaries = { tr, en };

// Helper to get nested value by dot path
function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

// Format string with {param} interpolation
export function formatTranslation(
  template: string,
  params?: InterpolationParams
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

// Direct translate helper function
export function translate(
  key: TranslationKey,
  lang: Language = "tr",
  params?: InterpolationParams
): string {
  const dict = dictionaries[lang] || dictionaries.tr;
  const value = getNestedValue(dict, key) || getNestedValue(dictionaries.tr, key) || key;
  return formatTranslation(value, params);
}

// React Hook for components
export function useTranslation() {
  const lang = useCVStore((state) => (state.cv?.language || "tr")) as Language;

  const t = useCallback(
    (key: TranslationKey, params?: InterpolationParams): string => {
      return translate(key, lang, params);
    },
    [lang]
  );

  return { t, lang, isEn: lang === "en", isTr: lang === "tr" };
}

import type { CVSection } from "../types/cv";

type SectionHeadingKey = keyof typeof tr.sectionHeadings;

const standardTitleToKey: Record<string, SectionHeadingKey> = {
  // Experience
  "deneyim": "experience",
  "i̇ş deneyimi": "experience",
  "iş deneyimi": "experience",
  "is deneyimi": "experience",
  "experience": "experience",
  "work experience": "experience",
  "professional experience": "experience",

  // Education
  "eğitim": "education",
  "egitim": "education",
  "education": "education",
  "academic background": "education",

  // Skills
  "yetenekler": "skills",
  "teknik yetenekler": "skills",
  "beceriler": "skills",
  "skills": "skills",
  "technical skills": "skills",
  "core competencies": "skills",

  // Languages
  "diller": "languages",
  "yabancı diller": "languages",
  "yabanci diller": "languages",
  "languages": "languages",

  // Certifications
  "sertifikalar": "certifications",
  "sertifikalar & lisanslar": "certifications",
  "certifications": "certifications",
  "certificates": "certifications",
  "certifications & licenses": "certifications",

  // Projects
  "projeler": "projects",
  "kişisel projeler": "projects",
  "kisisel projeler": "projects",
  "projects": "projects",
  "personal projects": "projects",
  "featured projects": "projects",

  // Summary
  "özet": "summary",
  "ozet": "summary",
  "profesyonel özet": "summary",
  "summary": "summary",
  "professional summary": "summary",
};

/**
 * Returns the localized display title for a section using the i18n dictionary.
 * Standard headings adapt to the active language, while user-defined custom headings are preserved.
 */
export function getSectionDisplayTitle(section: CVSection, lang: Language = "tr"): string {
  const rawTitle = (section.title || "").trim();
  const lower = rawTitle.toLowerCase();
  const normalized = lower.replace(/İ/g, "i").replace(/I/g, "ı");

  const headingKey = standardTitleToKey[lower] || standardTitleToKey[normalized];
  if (headingKey) {
    return translate(`sectionHeadings.${headingKey}` as TranslationKey, lang);
  }

  if (section.sectionType && section.sectionType !== "custom") {
    const typeKey = section.sectionType as SectionHeadingKey;
    if (tr.sectionHeadings[typeKey]) {
      if (!rawTitle || rawTitle.toUpperCase() === section.sectionType.toUpperCase()) {
        return translate(`sectionHeadings.${typeKey}` as TranslationKey, lang);
      }
    }
  }

  return rawTitle;
}

export * from "./types";
