---
description: Performs a production-oriented review of the current changes, focusing on correctness, security, data integrity, architecture, concurrency, performance, and regression risk.
---

# Code Review Workflow

Review the current implementation as if it were a production pull request.

## Phase 1 — Establish Scope

Determine:

- what changed,
- why it changed,
- which files were modified,
- which systems are affected.

Inspect the actual diff.

Do not review only the changed lines when surrounding behavior matters.

## Phase 2 — Correctness

Check for:

- incorrect logic,
- broken assumptions,
- missing edge cases,
- invalid state transitions,
- incorrect error handling,
- inconsistent behavior,
- regression risks.

Correctness takes priority over style.

## Phase 3 — Security

Check for:

- authentication bypass,
- authorization bypass,
- injection,
- XSS,
- CSRF where applicable,
- SSRF,
- insecure cookie configuration,
- secret leakage,
- excessive data exposure,
- unsafe file handling,
- unvalidated external input.

Treat all externally controlled input as untrusted.

## Phase 4 — Architecture

Check whether the changes:

- violate domain boundaries,
- introduce unnecessary coupling,
- bypass existing abstractions,
- duplicate business rules,
- mix transport and domain concerns,
- introduce speculative abstractions,
- conflict with established project architecture.

## Phase 5 — Reliability

Check:

- error propagation,
- retries,
- timeout behavior,
- transaction boundaries,
- partial failures,
- concurrency,
- race conditions,
- resource lifecycle,
- goroutine lifecycle,
- cache invalidation.

## Phase 6 — Performance

Look for realistic performance risks:

- N+1 queries,
- unnecessary network requests,
- large allocations,
- unnecessary React renders,
- excessive serialization,
- expensive loops,
- unnecessary WebGL allocations,
- inefficient database access.

Do not flag purely theoretical micro-optimizations unless they are relevant to the actual workload.

## Phase 7 — Testing

Determine:

- whether the change has sufficient coverage,
- whether a regression test exists,
- whether failure paths are tested,
- whether integration boundaries are verified.

Do not require tests merely to increase coverage metrics.

## Phase 8 — Verification

Run relevant checks when appropriate.

Examples:

- tests,
- type checks,
- lint,
- static analysis,
- build,
- integration checks.

Do not claim checks were performed unless they were actually executed.

## Findings

For each material issue, report:

- Severity
- File/location
- Problem
- Why it matters
- Recommended fix

Severity:

- CRITICAL — severe security, data loss, corruption, or production failure
- HIGH — major correctness or reliability issue
- MEDIUM — meaningful defect or risk
- LOW — minor issue
- INFO — optional improvement

Do not invent findings to make the review look thorough.

## Final Verdict

Choose one:

### APPROVE

No material issues found.

### APPROVE WITH NOTES

No blocking issues, but minor improvements are recommended.

### CHANGES REQUIRED

At least one material issue must be fixed.

### BLOCKED

The implementation cannot be safely reviewed or verified because required information or infrastructure is unavailable.