import { create } from "zustand";
import type { CVData, CVSection, CVEntry, SectionType } from "../types/cv";
import { WailsBridge } from "../lib/wailsBridge";
import { translate } from "../i18n";
import { toast } from "sonner";

export type TranslationState = "idle" | "translating" | "success" | "error";

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
  translateField: (key: string, fieldType: "summary" | "bullet" | "title", text: string, onTranslated: (res: string) => void) => Promise<void>;

  // UI Control
  activePanel: string;
  setActivePanel: (panel: string) => void;
  setActiveSection: (id: string | null) => void;
  setActiveEntry: (id: string | null) => void;
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

export const useCVStore = create<CVStore>((set, get) => ({
  cv: null,
  isLoading: true,
  activeSectionId: null,
  activeEntryId: null,
  activePanel: "personal",
  previewZoom: 1.0,
  previewLanguage: "tr",
  translationState: {},
  translationNote: null,
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
    WailsBridge.updateCV(updatedCV).catch((err) => {
      toast.error(translate("store.titleUpdateError", lang), { description: String(err) });
    });
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
    WailsBridge.updateSection(updated).catch((err) => {
      toast.error(translate("store.sectionTitleUpdateError", lang), { description: String(err) });
    });
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
    const lang = (cv?.language || "tr") as "tr" | "en";
    set((state) => ({
      cv: state.cv ? { ...state.cv, sections: newSections } : null,
    }));
    // Persist order keys
    for (let i = 0; i < newSections.length; i++) {
      const sec = newSections[i];
      const key = `a${i}`;
      if (sec.orderKey !== key) {
        sec.orderKey = key;
        WailsBridge.reorderSection(sec.id, key).catch((err) => {
          toast.error(translate("store.reorderSaveError", lang), { description: String(err) });
        });
      }
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

    const updatedEntry: CVEntry = { ...entry, ...fields };

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

    WailsBridge.updateEntry(updatedEntry).catch((err) => {
      toast.error(translate("store.entryUpdateError", lang), { description: String(err) });
    });
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
    const lang = (cv?.language || "tr") as "tr" | "en";
    set((state) => ({
      cv: state.cv
        ? {
            ...state.cv,
            sections: (state.cv.sections || []).map((s) =>
              s.id === sectionId ? { ...s, entries: newEntries } : s
            ),
          }
        : null,
    }));
    for (let i = 0; i < newEntries.length; i++) {
      const ent = newEntries[i];
      const key = `a${i}`;
      if (ent.orderKey !== key) {
        ent.orderKey = key;
        WailsBridge.reorderEntry(ent.id, key).catch((err) => {
          toast.error(translate("store.reorderSaveError", lang), { description: String(err) });
        });
      }
    }
  },

  translateField: async (key, fieldType, text, onTranslated) => {
    if (!text.trim()) return;
    const { cv } = get();
    const lang = (cv?.language || "tr") as "tr" | "en";
    set((state) => ({
      translationState: { ...state.translationState, [key]: "translating" },
    }));

    try {
      const res = await WailsBridge.translateCV({
        sourceLanguage: "tr",
        targetLanguage: "en",
        fieldType,
        text,
      });

      if (res.translatedText) {
        onTranslated(res.translatedText);
      }
      set((state) => ({
        translationState: { ...state.translationState, [key]: "success" },
        translationNote: res.note || null,
      }));

      setTimeout(() => {
        set((state) => ({
          translationState: { ...state.translationState, [key]: "idle" },
        }));
      }, 2500);
    } catch (err: any) {
      toast.error(translate("store.translationFailed", lang), { description: String(err) });
      set((state) => ({
        translationState: { ...state.translationState, [key]: "error" },
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
  setPreviewZoom: (zoom) =>
    set((state) => ({
      previewZoom: typeof zoom === "function" ? zoom(state.previewZoom) : zoom,
    })),
  toggleLanguage: () =>
    set((state) => ({
      previewLanguage: state.previewLanguage === "tr" ? "en" : "tr",
    })),
}));
