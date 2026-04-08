# Layout Rules

## Purpose

`layout` owns **route-level shell wrappers** that stitch together navigation
chrome and the routed outlet. It is not a dumping ground for feature UI.

## What Belongs Here

- ERP / app layouts that render `TopNavBar`, sidebars (when added), and
  `<Outlet />` or `children`
- First-class shell regions such as `SideNavBar`, `TopNavBar`, and
  `ErpContentArea`
- Thin composition only: import from `navigation/`, `providers/`, `block-ui/`

## Required providers (ERP)

When using `TopNavBar` with Row 2 `TopActionBar`, the subtree **must** include
`ActionBarProvider` so `useActionBarContext()` is valid.

`ShellMetadataProvider` should wrap the same subtree when pages use
`useShellMetadata` / `ShellTitle` / `ShellActionSlot`.

`GlobalSearchProvider` should wrap the same ERP subtree when `TopNavBar` uses
`useGlobalSearch()` (command palette + shared search state).

## What Does Not Belong Here

- Navigation primitives (use `shell-ui` / `navigation/`)
- Truth contracts or Zustand stores (use `@afenda/core`, `share/client-store`)
- Feature pages or domain forms
- New page-era global selectors (`.page`, `.dashboard-*`, `.placeholder`) in `apps/web/src/index.css`

## Approved UI Vocabulary

Layout compositions in this slice should consume the canonical app vocabulary first:

- `ui-page`, `ui-section`, `ui-card-grid`
- `ui-header`, `ui-proof-header`
- `ui-stack-tight`, `ui-stack`, `ui-stack-relaxed`
- `ui-surface`, `ui-surface-raised`, `ui-surface-hero`, `ui-empty-state`
- `ui-title*`, `ui-lede`, `ui-copy`, `ui-fine`
- `heading-*`, `text-*`

If a new layout pattern cannot be expressed with those selectors, prefer a shared React component over introducing another permanent global selector.

## Naming

- kebab-case files; export public API through `index.ts`.

## Three-Region ERP Shell

- `SideNavBar` owns the left application chrome and sidebar footer controls
- `TopNavBar` owns the top chrome inside `SidebarInset`
- `ErpContentArea` owns routed content scrolling, container queries, and
  optional split-view composition
