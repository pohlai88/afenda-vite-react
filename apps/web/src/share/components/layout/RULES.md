# Layout Rules

## Purpose

`layout` owns **route-level shell wrappers** that stitch together navigation
chrome and the routed outlet. It is not a dumping ground for feature UI.

## What Belongs Here

- ERP / app layouts that render `TopNavBar`, sidebars (when added), and
  `<Outlet />` or `children`
- Thin composition only: import from `navigation/`, `providers/`, `block-ui/`

## Required providers (ERP)

When using `TopNavBar` with Row 2 `ActionBar`, the subtree **must** include
`ActionBarProvider` so `useActionBarContext()` is valid.

`ShellMetadataProvider` should wrap the same subtree when pages use
`useShellMetadata` / `ShellTitle` / `ShellActionSlot`.

`GlobalSearchProvider` should wrap the same ERP subtree when `TopNavBar` uses
`useGlobalSearch()` (command palette + shared search state).

## What Does Not Belong Here

- Navigation primitives (use `shell-ui` / `navigation/`)
- Truth contracts or Zustand stores (use `@afenda/core`, `share/state`)
- Feature pages or domain forms

## Naming

- kebab-case files; export public API through `index.ts`.
