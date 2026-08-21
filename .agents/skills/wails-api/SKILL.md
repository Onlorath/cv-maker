---
name: wails-api
description: Provides Wails IPC and external service contract guidance for typed Go-to-React communication, validation, errors, asynchronous operations, authentication, external APIs, and service boundaries.
---

# Wails API & Service Contract Skill

Use this skill for Wails Go-to-React method contracts, IPC design, frontend/backend communication, and external API integrations.

## Core Principle

A Wails binding is an application API even though it is not an HTTP REST endpoint.

Treat every exposed Go method as a contract between:

    React Frontend
          ↕
    Wails Binding
          ↕
    Go Backend

The contract must be explicit, stable, validated, and predictable.

## Binding Design

For simple operations, prefer focused methods.

For complex operations, use explicit request structures.

Example:

    type SaveResumeRequest struct {
        Resume Resume `json:"resume"`
    }

    func (a *App) SaveResume(req SaveResumeRequest) error {
        // ...
    }

Rules:

- Avoid methods with excessive unrelated parameters.
- Prefer explicit request/response models for complex operations.
- Keep methods focused on one meaningful operation.
- Do not expose internal repository structures directly to React.
- Do not expose database implementation details through bindings.

## Validation

Treat all frontend-provided values as untrusted input.

Validate in Go:

- required fields,
- data types,
- ranges,
- formats,
- business constraints,
- file paths,
- external identifiers.

Frontend validation improves UX but does not replace backend validation.

## Error Contracts

Do not make the frontend depend on fragile human-readable error strings.

Prefer structured application errors where appropriate.

Errors should distinguish between:

- validation failures,
- missing resources,
- business rule failures,
- authentication failures,
- authorization failures,
- external service failures,
- persistence failures,
- unexpected internal failures.

Do not expose:

- stack traces,
- database errors,
- API keys,
- filesystem internals,
- sensitive implementation details.

## Asynchronous Operations

For long-running operations:

- Determine whether the frontend should await completion.
- Consider progress reporting.
- Consider cancellation.
- Consider application shutdown.
- Prevent duplicate execution where necessary.

For high-frequency operations such as editor changes:

- avoid unnecessary IPC calls,
- debounce when appropriate,
- batch operations when appropriate.

Do not send a backend request for every keystroke unless there is a measurable requirement.

## Stale Responses

When multiple asynchronous calls can overlap, consider stale-result problems.

Example:

    Request A starts
    Request B starts
    Request B finishes
    Request A finishes later

Ensure an older result cannot incorrectly overwrite newer state.

## External AI APIs

When calling OpenAI, Gemini, Anthropic, or other external services:

- Keep credentials in the Go backend.
- Never expose provider API keys to the React frontend.
- Set request timeouts.
- Handle rate limits.
- Handle transient failures.
- Avoid unlimited retries.
- Validate external responses.
- Do not blindly trust model-generated structured data.
- Log useful diagnostics without logging secrets or full sensitive user content unnecessarily.

## Authentication

Authentication requirements depend on the application architecture.

For services requiring JWT authentication:

- validate signatures,
- validate expiration,
- validate claims,
- enforce authorization separately.

For desktop-only local operations, do not introduce remote authentication infrastructure merely because it is common in web applications.

Choose authentication based on the actual security boundary.

## Files & User Content

CV content can contain personal information.

Treat user-provided:

- names,
- emails,
- phone numbers,
- addresses,
- employment history,
- education,
- profile images,
- uploaded documents

as sensitive application data.

Do not unnecessarily send user data to external services.

When external processing is required, minimize the data transmitted and make the data flow explicit.

## Compatibility

When changing a Wails method:

1. Inspect all frontend callers.
2. Inspect generated bindings.
3. Update request/response types.
4. Regenerate bindings when required.
5. Update tests.
6. Verify the complete frontend-to-backend flow.

Do not change binding signatures without checking consumers.

## External HTTP APIs

When the Go backend communicates with remote services:

- use explicit timeouts,
- propagate context,
- validate HTTP status codes,
- validate response bodies,
- handle retries carefully,
- respect rate limits,
- avoid retry storms,
- keep provider-specific logic isolated.

## Verification

For contract changes verify:

- valid input,
- invalid input,
- error behavior,
- serialization,
- frontend consumption,
- external API failures where applicable,
- authentication behavior where applicable.

A successful Go build alone does not prove that the frontend/backend contract is correct.