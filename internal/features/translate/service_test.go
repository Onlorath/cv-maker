package translate

import (
	"fmt"
	"strings"
	"testing"
)

func TestBuildPrompt_TurkishToEnglish(t *testing.T) {
	req := TranslateRequest{
		SourceLanguage: "tr",
		TargetLanguage: "en",
		FieldType:      "bullet",
		Text:           "- Go ile mikroservis mimarisini yeniden tasarladı",
	}

	prompt := buildPrompt(req)

	if !strings.Contains(prompt, "Translate and adapt the following CV text from Turkish to English") {
		t.Errorf("expected prompt to mention Turkish to English, got: %s", prompt)
	}
	if !strings.Contains(prompt, "strong past-tense action verb") {
		t.Errorf("expected prompt to instruct strong action verb for English bullet, got: %s", prompt)
	}
	if !strings.Contains(prompt, req.Text) {
		t.Errorf("expected prompt to contain source text, got: %s", prompt)
	}
}

func TestBuildFullCVPrompt(t *testing.T) {
	jsonPayload := `{"jobTitle":"Yazılım Mühendisi","summary":"Deneyimli geliştirici"}`
	prompt := buildFullCVPrompt(jsonPayload, "tr", "en")

	if !strings.Contains(prompt, "Turkish to English") {
		t.Errorf("expected prompt to contain Turkish to English, got: %s", prompt)
	}
	if !strings.Contains(prompt, "ATS Resume Quality") {
		t.Errorf("expected prompt to instruct ATS Resume Quality, got: %s", prompt)
	}
	if !strings.Contains(prompt, jsonPayload) {
		t.Errorf("expected prompt to contain json payload, got: %s", prompt)
	}
}

func TestCleanErrorMessage(t *testing.T) {
	errWithKey := fmt.Errorf("Post https://generativelanguage.googleapis.com?key=AIzaSyD12345: context deadline exceeded")
	cleaned := cleanErrorMessage(errWithKey)

	if strings.Contains(cleaned, "AIzaSyD12345") {
		t.Errorf("expected API key to be sanitized, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "Zaman Aşımı") && !strings.Contains(cleaned, "zaman aşımına") {
		t.Errorf("expected clean timeout message, got: %s", cleaned)
	}
}
