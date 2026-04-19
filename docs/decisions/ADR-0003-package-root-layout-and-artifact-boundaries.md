# ADR-0003: Package root layout and artifact boundaries

- **Status:** Accepted
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01

## Context

Monorepo packages accumulate **three different kinds of “stuff” at the same directory level**:

1. **Product code** (what you ship mentally: `src/`, app modules).
2. **Deploy / build contract** (what hosts consume: e.g. Vite `dist/`, not the same as debug junk).
3. **Noise** (reports, caches, coverage, E2E artifacts, temp files).

When those are mixed at the package root, the tree feels chaotic (“rubbish bin”), reviews slow down, and newcomers cannot tell what is safe to delete.

## Decision

### 1. Four boundaries (mental model)

| Boundary                    | Meaning                               | Typical location                                                                                 |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Product**                 | Application or library source         | `src/`, sometimes `public/` (static assets for apps)                                             |
| **Build output (contract)** | What deployment or consumers expect   | e.g. **`dist/`** with Vite `outDir` — **do not treat as disposable noise**                       |
| **Artifacts (noise)**       | Regenerable debug/test/report output  | Single bucket, e.g. **`.artifacts/`**, fully gitignored                                          |
| **Configuration**           | Tool entrypoints + optional fragments | Root configs (`vite.config.ts`, …) + optional **`config/`** for splits (e.g. `config/tsconfig/`) |

### 2. Keep `dist/` at the package root (for Vite apps)

- **`dist/`** is the **deploy contract** (e.g. Vercel `outputDirectory`). It is **gitignored** but **not** “trash”; it is the **build result**.
- **Do not** move production `dist/` under `.artifacts/` — that confuses deploy paths and documentation.

### 3. Centralize noise under **`.artifacts/`**

Everything **non-deploy**, **regenerable**, and **noisy** should live under one tree, for example:

- **Vitest coverage** → e.g. `.artifacts/vitest/coverage`
- **Playwright** HTML report + test results / traces → e.g. `.artifacts/playwright/report`, `.artifacts/playwright/results`
- **ESLint cache** → e.g. `.artifacts/eslint` (directory for `--cache-location`)
- **Bundle analyze / temp** → e.g. `.artifacts/temp/`

**Gitignore** the whole tree: `apps/<app>/.artifacts/` (or equivalent per package).

### 4. Shallow root + explicit allowlist

- Only **tool entry** configs stay at the package root (`package.json`, `vite.config.ts`, `playwright.config.ts`, `tsconfig.json` solution file, …).
- **Secondary** TypeScript project files may live under **`config/tsconfig/`** (or similar) and are referenced from the root solution `tsconfig.json`.
- Enforce with a **small Node script** that lists allowed top-level **directory names** and **file names** (see reference implementation below).

### 5. Environment files

- Prefer **one repo-root `.env`** for shared secrets and wire tools with `envDir` (or equivalent).
- **Do not** allow ad hoc `.env.local` at the app package root if policy is “root only” — the allowlist should only permit `.env.example` (template) at app level when needed.

### 6. CI gate

- Run the layout verifier in CI **after** `pnpm install` so **every PR** fails if the package root drifts.

## Alternatives considered

### A) Put everything under `src/` (including reports)

**Rejected.** Reports and caches are not product modules; putting them under `src/` is a category error and confuses bundlers and globs.

### B) Move `dist/` under `.artifacts/dist`

**Rejected** for Vite web apps: deploy and Turbo/docs already assume `dist/` at `apps/web/dist` unless all consumers are updated.

## Consequences

### Positive

- Clear distinction between **deploy output**, **product**, and **junk**.
- One place to delete local noise: remove `.artifacts/` (and keep `clean` scripts in sync).
- CI can enforce structure without debating style in review.

### Negative

- Each package that adopts this needs a **one-time** path and **tooling** update (Vitest, Playwright, ESLint cache paths).
- Documentation and **host config** must stay aligned when `outDir` or app roots change (rare if `dist/` stays).

## Reference implementation (`@afenda/web`)

| Piece               | Location                                                     |
| ------------------- | ------------------------------------------------------------ |
| Layout verifier     | `apps/web/scripts/verify-root-layout.mjs`                    |
| npm script          | `pnpm --filter @afenda/web run verify:layout`                |
| CI step             | `.github/workflows/ci.yml` — “Validate apps/web root layout” |
| TS config fragments | `apps/web/config/tsconfig/app.json`, `node.json`             |
| Root solution       | `apps/web/tsconfig.json`                                     |

## Playbook: reuse for another package (e.g. `apps/api`, `packages/foo`)

Use this checklist when **cleaning another directory** the same way:

1. **Classify** current top-level entries into: product, deploy output, config, noise, dependencies (`node_modules`), tool caches (`.turbo`, …).
2. **Choose** a single noise bucket (`.artifacts/` or name aligned with repo conventions).
3. **Point each tool** at that bucket:
   - Coverage output directory
   - Test runner / E2E report directories
   - Linters’ `--cache-location`
4. **Keep** deploy output where **hosts and turbo** already expect it unless you are ready to change **all** consumers.
5. **Move** optional config fragments into **`config/`** and leave **thin** entry configs at root.
6. **Copy** the pattern of `verify-root-layout.mjs`: allowlist **dirs + files**, fail with a clear message.
7. **Add** `verify:layout` (or `verify:<package>-layout`) to root `package.json` if needed.
8. **Wire CI** with `pnpm --filter <pkg> run verify:layout` (or monorepo equivalent).
9. **Update** `.gitignore` for the new `.artifacts/` path.
10. **Update** `turbo.json` `outputs` if coverage or build paths moved.
11. **Delete** legacy root folders (`coverage/`, `playwright-report/`, old `.eslintcache`, …) once tools no longer write there.

## Trigger metrics (revisit)

- New classes of generated files appear at package root **again** (sign the allowlist is incomplete or bypassed).
- A new deploy target requires a **different** output path — revisit ADR and update **one** canonical doc.

## Related

- `docs/REPO_ARTIFACT_POLICY.md` — repo-wide artifact thinking (shell governance, etc.); this ADR is **package-root layout** for app packages.
- `docs/REPO_ARTIFACT_POLICY.md` — cross-reference only; do not duplicate host-specific `dist/` rules here.
