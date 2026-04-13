---
name: audit-architecture
description: Enforces Afenda audit evidence doctrine (append-only rows, tenant scope, causal traceability, governed payloads, schema/query fitness, invariants, troubleshooting). Use when writing or reviewing audit code under packages/_database/src/audit, audit migrations, retention, investigation APIs, or audit writers in server code.
---

# Audit architecture (Afenda)

## When to apply

- Editing or reviewing `packages/_database/src/audit/**`, audit SQL migrations, or Drizzle audit schema
- Implementing or reviewing audit emission, catalogs, validation, read models, or retention
- Any change that affects audit evidence shape, indexes, or investigation queries

## Canonical instructions (read first)

Module layout, import surface, and registry tables: **[packages/\_database/src/audit/README.md](../../../packages/_database/src/audit/README.md)**.

The full doctrine, numbered rules (doctrine/schema/writer/invariant/error/payload/query/cleanup/drift/troubleshooting), and output format live in one file:

**[packages/\_database/src/audit/\_agents/SKILL.md](../../../packages/_database/src/audit/_agents/SKILL.md)**

At the start of an audit-related task, read that document and follow it unless the user restricts scope.

## Compressed principle

Audit is **durable evidence**, not activity logging or unstructured JSON storage.

## Non-negotiables

- Fail closed: do not persist audit rows that violate doctrine; no silent corruption
- Normal writes require tenant scope; no dumping secrets or unreviewed PII into `changes` / `metadata`
- Append-only evidence; corrections are new rows (or governed workflows), not in-place fixes to prior evidence
- Preserve causal linkage where the architecture depends on it (request, trace, correlation, command, etc.)

## Repo validation (after code changes)

From repo root:

```bash
pnpm exec turbo run typecheck --filter=@afenda/database
pnpm exec turbo run lint --filter=@afenda/database
pnpm exec turbo run test:run --filter=@afenda/database
```

From `packages/_database` (audit-only tests):

```bash
pnpm exec vitest run src/audit
```

Normative human doc (optional context): [docs/AUDIT_ARCHITECTURE.md](../../../docs/AUDIT_ARCHITECTURE.md).
