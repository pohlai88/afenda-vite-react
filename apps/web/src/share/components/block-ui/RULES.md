# Block UI Rules

This folder is for small reusable UI blocks composed from standalone shared
components.

## Purpose

`block-ui` exists as the middle layer between:

- standalone primitives in `shell-ui`, `brand`, and other small component slices
- large shell compositions such as headers, sidebars, navigation, wrappers, and
  layouts

It is the home for reusable composed blocks, not full application structures.

## Boundary Rule

- A block may combine multiple standalone components.
- A block should still represent one clear UI responsibility.
- If a block starts owning page structure, routing structure, or large
  composition logic, it no longer belongs here.

## What Belongs Here

- Title and action rows
- Brand plus title blocks
- Small metadata strips
- Compact shell heading groups
- Reusable composed rows or panels built from shared standalone components
- **`trigger/`** — shell **trigger blocks**: composed controls (e.g. button + icon +
  count badge, `Kbd` hint, dropdown trigger) that open or anchor work done in
  **`navigation/`** (help sheet, resolution popover, truth alerts, command menu, etc.).
  They are blocks, not `shell-ui` primitives.
- **`switch-toggle/`** — theme and scope **switch** blocks: e.g. `ThemeToggle`,
  `ScopeSwitcher` (popover + command list, severity dot). Consumed by **`navigation/`**
  and layouts, not `shell-ui` primitives.

## What Does Not Belong Here

- **Truth-aware navigation rows** (breadcrumb scope strip, action bar, command palette, truth panels) — those belong in **`navigation/`** and consume `shell-ui` + `providers`.
- Full app headers
- Full sidebars
- Mobile navigation
- Footer layouts
- Route wrappers
- Page layouts
- Provider implementations
- Feature-specific blocks that belong in `features/*`

## Anti-Dump Rules

- Do not place anything here just because it combines more than one component.
- Do not move large shell structures here to avoid choosing a better home.
- Do not let `block-ui` absorb navigation policy, auth logic, tenant logic, or
  provider logic.
- Do not build blocks that only have one consumer unless they clearly establish
  an upstream reusable pattern.

## Composition Rule

- `shell-ui` provides standalone pieces.
- `block-ui` may compose those pieces into a reusable block.
- Larger shell structures may consume `block-ui`, but must live elsewhere.

## Size Rule

- Prefer blocks that compose roughly 2 to 5 related pieces.
- If the block starts branching by many variants or controlling many layout
  regions, split it or move it to a higher composition slice.

## Naming Policy

- Files and folders use kebab-case.
- Names should describe the reusable block, not the page where it first appears.
- Public exports should go through `index.ts`.

## Good Examples

- `shell-title-block.tsx`
- `brand-title-block.tsx`
- `page-action-block.tsx`
- `trigger/help-trigger.tsx`, `trigger/command-palette-trigger.tsx`
- `switch-toggle/theme-toggle.tsx`, `switch-toggle/scope-switcher.tsx`

## Bad Examples

- `app-header.tsx`
- `main-sidebar.tsx`
- `dashboard-shell.tsx`
- `route-layout.tsx`
