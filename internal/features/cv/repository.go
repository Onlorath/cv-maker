package cv

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/jmoiron/sqlx"
)

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetCV(ctx context.Context, id string) (*CV, error) {
	var c CV
	err := r.db.GetContext(ctx, &c, "SELECT * FROM cvs WHERE id = ?", id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("cv not found")
		}
		return nil, fmt.Errorf("failed to get cv: %w", err)
	}

	// Fetch sections
	var sections []Section
	err = r.db.SelectContext(ctx, &sections, "SELECT * FROM cv_sections WHERE cv_id = ? ORDER BY order_key ASC", id)
	if err != nil {
		return nil, fmt.Errorf("failed to get sections: %w", err)
	}

	// Fetch all entries for this CV to avoid N+1 problem on entries
	var allEntries []Entry
	err = r.db.SelectContext(ctx, &allEntries, `
		SELECT e.* 
		FROM cv_entries e
		JOIN cv_sections s ON e.section_id = s.id
		WHERE s.cv_id = ? 
		ORDER BY e.order_key ASC
	`, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get entries: %w", err)
	}

	// Unmarshal JSON meta and group entries by section_id
	entriesBySection := make(map[string][]Entry)
	for i := range allEntries {
		if allEntries[i].MetaJSON != "" {
			var meta map[string]any
			if err := json.Unmarshal([]byte(allEntries[i].MetaJSON), &meta); err != nil {
				slog.WarnContext(ctx, "failed to unmarshal entry meta json", "entryId", allEntries[i].ID, "error", err)
			} else {
				allEntries[i].Meta = meta
			}
		} else {
			allEntries[i].Meta = make(map[string]any)
		}
		entriesBySection[allEntries[i].SectionID] = append(entriesBySection[allEntries[i].SectionID], allEntries[i])
	}

	// Attach entries to their respective sections
	for i := range sections {
		sections[i].Entries = entriesBySection[sections[i].ID]
		if sections[i].Entries == nil {
			sections[i].Entries = []Entry{}
		}
	}

	c.Sections = sections
	if c.Sections == nil {
		c.Sections = []Section{}
	}
	return &c, nil
}

func (r *repository) ListCVs(ctx context.Context) ([]CV, error) {
	var cvs []CV
	err := r.db.SelectContext(ctx, &cvs, "SELECT * FROM cvs ORDER BY updated_at DESC")
	if err != nil {
		return nil, fmt.Errorf("failed to list cvs: %w", err)
	}
	return cvs, nil
}

func (r *repository) CreateCV(ctx context.Context, c *CV) error {
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()

	query := `
		INSERT INTO cvs (
			id, title, language, template_id, full_name, job_title, 
			email, phone, location, linkedin, github, website, 
			summary, photo_path, source_cv_id, created_at, updated_at
		) VALUES (
			:id, :title, :language, :template_id, :full_name, :job_title,
			:email, :phone, :location, :linkedin, :github, :website,
			:summary, :photo_path, :source_cv_id, :created_at, :updated_at
		)`
	_, err := r.db.NamedExecContext(ctx, query, c)
	if err != nil {
		return fmt.Errorf("failed to create cv: %w", err)
	}
	return nil
}

func (r *repository) UpdateCV(ctx context.Context, c *CV) error {
	c.UpdatedAt = time.Now()
	query := `
		UPDATE cvs SET
			title = :title, language = :language, template_id = :template_id,
			full_name = :full_name, job_title = :job_title, email = :email,
			phone = :phone, location = :location, linkedin = :linkedin,
			github = :github, website = :website, summary = :summary,
			photo_path = :photo_path, updated_at = :updated_at
		WHERE id = :id`
	
	res, err := r.db.NamedExecContext(ctx, query, c)
	if err != nil {
		return fmt.Errorf("failed to update cv: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("cv not found for update")
	}
	return nil
}

func (r *repository) DeleteCV(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM cvs WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete cv: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("cv not found for deletion")
	}
	return nil
}

// Section operations

func (r *repository) CreateSection(ctx context.Context, s *Section) error {
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()

	query := `
		INSERT INTO cv_sections (id, cv_id, section_type, title, order_key, created_at, updated_at)
		VALUES (:id, :cv_id, :section_type, :title, :order_key, :created_at, :updated_at)`
	_, err := r.db.NamedExecContext(ctx, query, s)
	if err != nil {
		return fmt.Errorf("failed to create section: %w", err)
	}
	return nil
}

func (r *repository) UpdateSection(ctx context.Context, s *Section) error {
	s.UpdatedAt = time.Now()
	query := `
		UPDATE cv_sections SET
			title = :title, updated_at = :updated_at
		WHERE id = :id`
	_, err := r.db.NamedExecContext(ctx, query, s)
	return err
}

func (r *repository) DeleteSection(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM cv_sections WHERE id = ?", id)
	return err
}

func (r *repository) ReorderSection(ctx context.Context, id string, newOrderKey string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE cv_sections SET order_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", newOrderKey, id)
	return err
}

// Entry operations

func (r *repository) prepareEntry(e *Entry) error {
	if e.Meta != nil {
		b, err := json.Marshal(e.Meta)
		if err != nil {
			return err
		}
		e.MetaJSON = string(b)
	} else {
		e.MetaJSON = "{}"
	}
	return nil
}

func (r *repository) CreateEntry(ctx context.Context, e *Entry) error {
	if err := r.prepareEntry(e); err != nil {
		return err
	}
	e.CreatedAt = time.Now()
	e.UpdatedAt = time.Now()

	query := `
		INSERT INTO cv_entries (
			id, section_id, order_key, title, subtitle, location,
			date_start, date_end, is_current, description, meta_json,
			created_at, updated_at
		) VALUES (
			:id, :section_id, :order_key, :title, :subtitle, :location,
			:date_start, :date_end, :is_current, :description, :meta_json,
			:created_at, :updated_at
		)`
	_, err := r.db.NamedExecContext(ctx, query, e)
	if err != nil {
		return fmt.Errorf("failed to create entry: %w", err)
	}
	return nil
}

func (r *repository) UpdateEntry(ctx context.Context, e *Entry) error {
	if err := r.prepareEntry(e); err != nil {
		return err
	}
	e.UpdatedAt = time.Now()

	query := `
		UPDATE cv_entries SET
			title = :title, subtitle = :subtitle, location = :location,
			date_start = :date_start, date_end = :date_end, is_current = :is_current,
			description = :description, meta_json = :meta_json, updated_at = :updated_at
		WHERE id = :id`
	_, err := r.db.NamedExecContext(ctx, query, e)
	return err
}

func (r *repository) DeleteEntry(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM cv_entries WHERE id = ?", id)
	return err
}

func (r *repository) ReorderEntry(ctx context.Context, id string, newOrderKey string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE cv_entries SET order_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", newOrderKey, id)
	return err
}
