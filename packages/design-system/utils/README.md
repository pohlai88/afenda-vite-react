# `utils/` — shared non-React helpers

This folder holds **small, framework-agnostic utilities** for `@afenda/design-system` that are **safe to import** from primitives, scripts, and apps without pulling in React component trees.

- **TypeScript-only** (no `.tsx` in this folder today)
- **Published** under `@afenda/design-system/utils` and `@afenda/design-system/utils/*` (see [`../package.json`](../package.json) `exports`)
- **Styling helper:** `cn()` composes **Tailwind** class strings; in a themed app those utilities resolve to **CSS variables** produced by the token stack (see [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/))

Read **top-down**: what exists, how **`cn`** relates to tokens and primitives, then **imports** and **tooling**.

---

## Surface (what exists)

| File | Role |
| ---- | ---- |
| [`index.ts`](./index.ts) | Barrel re-export |
| [`cn.ts`](./cn.ts) | `cn(...inputs)` — `clsx` + `tailwind-merge` for conflict-safe Tailwind classes |

---

## Connection to tokens and `ui-primitives/`

`utils/` does **not** implement the token pipeline. It only helps **merge class names** so that **semantic** Tailwind utilities (e.g. `bg-background`, `text-foreground`) compose cleanly with **state** and **responsive** variants.

**Practical rule:** prefer **theme-backed** utilities over raw palette classes; for **which** token families a governed component may use, see the token pipeline and validation in [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/).

[`../ui-primitives/README.md`](../ui-primitives/README.md) documents how primitives import **`cn`** via **relative** paths aligned with `exports`.

---

## How to import

```ts
import { cn } from "@afenda/design-system/utils"
```

```ts
import { cn } from "@afenda/design-system/utils/cn"
```

---

## Local development

`utils/**/*.ts` is included in Prettier and TypeScript for this package.

From **`@afenda/design-system`** package root:

| Script | Purpose |
| ------ | ------- |
| `pnpm run typecheck` | Typecheck `utils` with the rest of the package |
| `pnpm run format` / `format:check` | Prettier for `utils/**/*.ts` |
| `pnpm --filter @afenda/design-system run validate-tokens` | From repo root; needed when token **governance** or **semantic** usage changes — not usually required for `cn`-only edits |

---

## Conventions

- Keep helpers **tiny** and **dependency-light**; avoid new heavy runtime deps without review
- **`cn`** is the canonical merge helper for this package — do not fork duplicate merge logic in feature code

---

## Related docs

| Doc | Purpose |
| --- | ------- |
| [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/) | Token surface, bridge, validation |
| [`../ui-primitives/README.md`](../ui-primitives/README.md) | Components that use `cn` |
| [`../../../docs/COMPONENTS_AND_STYLING.md`](../../../docs/COMPONENTS_AND_STYLING.md) | Monorepo component and styling guidance |
| [`../../../docs/README.md`](../../../docs/README.md) | Documentation index |
