package atscheck

import (
	"fmt"
	"regexp"
	"strings"

	"cvmaker/internal/features/cv"
)

var (
	emailRe = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	dateRe  = regexp.MustCompile(`(?i)^\p{L}+ \d{4}$`)
	// Türkçe telefon için katı bir format şartı koymuyoruz (uluslararası +90,
	// yerel 0 ile başlayan, boşluklu/boşluksuz hepsi geçerli olabilir) —
	// sadece "en az 7 rakam var mı" gibi gevşek bir varlık kontrolü yapıyoruz.
	phoneDigitsRe = regexp.MustCompile(`\d`)

	// Section tipi "custom" olduğunda, section.Title'ın en azından bilinen
	// bir eşdeğere yakın olup olmadığını kabaca kontrol etmek için: bu liste
	// kesin bir doğrulama değil, sadece en sık karşılaşılan standart başlıkları
	// tanımak için var. Eşleşmezse mutlaka yanlış demek değil, sadece riskli.
	knownHeadings = []string{
		"deneyim", "iş deneyimi", "eğitim", "yetenekler", "diller",
		"sertifikalar", "projeler", "özet",
		"experience", "work experience", "education", "skills",
		"languages", "certifications", "projects", "summary",
	}
)

// checkFullName: ad-soyad boşsa CV'nin en temel kimliği eksik demektir.
func checkFullName(c *cv.CV) []Finding {
	if strings.TrimSpace(c.FullName) == "" {
		msg := "Ad soyad boş. Bu alan olmadan CV'nin kimliği ATS'te tanımlanamaz."
		if strings.EqualFold(c.Language, "en") {
			msg = "Full name is missing. Without this field, the resume identity cannot be established in ATS."
		}
		return []Finding{{
			Code:     "missing_full_name",
			Severity: SeverityCritical,
			Field:    "fullName",
			Message:  msg,
		}}
	}
	return nil
}

// checkEmail: e-posta boşsa ya da formatı geçersizse recruiter'ın seni
// bulacağı ana kanal kayboluyor demektir.
func checkEmail(c *cv.CV) []Finding {
	email := strings.TrimSpace(c.Email)
	isEn := strings.EqualFold(c.Language, "en")
	if email == "" {
		msg := "E-posta adresi boş. Çoğu ATS iletişim bilgisini zorunlu alan olarak bekler."
		if isEn {
			msg = "Email address is missing. Most ATS systems require contact information as a mandatory field."
		}
		return []Finding{{
			Code:     "missing_email",
			Severity: SeverityHigh,
			Field:    "email",
			Message:  msg,
		}}
	}
	if !emailRe.MatchString(email) {
		msg := fmt.Sprintf("E-posta formatı geçersiz görünüyor: %q", email)
		if isEn {
			msg = fmt.Sprintf("Email format appears invalid: %q", email)
		}
		return []Finding{{
			Code:     "invalid_email_format",
			Severity: SeverityHigh,
			Field:    "email",
			Message:  msg,
		}}
	}
	return nil
}

// checkPhone: telefon zorunlu değil ama boşsa ya da rakam içermiyorsa uyar.
func checkPhone(c *cv.CV) []Finding {
	phone := strings.TrimSpace(c.Phone)
	isEn := strings.EqualFold(c.Language, "en")
	if phone == "" {
		msg := "Telefon numarası boş. Zorunlu değil ama doldurulması önerilir."
		if isEn {
			msg = "Phone number is empty. Not mandatory, but recommended."
		}
		return []Finding{{
			Code:     "missing_phone",
			Severity: SeverityMedium,
			Field:    "phone",
			Message:  msg,
		}}
	}
	digitCount := len(phoneDigitsRe.FindAllString(phone, -1))
	if digitCount < 7 {
		msg := fmt.Sprintf("Telefon numarası çok az rakam içeriyor (%d rakam), kontrol et: %q", digitCount, phone)
		if isEn {
			msg = fmt.Sprintf("Phone number contains too few digits (%d digits), please verify: %q", digitCount, phone)
		}
		return []Finding{{
			Code:     "suspicious_phone_format",
			Severity: SeverityMedium,
			Field:    "phone",
			Message:  msg,
		}}
	}
	return nil
}

// checkSummaryPresent: özet zorunlu değil, ama boşsa recruiter'ın ilk 5
// saniyede göreceği en önemli alan boş kalıyor demektir — düşük önem.
func checkSummaryPresent(c *cv.CV) []Finding {
	if strings.TrimSpace(c.Summary) == "" {
		msg := "Özet bölümü boş. Zorunlu değil ama doldurulması güçlü önerilir."
		if strings.EqualFold(c.Language, "en") {
			msg = "Professional summary is empty. Not mandatory, but strongly recommended."
		}
		return []Finding{{
			Code:     "missing_summary",
			Severity: SeverityLow,
			Field:    "summary",
			Message:  msg,
		}}
	}
	return nil
}

// checkSectionsNotEmpty: bir section var ama içinde hiç entry yoksa,
// kullanıcı section'ı ekleyip doldurmayı unutmuş olabilir.
func checkSectionsNotEmpty(c *cv.CV) []Finding {
	var findings []Finding
	isEn := strings.EqualFold(c.Language, "en")
	for i, s := range c.Sections {
		if len(s.Entries) == 0 {
			msg := fmt.Sprintf("%q bölümü eklenmiş ama içi boş.", s.Title)
			if isEn {
				msg = fmt.Sprintf("%q section has been added but contains no entries.", s.Title)
			}
			findings = append(findings, Finding{
				Code:     "empty_section",
				Severity: SeverityMedium,
				Field:    fmt.Sprintf("sections[%d]", i),
				Message:  msg,
			})
		}
	}
	return findings
}

