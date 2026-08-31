import type { CVData, CVSection, CVEntry, SectionType } from "../types/cv";

const STORAGE_KEY = "cvmaker_mobile_cvs";
const ACTIVE_CV_KEY = "cvmaker_mobile_active_id";
const API_KEY_STORAGE = "cvmaker_gemini_api_key";

// Initial demo CV
export const initialDemoCV: CVData = {
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
  summary:
    "7+ yıllık deneyime sahip, yüksek trafikli mikroservis mimarileri, distributed sistemler ve Go/Cloud altyapıları konusunda uzmanlaşmış Kıdemli Backend Mühendisi. Clean Architecture ve Domain-Driven Design prensiplerini benimseyen, performans ve Big-O optimizasyonunu ön planda tutan bir yaklaşım.",
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
          description:
            "- Günlük 15M+ isteği işleyen mikroservis mimarisini Go ve gRPC kullanarak sıfırdan tasarladı ve hayata geçirdi.\n- Dağıtık önbellekleme (Redis Cluster) ve PostgreSQL optimizasyonlarıyla API yanıt sürelerini %40 düşürdü.\n- Docker ve Kubernetes üzerinde CI/CD pipeline'larını kurarak deployment sürelerini 15 dakikadan 3 dakikaya indirdi.",
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
          description:
            "- E-ticaret platformunun ödeme ve faturalandırma servislerini event-driven mimariyle yeniden yazdı.\n- Stripe ve yerel ödeme sağlayıcıları entegrasyonlarını sıfır hata toleransıyla tamamladı.",
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
        {
          id: "sk-1",
          sectionId: "sec-3",
          orderKey: "a0",
          title: "Languages",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "Go, TypeScript, JavaScript, Python",
          meta: {},
        },
        {
          id: "sk-2",
          sectionId: "sec-3",
          orderKey: "a1",
          title: "Framework & Libraries",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "NestJS, Fastify, React, Next.js, Node.js, Redux",
          meta: {},
        },
        {
          id: "sk-3",
          sectionId: "sec-3",
          orderKey: "a2",
          title: "Databases & Caching",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "PostgreSQL, MongoDB, Redis, TypeORM",
          meta: {},
        },
        {
          id: "sk-4",
          sectionId: "sec-3",
          orderKey: "a3",
          title: "DevOps & Cloud",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "Docker, Kubernetes (k3s/kubectl), CI/CD, Azure, GCP, Linux Server Administration",
          meta: {},
        },
        {
          id: "sk-5",
          sectionId: "sec-3",
          orderKey: "a4",
          title: "AI & ML",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "OpenAI API, Gemini API, RAG, Ollama, LM Studio, Function Calling, Tool Calling, MCP, AI Agent Architectures",
          meta: {},
        },
        {
          id: "sk-6",
          sectionId: "sec-3",
          orderKey: "a5",
          title: "Concepts & Tools",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "RESTful APIs, Microservice Architecture, System Design, JWT/OTP Authentication, Git, Netgsm Integration, Postman",
          meta: {},
        },
        {
          id: "sk-7",
          sectionId: "sec-3",
          orderKey: "a6",
          title: "AI-Assisted Development Tools",
          subtitle: "",
          location: "",
          isCurrent: false,
          description: "Claude Code, Antigravity IDE, OpenCode, Cursor",
          meta: {},
        },
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

function getAllCVs(): CVData[] {
  if (typeof window === "undefined") return [initialDemoCV];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialList = [initialDemoCV];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
      return initialList;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [initialDemoCV];
  } catch (err) {
    console.error("Failed to parse stored CVs:", err);
    return [initialDemoCV];
  }
}

function saveAllCVs(cvs: CVData[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
  } catch (err) {
    console.error("Failed to save CVs to local storage:", err);
  }
}

