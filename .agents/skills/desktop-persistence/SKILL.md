---
name: desktop-persistence
description: Provides desktop application persistence guidance for SQLite, JSON and file-based storage, local data integrity, migrations, atomic writes, backups, recovery, and sensitive user data.
---

# Desktop Persistence Skill

Use this skill for storing application and user data locally in desktop applications.

## Core Principles

- Prefer simple persistence that matches the actual data requirements.
- Preserve user data integrity above convenience.
- Make writes predictable and recoverable.
- Avoid introducing a database when simple file persistence is sufficient.
- Avoid file-based persistence when relational querying and transactional integrity justify SQLite or another embedded database.

## Choosing a Persistence Strategy

Consider the actual requirements before selecting a storage mechanism.

### JSON / File Storage

Appropriate when:

- data is relatively small,
- the structure is document-oriented,
- complex querying is unnecessary,
- human-readable export/import is valuable,
- the application mostly reads and writes the complete document.

### SQLite

Prefer when:

- multiple entities have relationships,
- partial queries are required,
- data volume is growing,
- transactions matter,
- filtering and indexing are important,
- multiple records need independent updates.

Do not introduce SQLite merely because it is available.

## Data Integrity

Consider:

- partial writes,
- application crashes,
- power loss,
- concurrent access,
- corrupted files,
- schema changes,
- invalid user input.

For critical file writes, prefer an atomic write strategy such as:

1. Write to a temporary file.
2. Flush and close successfully.
3. Replace the target file atomically where supported.

## JSON Persistence

When persisting JSON:

- Define explicit serializable structures.
- Avoid persisting transient UI state unless required.
- Validate loaded data.
- Handle missing fields for older versions.
- Handle malformed files gracefully.
- Do not assume the stored document is valid merely because the application created it.

## SQLite

When using SQLite:

- Define schema explicitly.
- Use parameterized queries.
- Use transactions for atomic multi-step updates.
- Add indexes based on actual query patterns.
- Handle migration versions explicitly.
- Keep the database connection lifecycle controlled.
- Avoid unnecessary locking contention.

## Migrations

Persisted user data survives application versions.

Therefore:

- Every schema change must consider existing installations.
- Do not assume the database is empty.
- Make migrations deterministic.
- Maintain a clear schema version.
- Test migrations against representative older versions.
- Consider recovery before destructive migrations.

## Import / Export

When implementing import/export:

- Validate imported data.
- Never trust file contents.
- Handle malformed or incomplete files.
- Preserve backward compatibility where practical.
- Avoid silently discarding fields.
- Surface meaningful validation errors.

## Backup and Recovery

For important user data, consider:

- automatic backup,
- explicit export,
- recovery after interrupted writes,
- backup retention,
- corruption detection.

Do not claim data is safely persisted if crash recovery has not been considered.

## Filesystem Security

Treat file paths and file contents as untrusted.

Consider:

- path traversal,
- inaccessible locations,
- permission errors,
- symlinks where relevant,
- platform-specific path rules,
- unexpected file types,
- large files.

Do not write to arbitrary paths without validating the intended operation.

## Sensitive User Data

Resume data may include personal information.

Treat as sensitive:

- names,
- email addresses,
- phone numbers,
- addresses,
- work history,
- education,
- profile images,
- uploaded documents.

Rules:

- Do not log sensitive user data unnecessarily.
- Do not transmit local data externally unless required.
- Minimize data sent to external AI services.
- Keep API credentials separate from user data.

## Verification

After modifying persistence behavior:

- Test loading existing data.
- Test creating new data.
- Test updating data.
- Test malformed input.
- Test missing files or records.
- Test interrupted or failed writes where practical.
- Test migrations when schema changes.
- Verify that data survives application restart.