# Data artifacts (`docs/data`)

This folder under **`packages/_database/docs`** holds **machine-readable** files for humans, documentation, and optional repo scripts (for example validating glossary entries against schema exports).

## Contents

| File | Purpose |
| ---- | ------- |
| [business-technical-glossary.yaml](./business-technical-glossary.yaml) | Maps **business terms** to **PostgreSQL tables** / enums and **`*.schema.ts`** paths (glossary catalog). |
| [database-truth-governance.yaml](./database-truth-governance.yaml) | Separate **truth / scope / time** governance overlay (do not overload the glossary). |

## Conventions

- Bump **`schema_version`** in the YAML when the **shape** of the file changes (new required keys, renamed top-level sections), not for every new entry.
- Prefer stable per-entry **`id`** values (`snake_case`) so automation can reference them across releases.
- After editing either YAML, run **`pnpm --filter @afenda/database studio:sync`** (alias: **`glossary:sync`**) so validated JSON snapshots stay in sync: `src/studio/business-glossary.snapshot.json` and `src/studio/database-truth-governance.snapshot.json` (Zod-validated; includes `generated_at`, `source_content_sha256`, optional `source_commit`).

## Related docs

- [Database architecture doctrine](../DATABASE_ARCHITECTURE_DOCTRINE.md) — business-first principles (tenant scope, identity vs domain, master vs transactional).
- [Database](../../../docs/DATABASE.md) — PostgreSQL, Drizzle, migrations, seeds (repo root).
