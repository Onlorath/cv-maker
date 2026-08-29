package translate

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/googleapi"
	"google.golang.org/api/option"
)

// isRateLimitError checks if an error represents an HTTP 429 Too Many Requests or quota exhaustion.
func isRateLimitError(err error) bool {
	if err == nil {
		return false
	}
	var gErr *googleapi.Error
	if errors.As(err, &gErr) && gErr.Code == http.StatusTooManyRequests {
		return true
	}
	errStr := strings.ToLower(err.Error())
	return strings.Contains(errStr, "429") ||
		strings.Contains(errStr, "resource_exhausted") ||
		strings.Contains(errStr, "quota") ||
		strings.Contains(errStr, "rate limit")
}

// Translator, çeviri sağlayıcısını soyutlar.
type Translator interface {
	TranslateCV(ctx context.Context, req TranslateRequest) (TranslateResponse, error)
}

type TranslateRequest struct {
	SourceLanguage string // "tr"
	TargetLanguage string // "en"
	FieldType      string // "summary" | "bullet" | "title" | "generic"
	Text           string
}

type TranslateResponse struct {
	TranslatedText string `json:"translatedText"`
	Note           string `json:"note"`
}

func buildPrompt(req TranslateRequest) string {
	sourceLang := req.SourceLanguage
	switch strings.ToLower(sourceLang) {
	case "tr", "turkish":
		sourceLang = "Turkish"
	case "en", "english":
		sourceLang = "English"
	default:
		sourceLang = "the source language"
	}

	targetLang := req.TargetLanguage
	switch strings.ToLower(targetLang) {
	case "tr", "turkish":
		targetLang = "Turkish"
	case "en", "english":
		targetLang = "English"
	default:
		targetLang = "English"
	}

	base := fmt.Sprintf(
		"You are an expert ATS resume writer and professional career translator. "+
			"Translate and adapt the following CV text from %s to %s.\n"+
			"Do not translate literally — rewrite it so that it reads naturally, confidently, and professionally in %s, adhering to modern resume best practices.\n\n",
		sourceLang, targetLang, targetLang,
	)

	if targetLang == "Turkish" {
		switch req.FieldType {
		case "summary":
			base += "This is a professional career summary (2-4 sentences). Rewrite it in clear, concise, professional Turkish resume tone, avoiding casual phrasing.\n\n"
		case "bullet":
			base += "This is a resume bullet point. Rewrite it starting with strong active verbs in Turkish (e.g. 'Geliştirdi', 'Yeniden mimarisini kurdu', 'Optimize ederek %40 performans artışı sağladı'). Keep bullet structure, preserve any metrics, and do not invent new facts.\n\n"
		case "title":
			base += "This is a job title, degree name, or section heading. Use the standard professional equivalent used in the Turkish job market (e.g. 'Yazılım Geliştirici', 'Kıdemli Sistem Mimarı').\n\n"
		default:
			base += "Translate this CV text into natural, professional Turkish resume language.\n\n"
		}
	} else {
		// English target
		switch req.FieldType {
		case "summary":
			base += "This is a professional career summary (2-4 sentences). Keep it concise, impactful, confident, and free of first-person pronouns (no 'I' or 'my').\n\n"
		case "bullet":
			base += "This is a resume bullet point describing a responsibility or achievement. Rewrite it starting with a strong past-tense action verb (e.g. 'Architected', 'Spearheaded', 'Optimized', 'Engineered'). Keep it to one line, quantify impact if numbers are present. Do not invent numbers.\n\n"
		case "title":
			base += "This is a job title, degree, or section heading. Use standard international / US tech resume terminology, not a literal translation.\n\n"
		default:
			base += "Translate this CV text into natural, professional English resume language.\n\n"
		}
	}

	base += "Preserve all proper nouns (company names, product names, technology names like React, Go, Docker, AWS, PostgreSQL, university names) exactly as written — do not translate or alter them.\n\n"
	base += "Return ONLY the translated text, no preamble, no markdown quotes, no explanations.\n\n"
	base += "Text:\n" + req.Text

	return base
}

type geminiTranslator struct {
	apiKey string
	models []string
}

// NewGeminiTranslator creates a new translator with fallback models.
func NewGeminiTranslator(apiKey string) Translator {
	return &geminiTranslator{
		apiKey: apiKey,
		models: []string{
			"gemini-3.6-flash",
			"gemini-3.1-flash-lite",
		},
	}
}

func (g *geminiTranslator) TranslateCV(ctx context.Context, req TranslateRequest) (TranslateResponse, error) {
	if g.apiKey == "" {
		return TranslateResponse{}, fmt.Errorf("gemini API anahtarı ayarlanmamış")
	}

	// 15 saniyelik kesin zaman aşımı (timeout) ekliyoruz.
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(g.apiKey))
	if err != nil {
		slog.ErrorContext(ctx, "failed to create gemini client", "error", err)
		return TranslateResponse{}, fmt.Errorf("gemini istemcisi başlatılamadı: %w", err)
	}
	defer client.Close()

	prompt := buildPrompt(req)

	var lastErr error
	for i, modelName := range g.models {
		slog.DebugContext(ctx, "sending translation request to gemini",
			"model", modelName,
			"fieldType", req.FieldType,
			"attempt", i+1,
			"totalModels", len(g.models),
		)

		model := client.GenerativeModel(modelName)
		model.SetTemperature(0.2)

		resp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			lastErr = err
			if isRateLimitError(err) {
				slog.WarnContext(ctx, "gemini model rate limited (HTTP 429), immediately falling back to next model",
					"model", modelName,
					"attempt", i+1,
					"error", err,
				)
			} else {
				slog.WarnContext(ctx, "gemini model invocation failed, attempting fallback",
					"model", modelName,
					"attempt", i+1,
					"error", err,
				)
			}
			continue
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("model %s returned empty candidates", modelName)
			slog.WarnContext(ctx, "gemini model returned empty response, attempting fallback",
				"model", modelName,
				"attempt", i+1,
			)
			continue
		}

		rawText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
		cleaned := strings.TrimSpace(rawText)
		cleaned = strings.TrimPrefix(cleaned, "```markdown")
		cleaned = strings.TrimPrefix(cleaned, "```")
		cleaned = strings.TrimSuffix(cleaned, "```")
		cleaned = strings.TrimSpace(cleaned)
		if len(cleaned) >= 2 && ((cleaned[0] == '"' && cleaned[len(cleaned)-1] == '"') || (cleaned[0] == '\'' && cleaned[len(cleaned)-1] == '\'')) {
			cleaned = strings.TrimSpace(cleaned[1 : len(cleaned)-1])
		}

		slog.InfoContext(ctx, "gemini translation succeeded",
			"model", modelName,
			"fieldType", req.FieldType,
			"attempt", i+1,
		)

		return TranslateResponse{
			TranslatedText: cleaned,
			Note:           "",
		}, nil
	}

	slog.ErrorContext(ctx, "all gemini translation models failed", "lastError", lastErr)

	// User-friendly error shielding: Do not leak raw 429 stack traces or API internals to UI
	if isRateLimitError(lastErr) {
		return TranslateResponse{}, fmt.Errorf("yapay zeka istek limiti aşıldı (Rate Limit), lütfen birkaç saniye sonra tekrar deneyin")
	}

	return TranslateResponse{}, fmt.Errorf("çeviri işlemi tamamlanamadı: %w", lastErr)
}
