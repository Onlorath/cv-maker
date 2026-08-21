package atsscore

import (
	"math"

	"cvmaker/internal/features/atscheck"
	"cvmaker/internal/features/atsmatch"
)

// Ağırlıklar, araştırmadaki bulguya dayanıyor: ATS parse hatalarının ~%23'ü
// format kaynaklı, ~%77'si içerik kaynaklı (bkz. ats-uyumluluk-gereksinimleri.md).
// %25/%75 olarak yuvarladık.
const (
	FormatWeight  = 0.25
	ContentWeight = 0.75
)

type FinalReport struct {
	Score          int                   `json:"score"` // nihai yüzde, 0-100
	FormatScore    int                   `json:"formatScore"`
	ContentScore   *int                  `json:"contentScore,omitempty"` // JD verilmediyse nil
	FormatFindings []atscheck.Finding    `json:"formatFindings"`
	MatchedSkills  []string              `json:"matchedSkills,omitempty"`
	MissingSkills  []string              `json:"missingSkills,omitempty"`
	Suggestions    []atsmatch.Suggestion `json:"suggestions,omitempty"`
	// ContentPending, henüz bir iş ilanı yapıştırılmadığını belirtir — UI bu
	// durumda "iş ilanı ekle, eşleşme puanını gör" gibi bir CTA gösterebilir.
	ContentPending bool `json:"contentPending"`
}

// Combine, hem format hem içerik raporu elindeyken (kullanıcı bir iş ilanı
// yapıştırıp eşleştirme çalıştırdığında) çağrılır.
func Combine(format atscheck.Report, match atsmatch.MatchResponse) FinalReport {
	final := int(math.Round(float64(format.Score)*FormatWeight + float64(match.MatchScore)*ContentWeight))
	contentScore := match.MatchScore
	return FinalReport{
		Score:          final,
		FormatScore:    format.Score,
		ContentScore:   &contentScore,
		FormatFindings: format.Findings,
		MatchedSkills:  match.MatchedSkills,
		MissingSkills:  match.MissingSkills,
		Suggestions:    match.Suggestions,
		ContentPending: false,
	}
}

// FormatOnly, henüz bir iş ilanı verilmediğinde çağrılır — sadece format
// puanını gösterir, %75'lik içerik kısmını nihai skora hiç karıştırmaz.
// Bunu format_score * 0.25 olarak göstermek yanıltıcı olurdu (kullanıcı
// "neden puanım bu kadar düşük" diye sorar, oysa henüz eşleştirme hiç
// çalışmadı) — o yüzden bu durumda nihai skor doğrudan format skoruyla
// eşit tutuluyor, sadece contentPending=true ile UI'ya "bu eksik" sinyali
// veriliyor.
func FormatOnly(format atscheck.Report) FinalReport {
	return FinalReport{
		Score:          format.Score,
		FormatScore:    format.Score,
		ContentScore:   nil,
		FormatFindings: format.Findings,
		ContentPending: true,
	}
}
