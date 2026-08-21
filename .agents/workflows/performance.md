---
description: Investigates and optimizes real performance bottlenecks using measurement, profiling, query analysis, runtime inspection, and before-and-after verification.
---

# Performance Engineering Workflow

Use this workflow when performance, latency, memory consumption, CPU usage, GPU usage, bundle size, database speed, or scalability is a meaningful concern.

## Core Principle

**Measure before optimizing.**

Do not optimize based solely on intuition or theoretical complexity.

## Phase 1 — Define the Problem

Determine:

- what is slow,
- when it is slow,
- who experiences the problem,
- expected performance,
- current measured performance,
- whether the issue is CPU, memory, network, database, rendering, or external dependency related.

Define a measurable target when practical.

## Phase 2 — Baseline

Measure current behavior.

Possible measurements:

- execution time,
- request latency,
- throughput,
- memory usage,
- allocation count,
- CPU usage,
- database query time,
- network timing,
- JavaScript execution time,
- React render count,
- GPU frame time,
- draw calls,
- bundle size.

Record the baseline before changing implementation.

## Phase 3 — Locate the Bottleneck

Determine the actual bottleneck.

Go:

- benchmark,
- profile,
- inspect allocations,
- inspect goroutines,
- inspect database latency.

Next.js / React:

- inspect client bundle size,
- inspect rendering behavior,
- inspect network waterfalls,
- inspect unnecessary state updates,
- inspect Server/Client boundaries.

Database:

- inspect query plans,
- inspect indexes,
- inspect cardinality,
- inspect round trips.

Three.js:

- inspect CPU frame time,
- GPU frame time,
- draw calls,
- triangle count,
- allocations,
- texture memory,
- shader complexity.

## Phase 4 — Choose Optimization

Choose the smallest change that directly addresses the bottleneck.

Prefer:

- reducing unnecessary work,
- reducing I/O,
- batching,
- caching where appropriate,
- reducing allocations,
- improving query strategy,
- reducing rendering work,
- precomputing stable values.

Do not introduce complexity without measurable benefit.

## Phase 5 — Implement

Implement only the justified optimization.

Preserve:

- correctness,
- architecture,
- API behavior,
- security,
- maintainability.

## Phase 6 — Re-measure

Measure the same metric used for the baseline.

Compare:

- before,
- after,
- percentage improvement,
- resource cost,
- side effects.

If the optimization does not materially improve the bottleneck, reconsider or revert it.

## Phase 7 — Regression Check

Verify that the optimization did not introduce:

- correctness bugs,
- memory leaks,
- race conditions,
- API regressions,
- increased bundle size,
- worse behavior elsewhere,
- excessive complexity.

## Final Report

Report:

### Bottleneck

What was actually causing the performance problem.

### Baseline

The measured pre-optimization result.

### Optimization

What changed.

### Result

The measured post-optimization result.

### Trade-offs

Any additional complexity or resource cost introduced.

Do not claim performance improvements without measurements.