export const MobileStorage = {
  async listCVs(): Promise<CVData[]> {
    return getAllCVs();
  },

  async getCV(id: string): Promise<CVData> {
    const list = getAllCVs();
    const found = list.find((c) => c.id === id);
    if (found) return found;
    if (list.length > 0) return list[0];
    return initialDemoCV;
  },

  async createCV(req: { title: string; language: string; fullName: string; email: string }): Promise<CVData> {
    const list = getAllCVs();
    const newCV: CVData = {
      ...initialDemoCV,
      id: "cv-" + Date.now(),
      title: req.title || "My Resume",
      language: (req.language as "tr" | "en") || "tr",
      fullName: req.fullName || "",
      email: req.email || "",
      sections: [],
    };
    list.unshift(newCV);
    saveAllCVs(list);
    return newCV;
  },

  async updateCV(cv: CVData): Promise<void> {
    const list = getAllCVs();
    const idx = list.findIndex((c) => c.id === cv.id);
    if (idx !== -1) {
      list[idx] = { ...cv };
    } else {
      list.push({ ...cv });
    }
    saveAllCVs(list);
  },

  async deleteCV(id: string): Promise<void> {
    const list = getAllCVs();
    const filtered = list.filter((c) => c.id !== id);
    saveAllCVs(filtered);
  },

  async createSection(req: { cvId: string; sectionType: SectionType; title: string; orderKey: string }): Promise<CVSection> {
    const list = getAllCVs();
    const cv = list.find((c) => c.id === req.cvId);
    const sec: CVSection = {
      id: "sec-" + Date.now(),
      cvId: req.cvId,
      sectionType: req.sectionType,
      title: req.title,
      orderKey: req.orderKey,
      entries: [],
    };
    if (cv) {
      if (!cv.sections) cv.sections = [];
      cv.sections.push(sec);
      saveAllCVs(list);
    }
    return sec;
  },

  async updateSection(sec: CVSection): Promise<void> {
    const list = getAllCVs();
    for (const cv of list) {
      const sIdx = cv.sections?.findIndex((s) => s.id === sec.id);
      if (sIdx !== undefined && sIdx !== -1) {
        cv.sections[sIdx] = { ...sec };
        saveAllCVs(list);
        break;
      }
    }
  },

  async deleteSection(id: string): Promise<void> {
    const list = getAllCVs();
    for (const cv of list) {
      if (cv.sections?.some((s) => s.id === id)) {
        cv.sections = cv.sections.filter((s) => s.id !== id);
        saveAllCVs(list);
        break;
      }
    }
  },

  async reorderSection(id: string, newOrderKey: string): Promise<void> {
    const list = getAllCVs();
    for (const cv of list) {
      const sec = cv.sections?.find((s) => s.id === id);
      if (sec) {
        sec.orderKey = newOrderKey;
        saveAllCVs(list);
        break;
      }
    }
  },

  async createEntry(req: { sectionId: string; orderKey: string; title: string }): Promise<CVEntry> {
    const list = getAllCVs();
    const newEntry: CVEntry = {
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

    for (const cv of list) {
      const sec = cv.sections?.find((s) => s.id === req.sectionId);
      if (sec) {
        if (!sec.entries) sec.entries = [];
        sec.entries.push(newEntry);
        saveAllCVs(list);
        break;
      }
    }
    return newEntry;
  },

  async updateEntry(entry: CVEntry): Promise<void> {
    const list = getAllCVs();
    for (const cv of list) {
      const sec = cv.sections?.find((s) => s.id === entry.sectionId);
      if (sec && sec.entries) {
        const eIdx = sec.entries.findIndex((e) => e.id === entry.id);
        if (eIdx !== -1) {
          sec.entries[eIdx] = { ...entry };
          saveAllCVs(list);
          break;
        }
      }
    }
  },

  async deleteEntry(id: string): Promise<void> {
    const list = getAllCVs();
    for (const cv of list) {
      for (const sec of cv.sections || []) {
        if (sec.entries?.some((e) => e.id === id)) {
          sec.entries = sec.entries.filter((e) => e.id !== id);
          saveAllCVs(list);
          return;
        }
      }
    }
  },

  async reorderEntry(id: string, newOrderKey: string): Promise<void> {
    const list = getAllCVs();
    for (const cv of list) {
      for (const sec of cv.sections || []) {
        const entry = sec.entries?.find((e) => e.id === id);
        if (entry) {
          entry.orderKey = newOrderKey;
          saveAllCVs(list);
          return;
        }
      }
    }
  },

  getGeminiAPIKey(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(API_KEY_STORAGE) || "";
  },

  setGeminiAPIKey(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(API_KEY_STORAGE, key);
  },

  deleteGeminiAPIKey(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(API_KEY_STORAGE);
  },
};
