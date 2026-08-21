package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"cvmaker/internal/features/cv"
	"cvmaker/internal/platform/db"
	"cvmaker/internal/platform/logger"
	"cvmaker/migrations"
)

func main() {
	// 1. Init Logger
	logger.InitLogger(slog.LevelDebug)
	slog.Info("starting cv maker backend")

	// 2. Init DB (SQLite in local file for testing)
	dbConn, err := db.InitDB("cvmaker.db", migrations.FS)
	if err != nil {
		slog.Error("failed to init db", "error", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	// 3. Init Services
	cvRepo := cv.NewRepository(dbConn)
	cvService := cv.NewService(cvRepo)

	ctx := context.Background()

	// 4. Run a simple E2E test
	slog.Info("running e2e tests")
	
	newCV, err := cvService.CreateCV(ctx, cv.CreateCVRequest{
		Title:    "Test CV",
		Language: "tr",
		FullName: "John Doe",
		Email:    "john@doe.com",
	})
	if err != nil {
		slog.Error("failed to create cv", "error", err)
		return
	}
	slog.Info("created cv successfully", "id", newCV.ID)

	_, err = cvService.CreateSection(ctx, cv.CreateSectionRequest{
		CVID:        newCV.ID,
		SectionType: cv.SectionExperience,
		Title:       "İş Deneyimi",
		OrderKey:    "a",
	})
	if err != nil {
		slog.Error("failed to create section", "error", err)
		return
	}

	cvList, err := cvService.ListCVs(ctx)
	if err != nil {
		slog.Error("failed to list cvs", "error", err)
		return
	}
	fmt.Printf("Total CVs in DB: %d\n", len(cvList))

	slog.Info("backend test finished successfully")
}
