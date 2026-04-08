# Navigation Rules

This folder is for real navigation structures and navigation-specific UI.

## Purpose

`navigation` owns components that render, coordinate, and compose application
navigation. It sits above standalone `shell-ui` pieces and above `block-ui`
compositions when those pieces become part of an actual navigation structure.

## Folder layout

- **`top-nav/`** — `TopNavBar`, desktop links/menus, `TopActionBar` (+ widget / customise), `TopUserMenu` (+ `top-user-menu-config`).
- **`side-nav/`** — `SideNavBar` (+ `side-nav-group`, `side-nav-item`, `side-nav-user`, `side-nav-secondary`): left application sidebar using canonical shadcn `Sidebar` primitives (icon rail collapse, mobile sheet). Follows shadcn sidebar-07/sidebar-16 block patterns with zero className overrides on primitives. Reuses `nav-catalog/` + `useNavItems()`.
- **`scope-strip/`** — left side of the **top nav row** (horizontal): `NavBreadcrumbBar` (logo / org / subsidiary / module). Not a vertical left sidebar or collapsible rail.
- **`nav-catalog/`** — shared nav **data**: `nav-model`, `nav-config`, `useNavItems` (consumed by top nav, side nav, mobile drawer, command palette).
- **`mobile-nav/`** — `MobileNavDrawer`.
- **`index.ts`** — public barrel; prefer importing from here or `src/share/components`.

## Industry Standard Gate (Supabase / GitHub baseline)

Do not treat a new navigation component as valid unless it meets or exceeds the
patterns used by industry-standard dashboards (Supabase Studio, GitHub).

A production-grade top navbar must provide:

- **truth-aware scope row** (identity graph): logo / org / subsidiary / module crumb with optional severity dots
- route-aware desktop navigation with group dropdowns
- active-state styling (link and group level)
- command palette entry in the bar (opens **`search/CommandPalette`**: Cmd+K / Ctrl+K for navigation **and** truth actions)
- create/new action dropdown (contextual quick-create)
- **truth alert** entry point (integrity / invariant signals), not a generic notification bell
- **resolution** entry point (suggested fixes; optional AI later)
- feedback + help affordances (Supabase-style)
- user menu with unauthenticated fallback, **theme and locale inside the menu** (GitHub-style), optional **truth status** section
- mobile trigger with aria-expanded
- mobile navigation drawer with user summary
- **second row action bar** — module **catalog** via `useActionBar({ scopeKey, tabs })`; user can hide items (prefs store); default shows **all** registered actions.

If the new implementation does not match or exceed those capabilities, do not
pretend it is better. Either keep building the missing upstream pieces or use
the legacy structure.

## What Belongs Here

- top navigation bars (two-row when action bar is used)
- nav group dropdown menus
- nav links and nav item renderers
- (command palette implementation: **`search/`** — navigates to routes; truth groups; theme)
- **trigger-linked overlays** (help, feedback, resolution, truth alerts): use **`block-ui/panel/`**; the navbar composes them like other `block-ui` pieces
- **`scope-strip/nav-breadcrumb-bar`**, **top-action-bar** + **top-action-bar-widget**
- mobile nav drawers
- navigation models, configs, and hooks
- user navigation menus when they are part of the navigation structure

## What Does Not Belong Here

- generic providers
- feature-specific page blocks
- app layout wrappers
- tenant or auth business logic
- generic shell primitives that belong in `shell-ui`
- small composed blocks that belong in `block-ui` (including `block-ui/panel/`, `block-ui/trigger/`, and `block-ui/switch-toggle/`)
- the command menu trigger **block** (belongs in `block-ui/trigger/`, consumed here)

## Required Inputs Before Rebuilding A Navbar

To claim a new navbar meets industry standard, these upstream pieces must exist:

- brand/logo primitives
- shell metadata provider
- standalone shell utilities plus **block-ui** triggers (command, notification,
  create action, help, feedback, resolution, truth alert, mobile nav), **`block-ui/panel/`**
  surfaces paired with those triggers, and **switch-toggle** blocks (theme toggle,
  scope switcher)
- reusable title/brand blocks
- typed navigation model with group support
- permission-filtered nav items hook
- route-aware nav link renderer
- nav group dropdown renderer
- command palette (`search/command-palette`) with nav item search
- mobile navigation drawer with user summary
- user menu with unauthenticated fallback

## Anti-Dump Rules

- Do not turn `navigation` into a bucket for all header or layout code.
- Do not inline every concern into one navbar file.
- Do not keep feature flags, tenant policy, auth policy, routing logic, and
  mobile state tangled in a single component when they can be separated.
- Do not create a new navbar just because it is more generic.

## Better-Than-Legacy Checklist

Before calling the new navbar "better", verify it has:

- desktop navigation parity (with group dropdowns)
- mobile navigation parity (with user summary)
- truth operating parity: scope row, truth alerts, resolution, SAER command groups
- create actions + help + feedback
- command palette (Cmd+K) with truth actions -- exceeds legacy
- user/account menu parity (with unauthenticated fallback); theme/locale in menu
- route active-state parity (link and group level)
- optional Row 2 action bar wired through `ActionBarProvider` at layout level
- cleaner upstream boundaries than the legacy file

## Truth contracts

- Canonical types (`TruthScope`, `TruthStatus`, `TruthHealthSummary`, `TruthResolution`) live in **`@afenda/core/truth`**.
- UI interpretation types (`TruthAlertItem`, `TruthActionBarTab`, `TruthBadge`, selectors) live in **`@afenda/core/truth-ui`**.
- Runtime lists and health surface: **`useTruthScopeStore`**, **`useTruthHealthStore`** in `share/client-store` (Zustand).
- Do not merge truth and truth-ui folders in the app layer; import from the correct export path.

## Naming Policy

- Files and folders use kebab-case.
- Public exports go through `index.ts`.
- Navigation pieces should be named by responsibility, not by page.
