package translate

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"cvmaker/internal/features/cv"

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

// cleanErrorMessage sanitizes error strings, stripping API keys and providing clean user-facing explanations.
func cleanErrorMessage(err error) string {
	if err == nil {
		return ""
	}
	errStr := err.Error()
	if idx := strings.Index(errStr, "key="); idx != -1 {
		endIdx := strings.IndexAny(errStr[idx:], " \t\n\r\"'&")
		if endIdx != -1 {
			errStr = errStr[:idx] + "key=[PROTECTED]" + errStr[idx+endIdx:]
		} else {
			errStr = errStr[:idx] + "key=[PROTECTED]"
		}
	}
	if errors.Is(err, context.DeadlineExceeded) || strings.Contains(strings.ToLower(errStr), "deadline") || strings.Contains(strings.ToLower(errStr), "timeout") {
		return "Yapay zeka yanıt süresi zaman aşımına uğradı (Timeout). Lütfen tekrar deneyin."
	}
	if isRateLimitError(err) {
		return "Yapay zeka istek limiti aşıldı (Rate Limit), lütfen biraz sonra tekrar deneyin."
	}
	return errStr
}

// Translator abstracts translation and ATS localization services.
type Translator interface {
	TranslateCV(ctx context.Context, req TranslateRequest) (TranslateResponse, error)
	TranslateFullCV(ctx context.Context, c *cv.CV, targetLanguage string) (*cv.CV, error)
}

