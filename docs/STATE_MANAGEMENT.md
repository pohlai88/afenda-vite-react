---
owner: web-runtime-shell
truthStatus: canonical
docClass: canonical-doc
relatedDomain: state-management
---

# 🗃️ State management

This document is the operating guide for [`ADR-0005: Zustand client UI store adoption`](./architecture/adr/ADR-0005-zustand-client-ui-store-adoption.md).
`ADR-0005` is the decision record for when Zustand is allowed and when it should still be deferred.
This page explains the day-to-day state ownership model for `apps/web`.

## Decision anchor

- [`docs/architecture/adr/ADR-0005-zustand-client-ui-store-adoption.md`](./architecture/adr/ADR-0005-zustand-client-ui-store-adoption.md)

**Afenda (`apps/web`)** is a **Vite + React SPA**—there are **no React Server Components**. You still **do not need a single centralized store**: combine **local React state**, **Context** where a subtree truly shares data, **TanStack Query** for server-backed cache, optional **Zustand** for cross-cutting UI state when the trigger conditions are met, and **React Hook Form + Zod** for forms.

| Kind of state            | Typical tools in this repo                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Component**            | `useState`, `useReducer`; lift only when needed                                                         |
| **Application (client)** | Keep local first; **Zustand** for shared UI (modals, layout prefs). Alternatives: **Jotai**, **Recoil** |
| **Server / cache**       | **TanStack Query** (`@tanstack/react-query`) — fetching, cache, invalidation                            |
| **Forms**                | **React Hook Form** + **Zod** + `@hookform/resolvers`                                                   |
| **Tenant / shell**       | **React Context** (e.g. current tenant from route or session)                                           |
| **Auth (UX)**            | Hook backed by Auth0 SPA or BFF session — see [Authentication](./AUTHENTICATION.md)                     |

Versions: **`apps/web/package.json`**.

**Principle:** Keep state **as close as possible** to the components that use it. Do not make everything global by default.

---

## 1. Remote data (no RSC — use the API + Query)

In a SPA, “server state” means **JSON from your API** (or BFF), not `async` React components that query the DB.

- Prefer **TanStack Query** (`useQuery` / `useMutation`) so caching, retries, and invalidation stay consistent.
- Call your REST/tRPC/etc. endpoints; **never** put database clients in **`apps/web`** (see [Database package](../packages/_database/README.md)).

```tsx
// Illustrative — feature hook or route-level component
import { useQuery } from "@tanstack/react-query"

function TenantDashboard({ tenantId }: { tenantId: string }) {
  const { data, isPending, error } = useQuery({
    queryKey: ["dashboard", tenantId],
    queryFn: () =>
      fetch("/api/v1/ops/events-workspace", {
        headers: { "X-Tenant-Id": tenantId },
      }).then((r) => r.json()),
  })

  if (isPending) return <Spinner />
  if (error) return <ErrorBanner />

  return <SummaryCards data={data} />
}
```

For **initial HTML** with data in the future, you could add SSR or a document shell elsewhere—today **`apps/web`** is client-rendered only.

---

## 2. Component state

State that **only one subtree** needs. Pass it to children via **props** when appropriate. **Start here**, then **lift** only when a sibling or ancestor must share it.

