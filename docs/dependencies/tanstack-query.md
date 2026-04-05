# TanStack Query guide (Afenda)

This document describes how **`apps/web`** uses **[TanStack Query](https://tanstack.com/query/latest)** for **server state**: HTTP caching, mutations, and error/loading metadata against the **[API](../API.md)**.

**Status:** **Adopted** in **`apps/web`** (`@tanstack/react-query`; devtools package for local debugging).

**Official documentation:**

- [TanStack Query](https://tanstack.com/query/latest)
- [React — overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [Query invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [Query keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query on GitHub](https://github.com/TanStack/query)

---

## How we use TanStack Query

| Topic | Convention |
| --- | --- |
| **Transport** | `fetch` or a thin client to **`/api/...`** (Vite [proxy](./vite.md)); follow [API](../API.md) |
| **Keys** | **Stable, hierarchical** keys; include **tenant slug** when data is tenant-scoped |
| **Mutations** | **`invalidateQueries`** / **`setQueryData`** after writes; use **optimistic** updates only when ERP rules allow |
| **Errors** | Map [API](../API.md) error envelope to UI; do not rely on raw English strings |

---

## Commands / setup

`QueryClientProvider` wraps the app (see `apps/web` entry). Devtools are **dev-only** — do not ship to production bundles without tree-shaking guards.

---

## Red flags

- Using Query as **global client state** for non-server data (prefer [Zustand](./zustand.md) or local state).
- **Unstable keys** (e.g. object references) causing cache churn.

---

## Related documentation

- [React](./react.md)
- [State management](../STATE_MANAGEMENT.md)
- [API reference](../API.md)
- [MSW](./msw.md) — optional API mocking in tests

**External:** [tanstack.com/query](https://tanstack.com/query/latest) · [GitHub](https://github.com/TanStack/query)
