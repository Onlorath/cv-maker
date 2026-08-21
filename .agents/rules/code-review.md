---
trigger: always_on
---

# Code Review Rules

These rules apply when reviewing existing code or reviewing changes made during the current task.

## Review Mindset

Review the implementation as if it were a production pull request.

Do not assume the implementation is correct merely because it compiles or tests pass.

Look for:

- correctness issues,
- security problems,
- architectural violations,
- hidden edge cases,
- race conditions,
- performance regressions,
- error-handling gaps,
- unnecessary complexity,
- backward compatibility problems.

## Review Order

Review changes in this order:

1. Correctness
2. Security
3. Data integrity
4. Error handling
5. Concurrency
6. Performance
7. Maintainability
8. Style

Do not focus on formatting while a correctness issue remains unresolved.

## Scope

Review the actual diff and its surrounding code.

Check:

- modified functions,
- callers,
- dependencies,
- state transitions,
- API contracts,
- database interactions,
- shared utilities,
- tests.

Do not restrict review to the changed lines when surrounding behavior matters.

## Breaking Changes

Identify whether the change affects:

- public APIs,
- database contracts,
- serialized structures,
- frontend/backend contracts,
- authentication,
- environment configuration,
- shared interfaces,
- persisted data.

Flag potential breaking changes explicitly.

## Error Handling

Check whether:

- errors are handled at the correct layer,
- useful context is preserved,
- errors are accidentally swallowed,
- raw internal errors are exposed,
- retries could amplify failures,
- partial writes could leave inconsistent state.

## Security Review

Check for:

- authentication bypass,
- authorization flaws,
- injection,
- XSS,
- CSRF,
- SSRF,
- insecure cookies,
- secret leakage,
- unsafe deserialization,
- unvalidated input,
- excessive data exposure.

Do not assume user-controlled input is trustworthy.

## Performance Review

Look for:

- unnecessary database queries,
- N+1 queries,
- unnecessary network calls,
- large allocations,
- repeated serialization,
- expensive loops,
- unnecessary React renders,
- object creation inside animation loops,
- avoidable client-side work.

Only flag theoretical issues when they have realistic impact.

## Testing Review

Ask:

- Does the change have adequate coverage?
- Is there a regression test for the bug?
- Are edge cases covered?
- Are failure paths tested?
- Are integration boundaries verified where appropriate?

Do not demand tests for trivial code purely for coverage metrics.

## Architecture Review

Check whether the change:

- violates domain boundaries,
- leaks infrastructure concerns,
- introduces unnecessary coupling,
- duplicates business rules,
- creates an abstraction without justification,
- bypasses existing services or repository boundaries.

## Review Output

For every important finding, provide:

- Severity
- File / location
- Problem
- Why it matters
- Recommended fix

Severity levels:

- CRITICAL — security, corruption, data loss, or severe production failure
- HIGH — major correctness or reliability problem
- MEDIUM — meaningful defect or maintainability risk
- LOW — minor issue
- INFO — optional improvement

Do not invent findings merely to appear thorough.

Prioritize real problems.

## Approval Rule

Do not consider a change production-ready if a CRITICAL or HIGH issue remains unresolved.

If no material issues are found, explicitly state that no significant problems were identified and describe what was reviewed.