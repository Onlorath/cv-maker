---
name: react-vite
description: Provides React and Vite engineering guidance for desktop and client-side applications, component architecture, state management, rendering performance, build tooling, accessibility, and frontend integration.
---

# React + Vite Engineering Skill

Use this skill for React and Vite frontend development in client-side and desktop applications.

## Core Principles

- Write idiomatic, maintainable React.
- Follow the existing project architecture.
- Keep components focused and cohesive.
- Prefer simple state flows over unnecessary abstractions.
- Avoid unnecessary client-side work.
- Preserve predictable data flow.
- Optimize based on evidence rather than speculation.

## Component Architecture

- Keep components focused on a clear responsibility.
- Separate presentation, state management, and business logic when complexity warrants it.
- Reuse existing components and utilities when appropriate.
- Avoid unnecessarily large components.
- Avoid deeply nested conditional rendering when clearer state-driven logic is possible.
- Do not introduce abstractions for a single trivial use case without justification.

## State Management

Prefer this order:

1. Local component state for isolated UI state.
2. Derived state when a value can be calculated from existing state.
3. Zustand or the project's existing state-management solution for genuinely shared client state.

Rules:

- Avoid multiple sources of truth.
- Do not store derived values unnecessarily.
- Do not move state into global stores merely because it is convenient.
- Keep transient UI state local where possible.
- For complex multi-step interactions, prefer explicit state-machine-like transitions over deeply nested conditions.

## React Rendering

Watch for:

- unnecessary re-renders,
- unstable object and function references,
- unnecessary effects,
- duplicated state,
- expensive calculations during render,
- large component trees,
- excessive DOM updates.

Rules:

- Do not use `useMemo` or `useCallback` indiscriminately.
- Use memoization when there is a clear rendering or computation benefit.
- Prefer derived values over synchronization effects when possible.
- Avoid using React state for values that change at very high frequency unless React rendering is actually required.

## Effects

Before using `useEffect`, determine whether the behavior can instead be implemented through:

- derived state,
- event handlers,
- direct computation,
- a server/backend operation,
- a state transition.

Avoid effects that merely synchronize state with other state.

## Async Operations

Every significant asynchronous action should account for:

- loading state,
- success state,
- failure state,
- empty state when relevant,
- retry behavior,
- cancellation or stale-response handling where relevant.

Do not design only for the successful path.

## Wails Integration

When interacting with Go through Wails:

- Keep Wails-generated bindings isolated from presentation components where practical.
- Do not scatter raw backend invocations throughout the component tree.
- Create small frontend service or adapter layers when repeated backend interaction becomes complex.
- Handle backend errors explicitly.
- Preserve typed request and response contracts.
- Consider stale asynchronous responses and component lifecycle.

## Vite

Follow the existing Vite configuration.

When changing build configuration:

- Understand why the configuration exists.
- Avoid adding plugins without justification.
- Consider development and production behavior separately.
- Check asset paths and desktop packaging implications.
- Avoid changing environment handling without checking all consumers.

## Performance

Consider:

- unnecessary renders,
- expensive computations,
- large component trees,
- excessive state updates,
- asset size,
- IPC frequency,
- serialization cost,
- unnecessary filesystem or backend calls.

Do not optimize before identifying the actual bottleneck.

## Accessibility

When creating or modifying UI:

- Prefer semantic HTML.
- Provide accessible names for controls.
- Preserve keyboard accessibility.
- Maintain sensible focus behavior.
- Do not rely solely on color to communicate state.
- Ensure dialogs, forms, and interactive controls have clear states.

## Styling

Follow the project's established styling system.

Do not introduce a second styling solution without justification.

Preserve:

- spacing conventions,
- typography,
- component patterns,
- responsive behavior,
- interaction states.

## Verification

After modifying React or Vite code:

- Run the relevant type check if available.
- Run linting if available.
- Run relevant tests.
- Run the production build for significant changes.
- Verify important UI interactions.

Use the project's actual scripts rather than assuming command names.

Never claim verification that was not actually performed.