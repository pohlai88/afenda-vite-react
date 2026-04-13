# `@afenda/eslint-config`

Central **ESLint flat config** for the Afenda monorepo (pnpm + Turborepo, Vite, TypeScript, React, Vitest). Policy lives in this package; consumers resolve config from the **repository root** `eslint.config.js`, which should stay thin (call `createConfig` and add only Afenda-specific overrides).

## Usage

From the repo root:

```js
import { createConfig } from '@afenda/eslint-config'

const baseConfig = createConfig({ rootDir: import.meta.dirname })

export default [
  ...baseConfig,
  // Optional: repo-only overrides (e.g. import governance)
]
```

Workspace packages run `eslint .` from their directory; ESLint walks up and loads the root flat config.

## What this config includes

| Layer | Notes |
|--------|--------|
| **Ignores** | Build/output, caches, coverage, reference mirrors (`_eslint-github`, `_vitest-github`), `.legacy`, minified JS |
| **Linter options** | Warn on unused `eslint-disable` and inline config (keeps hygiene without failing CI on noise) |
| **Baseline** | `@eslint/js` recommended + `typescript-eslint` recommended (not type-checked by default) |
| **TypeScript** | `@typescript-eslint/no-unused-vars` with `_` ignore patterns; base `no-unused-vars` / `no-redeclare` disabled where they duplicate or conflict with TS |
| **Globals** | `globals`: browser for app + selected `packages/*` sources; Node for `scripts/**`, `*.config.*`, Vite/Vitest/ESLint configs |
| **React + Fast Refresh** | `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` (Vite preset) — **only `apps/web/**/*.{tsx,jsx}`** |
| **Vitest** | `@vitest/eslint-plugin` recommended + env globals; see rule notes below |
| **Prettier** | `eslint-config-prettier/flat` applied **last** |

## Intentional rule choices

- **`@typescript-eslint/no-redeclare` is off** — TypeScript already catches invalid redeclarations. Keeping the rule on produced false positives for common patterns such as `const Foo = …` with `type Foo = …` derived from the same name.
- **React Hooks / Fast Refresh are limited to `apps/web`** — Library packages (`packages/design-system`, `packages/shadcn-ui-deprecated`, etc.) export variants, non-component APIs, and demos that legitimately violate “components-only exports” and React Compiler-oriented hook rules. Scoping avoids noisy errors without weakening rules for the actual Vite SPA.
- **`vitest/valid-expect` is off** — Vitest allows `expect(actual, message)`; the rule is oriented toward Jest-style single-argument `expect`.
- **`vitest/no-conditional-expect` is off** — Allows tests that branch on environment or feature flags while still using `expect` inside branches.

## Official references

- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TypeScript ESLint / configs](https://typescript-eslint.io/users/configs/)
- [@vitest/eslint-plugin](https://github.com/vitest-dev/eslint-plugin-vitest)

---

## Follow-up suggestions (with reasoning)

### 1. Opt in to type-aware linting (`recommendedTypeChecked`)

**Reasoning:** Today the config uses `typescript-eslint` **recommended** without the type checker to keep `turbo run lint` fast and avoid loading full program data for every file. When `tsconfig` references and project boundaries are stable, enabling `parserOptions.projectService` (with `tsconfigRootDir` set to the repo root) plus `recommendedTypeChecked` (or a curated subset) catches more logic bugs at the cost of CPU and memory.

**Do when:** You have measured lint time in CI and are willing to tune scope (e.g. `tsconfig.eslint.json`, narrower `files` globs) per [typescript-eslint performance guidance](https://typescript-eslint.io/troubleshooting/typed-linting/performance/).

### 2. Add `eslint-plugin-boundaries` (or equivalent architecture rules)

**Reasoning:** Enterprise monorepos benefit from enforced import edges (e.g. apps must not import from other apps; packages expose public entrypoints only). This needs an explicit map of “elements” and allowed relationships; turning it on without design creates churn.

**Do when:** You have a short list of allowed dependency directions documented (see `docs/MONOREPO_BOUNDARIES.md` or similar) and can fix or baseline violations in one pass.

### 3. Introduce `eslint-plugin-react` for vendor / demo trees (optional)

**Reasoning:** Some third-party or generated files reference rules like `react/no-*` in comments. Without `eslint-plugin-react`, those disables can become “unused” or “rule not found.” The SPA does not need the full React plugin set if Hooks + Refresh are enough.

**Do when:** You want stricter React semantics in specific folders (e.g. `packages/shadcn-ui-deprecated`) and accept the extra plugin surface and configuration.

### 4. Stricter CI: `eslint . --max-warnings=0` (a `lint:strict` script)

**Reasoning:** Warnings (e.g. unused imports in legacy blocks) do not fail default ESLint. A strict job prevents warning debt from growing.

**Do when:** Warning count is near zero or you have agreed per-package exceptions; pair with cleaning or scoped overrides so CI stays green.

### 5. Persist ESLint cache in CI

**Reasoning:** Local runs already use `--cache`. CI can reuse `.eslintcache` (or Turborepo remote cache) to cut wall-clock time.

**Do when:** Your pipeline can restore a stable cache key per lockfile + config inputs (this package is included in `turbo.json` lint inputs).

### 6. Revisit Vitest rule overrides

**Reasoning:** `valid-expect` and `no-conditional-expect` are disabled to match current Vitest APIs and test style. Tightening them again can catch real issues once tests are normalized (e.g. fewer conditional expects, consistent `expect` arity).

**Do when:** You add a test style guide or refactor suites toward patterns the recommended rules expect.
