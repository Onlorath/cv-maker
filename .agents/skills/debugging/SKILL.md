---
name: debugging
description: Provides systematic debugging guidance for runtime errors, failed tests, unexpected behavior, performance regressions, root-cause analysis, evidence collection, and verification.
---

# Deep Debugging Skill

Use this skill whenever the task involves unexplained behavior, errors, failed tests, crashes, performance regressions, inconsistent results, or difficult-to-reproduce failures.

## Fundamental Rule

**Evidence before fixes.**

Never modify production behavior merely because a hypothesis sounds plausible.

Collect evidence first whenever evidence is available.

## Debugging Model

Use this general process:

    Symptom
        ↓
    Reproduction
        ↓
    Evidence
        ↓
    Execution Path
        ↓
    Root Cause
        ↓
    Minimal Fix
        ↓
    Regression Verification

Do not skip directly from symptom to implementation unless the issue is trivial and the cause is already established.

## Evidence Collection

Prefer concrete evidence from:

- terminal output,
- stack traces,
- logs,
- source code,
- test output,
- network traces,
- database output,
- browser developer tools,
- profiling,
- benchmarks,
- generated files,
- environment inspection.

Avoid speculative reasoning when the system can be inspected directly.

## Reproduction

Whenever practical:

1. Reproduce the issue.
2. Capture the exact input or command.
3. Capture the exact error output.
4. Record the exit code.
5. Record the expected behavior.
6. Record the actual behavior.

If reproduction is impossible, state the limitation and maximize evidence collection instead.

## Hypothesis Testing

For each significant hypothesis:

1. Identify the evidence supporting it.
2. Identify what would contradict it.
3. Perform the smallest useful test.
4. Update the diagnosis based on the result.

Do not become attached to the first hypothesis.

## Execution Path

Determine where the failure originates.

For a Wails desktop application:

    React Component
      ↓
    Zustand / Local State
      ↓
    Wails IPC Binding
      ↓
    Go Service
      ↓
    Persistence / External API

Inspect upstream behavior before patching downstream symptoms.

## Root Cause

Ask:

- What assumption failed?
- Which component violated its expected contract?
- Is the observed error only a downstream consequence?
- Could the same problem occur through another code path?
- Is the system state invalid, or is the code incorrectly interpreting valid state?

Fix the earliest incorrect state, assumption, or contract that causes the failure.

## Debug Instrumentation

Temporary diagnostic logging or instrumentation may be added when necessary.

Rules:

- Keep instrumentation minimal.
- Do not expose secrets or sensitive data.
- Remove temporary diagnostics when no longer needed.
- Prefer structured logging in production code.
- Do not leave ad-hoc debug statements behind as the final solution.

## Database Debugging

When debugging database behavior:

- inspect the actual query,
- inspect parameters,
- inspect transaction boundaries,
- inspect affected rows,
- inspect indexes when relevant,
- inspect query plans when relevant,
- determine whether the failure comes from query logic, data, schema, transaction state, connection behavior, or application logic.

## Frontend Debugging

When debugging frontend behavior, determine whether the failure comes from:

- rendering,
- state management (Zustand or local),
- event handling,
- Wails IPC calls,
- stale or out-of-order responses,
- CSS/layout,
- race conditions,
- asynchronous ordering.

Use browser developer tools when relevant.

Verify actual state transitions instead of assuming them.

## Intermittent Bugs

For intermittent failures, consider:

- race conditions,
- timing,
- retries,
- stale state,
- cache invalidation,
- network instability,
- resource exhaustion,
- concurrent requests,
- nondeterministic ordering,
- external service behavior.

Increase repetition, logging, or instrumentation rather than guessing.

## Performance Debugging

Do not call something a bottleneck without evidence.

Prefer:

- Go benchmarks,
- Go profilers (pprof),
- React profiling,
- browser performance tools,
- IPC call frequency and latency,
- file I/O timing,
- memory measurements,
- external API response times.

Separate theoretical inefficiencies from measured bottlenecks.

## Regression Protection

When fixing a reproducible bug:

- add or update a regression test when practical,
- preserve the reproduction case,
- verify the original failure is gone,
- verify expected behavior remains correct.

## Final Diagnosis

A diagnosis is confirmed only when evidence connects the observed failure to the identified root cause.

Do not present a likely cause as a confirmed fact.

## Verification

After implementing a fix:

1. Re-run the original reproduction.
2. Verify the expected behavior.
3. Run the relevant regression tests.
4. Run broader checks when the change affects shared code.
5. Confirm that no new errors were introduced.

A successful build alone does not prove that a behavioral bug is fixed.