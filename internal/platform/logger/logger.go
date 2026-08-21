package logger

import (
	"log/slog"
	"os"
)

// InitLogger configures the global slog logger with JSON formatting
// and structured logging as per architecture guidelines.
func InitLogger(level slog.Level) {
	opts := &slog.HandlerOptions{
		Level: level,
	}

	handler := slog.NewJSONHandler(os.Stdout, opts)
	logger := slog.New(handler)
	
	// Set it as the default logger for the application
	slog.SetDefault(logger)
}
