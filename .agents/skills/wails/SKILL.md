---
name: wails
description: Provides Wails desktop application engineering guidance for Go and React integration, bindings, events, lifecycle, native APIs, window management, packaging, IPC, and development workflow.
---

# Wails Engineering Skill

Use this skill for Wails desktop application development and integration between Go and the React frontend.

## Architecture

The application consists of two primary execution environments:

    React + Vite
          ↓
    Wails Bindings / IPC
          ↓
    Go Application

Keep responsibilities clear between:

- React UI and presentation,
- frontend state,
- Wails bindings,
- Go application services,
- persistence,
- external services,
- native desktop functionality.

Do not place business logic inside React merely because it is convenient.

Do not place presentation logic inside Go merely because it is callable from the frontend.

## Go Bindings

When exposing Go functionality to the frontend:

- Keep exported methods focused.
- Use explicit request and response structures for non-trivial operations.
- Keep business logic inside appropriate Go services/usecases.
- Keep bound methods thin when possible.
- Validate frontend-provided input on the Go side.
- Do not trust frontend validation as a security or integrity boundary.

Example conceptual flow:

    React Component
        ↓
    Frontend Adapter
        ↓
    Wails Binding
        ↓
    Go Service / Usecase
        ↓
    Repository / External Service

## Generated Bindings

When Wails-generated bindings are present:

- Treat generated files as generated artifacts.
- Do not manually edit generated files unless the project explicitly requires it.
- Regenerate bindings using the project's Wails workflow after changing exported Go methods.
- Check for stale generated bindings when frontend/backend contracts appear inconsistent.

## IPC

Treat Wails method calls as an application boundary.

Consider:

- serialization,
- latency,
- error propagation,
- request size,
- response size,
- cancellation limitations,
- repeated calls,
- stale responses.

Rules:

- Avoid excessively frequent IPC calls.
- Do not call the backend on every keystroke unless there is a clear reason.
- Debounce high-frequency operations when appropriate.
- Prefer batching when multiple backend operations can be combined safely.
- Keep IPC payloads focused.

## Events

When using Wails events:

- Define clear event names.
- Keep event payloads stable and understandable.
- Avoid broadcasting unnecessarily large payloads.
- Ensure listeners are cleaned up appropriately.
- Prevent duplicate event subscriptions.
- Avoid using events when a direct method invocation is simpler.

## Application Lifecycle

Consider:

- application startup,
- initialization order,
- frontend readiness,
- backend service initialization,
- shutdown,
- cleanup,
- persistent resources,
- background goroutines.

Background work must have a clear lifecycle and shutdown strategy.

Do not create goroutines that can outlive the application without an explicit reason.

## Native Desktop APIs

When implementing native functionality such as:

- file dialogs,
- file operations,
- window management,
- application menus,
- clipboard,
- notifications,
- filesystem access,

keep OS-specific behavior behind clear application boundaries.

Do not expose platform-specific implementation details throughout the frontend.

## Filesystem Access

Treat filesystem paths and file contents as external input.

Consider:

- path validation,
- permissions,
- missing files,
- platform-specific path behavior,
- encoding,
- large files,
- atomic writes,
- backup or recovery where appropriate.

Do not assume paths behave identically across operating systems.

## External APIs

When the Wails backend communicates with external services:

- Keep external API clients inside Go service boundaries.
- Use context-aware requests where supported.
- Configure timeouts.
- Handle rate limits and transient failures.
- Do not expose API keys to the React frontend.
- Keep credentials in secure backend configuration.

## Error Handling

Backend errors should cross the Wails boundary in a predictable manner.

- Preserve useful error context internally.
- Do not expose sensitive internal errors.
- Map errors to frontend-safe messages or structured error types where appropriate.
- Handle failed bindings explicitly in the frontend.

## Development Workflow

Before modifying Wails integration:

1. Inspect `main.go` and application initialization.
2. Inspect the binding/service structure.
3. Inspect generated frontend bindings.
4. Inspect frontend callers.
5. Determine the actual data flow.
6. Make the smallest coherent change.
7. Regenerate bindings if necessary.
8. Run the application and verify the affected flow.

## Build & Packaging

When changing Wails configuration or application initialization:

- Inspect `wails.json` or the project's Wails configuration.
- Consider development and production behavior.
- Consider platform-specific packaging.
- Verify asset paths.
- Verify generated bindings.
- Verify the packaged application when the change affects distribution.

## Verification

After changing Wails integration:

- Verify Go compilation.
- Verify frontend compilation.
- Verify generated bindings when applicable.
- Run relevant tests.
- Run the Wails development application when practical.
- Verify the actual React ↔ Go interaction.

Do not consider a Wails feature complete merely because both Go and React compile independently.