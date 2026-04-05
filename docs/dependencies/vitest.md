# Vitest guide (Afenda)

This document describes how **`apps/web`** runs **[Vitest](https://vitest.dev/)** **4.x** with **Vite 8** config reuse (`defineConfig` **`test`** block), **`jsdom`**, **`@vitest/coverage-v8`**, and **React Testing Library**. Detailed RTL + workflow guidance lives in **[Testing](../TESTING.md)**.

**Status:** **Adopted** in **`apps/web`** — **`vitest`** and **`@vitest/coverage-v8`** **`^4.1.2`** in [`apps/web/package.json`](../../apps/web/package.json). The **`test`** block is in [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) with **`/// <reference types="vitest/config" />`** for typed options.

**Official documentation:**

- [Vitest guide](https://vitest.dev/guide/) · [Why Vitest](https://vitest.dev/guide/why)
- [Config reference](https://vitest.dev/config/) · [Coverage config](https://vitest.dev/config/coverage)
- [Coverage guide](https://vitest.dev/guide/coverage) — **`v8`** vs **istanbul**, **`@vitest/coverage-v8`**, reporters, include/exclude
- [Test environments](https://vitest.dev/guide/environment) — **`jsdom`**, **`happy-dom`**, **`node`**, **`@vitest-environment`** per file
- [Mocking](https://vitest.dev/guide/mocking) · [`vi` API](https://vitest.dev/api/vi)
- [Browser mode](https://vitest.dev/guide/browser/) — optional Playwright/WebdriverIO (not the default here)
- [Projects](https://vitest.dev/guide/projects) — **`defineProject`**, **`mergeConfig`** when splitting configs
- [CLI](https://vitest.dev/guide/cli) · [Profiling](https://vitest.dev/guide/profiling-test-performance)
- [Vitest on GitHub](https://github.com/vitest-dev/vitest) · [`@vitest/coverage-v8`](https://github.com/vitest-dev/vitest/tree/main/packages/coverage-v8)

---

## Stack (`apps/web`)

| Package | Role |
| --- | --- |
| **`vitest`** | Test runner (reuses Vite resolve, plugins, **`loadEnv`**) |
| **`@vitest/coverage-v8`** | **v8** coverage (matches **`coverage.provider: 'v8'`**) |
| **`jsdom`** | DOM APIs for component tests |
| **`@testing-library/react`**, **`@testing-library/jest-dom`**, **`@testing-library/user-event`** | RTL — see [Testing](../TESTING.md) |

---

## Commands

**Package:**

```bash
pnpm --filter @afenda/web test            # watch
pnpm --filter @afenda/web test:run        # CI (single run)
pnpm --filter @afenda/web test:coverage   # run + coverage
```

**Monorepo root** (via **Turborepo** — [`turbo.json`](../../turbo.json) sets **`passThroughEnv`: [`VITEST_*`]** on **`test` / `test:run` / `test:coverage`**):

```bash
pnpm test
pnpm test:run
pnpm test:coverage
```

See [Turborepo](./turborepo.md).

---

## How we use Vitest

| Topic | Convention |
| --- | --- |
| **Config** | [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) → **`test`**: **`globals: true`**, **`environment: 'jsdom'`**, **`setupFiles`**, **`include`**, **`coverage`** (**`provider: 'v8'`**, reporters, **`exclude`**) |
| **Setup** | Workspace: [`packages/testing/src/vitest/setup.ts`](../../packages/testing/src/vitest/setup.ts), consumed as **`@afenda/testing/vitest/setup`** via **`apps/web/vite.config.ts`** **`test.setupFiles`** (no app-local **`vitest.setup.ts`**). |
| **Globals** | **`globals: true`** — **`describe` / `it` / `expect`** without imports; **`vi`** still used for mocks ([globals](https://vitest.dev/config/globals)) |
| **Mocking** | **`vi.mock`** (hoisted), **`vi.fn`**, **`vi.spyOn`** — [Mocking](https://vitest.dev/guide/mocking); optional [MSW](./msw.md) for HTTP |
| **ESLint** | Test globals / patterns — [ESLint](./eslint.md) |

---

## Red flags

- **E2E** flows that belong in **Playwright** / **Cypress**, not **jsdom** Vitest.
- **CI** using only watch mode — use **`test:run`** / root **`pnpm test:run`**.
- **Coverage** without **`@vitest/coverage-v8`** aligned to **`vitest`** major/minor — install peer or let the CLI prompt ([Coverage](https://vitest.dev/guide/coverage)).

---

## Deeper reference

- [Testing](../TESTING.md) — authoritative Afenda testing doc.
- [Vite](./vite.md) — shared **`defineConfig`**, env, aliases.

---

## Related documentation

- [Testing](../TESTING.md)
- [Vite](./vite.md)
- [Turborepo](./turborepo.md)
- [ESLint](./eslint.md)
- [TypeScript](./typescript.md)
- [MSW](./msw.md)

**External:** [vitest.dev](https://vitest.dev/) · [Vitest GitHub](https://github.com/vitest-dev/vitest)

**Context7 library IDs (doc refresh):** `/vitest-dev/vitest` · `/websites/vitest_dev`
