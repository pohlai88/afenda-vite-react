---
name: vitest
description: Vitest with Vite in the Afenda monorepo — shared defaults from @afenda/vitest-config, RTL patterns, and troubleshooting. Use when configuring Vitest, writing or debugging unit tests, coverage, or mocks.
---

## Scope

This workspace uses **Vitest 4** with **Vite 8**. Shared configuration lives in **`packages/vitest-config`** (`@afenda/vitest-config`), not in ad hoc app shims.

## Authoritative docs

1. **[`docs/TESTING.md`](docs/TESTING.md)** — file layout (`__test__/`), RTL, MSW, env overrides, coverage presets.
2. **[`packages/vitest-config/AGENTS.md`](packages/vitest-config/AGENTS.md)** — consumption patterns and failure triage (fix product code first).
3. **[`docs/VITE_ENTERPRISE_WORKSPACE.md`](docs/VITE_ENTERPRISE_WORKSPACE.md)** — Vitest reuses Vite; DevTools must stay off under `VITEST` (see `apps/web/vite.config.ts`).

## Entry points

- **`getAfendaVitestTestOptions()`** from `@afenda/vitest-config/vitest/defaults` — use in `vite.config.ts` `test` block.
- **`@afenda/vitest-config/vitest/setup`** — jest-dom matchers (pulled in by the factory for jsdom).

## Official Vitest references

- [Vitest guide](https://vitest.dev/guide/) · [Config](https://vitest.dev/config/)
- [Why Vitest](https://vitest.dev/guide/why) · [Mocking](https://vitest.dev/guide/mocking)

For generic Vitest API details beyond Afenda conventions, prefer upstream docs above.