// checkDateConsistency: work-history tipi section'larda (experience, education,
// certifications, projects) dateStart alanı doluysa Ay Yıl formatına uymalı.
// skills/languages/custom section'larda tarih beklenmediği için kontrol edilmiyor.
func checkDateConsistency(c *cv.CV) []Finding {
	dateRequiredTypes := map[cv.SectionType]bool{
		cv.SectionExperience:     true,
		cv.SectionEducation:      true,
		cv.SectionCertifications: true,
		cv.SectionProjects:       true,
	}

	var findings []Finding
	isEn := strings.EqualFold(c.Language, "en")
	for si, s := range c.Sections {
		if !dateRequiredTypes[s.SectionType] {
			continue
		}
		for ei, e := range s.Entries {
			if e.DateStart == nil || strings.TrimSpace(*e.DateStart) == "" {
				continue // tarih girilmemiş olabilir, bu ayrı ve daha düşük öncelikli bir konu
			}
			if !dateRe.MatchString(strings.TrimSpace(*e.DateStart)) {
				msg := fmt.Sprintf("Tarih formatı beklenmedik: %q (beklenen: Ay Yıl, örn: May 2026)", *e.DateStart)
				if isEn {
					msg = fmt.Sprintf("Unexpected date format: %q (expected: Month YYYY, e.g. May 2026)", *e.DateStart)
				}
				findings = append(findings, Finding{
					Code:     "inconsistent_date_format",
					Severity: SeverityMedium,
					Field:    fmt.Sprintf("sections[%d].entries[%d].dateStart", si, ei),
					Message:  msg,
				})
			}
			if e.DateEnd != nil && strings.TrimSpace(*e.DateEnd) != "" && !e.IsCurrent {
				if !dateRe.MatchString(strings.TrimSpace(*e.DateEnd)) {
					msg := fmt.Sprintf("Tarih formatı beklenmedik: %q (beklenen: Ay Yıl, örn: May 2026)", *e.DateEnd)
					if isEn {
						msg = fmt.Sprintf("Unexpected date format: %q (expected: Month YYYY, e.g. May 2026)", *e.DateEnd)
					}
					findings = append(findings, Finding{
						Code:     "inconsistent_date_format",
						Severity: SeverityMedium,
						Field:    fmt.Sprintf("sections[%d].entries[%d].dateEnd", si, ei),
						Message:  msg,
					})
				}
			}
		}
	}
	return findings
}

// checkLongUnbrokenDescription: 500+ karakterlik, madde işaretine bölünmemiş
// tek paragraf açıklamalar bazı parser'larda düzgün ayrıştırılamıyor.
func checkLongUnbrokenDescription(c *cv.CV) []Finding {
	var findings []Finding
	isEn := strings.EqualFold(c.Language, "en")
	for si, s := range c.Sections {
		for ei, e := range s.Entries {
			desc := strings.TrimSpace(e.Description)
			if len(desc) < 500 {
				continue
			}
			hasBullets := strings.Contains(desc, "\n-") || strings.Contains(desc, "\n*") || strings.HasPrefix(desc, "-") || strings.HasPrefix(desc, "*")
			if !hasBullets {
				msg := fmt.Sprintf("%q girdisinin açıklaması %d karakter ve madde işaretine bölünmemiş.", e.Title, len(desc))
				if isEn {
					msg = fmt.Sprintf("Description for %q is %d characters and not broken into bullet points.", e.Title, len(desc))
				}
				findings = append(findings, Finding{
					Code:     "unbroken_long_description",
					Severity: SeverityLow,
					Field:    fmt.Sprintf("sections[%d].entries[%d].description", si, ei),
					Message:  msg,
				})
			}
		}
	}
	return findings
}

// checkCustomSectionHeadings: section_type "custom" olduğunda, başlığın bilinen
// bir standarda yakın olup olmadığını kabaca kontrol eder. Bire bir doğrulama
// değil — sadece "bu başlık parser'a hiç tanıdık gelmeyebilir" uyarısı.
func checkCustomSectionHeadings(c *cv.CV) []Finding {
	var findings []Finding
	isEn := strings.EqualFold(c.Language, "en")
	for i, s := range c.Sections {
		if s.SectionType != cv.SectionCustom {
			continue
		}
		title := strings.ToLower(strings.TrimSpace(s.Title))
		known := false
		for _, k := range knownHeadings {
			if strings.Contains(title, k) {
				known = true
				break
			}
		}
		if !known {
			msg := fmt.Sprintf("%q standart bir ATS başlığına benzemiyor, bazı parser'lar tanımayabilir.", s.Title)
			if isEn {
				msg = fmt.Sprintf("%q does not resemble a standard ATS heading; some parsers might not recognize it.", s.Title)
			}
			findings = append(findings, Finding{
				Code:     "nonstandard_section_heading",
				Severity: SeverityLow,
				Field:    fmt.Sprintf("sections[%d].title", i),
				Message:  msg,
			})
		}
	}
	return findings
}

// allChecks, Run tarafından sırayla çalıştırılan kontrol listesi. Yeni bir
// kontrol eklemek istediğinde sadece bu listeye bir fonksiyon eklemen yeterli.
var allChecks = []func(*cv.CV) []Finding{
	checkFullName,
	checkEmail,
	checkPhone,
	checkSummaryPresent,
	checkSectionsNotEmpty,
	checkDateConsistency,
	checkLongUnbrokenDescription,
	checkCustomSectionHeadings,
}

// Run, bir CV üzerinde tüm deterministik kontrolleri çalıştırıp bir Report üretir.
func Run(c *cv.CV) Report {
	var findings []Finding
	for _, check := range allChecks {
		findings = append(findings, check(c)...)
	}
	return Report{
		Findings: findings,
		Score:    computeScore(findings),
	}
}
