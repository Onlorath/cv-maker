import type { CVData, CVSection, CVEntry, SectionType } from "../types/cv";
import type { atsscore } from "../../wailsjs/go/models";

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

// Initial demo / template CV data
const initialMockCV: CVData = {
  id: "demo-cv-1",
  title: "Senior Software Engineer CV",
  language: "tr",
  templateId: "ats-classic",
  fullName: "Yusuf Kaan",
  jobTitle: "Senior Backend & Cloud Architect",
  email: "yusuf@example.com",
  phone: "+90 555 123 45 67",
  location: "İstanbul, Türkiye",
  linkedin: "linkedin.com/in/yusufkaan",
  github: "github.com/yusufkaan",
  website: "yusuf.dev",
  summary: "7+ yıllık deneyime sahip, yüksek trafikli mikroservis mimarileri, distributed sistemler ve Go/Cloud altyapıları konusunda uzmanlaşmış Kıdemli Backend Mühendisi. Clean Architecture ve Domain-Driven Design prensiplerini benimseyen, performans ve Big-O optimizasyonunu ön planda tutan bir yaklaşım.",
  photoPath: "",
  sections: [
    {
      id: "sec-1",
      cvId: "demo-cv-1",
      sectionType: "experience",
      title: "DENEYİM",
      orderKey: "a0",
      entries: [
        {
          id: "ent-1",
          sectionId: "sec-1",
          orderKey: "a0",
          title: "Senior Backend Engineer",
          subtitle: "Onlorath Tech Systems",
          location: "İstanbul (Hibrit)",
          dateStart: "2023-01",
          dateEnd: null,
          isCurrent: true,
          description: "- Günlük 15M+ isteği işleyen mikroservis mimarisini Go ve gRPC kullanarak sıfırdan tasarladı ve hayata geçirdi.\n- Dağıtık önbellekleme (Redis Cluster) ve PostgreSQL optimizasyonlarıyla API yanıt sürelerini %40 düşürdü.\n- Docker ve Kubernetes üzerinde CI/CD pipeline'larını kurarak deployment sürelerini 15 dakikadan 3 dakikaya indirdi.",
          meta: {},
        },
        {
          id: "ent-2",
          sectionId: "sec-1",
          orderKey: "a1",
          title: "Backend Developer",
          subtitle: "Kartelam Digital",
          location: "İstanbul",
          dateStart: "2020-06",
          dateEnd: "2022-12",
          isCurrent: false,
          description: "- E-ticaret platformunun ödeme ve faturalandırma servislerini event-driven mimariyle yeniden yazdı.\n- Stripe ve yerel ödeme sağlayıcıları entegrasyonlarını sıfır hata toleransıyla tamamladı.",
          meta: {},
        },
      ],
    },
    {
      id: "sec-2",
      cvId: "demo-cv-1",
      sectionType: "education",
      title: "EĞİTİM",
      orderKey: "a1",
      entries: [
        {
          id: "ent-3",
          sectionId: "sec-2",
          orderKey: "a0",
          title: "İstanbul Teknik Üniversitesi",
          subtitle: "Bilgisayar Mühendisliği (Lisans)",
          location: "İstanbul",
          dateStart: "2016-09",
          dateEnd: "2020-06",
          isCurrent: false,
          description: "Yüksek Onur Derecesi (GPA: 3.78/4.00). Bitirme Projesi: Dağıtık Konsensus Algoritmaları.",
          meta: {},
        },
      ],
    },
    {
      id: "sec-3",
      cvId: "demo-cv-1",
      sectionType: "skills",
      title: "TEKNİK YETENEKLER",
      orderKey: "a2",
      entries: [
        { id: "sk-1", sectionId: "sec-3", orderKey: "a0", title: "Go (Golang)", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "Uzman" } },
        { id: "sk-2", sectionId: "sec-3", orderKey: "a1", title: "PostgreSQL & SQLite", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "Uzman" } },
        { id: "sk-3", sectionId: "sec-3", orderKey: "a2", title: "Docker & Kubernetes", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "İleri" } },
        { id: "sk-4", sectionId: "sec-3", orderKey: "a3", title: "Redis & gRPC", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "İleri" } },
        { id: "sk-5", sectionId: "sec-3", orderKey: "a4", title: "React & TypeScript", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "Orta/İleri" } },
        { id: "sk-6", sectionId: "sec-3", orderKey: "a5", title: "Clean Architecture", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "Uzman" } },
      ],
    },
    {
      id: "sec-4",
      cvId: "demo-cv-1",
      sectionType: "languages",
      title: "DİLLER",
      orderKey: "a3",
      entries: [
        { id: "lang-1", sectionId: "sec-4", orderKey: "a0", title: "Türkçe", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "Anadil" } },
        { id: "lang-2", sectionId: "sec-4", orderKey: "a1", title: "İngilizce", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "C1 - Profesyonel" } },
        { id: "lang-3", sectionId: "sec-4", orderKey: "a2", title: "Almanca", subtitle: "", location: "", isCurrent: false, description: "", meta: { level: "A2 - Temel" } },
      ],
    },
  ],
};

