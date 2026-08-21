package atscheck

// Severity, bir bulgunun puanlamayı ne kadar sert etkileyeceğini belirler.
// Sayısal ceza değerleri score.go'da tanımlı, burada sadece kategori var.
type Severity string

const (
	SeverityCritical Severity = "critical" // CV'yi pratikte parse edilemez yapar
	SeverityHigh     Severity = "high"     // ciddi veri kaybı riski
	SeverityMedium   Severity = "medium"   // parser'ı yanıltabilir ama veri kaybolmaz
	SeverityLow      Severity = "low"      // iyileştirme önerisi, uyumluluğu bloklamaz
)

// Finding, tek bir kontrolün ürettiği tek bir bulgu.
type Finding struct {
	Code     string   `json:"code"`     // örn "missing_email" — UI'da i18n/ikon eşlemesi için sabit anahtar
	Severity Severity `json:"severity"`
	Field    string   `json:"field"`    // örn "email" veya "sections[1].entries[0].dateStart"
	Message  string   `json:"message"`  // kullanıcıya gösterilecek Türkçe açıklama
}

// Report, tüm kontrollerin toplu sonucu.
type Report struct {
	Findings []Finding `json:"findings"`
	Score    int       `json:"score"` // 0-100, format/parse-edilebilirlik puanı (nihai ATS puanının %25'i)
}
