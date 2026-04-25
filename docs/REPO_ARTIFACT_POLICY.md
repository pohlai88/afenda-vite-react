---
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: artifact-governance
---

# Repository artifact policy

This document is the operating guide for [`ADR-0003: Package root layout and artifact boundaries`](./architecture/adr/ADR-0003-package-root-layout-and-artifact-boundaries.md).
`ADR-0003` is the decision record.
This page explains how to apply that decision when wiring tools, cleaning package roots, and deciding where generated outputs belong.

## Decision anchor

- [`docs/architecture/adr/ADR-0003-package-root-layout-and-artifact-boundaries.md`](./architecture/adr/ADR-0003-package-root-layout-and-artifact-boundaries.md)

## Three classes of paths

### 1. Root truth / workspace control

Stay at the repository root because they **define or orchestrate** the workspace:

- `.git/`
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`
- Shared config: ESLint, Prettier, TypeScript bases, CI under `.github/`
- Source trees: `apps/`, `packages/`, `scripts/`, `docs/`
- Dependency store: `node_modules/`

These are **not** package build outputs.

### 2. Package-owned outputs

**Build products** and package-scoped generated files live **next to the producer**:

- `apps/web/dist` (Vite build)
- `packages/<name>/dist` when a library emits a bundle

### 3. Repo-level generated artifacts

**Cross-cutting evidence** that does not belong to a single package’s build:

- Governance / validation JSON snapshots
- CI-exported analysis
- Optional centralized **cache** (Turborepo)
- Script scratch that is **repo-wide**, not feature code

**All of this goes under a single bucket:**

```txt
.artifacts/                    # at repo root OR under a package (never loose files at scope root)
  eslint/            # ESLint cache — all `lint` scripts use `--cache-location .artifacts/eslint`
  cache/
    turbo/           # optional: set TURBO_CACHE_DIR (see below)
  reports/
    shell-governance/
  tmp/               # repo-script scratch (not root `.tmp/`)
```

**Where the bucket lives**

- **Repository-wide** outputs (governance reports, optional Turborepo cache, root `pnpm` scripts that write evidence) use **`/.artifacts/`** at the monorepo root.
- **Package-scoped** tool output (Vitest coverage, Playwright, bundle stats, ESLint cache for `pnpm --filter <pkg> lint`) uses **`<packageDir>/.artifacts/`** next to that package — same directory name, so every scope has one obvious tree to delete.

**Rules:**

- **Do not** put generic repo exhaust under `packages/*`. Anything under `packages/` is **maintained product code** (or a real workspace package), not a dumping ground for generated evidence.
- **Root `dist/`** is **disallowed** unless there is an explicit, documented root-level build product. Prefer `apps/*/dist` and `packages/*/dist`.
- **Root `.tmp/`** is **disallowed** for script output. Use `.artifacts/tmp/` for repo-scoped scratch. TypeScript incremental caches may remain under `node_modules/.tmp` as configured in package `tsconfig` files (tool-internal).
- **`.turbo/`** at the root is the **default** Turborepo local cache (machine-oriented, disposable). To keep the root listing cleaner, set `TURBO_CACHE_DIR=.artifacts/cache/turbo` (see [`.env.example`](../.env.example) — Turborepo section).

## Shell governance reports

Historical JSON snapshots lived under `.artifacts/reports/shell-governance/`. The generator CLI was removed; if you reintroduce snapshots, restore a writer script and CI upload together.

## Allowed vs. not allowed at repo root

**Allowed (non-exhaustive):** workspace manifests, `apps/`, `packages/`, `scripts/`, `docs/`, `node_modules/`, `.artifacts/` (bucket only), standard tool dirs (e.g. `.github`, `.vscode` as configured).

**Not allowed without explicit review:** root `dist/`, root `reports/`, root `.tmp/`, ad hoc generated JSON trees, or unrelated export folders.

---

## Migration checklist (historical)

Use this when moving machines or old branches:

- [ ] **Shell governance JSON:** legacy `scripts/check-shell-governance-report.ts` was removed; reintroduce writers here only if you add a replacement script.
- [ ] **CI:** shell governance JSON upload removed from `.github/workflows/ci.yml` (no generator script).
- [x] **Git:** `.gitignore` ignores generated JSON under `.artifacts/` and turbo cache under `.artifacts/cache/turbo/`, not legacy `reports/`.
- [x] **Drift scans:** removed with `tools/ui-drift`; keep `.artifacts/` out of ad-hoc file walkers when adding new tooling.
- [x] **Docs:** `docs/SHELL_ARCHITECTURE.md` references artifact layout when snapshots exist.

**Manual cleanup:** If you still have an old `reports/` directory at the repo root from before this policy, delete it after verifying CI and local scripts use `.artifacts/` only.

---

## Related

- [Project configuration](./PROJECT_CONFIGURATION.md) — tooling and workspace conventions.
- [Shell architecture](./SHELL_ARCHITECTURE.md) — shell governance outputs and snapshots.
