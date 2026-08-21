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

  const t = (key: TranslationKey, params?: InterpolationParams): string => {
    return translate(key, lang, params);
  };

  return { t, lang, isEn: lang === "en", isTr: lang === "tr" };
}

export * from "./types";
