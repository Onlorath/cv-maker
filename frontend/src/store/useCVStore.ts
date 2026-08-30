import { create } from "zustand";
import type { CVData, CVSection, CVEntry, SectionType } from "../types/cv";
import { WailsBridge } from "../lib/wailsBridge";
import { translate } from "../i18n";
import { toast } from "sonner";
import { debounce } from "../lib/cvUtils";

export type TranslationState =
  | "idle"
  | "translating"
  | "translating-en"
  | "translating-tr"
  | "success"
  | "error";

interface CVStore {
  cv: CVData | null;
  isLoading: boolean;
  activeSectionId: string | null;
  activeEntryId: string | null;
  previewZoom: number;
  previewLanguage: "tr" | "en";
  translationState: Record<string, TranslationState>; // key: entryId or 'summary'
  translationNote: string | null;
  theme: "light" | "dark";

  // Actions
  loadCV: (id?: string) => Promise<void>;
  updateHeader: (fields: Partial<Omit<CVData, "sections" | "id">>) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  
  // Section Actions
  addSection: (type: SectionType, title: string) => Promise<void>;
  updateSectionTitle: (sectionId: string, title: string) => void;
  deleteSection: (sectionId: string) => Promise<void>;
  reorderSections: (newSections: CVSection[]) => Promise<void>;
  
  // Entry Actions
  addEntry: (sectionId: string, title?: string) => Promise<void>;
  updateEntry: (sectionId: string, entryId: string, fields: Partial<CVEntry>) => void;
  deleteEntry: (sectionId: string, entryId: string) => Promise<void>;
  reorderEntries: (sectionId: string, newEntries: CVEntry[]) => Promise<void>;

  // AI Translation Action
  isTranslatingFullCV: boolean;
  lastTranslationSnapshot: {
    originalCV: CVData;
    mode: "clone" | "update";
    createdCloneId?: string;
  } | null;
  translateFullCV: (targetLanguage: "en" | "tr", mode: "clone" | "update") => Promise<void>;
  undoTranslation: () => Promise<void>;
  translateField: (
    key: string,
    fieldType: "summary" | "bullet" | "title",
    text: string,
    onTranslated: (res: string) => void,
    targetLanguage?: "en" | "tr",
    sourceLanguage?: "tr" | "en" | "auto"
  ) => Promise<void>;

  // UI Control
  activePanel: string;
  setActivePanel: (panel: string) => void;
  setActiveSection: (id: string | null) => void;
  setActiveEntry: (id: string | null) => void;
  isCompactMode: boolean;
  setIsCompactMode: (compact: boolean) => void;
  setPreviewZoom: (zoom: number | ((prev: number) => number)) => void;
  toggleLanguage: () => void;
}

// Generate fractional index helper
export function generateOrderKey(prevKey?: string, nextKey?: string): string {
  if (!prevKey && !nextKey) return "a0";
  if (!prevKey && nextKey) return `${String.fromCharCode(nextKey.charCodeAt(0) - 1 || 97)}0`;
  if (prevKey && !nextKey) return `${prevKey}z`;
  return `${prevKey}m`;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cvmaker_theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      document.documentElement.classList.toggle("dark", saved === "dark");
      document.documentElement.setAttribute("data-theme", saved);
      return saved;
    }
  }
  return "light";
};

const applyThemeToDOM = (theme: "light" | "dark") => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cvmaker_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);
  }
};

const debouncedUpdateCV = debounce((cv: CVData, lang: "tr"|"en") => {
  WailsBridge.updateCV(cv).catch((err) => {
    toast.error(translate("store.titleUpdateError", lang), { description: String(err) });
  });
}, 500);

const debouncedUpdateSection = debounce((section: CVSection, lang: "tr"|"en") => {
  WailsBridge.updateSection(section).catch((err) => {
    toast.error(translate("store.sectionTitleUpdateError", lang), { description: String(err) });
  });
}, 500);

const debouncedUpdateEntry = debounce((entry: CVEntry, lang: "tr"|"en") => {
  WailsBridge.updateEntry(entry).catch((err) => {
    toast.error(translate("store.entryUpdateError", lang), { description: String(err) });
  });
}, 500);

