package gemini

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"google.golang.org/api/googleapi"
)

// IsRateLimitError checks if an error represents an HTTP 429 Too Many Requests or quota exhaustion.
func IsRateLimitError(err error) bool {
	if err == nil {
		return false
	}
	var gErr *googleapi.Error
	if errors.As(err, &gErr) && gErr.Code == http.StatusTooManyRequests {
		return true
	}
	errStr := strings.ToLower(err.Error())
	return strings.Contains(errStr, "429") ||
		strings.Contains(errStr, "resource_exhausted") ||
		strings.Contains(errStr, "quota") ||
		strings.Contains(errStr, "rate limit")
}

// CleanErrorMessage sanitizes error strings, stripping API keys and providing clean user-facing explanations.
func CleanErrorMessage(err error) string {
	if err == nil {
		return ""
	}
	errStr := err.Error()
	if idx := strings.Index(errStr, "key="); idx != -1 {
		endIdx := strings.IndexAny(errStr[idx:], " \t\n\r\"'&")
		if endIdx != -1 {
			errStr = errStr[:idx] + "key=[PROTECTED]" + errStr[idx+endIdx:]
		} else {
			errStr = errStr[:idx] + "key=[PROTECTED]"
		}
	}
	if errors.Is(err, context.DeadlineExceeded) || strings.Contains(strings.ToLower(errStr), "deadline") || strings.Contains(strings.ToLower(errStr), "timeout") {
		return "Yapay zeka yanıt süresi zaman aşımına uğradı (Timeout). Lütfen tekrar deneyin."
	}
	if IsRateLimitError(err) {
		return "Yapay zeka istek limiti aşıldı (Rate Limit), lütfen biraz sonra tekrar deneyin."
	}
	return errStr
}
