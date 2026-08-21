---
description: Performs a structured root-cause investigation, reproduces the issue, uses terminal evidence, applies a minimal fix, and verifies the original failure is resolved.
---

# Deep Debug Workflow

Use this workflow for bugs, runtime errors, failing tests, unexpected behavior, crashes, regressions, and difficult-to-reproduce problems.

## Objective

Do not optimize for speed of the first fix.

Optimize for:

- correct diagnosis,
- evidence-based reasoning,
- minimal changes,
- complete verification.

## Phase 1 — Understand

Before changing anything:

1. Read the user's problem carefully.
2. Identify the expected behavior.
3. Identify the observed behavior.
4. Identify relevant error messages or symptoms.
5. Determine the likely subsystem involved.

Do not modify files during this phase unless modification is required to reproduce the problem.

## Phase 2 — Inspect

Inspect the repository before forming a final diagnosis.

Check:

- repository structure,
- relevant files,
- related functions,
- callers,
- dependencies,
- configuration,
- tests,
- environment assumptions.

Search for all relevant references.

Never assume that the reported file or function is the actual source of the problem.

## Phase 3 — Reproduce

Reproduce the failure whenever practical.

Use the terminal and project tooling.

Capture:

- exact command,
- exact input,
- relevant output,
- exit code,
- stack trace,
- logs,
- network response,
- database behavior when applicable.

If reproduction is impossible, explicitly record why and continue using the strongest available evidence.

## Phase 4 — Diagnose

Construct a root-cause hypothesis based on evidence.

For important hypotheses:

1. Identify supporting evidence.
2. Identify contradictory evidence.
3. Run the smallest useful verification.
4. Update the diagnosis based on the result.

Do not commit to the first plausible explanation.

Distinguish clearly between:

- confirmed root cause,
- likely cause,
- remaining uncertainty.

## Phase 5 — Plan

Before modifying code, determine:

1. Root cause.
2. Minimal fix.
3. Files that need modification.
4. Potential side effects.
5. Verification strategy.

Avoid unrelated refactoring.

## Phase 6 — Implement

Apply the smallest coherent fix.

Rules:

- Follow existing architecture.
- Reuse existing abstractions where appropriate.
- Do not introduce unnecessary dependencies.
- Do not change unrelated behavior.
- Do not patch downstream symptoms when the root cause can be fixed directly.

## Phase 7 — Verify

Immediately after implementation:

1. Re-run the original reproduction.
2. Confirm that the original failure is gone.
3. Run the narrowest relevant regression test.
4. Run broader tests when shared code was modified.
5. Run type checks, linting, static analysis, or build checks when applicable.

Do not declare success because the code compiles.

## Phase 8 — Review

Before finishing:

- Inspect the final diff.
- Check for accidental changes.
- Check for new error paths.
- Check security implications.
- Check concurrency implications.
- Check performance implications.
- Check whether the fix could break another code path.

## Completion Report

Report:

### Root Cause

Explain the confirmed cause.

### Fix

Explain exactly what changed.

### Verification

List the commands and checks actually executed.

### Result

State whether the original issue was successfully resolved.

### Remaining Uncertainty

Explicitly report anything that could not be verified.