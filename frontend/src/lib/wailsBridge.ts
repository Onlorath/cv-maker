import type { CVData, CVSection, CVEntry, SectionType } from "../types/cv";
import { atsscore, atsmatch } from "../../wailsjs/go/models";
import { MobileStorage } from "./mobileStorage";
import { runDeterministicATSCheck } from "./mobileATSCheck";
import { MobileGemini } from "./mobileGemini";

declare global {
  interface Window {
    go?: {
      main?: {
        App?: {
          GetCV: (id: string) => Promise<CVData>;
          ListCVs: () => Promise<CVData[]>;
          CreateCV: (req: { title: string; language: string; fullName: string; email: string }) => Promise<CVData>;
          UpdateCV: (cv: CVData) => Promise<void>;
          DeleteCV: (id: string) => Promise<void>;
          CreateSection: (req: { cvId: string; sectionType: SectionType; title: string; orderKey: string }) => Promise<CVSection>;
          UpdateSection: (sec: CVSection) => Promise<void>;
          DeleteSection: (id: string) => Promise<void>;
          ReorderSection: (id: string, newOrderKey: string) => Promise<void>;
          CreateEntry: (req: { sectionId: string; orderKey: string; title: string }) => Promise<CVEntry>;
          UpdateEntry: (entry: CVEntry) => Promise<void>;
          DeleteEntry: (id: string) => Promise<void>;
          ReorderEntry: (id: string, newOrderKey: string) => Promise<void>;
          TranslateCV: (req: { sourceLanguage: string; targetLanguage: string; fieldType: string; text: string }) => Promise<{ translatedText: string; note: string }>;
          TranslateFullCV: (cv: CVData, targetLanguage: string) => Promise<CVData>;
          GetGeminiAPIKey: () => Promise<string>;
          SetGeminiAPIKey: (key: string) => Promise<void>;
          DeleteGeminiAPIKey: () => Promise<void>;
          SavePDF: (base64Data: string, suggestedFilename: string) => Promise<void>;
          ATSFormatCheck: (cv: any) => Promise<atsscore.FinalReport>;
          ATSFullCheck: (cv: any, jobDescription: string) => Promise<atsscore.FinalReport>;
        };
      };
    };
  }
}

