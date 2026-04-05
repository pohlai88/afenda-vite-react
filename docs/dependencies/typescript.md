# TypeScript guide (Afenda)

This document describes how **Afenda** uses **TypeScript** for **strict** typing across **`apps/*`** and **`packages/*`**, with shared **`@afenda/tsconfig`** presets and **`tsc -b`** as the typecheck source of truth alongside Vite’s transpile-only dev server.

**Status:** **Adopted** — **TypeScript `~5.9.3`** at the **repo root** (`typescript` in root `devDependencies`; confirm with [`package.json`](../../package.json)). Shared presets live in **`packages/typescript-config`** (`@afenda/tsconfig` workspace package).

**Official documentation:**

- [Documentation home](https://www.typescriptlang.org/docs/)
- [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — language concepts
- [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) — inheritance, include/exclude
- [TSConfig reference](https://www.typescriptlang.org/tsconfig/) — every **`compilerOption`** (also linked from `tsc --init` via [aka.ms/tsconfig](https://aka.ms/tsconfig))
- [tsc CLI](https://www.typescriptlang.org/docs/handbook/compiler-options.html) — **`tsc`**, **`tsc -b`**, **`--project`**, **`--watch`**
- [Project references](https://www.typescriptlang.org/docs/handbook/project-references.html) — **`references`**, **`composite`**, **`tsc --build`** / **`tsc -b`**
- [Modules — reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) — **`module`**, **`moduleResolution`** (**`bundler`**, **`nodenext`**, …)
- [Choosing compiler options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) — libraries vs apps
- [TypeScript 5.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) — current line (also see [overview](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html) for older versions)
- [Playground](https://www.typescriptlang.org/play/) — quick repros and sharing
- [Release notes / blog](https://devblogs.microsoft.com/typescript/)
- [TypeScript on GitHub](https://github.com/microsoft/TypeScript)

---

## How we use TypeScript

| Aspect | Afenda convention |
| --- | --- |
| **Config** | Extend **`@afenda/tsconfig`** — [`packages/typescript-config/`](../../packages/typescript-config/). Shared **`base.json`** enables **`strict`**, **`verbatimModuleSyntax`**, **`isolatedModules`**, **`erasableSyntaxOnly`**, etc.—extend, don’t duplicate divergent compiler flags ([TSConfig reference](https://www.typescriptlang.org/tsconfig/)) |
| **Apps** | `apps/web` uses project references: `tsconfig.json` → `tsconfig.app.json` / `tsconfig.node.json` ([Project references](https://www.typescriptlang.org/docs/handbook/project-references.html)) |
| **Module strategy** | Vite/browser code often uses **`moduleResolution: "bundler"`**; Node **`apps/api`** / packages may use **`nodenext`** / **`node20`**—keep each **`tsconfig`** consistent ([Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)) |
| **Truth** | **`tsc -b`** / **`pnpm typecheck`** for full checks; Vite **transpile-only** in dev does not replace `tsc` ([Vite](./vite.md)) |
| **Style** | Avoid unvetted **`any`** — see [AGENTS.md](../../AGENTS.md) |

---

## Where it lives

| Path | Role |
| --- | --- |
| [`packages/typescript-config/`](../../packages/typescript-config/) | Shared **`base.json`**, **`react-app.json`**, **`node.json`** presets |
| [`apps/web/tsconfig.json`](../../apps/web/tsconfig.json) | Project references |
| [`apps/web/tsconfig.app.json`](../../apps/web/tsconfig.app.json) | Application + React |
| [`apps/web/tsconfig.node.json`](../../apps/web/tsconfig.node.json) | Vite / Node config tooling |

---

## Commands

```bash
pnpm typecheck          # Turbo — all packages that define typecheck
pnpm --filter @afenda/web typecheck
```

Pair with [ESLint](./eslint.md) type-aware rules for `**/src/**`. For monorepo task wiring, see [Turborepo](./turborepo.md).

---

## Red flags

- Disabling **`strict`** or key checks repo-wide to silence errors.
- Treating **ESLint** as a substitute for **`tsc`** on CI.
- **Mismatched** **`module`** / **`moduleResolution`** pairs (e.g. **`nodenext`** without **`nodenext`** resolution)—see [TSConfig reference](https://www.typescriptlang.org/tsconfig/).

---

## Related documentation

- [ESLint](./eslint.md) — typed linting with `projectService`
- [Vite](./vite.md) — build pipeline vs `tsc -b`
- [Turborepo](./turborepo.md) — `typecheck` in the task graph
- [Project configuration](../PROJECT_CONFIGURATION.md) — full tooling
- [Testing](../TESTING.md)

**External:** [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) · [TypeScript GitHub](https://github.com/microsoft/TypeScript)

**Context7 (AI doc refresh):** **`TypeScript`** → **`/websites/typescriptlang`** (handbook-style) or **`/microsoft/typescript`** / **`/microsoft/typescript-website`** (deep compiler/snippets); typed lint overlap → **`/typescript-eslint/typescript-eslint`**. Then **`query-docs`** for **`tsconfig`**, **`tsc -b`**, module resolution, or ESLint **`projectService`**.
