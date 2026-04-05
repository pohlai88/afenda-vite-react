# 🧱 Components and styling

Conventions for UI in **`apps/web`**. Pair this with [Project structure](./PROJECT_STRUCTURE.md) (feature folders, public exports).

**Visual identity:** [Brand guidelines](./BRAND_GUIDELINES.md) (logo, gradient, ERP signature). **Tokens and neutrals:** [Design system](./DESIGN_SYSTEM.md).

---

## Component best practices

### Colocate by default

Keep components, hooks, styles, and state **as close as possible** to where they are used. That improves readability, keeps boundaries obvious, and **reduces unnecessary re-renders** when state updates stay inside smaller subtrees.

### Avoid large components with nested render helpers

Do **not** accumulate multiple ad-hoc `renderX()` functions inside one component—it becomes hard to test, split, and reason about. If a piece of UI is a **coherent unit**, extract a **named component** (or move to a colocated file).

```tsx
// Hard to maintain as the parent grows
function Parent() {
  function renderItems() {
    return <ul>{/* ... */}</ul>
  }
  return <div>{renderItems()}</div>
}

// Prefer a real child component
function Items() {
  return <ul>{/* ... */}</ul>
}

function Parent() {
  return (
    <div>
      <Items />
    </div>
  )
}
```

### Stay consistent

Follow **one composition pattern** per area (props vs `children`, slot-like APIs, file naming). Match existing code in the feature before introducing a new style—ERP screens especially benefit from predictable patterns (forms, tables, filters).

### Limit prop surface area

If a component accepts **too many props**, split it into smaller components or use **composition** (`children`, render props, or explicit slots) instead of a flat, ever-growing prop list.

### Shared primitives and third-party wrappers

For larger apps, **centralize repeated UI** in a small set of shared primitives (often under `src/components/` or `src/components/ui/`—see [Project structure](./PROJECT_STRUCTURE.md)). That keeps ERP modules visually aligned and easier to refactor.

- **Identify real repetition** before abstracting—avoid the wrong abstraction.
- **Wrap third-party** widgets (date pickers, rich selects, etc.) behind your own component so theming, a11y fixes, and future library swaps stay localized; call sites depend on **your** API, not the vendor’s raw surface.

---

## Current stack (`apps/web`)

Facts from **`apps/web/package.json`** today:

