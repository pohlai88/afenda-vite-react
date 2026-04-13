# Vitest config package — AI notes (`@afenda/vitest-config`)

This package is the **single source of truth** for shared **Vitest** defaults in the Afenda monorepo: `getAfendaVitestTestOptions()`, jest-dom **setup**, coverage presets, and env-driven overrides.

## Where to look

| Topic | Location |
| --- | --- |
| Normative human doc | [`TESTING.md`](./TESTING.md) (see also [`docs/TESTING.md`](../../docs/TESTING.md)) |
| Defaults factory | [`src/vitest/defaults.ts`](./src/vitest/defaults.ts) |
| jest-dom + future hooks | [`src/vitest/setup.ts`](./src/vitest/setup.ts) |
| This package’s own Vitest project | [`vitest.config.ts`](./vitest.config.ts) |
| Vite + Vitest enterprise notes | [`docs/VITE_ENTERPRISE_WORKSPACE.md`](../../docs/VITE_ENTERPRISE_WORKSPACE.md) |

## Consumption

- **`apps/web`**: `vite.config.ts` imports `getAfendaVitestTestOptions()` from **`@afenda/vitest-config/vitest/defaults`** and sets `test: getAfendaVitestTestOptions()`.
- **Pure Node packages**: use `getAfendaVitestNodeTestOptions()` or `getAfendaVitestTestOptions({ environment: 'node', setupFiles: [] })`.

Do **not** duplicate include patterns, coverage floors, or pool logic in apps—extend the factory with options instead.

## Failure triage (fix product first)

When a test fails:

1. **Confirm intent** — Does the test describe real product or API behavior (user-visible, contract, regression)?
2. If **yes**, treat a failure as a **bug or gap in application code** unless the environment is clearly wrong (missing env, flaky network). **Fix the code**, then re-run tests.
3. Change the test only if the assertion was **wrong**, **obsolete**, or **environmentally invalid**—and note **why** in the commit or PR.

Never weaken assertions or delete tests solely to make CI green.

## Optional upstream mirror

A local clone of [vitest-dev/vitest](https://github.com/vitest-dev/vitest) may exist under `vitest-github/` for reference; it is **gitignored** and not part of the product build.

## Related skills (repo)

- [`.agents/skills/vite-industry-quality/SKILL.md`](../../.agents/skills/vite-industry-quality/SKILL.md) — Vite hardening
- [`.agents/skills/vercel-react-best-practices/SKILL.md`](../../.agents/skills/vercel-react-best-practices/SKILL.md) — React performance
- [`.agents/skills/vitest/SKILL.md`](../../.agents/skills/vitest/SKILL.md) — Vitest usage (workspace)
