package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"cvmaker/internal/features/atsscore"
	"cvmaker/internal/features/cv"
	"cvmaker/internal/features/settings"
	"cvmaker/internal/features/translate"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx             context.Context
	cvService       cv.Service
	settingsService settings.Service
	atsService      atsscore.Service
}

// NewApp creates a new App application struct
func NewApp(cvService cv.Service, settingsService settings.Service, atsService atsscore.Service) *App {
	return &App{
		cvService:       cvService,
		settingsService: settingsService,
		atsService:      atsService,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// CV Methods
func (a *App) GetCV(id string) (*cv.CV, error) {
	return a.cvService.GetCV(a.ctx, id)
}

func (a *App) ListCVs() ([]cv.CV, error) {
	return a.cvService.ListCVs(a.ctx)
}

func (a *App) CreateCV(req cv.CreateCVRequest) (*cv.CV, error) {
	return a.cvService.CreateCV(a.ctx, req)
}

func (a *App) UpdateCV(c *cv.CV) error {
	return a.cvService.UpdateCV(a.ctx, c)
}

func (a *App) DeleteCV(id string) error {
	return a.cvService.DeleteCV(a.ctx, id)
}

func (a *App) CreateSection(req cv.CreateSectionRequest) (*cv.Section, error) {
	return a.cvService.CreateSection(a.ctx, req)
}

func (a *App) UpdateSection(s *cv.Section) error {
	return a.cvService.UpdateSection(a.ctx, s)
}

func (a *App) DeleteSection(id string) error {
	return a.cvService.DeleteSection(a.ctx, id)
}

func (a *App) ReorderSection(id string, newOrderKey string) error {
	return a.cvService.ReorderSection(a.ctx, id, newOrderKey)
}

func (a *App) CreateEntry(req cv.CreateEntryRequest) (*cv.Entry, error) {
	return a.cvService.CreateEntry(a.ctx, req)
}

func (a *App) UpdateEntry(e *cv.Entry) error {
	return a.cvService.UpdateEntry(a.ctx, e)
}

func (a *App) DeleteEntry(id string) error {
	return a.cvService.DeleteEntry(a.ctx, id)
}

func (a *App) ReorderEntry(id string, newOrderKey string) error {
	return a.cvService.ReorderEntry(a.ctx, id, newOrderKey)
}

// Translate Methods
func (a *App) TranslateCV(req translate.TranslateRequest) (translate.TranslateResponse, error) {
	key, err := a.settingsService.GetGeminiAPIKey(a.ctx)
	if err != nil {
		return translate.TranslateResponse{}, fmt.Errorf("gemini API anahtarı alınamadı: %w", err)
	}
	if strings.TrimSpace(key) == "" {
		return translate.TranslateResponse{}, fmt.Errorf("gemini API anahtarı ayarlanmamış. Lütfen Ayarlar menüsünden API anahtarınızı girin.")
	}
	translator := translate.NewGeminiTranslator(key)
	return translator.TranslateCV(a.ctx, req)
}

func (a *App) TranslateFullCV(c *cv.CV, targetLanguage string) (*cv.CV, error) {
	key, err := a.settingsService.GetGeminiAPIKey(a.ctx)
	if err != nil {
		return nil, fmt.Errorf("gemini API anahtarı alınamadı: %w", err)
	}
	if strings.TrimSpace(key) == "" {
		return nil, fmt.Errorf("gemini API anahtarı ayarlanmamış. Lütfen Ayarlar menüsünden API anahtarınızı girin.")
	}
	translator := translate.NewGeminiTranslator(key)
	return translator.TranslateFullCV(a.ctx, c, targetLanguage)
}

// Settings Methods
func (a *App) GetGeminiAPIKey() (string, error) {
	return a.settingsService.GetGeminiAPIKey(a.ctx)
}

func (a *App) SetGeminiAPIKey(key string) error {
	return a.settingsService.SetGeminiAPIKey(a.ctx, key)
}

func (a *App) DeleteGeminiAPIKey() error {
	return a.settingsService.DeleteGeminiAPIKey(a.ctx)
}

// SavePDF allows the frontend to save a Base64 PDF string directly to disk via native dialog
func (a *App) SavePDF(base64Data string, suggestedFilename string) error {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: suggestedFilename,
		Filters: []runtime.FileFilter{
			{DisplayName: "PDF Files (*.pdf)", Pattern: "*.pdf"},
		},
	})
	if err != nil {
		return err
	}
	if filePath == "" {
		return nil // User cancelled
	}

	pdfBytes, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return err
	}

	return os.WriteFile(filePath, pdfBytes, 0644)
}

// ATS Methods

// ATSFormatCheck runs deterministic ATS format checks against the CV.
func (a *App) ATSFormatCheck(c *cv.CV) atsscore.FinalReport {
	return a.atsService.FormatCheck(c)
}

// ATSFullCheck runs deterministic format checks and Gemini JD matching.
func (a *App) ATSFullCheck(c *cv.CV, jobDescription string) (atsscore.FinalReport, error) {
	key, err := a.settingsService.GetGeminiAPIKey(a.ctx)
	if err != nil {
		return a.atsService.FormatCheck(c), fmt.Errorf("gemini API anahtarı alınamadı: %w", err)
	}
	return a.atsService.FullCheck(a.ctx, c, jobDescription, key)
}
