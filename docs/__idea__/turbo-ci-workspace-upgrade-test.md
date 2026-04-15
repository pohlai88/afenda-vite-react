# Turbo / CI: `test:run` graph check (workspace upgrade)

Use this as a **manual smoke** when upgrading **Turborepo**, changing **root `turbo.json`**, or touching **Vitest** / package `test:run` scripts—so `@afenda/design-system` (including **theme contract / `validate-tokens`**-style tests) still participates in **`turbo run test:run`** the same way CI does.

## Why

- Root CI runs `pnpm exec turbo run … test:run` (see `.github/workflows/ci.yml`).
- Design tokens and theme drift governance run via **`@afenda/design-system`**’s **`test:run`** (`vitest run --configLoader native`), which must remain a **first-class Turbo task** with correct **`^transit`** dependencies and **`VITEST_*`** passthrough.

## What to run

From the **repository root**:

```bash
pnpm exec turbo run test:run --filter=@afenda/design-system --dry-run
```

## What “healthy” looks like

- **Packages in scope** includes `@afenda/design-system`.
- **Tasks to run** lists **`@afenda/design-system#test:run`** with command:

  `vitest run --configLoader native`

- **Dependencies** include upstream **`transit`** tasks (e.g. `@afenda/tsconfig#transit`, `@afenda/vitest-config#transit`) as required by `turbo.json` **`test:run`** → `dependsOn: ["^transit"]`.
- **Passed through env** includes **`VITEST_*`** (from global `test:run` in [`turbo.json`](../../turbo.json)).

If any of these disappear after an upgrade, fix **`turbo.json`** / package **`scripts`** / **workspace dependencies** before merging.

## Related repo facts

| Item | Location |
| --- | --- |
| Global `test:run` task | [`turbo.json`](../../turbo.json) |
| Shared Vitest defaults | [`packages/vitest-config`](../dependencies/turborepo.md) (see [`packages/vitest-config/README.md`](../../packages/vitest-config/README.md)) |
| Design-system Vitest + coverage | [`packages/design-system/vitest.config.ts`](../../packages/design-system/vitest.config.ts) |
| Theme contract tests | [`packages/design-system/design-architecture/__tests__/theme-contract-drift.test.ts`](../../packages/design-system/design-architecture/__tests__/theme-contract-drift.test.ts) |
| Token check script (subset / same package) | `pnpm run validate-tokens` in `@afenda/design-system` |

## Optional full CI parity (local)

To approximate CI without filtering:

```bash
pnpm exec turbo run test:run --dry-run
```

Review the task list for packages you care about; scope is larger and slower when executed without `--dry-run`.
