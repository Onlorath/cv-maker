package atsmatch

import "testing"

func TestParseResponse_CleanJSON(t *testing.T) {
	raw := `{"matchScore": 78, "matchedSkills": ["Go", "PostgreSQL"], "missingSkills": ["Kubernetes"], "suggestions": []}`
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if resp.MatchScore != 78 {
		t.Errorf("matchScore 78 bekleniyordu, alınan %d", resp.MatchScore)
	}
	if len(resp.MatchedSkills) != 2 || resp.MatchedSkills[0] != "Go" {
		t.Errorf("matchedSkills beklenmedik: %+v", resp.MatchedSkills)
	}
}

func TestParseResponse_MarkdownJSONFence(t *testing.T) {
	raw := "```json\n{\"matchScore\": 60, \"matchedSkills\": [], \"missingSkills\": [\"Docker\"], \"suggestions\": []}\n```"
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if resp.MatchScore != 60 {
		t.Errorf("matchScore 60 bekleniyordu, alınan %d", resp.MatchScore)
	}
}

func TestParseResponse_PlainFenceNoLangTag(t *testing.T) {
	raw := "```\n{\"matchScore\": 45, \"matchedSkills\": [], \"missingSkills\": [], \"suggestions\": []}\n```"
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if resp.MatchScore != 45 {
		t.Errorf("matchScore 45 bekleniyordu, alınan %d", resp.MatchScore)
	}
}

func TestParseResponse_ExtraProseAroundJSON(t *testing.T) {
	// Bazı modeller "sadece JSON" dense bile öncesine/sonrasına cümle ekliyor.
	raw := "Sure, here is the analysis:\n{\"matchScore\": 90, \"matchedSkills\": [\"Go\"], \"missingSkills\": [], \"suggestions\": []}\nLet me know if you need more."
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if resp.MatchScore != 90 {
		t.Errorf("matchScore 90 bekleniyordu, alınan %d", resp.MatchScore)
	}
}

func TestParseResponse_ScoreClampedAboveHundred(t *testing.T) {
	raw := `{"matchScore": 140, "matchedSkills": [], "missingSkills": [], "suggestions": []}`
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if resp.MatchScore != 100 {
		t.Errorf("140 -> 100'e clamp edilmeliydi, alınan %d", resp.MatchScore)
	}
}

func TestParseResponse_ScoreClampedBelowZero(t *testing.T) {
	raw := `{"matchScore": -20, "matchedSkills": [], "missingSkills": [], "suggestions": []}`
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if resp.MatchScore != 0 {
		t.Errorf("-20 -> 0'a clamp edilmeliydi, alınan %d", resp.MatchScore)
	}
}

func TestParseResponse_MalformedJSON_ReturnsError(t *testing.T) {
	raw := `{"matchScore": 50, "matchedSkills": [` // kırık JSON
	_, err := ParseResponse(raw)
	if err == nil {
		t.Fatal("bozuk JSON için hata bekleniyordu, nil döndü")
	}
}

func TestParseResponse_NoJSONAtAll_ReturnsError(t *testing.T) {
	raw := "Üzgünüm, bu isteği işleyemiyorum."
	_, err := ParseResponse(raw)
	if err == nil {
		t.Fatal("JSON içermeyen yanıt için hata bekleniyordu, nil döndü")
	}
}

func TestParseResponse_SuggestionsParsedCorrectly(t *testing.T) {
	raw := `{"matchScore": 55, "matchedSkills": [], "missingSkills": ["CI/CD"], "suggestions": [{"entryId": "e1", "suggestion": "CI/CD deneyimini vurgula"}]}`
	resp, err := ParseResponse(raw)
	if err != nil {
		t.Fatalf("beklenmeyen hata: %v", err)
	}
	if len(resp.Suggestions) != 1 || resp.Suggestions[0].EntryID != "e1" {
		t.Errorf("suggestions beklenmedik: %+v", resp.Suggestions)
	}
}
