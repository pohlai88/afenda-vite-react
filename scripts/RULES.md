---
title: Scripts directory rules
description: Layout, naming, entrypoint, and flat vs one-level-nested policy for repository scripts under scripts/.
order: 5
status: active
---

# Scripts directory rules

This folder holds **repo maintenance CLIs**, **shared script modules**, and **workspace manifest** files (`afenda.config.*`). It is not a second application runtime—keep scope narrow.

The generated [`README.md`](./README.md) lists runnable scripts and support files. **This file is authoritative for structure and contribution rules** and is not overwritten by the generator.

---

## 1. What belongs here

- **Entrypoint CLIs** invoked via root `package.json` (`pnpm run script:…`) using `tsx`.
- **Shared loaders/helpers** imported only by other files under `scripts/` (no `pnpm` entry unless intentionally exposed).
- **JSON/Schema config** checked by `script:check-afenda-config` and consumed by automation.

Do **not** put:

- Application UI or `apps/web` feature code.
- Long-lived servers (unless explicitly approved and documented).
- Secrets or real credentials (use env vars and local-only files ignored by git).

---

## 2. Flat vs nested layout

### Default: flat (`scripts/*.ts`)

Use the **repository root of `scripts/`** for:

- Small counts of entrypoints.
- One-off CLIs with no shared private subtree.
- Shared modules used across many scripts (e.g. `afenda-config.ts`).

### When to add **one subdirectory** (`scripts/<area>/`)

Introduce a **single** nested directory when **all** of the following are true:

1. **Three or more** related files (entrypoints and/or colocated helpers) form a clear boundary (e.g. `readme/`, `ci/`, `release/`).
2. Keeping them flat would **blur ownership** or encourage cross-import spaghetti.
3. You are willing to **document** the area (short `README.md` inside that folder is optional but recommended once non-obvious).

### Hard limits

- **At most one level** of nesting under `scripts/` (`scripts/<area>/file.ts`). No `scripts/a/b/c/` without an ADR and update to this policy.
- **`pnpm run script:check-afenda-config`** enforces this depth rule in CI (nested directories under `scripts/<area>/` fail the check).
- **No `node_modules`** under `scripts/` (use the workspace root install).
- **Ignore dot-directories** for script discovery (e.g. `.cache`).

### Naming

This document covers script-local layout and entrypoint rules.
The canonical naming doctrine now lives in [`docs/architecture/governance/NAMING_CONVENTION.md`](../docs/architecture/governance/NAMING_CONVENTION.md).

- **Files:** root script entrypoints remain `kebab-case.ts` and should follow the root-script grammar from the naming doctrine: `<action>-<domain>-<target>.ts`.
- **Directories:** `kebab-case` or short **lowercase** domain names (`readme`, `ci`, `afenda`).
- **Meaning model:** root `scripts/` names must be self-identifying because they are repo-global surfaces; local app/package scripts should move to their owner rather than forcing root to become a junk drawer.

---

## 3. Entrypoints and `package.json`

Every **user-facing** CLI must:

1. Have a **`pnpm run script:…`** script in the **root** `package.json` (workspace runs from repo root).
2. Prefer **`tsx scripts/…`** for repo-global implementations. When a command is owned by one app or package, keep the root command as a thin delegating entrypoint to that owner rather than keeping the implementation in root `scripts/`.
3. Include a **short module comment** or docstring that states purpose (the README generator uses this text).

Internal modules (no direct `pnpm` invocation) should be marked in [`generate-docs-readme.ts`](./generate-docs-readme.ts) `SCRIPT_FILE_OVERRIDES` with `hidden: true`, or live only under a nested folder without a root `package.json` script.

---

## 4. TypeScript and quality

- Typecheck with `pnpm exec tsc -p scripts/tsconfig.json` (or full repo check as documented in root docs).
- Match **strict** typing; avoid `any` unless justified and narrow.
- After adding scripts or changing structure, run **`pnpm run script:check-afenda-config`** and **`pnpm run script:generate-docs-readme`** so manifests and indexes stay aligned.

---

## 5. Config and automation

- **`afenda.config.json`** is the workspace manifest: paths, product identity, **readmeTargets**, etc. Extend the **schema** when adding fields, and keep **`check-afenda-config.ts`** in sync for runtime checks that matter in CI.
- Prefer **config-driven** registration (e.g. `readmeTargets`) over hard-coding new paths in multiple places.

---

## 6. Related documentation

- [Architecture evolution](../docs/workspace/ARCHITECTURE_EVOLUTION.md) — when to add complexity vs defer.
- [AGENTS.md](../AGENTS.md) — AI/human execution index.
- [Project configuration](../docs/workspace/PROJECT_CONFIGURATION.md) — repo-wide tooling.
