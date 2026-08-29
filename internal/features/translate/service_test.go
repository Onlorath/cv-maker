package translate

import (
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

func TestBuildPrompt_EnglishToTurkish(t *testing.T) {
	req := TranslateRequest{
		SourceLanguage: "en",
		TargetLanguage: "tr",
		FieldType:      "summary",
		Text:           "Full-stack software engineer with 5+ years of experience in distributed systems.",
	}

	prompt := buildPrompt(req)

	if !strings.Contains(prompt, "Translate and adapt the following CV text from English to Turkish") {
		t.Errorf("expected prompt to mention English to Turkish, got: %s", prompt)
	}
	if !strings.Contains(prompt, "Turkish resume tone") {
		t.Errorf("expected prompt to instruct Turkish resume tone, got: %s", prompt)
	}
	if !strings.Contains(prompt, req.Text) {
		t.Errorf("expected prompt to contain source text, got: %s", prompt)
	}
}
