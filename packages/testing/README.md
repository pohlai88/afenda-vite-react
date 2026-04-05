# @afenda/testing — workspace testing strategy

This package is the **single workspace home** for **cross-cutting test infrastructure**. It is not "one Vitest file"; it is where **unit (Vitest)**, **E2E (e.g. Playwright)**, **Storybook / UI**, and **shared matchers or fixtures** converge as the monorepo grows.

## What lives here

| Layer                        | Location                                             | Notes                                                                                 |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Vitest (global setup)**    | [`src/vitest/setup.ts`](./src/vitest/setup.ts)       | Imported by apps via `@afenda/testing/vitest/setup`                                   |
| **Vitest (shared defaults)** | [`src/vitest/defaults.ts`](./src/vitest/defaults.ts) | Factory functions for the `test` block (include patterns, coverage, pool, thresholds) |
| **E2E (future)**             | [`src/playwright/`](./src/playwright/README.md)      | Shared Playwright fixtures / config fragments                                         |
| **Storybook / UI (future)**  | [`src/storybook/`](./src/storybook/README.md)        | Portable stories, shared test decorators                                              |

## What stays in apps

- **Test execution** (`vitest`, `playwright test`, etc.) and **`vite.config.ts` / `test` blocks** stay in the app that runs them.
- **Feature and page tests** stay under `__test__/` directories inside each source folder (e.g. `src/features/auth/__test__/`).
- Apps should point `test.setupFiles` to `@afenda/testing/vitest/setup` and spread `getAfendaVitestTestOptions()` for shared defaults.

## Test file convention

Tests **must** live under `__test__/` directories — never colocated next to source files:

```
src/
  features/
    auth/
      components/
        LoginView.tsx
      __test__/
        login-view.test.tsx
  share/
    i18n/
      config.ts
      format.ts
      __test__/
        config.test.ts
        format.test.ts
```

The include pattern is: `src/**/__test__/**/*.{test,spec}.{ts,tsx}`

## Shared defaults usage

```ts
// apps/web/vite.config.ts
/// <reference types="vitest/config" />
import { getAfendaVitestTestOptions } from '@afenda/testing/vitest/defaults'
import { defineConfig } from 'vite'

export default defineConfig({
  test: getAfendaVitestTestOptions(),
  // ... other Vite config
})
```

For non-DOM packages (pure Node):

```ts
import { getAfendaVitestNodeTestOptions } from '@afenda/testing/vitest/defaults'
```

## Runtime configuration

The defaults factory honors environment variables so CI and local dev can diverge without config file changes:

| Variable                 | Effect                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `VITEST_POOL`            | Override pool: `forks`, `threads`, or `vmThreads`                                             |
| `VITEST_COVERAGE_STRICT` | Set to `1` to apply strict (higher) coverage thresholds                                       |
| `VITEST_*` (native)      | Vitest passes through `VITEST_MIN_THREADS`, `VITEST_MAX_THREADS`, `VITEST_POOL_TIMEOUT`, etc. |

## Coverage thresholds

Two tiers — **default** (low floor for early-stage codebase) and **strict** (`VITEST_COVERAGE_STRICT=1` for CI merge gates):

| Metric     | Default | Strict |
| ---------- | ------- | ------ |
| Lines      | 5%      | 80%    |
| Statements | 5%      | 80%    |
| Functions  | 5%      | 70%    |
| Branches   | 3%      | 50%    |

Ratchet these values **manually** upward in `src/vitest/defaults.ts` as test coverage grows across the monorepo.

## Consumers

- **`apps/web`** — `vite.config.ts` spreads `getAfendaVitestTestOptions()`.
- **`packages/testing`** itself — uses `vitest.config.ts` with `getAfendaVitestNodeTestOptions()`.

## Documentation

Normative testing policy and workflows: [`docs/TESTING.md`](../../docs/TESTING.md).
