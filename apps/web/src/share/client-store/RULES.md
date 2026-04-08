# Client store rules

## What lives here

**Zustand** stores and **store-adjacent** modules (storage keys, demo seed data). Hooks that only exist to **subscribe to stores** or **sync store context** may live here so they stay next to the stores they depend on.

## How `use` relates to state (Zustand vs React)

React requires hook functions to start with **`use`**. Zustand’s `create()` API also exposes a hook-shaped subscriber. So **both** kinds can look like `useSomething()` — you tell them apart by **naming**, not by dropping `use`.

| Kind                                                       | Naming convention                               | Example                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| **Zustand store subscriber**                               | **`use` + `PascalCase` + `Store`**              | `useAppShellStore`, `useTruthScopeStore`, `useActionBarPrefsStore`           |
| **React-only hook** (composition / effects, no `create()`) | **`use` + `PascalCase`**, **no `Store` suffix** | `useTruthNavProps`, `useSyncActionBarPrefsContext`, `useTruthShellBootstrap` |

**Rule of thumb:** If it ends with **`Store`**, it is the Zustand hook from that module. If it is `use*` **without** `Store`, it is ordinary React hook logic (even if it reads Zustand inside).

## What does not belong here

- Reusable **DOM / keyboard / viewport** hooks with no store ownership → `share/react-hooks/`.
- **Server / cache** state → TanStack Query (and API layers), not Zustand.

## File names

- **Do not** prefix files with `use-` (that is reserved for `share/react-hooks/`).
- Zustand modules: **`*-store.ts`** (e.g. `app-shell-store.ts`, `truth-scope-store.ts`).
- Bridge / effect hooks colocated with stores: **descriptive kebab** without `use-` (e.g. `truth-nav-props.ts`, `sync-action-bar-prefs-context.ts`).
- **Exports** still use `use*` (`useAppShellStore`, `useTruthNavProps`, …) per the table above.
- Prefer `@/share/client-store` barrel imports unless breaking a circular dependency.
