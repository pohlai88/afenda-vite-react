# Components and Styling Standard

Normative standard for UI implementation in `apps/web` and `packages/ui`.

This document defines the stable rules for Tailwind CSS v4 + shadcn/ui in Afenda. It does not define one-time migration sequencing; use `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md` for execution steps and `docs/APP_SHELL_SPEC.md` for shell architecture decisions.

## Scope and Authority

- Applies to all ERP UI code in `apps/web/src/features/*`, shared client UI in `apps/web/src/share/*`, and UI primitives in `packages/ui/`.
- Supersedes legacy styling guidance that assumed pre-Tailwind CSS-only setup.
- Pair with `docs/DESIGN_SYSTEM.md` for token intent and `docs/BRAND_GUIDELINES.md` for brand usage constraints.

## Approved UI Stack

| Area                 | Standard                                                  |
| -------------------- | --------------------------------------------------------- |
| Build                | Vite                                                      |
| Runtime              | React 19 + React Router                                   |
| Utility CSS          | Tailwind CSS v4 (`tailwindcss`)                           |
| Tailwind integration | `@tailwindcss/vite` (not PostCSS path)                    |
| Component system     | shadcn/ui (copy-in code, Radix base)                      |
| Class merge          | `clsx` + `tailwind-merge` via `cn()`                      |
| Variant system       | `class-variance-authority`                                |
| Icons                | `lucide-react`                                            |
| Toasts               | `sonner`                                                  |
| Animations           | `tw-animate-css` (official shadcn v4 animation layer)     |
| Base styles          | `shadcn/tailwind.css` (official shadcn v4 base utilities) |
| Forms plugin         | `@tailwindcss/forms` (class strategy)                     |
| Typography plugin    | `@tailwindcss/typography`                                 |
| Font                 | `@fontsource-variable/geist`                              |

## Rule Classification

- Mandatory: must always be followed.
- Recommended: strong default; deviations need rationale.
- Approved Initial Implementation: current chosen implementation, can evolve with ADRs.

## Mandatory Rules

### Tailwind and Build Pipeline

1. Use `@tailwindcss/vite` plugin in `apps/web/vite.config.ts`.
2. Do not use Tailwind via PostCSS in this app.
3. `tailwind.config.ts` must not exist for this v4 CSS-first setup.
4. Do not use CSS Modules alongside Tailwind utilities in `apps/web`.
5. Do not install `tailwindcss-animate` (v3 JS-config plugin). Use `tw-animate-css` (the official CSS-only v4 replacement provided by shadcn).

### CSS Architecture (Tailwind v4 CSS-first)

Use this structure in `apps/web/src/index.css`:

1. **Imports**: `@import "tailwindcss"`, then `@plugin` directives (`@tailwindcss/forms`, `@tailwindcss/typography`), then `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`, `@import "@fontsource-variable/geist"`.
2. **Source**: `@source` directive to scan `packages/ui/src` for class usage.
3. **Custom variant**: `@custom-variant dark (&:where(.dark, .dark *))`.
4. **Tokens**: Root-level `:root` (light) and `.dark` variable blocks in OKLCH. No separate `.light` class block.
5. **Theme mapping**: `@theme inline` variable-to-utility mapping with multiplication-based radius formulas.
6. **Prose tokens**: Typography `--tw-prose-*` variables in a second `:root` block (outside `@theme` to avoid false diagnostics).
7. **Custom utilities**: `@utility` helpers (e.g. `ring-3`).
8. **Layers**: `@layer base` resets and `@layer components` for app-level utility classes.

Critical constraints:

- `:root` and `.dark` must not be nested inside `@layer base`.
- `@theme inline` is required when mapping CSS variables.
- Base layer uses `var(--token)` references; do not double-wrap token values.
- Radius tokens use multiplication (`calc(var(--radius) * 0.6)`) not subtraction.
- All color tokens in `:root` and `.dark` must use `oklch()` format consistently.

### Token and Theming Rules

1. Color tokens use semantic `name` / `name-foreground` pairs.
2. Color values are stored in OKLCH format with fractional lightness (`0..1`) for consistency.
3. Semantic utilities (`bg-primary`, `text-muted-foreground`, etc.) must map to CSS variables.
4. Raw color classes (e.g. `bg-blue-500`, `text-gray-600`) are forbidden in product UI.
5. Manual `dark:` color overrides are forbidden when semantic tokens exist.
6. Required token families include:
   - Core semantic: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `accent`, `muted`, `destructive`, `border`, `input`, `ring`
   - Extended status: `success`, `warning`, `info`
   - Shell-specific: `sidebar-*`
   - Charts: `chart-1` through `chart-5`

