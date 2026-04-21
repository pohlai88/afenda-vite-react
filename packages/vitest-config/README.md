# `@afenda/vitest-config`

Central **Vitest defaults** for the Afenda monorepo: a small factory API (`getAfendaVitestTestOptions`, `getAfendaVitestNodeTestOptions`), shared **jest-dom** setup, coverage presets, and env-driven overrides. Apps and packages keep their own `vite.config.ts` / `vitest.config.ts` and **merge** these defaults instead of copying `include` patterns, pools, or coverage floors.

**Normative workspace detail** (patterns, commands, i18n + test interplay): [`TESTING.md`](./TESTING.md) and repo [`docs/TESTING.md`](../../docs/TESTING.md).

## Usage

### Web app (Vite + jsdom)

[`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) sets the Vitest block from the shared factory:

```ts
import { getAfendaVitestTestOptions } from "@afenda/vitest-config/vitest/defaults"

export default defineConfig({
  // ...
  test: getAfendaVitestTestOptions(),
})
```

Default behavior: **`environment: 'jsdom'`**, **jest-dom** loaded from [`src/vitest/setup.ts`](./src/vitest/setup.ts), `globals: true`, shared `include` / coverage / pool / `mockReset`.

### Pure Node packages

Use **`getAfendaVitestNodeTestOptions()`** (same factory with `environment: 'node'` and **no** jest-dom setup), or call `getAfendaVitestTestOptions({ environment: 'node', setupFiles: [] })`.

Example: [`packages/design-system/vitest.config.ts`](../../packages/design-system/vitest.config.ts) spreads node defaults then overrides `name`, `include`, and **stricter** coverage for that package.

### This package’s own tests

[`vitest.config.ts`](./vitest.config.ts) uses `getAfendaVitestTestOptions({ environment: 'node', setupFiles: [] })` and sets `name: '@afenda/vitest-config'` for clear Vitest project labeling.

### Exports

| Export                                  | Role                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@afenda/vitest-config/vitest/defaults` | `getAfendaVitestTestOptions`, `getAfendaVitestNodeTestOptions`, `afendaVitestSetupFile`, `COVERAGE_PRESETS`, types |
| `@afenda/vitest-config/vitest/setup`    | Side effect: registers `@testing-library/jest-dom/vitest` (imported via `setupFiles` for jsdom)                    |

## What the factory configures

| Area              | Notes                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`globals`**     | `true` — `describe` / `expect` / `vi` without per-file imports (Vitest globals)                                                                                                                                 |
| **`environment`** | Default `jsdom`; override with `options.environment` or use `getAfendaVitestNodeTestOptions()`                                                                                                                  |
| **`include`**     | `src/**/__test__/**/*.{test,spec}.{ts,tsx}` and `**/__tests__/**/*.{test,spec}.{ts,tsx}` — apps may use `__test__/` (singular) under `src/`; packages often use `__tests__/` (see [`TESTING.md`](./TESTING.md)) |
| **`setupFiles`**  | Default: shared [`setup.ts`](./src/vitest/setup.ts) for non-node; for `node`, default `[]`. Pass `setupFiles: []` explicitly to skip **all** setup including jest-dom                                           |
| **`pool`**        | Default **`threads`** when `VITEST_POOL` is unset (Vitest upstream default is **`forks`** — see intentional choices below)                                                                                      |
| **`coverage`**    | Provider **`v8`**, reporters `text` / `json` / `html`, thresholds from **`COVERAGE_PRESETS`** or env (see below)                                                                                                |
| **`mockReset`**   | `true` — Jest-like mock semantics for shared utilities                                                                                                                                                          |

**Peer dependencies:** `vitest`, `vite`, `@testing-library/jest-dom` (see [`package.json`](./package.json)).

## Environment overrides

Read in [`src/vitest/defaults.ts`](./src/vitest/defaults.ts):

| Variable                                                          | Effect                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `VITEST_POOL`                                                     | `forks` \| `threads` \| `vmThreads` — invalid values ignored |
| `VITEST_COVERAGE_STRICT=1`                                        | Use **`COVERAGE_PRESETS.strict`** instead of `default`       |
| `VITEST_COVERAGE_LINES` / `STATEMENTS` / `FUNCTIONS` / `BRANCHES` | Numeric overrides for thresholds                             |

## Intentional choices

- **Default pool `threads` (not `forks`)** — Faster iteration on typical TS/RTL tests; use **`VITEST_POOL=forks`** when you need stronger isolation (native addons, odd worker behavior). See [Vitest performance](https://vitest.dev/guide/improving-performance.html).
- **Coverage floors are modest by default** — `COVERAGE_PRESETS.default` keeps CI green while the suite grows; **`VITEST_COVERAGE_STRICT=1`** or per-package overrides (e.g. design-system) raise the bar where policy requires it.
- **`@typescript-eslint`-style duplication avoided** — N/A here; test config stays in one factory so apps do not fork `include` / pool / coverage logic.
- **Legacy upstream reference** — Vitest source references now live under [`.legacy/vitest-github-reference-2026-04-22`](../../.legacy/vitest-github-reference-2026-04-22) so the active package root stays workspace-owned.

## Official references

- [Vitest — Config](https://vitest.dev/config/)
- [Vitest — Projects](https://vitest.dev/guide/projects.html)
- [Vitest — Migration (v4)](https://vitest.dev/guide/migration.html)
- [Testing Library — jest-dom](https://github.com/testing-library/jest-dom)

---

## Follow-up suggestions (with reasoning)

### 1. Opt in to Vitest **projects** (`defineProject` / multi-root)

**Reasoning:** Today most packages use a **single** merged `test` block. Splitting UI vs Node vs future browser projects matches [Vitest projects](https://vitest.dev/guide/projects.html) and clarifies isolation, but adds config surface and CI time.

**Do when:** You need a dedicated **browser** project, a separate **integration** suite, or different pools/reporters per slice without one giant `vite.config.ts`.

### 2. Browser mode or Playwright-powered component tests

**Reasoning:** jsdom + RTL covers most unit cases; real layout, focus, and browser APIs may need [Vitest browser mode](https://vitest.dev/guide/browser/) or E2E (e.g. Playwright) — different deps and CI.

**Do when:** Product requirements outgrow jsdom (e.g. cross-browser quirks, full URL routing).

### 3. MSW (or similar) as a shared testing layer

**Reasoning:** Centralized HTTP mocking for fixtures reduces duplication across feature tests; it belongs in a documented **test support** module and optional `setupFiles`, not in every app’s ad-hoc mocks.

**Do when:** API-shaped tests multiply and you want stable contracts and less `vi.mock` sprawl.

### 4. Raise default coverage thresholds gradually

**Reasoning:** `COVERAGE_PRESETS.default` is intentionally low so new packages don’t fail CI immediately. Raising the global default or standardizing on `VITEST_COVERAGE_STRICT=1` in CI improves safety net quality at the cost of short-term fixes.

**Do when:** Critical paths and packages have meaningful tests and you agree on a phased rollout (or per-package floors like design-system).

### 5. Document and enforce `VITEST_POOL` in CI

**Reasoning:** Local dev may prefer `threads`; CI might use `forks` for reproducibility. Making the choice explicit avoids “works on my machine” worker issues.

**Do when:** CI flakes or native-module tests appear tied to worker isolation.

### 6. Align `vitest.config.ts` naming and `test.name` across packages

**Reasoning:** Vitest project labels help when running multiple projects; naming is inconsistent today only where packages set `name` themselves.

**Do when:** You adopt multi-project runs or aggregate reports and need stable identifiers in dashboards.
