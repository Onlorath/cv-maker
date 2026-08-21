package atsmatch

import (
	"encoding/json"
	"fmt"
	"strings"
)

// ParseResponse, Gemini'nin ham metin çıktısını MatchResponse'a çevirir.
//
// LLM'ler "sadece JSON döndür" dense bile sık sık çıktıyı ```json ... ```
// bloğuna sarar, bazen öncesine/sonrasına açıklama cümlesi ekler. Bu fonksiyon
// bunu tolere eder: markdown code fence'i temizler, ilk "{" ile son "}"
// arasındaki bölümü alır, sonra parse eder. Gerçekten bozuk JSON gelirse
// hatayı olduğu gibi yukarı taşır — burada sessizce varsayılan değerlere
// düşmek yanlış olur, çağıran taraf kullanıcıya "AI analizi başarısız,
// tekrar dene" göstermeli.
func ParseResponse(raw string) (MatchResponse, error) {
	cleaned := strings.TrimSpace(raw)
	cleaned = strings.TrimPrefix(cleaned, "```json")
	cleaned = strings.TrimPrefix(cleaned, "```")
	cleaned = strings.TrimSuffix(cleaned, "```")
	cleaned = strings.TrimSpace(cleaned)

	start := strings.Index(cleaned, "{")
	end := strings.LastIndex(cleaned, "}")
	if start == -1 || end == -1 || end < start {
		return MatchResponse{}, fmt.Errorf("atsmatch: yanıtta JSON nesnesi bulunamadı: %q", raw)
	}
	cleaned = cleaned[start : end+1]

	var resp MatchResponse
	if err := json.Unmarshal([]byte(cleaned), &resp); err != nil {
		return MatchResponse{}, fmt.Errorf("atsmatch: JSON parse hatası: %w (ham: %q)", err, cleaned)
	}

	// Model 0-100 dışında bir değer uydurursa (olur, LLM'ler bazen -5 ya da
	// 150 gibi saçma sonuçlar verir), sessizce clamp ediyoruz — bunun için
	// kullanıcıya hata göstermeye değmez, sadece sınırlıyoruz.
	if resp.MatchScore < 0 {
		resp.MatchScore = 0
	}
	if resp.MatchScore > 100 {
		resp.MatchScore = 100
	}

	return resp, nil
}