### Tailwind v4 Anti-Drift Rules

1. `@theme` and `@theme inline` are token-ownership layers only. Do not place component recipes or page styling there.
2. `@utility` is for small semantic helpers such as typography, dense-data formatting, and single-purpose text/link/code helpers.
3. `@layer components` in `apps/web/src/index.css` is for canonical app primitives only, not route-specific implementations.
4. New global selectors like `.page`, `.dashboard-*`, `.placeholder`, or other page-era aliases are forbidden.
5. Arbitrary values are a last resort. If a value is reused or semantically meaningful, promote it into tokens or a named utility.
6. Direct token-shaped classes like `text-(--color-foo)` in product UI are forbidden when a semantic utility or shared primitive already exists.
7. Prefer semantic Tailwind utilities and approved `ui-*` primitives before introducing new shared selectors.

### Approved App Vocabulary

Feature code in `apps/web` should prefer this vocabulary:

- Layout: `ui-page`, `ui-section`, `ui-stack-tight`, `ui-stack`, `ui-stack-relaxed`, `ui-card-grid`
- Headers: `ui-header`, `ui-proof-header`, `ui-kicker`
- Titles and text: `ui-title`, `ui-title-page`, `ui-title-hero`, `ui-title-section`, `ui-title-card`, `ui-lede`, `ui-copy`, `ui-fine`, `heading-*`, `text-*`
- Surfaces: `ui-surface`, `ui-surface-raised`, `ui-surface-hero`, `ui-empty-state`
- State helpers: `ui-truth-row-*`
- Search/overlay shell: shared React wrappers in `apps/web/src/share/components/search/` rather than repeated overlay class strings

When a new screen cannot be expressed with this vocabulary, either:

1. extend the canonical vocabulary deliberately, or
2. create a reusable shared component instead of introducing a one-off global selector

### shadcn Configuration Rules (Monorepo)

Two `components.json` files exist — one per workspace that the CLI targets:

**`packages/ui/components.json`** (UI primitives):

- All aliases point to `@afenda/ui/*`
- `tailwind.css` points to `src/styles/globals.css`

**`apps/web/components.json`** (app-level blocks):

- `aliases.ui` and `aliases.utils` point to `@afenda/ui/*`
- `aliases.components`, `aliases.hooks`, `aliases.lib` point to `@/share/*`
- `tailwind.css` points to `src/index.css`

