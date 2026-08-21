---
name: golang
description: Provides Go engineering guidance for backend development, Wails bindings, concurrency, error handling, testing, debugging, persistence, and performance-sensitive code.
---

# Go Engineering Skill

Use this skill for Go backend development, debugging, refactoring, Wails service implementation, concurrency, persistence, and performance-sensitive work.

## Core Principles

- Write idiomatic Go.
- Prefer simple and explicit code.
- Follow the existing project architecture.
- Avoid unnecessary abstractions.
- Prefer the standard library when it is sufficient.
- Keep dependencies minimal.
- Preserve context propagation across I/O and request-scoped operations.
- Treat error handling as part of the application contract.
- Prefer correctness and maintainability over cleverness.
- Do not optimize without evidence.

## Project Structure

Follow the existing project layout.

In a Wails application the typical boundary is:

    main.go              (application entry, Wails config)
    app.go / services/   (bound methods, business logic)
    frontend/            (React + Vite)

Rules:

- Keep bound Go methods focused and thin.
- Keep business logic in dedicated service functions or types.
- Do not scatter persistence, validation, or external API calls across unrelated files.
- Follow the existing repository structure before introducing a new structure.

## Context

For I/O-bound and request-scoped operations:

    func (s *Service) GetUser(ctx context.Context, id string) (*User, error) {
        // ...
    }

Rules:

- `context.Context` should be the first parameter for functions performing I/O, database access, network calls, or request-scoped operations.
- Propagate the incoming context through downstream calls.
- Respect cancellation and deadlines.
- Do not create detached contexts inside request-scoped execution paths without a deliberate reason.
- Do not use `context.Background()` as a replacement for proper context propagation.
- Pure functions that do not perform I/O or depend on request lifecycle do not need a context parameter.

## Errors

Prefer wrapped errors with useful context:

    return fmt.Errorf("create user: %w", err)

Use typed or sentinel errors when callers need to distinguish specific failure conditions.

Rules:

- Preserve the original error when useful.
- Add context at meaningful boundaries.
- Do not silently discard errors.
- Do not convert errors into strings prematurely.
- Do not use `return err.Error()` as an error-handling strategy.
- Do not return transport-specific errors from domain or service layers.
- Map application errors to frontend-safe messages at the Wails binding boundary.
- Do not expose raw internal errors to the React frontend.

## Wails Binding Layer

- Validate input received from the React frontend.
- Keep bound methods thin — delegate to services.
- Keep business rules outside bound methods.
- Return consistent response structures or explicit errors.
- Do not leak internal errors, file paths, or infrastructure details to the frontend.
- Preserve stable binding signatures unless a breaking change is explicitly required.
- Regenerate frontend bindings after changing exported method signatures.

## Persistence

- Keep persistence logic behind clear boundaries.
- When using JSON file storage, prefer atomic writes (write-to-temp then rename).
- When using SQLite, use parameterized queries exclusively.
- Validate data loaded from disk — do not assume files are well-formed.
- Handle missing files, corrupted data, and schema migration gracefully.
- Keep persistence-specific concerns isolated from bound methods and business logic.

## Concurrency

Before introducing goroutines, determine:

1. Why concurrency is required.
2. Who owns the goroutine lifecycle.
3. How cancellation works.
4. How errors propagate.
5. Whether shared state is synchronized.
6. Whether the goroutine can leak.
7. Whether concurrent execution actually improves the workload.

Rules:

- Do not introduce goroutines merely because operations are independent.
- Prefer structured concurrency patterns where practical.
- Ensure goroutines have a clear lifetime.
- Avoid unbounded goroutine creation.
- Be explicit about ownership of channels and shared state.
- Consider race conditions before introducing shared mutable state.

## Performance

Consider:

- allocations,
- memory usage,
- escape behavior,
- database round trips,
- network latency,
- serialization cost,
- algorithmic complexity,
- lock contention,
- concurrency overhead.

Rules:

- Do not optimize without evidence.
- Prefer profiling and benchmarks over speculation.
- Avoid premature micro-optimizations.
- Optimize hot paths when measurements justify the change.
- Do not sacrifice readability for theoretical performance gains.

When performance is explicitly relevant:

1. Measure the current behavior.
2. Identify the actual bottleneck.
3. Implement the smallest justified optimization.
4. Benchmark or profile again.
5. Compare before and after results.

## Testing

Use table-driven tests when they improve clarity and maintainability.

Cover where relevant:

- success paths,
- validation failures,
- dependency failures,
- edge cases,
- error propagation,
- transaction behavior,
- concurrency-sensitive behavior,
- regression scenarios.

Prefer behavior-oriented tests over tests tightly coupled to implementation details.

After modifying Go code, run the narrowest relevant verification first.

Typical checks may include:

    gofmt -w .
    go test ./...
    go vet ./...
    go build ./...

Use the actual commands defined by the repository when they differ.

Do not run broad commands blindly when a smaller targeted check is sufficient.

## Debugging

When debugging Go code:

1. Reproduce the issue when practical.
2. Inspect the exact error and stack trace.
3. Identify the execution path.
4. Inspect relevant callers and dependencies.
5. Form a root-cause hypothesis.
6. Verify the hypothesis with evidence.
7. Apply the smallest correct fix.
8. Reproduce the original failure again.
9. Run regression tests.

Do not patch symptoms without understanding the underlying cause.

Pay particular attention to:

- nil pointers,
- incorrect error handling,
- context cancellation,
- goroutine leaks,
- race conditions,
- deadlocks,
- transaction boundaries,
- connection pooling,
- stale state,
- N+1 queries,
- unexpected serialization behavior.

## Code Review

Check for:

- data races,
- goroutine leaks,
- swallowed errors,
- missing context propagation,
- incorrect transaction handling,
- N+1 queries,
- unnecessary allocations,
- API contract violations,
- improper error mapping,
- security issues,
- unnecessary abstractions,
- accidental breaking changes.

Review surrounding code when the changed behavior crosses architectural boundaries.

Never sacrifice readability and correctness for micro-optimizations.

## Verification

Before declaring Go work complete:

- Inspect the final diff.
- Confirm formatting.
- Run relevant tests.
- Run static analysis when applicable.
- Run the build when appropriate.
- Re-test the original behavior for bug fixes.
- Confirm no unrelated files were changed.
- Report any remaining uncertainty.

Never claim that a test, benchmark, build, or verification step was performed unless it was actually executed.