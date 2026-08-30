package gemini

import (
	"context"
	"errors"
	"net/http"
	"testing"

	"google.golang.org/api/googleapi"
)

func TestIsRateLimitError(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want bool
	}{
		{"nil error", nil, false},
		{"googleapi 429", &googleapi.Error{Code: http.StatusTooManyRequests, Message: "Too Many Requests"}, true},
		{"googleapi 500", &googleapi.Error{Code: http.StatusInternalServerError, Message: "Internal Server Error"}, false},
		{"resource_exhausted string", errors.New("rpc error: code = ResourceExhausted desc = Quota exceeded"), true},
		{"quota string", errors.New("exceeded your quota"), true},
		{"rate limit string", errors.New("rate limit reached"), true},
		{"random error", errors.New("network disconnected"), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsRateLimitError(tt.err); got != tt.want {
				t.Errorf("IsRateLimitError(%v) = %v, want %v", tt.err, got, tt.want)
			}
		})
	}
}

func TestCleanErrorMessage(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		contains string
	}{
		{"nil error", nil, ""},
		{"api key in url", errors.New("failed request: https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyD-12345&alt=json"), "key=[PROTECTED]"},
		{"deadline exceeded", context.DeadlineExceeded, "Timeout"},
		{"rate limit error", errors.New("ResourceExhausted: rate limit"), "Rate Limit"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CleanErrorMessage(tt.err)
			if tt.err == nil && got != "" {
				t.Errorf("CleanErrorMessage(nil) = %q, want empty", got)
			}
			if tt.contains != "" && !errors.Is(tt.err, nil) {
				if !testing.Short() && !containsString(got, tt.contains) {
					t.Errorf("CleanErrorMessage(%v) = %q, expected to contain %q", tt.err, got, tt.contains)
				}
			}
		})
	}
}

func containsString(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || (len(s) > 0 && len(substr) > 0 && stringContains(s, substr)))
}

func stringContains(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
