# Writing tests in the Afenda monorepo

This file replaces upstream Vitest-internal test-authoring guidance. For Afenda product tests, follow **[`TESTING.md`](./TESTING.md)** (or the stub at **[`docs/TESTING.md`](../../docs/TESTING.md)**).

## Placement

- **`apps/web`:** tests under **`src/**/__test__/`** (singular) next to the feature.
- **Workspace packages:** often **`__tests__/`** (plural); some packages narrow **`include`** in their own `vitest.config.ts` (see **`TESTING.md`**).
- **`getAfendaVitestTestOptions()`** includes both `src/**/__test__/**` and `**/__tests__/**` patterns by default.

## Stack

- **Vitest** + **Vite** config reuse — defaults from **`@afenda/vitest-config`**.
- **React Testing Library** with **`userEvent`**; query priority **`getByRole`** → **`getByLabelText`** → **`getByText`** → **`getByTestId`**.
- **jest-dom** matchers via **`@afenda/vitest-config/vitest/setup`**.

## When tests fail

See **[`AGENTS.md`](./AGENTS.md)** — prefer fixing **application code** when the test reflects correct behavior.

## Official Vitest docs & optional upstream mirror

Normative doc: **[`TESTING.md`](./TESTING.md)** (section **Official Vitest terminology & upstream mirror**).

- **[Projects](https://vitest.dev/guide/projects.html):** use **`test.projects`** for multi-root setups.
- **[Migration](https://vitest.dev/guide/migration.html):** Vitest 4 worker/pool option shape vs older **`poolOptions`** snippets.
- Optional local clone: **[`_vitest-github/`](./_vitest-github/)** — same layout as [vitest-dev/vitest](https://github.com/vitest-dev/vitest); version is pinned in **`_vitest-github/package.json`**. Skim **`test/workspaces/`** and **`test/workspaces-browser/`** for advanced patterns; not part of product CI.
