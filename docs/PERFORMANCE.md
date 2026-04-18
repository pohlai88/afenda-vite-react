# Performance

Guidance for the **`apps/web`** **Vite + React** ERP client and related **server** work. Prefer **measurement** (Lighthouse, React Profiler, bundle analysis, database `EXPLAIN`) over guessing.

**Afenda is a client-rendered SPA**—there are **no** React Server Components. All UI JavaScript ships to the browser unless you **lazy-load** routes or components. Data fetching is optimized with [**TanStack Query**](https://tanstack.com/query) (already in `apps/web`); heavy work belongs on the **API** and **database** ([Architecture](./ARCHITECTURE.md)).

---

## 1. Client bundle and “server-first” in a Vite SPA

In Next.js, “Server Components first” reduces client JS. Here, the equivalent habits are:

| Goal                                          | Vite / React approach                                                                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Less JS on first paint                        | **Route-level** code splitting ([`React.lazy`](https://react.dev/reference/react/lazy) + [`Suspense`](https://react.dev/reference/react/Suspense)), trim unused dependencies |
| Data without duplicating cache in React state | **TanStack Query** for server state ([State management](./STATE_MANAGEMENT.md))                                                                                              |
| Work that must stay private or heavy          | **API** + database—not in the bundle                                                                                                                                         |

Do **not** add `'use client'`—that is a Next.js convention. In Vite, components are client components by default; split files when a subtree should load later.

```tsx
// Lazy route module — good for large ERP screens
const FinancePage = lazy(() => import('./pages/FinancePage'))

// In router setup
<Suspense fallback={<PageSkeleton />}>
  <FinancePage />
</Suspense>
```

---

## 2. Code splitting

Code splitting breaks production JS into **smaller chunks** so users download only what they need; unused code loads **when required**.

- **Routes:** Prefer splitting at **route** boundaries—usually the best cost/benefit for ERP (each module can be large).
- **Heavy widgets:** Use dynamic `import()` for charts, editors, or secondary dialogs when profiling shows a win.
- **Avoid over-splitting:** More chunks ⇒ more HTTP requests and scheduling overhead—**measure** (Vite/Rollup output, network waterfall).

**Vite** emits chunks from dynamic `import()`; keep route entries lean so the **initial** graph stays small.

---

## 3. Components and state

- **Avoid one giant store.** Broad updates cause broad re-renders. Prefer **focused** stores or slices ([**Zustand**](https://github.com/pmndrs/zustand) is used in this repo for client-only state).
- **Colocate state** with the subtree that consumes it ([Components and styling](./COMPONENTS_AND_STYLING.md)).
- **Expensive initial state** — use the **lazy initializer** for `useState` so work runs once:

```tsx
import { useState } from "react"

// Avoid: expensive() runs on every render path that invokes useState setup
// useState(expensive())

// Prefer: runs only on initial mount
const [state, setState] = useState(() => expensive())
```

- **Many fine-grained atoms:** If profiling shows store churn, consider **atomic** libraries ([Jotai](https://jotai.org/), [Recoil](https://recoiljs.org/))—only if complexity justifies it.
- **Server / cache data:** Use **TanStack Query** for lists, details, invalidation, and retries—avoid mirroring the whole API in global React state.

### Styling cost

Runtime CSS-in-JS can add measurable cost on hot paths. Prefer **build-time** styling ([Tailwind CSS](https://tailwindcss.com/), CSS Modules, Vanilla Extract) when you standardize ([Components and styling](./COMPONENTS_AND_STYLING.md)). This repo currently uses **global / component CSS** in places—profile before adding heavy runtime style libraries.

---

## 4. Lists and tables (ERP)

Large grids and ledger lines need deliberate patterns:

- **Virtualize** long lists (e.g. `react-window`, TanStack Table + virtualization) when rows exceed a few hundred visible.
- **Paginate** on the server; align **page size** with UX (50–200 rows is common).
- **Stable keys** and **memoized row components** when profiling shows unnecessary reconciliation.

---

## 5. Database performance (API / workers)

Client performance depends on **fast APIs**. For PostgreSQL + [**Drizzle**](https://orm.drizzle.team/) ([Database package](../packages/_database/README.md)):

- **Indexes** on foreign keys, `tenant_id`, status columns, and common filters (dates, document numbers).
- **Pagination** — `limit` / `offset` or keyset pagination for deep lists; avoid unbounded `findMany`.
- **pgvector** — For embedding search, use **HNSW** (or ivfflat) indexes per [pgvector](https://github.com/pgvector/pgvector) guidance; tune `m` / `ef_construction` for your data size.
- **Explain** slow queries in staging; fix N+1 patterns (batching, joins, DataLoader-style loaders on the API).

```typescript
// Illustrative — paginated query
const rows = await db.query.invoices.findMany({
  limit: pageSize,
  offset: page * pageSize,
  orderBy: [desc(invoices.postedAt)],
})
```

---

## 6. Images

- **Lazy-load** below-the-fold images (`loading="lazy"`, or intersection observers for older patterns).
- Prefer **WebP** / **AVIF** with fallbacks when asset pipelines allow.
- Use **`srcset`** and `sizes` so small viewports do not download huge bitmaps.

---

## 7. Web Vitals and monitoring

[Core Web Vitals](https://web.dev/vitals/) (LCP, INP, CLS) affect UX and SEO. Use:

- [**Lighthouse**](https://developer.chrome.com/docs/lighthouse/overview/) (DevTools or CI)
- [**PageSpeed Insights**](https://pagespeed.web.dev/)
- [**web-vitals**](https://github.com/GoogleChrome/web-vitals) or your analytics pipeline for **RUM** in production

ERP users often stay in-session—investigate **INP** (interaction latency) on heavy screens, not only first load.

---

## Related docs

- [Architecture](./ARCHITECTURE.md) — SPA vs API vs database
- [State management](./STATE_MANAGEMENT.md) — Query vs Zustand vs local state
- [Database package](../packages/_database/README.md) — indexes, Drizzle, pgvector
- [Components and styling](./COMPONENTS_AND_STYLING.md) — colocation, stacks
- [Project structure](./PROJECT_STRUCTURE.md)
- [Testing](./TESTING.md) — Vitest + RTL patterns
- [Project configuration](./PROJECT_CONFIGURATION.md)
