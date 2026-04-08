# AGENTS.md - @afenda/radix-ui-themes

Canonical design system package for Afenda.

This package is not a thin wrapper around upstream docs. It owns the truth
layer for Afenda UI:

- Radix Primitives for behavior (`@radix-ui/react-*`)
- Tailwind v4 + CVA for styling
- `@radix-ui/themes` Theme provider for CSS variable shell
- Afenda token maps (OKLCH-based semantics from `docs/DESIGN_SYSTEM.md`)

Deprecated packages (`@afenda/ui`, `@afenda/design-system`) are reference only.
Do not treat them as source of truth.

## Authority

Follow these docs before coding:

- `docs/DESIGN_SYSTEM.md` (token intent and visual language)
- `docs/COMPONENTS_AND_STYLING.md` (Tailwind/shadcn standards)
- `docs/PROJECT_STRUCTURE.md` (workspace boundaries)

If guidance conflicts, prefer the three docs above and this file.

## Package Responsibilities

1. Export reusable UI components from `src/components/ui/*`.
2. Export helpers and utilities (`cn`, responsive utilities).
3. Maintain typed token definitions in `src/styles/tokens/*`.
4. Maintain runtime class maps in `src/lib/theme/defaultTheme.ts`.
5. Keep `AfendaTheme` provider for app-level theme context.

## Architecture Rules

### Components

- Build with Radix Primitives, not pre-styled `@radix-ui/themes` components.
- Use `asChild` when composition requires polymorphic rendering.
- Use CVA for variants and sizes.
- Use `cn()` for class merging (`clsx` + `tailwind-merge`).
- Use `data-[state=*]` variants for state-driven styling and animation.
- Prefer React 19 ref-as-prop patterns; avoid unnecessary `forwardRef`.

### Tokens

- Token source is design docs, not legacy package snapshots.
- Keep domain and status semantics explicit (`finance`, `inventory`, `success`).
- Keep OKLCH values in token files where applicable.
- Never hardcode random hex in component files.

### Accessibility

Each component must satisfy:

- Keyboard navigation support
- Visible focus styles
- Correct ARIA labels/roles
- State announcements where needed
- WCAG AA contrast thresholds

### Build and CSS

- Tailwind integration is via `@tailwindcss/vite` at app level.
- Do not introduce PostCSS-only Tailwind pipelines here.
- Keep generated/token artifacts deterministic and script-driven.

## File Conventions

- `src/components/ui/<name>.tsx` - component implementation
- `src/lib/utils/cn.ts` - canonical class merge utility
- `src/lib/theme/defaultTheme.ts` - runtime class map
- `src/styles/tokens/*.ts` - token modules
- `src/helpers/*.ts` - generic helpers (responsive, margin extraction)

## Guardrails

- Do not copy entire deprecated component files verbatim.
- Do not introduce global mutable runtime singletons.
- Do not remove accessibility primitives for visual convenience.
- Do not make style decisions outside token semantics.

## Validation Checklist

Run package-level checks after substantial edits:

- `pnpm --filter @afenda/radix-ui-themes typecheck`
- `pnpm --filter @afenda/radix-ui-themes lint`
- `pnpm --filter @afenda/radix-ui-themes format:check`

When component exports change, also run app checks:

- `pnpm --filter @afenda/web typecheck`
- `pnpm --filter @afenda/web lint`

## Contributor Intent

The goal is a truthful, coherent design layer for ERP workflows.
Prioritize consistency, accessibility, and deterministic behavior over
rapid copy-paste expansion.