let inMemoryCV = JSON.parse(JSON.stringify(initialMockCV)) as CVData;

export const WailsBridge = {
  isWailsAvailable(): boolean {
    return typeof window !== "undefined" && !!window.go?.main?.App;
  },

  async getCV(id: string): Promise<CVData> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.GetCV(id);
    }
    return inMemoryCV;
  },

  async listCVs(): Promise<CVData[]> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.ListCVs();
    }
    return [inMemoryCV];
  },

  async createCV(req: { title: string; language: string; fullName: string; email: string }): Promise<CVData> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.CreateCV(req);
    }
    const newCV: CVData = {
      ...initialMockCV,
      id: "cv-" + Date.now(),
      title: req.title,
      language: (req.language as "tr" | "en") || "tr",
      fullName: req.fullName,
      email: req.email,
      sections: [],
    };
    inMemoryCV = newCV;
    return newCV;
  },

  async updateCV(cv: CVData): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.UpdateCV(cv);
      return;
    }
    inMemoryCV = { ...cv };
  },

  async deleteCV(id: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteCV(id);
      return;
    }
  },

  async createSection(req: { cvId: string; sectionType: SectionType; title: string; orderKey: string }): Promise<CVSection> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.CreateSection(req);
    }
    const sec: CVSection = {
      id: "sec-" + Date.now(),
      cvId: req.cvId,
      sectionType: req.sectionType,
      title: req.title,
      orderKey: req.orderKey,
      entries: [],
    };
    inMemoryCV.sections.push(sec);
    return sec;
  },

  async updateSection(sec: CVSection): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.UpdateSection(sec);
      return;
    }
    const idx = inMemoryCV.sections.findIndex((s) => s.id === sec.id);
    if (idx !== -1) inMemoryCV.sections[idx] = sec;
  },

  async deleteSection(id: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteSection(id);
      return;
    }
    inMemoryCV.sections = inMemoryCV.sections.filter((s) => s.id !== id);
  },

  async reorderSection(id: string, newOrderKey: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.ReorderSection(id, newOrderKey);
      return;
    }
    const sec = inMemoryCV.sections.find((s) => s.id === id);
    if (sec) sec.orderKey = newOrderKey;
  },

  async createEntry(req: { sectionId: string; orderKey: string; title: string }): Promise<CVEntry> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.CreateEntry(req);
    }
    const entry: CVEntry = {
      id: "ent-" + Date.now(),
      sectionId: req.sectionId,
      orderKey: req.orderKey,
      title: req.title,
      subtitle: "",
      location: "",
      isCurrent: false,
      description: "",
      meta: {},
    };
    const sec = inMemoryCV.sections.find((s) => s.id === req.sectionId);
    if (sec) sec.entries.push(entry);
    return entry;
  },

  async updateEntry(entry: CVEntry): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.UpdateEntry(entry);
      return;
    }
    for (const sec of inMemoryCV.sections) {
      const idx = sec.entries.findIndex((e) => e.id === entry.id);
      if (idx !== -1) {
        sec.entries[idx] = entry;
        break;
      }
    }
  },

  async deleteEntry(id: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.DeleteEntry(id);
      return;
    }
    for (const sec of inMemoryCV.sections) {
      sec.entries = sec.entries.filter((e) => e.id !== id);
    }
  },

  async reorderEntry(id: string, newOrderKey: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.ReorderEntry(id, newOrderKey);
      return;
    }
    for (const sec of inMemoryCV.sections) {
      const ent = sec.entries.find((e) => e.id === id);
      if (ent) {
        ent.orderKey = newOrderKey;
        break;
      }
    }
  },

  async translateCV(req: { sourceLanguage: string; targetLanguage: string; fieldType: string; text: string }): Promise<{ translatedText: string; note: string }> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.TranslateCV(req);
    }
    // Fallback simulate translation in browser dev mode
    await new Promise((r) => setTimeout(r, 800));
    return {
      translatedText:
        req.targetLanguage === "tr"
          ? `[TR CV Çevirisi] ${req.text}`
          : `[EN Resume Translation] ${req.text}`,
      note: "Development simulation",
    };
  },

  async getGeminiAPIKey(): Promise<string> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.GetGeminiAPIKey();
    }
    return localStorage.getItem("dev_gemini_key") || "";
  },

  async setGeminiAPIKey(key: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.SetGeminiAPIKey(key);
      return;
    }
    localStorage.setItem("dev_gemini_key", key);
  },

  async savePDF(base64Data: string, suggestedFilename: string): Promise<void> {
    if (this.isWailsAvailable()) {
      await window.go!.main!.App!.SavePDF(base64Data, suggestedFilename);
      return;
    }
    // Browser fallback
    const link = document.createElement("a");
    link.href = "data:application/pdf;base64," + base64Data;
    link.download = suggestedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async atsFormatCheck(cv: CVData): Promise<atsscore.FinalReport> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.ATSFormatCheck(cv);
    }
    // Browser mock fallback
    await new Promise((r) => setTimeout(r, 600));
    const isEn = cv.language === "en";
    return {
      score: 92,
      formatScore: 92,
      contentPending: true,
      formatFindings: [
        {
          code: "missing_summary",
          severity: "low",
          field: "summary",
          message: isEn
            ? "Summary section is empty. Filling it is strongly recommended."
            : "Özet bölümü boş veya çok kısa. Doldurulması önerilir.",
        },
      ],
      convertValues: () => ({}) as any,
    } as atsscore.FinalReport;
  },

  async atsFullCheck(cv: CVData, jobDescription: string): Promise<atsscore.FinalReport> {
    if (this.isWailsAvailable()) {
      return await window.go!.main!.App!.ATSFullCheck(cv, jobDescription);
    }
    // Browser mock fallback
    await new Promise((r) => setTimeout(r, 1200));
    const isEn = cv.language === "en";
    return {
      score: 84,
      formatScore: 92,
      contentScore: 81,
      contentPending: false,
      formatFindings: [
        {
          code: "missing_summary",
          severity: "low",
          field: "summary",
          message: isEn
            ? "Summary section is empty. Filling it is strongly recommended."
            : "Özet bölümü boş veya çok kısa. Doldurulması önerilir.",
        },
      ],
      matchedSkills: ["Go (Golang)", "PostgreSQL", "Docker", "Kubernetes", "Redis", "gRPC", "Clean Architecture"],
      missingSkills: isEn
        ? ["Terraform / AWS CDK", "Kafka or RabbitMQ Event Broker"]
        : ["Terraform / AWS CDK", "Kafka veya RabbitMQ Event Broker"],
      suggestions: [
        {
          entryId: "ent-1",
          suggestion: isEn
            ? "You can add a bullet point highlighting event-driven architecture and asynchronous messaging in your microservices experience."
            : "Mikroservis mimarisindeki deneyiminde Event-Driven iletişim ve kuyruk yapıları (varsa) üzerine bir cümle ekleyebilirsin.",
        },
        {
          entryId: "ent-2",
          suggestion: isEn
            ? "Clearly state the transactional consistency and webhook handling mechanisms in the payment gateway services."
            : "Ödeme altyapısındaki asenkron kuyruk işlemlerini ve veri tutarlılığı yöntemlerini açıkça belirt.",
        },
      ],
      convertValues: () => ({}) as any,
    } as atsscore.FinalReport;
  },
};