export const useCVStore = create<CVStore>((set, get) => ({
  cv: null,
  isLoading: true,
  activeSectionId: null,
  activeEntryId: null,
  activePanel: "personal",
  previewZoom: 1.0,
  previewLanguage: "tr",
  isCompactMode: false,
  translationState: {},
  translationNote: null,
  lastTranslationSnapshot: null,
  theme: getInitialTheme(),

  setTheme: (theme: "light" | "dark") => {
    applyThemeToDOM(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyThemeToDOM(next);
    set({ theme: next });
  },

  loadCV: async (id?: string) => {
    set({ isLoading: true });
    try {
      const cvs = await WailsBridge.listCVs();
      let currentCV: CVData;
      if (id) {
        currentCV = await WailsBridge.getCV(id);
      } else if (cvs && cvs.length > 0) {
        currentCV = await WailsBridge.getCV(cvs[0].id);
      } else {
        currentCV = await WailsBridge.createCV({
          title: "My Resume",
          language: "tr",
          fullName: "Adınız Soyadınız",
          email: "ornek@email.com",
        });
      }
      set({ cv: currentCV, isLoading: false, previewLanguage: currentCV?.language || "tr" });
    } catch (err) {
      console.error("Failed to load CV:", err);
      set({ isLoading: false, translationNote: "HATA: " + String(err) });
    }
  },

  updateHeader: (fields) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const updatedCV: CVData = { ...cv, ...fields };
    set({ cv: updatedCV });
    debouncedUpdateCV(updatedCV, lang);
  },

  addSection: async (type, title) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const sections = cv.sections || [];
    const lastSection = sections[sections.length - 1];
    const orderKey = generateOrderKey(lastSection?.orderKey, undefined);

    try {
      const newSec = await WailsBridge.createSection({
        cvId: cv.id,
        sectionType: type,
        title: title || type.toUpperCase(),
        orderKey,
      });

      set((state) => ({
        cv: state.cv ? { ...state.cv, sections: [...(state.cv.sections || []), newSec] } : null,
        activeSectionId: newSec.id,
      }));
    } catch (err) {
      toast.error(translate("store.sectionAddError", lang), { description: String(err) });
    }
  },

  updateSectionTitle: (sectionId, title) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const sections = cv.sections || [];
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const updated = { ...section, title };
    set((state) => ({
      cv: state.cv
        ? {
            ...state.cv,
            sections: (state.cv.sections || []).map((s) => (s.id === sectionId ? updated : s)),
          }
        : null,
    }));
    debouncedUpdateSection(updated, lang);
  },

  deleteSection: async (sectionId) => {
    const { cv } = get();
    const lang = (cv?.language || "tr") as "tr" | "en";
    try {
      await WailsBridge.deleteSection(sectionId);
      set((state) => ({
        cv: state.cv
          ? {
              ...state.cv,
              sections: (state.cv.sections || []).filter((s) => s.id !== sectionId),
            }
          : null,
        activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId,
      }));
      toast.success(translate("store.sectionDeleteSuccess", lang));
    } catch (err) {
      toast.error(translate("store.sectionDeleteError", lang), { description: String(err) });
    }
  },

  reorderSections: async (newSections) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const updatedSections = newSections.map((sec, i) => ({
      ...sec,
      orderKey: `a${i}`,
    }));
    set((state) => ({
      cv: state.cv ? { ...state.cv, sections: updatedSections } : null,
    }));
    // Persist order keys sequentially to avoid database concurrency locks
    try {
      for (let i = 0; i < updatedSections.length; i++) {
        const sec = updatedSections[i];
        const orig = cv.sections?.find((s) => s.id === sec.id);
        if (!orig || orig.orderKey !== sec.orderKey) {
          await WailsBridge.reorderSection(sec.id, sec.orderKey);
        }
      }
    } catch (err) {
      console.error("Failed to persist section order:", err);
      toast.error(translate("store.reorderSaveError", lang), { description: String(err) });
    }
  },

  addEntry: async (sectionId, title) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const sections = cv.sections || [];
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const entries = section.entries || [];
    const lastEntry = entries[entries.length - 1];
    const orderKey = generateOrderKey(lastEntry?.orderKey, undefined);

    try {
      const newEntry = await WailsBridge.createEntry({
        sectionId,
        orderKey,
        title: title || "",
      });

      set((state) => ({
        cv: state.cv
          ? {
              ...state.cv,
              sections: (state.cv.sections || []).map((s) =>
                s.id === sectionId ? { ...s, entries: [...(s.entries || []), newEntry] } : s
              ),
            }
          : null,
        activeEntryId: newEntry.id,
      }));
    } catch (err) {
      toast.error(translate("store.entryAddError", lang), { description: String(err) });
    }
  },

  updateEntry: (sectionId, entryId, fields) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const sections = cv.sections || [];
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const entries = section.entries || [];
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const updatedEntry: CVEntry = {
      ...entry,
      ...fields,
      meta: fields.meta !== undefined ? { ...(entry.meta || {}), ...fields.meta } : entry.meta,
    };

    set((state) => ({
      cv: state.cv
        ? {
            ...state.cv,
            sections: (state.cv.sections || []).map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    entries: (s.entries || []).map((e) => (e.id === entryId ? updatedEntry : e)),
                  }
                : s
            ),
          }
        : null,
    }));

    debouncedUpdateEntry(updatedEntry, lang);
  },

  deleteEntry: async (sectionId, entryId) => {
    const { cv } = get();
    const lang = (cv?.language || "tr") as "tr" | "en";
    try {
      await WailsBridge.deleteEntry(entryId);
      set((state) => ({
        cv: state.cv
          ? {
              ...state.cv,
              sections: (state.cv.sections || []).map((s) =>
                s.id === sectionId ? { ...s, entries: (s.entries || []).filter((e) => e.id !== entryId) } : s
              ),
            }
          : null,
        activeEntryId: state.activeEntryId === entryId ? null : state.activeEntryId,
      }));
      toast.success(translate("store.entryDeleteSuccess", lang));
    } catch (err) {
      toast.error(translate("store.entryDeleteError", lang), { description: String(err) });
    }
  },

  reorderEntries: async (sectionId, newEntries) => {
    const { cv } = get();
    if (!cv) return;
    const lang = (cv.language || "tr") as "tr" | "en";
    const updatedEntries = newEntries.map((ent, i) => ({
      ...ent,
      orderKey: `a${i}`,
    }));
    set((state) => ({
      cv: state.cv
        ? {
            ...state.cv,
            sections: (state.cv.sections || []).map((s) =>
              s.id === sectionId ? { ...s, entries: updatedEntries } : s
            ),
          }
        : null,
    }));
    try {
      for (let i = 0; i < updatedEntries.length; i++) {
        const ent = updatedEntries[i];
        const currentSec = cv.sections?.find((s) => s.id === sectionId);
        const orig = currentSec?.entries?.find((e) => e.id === ent.id);
        if (!orig || orig.orderKey !== ent.orderKey) {
          await WailsBridge.reorderEntry(ent.id, ent.orderKey);
        }
      }
    } catch (err) {
      console.error("Failed to persist entry order:", err);
      toast.error(translate("store.reorderSaveError", lang), { description: String(err) });
    }
  },

  isTranslatingFullCV: false,

  translateFullCV: async (targetLanguage, mode) => {
    const { cv, loadCV } = get();
    if (!cv) return;
    const snapshotOriginalCV = JSON.parse(JSON.stringify(cv)) as CVData;
    set({ isTranslatingFullCV: true });

    try {
      const translated = await WailsBridge.translateFullCV(cv, targetLanguage);
      if (!translated) throw new Error("Çeviri yanıtı alınamadı");

      if (mode === "clone") {
        const titleSuffix = targetLanguage === "en" ? " (EN)" : " (TR)";
        const baseTitle = cv.title.replace(/\s*\((EN|TR)\)$/i, "");
        const newTitle = `${baseTitle}${titleSuffix}`;

        const createdCV = await WailsBridge.createCV({
          title: newTitle,
          language: targetLanguage,
          fullName: cv.fullName,
          email: cv.email,
        });

        if (createdCV) {
          const fullClone: CVData = {
            ...translated,
            id: createdCV.id,
            title: newTitle,
            language: targetLanguage,
            sections: (translated.sections || []).map((sec) => ({
              ...sec,
              id: sec.id,
              cvId: createdCV.id,
              entries: (sec.entries || []).map((ent) => ({
                ...ent,
                sectionId: sec.id,
              })),
            })),
          };
          await WailsBridge.updateCV(fullClone);
          await loadCV(createdCV.id);
          set({
            cv: fullClone,
            isTranslatingFullCV: false,
            previewLanguage: targetLanguage,
            lastTranslationSnapshot: {
              originalCV: snapshotOriginalCV,
              mode: "clone",
              createdCloneId: createdCV.id,
            },
          });
          toast.success(
            targetLanguage === "en"
              ? "Full CV translated & created as a new copy!"
              : "Tüm CV çevrildi ve yeni kopya olarak oluşturuldu!"
          );
        }
      } else {
        const updated: CVData = {
          ...translated,
          id: cv.id,
          language: targetLanguage,
        };
        await WailsBridge.updateCV(updated);
        set({
          cv: updated,
          isTranslatingFullCV: false,
          previewLanguage: targetLanguage,
          lastTranslationSnapshot: {
            originalCV: snapshotOriginalCV,
            mode: "update",
          },
        });
        toast.success(
          targetLanguage === "en"
            ? "Full CV translated successfully!"
            : "Tüm CV başarıyla çevrildi!"
        );
      }
    } catch (err: any) {
      console.error("Full CV translation failed:", err);
      set({ isTranslatingFullCV: false });
      toast.error(
        targetLanguage === "en" ? "Full CV translation failed" : "Tüm CV çevirisi başarısız oldu",
        { description: String(err?.message || err) }
      );
      throw err;
    }
  },

  undoTranslation: async () => {
    const { lastTranslationSnapshot, loadCV } = get();
    if (!lastTranslationSnapshot) return;
    const { originalCV, mode, createdCloneId } = lastTranslationSnapshot;
    const lang = (originalCV.language || "tr") as "tr" | "en";

    try {
      if (mode === "clone" && createdCloneId) {
        await WailsBridge.deleteCV(createdCloneId);
        await loadCV(originalCV.id);
      } else {
        await WailsBridge.updateCV(originalCV);
        set({ cv: originalCV, previewLanguage: originalCV.language || "tr" });
      }
      set({ lastTranslationSnapshot: null });
      toast.success(translate("store.undoTranslationSuccess", lang));
    } catch (err: any) {
      console.error("Failed to undo translation:", err);
      toast.error(translate("store.undoTranslationError", lang), {
        description: String(err?.message || err),
      });
    }
  },

  translateField: async (
    key,
    fieldType,
    text,
    onTranslated,
    targetLanguage = "en",
    sourceLanguage = "auto"
  ) => {
    if (!text.trim()) return;
    const { cv } = get();
    const lang = (cv?.language || "tr") as "tr" | "en";
    const loadingState = targetLanguage === "tr" ? "translating-tr" : "translating-en";
    set((state) => ({
      translationState: {
        ...state.translationState,
        [key]: loadingState,
        [`${key}-${targetLanguage}`]: "translating",
      },
    }));

    try {
      const res = await WailsBridge.translateCV({
        sourceLanguage,
        targetLanguage,
        fieldType,
        text,
      });

      if (res.translatedText) {
        onTranslated(res.translatedText);
      }
      set((state) => ({
        translationState: {
          ...state.translationState,
          [key]: "success",
          [`${key}-${targetLanguage}`]: "idle",
        },
        translationNote: res.note || null,
      }));

      setTimeout(() => {
        set((state) => ({
          translationState: {
            ...state.translationState,
            [key]: "idle",
            [`${key}-en`]: "idle",
            [`${key}-tr`]: "idle",
          },
        }));
      }, 2000);
    } catch (err: any) {
      toast.error(translate("store.translationFailed", lang), { description: String(err) });
      set((state) => ({
        translationState: {
          ...state.translationState,
          [key]: "error",
          [`${key}-en`]: "idle",
          [`${key}-tr`]: "idle",
        },
        translationNote: err?.message || translate("store.translationFailedDesc", lang),
      }));
      setTimeout(() => {
        set((state) => ({
          translationState: { ...state.translationState, [key]: "idle" },
        }));
      }, 3000);
    }
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  setActiveSection: (id) => set({ activeSectionId: id }),
  setActiveEntry: (id) => set({ activeEntryId: id }),
  setIsCompactMode: (compact) => set({ isCompactMode: compact }),
  setPreviewZoom: (zoom) =>
    set((state) => ({
      previewZoom: typeof zoom === "function" ? zoom(state.previewZoom) : zoom,
    })),
  toggleLanguage: () =>
    set((state) => ({
      previewLanguage: state.previewLanguage === "tr" ? "en" : "tr",
    })),
}));
