import type { CVData } from "../types/cv";
import { atsscore, atscheck } from "../../wailsjs/go/models";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^[\p{L}]+ \d{4}$/u;
const PHONE_DIGITS_RE = /\d/g;

const KNOWN_HEADINGS = [
  "deneyim",
  "iş deneyimi",
  "eğitim",
  "yetenekler",
  "diller",
  "sertifikalar",
  "projeler",
  "özet",
  "experience",
  "work experience",
  "education",
  "skills",
  "languages",
  "certifications",
  "projects",
  "summary",
];

const SEVERITY_PENALTY: Record<string, number> = {
  critical: 60,
  high: 25,
  medium: 10,
  low: 4,
};

function localized(cv: CVData, trMsg: string, enMsg: string): string {
  return cv.language === "en" ? enMsg : trMsg;
}

export function runDeterministicATSCheck(cv: CVData): atsscore.FinalReport {
  const findings: atscheck.Finding[] = [];

  // 1. Check Full Name
  if (!cv.fullName || !cv.fullName.trim()) {
    findings.push(
      new atscheck.Finding({
        code: "missing_full_name",
        severity: "critical",
        field: "fullName",
        message: localized(
          cv,
          "Ad soyad boş. Bu alan olmadan CV'nin kimliği ATS'te tanımlanamaz.",
          "Full name is missing. Without this field, the resume identity cannot be established in ATS."
        ),
      })
    );
  }

  // 2. Check Email
  const email = (cv.email || "").trim();
  if (!email) {
    findings.push(
      new atscheck.Finding({
        code: "missing_email",
        severity: "high",
        field: "email",
        message: localized(
          cv,
          "E-posta adresi boş. Çoğu ATS iletişim bilgisini zorunlu alan olarak bekler.",
          "Email address is missing. Most ATS systems require contact information as a mandatory field."
        ),
      })
    );
  } else if (!EMAIL_RE.test(email)) {
    findings.push(
      new atscheck.Finding({
        code: "invalid_email_format",
        severity: "high",
        field: "email",
        message: localized(
          cv,
          `E-posta formatı geçersiz görünüyor: "${email}"`,
          `Email format appears invalid: "${email}"`
        ),
      })
    );
  }

  // 3. Check Phone
  const phone = (cv.phone || "").trim();
  if (!phone) {
    findings.push(
      new atscheck.Finding({
        code: "missing_phone",
        severity: "medium",
        field: "phone",
        message: localized(
          cv,
          "Telefon numarası boş. Zorunlu değil ama doldurulması önerilir.",
          "Phone number is empty. Not mandatory, but recommended."
        ),
      })
    );
  } else {
    const digitCount = (phone.match(PHONE_DIGITS_RE) || []).length;
    if (digitCount < 7) {
      findings.push(
        new atscheck.Finding({
          code: "suspicious_phone_format",
          severity: "medium",
          field: "phone",
          message: localized(
            cv,
            `Telefon numarası çok az rakam içeriyor (${digitCount} rakam), kontrol et: "${phone}"`,
            `Phone number contains too few digits (${digitCount} digits), please verify: "${phone}"`
          ),
        })
      );
    }
  }

  // 4. Check Summary Present
  if (!cv.summary || !cv.summary.trim()) {
    findings.push(
      new atscheck.Finding({
        code: "missing_summary",
        severity: "low",
        field: "summary",
        message: localized(
          cv,
          "Özet bölümü boş. Zorunlu değil ama doldurulması güçlü önerilir.",
          "Professional summary is empty. Not mandatory, but strongly recommended."
        ),
      })
    );
  }

  // 5. Check Sections Not Empty
  const sections = cv.sections || [];
  sections.forEach((sec, sIdx) => {
    if (!sec.entries || sec.entries.length === 0) {
      findings.push(
        new atscheck.Finding({
          code: "empty_section",
          severity: "medium",
          field: `sections[${sIdx}]`,
          message: localized(
            cv,
            `"${sec.title || "Bölüm"}" bölümü eklenmiş ama içi boş.`,
            `"${sec.title || "Section"}" section has been added but contains no entries.`
          ),
        })
      );
    }
  });

  // 6. Check Date Consistency
  const dateRequiredTypes = new Set(["experience", "education", "certifications", "projects"]);
  sections.forEach((sec, sIdx) => {
    if (!dateRequiredTypes.has(sec.sectionType)) return;
    (sec.entries || []).forEach((entry, eIdx) => {
      if (entry.dateStart && entry.dateStart.trim()) {
        const ds = entry.dateStart.trim();
        const isStandard = DATE_RE.test(ds) || /^\d{4}(-\d{2})?$/.test(ds) || /^\d{2}\/\d{4}$/.test(ds);
        if (!isStandard) {
          findings.push(
            new atscheck.Finding({
              code: "inconsistent_date_format",
              severity: "medium",
              field: `sections[${sIdx}].entries[${eIdx}].dateStart`,
              message: localized(
                cv,
                `Tarih formatı beklenmedik: "${ds}" (beklenen: Ay Yıl, örn: May 2026 veya 2023)`,
                `Unexpected date format: "${ds}" (expected: Month YYYY or YYYY-MM)`
              ),
            })
          );
        }
      }
    });
  });

  // 7. Check Long Unbroken Description
  sections.forEach((sec, sIdx) => {
    (sec.entries || []).forEach((entry, eIdx) => {
      const desc = (entry.description || "").trim();
      if (desc.length >= 500) {
        const hasBullets = desc.includes("\n-") || desc.includes("\n*") || desc.startsWith("-") || desc.startsWith("*");
        if (!hasBullets) {
          findings.push(
            new atscheck.Finding({
              code: "unbroken_long_description",
              severity: "low",
              field: `sections[${sIdx}].entries[${eIdx}].description`,
              message: localized(
                cv,
                `"${entry.title || "Girdi"}" girdisinin açıklaması ${desc.length} karakter ve madde işaretine bölünmemiş.`,
                `Description for "${entry.title || "Entry"}" is ${desc.length} characters and not broken into bullet points.`
              ),
            })
          );
        }
      }
    });
  });

  // 8. Check Custom Section Headings
  sections.forEach((sec, sIdx) => {
    if (sec.sectionType === "custom") {
      const titleLower = (sec.title || "").toLowerCase().trim();
      const isKnown = KNOWN_HEADINGS.some((k) => titleLower.includes(k));
      if (!isKnown) {
        findings.push(
          new atscheck.Finding({
            code: "nonstandard_section_heading",
            severity: "low",
            field: `sections[${sIdx}].title`,
            message: localized(
              cv,
              `"${sec.title}" standart bir ATS başlığına benzemiyor, bazı parser'lar tanımayabilir.`,
              `"${sec.title}" does not resemble a standard ATS heading; some parsers might not recognize it.`
            ),
          })
        );
      }
    }
  });

  // Calculate score
  let calculatedScore = 100;
  for (const f of findings) {
    calculatedScore -= SEVERITY_PENALTY[f.severity] || 0;
  }
  if (calculatedScore < 0) calculatedScore = 0;

  return new atsscore.FinalReport({
    score: calculatedScore,
    formatScore: calculatedScore,
    contentPending: true,
    formatFindings: findings,
    matchedSkills: [],
    missingSkills: [],
    suggestions: [],
  });
}
