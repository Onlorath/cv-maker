import type { CVData } from "../types/cv";
import { atsscore, atsmatch } from "../../wailsjs/go/models";
import { runDeterministicATSCheck } from "./mobileATSCheck";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

async function callGeminiREST(
  apiKey: string,
  prompt: string,
  responseSchema?: any
): Promise<string> {
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body: any = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      };

      if (responseSchema) {
        body.generationConfig.responseMimeType = "application/json";
        body.generationConfig.responseSchema = responseSchema;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini ${model} HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
      throw new Error("Empty candidate returned from Gemini");
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model ${model} failed, trying next...`, err);
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}

export const MobileGemini = {
  async translateField(
    apiKey: string,
    req: { sourceLanguage: string; targetLanguage: string; fieldType: string; text: string }
  ): Promise<{ translatedText: string; note: string }> {
    const isTargetTr = req.targetLanguage === "tr";
    const prompt = `You are an expert ATS resume writer and professional career translator.
Translate and adapt the following CV text from ${req.sourceLanguage} to ${req.targetLanguage}.
Do not translate literally — rewrite it so that it reads naturally, confidently, and professionally adhering to modern resume best practices.

${
  isTargetTr
    ? req.fieldType === "summary"
      ? "This is a professional career summary (2-4 sentences). Rewrite it in clear, concise, professional Turkish resume tone."
      : req.fieldType === "bullet"
      ? "This is a resume bullet point. Rewrite it starting with strong active verbs in Turkish (e.g. 'Geliştirdi', 'Optimize etti')."
      : "Translate this CV text into natural, professional Turkish resume language."
    : req.fieldType === "summary"
    ? "This is a professional career summary (2-4 sentences). Keep it concise, impactful, confident, and free of first-person pronouns (no 'I' or 'my')."
    : req.fieldType === "bullet"
    ? "This is a resume bullet point. Rewrite it starting with a strong past-tense action verb (e.g. 'Architected', 'Spearheaded', 'Optimized')."
    : "Translate this CV text into natural, professional English resume language."
}

Preserve all proper nouns (company names, product names, technology names like React, Go, Docker, AWS, PostgreSQL) exactly as written.
Return ONLY the translated text, no preamble, no markdown quotes, no explanations.

Text:
${req.text}`;

    const translated = await callGeminiREST(apiKey, prompt);
    return {
      translatedText: translated,
      note: "Gemini AI translation",
    };
  },

  async translateFullCV(apiKey: string, cv: CVData, targetLanguage: string): Promise<CVData> {
    const isTargetTr = targetLanguage === "tr";
    const cvPayload = {
      jobTitle: cv.jobTitle || "",
      summary: cv.summary || "",
      sections: (cv.sections || []).map((s) => ({
        id: s.id,
        title: s.title,
        entries: (s.entries || []).map((e) => ({
          id: e.id,
          title: e.title,
          subtitle: e.subtitle,
          description: e.description,
        })),
      })),
    };

    const prompt = `You are an expert ATS resume writer and professional career translator.
Translate and professionally adapt the following entire CV JSON from ${cv.language || "auto"} to ${targetLanguage}.
${
  isTargetTr
    ? "Rewrite descriptions and bullets with strong Turkish action verbs. Use standard Turkish career terminology."
    : "Rewrite descriptions and bullets starting with strong past-tense action verbs (e.g. 'Architected', 'Engineered', 'Optimized'). Use standard international US/UK resume phrasing."
}
Preserve all IDs and structure exactly as provided.
Preserve all proper nouns (company names, product names, technology names like React, Go, Docker, AWS, PostgreSQL, university names).

CV JSON:
${JSON.stringify(cvPayload, null, 2)}`;

    const schema = {
      type: "OBJECT",
      properties: {
        jobTitle: { type: "STRING" },
        summary: { type: "STRING" },
        sections: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              title: { type: "STRING" },
              entries: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "STRING" },
                    title: { type: "STRING" },
                    subtitle: { type: "STRING" },
                    description: { type: "STRING" },
                  },
                  required: ["id", "title"],
                },
              },
            },
            required: ["id", "title", "entries"],
          },
        },
      },
      required: ["jobTitle", "summary", "sections"],
    };

    const rawJSON = await callGeminiREST(apiKey, prompt, schema);
    const parsed = JSON.parse(rawJSON);

    // Merge translated content back into original CV structure
    const updatedSections = (cv.sections || []).map((origSec) => {
      const translatedSec = parsed.sections?.find((s: any) => s.id === origSec.id);
      return {
        ...origSec,
        title: translatedSec?.title || origSec.title,
        entries: (origSec.entries || []).map((origEntry) => {
          const translatedEntry = translatedSec?.entries?.find((e: any) => e.id === origEntry.id);
          return {
            ...origEntry,
            title: translatedEntry?.title || origEntry.title,
            subtitle: translatedEntry?.subtitle !== undefined ? translatedEntry.subtitle : origEntry.subtitle,
            description: translatedEntry?.description !== undefined ? translatedEntry.description : origEntry.description,
          };
        }),
      };
    });

    return {
      ...cv,
      language: (targetLanguage === "tr" ? "tr" : "en") as "tr" | "en",
      jobTitle: parsed.jobTitle || cv.jobTitle,
      summary: parsed.summary || cv.summary,
      sections: updatedSections,
    };
  },

  async fullATSCheck(apiKey: string, cv: CVData, jobDescription: string): Promise<atsscore.FinalReport> {
    const formatReport = runDeterministicATSCheck(cv);

    if (!jobDescription.trim() || !apiKey) {
      return formatReport;
    }

    const cvSummaryForJD = {
      jobTitle: cv.jobTitle,
      summary: cv.summary,
      sections: (cv.sections || []).map((s) => ({
        type: s.sectionType,
        title: s.title,
        entries: (s.entries || []).map((e) => ({
          entryId: e.id,
          title: e.title,
          subtitle: e.subtitle,
          description: e.description,
        })),
      })),
    };

    const prompt = `You are an expert technical recruiter comparing a candidate's CV against a job description.

Job description:
${jobDescription}

Candidate's CV (JSON):
${JSON.stringify(cvSummaryForJD, null, 2)}

Compare them and identify:
1. Which required skills/qualifications from the job description are genuinely present in the CV — including equivalent terms (e.g. CV says "Docker" and JD says "container orchestration").
2. Which important skills/qualifications from the job description are missing or not evidenced in the CV.
3. For up to 3 of the most impactful gaps, suggest a specific, honest rewording of an existing CV bullet (referencing its entryId) that would better surface a genuinely transferable skill the candidate likely already has. Never invent an experience the candidate does not have.

IMPORTANT: Write all suggestions and skills in the same language as the candidate's CV (${cv.language === "en" ? "English" : "Turkish"}).`;

    const schema = {
      type: "OBJECT",
      properties: {
        matchScore: { type: "INTEGER" },
        matchedSkills: { type: "ARRAY", items: { type: "STRING" } },
        missingSkills: { type: "ARRAY", items: { type: "STRING" } },
        suggestions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              entryId: { type: "STRING" },
              suggestion: { type: "STRING" },
            },
            required: ["entryId", "suggestion"],
          },
        },
      },
      required: ["matchScore", "matchedSkills", "missingSkills", "suggestions"],
    };

    const rawResult = await callGeminiREST(apiKey, prompt, schema);
    const parsed = JSON.parse(rawResult);

    const matchScore = Math.max(0, Math.min(100, parsed.matchScore || 75));
    const combinedScore = Math.round(formatReport.formatScore * 0.25 + matchScore * 0.75);

    return new atsscore.FinalReport({
      score: combinedScore,
      formatScore: formatReport.formatScore,
      contentScore: matchScore,
      contentPending: false,
      formatFindings: formatReport.formatFindings,
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      suggestions: (parsed.suggestions || []).map((s: any) => new atsmatch.Suggestion(s)),
    });
  },
};
