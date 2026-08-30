package atsscore

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"cvmaker/internal/features/atsmatch"
	"cvmaker/internal/features/cv"
)

type mockMatcher struct {
	matchFunc func(ctx context.Context, req atsmatch.MatchRequest) (atsmatch.MatchResponse, error)
}

func (m *mockMatcher) Match(ctx context.Context, req atsmatch.MatchRequest) (atsmatch.MatchResponse, error) {
	if m.matchFunc != nil {
		return m.matchFunc(ctx, req)
	}
	return atsmatch.MatchResponse{}, nil
}

func TestService_FormatCheck(t *testing.T) {
	service := NewService()

	// Nil CV
	reportNil := service.FormatCheck(nil)
	if reportNil.Score != 0 {
		t.Errorf("expected score 0 for nil CV, got %d", reportNil.Score)
	}

	// Valid CV
	testCV := &cv.CV{
		FullName: "Jane Doe",
		Email:    "jane@example.com",
		Phone:    "+90 555 123 4567",
		Summary:  "Experienced Software Engineer",
		Language: "en",
	}

	report := service.FormatCheck(testCV)
	if report.Score == 0 {
		t.Errorf("expected non-zero score for valid CV, got %d", report.Score)
	}
	if !report.ContentPending {
		t.Errorf("expected ContentPending=true for FormatCheck, got false")
	}
}

func TestService_FullCheckWithMatcher(t *testing.T) {
	service := NewService()
	ctx := context.Background()

	realUUID1 := "11111111-2222-3333-4444-555555555555"
	realUUID2 := "66666666-7777-8888-9999-000000000000"
	photo := "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

	testCV := &cv.CV{
		ID:        "cv-123",
		FullName:  "John Doe",
		Email:     "john@example.com",
		Phone:     "+90 555 123 4567",
		Summary:   "Senior Backend Developer with Go expertise.",
		Language:  "en",
		PhotoPath: &photo,
		Sections: []cv.Section{
			{
				ID:          "sec-1",
				Title:       "Experience",
				SectionType: cv.SectionExperience,
				Entries: []cv.Entry{
					{
						ID:          realUUID1,
						Title:       "Software Engineer",
						Subtitle:    "Tech Corp",
						Description: "- Built high throughput microservices in Go.",
					},
					{
						ID:          realUUID2,
						Title:       "Junior Developer",
						Subtitle:    "Startup Hub",
						Description: "- Maintained REST APIs and SQL databases.",
					},
				},
			},
		},
	}

	var capturedReq atsmatch.MatchRequest
	mock := &mockMatcher{
		matchFunc: func(ctx context.Context, req atsmatch.MatchRequest) (atsmatch.MatchResponse, error) {
			capturedReq = req
			return atsmatch.MatchResponse{
				MatchScore:    88,
				MatchedSkills: []string{"Go", "Microservices"},
				MissingSkills: []string{"Kubernetes"},
				Suggestions: []atsmatch.Suggestion{
					{
						EntryID:    "e1",
						Suggestion: "Highlight container orchestration experience in Tech Corp bullet.",
					},
				},
			}, nil
		},
	}

	report, err := service.FullCheckWithMatcher(ctx, testCV, "We need a Senior Go Engineer with Kubernetes experience.", mock)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify photo was stripped in the request to Gemini
	var sentCV cv.CV
	if err := json.Unmarshal([]byte(capturedReq.CVJSON), &sentCV); err != nil {
		t.Fatalf("failed to unmarshal sent CV JSON: %v", err)
	}
	if sentCV.PhotoPath != nil {
		t.Errorf("expected PhotoPath to be stripped in sent CV JSON, got non-nil")
	}

	// Verify temporary ID mapping was sent to Gemini
	if len(sentCV.Sections) == 0 || len(sentCV.Sections[0].Entries) < 2 {
		t.Fatalf("expected 2 entries sent in section, got %v", sentCV.Sections)
	}
	if sentCV.Sections[0].Entries[0].ID != "e1" || sentCV.Sections[0].Entries[1].ID != "e2" {
		t.Errorf("expected mapped IDs e1 and e2, got %s and %s", sentCV.Sections[0].Entries[0].ID, sentCV.Sections[0].Entries[1].ID)
	}

	// Verify suggestion EntryID was restored back to the real UUID
	if len(report.Suggestions) == 0 {
		t.Fatalf("expected suggestions in report, got none")
	}
	if report.Suggestions[0].EntryID != realUUID1 {
		t.Errorf("expected suggestion EntryID restored to %s, got %s", realUUID1, report.Suggestions[0].EntryID)
	}

	if report.ContentPending {
		t.Errorf("expected ContentPending=false, got true")
	}
	if report.Score <= 0 {
		t.Errorf("expected combined score > 0, got %d", report.Score)
	}
}

func TestService_FullCheck_Errors(t *testing.T) {
	service := NewService()
	ctx := context.Background()

	testCV := &cv.CV{
		FullName: "Jane Doe",
		Email:    "jane@example.com",
	}

	// Empty JD should return format-only report without error
	rep, err := service.FullCheck(ctx, testCV, "", "dummy-key")
	if err != nil {
		t.Fatalf("expected nil error for empty JD, got %v", err)
	}
	if !rep.ContentPending {
		t.Errorf("expected ContentPending=true for empty JD")
	}

	// Empty API key should return error
	_, err = service.FullCheck(ctx, testCV, "Some Job Description", "")
	if err == nil {
		t.Fatalf("expected error for empty API key, got nil")
	}

	// Nil CV
	_, err = service.FullCheck(ctx, nil, "Job Desc", "key")
	if err == nil {
		t.Fatalf("expected error for nil CV, got nil")
	}

	// Matcher failure
	failingMock := &mockMatcher{
		matchFunc: func(ctx context.Context, req atsmatch.MatchRequest) (atsmatch.MatchResponse, error) {
			return atsmatch.MatchResponse{}, errors.New("gemini network error")
		},
	}
	_, err = service.FullCheckWithMatcher(ctx, testCV, "Job Desc", failingMock)
	if err == nil {
		t.Fatalf("expected error when matcher fails, got nil")
	}
}
