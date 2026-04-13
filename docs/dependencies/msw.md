# MSW guide (Afenda)

This document describes **optional** **[MSW (Mock Service Worker)](https://mswjs.io/)** for **HTTP mocking** at the **network boundary** in **Vitest** (Node) and optionally the **browser** / **Storybook**, keeping handlers aligned with [API](../API.md) and [Zod](./zod.md) shapes.

**Status:** **Optional** — add when standardizing mocks. Not in **`apps/web/package.json`** today.

**Official documentation:**

- [mswjs.io](https://mswjs.io/) · [Docs home](https://mswjs.io/docs/)
- [Quick start](https://mswjs.io/docs/quick-start)
- [Node.js / test runners](https://mswjs.io/docs/integrations/node) — Vitest, Jest, **`setupServer`**
- [`setupServer` API](https://mswjs.io/docs/api/setup-server) · [`listen` / lifecycle](https://mswjs.io/docs/api/setup-server/listen)
- [Browser integration](https://mswjs.io/docs/integrations/browser) — **`setupWorker`**, **`worker.start()`**
- [`http` handlers](https://mswjs.io/docs/api/http) · [`HttpResponse`](https://mswjs.io/docs/api/http-response)
- [TypeScript best practices](https://mswjs.io/docs/best-practices/typescript)
- [Structuring handlers](https://mswjs.io/docs/best-practices/structuring-handlers)
- [Best practices](https://mswjs.io/docs/best-practices)
- [MSW on GitHub](https://github.com/mswjs/msw)

**Storybook (optional):** [`msw-storybook-addon`](https://github.com/mswjs/msw-storybook-addon) — wire the same handlers into stories.

---

## When to add MSW

- Integration tests for **loading / error / empty** UI driven by **`fetch`** or your API client, using stable JSON that matches [API](../API.md).
- **Shared handlers** reused by [Vitest](./vitest.md) and [Storybook](./storybook.md).
- Contract tests: handlers as a **living mock** of the backend until **`apps/api`** is available (still validate with **Zod** where possible).

---

## How we use MSW

| Topic | Convention |
| --- | --- |
| **Handlers** | Central module e.g. **`apps/web/test/mocks/handlers.ts`** (or `src/mocks/handlers.ts`) exporting an array of **`http.*`** handlers |
| **Node (Vitest)** | **`setupServer`** from **`msw/node`**; **`server.listen()`** / **`server.resetHandlers()`** / **`server.close()`** via Vitest lifecycle hooks — add lifecycle imports to **[`packages/vitest-config/src/vitest/setup.ts`](../../packages/vitest-config/src/vitest/setup.ts)** (or a file it imports); **`apps/web/vite.config.ts`** keeps **`getAfendaVitestTestOptions()`** so **`setupFiles`** still includes **`@afenda/vitest-config/vitest/setup`** |
| **Browser / Storybook** | **`setupWorker`** from **`msw/browser`**; call **`await worker.start()`** before rendering (often **dev-only** for a Vite SPA — see below) |
| **Contract** | Match **Zod** + [API](../API.md); drift gives **false confidence** |
| **Safety** | **Never** point default handlers at **production** URLs; scope paths to **`/api`** or your test base URL |

### Vitest lifecycle (upstream pattern)

From [Node integration](https://mswjs.io/docs/integrations/node): enable mocking **before** all tests, **reset** handlers **after each** test (drops **`server.use()`** overrides), **close** after the suite.

```typescript
// e.g. apps/web/test/mocks/node.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// e.g. packages/vitest-config/src/vitest/msw.ts (imported from setup.ts)
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/node';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Use **`onUnhandledRequest: 'error'`** (or **`'warn'`** while migrating) so tests do not silently hit the real network ([`server.listen` options](https://mswjs.io/docs/api/setup-server/listen)).

### Handlers (REST example)

```typescript
// apps/web/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/tenants/:tenant/health', ({ params }) => {
    return HttpResponse.json({ ok: true, tenant: params.tenant });
  }),
];
```

Prefer **relative** paths that match how **`fetch`** is called in tests (Vite **`server.proxy`** / **`VITE_API_BASE_URL`**). For **type-safe** handlers, use MSW’s **generics** on **`http.get` / `http.post`** ([TypeScript](https://mswjs.io/docs/best-practices/typescript)).

### Browser worker (Vite SPA, dev-only)

Only if product agrees to ship a **Service Worker** in dev: lazy-load **`worker.start()`** when **`import.meta.env.DEV`** so production builds never register the mock worker ([Browser integration](https://mswjs.io/docs/integrations/browser)). Most ERP flows can stay **Vitest + Node** only.

---

## Red flags

- **Duplicating** response shapes without sharing **Zod** schemas or types with production client code.
- Leaving **`onUnhandledRequest`** at default **`'bypass'`** and not noticing real HTTP calls in CI.
- **One-off** `fetch` mocks per test when a **shared handler** would document the API contract.

---

## Related documentation

- [Testing](../TESTING.md)
- [Vitest](./vitest.md)
- [TanStack Query](./tanstack-query.md)
- [API reference](../API.md)
- [Storybook](./storybook.md)

**External:** [mswjs.io](https://mswjs.io/) · [GitHub — msw](https://github.com/mswjs/msw) · [msw-storybook-addon](https://github.com/mswjs/msw-storybook-addon)

**Context7 library IDs (doc refresh):** `/websites/mswjs_io` · `/mswjs/msw-storybook-addon`
