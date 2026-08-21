package translate

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"

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
	base := fmt.Sprintf(
		"You are a professional resume writer and translator. "+
			"Translate the following CV text from %s to %s. "+
			"Do not translate literally — rewrite it the way a native %s resume "+
			"would phrase it, following standard resume conventions for that language.\n\n",
		req.SourceLanguage, req.TargetLanguage, req.TargetLanguage,
	)

	switch req.FieldType {
	case "summary":
		base += "This is a professional summary (2-4 sentences). Keep it concise, " +
			"confident, and free of first-person pronouns where the target language " +
			"convention omits them.\n\n"
	case "bullet":
		base += "This is a single resume bullet point describing a responsibility or " +
			"achievement. Rewrite it starting with a strong action verb in the target " +
			"language, keep it to one line, quantify impact if a number is present in " +
			"the source. Do not invent numbers that are not in the source.\n\n"
	case "title":
		base += "This is a job title or section heading. Use the standard equivalent " +
			"term used in the target language's job market, not a literal translation.\n\n"
	}

	base += "Preserve proper nouns (company names, product names, technology names, " +
		"university names) exactly as written — do not translate them.\n\n"
	base += "Return ONLY the translated text, no preamble, no quotes, no explanation.\n\n"
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
			"gemini-flash-latest",
			"gemini-flash-lite-latest",
		},
	}
}

func (g *geminiTranslator) TranslateCV(ctx context.Context, req TranslateRequest) (TranslateResponse, error) {
	if g.apiKey == "" {
		return TranslateResponse{}, fmt.Errorf("gemini API anahtarı ayarlanmamış")
	}

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

		translatedText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
		slog.InfoContext(ctx, "gemini translation succeeded",
			"model", modelName,
			"fieldType", req.FieldType,
			"attempt", i+1,
		)

		return TranslateResponse{
			TranslatedText: translatedText,
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
