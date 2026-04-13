# `icons/` — multi-library icon loaders

This folder is the **icon infrastructure** for `@afenda/design-system`: **lazy loaders** and **per-library React wrappers** backed by **generated export barrels** (`__*.ts`).

- **React** loaders use `use()` against lazy imports of generated modules — do not edit `__lucide__.ts` … `__remixicon__.ts` by hand
- **`libraries.ts`** is **generator input** (package names, import patterns); **`icon-policy.ts`** plus ESLint govern **dynamic** `name="…"` usage
- **Public API:** `@afenda/design-system/icons` (see [`../package.json`](../package.json) `exports`)

Read **top-down**: what is **hand-maintained** vs **generated**, how **imports** work, then **governance** and **tooling**.

---

## Surface (what exists)

| Kind | Files | Role |
| ---- | ----- | ---- |
| **Public barrel** | [`index.ts`](./index.ts) | Exports `createIconLoader`, `IconLucide`, `IconTabler`, `IconHugeicons`, `IconPhosphor`, `IconRemixicon`, `iconLibraries`, `iconPolicy` |
| **Loaders** | [`create-icon-loader.tsx`](./create-icon-loader.tsx), `icon-*.tsx` | `createIconLoader` + one wrapper per library |
| **Policy & catalog** | [`icon-policy.ts`](./icon-policy.ts), [`libraries.ts`](./libraries.ts) | Allowed dynamic paths; npm packages and codegen metadata per library |
| **Codegen** | [`script/build-icons.ts`](./script/build-icons.ts) | Scans sources and emits generated barrels |
| **Generated** | `__lucide__.ts`, `__tabler__.ts`, `__hugeicons__.ts`, `__phosphor__.ts`, `__remixicon__.ts` | Re-export only the icons **referenced** by scans |
| **Tests** | [`__tests__/`](./__tests__/) | Barrel / API smoke tests |

---

## Connection to tokens (and the rest of the package)

Icon barrels are **not** part of the token pipeline, but **`build-icons.ts`** scans package-local design-system sources (`design-architecture/src/tokenization/`, `ui-primitives/`, and `utils/`) so **dynamic** `<Icon* name="…" />` usage in canonical design-system code pulls icons into the generated files.

**Practical rule:** product UI should prefer **static** icon imports; dynamic loaders are for **registry / CMS / studio** contexts — see **`iconPolicy`** and the `afenda-ui/no-dynamic-icon-name-prop` ESLint rule.

Theming for icons follows the **app** (stroke, size, `currentColor`); palette semantics live in the token pipeline under [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/).

---

## Architecture (how pieces fit)

```txt
libraries.ts (catalog)     build-icons.ts (scan + emit)
        │                            │
        │                            ▼
        │                    icons/__*.ts (generated barrels)
        │                            │
        ▼                            ▼
createIconLoader + Icon*     lazy import + React use()
```

---

## How to import

```ts
import {
  IconLucide,
  createIconLoader,
  iconLibraries,
  iconPolicy,
} from "@afenda/design-system/icons"
```

---

## Local development

From **`@afenda/design-system`** package root (or `pnpm --filter @afenda/design-system` from the monorepo root):

| Script | Purpose |
| ------ | ------- |
| `pnpm run icons:generate` | Regenerate `__*.ts` from [`./script/build-icons.ts`](./script/build-icons.ts) |
| `pnpm run icons:check` | Regenerate and fail if `git diff` shows uncommitted icon barrel changes |
| `pnpm run test:run` | Vitest (includes icon barrel tests) |

After adding or removing **dynamic** `name="…"` usage in scanned trees, run **`icons:generate`** (or **`icons:check`** in CI) so barrels stay in sync.

---

## Conventions

- Do **not** hand-edit **`__*.ts`** — they are **generator-owned**
- Extend **`libraries.ts`** when adding a **new** upstream icon package (then wire a new `Icon*` + loader + `COMPONENT_TO_LIB` in `build-icons.ts`)
- Keep **dynamic** icon usage aligned with **`iconPolicy`** and ESLint

---

## Related docs

| Doc | Purpose |
| --- | ------- |
| [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/) | Design token pipeline (scanned by icon build) |
| [`../scripts/README.md`](../scripts/README.md) | Other package scripts (pointers) |
| [`../ui-primitives/README.md`](../ui-primitives/README.md) | Primitives that may compose icons |
| [`../../../docs/DESIGN_SYSTEM.md`](../../../docs/DESIGN_SYSTEM.md) | Design system overview |
| [`../../../docs/README.md`](../../../docs/README.md) | Documentation index |
