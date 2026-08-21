---
trigger: always_on
---

# Engineering Execution Rules

These rules govern normal implementation work.

## Repository First

Before implementing a non-trivial change:

1. Inspect the repository structure.
2. Identify the relevant domain, feature, module, or route.
3. Read the target file and its surrounding dependencies.
4. Search for related types, interfaces, functions, routes, and call sites.
5. Inspect existing tests before creating new ones.
6. Identify existing patterns that the implementation should follow.

Do not redesign an existing subsystem without understanding its current implementation.

## Implementation Strategy

For every implementation:

1. Understand the requirement.
2. Determine the affected code paths.
3. Identify constraints.
4. Choose the smallest correct implementation.
5. Implement.
6. Verify.
7. Review the resulting change.

Prefer local, focused modifications over broad refactoring.

## Existing Architecture

- Follow the architecture defined by the repository.
- Reuse existing utilities, services, hooks, components, and abstractions when appropriate.
- Do not introduce a new abstraction if an existing one already solves the problem.
- Do not create generic frameworks for a single use case.
- Do not reorganize directories without a concrete architectural reason.

## Dependency Discipline

Before adding a dependency:

- Search the repository for an existing equivalent.
- Determine whether the standard library or existing dependencies are sufficient.
- Check the dependency's maintenance status when relevant.
- Consider security, bundle size, runtime cost, and long-term maintenance.

Do not add dependencies for trivial functionality.

## API Changes

When changing an API:

- Search all callers.
- Inspect request and response models.
- Check validation behavior.
- Check authentication and authorization implications.
- Check error handling.
- Check frontend consumers.
- Check tests.
- Consider backward compatibility.

Do not modify an API contract without checking its consumers.

## Database Changes

When modifying database behavior:

- Inspect existing schema assumptions.
- Inspect relevant queries and indexes.
- Check transaction boundaries.
- Check nullability and constraints.
- Check possible N+1 behavior.
- Check migration requirements.
- Verify the actual query behavior rather than assuming it.

## Frontend Changes

When modifying frontend behavior:

- Identify whether the code runs on the server or client.
- Avoid introducing unnecessary Client Components.
- Check existing state ownership.
- Check loading and error states.
- Check responsive behavior where applicable.
- Verify critical interactions after implementation.

## Performance

Do not optimize blindly.

Consider:

- algorithmic complexity,
- memory allocation,
- database queries,
- network requests,
- serialization,
- rendering,
- bundle size,
- unnecessary state updates.

Only introduce a more complex optimization when there is a concrete benefit.

## Verification

After implementation:

1. Run the most targeted relevant check.
2. Run tests.
3. Run type checking when applicable.
4. Run lint/static analysis when applicable.
5. Run the build when applicable.
6. Re-test the affected behavior.

Do not stop at "it compiles".

## Final Review

Before finishing:

- Inspect the changed files.
- Check for accidental modifications.
- Check for dead code.
- Check for unnecessary dependencies.
- Check error handling.
- Check security implications.
- Check whether the implementation actually solves the original requirement.

Report any unverified assumption.