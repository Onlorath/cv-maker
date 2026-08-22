package atscheck

import (
	"strings"
	"testing"

	"cvmaker/internal/features/cv"
)

func strPtr(s string) *string { return &s }

func goodCV() *cv.CV {
	return &cv.CV{
		FullName: "Yusuf Şahin Öztürk",
		Email:    "yusuf@example.com",
		Phone:    "+90 555 123 45 67",
		Summary:  "Gerçek zamanlı sistemler üzerine deneyimli bir full stack geliştirici.",
		Sections: []cv.Section{
			{
				Title:       "Deneyim",
				SectionType: cv.SectionExperience,
				Entries: []cv.Entry{
					{
						Title:       "Full Stack Geliştirici",
						Subtitle:    "Kartelam",
						DateStart:   strPtr("2023-05"),
						IsCurrent:   true,
						Description: "- Mikroservis mimarisini yeniden tasarladı\n- Gecikmeyi %30 azalttı",
					},
				},
			},
			{
				Title:       "Yetenekler",
				SectionType: cv.SectionSkills,
				Entries: []cv.Entry{
					{Title: "Go"},
					{Title: "TypeScript"},
				},
			},
		},
	}
}

func TestGoodCV_ScoresHigh(t *testing.T) {
	report := Run(goodCV())
	if report.Score != 100 {
		t.Errorf("beklenen skor 100, alınan %d, bulgular: %+v", report.Score, report.Findings)
	}
	if len(report.Findings) != 0 {
		t.Errorf("temiz bir CV'de bulgu beklenmiyordu, alınan: %+v", report.Findings)
	}
}