type TranslateRequest struct {
	SourceLanguage string // "tr" | "en" | "auto"
	TargetLanguage string // "en" | "tr"
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

type fullCVPayload struct {
	JobTitle string                 `json:"jobTitle,omitempty"`
	Summary  string                 `json:"summary,omitempty"`
	Sections []fullCVSectionPayload `json:"sections,omitempty"`
}

type fullCVSectionPayload struct {
	ID          string               `json:"id"`
	SectionType string               `json:"sectionType"`
	Title       string               `json:"title"`
	Entries     []fullCVEntryPayload `json:"entries,omitempty"`
}

type fullCVEntryPayload struct {
	ID          string `json:"id"`
	Title       string `json:"title,omitempty"`
	Subtitle    string `json:"subtitle,omitempty"`
	Location    string `json:"location,omitempty"`
	Description string `json:"description,omitempty"`
}

func buildFullCVPrompt(payloadJSON string, sourceLang, targetLang string) string {
	targetLangDesc := "English"
	if strings.ToLower(targetLang) == "tr" || strings.ToLower(targetLang) == "turkish" {
		targetLangDesc = "Turkish"
	}
	sourceLangDesc := "Turkish"
	if strings.ToLower(sourceLang) == "en" || strings.ToLower(sourceLang) == "english" {
		sourceLangDesc = "English"
	}

	return fmt.Sprintf(`You are an expert ATS executive resume writer and career translator.
Translate and professionally adapt the following entire CV payload from %s to %s.

CRITICAL TRANSLATION RULES:
1. ATS Resume Quality: Rewrite summaries, job titles, and bullet points to match native %s resume conventions (strong action verbs, quantified accomplishments, concise tone, no first-person pronouns like 'I' or 'my').
2. Preserve Proper Nouns: DO NOT translate or alter company names, product names, frameworks/libraries/tools (e.g. React, TypeScript, Go, Docker, Kubernetes, AWS, PostgreSQL, Redis, Figma, Tailwind), and university names.
3. Preserve IDs & Structure: Retain the EXACT 'id' and 'sectionType' for every section and entry without changing or dropping any items.
4. Section Headings: For section titles, use standard professional headings in %s (e.g. 'İş Deneyimi' <-> 'Experience', 'Eğitim' <-> 'Education', 'Projeler' <-> 'Projects', 'Yetenekler' <-> 'Skills').
5. Location: Translate city/country names naturally (e.g. 'İstanbul, Türkiye' <-> 'Istanbul, Turkey').
6. Output Format: Return strictly a valid JSON object matching this structure:
{
  "jobTitle": "string",
  "summary": "string",
  "sections": [
    {
      "id": "string (preserve exact original id)",
      "sectionType": "string (preserve exact original sectionType)",
      "title": "string (translated section heading)",
      "entries": [
        {
          "id": "string (preserve exact original id)",
          "title": "string (translated position or school)",
          "subtitle": "string (translated company or degree)",
          "location": "string (translated city/country)",
          "description": "string (translated bullet points)"
        }
      ]
    }
  ]
}

Input CV JSON:
%s`, sourceLangDesc, targetLangDesc, targetLangDesc, targetLangDesc, payloadJSON)
}

type geminiTranslator struct {
	apiKey string
	models []string
}

// NewGeminiTranslator creates a new translator prioritizing the user's 500 RPD Flash-Lite model.
func NewGeminiTranslator(apiKey string) Translator {
	return &geminiTranslator{
		apiKey: apiKey,
		models: []string{
			"gemini-3.1-flash-lite",
			"gemini-2.5-flash-lite",
			"gemini-2.0-flash-lite",
			"gemini-1.5-flash",
		},
	}
}

func (g *geminiTranslator) TranslateCV(ctx context.Context, req TranslateRequest) (TranslateResponse, error) {
	if g.apiKey == "" {
		return TranslateResponse{}, fmt.Errorf("gemini API anahtarı ayarlanmamış")
	}

	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(g.apiKey))
	if err != nil {
		slog.ErrorContext(ctx, "failed to create gemini client", "error", err)
		return TranslateResponse{}, fmt.Errorf("gemini istemcisi başlatılamadı: %s", cleanErrorMessage(err))
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
			slog.WarnContext(ctx, "gemini translation failed, attempting fallback",
				"model", modelName,
				"attempt", i+1,
				"error", cleanErrorMessage(err),
			)
			continue
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("model %s returned empty candidates", modelName)
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
	return TranslateResponse{}, fmt.Errorf("çeviri işlemi tamamlanamadı: %s", cleanErrorMessage(lastErr))
}

func (g *geminiTranslator) TranslateFullCV(ctx context.Context, c *cv.CV, targetLanguage string) (*cv.CV, error) {
	if g.apiKey == "" {
		return nil, fmt.Errorf("gemini API anahtarı ayarlanmamış")
	}
	if c == nil {
		return nil, fmt.Errorf("cv verisi boş olamaz")
	}

	// 60 saniyelik zaman aşımı (tüm CV için)
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(g.apiKey))
	if err != nil {
		slog.ErrorContext(ctx, "failed to create gemini client for full cv translation", "error", err)
		return nil, fmt.Errorf("gemini istemcisi başlatılamadı: %s", cleanErrorMessage(err))
	}
	defer client.Close()

	// Build translatable payload
	payload := fullCVPayload{
		JobTitle: c.JobTitle,
		Summary:  c.Summary,
		Sections: make([]fullCVSectionPayload, 0, len(c.Sections)),
	}

	for _, sec := range c.Sections {
		secPayload := fullCVSectionPayload{
			ID:          sec.ID,
			SectionType: string(sec.SectionType),
			Title:       sec.Title,
			Entries:     make([]fullCVEntryPayload, 0, len(sec.Entries)),
		}
		for _, ent := range sec.Entries {
			secPayload.Entries = append(secPayload.Entries, fullCVEntryPayload{
				ID:          ent.ID,
				Title:       ent.Title,
				Subtitle:    ent.Subtitle,
				Location:    ent.Location,
				Description: ent.Description,
			})
		}
		payload.Sections = append(payload.Sections, secPayload)
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("cv verisi serileştirilemedi: %w", err)
	}

	prompt := buildFullCVPrompt(string(payloadBytes), c.Language, targetLanguage)

	var lastErr error
	for i, modelName := range g.models {
		slog.InfoContext(ctx, "sending full cv translation request to gemini",
			"model", modelName,
			"targetLanguage", targetLanguage,
			"attempt", i+1,
		)

		model := client.GenerativeModel(modelName)
		model.SetTemperature(0.2)
		model.ResponseMIMEType = "application/json"

		resp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			lastErr = err
			slog.WarnContext(ctx, "gemini full cv translation attempt failed",
				"model", modelName,
				"attempt", i+1,
				"error", cleanErrorMessage(err),
			)
			continue
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("model %s returned empty candidates", modelName)
			continue
		}

		jsonText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
		jsonText = strings.TrimSpace(jsonText)
		jsonText = strings.TrimPrefix(jsonText, "```json")
		jsonText = strings.TrimPrefix(jsonText, "```")
		jsonText = strings.TrimSuffix(jsonText, "```")
		jsonText = strings.TrimSpace(jsonText)

		var translatedPayload fullCVPayload
		if err := json.Unmarshal([]byte(jsonText), &translatedPayload); err != nil {
			lastErr = fmt.Errorf("çeviri yanıtı JSON olarak çözümlenemedi: %w", err)
			slog.WarnContext(ctx, "failed to unmarshal full cv translation response", "error", err, "raw", jsonText)
			continue
		}

		// Create deep copy of CV to apply translations
		resCV := *c
		resCV.JobTitle = translatedPayload.JobTitle
		resCV.Summary = translatedPayload.Summary
		resCV.Language = targetLanguage

		// Map translated sections & entries by ID
		translatedSecMap := make(map[string]fullCVSectionPayload, len(translatedPayload.Sections))
		for _, s := range translatedPayload.Sections {
			translatedSecMap[s.ID] = s
		}

		resSections := make([]cv.Section, len(c.Sections))
		for si, origSec := range c.Sections {
			newSec := origSec
			if tSec, ok := translatedSecMap[origSec.ID]; ok {
				if tSec.Title != "" {
					newSec.Title = tSec.Title
				}
				translatedEntMap := make(map[string]fullCVEntryPayload, len(tSec.Entries))
				for _, e := range tSec.Entries {
					translatedEntMap[e.ID] = e
				}

				newEntries := make([]cv.Entry, len(origSec.Entries))
				for ei, origEnt := range origSec.Entries {
					newEnt := origEnt
					if tEnt, ok := translatedEntMap[origEnt.ID]; ok {
						newEnt.Title = tEnt.Title
						newEnt.Subtitle = tEnt.Subtitle
						newEnt.Location = tEnt.Location
						newEnt.Description = tEnt.Description
					}
					newEntries[ei] = newEnt
				}
				newSec.Entries = newEntries
			}
			resSections[si] = newSec
		}
		resCV.Sections = resSections

		slog.InfoContext(ctx, "gemini full cv translation completed successfully",
			"model", modelName,
			"targetLanguage", targetLanguage,
		)

		return &resCV, nil
	}

	return nil, fmt.Errorf("tüm CV çevirisi tamamlanamadı: %s", cleanErrorMessage(lastErr))
}
