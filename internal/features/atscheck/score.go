package atscheck

// Severity başına ceza puanı. 100'den başlayıp bu değerler düşülür.
// Sayılar keyfi değil, mantık şu: critical tek başına puanı çökertmeli
// (bir CV'nin adı yoksa %25'lik format skorunun neredeyse tamamı gitmeli),
// low ise birikimli olarak fark yaratmalı ama tek başına anlamsız olmalı.
var severityPenalty = map[Severity]int{
	SeverityCritical: 60,
	SeverityHigh:     25,
	SeverityMedium:   10,
	SeverityLow:      4,
}

// computeScore, bulgu listesinden 0-100 arası bir puan üretir.
// Aynı severity'den çok sayıda bulgu birikimli olarak düşer ama 0'ın altına
// inmez. Bilinçli olarak basit tutuldu: her bulgu bağımsız bir ceza, bulgular
// arası etkileşim (örn "email de yok, telefon da yok" için ekstra ceza) yok —
// bu karmaşıklık şu an gerekli değil, sonradan eklenir.
func computeScore(findings []Finding) int {
	score := 100
	for _, f := range findings {
		score -= severityPenalty[f.Severity]
	}
	if score < 0 {
		score = 0
	}
	return score
}
