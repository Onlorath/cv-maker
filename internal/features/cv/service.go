package cv

import (
	"context"
	"log/slog"
	
	"github.com/google/uuid"
	"cvmaker/internal/platform/cerr"
)

type Service interface {
	GetCV(ctx context.Context, id string) (*CV, error)
	ListCVs(ctx context.Context) ([]CV, error)
	CreateCV(ctx context.Context, req CreateCVRequest) (*CV, error)
	UpdateCV(ctx context.Context, c *CV) error
	DeleteCV(ctx context.Context, id string) error
	
	CreateSection(ctx context.Context, req CreateSectionRequest) (*Section, error)
	UpdateSection(ctx context.Context, s *Section) error
	DeleteSection(ctx context.Context, id string) error
	
	CreateEntry(ctx context.Context, req CreateEntryRequest) (*Entry, error)
	UpdateEntry(ctx context.Context, e *Entry) error
	DeleteEntry(ctx context.Context, id string) error
	
	ReorderSection(ctx context.Context, sectionID string, newOrderKey string) error
	ReorderEntry(ctx context.Context, entryID string, newOrderKey string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

type CreateCVRequest struct {
	Title    string
	Language string
	FullName string
	Email    string
}

func (s *service) CreateCV(ctx context.Context, req CreateCVRequest) (*CV, error) {
	if req.Title == "" || req.FullName == "" {
		return nil, cerr.New("VALIDATION_ERROR", "Title and FullName are required")
	}

	newCV := &CV{
		ID:         uuid.NewString(),
		Title:      req.Title,
		Language:   req.Language,
		TemplateID: "ats-classic", // Default
		FullName:   req.FullName,
		Email:      req.Email,
		Sections:   []Section{}, // Ensure it marshals to [] not null
	}

	if err := s.repo.CreateCV(ctx, newCV); err != nil {
		slog.ErrorContext(ctx, "failed to create cv via repo", "error", err)
		return nil, cerr.Wrap("DB_ERROR", "Failed to create CV", err)
	}

	return newCV, nil
}

func (s *service) GetCV(ctx context.Context, id string) (*CV, error) {
	return s.repo.GetCV(ctx, id)
}

func (s *service) ListCVs(ctx context.Context) ([]CV, error) {
	return s.repo.ListCVs(ctx)
}

func (s *service) UpdateCV(ctx context.Context, c *CV) error {
	if c.ID == "" || c.FullName == "" {
		return cerr.New("VALIDATION_ERROR", "ID and FullName are required")
	}
	return s.repo.UpdateCV(ctx, c)
}

func (s *service) DeleteCV(ctx context.Context, id string) error {
	return s.repo.DeleteCV(ctx, id)
}

type CreateSectionRequest struct {
	CVID        string
	SectionType SectionType
	Title       string
	OrderKey    string
}

func (s *service) CreateSection(ctx context.Context, req CreateSectionRequest) (*Section, error) {
	sec := &Section{
		ID:          uuid.NewString(),
		CVID:        req.CVID,
		SectionType: req.SectionType,
		Title:       req.Title,
		OrderKey:    req.OrderKey,
		Entries:     []Entry{},
	}
	if err := s.repo.CreateSection(ctx, sec); err != nil {
		return nil, err
	}
	return sec, nil
}

func (s *service) UpdateSection(ctx context.Context, sec *Section) error {
	if sec.ID == "" {
		return cerr.New("VALIDATION_ERROR", "section ID cannot be empty")
	}
	return s.repo.UpdateSection(ctx, sec)
}

func (s *service) DeleteSection(ctx context.Context, id string) error {
	return s.repo.DeleteSection(ctx, id)
}

type CreateEntryRequest struct {
	SectionID string
	OrderKey  string
	Title     string
}

func (s *service) CreateEntry(ctx context.Context, req CreateEntryRequest) (*Entry, error) {
	entry := &Entry{
		ID:        uuid.NewString(),
		SectionID: req.SectionID,
		OrderKey:  req.OrderKey,
		Title:     req.Title,
		Meta:      make(map[string]any),
	}
	if err := s.repo.CreateEntry(ctx, entry); err != nil {
		return nil, err
	}
	return entry, nil
}

func (s *service) UpdateEntry(ctx context.Context, e *Entry) error {
	if e.ID == "" {
		return cerr.New("VALIDATION_ERROR", "entry ID cannot be empty")
	}
	return s.repo.UpdateEntry(ctx, e)
}

func (s *service) DeleteEntry(ctx context.Context, id string) error {
	return s.repo.DeleteEntry(ctx, id)
}

func (s *service) ReorderSection(ctx context.Context, sectionID string, newOrderKey string) error {
	if newOrderKey == "" {
		return cerr.New("VALIDATION_ERROR", "orderKey cannot be empty")
	}
	return s.repo.ReorderSection(ctx, sectionID, newOrderKey)
}

func (s *service) ReorderEntry(ctx context.Context, entryID string, newOrderKey string) error {
	if newOrderKey == "" {
		return cerr.New("VALIDATION_ERROR", "orderKey cannot be empty")
	}
	return s.repo.ReorderEntry(ctx, entryID, newOrderKey)
}
