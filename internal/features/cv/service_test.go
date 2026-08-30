package cv

import (
	"context"
	"errors"
	"testing"
)

type mockRepository struct {
	getCVFunc          func(ctx context.Context, id string) (*CV, error)
	listCVsFunc        func(ctx context.Context) ([]CV, error)
	createCVFunc       func(ctx context.Context, c *CV) error
	updateCVFunc       func(ctx context.Context, c *CV) error
	deleteCVFunc       func(ctx context.Context, id string) error
	createSectionFunc  func(ctx context.Context, s *Section) error
	updateSectionFunc  func(ctx context.Context, s *Section) error
	deleteSectionFunc  func(ctx context.Context, id string) error
	reorderSectionFunc func(ctx context.Context, id string, newOrderKey string) error
	createEntryFunc    func(ctx context.Context, e *Entry) error
	updateEntryFunc    func(ctx context.Context, e *Entry) error
	deleteEntryFunc    func(ctx context.Context, id string) error
	reorderEntryFunc   func(ctx context.Context, id string, newOrderKey string) error
}

func (m *mockRepository) GetCV(ctx context.Context, id string) (*CV, error) {
	if m.getCVFunc != nil {
		return m.getCVFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockRepository) ListCVs(ctx context.Context) ([]CV, error) {
	if m.listCVsFunc != nil {
		return m.listCVsFunc(ctx)
	}
	return nil, nil
}

func (m *mockRepository) CreateCV(ctx context.Context, c *CV) error {
	if m.createCVFunc != nil {
		return m.createCVFunc(ctx, c)
	}
	return nil
}

func (m *mockRepository) UpdateCV(ctx context.Context, c *CV) error {
	if m.updateCVFunc != nil {
		return m.updateCVFunc(ctx, c)
	}
	return nil
}

func (m *mockRepository) DeleteCV(ctx context.Context, id string) error {
	if m.deleteCVFunc != nil {
		return m.deleteCVFunc(ctx, id)
	}
	return nil
}

func (m *mockRepository) CreateSection(ctx context.Context, s *Section) error {
	if m.createSectionFunc != nil {
		return m.createSectionFunc(ctx, s)
	}
	return nil
}

func (m *mockRepository) UpdateSection(ctx context.Context, s *Section) error {
	if m.updateSectionFunc != nil {
		return m.updateSectionFunc(ctx, s)
	}
	return nil
}

func (m *mockRepository) DeleteSection(ctx context.Context, id string) error {
	if m.deleteSectionFunc != nil {
		return m.deleteSectionFunc(ctx, id)
	}
	return nil
}

func (m *mockRepository) ReorderSection(ctx context.Context, id string, newOrderKey string) error {
	if m.reorderSectionFunc != nil {
		return m.reorderSectionFunc(ctx, id, newOrderKey)
	}
	return nil
}

func (m *mockRepository) CreateEntry(ctx context.Context, e *Entry) error {
	if m.createEntryFunc != nil {
		return m.createEntryFunc(ctx, e)
	}
	return nil
}

func (m *mockRepository) UpdateEntry(ctx context.Context, e *Entry) error {
	if m.updateEntryFunc != nil {
		return m.updateEntryFunc(ctx, e)
	}
	return nil
}

func (m *mockRepository) DeleteEntry(ctx context.Context, id string) error {
	if m.deleteEntryFunc != nil {
		return m.deleteEntryFunc(ctx, id)
	}
	return nil
}

func (m *mockRepository) ReorderEntry(ctx context.Context, id string, newOrderKey string) error {
	if m.reorderEntryFunc != nil {
		return m.reorderEntryFunc(ctx, id, newOrderKey)
	}
	return nil
}

func TestCVService_CreateCV(t *testing.T) {
	ctx := context.Background()

	t.Run("validation error on missing title or fullname", func(t *testing.T) {
		svc := NewService(&mockRepository{})

		_, err := svc.CreateCV(ctx, CreateCVRequest{Title: "", FullName: "John Doe"})
		if err == nil {
			t.Errorf("expected validation error for empty title, got nil")
		}

		_, err = svc.CreateCV(ctx, CreateCVRequest{Title: "Resume", FullName: ""})
		if err == nil {
			t.Errorf("expected validation error for empty fullname, got nil")
		}
	})

	t.Run("successful creation", func(t *testing.T) {
		var createdCV *CV
		repo := &mockRepository{
			createCVFunc: func(ctx context.Context, c *CV) error {
				createdCV = c
				return nil
			},
		}
		svc := NewService(repo)

		req := CreateCVRequest{
			Title:    "My CV",
			Language: "en",
			FullName: "Jane Doe",
			Email:    "jane@example.com",
		}
		res, err := svc.CreateCV(ctx, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if res == nil || res.ID == "" {
			t.Fatalf("expected valid CV with ID, got nil/empty")
		}
		if res.Title != "My CV" || res.FullName != "Jane Doe" || res.TemplateID != "ats-classic" {
			t.Errorf("unexpected CV fields: %+v", res)
		}
		if createdCV == nil || createdCV.ID != res.ID {
			t.Errorf("expected repository to receive created CV")
		}
	})

	t.Run("repository error propagation", func(t *testing.T) {
		repo := &mockRepository{
			createCVFunc: func(ctx context.Context, c *CV) error {
				return errors.New("db disk full")
			},
		}
		svc := NewService(repo)

		_, err := svc.CreateCV(ctx, CreateCVRequest{Title: "My CV", FullName: "Jane Doe"})
		if err == nil {
			t.Fatalf("expected error from repository, got nil")
		}
	})
}

func TestCVService_UpdateCV(t *testing.T) {
	ctx := context.Background()

	t.Run("validation error", func(t *testing.T) {
		svc := NewService(&mockRepository{})

		err := svc.UpdateCV(ctx, &CV{ID: "", FullName: "John Doe"})
		if err == nil {
			t.Errorf("expected error for empty ID, got nil")
		}

		err = svc.UpdateCV(ctx, &CV{ID: "cv-1", FullName: ""})
		if err == nil {
			t.Errorf("expected error for empty FullName, got nil")
		}
	})

	t.Run("successful update", func(t *testing.T) {
		updated := false
		repo := &mockRepository{
			updateCVFunc: func(ctx context.Context, c *CV) error {
				updated = true
				return nil
			},
		}
		svc := NewService(repo)

		err := svc.UpdateCV(ctx, &CV{ID: "cv-1", FullName: "John Doe"})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !updated {
			t.Errorf("expected repository UpdateCV to be called")
		}
	})
}

func TestCVService_GetAndListCV(t *testing.T) {
	ctx := context.Background()

	repo := &mockRepository{
		getCVFunc: func(ctx context.Context, id string) (*CV, error) {
			if id == "found" {
				return &CV{ID: "found", FullName: "Found User"}, nil
			}
			return nil, errors.New("not found")
		},
		listCVsFunc: func(ctx context.Context) ([]CV, error) {
			return []CV{{ID: "cv-1"}, {ID: "cv-2"}}, nil
		},
		deleteCVFunc: func(ctx context.Context, id string) error {
			if id == "to-delete" {
				return nil
			}
			return errors.New("not found")
		},
	}
	svc := NewService(repo)

	cv, err := svc.GetCV(ctx, "found")
	if err != nil || cv == nil || cv.ID != "found" {
		t.Errorf("GetCV failed: %v, cv: %+v", err, cv)
	}

	list, err := svc.ListCVs(ctx)
	if err != nil || len(list) != 2 {
		t.Errorf("ListCVs failed: %v, count: %d", err, len(list))
	}

	if err := svc.DeleteCV(ctx, "to-delete"); err != nil {
		t.Errorf("DeleteCV failed: %v", err)
	}
}

func TestCVService_SectionOperations(t *testing.T) {
	ctx := context.Background()
	var createdSec *Section
	repo := &mockRepository{
		createSectionFunc: func(ctx context.Context, s *Section) error {
			createdSec = s
			return nil
		},
		updateSectionFunc: func(ctx context.Context, s *Section) error {
			return nil
		},
		deleteSectionFunc: func(ctx context.Context, id string) error {
			return nil
		},
		reorderSectionFunc: func(ctx context.Context, id string, newOrderKey string) error {
			return nil
		},
	}
	svc := NewService(repo)

	// Create Section
	sec, err := svc.CreateSection(ctx, CreateSectionRequest{
		CVID:        "cv-1",
		SectionType: SectionExperience,
		Title:       "Experience",
		OrderKey:    "a0",
	})
	if err != nil || sec == nil || sec.ID == "" {
		t.Fatalf("CreateSection failed: %v, sec: %+v", err, sec)
	}
	if createdSec == nil || createdSec.ID != sec.ID {
		t.Errorf("expected createdSec to match returned sec")
	}

	// Update Section validation
	if err := svc.UpdateSection(ctx, &Section{ID: ""}); err == nil {
		t.Errorf("expected error on empty section ID, got nil")
	}
	if err := svc.UpdateSection(ctx, &Section{ID: "sec-1", Title: "Work"}); err != nil {
		t.Errorf("unexpected error on valid UpdateSection: %v", err)
	}

	// Delete Section
	if err := svc.DeleteSection(ctx, "sec-1"); err != nil {
		t.Errorf("unexpected error on DeleteSection: %v", err)
	}

	// Reorder Section validation
	if err := svc.ReorderSection(ctx, "sec-1", ""); err == nil {
		t.Errorf("expected error on empty newOrderKey, got nil")
	}
	if err := svc.ReorderSection(ctx, "sec-1", "a1"); err != nil {
		t.Errorf("unexpected error on valid ReorderSection: %v", err)
	}
}

func TestCVService_EntryOperations(t *testing.T) {
	ctx := context.Background()
	var createdEntry *Entry
	repo := &mockRepository{
		createEntryFunc: func(ctx context.Context, e *Entry) error {
			createdEntry = e
			return nil
		},
		updateEntryFunc: func(ctx context.Context, e *Entry) error {
			return nil
		},
		deleteEntryFunc: func(ctx context.Context, id string) error {
			return nil
		},
		reorderEntryFunc: func(ctx context.Context, id string, newOrderKey string) error {
			return nil
		},
	}
	svc := NewService(repo)

	// Create Entry
	entry, err := svc.CreateEntry(ctx, CreateEntryRequest{
		SectionID: "sec-1",
		OrderKey:  "a0",
		Title:     "Software Engineer",
	})
	if err != nil || entry == nil || entry.ID == "" {
		t.Fatalf("CreateEntry failed: %v, entry: %+v", err, entry)
	}
	if createdEntry == nil || createdEntry.ID != entry.ID {
		t.Errorf("expected createdEntry to match returned entry")
	}

	// Update Entry validation
	if err := svc.UpdateEntry(ctx, &Entry{ID: ""}); err == nil {
		t.Errorf("expected error on empty entry ID, got nil")
	}
	if err := svc.UpdateEntry(ctx, &Entry{ID: "entry-1", Title: "Lead Engineer"}); err != nil {
		t.Errorf("unexpected error on valid UpdateEntry: %v", err)
	}

	// Delete Entry
	if err := svc.DeleteEntry(ctx, "entry-1"); err != nil {
		t.Errorf("unexpected error on DeleteEntry: %v", err)
	}

	// Reorder Entry validation
	if err := svc.ReorderEntry(ctx, "entry-1", ""); err == nil {
		t.Errorf("expected error on empty newOrderKey, got nil")
	}
	if err := svc.ReorderEntry(ctx, "entry-1", "a1"); err != nil {
		t.Errorf("unexpected error on valid ReorderEntry: %v", err)
	}
}
