# `ui-primitives/` — registry UI components

This folder is the **React presentation layer** for `@afenda/design-system`: **shadcn/ui–style** primitives (New York preset) that pair with the **token system** in [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/).

- **React 19** components (`.tsx`), typically **one primitive per file**
- **Canonical source** for design-system UI primitives (registry paths in `_registry.ts`)
- **Styling** uses **Tailwind** utility classes that resolve to **theme CSS variables** (not hardcoded palette literals in components)
- **Governance** for which token families a component may use is defined in the token pipeline (`design-architecture/src/tokenization/`, e.g. `shadcn-registry.ts`, `token-contract.ts`) — see _Connection to tokens_ below

Read **top-down**: what exists in this folder, how it **hooks into tokens**, then **layout and tooling**.

---

## Component surface (what exists)

Roughly **56** UI modules (`*.tsx` in this directory), including form controls, overlays, navigation, data display, and layout helpers — for example `button`, `dialog`, `input`, `select`, `table`, `sidebar`, `chart`.

**Authoritative inventory** for the shadcn registry: [`_registry.ts`](./_registry.ts) (component names, dependencies, and file paths the CLI expects).

---

## Connection to tokens (how UI meets the system)

Primitives do **not** embed the token pipeline; they assume the **app theme** wires Tailwind semantic classes to **CSS variables** produced from the token stack (raw → semantic/state → bridge). In code you see patterns like `bg-primary`, `text-destructive`, `border-input` — those map to variables such as `--primary`, `--destructive`, `--input` in a fully themed app.

**Enterprise boundary:** which **semantic families**, **state families**, and optional **raw** keys a **governed** component may use should stay aligned with the token pipeline and `shadcn-registry` metadata. When you add or change a primitive’s **variant** or **color behavior**, run `pnpm --filter @afenda/design-system run validate-tokens` after token or governance changes.

```txt
token pipeline (src/tokenization)     apps / Tailwind theme
        │                              │
        │  bridge + theme maps         │  maps utilities → CSS variables
        └──────────────┬───────────────┘
                       ▼
              ui-primitives (React + Tailwind classes)
```

**Practical rule:** prefer **semantic theme utilities** (`background`, `primary`, `destructive`, …) over **raw** Tailwind colors (`neutral-500`, arbitrary hex). Document exceptions (e.g. **Card** + shadow raw keys) explicitly in code review.

For **how** semantic/state keys resolve to raw values and CSS names, see **Token resolution** in [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/).

---

## Architecture (how this folder is built)

| Piece                                      | Role                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `*.tsx`                                    | One component (or small compound) per file; CVA variants where used            |
| [`_registry.ts`](./_registry.ts)           | shadcn **registry manifest**: names, `registryDependencies`, paths for codegen |
| [`../components.json`](../components.json) | shadcn **project schema** (style, `cssVariables`, aliases) at package root     |
| [`../utils/cn`](../utils/cn.ts)            | Local `cn()` helper (`clsx` + `tailwind-merge`) for this package               |

Imports use **relative** paths into [`../utils/`](../utils/) (and sibling `./` components), not tsconfig `@/` aliases, so typecheck stays aligned with `package.json` `exports`.

---

## Imports

Package exports (see `@afenda/design-system` `package.json`):

```ts
import { Button } from "@afenda/design-system/ui-primitives/button"
```

Registry entry for tooling:

```ts
import { ui } from "@afenda/design-system/ui-primitives/_registry"
```

The `./ui-primitives/*` export maps to `./ui-primitives/*.tsx`.

---

## Local development

From **`@afenda/design-system`** package root:

| Script                             | Purpose                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `pnpm run typecheck`               | Typecheck primitives + tokenization                                     |
| `pnpm run lint`                    | ESLint for the package                                                  |
| `pnpm run format` / `format:check` | Prettier for `utils` + `ui-primitives` sources                          |
| `pnpm --filter @afenda/design-system run validate-tokens` | From repo root; run after **token** or **governance** changes (see [`design-architecture/src/tokenization/`](../design-architecture/src/tokenization/)) |

Changing **only** markup/a11y in a primitive usually does not require that command; changing **which** token concepts a component encodes may.

---

## Requirements

- **Peer:** `react` and `react-dom` **^19**
- **Runtime deps** (Radix, `class-variance-authority`, `tailwind-merge`, `lucide-react`, etc.) are declared on **`@afenda/design-system`** — do not duplicate them in individual files

---

## Conventions

- Preserve **accessibility** (labels, `aria-*`, focus rings, roles); do not remove a11y behavior without a replacement
- Keep **API and file names** aligned with **shadcn** so `_registry.ts` paths stay valid
- **Variants:** use **CVA** where the codebase already does; keep class strings maintainable
- **Theming:** extend **theme tokens** and the **tokenization** layer for new **palette** needs — avoid one-off hex in primitives

---

## Related docs

| Doc                                                                                  | Purpose                                           |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [`../design-architecture/src/tokenization/`](../design-architecture/src/tokenization/)                             | Token surface, resolution, validation, public API |
| [`../../../docs/COMPONENTS_AND_STYLING.md`](../../../docs/COMPONENTS_AND_STYLING.md) | Monorepo component and styling guidance           |
| [`../../../docs/DESIGN_SYSTEM.md`](../../../docs/DESIGN_SYSTEM.md)                   | Design system overview                            |
| [`../../../docs/README.md`](../../../docs/README.md)                                 | Documentation index                               |
