---
description: Plans, implements, tests, and verifies a non-trivial feature while preserving existing architecture and minimizing unrelated changes.
---

# Deep Feature Workflow

Use this workflow for new features, significant functionality, integrations, and non-trivial architectural changes.

## Objective

Implement the feature completely without unnecessary complexity or unrelated refactoring.

## Phase 1 — Requirement Analysis

Determine:

1. What exactly must be built?
2. What is explicitly out of scope?
3. What existing behavior must remain unchanged?
4. What are the acceptance criteria?
5. Which parts of the system are affected?

Do not start implementation while important requirements remain unclear.

## Phase 2 — Repository Reconnaissance

Inspect:

- project structure,
- relevant domains,
- existing services,
- repositories,
- handlers,
- components,
- state management,
- API contracts,
- database models,
- configuration,
- existing tests.

Search existing implementations for similar behavior.

Reuse established patterns where appropriate.

## Phase 3 — Architecture Plan

Before implementation, define:

- affected modules,
- data flow,
- API changes,
- database changes,
- frontend changes,
- state changes,
- external dependencies,
- error paths,
- security implications,
- testing strategy.

Prefer the smallest architecture that satisfies the requirement.

Do not introduce speculative abstractions.

## Phase 4 — Implementation Order

Prefer this sequence when applicable:

1. Domain/data model.
2. Repository/data access.
3. Usecase/business logic.
4. API/transport layer.
5. Frontend integration.
6. UI behavior.
7. Tests.

Adapt the sequence to the repository architecture when necessary.

## Phase 5 — Implementation

Rules:

- Keep boundaries explicit.
- Follow existing architecture.
- Reuse existing infrastructure.
- Avoid unrelated refactoring.
- Keep changes focused.
- Validate assumptions before relying on them.

## Phase 6 — Verification

Verify each affected layer.

Backend:

- unit tests,
- integration tests,
- API behavior,
- error paths.

Database:

- schema,
- migrations,
- queries,
- transactions,
- indexes where relevant.

Frontend:

- type checks,
- lint,
- component behavior,
- loading/error states,
- important user interactions.

Integration:

- request/response compatibility,
- authentication,
- authorization,
- serialization,
- error propagation.

## Phase 7 — Regression Review

Check whether the feature could affect:

- existing APIs,
- shared components,
- database behavior,
- authentication,
- authorization,
- caching,
- concurrency,
- performance.

Run broader verification when the affected code is shared.

## Phase 8 — Final Review

Inspect the final diff.

Remove:

- dead code,
- temporary debugging code,
- unnecessary abstractions,
- unused imports,
- unused dependencies,
- unrelated modifications.

## Completion Report

Report:

### Implemented

What was added.

### Architecture

Which modules and boundaries were affected.

### Verification

Which commands and tests were actually executed.

### Risks

Any remaining limitations or technical risks.