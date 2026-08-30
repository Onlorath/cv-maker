package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"cvmaker/internal/features/atscheck"
	"cvmaker/internal/features/atsmatch"
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
}

// NewApp creates a new App application struct
func NewApp(cvService cv.Service, settingsService settings.Service) *App {
	return &App{
		cvService:       cvService,
		settingsService: settingsService,
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
	key, _ := a.settingsService.GetGeminiAPIKey(a.ctx)
	translator := translate.NewGeminiTranslator(key)
	return translator.TranslateCV(a.ctx, req)
}

func (a *App) TranslateFullCV(c *cv.CV, targetLanguage string) (*cv.CV, error) {
	key, _ := a.settingsService.GetGeminiAPIKey(a.ctx)
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
	if c == nil {
		return atsscore.FinalReport{}
	}
	report := atscheck.Run(c)
	return atsscore.FormatOnly(report)
}

// ATSFullCheck runs deterministic format checks and Gemini JD matching.
func (a *App) ATSFullCheck(c *cv.CV, jobDescription string) (atsscore.FinalReport, error) {
	if c == nil {
		return atsscore.FinalReport{}, fmt.Errorf("cv verisi boş olamaz")
	}

	formatReport := atscheck.Run(c)

	trimmedJD := strings.TrimSpace(jobDescription)
	if trimmedJD == "" {
		return atsscore.FormatOnly(formatReport), nil
	}

	key, err := a.settingsService.GetGeminiAPIKey(a.ctx)
	if err != nil || key == "" {
		return atsscore.FormatOnly(formatReport), fmt.Errorf("iş ilanı eşleştirmesi için Gemini API anahtarı gereklidir")
	}

	// Geçici ID haritalaması (Temporary ID Mapping)
	// LLM'in uzun UUID'leri halüsinasyonla bozmasını engellemek için, 
	// CV verisini LLM'e göndermeden önce Entry ID'lerini e1, e2 gibi kısa string'lere çeviriyoruz.
	idMap := make(map[string]string) // tempID -> realUUID
	mappedCV := *c
	// KRİTİK DÜZELTME: Base64 kodlu profil resmi devasa bir string'dir (yüzbinlerce token).
	// LLM'in resmi görmesine gerek olmadığı için context şişmesini (429 Rate Limit) engellemek adına siliyoruz.
	mappedCV.PhotoPath = nil

	mappedSections := make([]cv.Section, len(c.Sections))
	
	tempCounter := 1
	for i, s := range c.Sections {
		mappedSec := s
		mappedEntries := make([]cv.Entry, len(s.Entries))
		for j, e := range s.Entries {
			tempID := fmt.Sprintf("e%d", tempCounter)
			tempCounter++
			
			idMap[tempID] = e.ID
			mappedEntry := e
			mappedEntry.ID = tempID
			mappedEntries[j] = mappedEntry
		}
		mappedSec.Entries = mappedEntries
		mappedSections[i] = mappedSec
	}
	mappedCV.Sections = mappedSections

	cvJSONBytes, err := json.Marshal(mappedCV)
	if err != nil {
		return atsscore.FinalReport{}, fmt.Errorf("cv verisi serileştirilemedi: %w", err)
	}

	matcher := atsmatch.NewGeminiMatcher(key)
	matchResp, err := matcher.Match(a.ctx, atsmatch.MatchRequest{
		JobDescription: trimmedJD,
		CVJSON:         string(cvJSONBytes),
	})
	if err != nil {
		return atsscore.FinalReport{}, err
	}

	// Gelen önerilerdeki (suggestions) geçici ID'leri gerçek UUID'lere geri çevir
	for i, sug := range matchResp.Suggestions {
		if realID, ok := idMap[sug.EntryID]; ok {
			matchResp.Suggestions[i].EntryID = realID
		}
	}

	return atsscore.Combine(formatReport, matchResp), nil
}