- [**useState**](https://react.dev/reference/react/useState) — simple, independent values.
- [**useReducer**](https://react.dev/reference/react/useReducer) — several fields change from one action, or clearer as a reducer.

---

## 3. Application (client) state

Controls **interactive** behavior: open modals, side panels, theme, wizard steps, UI flags—not necessarily persisted server data.

- Prefer **colocated** state (parent or small subtree) before a global store.
- **This repo:** [**Zustand**](https://github.com/pmndrs/zustand) is a good default (small API, TypeScript-friendly, multiple small stores). Shared SPA stores (shell, truth demo, action-bar prefs) live in **`apps/web/src/share/client-store/`** — not React `useState` hooks (those stay in components or **`share/react-hooks/`** for reusable DOM/media logic). **Naming:** follow [`docs/architecture/governance/NAMING_CONVENTION.md`](../architecture/governance/NAMING_CONVENTION.md). Zustand subscriber hooks are **`useXxxStore`**; generic React hooks in **`react-hooks/`** are **`useXxx`** without the `Store` suffix (both use `use` because both are hooks — see `apps/web/src/share/client-store/RULES.md` and `react-hooks/RULES.md`). **Filenames:** store modules should converge on **`<subject>.store.ts`**; **`react-hooks/`** files stay **`use-*.ts`**. **Exports** keep the `use` prefix and remain canonical to the hook subject.
- **Alternatives:** [**Jotai**](https://github.com/pmndrs/jotai), [**Recoil**](https://recoiljs.org/) — pick **one** pattern per area and stay consistent ([Project structure](./PROJECT_STRUCTURE.md)).

---

## 4. Server cache state

Remote data you **reuse**, **invalidate**, and **refresh** belongs in **TanStack Query**, not in a hand-rolled Redux/Zustand mirror.

- Shared **`QueryClient`** defaults (stale time, retry policy) live in **`apps/web/src/share/query/`**; React wiring is **`QueryProvider`** in **`share/components/providers/`** — not HTTP services (`queryFn` / API modules stay in features or `share/api`).

- Use **query keys** that reflect tenant + resource identity.
- Use **`queryClient.invalidateQueries`** after mutations.
- DevTools: `@tanstack/react-query-devtools` (optional, dev-only).

Avoid duplicating the same fetch in both a global store and Query unless you have a documented reason.

---

## 5. Form state

Tracks user input and validation.

- Browsers support [**controlled**](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable) and [**uncontrolled**](https://react.dev/reference/react-dom/components/input#reading-the-input-value-when-submitting-the-form) inputs.
- For non-trivial forms, use [**React Hook Form**](https://react-hook-form.com/) with [**Zod**](https://zod.dev/) and [`zodResolver`](https://github.com/react-hook-form/resolvers):

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('name')} />
      <input {...register('email')} />
      <button type="submit" disabled={formState.isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

Shadcn **`<Form>`** field components pair with the same resolver pattern — see [shadcn/ui](./dependencies/shadcn-ui.md).

---

## 6. Context state (multi-tenancy)

Use **React Context** for values many components need **without** prop drilling—e.g. **current tenant**, locale, or feature flags resolved once per route or session.

```typescript
// Illustrative — colocate under e.g. apps/web/src/features/tenant/ or contexts/
import { createContext, useContext } from 'react';

type TenantContextValue = { tenantId: string; tenantName: string };

const TenantContext = createContext<TenantContextValue | null>(null);

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

// Usage
function MyComponent() {
  const { tenantName } = useTenant();
  return <span>{tenantName}</span>;
}
```

**Authorization** for ERP data still happens on the **API** ([Roles and permissions](./ROLES_AND_PERMISSIONS.md)); context is for **UX**, not security.

---

## 7. Auth state (session / identity)

The SPA should use a **single app-facing hook** (e.g. `useAuth`) implemented with [**Auth0 React**](https://github.com/auth0/auth0-react) or **`fetch('/api/session')`** on a BFF—not `next-auth/react`.

```typescript
// Illustrative — align with apps/web/src/features/auth when implemented
import { useAuth } from "@/features/auth"

function Toolbar() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  // ...
}
```

Details: [Authentication](./AUTHENTICATION.md).

---

## Related docs

- [Testing](./TESTING.md) — Vitest + RTL, MSW, providers
- [Authentication](./AUTHENTICATION.md) — BFF, Auth0, route guards
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) — permission keys vs UI
- [Project structure](./PROJECT_STRUCTURE.md) — feature folders, where providers live
- [Performance](./PERFORMANCE.md) — colocated state and render cost
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [shadcn/ui](./dependencies/shadcn-ui.md) — RHF + Zod + Form components
