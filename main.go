package main

import (
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"

	"cvmaker/internal/features/cv"
	"cvmaker/internal/features/settings"
	"cvmaker/internal/platform/db"
	"cvmaker/internal/platform/logger"
	"cvmaker/migrations"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	logger.InitLogger(slog.LevelInfo)
	slog.Info("starting cv maker wails application")

	homeDir, err := os.UserHomeDir()
	if err != nil {
		slog.Error("failed to get user home dir", "error", err)
		os.Exit(1)
	}

	appDir := homeDir + "/.cvmaker"
	if err := os.MkdirAll(appDir, 0755); err != nil {
		slog.Error("failed to create app directory", "error", err)
		os.Exit(1)
	}

	dbPath := appDir + "/cvmaker.db"
	dbConn, err := db.InitDB(dbPath, migrations.FS)
	if err != nil {
		slog.Error("failed to init db", "error", err)
		os.Exit(1)
	}
	defer dbConn.Close()

	cvRepo := cv.NewRepository(dbConn)
	cvService := cv.NewService(cvRepo)
	settingsService := settings.NewService()

	app := NewApp(cvService, settingsService)

	err = wails.Run(&options.App{
		Title:             "CV Maker — Onlorath ATS Studio",
		Width:             1440,
		Height:            900,
		MinWidth:          1024,
		MinHeight:         700,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		OnStartup:         app.startup,
		Bind: []interface{}{
			app,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarDefault(),
			Appearance:           mac.NSAppearanceNameAqua,
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
	})

	if err != nil {
		slog.Error("wails application error", "error", err)
	}
}