**Shared immutable fields** (must match across both files per [monorepo docs](https://ui.shadcn.com/docs/monorepo)):

- `style: "radix-luma"`
- `tailwind.baseColor: "neutral"`
- `iconLibrary: "lucide"`

**Common settings**:

- `rsc: false`
- `tailwind.config: ""`

### Primitive Baseline Enforcement

- `packages/ui` is a Radix-first primitive library. New primitives must use the unified `radix-ui` package unless an ADR or explicit repo rule says otherwise.
- `packages/ui/src/components/ui/combobox.tsx` is the single approved Base UI exception because upstream shadcn currently implements `Combobox` with `@base-ui/react` even in the Radix docs path.
- Do not introduce additional `@base-ui/react` imports in `packages/ui/src/components/ui/`.
- Do not add parallel primitive implementations for the same control family (for example, a second select, menu, dialog, or popover primitive backed by a different library).
- Preserve shadcn token-based styling and component composition. Do not replace primitive styles with hardcoded color classes or one-off CSS when extending primitives.
- The approved Radix utility primitives to keep available by default are `Slot`, `Direction`, `AccessibleIcon`, and `VisuallyHidden`.
- `Toolbar` is intentionally not part of the primitive baseline at this stage. Use layout composition and app toolbar utilities for ERP toolbars unless a concrete keyboard-toolbar requirement justifies a dedicated primitive.
- Treat `packages/ui/src/components/ui/` as sealed for alternate primitive additions after this baseline. New primitives require a concrete missing capability, not speculative future usage.

### Path and Topology Rules

Three-tier component topology:

1. **`packages/ui/src/components/ui/`** — shadcn/ui primitives (Button, Card, Sidebar, etc.). Imported as `@afenda/ui/components/<name>`.
2. **`apps/web/src/share/components/`** — App-level shared components (app shell layout, composed widgets). Imported as `@/share/components/<name>`.
3. **`apps/web/src/features/*/components/`** — Feature-specific components. Imported via feature public API.

Supporting locations:

- `cn()` utility lives at `packages/ui/src/lib/utils.ts`. Imported as `@afenda/ui/lib/utils`.
- Reusable hooks live under `packages/ui/src/hooks/` (UI-level) or `apps/web/src/share/react-hooks/` (app-level DOM/media/shortcut hooks; not Zustand — see `share/client-store/`).
- Do not place shared UI in `apps/web/src/components/` root.

### `cn()` Rule

`cn()` is the required helper for merged/conditional class names, living in `packages/ui/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Import in both `packages/ui` and `apps/web` as:

```ts
import { cn } from '@afenda/ui/lib/utils'
```

### Post-CLI Cleanup Rules

After `shadcn` CLI generation:

- Strip `'use client'` directives (Vite SPA context).
- Verify UI primitive imports use `@afenda/ui/...` aliases, app component imports use `@/share/...` aliases.
- Remove duplicate `@layer base` blocks if generated.
- Ensure no `tailwind.config.ts` is present.
- Ensure no `tailwindcss-animate` (v3 JS plugin) imports are introduced. `tw-animate-css` is the approved v4 replacement.

## Recommended Rules

### Composition and Styling Practices

- Prefer built-in component variants before custom class overrides.
- Use semantic tokens instead of hardcoded colors.
- Use `gap-*` instead of `space-x-*` / `space-y-*`.
- Use `size-*` when width and height are equal.
- Use `truncate` shorthand.
- Use `Separator` instead of raw `<hr>`/border div separators.
- Use `Badge` for status chips instead of ad-hoc spans.

### Accessibility and Structure

- Dialog/Sheet/Drawer must include title components.
- Group-based menu/select items should be nested in matching group primitives.
- Form fields should include label/description/message semantics.
- Use `aria-label` on the interactive control first when an icon-only button, link, or trigger needs an accessible name.
- Use `VisuallyHidden` for hidden text content inside a component when the component needs screen-reader-only copy in its rendered content.
- Use `AccessibleIcon` only when the icon element itself needs an accessible label. Do not use it for decorative icons or when the parent control already has an accessible name.
- In `packages/ui`, do not use raw JSX with `className="sr-only"` for hidden content. Use the shared `VisuallyHidden` primitive instead.

### Customization Order

Customize in this order:

1. Built-in variants
2. Semantic token utilities
3. CSS variable extension in `index.css`
4. Wrapper components

### Styling Escalation Matrix

Use this decision order for new styling work:

1. `@theme` / theme blocks in `apps/web/src/index.css`
   Use for primitive tokens, semantic aliases, and theme-specific token remapping.
2. `@utility` in `apps/web/src/index.css`
   Use for tiny reusable semantic helpers with low structural complexity.
3. `.ui-*` primitives in `apps/web/src/index.css`
   Use for canonical shell/layout/surface primitives consumed across many screens.
4. `apps/web/src/share/components/block-ui/`
   Use for composed app-level blocks that combine multiple primitives or controls.
5. `packages/ui/src/components/ui/`
   Use for reusable design-system components with variants, slots, and stable APIs.

Escalate upward when:

- the same class recipe appears three or more times
- a pattern has multiple variants or interaction states
- a pattern needs accessibility semantics beyond plain styling
- multiple features need the same structure, not just the same colors

### Adding Custom Colors

When adding a custom semantic color:

1. Define token pair in `:root` and `.dark`.
2. Register in `@theme inline` as `--color-<name>`.
3. Use `bg-<name>` / `text-<name>-foreground` utilities.

Never introduce a separate theme CSS file for token ownership.

## Approved Initial Implementation Decisions

These are current approved choices and may evolve with ADR:

- `style: "radix-luma"` in shadcn initialization (can evolve to another `radix-*` style with ADR).
- Radix primitives as component API baseline.
- `Combobox` is the only approved Base UI-backed primitive in `packages/ui` until upstream shadcn provides a Radix-backed implementation or the repo adopts a replacement by ADR.
- `AccessibleIcon` and `VisuallyHidden` are included as baseline accessibility utility primitives.
- `Toolbar` remains excluded from the primitive baseline unless a concrete product workflow requires Radix toolbar semantics.
- Sonner as the toast implementation.
- Domain-to-chart color mapping strategy.
- App shell navigation grouping taxonomy.

## Forbidden Patterns Summary

- Tailwind through PostCSS in `apps/web`.
- CSS Modules in Tailwind-owned UI surfaces.
- `tailwindcss-animate` (the v3 JS-config plugin; use `tw-animate-css` instead).
- New `@base-ui/react` primitives in `packages/ui` other than the approved `Combobox` exception.
- Adding speculative primitives to `packages/ui/src/components/ui/` without a concrete reuse case or approved baseline decision.
- A separate `.light` class block that duplicates `:root` tokens.
- Subtraction-based radius formulas (`calc(var(--radius) - Npx)`).
- Mixed color formats (e.g. `hsl()` in `:root` alongside `oklch()`).
- Raw color utilities in ERP UI.
- Mixing semantic and ad-hoc color systems.
- Global mutable singleton UI state outside documented providers/store patterns.

## Non-Goals

This standard does not define:

- One-time migration sequencing (see migration plan).
- Full app shell architecture details (see app shell spec).
- Multi-brand runtime theming system design.
- Server-driven navigation config protocol.
- Visual regression tooling strategy.

## Governance Pipeline

Automated governance scripts enforce the standards above. Run them from the repo root.

### UI drift governance

```sh
pnpm run script:ui-drift-governance
```

Runs three checkers in sequence:

| Layer | Script | Scope | What it catches |
|-------|--------|-------|-----------------|
| **0** | `check-ui-drift.ts` | `packages/ui/`, `packages/shadcn-ui/` | Raw color classes, arbitrary Tailwind values, inline style violations |
| **1** | `check-ui-drift-ast.ts` | `apps/web/src/features/`, `apps/web/src/share/` | Raw Tailwind in feature code, ungoverned element + className combos, local wrapper factories |
| **2** | `check-ui-wrapper-contracts.ts` | `packages/shadcn-ui/src`, `packages/ui/src` | Swallowed props/ref, Radix primitive replacement, `asChild` drift, suspicious local state |

Feature code should use `ui-*` CSS utilities and governed components (`Card`, `Button`, `Badge`, etc.) instead of raw `<div className="flex gap-4 p-6">`. The layer-1 checker recognizes `ui-*` class tokens as governed and does not flag them.

### UI color governance

```sh
pnpm run script:ui-color-governance
```

Validates OKLCH token stem consistency, color variable alignment, and ESLint color rules across governed packages.

### Governed component contracts

Each UI primitive in `packages/shadcn-ui/src/lib/constant/component/<name>.ts` defines a three-part contract:

1. **Vocabularies** -- legal value tuples for each dimension (variant, size, etc.)
2. **Defaults** -- Zod-validated fallback props the `.tsx` file imports
3. **Policy** -- boolean flags controlling what feature code is allowed to extend

When adding a new UI primitive or extending an existing one, update the contract file first, then wire the `.tsx` component to import from it. See [`component/_TEMPLATE.ts`](../packages/shadcn-ui/src/lib/constant/component/_TEMPLATE.ts).

### Adding a new ERP module

See [Architecture: Adding a new ERP module](./ARCHITECTURE.md#4-adding-a-new-erp-module) for the complete step-by-step checklist covering feature folders, routes, semantic adapters, domain constants, action bar hooks, i18n, and validation.

## Quick Compliance Checklist

1. Tailwind plugin is `@tailwindcss/vite`.
2. No `tailwind.config.ts` and no PostCSS Tailwind path.
3. `index.css` follows the eight-step CSS-first architecture (imports, source, variant, tokens, theme, prose, utilities, layers).
4. `index.css` imports `tw-animate-css` and `shadcn/tailwind.css`.
5. Tokens are semantic, in OKLCH, and mapped via `@theme inline`.
6. Radius tokens use multiplication formulas (`calc(var(--radius) * N)`).
7. No `.light` class block -- `:root` is the light default.
8. Generated UI primitives in `packages/ui` use `@afenda/ui/*` aliases; app components use `@/share/*`. No `'use client'` directives.
9. UI code uses semantic classes, not raw color classes.
10. Feature code uses `ui-*` vocabulary and governed components, not raw HTML + Tailwind.
11. `pnpm run script:ui-drift-governance` exits with 0 errors.

## Related Documents

- `docs/ARCHITECTURE.md` (governed UI architecture, dependency flow, adding new modules)
- `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md` (one-time implementation steps)
- `docs/APP_SHELL_SPEC.md` (app shell architecture and decisions)
- `docs/DESIGN_SYSTEM.md`
- `docs/BRAND_GUIDELINES.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/dependencies/tailwind-v4.md`
- `docs/dependencies/shadcn-ui.md`