export const WailsBridge = {
  isWailsAvailable(): boolean {
    return typeof window !== "undefined" && !!window.go?.main?.App;
  },

  async getCV(id: string): Promise<CVData> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.GetCV(id);
    }
    return await MobileStorage.getCV(id);
  },

  async listCVs(): Promise<CVData[]> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.ListCVs();
    }
    return await MobileStorage.listCVs();
  },

  async createCV(req: { title: string; language: string; fullName: string; email: string }): Promise<CVData> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.CreateCV(req);
    }
    return await MobileStorage.createCV(req);
  },

  async updateCV(cv: CVData): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.UpdateCV(cv);
      return;
    }
    await MobileStorage.updateCV(cv);
  },

  async deleteCV(id: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteCV(id);
      return;
    }
    await MobileStorage.deleteCV(id);
  },

  async createSection(req: { cvId: string; sectionType: SectionType; title: string; orderKey: string }): Promise<CVSection> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.CreateSection(req);
    }
    return await MobileStorage.createSection(req);
  },

  async updateSection(sec: CVSection): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.UpdateSection(sec);
      return;
    }
    await MobileStorage.updateSection(sec);
  },

  async deleteSection(id: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteSection(id);
      return;
    }
    await MobileStorage.deleteSection(id);
  },

  async reorderSection(id: string, newOrderKey: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.ReorderSection(id, newOrderKey);
      return;
    }
    await MobileStorage.reorderSection(id, newOrderKey);
  },

  async createEntry(req: { sectionId: string; orderKey: string; title: string }): Promise<CVEntry> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.CreateEntry(req);
    }
    return await MobileStorage.createEntry(req);
  },

  async updateEntry(entry: CVEntry): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.UpdateEntry(entry);
      return;
    }
    await MobileStorage.updateEntry(entry);
  },

  async deleteEntry(id: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteEntry(id);
      return;
    }
    await MobileStorage.deleteEntry(id);
  },

  async reorderEntry(id: string, newOrderKey: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.ReorderEntry(id, newOrderKey);
      return;
    }
    await MobileStorage.reorderEntry(id, newOrderKey);
  },

  async translateCV(req: { sourceLanguage: string; targetLanguage: string; fieldType: string; text: string }): Promise<{ translatedText: string; note: string }> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.TranslateCV(req);
    }
    const apiKey = MobileStorage.getGeminiAPIKey();
    if (apiKey) {
      return await MobileGemini.translateField(apiKey, req);
    }
    // Simulation fallback if no key provided
    await new Promise((r) => setTimeout(r, 600));
    return {
      translatedText:
        req.targetLanguage === "tr"
          ? `[TR CV Çevirisi] ${req.text}`
          : `[EN Resume Translation] ${req.text}`,
      note: "Development simulation (Ayarlar menüsünden API Key ekleyebilirsiniz)",
    };
  },

  async translateFullCV(cv: CVData, targetLanguage: string): Promise<CVData> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.TranslateFullCV(cv, targetLanguage);
    }
    const apiKey = MobileStorage.getGeminiAPIKey();
    if (apiKey) {
      return await MobileGemini.translateFullCV(apiKey, cv, targetLanguage);
    }
    // Simulation fallback
    await new Promise((r) => setTimeout(r, 800));
    const prefix = targetLanguage === "tr" ? "[TR] " : "[EN] ";
    return {
      ...cv,
      language: (targetLanguage === "tr" ? "tr" : "en") as "tr" | "en",
      jobTitle: cv.jobTitle ? `${prefix}${cv.jobTitle}` : "",
      summary: cv.summary ? `${prefix}${cv.summary}` : "",
      sections: (cv.sections || []).map((s) => ({
        ...s,
        title: s.title ? `${prefix}${s.title}` : "",
        entries: (s.entries || []).map((e) => ({
          ...e,
          title: e.title ? `${prefix}${e.title}` : "",
          subtitle: e.subtitle ? `${prefix}${e.subtitle}` : "",
          description: e.description ? `${prefix}${e.description}` : "",
        })),
      })),
    };
  },

  async getGeminiAPIKey(): Promise<string> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.GetGeminiAPIKey();
    }
    return MobileStorage.getGeminiAPIKey();
  },

  async setGeminiAPIKey(key: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.SetGeminiAPIKey(key);
      return;
    }
    MobileStorage.setGeminiAPIKey(key);
  },

  async deleteGeminiAPIKey(): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteGeminiAPIKey();
      return;
    }
    MobileStorage.deleteGeminiAPIKey();
  },

  async savePDF(base64Data: string, suggestedFilename: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.SavePDF(base64Data, suggestedFilename);
      return;
    }

    // Try Capacitor Native File & Share on mobile devices
    try {
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        const fileName = suggestedFilename.endsWith(".pdf") ? suggestedFilename : `${suggestedFilename}.pdf`;
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: fileName,
          text: `${fileName} - CV Maker`,
          url: writeResult.uri,
          dialogTitle: "CV Paylaş / Kaydet",
        });
        return;
      }
    } catch (capErr) {
      console.warn("Capacitor share not active, falling back to browser download:", capErr);
    }

    // Standard Web/Browser Fallback (Direct Blob Download)
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = suggestedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  async atsFormatCheck(cv: CVData): Promise<atsscore.FinalReport> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.ATSFormatCheck(cv);
    }
    return runDeterministicATSCheck(cv);
  },

  async atsFullCheck(cv: CVData, jobDescription: string): Promise<atsscore.FinalReport> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.ATSFullCheck(cv, jobDescription);
    }
    const apiKey = MobileStorage.getGeminiAPIKey();
    if (apiKey) {
      return await MobileGemini.fullATSCheck(apiKey, cv, jobDescription);
    }
    const report = runDeterministicATSCheck(cv);
    return new atsscore.FinalReport({
      score: report.score,
      formatScore: report.formatScore,
      contentPending: true,
      formatFindings: report.formatFindings,
      matchedSkills: [],
      missingSkills: [],
      suggestions: [
        new atsmatch.Suggestion({
          entryId: "note",
          suggestion:
            cv.language === "en"
              ? "Add your Gemini API Key in Settings to enable real-time job description matching and smart suggestions."
              : "İş ilanı eşleştirmesi ve yapay zeka önerilerini aktifleştirmek için Ayarlar menüsünden Gemini API Anahtarınızı girin.",
        }),
      ],
    });
  },
};
