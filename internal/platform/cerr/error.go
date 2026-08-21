package cerr

import (
	"fmt"
)

// Error represents a rich custom error structure to wrap original errors
// and provide context, especially useful for logging and HTTP responses.
type Error struct {
	Code    string
	Message string
	Err     error
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

func (e *Error) Unwrap() error {
	return e.Err
}

// New creates a new custom error without wrapping an existing one.
func New(code, message string) error {
	return &Error{
		Code:    code,
		Message: message,
	}
}

// Wrap wraps an existing error with a custom code and message.
func Wrap(code, message string, err error) error {
	if err == nil {
		return nil
	}
	return &Error{
		Code:    code,
		Message: message,
		Err:     err,
	}
}
