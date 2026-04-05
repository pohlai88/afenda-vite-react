# @afenda/testing — workspace testing strategy

This package is the **single workspace home** for **cross-cutting test infrastructure**. It is not “one Vitest file”; it is where **unit (Vitest)**, **E2E (e.g. Playwright)**, **Storybook / UI**, and **shared matchers or fixtures** converge as the monorepo grows.

## What lives here

| Layer | Location | Notes |
| --- | --- | --- |
| **Vitest (global setup)** | [`src/vitest/setup.ts`](./src/vitest/setup.ts) | Imported by apps via `@afenda/testing/vitest/setup` |
| **E2E (future)** | [`src/playwright/`](./src/playwright/README.md) | Shared Playwright fixtures / config fragments |
| **Storybook / UI (future)** | [`src/storybook/`](./src/storybook/README.md) | Portable stories, shared test decorators |

## What stays in apps

- **Test execution** (`vitest`, `playwright test`, etc.) and **`vite.config.ts` / `test` blocks** stay in the app that runs them.
- **Feature and page tests** stay next to features or under `apps/<name>/`.
- Apps should point `test.setupFiles` directly to `@afenda/testing/vitest/setup`.

## Consumers

- **`apps/web`** — `vite.config.ts` `test.setupFiles` points to `@afenda/testing/vitest/setup`.

## Documentation

Normative testing policy and workflows: [`docs/TESTING.md`](../../docs/TESTING.md).