func TestMissingFullName_IsCritical(t *testing.T) {
	c := goodCV()
	c.FullName = ""
	report := Run(c)
	if !hasCode(report.Findings, "missing_full_name") {
		t.Errorf("missing_full_name bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
	if report.Score > 40 {
		t.Errorf("ad-soyad eksikken skor çok yüksek kaldı: %d", report.Score)
	}
}

func TestInvalidEmail(t *testing.T) {
	c := goodCV()
	c.Email = "yusuf-at-example"
	report := Run(c)
	if !hasCode(report.Findings, "invalid_email_format") {
		t.Errorf("invalid_email_format bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
}

func TestEmptyEmail(t *testing.T) {
	c := goodCV()
	c.Email = ""
	report := Run(c)
	if !hasCode(report.Findings, "missing_email") {
		t.Errorf("missing_email bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
}

func TestEmptySection(t *testing.T) {
	c := goodCV()
	c.Sections = append(c.Sections, cv.Section{
		Title:       "Eğitim",
		SectionType: cv.SectionEducation,
		Entries:     nil,
	})
	report := Run(c)
	if !hasCode(report.Findings, "empty_section") {
		t.Errorf("empty_section bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
}

func TestInconsistentDateFormat(t *testing.T) {
	c := goodCV()
	c.Sections[0].Entries[0].DateStart = strPtr("Mayıs 2023")
	report := Run(c)
	if !hasCode(report.Findings, "inconsistent_date_format") {
		t.Errorf("inconsistent_date_format bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
}

func TestDateNotRequiredForSkillsSection(t *testing.T) {
	// skills section'ında tarih alanı yok, bu yüzden tarih kontrolü hiç tetiklenmemeli
	c := goodCV()
	report := Run(c)
	for _, f := range report.Findings {
		if f.Code == "inconsistent_date_format" {
			t.Errorf("skills section için tarih kontrolü tetiklenmemeliydi: %+v", f)
		}
	}
}

func TestLongUnbrokenDescription(t *testing.T) {
	c := goodCV()
	c.Sections[0].Entries[0].Description = strings.Repeat("çok uzun tek paragraf metin ", 30)
	report := Run(c)
	if !hasCode(report.Findings, "unbroken_long_description") {
		t.Errorf("unbroken_long_description bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
}

func TestLongDescriptionWithBulletsIsFine(t *testing.T) {
	c := goodCV()
	long := strings.Repeat("madde ", 100)
	c.Sections[0].Entries[0].Description = "- " + long + "\n- ikinci madde " + long
	report := Run(c)
	if hasCode(report.Findings, "unbroken_long_description") {
		t.Errorf("bullet'lı uzun açıklama için bulgu üretilmemeliydi: %+v", report.Findings)
	}
}

func TestNonstandardCustomSectionHeading(t *testing.T) {
	c := goodCV()
	c.Sections = append(c.Sections, cv.Section{
		Title:       "Maceralarım",
		SectionType: cv.SectionCustom,
		Entries:     []cv.Entry{{Title: "bir şey"}},
	})
	report := Run(c)
	if !hasCode(report.Findings, "nonstandard_section_heading") {
		t.Errorf("nonstandard_section_heading bulgusu bekleniyordu, alınan: %+v", report.Findings)
	}
}

func TestKnownCustomSectionHeadingPasses(t *testing.T) {
	c := goodCV()
	c.Sections = append(c.Sections, cv.Section{
		Title:       "Projeler",
		SectionType: cv.SectionCustom,
		Entries:     []cv.Entry{{Title: "bir şey"}},
	})
	report := Run(c)
	if hasCode(report.Findings, "nonstandard_section_heading") {
		t.Errorf("'Projeler' bilinen bir başlık, bulgu üretilmemeliydi: %+v", report.Findings)
	}
}

func TestScoreNeverGoesBelowZero(t *testing.T) {
	c := &cv.CV{} // her şey boş, mümkün olan en kötü durum
	c.Sections = []cv.Section{
		{Title: "x", SectionType: cv.SectionExperience},
		{Title: "y", SectionType: cv.SectionExperience},
		{Title: "z", SectionType: cv.SectionExperience},
	}
	report := Run(c)
	if report.Score < 0 {
		t.Errorf("skor negatif olamaz, alınan: %d", report.Score)
	}
	t.Logf("en kötü senaryo skoru: %d, bulgu sayısı: %d", report.Score, len(report.Findings))
}

func TestEnglishCV_ProducesEnglishFindings(t *testing.T) {
	c := &cv.CV{
		Language: "en",
		FullName: "",
		Email:    "invalid-email",
		Phone:    "",
		Summary:  "",
		Sections: []cv.Section{
			{
				Title:       "Work Experience",
				SectionType: cv.SectionExperience,
				Entries:     nil,
			},
		},
	}

	report := Run(c)
	for _, f := range report.Findings {
		switch f.Code {
		case "missing_full_name":
			if !strings.Contains(f.Message, "Full name is missing") {
				t.Errorf("expected English missing_full_name message, got: %s", f.Message)
			}
		case "invalid_email_format":
			if !strings.Contains(f.Message, "Email format appears invalid") {
				t.Errorf("expected English invalid_email_format message, got: %s", f.Message)
			}
		case "missing_phone":
			if !strings.Contains(f.Message, "Phone number is empty") {
				t.Errorf("expected English missing_phone message, got: %s", f.Message)
			}
		case "missing_summary":
			if !strings.Contains(f.Message, "Professional summary is empty") {
				t.Errorf("expected English missing_summary message, got: %s", f.Message)
			}
		case "empty_section":
			if !strings.Contains(f.Message, "section has been added but contains no entries") {
				t.Errorf("expected English empty_section message, got: %s", f.Message)
			}
		}
	}
}

func TestTurkishCV_ProducesTurkishFindings(t *testing.T) {
	c := &cv.CV{
		Language: "tr",
		FullName: "",
		Email:    "invalid-email",
		Phone:    "",
		Summary:  "",
		Sections: []cv.Section{
			{
				Title:       "Deneyim",
				SectionType: cv.SectionExperience,
				Entries:     nil,
			},
		},
	}

	report := Run(c)
	for _, f := range report.Findings {
		switch f.Code {
		case "missing_full_name":
			if !strings.Contains(f.Message, "Ad soyad boş") {
				t.Errorf("expected Turkish missing_full_name message, got: %s", f.Message)
			}
		case "invalid_email_format":
			if !strings.Contains(f.Message, "E-posta formatı geçersiz") {
				t.Errorf("expected Turkish invalid_email_format message, got: %s", f.Message)
			}
		case "missing_phone":
			if !strings.Contains(f.Message, "Telefon numarası boş") {
				t.Errorf("expected Turkish missing_phone message, got: %s", f.Message)
			}
		case "missing_summary":
			if !strings.Contains(f.Message, "Özet bölümü boş") {
				t.Errorf("expected Turkish missing_summary message, got: %s", f.Message)
			}
		case "empty_section":
			if !strings.Contains(f.Message, "bölümü eklenmiş ama içi boş") {
				t.Errorf("expected Turkish empty_section message, got: %s", f.Message)
			}
		}
	}
}

func hasCode(findings []Finding, code string) bool {
	for _, f := range findings {
		if f.Code == code {
			return true
		}
	}
	return false
}
