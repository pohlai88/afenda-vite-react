---
title: Vite enterprise practices (workspace)
description: Normative Vite baseline for apps/web (pinned Vite 7.x, evergreen browsers), wiring, and periodic review checklist for this monorepo.
order: 125
---

# Vite enterprise practices (workspace)

This document is the **repo-level checklist** for **Vite** in Afenda: good practice, **enterprise-quality** expectations, and **how this workspace implements them**. It does not replace upstream docs; it maps them to **`apps/web`** and **Turborepo**.

**When to re-read:** before major Vite upgrades (including future Vite 8 / Rolldown), when changing `vite.config.ts`, when CI build time or chunk sizes regress, or when onboarding senior frontend owners.

**Canonical detail** for package versions and plugin list: [`docs/dependencies/vite.md`](./dependencies/vite.md).

**Official sources (bookmark):**

- [Vite guide](https://vite.dev/guide/) · [Config](https://vite.dev/config/) · [Build](https://vite.dev/guide/build) · [Env and modes](https://vite.dev/guide/env-and-mode) · [Performance](https://vite.dev/guide/performance) · [CLI](https://vite.dev/guide/cli)
- [Official plugins](https://vite.dev/plugins/)
- [Migration (Vite 8 / Rolldown)](https://vite.dev/guide/migration)
- [Vite DevTools](https://devtools.vite.dev) · [repository](https://github.com/vitejs/devtools)

---

## 1. Role of Vite in this monorepo

| Concern                  | Where it lives                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **ERP web client (SPA)** | [`apps/web`](../apps/web/) — React 19, React Router, TanStack Query, etc.                                   |
| **Vite config**          | [`apps/web/vite.config.ts`](../apps/web/vite.config.ts)                                                     |
| **HTML entry**           | [`apps/web/index.html`](../apps/web/index.html) → `src/main.tsx`                                            |
| **Orchestration**        | Root [`turbo.json`](../turbo.json), [`pnpm-workspace.yaml`](../pnpm-workspace.yaml)                         |
| **CI gate**              | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — format, lint, typecheck, tests, build           |
| **TypeScript presets**   | [`packages/typescript-config/`](../packages/typescript-config/) (`vite/client` types for `import.meta.env`) |

Vite is **framework-agnostic** at core; this repo uses the **official React plugin** and ships a **static** client build (see [Deployment](./DEPLOYMENT.md)).

---

## 2. Enterprise-quality baseline (aligned with Vite guidance)

These are **non-negotiable** for a production SPA in this repo:

1. **Types outside the bundler** — `tsc -b` is part of `apps/web` `build` and `typecheck`; never rely on Vite alone for type safety ([Testing](./TESTING.md), [TypeScript dependency guide](./dependencies/typescript.md)).
2. **Public env discipline** — only `VITE_*` reaches the browser; no secrets in client env ([Env and modes](https://vite.dev/guide/env-and-mode)).
3. **Config-time env** — values that affect `vite.config.ts` (ports, `base`, flags) use `loadEnv(mode, process.cwd(), …)` because `.env*` is not automatically on `process.env` during config evaluation.
4. **Explicit `base`** — driven by `VITE_BASE_URL` where non-root hosting applies ([Deployment](./DEPLOYMENT.md)).
5. **Stale chunk / dynamic import failures** — listen for `vite:preloadError` and offer user-visible recovery ([load error handling](https://vite.dev/guide/build#load-error-handling)); implemented in [`apps/web/src/vite-preload-recovery.ts`](../apps/web/src/vite-preload-recovery.ts), imported from `main.tsx`.
6. **Plugin cost awareness** — watch `[PLUGIN_TIMINGS]` and use `vite --debug plugin-transform` / `vite --profile` when transforms regress ([Performance guide](https://vite.dev/guide/performance)).
7. **Tests reuse Vite** — Vitest uses the same config surface; do not load dev-only tooling in Vitest when it keeps Node alive (see §4).

**Browser baseline:** the web client targets **evergreen** browsers (native ESM + `import.meta`). **`@vitejs/plugin-legacy`** is **not** used; add it only if the product explicitly supports older engines ([plugin-legacy](https://vite.dev/plugins/#vitejs-plugin-legacy)).

**Product UI performance** (lists, memoization, routing) is covered in [Performance](./PERFORMANCE.md); this doc focuses on **tooling and build pipeline**.

---

## 3. What this workspace implements (concise map)

| Topic                      | Implementation                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React + Fast Refresh**   | `@vitejs/plugin-react`, automatic JSX runtime                                                                                                                                                                        |
| **Tailwind v4**            | `@tailwindcss/vite` (before React in plugin order per internal guide)                                                                                                                                                |
| **React Compiler**         | `babel-plugin-react-compiler` via `react({ babel: { plugins: [...] } })` in `@vitejs/plugin-react` (build cost visible in timings)                                                                                   |
| **Path alias**             | `@` → `apps/web/src`                                                                                                                                                                                                 |
| **Dev server**             | `server.proxy` for `/api`, optional HMR port, **`server.warmup`** for shell entry files                                                                                                                              |
| **Chunk strategy**         | `manualChunks`: `router`, merged React stack (`vendor-react`), optional `polyfills`, catch-all `vendor` (Radix in `vendor` to avoid Rollup circular chunk warnings)                                                  |
| **Bundle reports**         | `pnpm --filter @afenda/web build:analyze` — `rollup-plugin-visualizer` + `--mode analyze`                                                                                                                            |
| **Vitest UI**              | `pnpm test:ui` (root) / `pnpm --filter @afenda/web test:ui`                                                                                                                                                          |
| **Official Vite DevTools** | `@vitejs/devtools`: `DevTools()` in **dev serve only**, disabled when `process.env.VITEST === 'true'`; **Rolldown `devtools`** only in **`analyze`** mode so default production builds keep manual chunking behavior |

**Scripts (from `apps/web/package.json`):** `dev`, `build`, `build:analyze`, `preview`, `typecheck`, `test`, `test:ui`, `test:run`, `test:coverage`.

---

## 4. Vite DevTools and Vitest (important)

[Vite DevTools](https://github.com/vitejs/devtools) is **official** and valuable for **Rolldown-oriented** inspection, but:

- It is still **evolving**; treat release notes as mandatory on upgrade.
- Loading `DevTools()` under Vitest’s Vite server caused **hanging processes**; the workspace **guards** DevTools when `VITEST` is set.
- Enabling **`build.rolldownOptions.devtools`** on **every** production build **regressed chunk splitting** in this repo; it is scoped to **`analyze`** mode only. Revisit after Vite/Rolldown merges `rollupOptions` / `rolldownOptions` further.

---

## 5. CI and monorepo commands

From repo root (typical gates):

- `pnpm run check` — broad gate including lint, typecheck, tests, build (see root [`package.json`](../package.json)).
- `pnpm exec turbo run lint typecheck test:run build` — CI-shaped subset.

Keep **Turbo** `env` / `passThroughEnv` aware when adding `VITE_*` or Vitest env vars ([Turborepo dependency guide](./dependencies/turborepo.md)).

---

## 6. Red flags (stop and fix)

- Secrets or private keys in `VITE_*` or client bundles.
- Skipping **`pnpm typecheck`** because “the dev server compiles.”
- Adding heavy transform plugins without measuring **dev and CI** impact.
- Ignoring **`vite:preloadError`** for long-lived sessions after deploys.
- Turning on **Rolldown devtools** globally without verifying **output chunk graph**.

---

## 7. Related documentation

| Document                                                      | Purpose                                     |
| ------------------------------------------------------------- | ------------------------------------------- |
| [`docs/dependencies/vite.md`](./dependencies/vite.md)         | Package-level Vite guide and official links |
| [`docs/PERFORMANCE.md`](./PERFORMANCE.md)                     | UI and runtime performance                  |
| [`docs/TESTING.md`](./TESTING.md)                             | Vitest + RTL strategy                       |
| [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)                       | Static deploy, env, rewrites                |
| [`docs/PROJECT_CONFIGURATION.md`](./PROJECT_CONFIGURATION.md) | ESLint, Prettier, TS, Turbo                 |
| [`AGENTS.md`](../AGENTS.md)                                   | AI-oriented doc map and execution protocol  |

---

## 8. Maintenance

After editing this file, regenerate doc indexes if you want `docs/README.md` tables updated:

```bash
pnpm run script:generate-docs-readme
```

The generator reads **`scripts/afenda.config.json`** overrides for root doc titles and order.
