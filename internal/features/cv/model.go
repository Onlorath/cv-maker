package cv

import (
	"context"
	"time"
)

// SectionType corresponds directly to cv_sections.section_type
type SectionType string

const (
	SectionExperience     SectionType = "experience"
	SectionEducation      SectionType = "education"
	SectionSkills         SectionType = "skills"
	SectionLanguages      SectionType = "languages"
	SectionCertifications SectionType = "certifications"
	SectionProjects       SectionType = "projects"
	SectionCustom         SectionType = "custom"
)

type CV struct {
	ID         string    `json:"id" db:"id"`
	Title      string    `json:"title" db:"title"`
	Language   string    `json:"language" db:"language"` // "tr" | "en"
	TemplateID string    `json:"templateId" db:"template_id"`
	FullName   string    `json:"fullName" db:"full_name"`
	JobTitle   string    `json:"jobTitle" db:"job_title"`
	Email      string    `json:"email" db:"email"`
	Phone      string    `json:"phone" db:"phone"`
	Location   string    `json:"location" db:"location"`
	LinkedIn   string    `json:"linkedin" db:"linkedin"`
	GitHub     string    `json:"github" db:"github"`
	Website    string    `json:"website" db:"website"`
	Summary    string    `json:"summary" db:"summary"`
	PhotoPath  *string   `json:"photoPath,omitempty" db:"photo_path"`
	PhotoSize  int       `json:"photoSize" db:"photo_size"`
	SourceCVID *string   `json:"sourceCvId,omitempty" db:"source_cv_id"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time `json:"updatedAt" db:"updated_at"`

	Sections []Section `json:"sections,omitempty" db:"-"`
}

type Section struct {
	ID          string      `json:"id" db:"id"`
	CVID        string      `json:"cvId" db:"cv_id"`
	SectionType SectionType `json:"sectionType" db:"section_type"`
	Title       string      `json:"title" db:"title"`
	OrderKey    string      `json:"orderKey" db:"order_key"`
	CreatedAt   time.Time   `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time   `json:"updatedAt" db:"updated_at"`

	Entries []Entry `json:"entries,omitempty" db:"-"`
}

type Entry struct {
	ID          string    `json:"id" db:"id"`
	SectionID   string    `json:"sectionId" db:"section_id"`
	OrderKey    string    `json:"orderKey" db:"order_key"`
	Title       string    `json:"title" db:"title"`
	Subtitle    string    `json:"subtitle" db:"subtitle"`
	Location    string    `json:"location" db:"location"`
	DateStart   *string   `json:"dateStart,omitempty" db:"date_start"`
	DateEnd     *string   `json:"dateEnd,omitempty" db:"date_end"`
	IsCurrent   bool      `json:"isCurrent" db:"is_current"`
	Description string    `json:"description" db:"description"`
	MetaJSON    string    `json:"-" db:"meta_json"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`

	Meta map[string]any `json:"meta" db:"-"`
}

// Repository abstract the storage logic for CV domain
type Repository interface {
	GetCV(ctx context.Context, id string) (*CV, error)
	ListCVs(ctx context.Context) ([]CV, error)
	CreateCV(ctx context.Context, c *CV) error
	UpdateCV(ctx context.Context, c *CV) error
	DeleteCV(ctx context.Context, id string) error

	CreateSection(ctx context.Context, s *Section) error
	UpdateSection(ctx context.Context, s *Section) error
	DeleteSection(ctx context.Context, id string) error
	ReorderSection(ctx context.Context, id string, newOrderKey string) error

	CreateEntry(ctx context.Context, e *Entry) error
	UpdateEntry(ctx context.Context, e *Entry) error
	DeleteEntry(ctx context.Context, id string) error
	ReorderEntry(ctx context.Context, id string, newOrderKey string) error
}
