package atsmatch

import (
	"context"
	"encoding/json"
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

// buildPrompt, JD ve CV JSON'ını Gemini'ye gönderir.
func buildPrompt(req MatchRequest) string {
	return fmt.Sprintf(`You are an expert technical recruiter comparing a candidate's CV against a job description.

Job description:
%s

Candidate's CV (JSON):
%s

Compare them and identify:
1. Which required skills/qualifications from the job description are genuinely present in the CV — including cases where the CV uses a different but equivalent term (e.g. the CV says "Docker" and the JD says "container orchestration" — that counts as a match, use your judgment, do not just do literal string matching).
2. Which important skills/qualifications from the job description are missing or not evidenced in the CV.
3. For up to 3 of the most impactful gaps, suggest a specific, honest rewording of an existing CV bullet (referencing its entryId) that would better surface a genuinely transferable skill the candidate likely already has, based on what's in the CV. Never invent an experience the candidate does not have.

IMPORTANT: Write all suggestions and skills in the same language as the candidate's CV (e.g. Turkish if the CV content/language is Turkish, English if English).`, req.JobDescription, req.CVJSON)
}

func buildSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"matchScore": {
				Type:        genai.TypeInteger,
				Description: "0-100 overall fit score",
			},
			"matchedSkills": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeString,
				},
			},
			"missingSkills": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeString,
				},
			},
			"suggestions": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"entryId": {
							Type: genai.TypeString,
						},
						"suggestion": {
							Type: genai.TypeString,
						},
					},
					Required: []string{"entryId", "suggestion"},
				},
			},
		},
		Required: []string{"matchScore", "matchedSkills", "missingSkills", "suggestions"},
	}
}

// geminiMatcher, Matcher'ın Gemini implementasyonu.
type geminiMatcher struct {
	apiKey string
	models []string
}

// NewGeminiMatcher creates a new Matcher with fallback models.
func NewGeminiMatcher(apiKey string) Matcher {
	return &geminiMatcher{
		apiKey: apiKey,
		models: []string{
			"gemini-3.7-flash",
			"gemini-3.1-flash-lite",
			"gemini-3.6-flash",
			"gemini-2.5-flash-lite",
			"gemini-2.0-flash-lite",
			"gemini-1.5-flash",
		},
	}
}

func (g *geminiMatcher) Match(ctx context.Context, req MatchRequest) (MatchResponse, error) {
	if g.apiKey == "" {
		return MatchResponse{}, fmt.Errorf("gemini API anahtarı ayarlanmamış")
	}

	// 45 saniyelik zaman aşımı (timeout)
	ctx, cancel := context.WithTimeout(ctx, 45*time.Second)
	defer cancel()

	client, err := genai.NewClient(ctx, option.WithAPIKey(g.apiKey))
	if err != nil {
		slog.ErrorContext(ctx, "failed to create gemini client for atsmatch", "error", err)
		return MatchResponse{}, fmt.Errorf("gemini istemcisi başlatılamadı: %w", err)
	}
	defer client.Close()

	prompt := buildPrompt(req)

	var lastErr error
	for i, modelName := range g.models {
		slog.DebugContext(ctx, "sending ats matching request to gemini",
			"model", modelName,
			"attempt", i+1,
			"totalModels", len(g.models),
		)

		model := client.GenerativeModel(modelName)
		model.SetTemperature(0.2)
		model.ResponseMIMEType = "application/json"
		model.ResponseSchema = buildSchema()

		resp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			lastErr = err
			if isRateLimitError(err) {
				slog.WarnContext(ctx, "gemini model rate limited (HTTP 429), falling back to next model",
					"model", modelName,
					"attempt", i+1,
					"error", err,
				)
			} else {
				slog.WarnContext(ctx, "gemini model invocation failed in atsmatch, attempting fallback",
					"model", modelName,
					"attempt", i+1,
					"error", err,
				)
			}
			continue
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("model %s returned empty candidates", modelName)
			slog.WarnContext(ctx, "gemini model returned empty response in atsmatch, attempting fallback",
				"model", modelName,
				"attempt", i+1,
			)
			continue
		}

		rawOutput := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
		var parsed MatchResponse
		
		// Artık model doğrudan JSON döneceği için (Structured Outputs)
		// ParseResponse içindeki markdown temizlemelerine gerek yok.
		if parseErr := json.Unmarshal([]byte(rawOutput), &parsed); parseErr != nil {
			slog.WarnContext(ctx, "failed to unmarshal gemini structured response in atsmatch",
				"model", modelName,
				"error", parseErr,
				"rawOutput", rawOutput,
			)
			lastErr = parseErr
			continue
		}
		
		// Güvenlik: 0-100 sınırı
		if parsed.MatchScore < 0 {
			parsed.MatchScore = 0
		} else if parsed.MatchScore > 100 {
			parsed.MatchScore = 100
		}

		slog.InfoContext(ctx, "gemini ats matching succeeded",
			"model", modelName,
			"matchScore", parsed.MatchScore,
			"attempt", i+1,
		)

		return parsed, nil
	}

	return MatchResponse{}, fmt.Errorf("ats eşleştirme analizi tamamlanamadı: %s", cleanErrorMessage(lastErr))
}
