package settings

import (
	"context"
	"errors"
	"log/slog"

	"github.com/zalando/go-keyring"
	"cvmaker/internal/platform/cerr"
)

const (
	serviceName = "cv_maker_app"
	apiKeyUser  = "gemini_api_key"
)

// Service handles reading and writing application settings, including secure storage.
type Service interface {
	GetGeminiAPIKey(ctx context.Context) (string, error)
	SetGeminiAPIKey(ctx context.Context, key string) error
	DeleteGeminiAPIKey(ctx context.Context) error
}

type service struct{}

// NewService creates a new settings service instance.
func NewService() Service {
	return &service{}
}

func (s *service) GetGeminiAPIKey(ctx context.Context) (string, error) {
	secret, err := keyring.Get(serviceName, apiKeyUser)
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			slog.DebugContext(ctx, "api key not found in keyring")
			return "", cerr.New("NOT_FOUND", "API Key is not set")
		}
		slog.ErrorContext(ctx, "failed to get api key from keyring", "error", err)
		return "", cerr.Wrap("KEYRING_ERROR", "Failed to retrieve API key", err)
	}
	return secret, nil
}

func (s *service) SetGeminiAPIKey(ctx context.Context, key string) error {
	if key == "" {
		return cerr.New("VALIDATION_ERROR", "API Key cannot be empty")
	}

	err := keyring.Set(serviceName, apiKeyUser, key)
	if err != nil {
		slog.ErrorContext(ctx, "failed to set api key in keyring", "error", err)
		return cerr.Wrap("KEYRING_ERROR", "Failed to save API key", err)
	}
	slog.InfoContext(ctx, "successfully saved api key to keyring")
	return nil
}

func (s *service) DeleteGeminiAPIKey(ctx context.Context) error {
	err := keyring.Delete(serviceName, apiKeyUser)
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			return nil // already deleted
		}
		slog.ErrorContext(ctx, "failed to delete api key from keyring", "error", err)
		return cerr.Wrap("KEYRING_ERROR", "Failed to delete API key", err)
	}
	slog.InfoContext(ctx, "successfully deleted api key from keyring")
	return nil
}
