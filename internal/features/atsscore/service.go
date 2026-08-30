package atsscore

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"cvmaker/internal/features/atscheck"
	"cvmaker/internal/features/atsmatch"
	"cvmaker/internal/features/cv"
)

// Service coordinates format checking and job description matching.
type Service interface {
	FormatCheck(c *cv.CV) FinalReport
	FullCheck(ctx context.Context, c *cv.CV, jobDescription string, apiKey string) (FinalReport, error)
	FullCheckWithMatcher(ctx context.Context, c *cv.CV, jobDescription string, matcher atsmatch.Matcher) (FinalReport, error)
}

type service struct{}

// NewService creates a new ATS coordinator service.
func NewService() Service {
	return &service{}
}

// FormatCheck runs deterministic ATS format checks against the CV.
func (s *service) FormatCheck(c *cv.CV) FinalReport {
	if c == nil {
		return FinalReport{}
	}
	report := atscheck.Run(c)
	return FormatOnly(report)
}

// FullCheck runs deterministic format checks and Gemini JD matching with the given API key.
func (s *service) FullCheck(ctx context.Context, c *cv.CV, jobDescription string, apiKey string) (FinalReport, error) {
	if c == nil {
		return FinalReport{}, fmt.Errorf("cv verisi boş olamaz")
	}

	formatReport := atscheck.Run(c)
	trimmedJD := strings.TrimSpace(jobDescription)
	if trimmedJD == "" {
		return FormatOnly(formatReport), nil
	}

	trimmedKey := strings.TrimSpace(apiKey)
	if trimmedKey == "" {
		return FormatOnly(formatReport), fmt.Errorf("iş ilanı eşleştirmesi için Gemini API anahtarı gereklidir")
	}

	matcher := atsmatch.NewGeminiMatcher(trimmedKey)
	return s.FullCheckWithMatcher(ctx, c, trimmedJD, matcher)
}

// FullCheckWithMatcher coordinates format checking and matching using the provided Matcher interface.
func (s *service) FullCheckWithMatcher(ctx context.Context, c *cv.CV, jobDescription string, matcher atsmatch.Matcher) (FinalReport, error) {
	if c == nil {
		return FinalReport{}, fmt.Errorf("cv verisi boş olamaz")
	}

	formatReport := atscheck.Run(c)
	trimmedJD := strings.TrimSpace(jobDescription)
	if trimmedJD == "" {
		return FormatOnly(formatReport), nil
	}

	if matcher == nil {
		return FormatOnly(formatReport), fmt.Errorf("matcher cannot be nil")
	}

	// Temporary ID Mapping to protect LLM from hallucinating long UUIDs
	idMap := make(map[string]string) // tempID -> realUUID
	mappedCV := *c

	// Base64 photo stripped to save context tokens and avoid 429 Rate Limits
	mappedCV.PhotoPath = nil

	mappedSections := make([]cv.Section, len(c.Sections))
	tempCounter := 1
	for i, sec := range c.Sections {
		mappedSec := sec
		mappedEntries := make([]cv.Entry, len(sec.Entries))
		for j, entry := range sec.Entries {
			tempID := fmt.Sprintf("e%d", tempCounter)
			tempCounter++

			idMap[tempID] = entry.ID
			mappedEntry := entry
			mappedEntry.ID = tempID
			mappedEntries[j] = mappedEntry
		}
		mappedSec.Entries = mappedEntries
		mappedSections[i] = mappedSec
	}
	mappedCV.Sections = mappedSections

	cvJSONBytes, err := json.Marshal(mappedCV)
	if err != nil {
		return FinalReport{}, fmt.Errorf("cv verisi serileştirilemedi: %w", err)
	}

	matchResp, err := matcher.Match(ctx, atsmatch.MatchRequest{
		JobDescription: trimmedJD,
		CVJSON:         string(cvJSONBytes),
	})
	if err != nil {
		return FinalReport{}, err
	}

	// Restore original UUIDs in suggestions
	for i, sug := range matchResp.Suggestions {
		if realID, ok := idMap[sug.EntryID]; ok {
			matchResp.Suggestions[i].EntryID = realID
		}
	}

	return Combine(formatReport, matchResp), nil
}
