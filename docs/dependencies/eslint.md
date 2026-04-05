# ESLint guide (Afenda)

This document describes how **Afenda** configures **ESLint 9** with **flat config** for the whole monorepo: JavaScript and TypeScript, **React** + **Hooks** + **react-refresh (Vite)**, **jsx-a11y**, and **typescript-eslint** with **`projectService`** on app **`src/**`**.

**Status:** **Adopted** at the **repository root** — **ESLint 9** with the **flat config** format (`eslint.config.js`). Dependencies: **`typescript-eslint`**, **`eslint-plugin-react`**, **`eslint-plugin-react-hooks`**, **`eslint-plugin-react-refresh`**, **`eslint-plugin-jsx-a11y`**, **`eslint-config-prettier`**, **`@eslint/js`**, **`globals`** (see root [`package.json`](../../package.json)).

**Official documentation:**

- [ESLint — latest](https://eslint.org/docs/latest/) — CLI, rules, [core concepts](https://eslint.org/docs/latest/use/core-concepts)
- [Flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files) — `eslint.config.js`, `defineConfig`, cascades, `files` / `ignores`
- [Migration guide (eslintrc → flat)](https://eslint.org/docs/latest/use/configure/migration-guide)
- [typescript-eslint — getting started](https://typescript-eslint.io/getting-started/)
- [Typed linting](https://typescript-eslint.io/getting-started/typed-linting) — type-aware rules, presets with **`TypeChecked`** in the name
- [Project service (`projectService`)](https://typescript-eslint.io/blog/project-service) — replaces **`parserOptions.project`** for scalable typed linting
- [Shared configs (recommended, strict, …)](https://typescript-eslint.io/users/configs)

---

## How we use ESLint

| Aspect | Afenda convention |
| --- | --- |
| **Config shape** | **Flat config** — one **`eslint.config.js`**, **`export default defineConfig([...])`** ([Configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)) |
| **Scope** | Single policy across **`apps/*`** and **`packages/*`**; **`tsc -b`** remains the source of truth for full typechecking (Vite transpiles in dev) |
| **React** | **`apps/web`** `src/**` uses **type-aware** rules + React + Hooks + **react-refresh (Vite)** + **jsx-a11y** |
| **Formatting** | **Prettier** owns formatting; **`eslint-config-prettier`** turns off conflicting ESLint stylistic rules ([Prettier](./prettier.md)) |
| **CI** | **`pnpm lint`** via Turborepo; pre-commit **lint-staged** runs ESLint on staged files |

---

## Flat config primitives (ESLint 9)

Patterns aligned with upstream flat config:

- **`defineConfig([...])`** from **`eslint/config`** wraps the exported array and improves type inference / validation.
- **`globalIgnores([...])`** applies **project-wide** ignores (build output, dependencies). Prefer this over repeating the same **`ignores`** in every block.
- Per-block **`ignores`** only affect **that** config object’s **`files`** match — useful for excluding fixtures under tests.
- Optional **`name`** on each object makes **`--print-config`** and debug output readable ([ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files)).

This repo sets **`tsconfigRootDir`** to **`import.meta.dirname`** in **`eslint.config.js`** so **`projectService`** resolves **`tsconfig`** paths from the config file’s directory ([typed linting — `tsconfigRootDir`](https://typescript-eslint.io/getting-started/typed-linting)).

---

## typescript-eslint: type-aware linting

- **Presets** — Names like **`recommendedTypeChecked`** / **`recommendedTypeCheckedOnly`** enable rules that need TypeScript’s type checker ([Typed linting](https://typescript-eslint.io/getting-started/typed-linting)). Afenda uses a **split**: lighter rules on non-`src` TS, stricter type-aware set on **`**/src/**/*.{ts,tsx}`** (see [`eslint.config.js`](../../eslint.config.js)).
- **`parserOptions.projectService: true`** — Use the **TypeScript project service** (same class of API as the editor) instead of legacy **`parserOptions.project`** / **`project: true`** ([Project service announcement](https://typescript-eslint.io/blog/project-service)).
- **Dual passes** — **`pnpm lint`** stays fast; **`lint:typeaware`** can run a heavier type-aware pass when you need full-program rules on **`apps/web`** ([Vitest](./vitest.md) / CI policy).

---

## Where it lives

| Path | Role |
| --- | --- |
| [`eslint.config.js`](../../eslint.config.js) | **Single** flat config: `defineConfig([...])`, `globalIgnores`, Prettier last |
| Root [`package.json`](../../package.json) | `eslint`, plugins, `pnpm lint` → `turbo run lint` |
| [`apps/web/package.json`](../../apps/web/package.json) | `lint`, optional `lint:typeaware` for stricter typed pass |

---

## Config structure (this repo)

The root config uses **`defineConfig`** and **`globalIgnores`** from **`eslint/config`** (ESLint 9+). Blocks are **named** for clarity (`name: 'base/javascript'`, etc.).

1. **Ignores** — `dist`, `build`, `coverage`, `node_modules`, `.vite`, `.turbo`, `public`, config-specific dirs (see `globalIgnores([...])` in repo).
2. **JavaScript** — `**/*.{js,mjs,cjs}` with **`@eslint/js`** recommended + shared **`coreRules`** (`eqeqeq`, `no-console` by env, etc.).
3. **TypeScript (non-`src`)** — `**/*.{ts,tsx}` **excluding** `**/src/**`: **`typescript-eslint` recommended** only (not type-checked)—for root configs and loose TS files.
4. **TypeScript + React (`src`)** — **`**/src/**/*.{ts,tsx}`**: **recommended + `recommendedTypeCheckedOnly`**, **React** (flat, jsx-runtime), **jsx-a11y**, **react-hooks**, **react-refresh (Vite)**. Parser: **`projectService: true`**, **`tsconfigRootDir`**: **`import.meta.dirname`**.
5. **Tooling files** — `eslint.config.js`, `*.config.*`, `vite.config.*`, `scripts/**`: relaxed **`no-console`**, etc.
6. **Tests** — `*.test/spec.*`, `__tests__`: Vitest globals, relaxed **`no-explicit-any`** / **`no-console`** where appropriate.
7. **Prettier** — **`eslintConfigPrettier`** **last** so it wins over conflicting rules.

Authoritative inline comments in **`eslint.config.js`** reference [ESLint flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files) and [Vite transpile-only](https://vite.dev/guide/features#transpile-only).

---

## Commands

```bash
# All packages that define `lint` (via Turborepo)
pnpm lint

# Stricter type-aware pass on app sources only
pnpm --filter @afenda/web lint:typeaware
```

Use **`lint:typeaware`** when you want **typescript-eslint** rules that require type information across the full `src` program (slower than default `eslint .`).

---

## Conventions

- **Do not** add **legacy** `.eslintrc.*` — stay on **flat config** per [ESLint 9 migration](https://eslint.org/docs/latest/use/configure/migration-guide).
- **Plugins** — Reference official flat presets (`react.configs.flat.recommended`, `jsxA11y.flatConfigs.recommended`, etc.).
- **Accessibility** — **eslint-plugin-jsx-a11y** catches many issues in JSX; it does **not** replace manual review, [Design system](../DESIGN_SYSTEM.md), or contrast tooling ([wcag-contrast](./wcag-contrast.md)).
- **Monorepo boundaries** — If you split packages with different concerns, add **named config blocks** or separate config files only when needed; see [eslint-enterprise-monorepo skill](../../.agents/skills/eslint-enterprise-monorepo/SKILL.md) for boundary patterns.

---

## Red flags

- Disabling **`@typescript-eslint/no-explicit-any`** repo-wide to “move fast”—prefer narrow disables with comments in rare cases.
- Running ESLint **without** the same **`files`/`ignores`** as CI and expecting identical results.
- Relying on ESLint for **type safety** instead of **`pnpm typecheck`** (`tsc -b`).
- Reintroducing **`parserOptions.project: true`** without reason — prefer **`projectService: true`** ([Project service](https://typescript-eslint.io/blog/project-service)).

---

## Related documentation

- [Prettier](./prettier.md) — formatting; must stay compatible with **`eslint-config-prettier`**
- [TypeScript](./typescript.md) — `tsconfig`, `projectService`
- [Project configuration](../PROJECT_CONFIGURATION.md) — Prettier, hooks, Turbo
- [Testing](../TESTING.md) — Vitest globals in test block
- [Vite](./vite.md) — transpile-only dev vs `tsc -b` for production typecheck

**External:** [eslint.org/docs/latest](https://eslint.org/docs/latest/) · [typescript-eslint.io](https://typescript-eslint.io/) · [ESLint GitHub](https://github.com/eslint/eslint)

**Context7 library IDs (doc refresh):** `/eslint/eslint/v9.37.0` · `/typescript-eslint/typescript-eslint`
