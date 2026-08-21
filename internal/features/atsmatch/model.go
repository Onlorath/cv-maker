package atsmatch

import "context"

// Suggestion, belirli bir CV entry'sine bağlı somut bir düzenleme önerisi.
type Suggestion struct {
	EntryID    string `json:"entryId"`
	Suggestion string `json:"suggestion"`
}

// MatchRequest, Gemini'ye gönderilecek ham girdi. CVJSON, cv.CV struct'ının
// json.Marshal çıktısı — bu paket cv paketine bağımlı olmasın diye burada
// zaten serialize edilmiş string olarak tutuluyor (service.go tarafında
// json.Marshal(cvData) ile üretilip buraya verilir).
type MatchRequest struct {
	JobDescription string `json:"jobDescription"`
	CVJSON         string `json:"cvJson"`
}

// MatchResponse, Gemini'nin zorunlu JSON şemasıyla döneceği yapı.
type MatchResponse struct {
	MatchScore    int          `json:"matchScore"` // 0-100
	MatchedSkills []string     `json:"matchedSkills"`
	MissingSkills []string     `json:"missingSkills"`
	Suggestions   []Suggestion `json:"suggestions"`
}

// Matcher, sağlayıcıyı soyutlar — translate.Translator ile aynı desen.
type Matcher interface {
	Match(ctx context.Context, req MatchRequest) (MatchResponse, error)
}
