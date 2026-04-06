# Provider Rules

This folder is the canonical provider layer for shared UI components under
`apps/web/src/share/components`.

## Purpose

Providers in this folder exist to expose small, focused context boundaries that
shared components can consume without prop drilling.

## Scope Rules

- One provider should own one concern only.
- A provider may define its own types, context, hooks, and barrel exports.
- A provider may compose React state and effects needed for that concern.
- A provider should stay UI-facing and component-oriented.

## What Belongs Here

- Shell metadata provider (`ShellMetadataProvider`)
- **Action bar provider** (`ActionBarProvider`) — registers Row 2 module tabs (`TruthActionBarTab`) via `useActionBar()`
- **Global search provider** (`GlobalSearchProvider`) — command palette open state, `globalQuery`, recent **text** searches, recent **palette command** ids, pinned palette command ids (localStorage), client-side result cache (`useGlobalSearch` / `useGlobalSearchOptional`)
- Theme provider
- Sidebar visibility provider
- View mode provider
- Other small component-facing providers with a clear single purpose

## What Does Not Belong Here

- API services or fetch clients
- Authentication business logic
- Tenant resolution or multi-tenant policy
- Route definitions
- Global app state that belongs in `share/state`
- Large composition roots that mix unrelated concerns

## Anti-Dump Rules

- Do not create a catch-all `ShellProvider` or `AppProvider` that owns many
  unrelated concerns.
- Do not add auth, tenant, theme, and shell metadata into one provider.
- Do not let providers import each other casually; compose them deliberately in
  a separate boundary when needed.
- Do not store server-state cache or API orchestration logic in providers.

## Layout composition

- ERP layout (`share/components/layout`) should wrap shell chrome with **`ActionBarProvider`** whenever `ActionBar` / `TopNavBar` Row 2 is used, so `useActionBarContext()` is defined.
- **`ShellMetadataProvider`** may wrap the same subtree so route views can call `useShellMetadata` without duplicating providers per page.
- **`GlobalSearchProvider`** should wrap the same ERP shell subtree when `TopNavBar` uses `useGlobalSearch()` (command palette + shared search state).

## Growth Policy

Add a new provider only when:

- multiple downstream components need the same transient UI context, and
- prop drilling would make the UI harder to maintain, and
- the concern does not already belong in `share/state`

If a provider starts to own more than one concern, split it before adding new
features.

## Naming Policy

- Files and folders use kebab-case.
- Provider files should end with `-provider.tsx` when they export a provider.
- Provider type files should end with `.types.ts`.
- Public exports should go through `index.ts`.
