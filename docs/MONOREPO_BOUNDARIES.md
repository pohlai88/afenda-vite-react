# Monorepo boundaries

This policy defines **machine-enforced** workspace boundaries for Afenda. The source of truth is `scripts/afenda.config.json`, and CI enforces it through `pnpm run script:check-afenda-config`.

---

## Goals

- Keep product code topology predictable as the monorepo scales.
- Ensure feature modules share a consistent internal shape.
- Lock the **Vite web client** `src/` tree so cross-cutting code does not sprawl at `apps/web/src` root.
- Prevent accidental root sprawl by enforcing a root directory allowlist.
- Keep package structure explicit when `packages/shared` is introduced.

---

## Root boundary policy

Afenda treats `apps/` and `packages/` as the **primary product code roots**.  
Other root directories are support/governance infrastructure (`docs/`, `scripts/`) or generated/vendor output (`dist/`, `node_modules/`).

The guard checks:

- configured primary product directories exist;
- visible root directories match the configured allowlist;
- required root orchestration files are present (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, etc.).

---

## Feature template policy (`apps/web/src/features/*`)

When a feature folder exists, it must include:

- `components/`
- `hooks/`
- `services/`
- `types/`
- `actions/`
- `utils/`
- `index.ts` (public API surface)

This keeps feature modules cohesive and import-safe as capabilities grow.

---

## Web client `src` topology (`apps/web/src`)

**Normative layout:** [Project structure](./PROJECT_STRUCTURE.md).

Configuration lives in **`scripts/afenda.config.json`** under **`workspaceGovernance.webClientSrc`**:

| Field | Purpose |
| --- | --- |
| **`srcRoot`** | Workspace-relative path to the web client source root (typically `apps/web/src`). |
| **`allowedTopLevelDirectories`** | **Exhaustive** list of directory names allowed directly under `src/` (today: `features`, `pages`, `share`). CI fails if any other top-level directory appears or if any listed folder is missing. |
| **`requiredShareSubdirectories`** | Subfolders that must exist under `src/share/` (today: `routing`, `providers`, `state`). Add entries when you introduce required shared buckets (e.g. `components`). |
| **`enforce`** | When `true`, `pnpm run script:check-afenda-config` runs filesystem checks. Set `false` only for exceptional migration windows. |

Cross-cutting client code belongs under **`src/share/`**, not a root-level `lib/`, `hooks/`, or `components/`. Updating **`allowedTopLevelDirectories`** or **`requiredShareSubdirectories`** without changing the tree (or the reverse) will fail the config check—by design.

---

## Workspace testing package (`packages/testing`)

Cross-app **test infrastructure** (shared Vitest setup, and reserved layout for E2E, Storybook, and UI test helpers) belongs in **`packages/testing`** (`@afenda/testing`), not scattered under `apps/*/src`. Apps depend on it and keep **runner config** locally (e.g. `vite.config.ts` `test` block). See [Testing](./TESTING.md) and [`packages/testing/README.md`](../packages/testing/README.md).

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
   - `scripts/afenda-config.ts`
   - `scripts/check-afenda-config.ts`
3. Run:
   - `pnpm run script:check-afenda-config`
   - `pnpm run check`

---

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [Architecture evolution](./ARCHITECTURE_EVOLUTION.md)
- [Project configuration](./PROJECT_CONFIGURATION.md)
