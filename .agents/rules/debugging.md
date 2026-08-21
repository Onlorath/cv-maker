---
trigger: always_on
---

# Debugging & Investigation Rules

These rules apply whenever the task involves a bug, unexpected behavior, failing tests, runtime errors, performance regressions, or unexplained system behavior.

## Core Rule

**Evidence before modification.**

Do not change code merely because a hypothesis seems plausible.

First collect evidence.

## Investigation Order

Use this sequence whenever practical:

1. Observe the failure.
2. Reproduce the failure.
3. Capture the exact error.
4. Inspect relevant logs and terminal output.
5. Identify the execution path.
6. Search related code and call sites.
7. Form a root-cause hypothesis.
8. Verify the hypothesis.
9. Implement the smallest fix.
10. Reproduce the original failure.
11. Run regression tests.

Do not skip directly from step 3 to step 9 without sufficient evidence.

## Reproduction

Whenever practical, reproduce the issue before modifying the implementation.

Record:

- exact command,
- exact request,
- exact input,
- environment assumptions,
- error output,
- exit code,
- expected behavior,
- actual behavior.

If reproduction is impossible, explicitly state why.

## Terminal Usage

Use the terminal aggressively during debugging.

Use it to:

- inspect files,
- search symbols,
- inspect process output,
- inspect dependencies,
- inspect environment variables,
- run tests,
- run builds,
- inspect generated files,
- reproduce HTTP requests,
- inspect database behavior,
- verify configuration,
- verify filesystem state.

Prefer evidence from commands over assumptions.

## Error Analysis

When a command fails:

1. Read the entire relevant output.
2. Identify the actual failing component.
3. Determine whether the error is primary or secondary.
4. Inspect the referenced source/configuration.
5. Verify the likely cause.
6. Only then apply a fix.

Do not repeatedly run slightly different commands without learning from previous output.

## Root Cause

Do not patch symptoms.

Ask:

- Why did this happen?
- What assumption failed?
- Which component violated its expected contract?
- Is the observed error only a downstream consequence?
- Could the same bug occur through another code path?

Fix the earliest incorrect assumption or state transition that causes the failure.

## Debug Instrumentation

Temporary diagnostic logging or instrumentation may be added when necessary.

Rules:

- Keep it minimal.
- Do not expose secrets.
- Remove diagnostic code when no longer required.
- Prefer structured logs in production code.
- Do not leave `console.log` or ad-hoc prints behind as the final solution.

## Database Debugging

When debugging database problems:

- Run the actual query where possible.
- Inspect parameters.
- Inspect transaction boundaries.
- Check affected rows.
- Check indexes when relevant.
- Check connection/pool behavior when relevant.
- Verify whether the issue is query logic, data, schema, transaction state, or application code.

## Frontend Debugging

When debugging frontend behavior:

- Determine whether the problem is rendering, state, event handling, data fetching, caching, hydration, or CSS/layout.
- Inspect browser console/network behavior when relevant.
- Verify actual state transitions.
- Check whether the component is server or client rendered.
- Reproduce the issue under the same conditions as the report.

## Race Conditions & Concurrency

Do not assume sequential execution.

Consider:

- concurrent requests,
- goroutines,
- async callbacks,
- stale state,
- race conditions,
- duplicate events,
- retries,
- transaction isolation,
- cache invalidation.

When appropriate, reproduce under repeated execution rather than a single successful run.

## Performance Debugging

Do not claim a performance problem without evidence.

Prefer:

- benchmarks,
- profiling,
- timing measurements,
- query plans,
- browser performance tools,
- memory measurements,
- network inspection.

Separate actual bottlenecks from theoretical inefficiencies.

## Verification After Fix

After implementing a fix:

1. Re-run the original reproduction.
2. Verify the expected behavior.
3. Run the relevant regression tests.
4. Run broader checks if the modified code is shared.
5. Confirm no new errors were introduced.

A fix is incomplete until the original failure has been re-tested.

## Final Debug Report

Conclude with:

- Root cause
- Fix
- Evidence
- Verification performed
- Remaining uncertainty

Never report a speculative diagnosis as confirmed.