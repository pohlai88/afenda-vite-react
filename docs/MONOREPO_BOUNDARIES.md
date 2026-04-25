---
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: doctrine
relatedDomain: monorepo-governance
---

# Monorepo boundaries

This policy defines **machine-enforced** workspace boundaries for Afenda. The source of truth is `scripts/afenda.config.json`, and CI enforces it through `pnpm run script:check-afenda-config`.

---

## Goals

- Keep product code topology predictable as the monorepo scales.
- Keep root vs owner-local surfaces explicit instead of relying on folder-name intuition.
- Lock the **Vite web client** `src/` tree so cross-cutting code does not sprawl at `apps/web/src` root.
- Prevent accidental root sprawl by enforcing a root directory allowlist.
- Keep package and feature ownership explicit for docs, doctrine, rules, scripts, schema, and tests.

---

## Root boundary policy

Afenda treats `apps/` and `packages/` as the **primary product code roots**.  
Other root directories are support/governance infrastructure (`docs/`, `scripts/`) or generated/vendor output (`dist/`, `node_modules/`).

The canonical boundary doctrine is defined in [Boundary surfaces](./BOUNDARY_SURFACES.md).
The important distinction is:

- `docs/` stores repo-wide documentation surfaces
- root doctrine defaults to `docs/architecture/**`
- `rules/` stores enforcement-tied policy artifacts
- `scripts/` stores repo-local orchestration
- owner-local docs, rules, scripts, schema, and tests stay with the owner by default

The guard checks:

- configured primary product directories exist;
- visible root directories match the configured allowlist;
- required root orchestration files are present (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, etc.).

---

## Feature-owned surfaces (`apps/web/src/app/_features/*`)

Feature directories live under `apps/web/src/app/_features/*`.
The repository no longer treats `apps/web/src/features/*` as the live feature root.

Feature owners may keep local surfaces with the feature when they are justified:

- `docs/` for feature-local guidance
- doctrine inside `docs/`, only when the feature has a durable local policy or contract surface
- `rules/` for feature-local policy artifacts tied to enforcement or formal review
- `scripts/` for feature-local generators, validators, or audit tooling
- `schema/` for feature-owned models and validation boundaries
- `tests/` or `__tests__/` for feature-owned verification

Do not create feature-local `doctrine/` trees.
Doctrine remains a semantic class, not a default folder name.

---

## Web client `src` topology (`apps/web/src`)

**Normative layout:** [Project structure](./PROJECT_STRUCTURE.md).

Configuration lives in **`scripts/afenda.config.json`** under **`workspaceGovernance.webClientSrc`**:

| Field                             | Purpose                                                                                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`srcRoot`**                     | Workspace-relative path to the web client source root (today: `apps/web/src`).                                                                                                                                    |
| **`allowedTopLevelDirectories`**  | **Exhaustive** list of directory names allowed directly under `src/` (today: `app`, `marketing`, `routes`, `rpc`, `share`). CI fails if any other top-level directory appears or if any listed folder is missing. |
| **`requiredShareSubdirectories`** | Subfolders that must exist under `src/share/`. Add entries only when a shared bucket becomes mandatory across ownership areas.                                                                                    |
| **`enforce`**                     | When `true`, `pnpm run script:check-afenda-config` runs filesystem checks. Set `false` only for exceptional migration windows.                                                                                    |

Cross-cutting client code belongs under **`src/share/`**. Avoid a separate top-level `src/components/`; compose shared UI under **`src/share/`** and keep owner-local code with the owner. Updating **`allowedTopLevelDirectories`** or **`requiredShareSubdirectories`** without changing the tree (or the reverse) will fail the config check by design.

---

## Shared Vitest configuration (`packages/vitest-config`)

Cross-app **Vitest defaults** (shared setup entry, `getAfendaVitestTestOptions()`, coverage presets) belong in **`packages/vitest-config`** (`@afenda/vitest-config`), not scattered under `apps/*/src`. Apps depend on it and keep **runner wiring** locally (e.g. `vite.config.ts` `test` block). See [Testing](./TESTING.md).

---

## Shared package template policy (`packages/shared`)

When `packages/shared` exists and enforcement is enabled, it must include:

- `components/`
- `contexts/`
- `db/`
- `hooks/`
- `lib/`
- `provider/`
- `services/`

This gives a deterministic scaffold for shared cross-app capabilities.

---

## Operational workflow

1. Update policy in `scripts/afenda.config.json`.
2. Keep schema and runtime checks in sync:
   - `scripts/afenda.config.schema.json`
   - `scripts/config/afenda-config.ts`
   - `scripts/config/check-afenda-config.ts`
3. Run:
   - `pnpm run script:check-afenda-config`
   - `pnpm run check`

Boundary-surface checks are warn-first when the classification is new or still being aligned.
They become blocking only after doctrine and placement conventions are stable.

---

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [Boundary surfaces](./BOUNDARY_SURFACES.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [Architecture evolution](./ARCHITECTURE_EVOLUTION.md)
- [Project configuration](./PROJECT_CONFIGURATION.md)