| Area | Choice |
| --- | --- |
| Build | [Vite](https://vitejs.dev/) |
| UI runtime | [React 19](https://react.dev/) + [React Router](https://reactrouter.com/) |
| Styling | **Global + component CSS** (e.g. [`apps/web/src/index.css`](../apps/web/src/index.css))—no Tailwind in dependencies yet |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + [`@hookform/resolvers`](https://github.com/react-hook-form/resolvers) |
| Server/cache UI data | [TanStack Query](https://tanstack.com/query) |
| Client state | [Zustand](https://github.com/pmndrs/zustand) where needed |

**Per-package guidelines:** [Dependency guides](./dependencies/README.md) (Vite, React, TanStack Query, Zod, planned Tailwind v4 / Fastify / Pino).

**Forms:** Prefer RHF + Zod for non-trivial forms; details and mental model live in [State management](./STATE_MANAGEMENT.md) §Form state.

**Toasts / notifications:** Not standardized in dependencies yet. A common choice with shadcn-style setups is [Sonner](https://sonner.emilkowal.ski/); pick one library and document it when you add it.

---

## shadcn/ui + Tailwind (recommended when you add a design system)

**Full guide:** [shadcn/ui components](./dependencies/shadcn-ui.md) — copy-in components under `apps/web/src/components/ui/`, **`components.json`**, **`cn()`**, RHF + Zod forms, Sonner toasts, Vite-specific notes (no RSC).

This repo may not ship Tailwind or shadcn yet; that doc is the **source of truth** when you introduce them. High level:

- **Own the source** — primitives live in-repo, not an opaque package.
- **Paths** — `@/*` → `apps/web/src/*` (see `tsconfig.app.json`).
- **Tokens** — align with [Design system](./DESIGN_SYSTEM.md) and [Brand guidelines](./BRAND_GUIDELINES.md).

---

## Styling with Tailwind CSS v4 (when adopted)

Tailwind v4 favors a **CSS-first** setup: theme and tokens often live in your **global stylesheet** (e.g. `apps/web/src/index.css`) using `@import "tailwindcss"` and an `@theme { ... }` block. You may keep a small `tailwind.config` only for tooling (e.g. shadcn CLI); **source of truth** for colors and type ramps should match [Design system](./DESIGN_SYSTEM.md) and [Brand guidelines](./BRAND_GUIDELINES.md).

### Theme sketch (illustrative)

Semantic utilities (`bg-primary`, `text-muted-foreground`) should resolve to **CSS variables**—often HSL components for shadcn-style themes:

```css
:root {
  --primary: 245 58% 52%;
  --background: 240 8% 96%;
}

@theme {
  --color-primary: hsl(var(--primary) / 1);
  --color-background: hsl(var(--background) / 1);
}
```

**Domain or status colors** (e.g. success, module accents) may use **OKLCH** where the design system specifies fixed ramps—see [Design system](./DESIGN_SYSTEM.md) §2.

### Utility conventions (when Tailwind exists)

| Pattern | Intent |
| --- | --- |
| `brand-gradient` | **Only** logo mark and hero surfaces ([Brand guidelines](./BRAND_GUIDELINES.md) §4) |
| Semantic colors | `bg-primary`, `text-muted-foreground`—not raw hex in `className` |
| Cards / elevation | Shared utility classes for hover lift + shadow (define once in CSS or `@utility`) |

---

## Design system anti-patterns

Avoid these—they clash with [Brand guidelines](./BRAND_GUIDELINES.md) and [Design system](./DESIGN_SYSTEM.md):

- **Gradients on primary buttons** — use solid `bg-primary` (or token equivalent).
- **Hardcoded hex in JSX** — use CSS variables / semantic classes.
- **Invalid gradient utilities** — use valid Tailwind gradient directions (e.g. `bg-gradient-to-r`) or documented custom classes.
- **Decorative blur blobs** as default page chrome—reads as generic “AI UI”; prefer warm neutrals and elevation from the design system.
- **Mixing color spaces without rules** — follow HSL vs OKLCH guidance in [Design system](./DESIGN_SYSTEM.md) §1.

---

## Vite / SPA practices (not Next.js)

This app is a **client-rendered SPA**, not React Server Components.

- **Split heavy routes** with [`React.lazy`](https://react.dev/reference/react/lazy) and [`<Suspense>`](https://react.dev/reference/react/Suspense) so initial bundles stay smaller.
- **Keep state local** when possible; use TanStack Query for remote data (see [State management](./STATE_MANAGEMENT.md)).
- **Prefer composition** (children / slots) over “god props” for layout shells and ERP page templates.

---

## Checklist (quick reference)

1. **Semantic colors** — tokens first (`bg-primary`, `text-muted-foreground`), not ad-hoc hex.
2. **CSS variables** — single source for theming and tenant branding when implemented.
3. **Colocate** state and UI; **extract** real subcomponents instead of nested render helpers.
4. **Compose** instead of inflating props; **wrap** third-party widgets at the boundary.
5. **Cross-check** [Performance](./PERFORMANCE.md) for lists, memoization, and bundle size.

---

## Related docs

- [shadcn/ui components](./dependencies/shadcn-ui.md) — Radix + shadcn patterns in `apps/web`
- [Brand guidelines](./BRAND_GUIDELINES.md)
- [Design system](./DESIGN_SYSTEM.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [State management](./STATE_MANAGEMENT.md)
- [Performance](./PERFORMANCE.md)
- [Project configuration](./PROJECT_CONFIGURATION.md)
