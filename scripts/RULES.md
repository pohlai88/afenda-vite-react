---
title: Scripts directory rules
description: Layout, naming, grouped-area policy, and one-level-nested topology rules for repository scripts under scripts/.
order: 5
status: active
---

# Scripts directory rules

This folder holds **repo-local orchestration**, **shared script modules**, and **workspace manifest** files (`afenda.config.*`). It is not a second application runtime and it is not the default home for owner-local tooling.

The generated [`README.md`](./README.md) lists runnable scripts and support files. **This file is authoritative for structure and contribution rules** and is not overwritten by the generator.

---

## 1. What belongs here

- **Entrypoint CLIs** invoked via root `package.json` (`pnpm run script:…`) using `tsx`.
- **Shared loaders/helpers** imported only by other files under `scripts/` (no `pnpm` entry unless intentionally exposed).
- **JSON/Schema config** checked by `script:check-afenda-config` and consumed by automation.

Root `scripts/` is the execution surface for repo-wide orchestration.
Feature-local or package-local runnable tooling belongs with the owner by default.

Do **not** put:

- Application UI or `apps/web` feature code.
- Feature-local or package-local scripts in root `scripts/` for convenience.
- Long-lived servers (unless explicitly approved and documented).
- Secrets or real credentials (use env vars and local-only files ignored by git).

---

## 2. Grouped layout

### Default: grouped areas (`scripts/<area>/file.ts`)

Entrypoint CLIs and script-local support modules should live under a **named area directory**:

- `scripts/config/` — workspace manifest loading and config validation
- `scripts/docs/` — generated docs navigation and doc-index tooling
- `scripts/governance/` — governance-domain checks and evidence writers
- `scripts/runtime/` — toolchain/runtime diagnostics
- `scripts/ui/` — repo-global UI quality checks
- `scripts/integrations/` — external tool bridges and adapters
- existing support areas such as `lib/`, `repo-integrity/`, and `fixtures/` remain valid

### Root `scripts/` is reserved

Keep the **repository root of `scripts/`** for:

- workspace manifests and schemas (`afenda.config.*`)
- root support files (`README.md`, `RULES.md`, `tsconfig.json`)
- hidden/generated support directories when explicitly allowed

Do **not** leave new `.ts`, `.js`, or `.mjs` entrypoints directly in `scripts/`.
If a script is runnable or importable as repo-local code, it should have an area owner.

### Hard limits

- **At most one level** of nesting under `scripts/` (`scripts/<area>/file.ts`). No `scripts/a/b/c/` without an ADR and update to this policy.
- **`pnpm run script:check-afenda-config`** enforces both:
  - root `scripts/` reserved-file policy
  - one-level nesting only (nested directories under `scripts/<area>/` fail the check)
- **No `node_modules`** under `scripts/` (use the workspace root install).
- **Ignore dot-directories** for script discovery (e.g. `.cache`).

### Naming

This document covers script-local layout and entrypoint rules.
The canonical naming doctrine now lives in [`docs/architecture/governance/NAMING_CONVENTION.md`](../docs/architecture/governance/NAMING_CONVENTION.md).

- **Files:** grouped script entrypoints remain `kebab-case.ts` and should follow the root-script grammar from the naming doctrine: `<action>-<domain>-<target>.ts`.
- **Directories:** `kebab-case` or short **lowercase** domain names (`config`, `docs`, `governance`, `runtime`, `ui`).
- **Meaning model:** area directories communicate ownership first; the root should no longer act as a flat script inventory.

---

## 3. Entrypoints and `package.json`

Every **user-facing** CLI must:

1. Have a **`pnpm run script:…`** script in the **root** `package.json` (workspace runs from repo root).
2. Prefer **`tsx scripts/<area>/…`** for repo-global implementations. When a command is owned by one app or package, keep the root command as a thin delegating entrypoint to that owner rather than keeping the implementation in root `scripts/`.
3. Include a **short module comment** or docstring that states purpose (the README generator uses this text).

Internal modules (no direct `pnpm` invocation) should be marked in [`docs/generate-docs-readme.ts`](./docs/generate-docs-readme.ts) `SCRIPT_FILE_OVERRIDES` with `hidden: true`, or live under an area folder without a root `package.json` script.

---

## 4. TypeScript and quality

- Typecheck with `pnpm exec tsc -p scripts/tsconfig.json` (or full repo check as documented in root docs).
- Match **strict** typing; avoid `any` unless justified and narrow.
- After adding scripts or changing structure, run **`pnpm run script:check-afenda-config`** and **`pnpm run script:generate-docs-readme`** so manifests and indexes stay aligned.

---

## 5. Config and automation

- **`afenda.config.json`** is the workspace manifest: paths, product identity, **readmeTargets**, etc. Extend the **schema** when adding fields, and keep **`config/check-afenda-config.ts`** in sync for runtime checks that matter in CI.
- Prefer **config-driven** registration (e.g. `readmeTargets`) over hard-coding new paths in multiple places.

---

## 6. Related documentation

- [Boundary surfaces](../docs/workspace/BOUNDARY_SURFACES.md) — canonical root vs owner-local surface doctrine.
- [Architecture evolution](../docs/workspace/ARCHITECTURE_EVOLUTION.md) — when to add complexity vs defer.
- [AGENTS.md](../AGENTS.md) — AI/human execution index.
- [Project configuration](../docs/workspace/PROJECT_CONFIGURATION.md) — repo-wide tooling.
- [Scripts topology handoff](../docs/architecture/governance/SCRIPTS_TOPOLOGY_HANDOFF.md) — developer handoff for grouped scripts ownership and migration baseline.
