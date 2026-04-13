# API client (`_platform/api-client`)

Cross-feature **browser HTTP client** for the Vite SPA (typed fetch, env base URL, timeouts). This folder is **not** the Node HTTP server; that lives in **`apps/api`** (`@afenda/api`). See [App Platform README](../README.md#http-surfaces-afenda).

## Naming (mandatory)

Everything in this directory must read as **client** — not generic “API” (server lives in `apps/api`).

| Convention      | Examples                                                                           |
| --------------- | ---------------------------------------------------------------------------------- |
| Files / folders | `api-client-*`, `use-api-client.ts`, `api-client-types.ts`, `api-client-policy.ts` |
| Types           | `ApiClient`, `ApiClientConfig`, `ApiClientHttpError`, `ApiClientRequestOptions`    |
| Values          | `apiClientCapabilityContract`, `joinApiClientUrl`, `apiClientEnvKeys`              |
| Capability id   | **`api-client`** (`apiClientCapabilityContract.id`)                                |

**Naming verification**

| Surface                          | Path / package                          | Capability id                        |
| -------------------------------- | --------------------------------------- | ------------------------------------ |
| **Browser client** (this README) | `apps/web/src/app/_platform/api-client` | **`api-client`**                     |
| **Server HTTP**                  | `apps/api` (`@afenda/api`)              | Not applicable — use `apps/api` docs |

Do not use a bare **`api`** capability id here; it collides with **`apps/api`** (server).

Same-origin `/api/...` calls in development (via Vite `server.proxy`), optional `VITE_API_BASE_URL` for explicit backends, JSON request/response defaults, and timeouts.

Domain-specific calls (finance, inventory, …) should live in **`_features/<name>/services`** and use this client or TanStack Query wrappers—not ad hoc `fetch` scattered across features.

## Environment

| Variable            | Purpose                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Optional. Empty = same origin, paths like `/api/tenants/...`. Set to a same-origin path such as `/api/v1` or an absolute `http(s)` URL when the API is not proxied. Protocol-relative URLs are rejected. |
| `VITE_API_TIMEOUT`  | Optional. Default request timeout in ms (clamped). Falls back to 30s when unset.                                                                                                                         |

Never put secrets in `VITE_*` variables; they are exposed to the browser. See [Vite env docs](https://vitejs.dev/guide/env-and-mode.html).

## Public API

- `createApiClient(config)` — construct an isolated client (tests, Storybook).
- `getSharedApiClient()` — lazy singleton from `resolveApiClientConfigFromEnv()`.
- `resolveApiClientConfigFromEnv()` — reads `import.meta.env`.
- `useApiClient()` — stable hook around `getSharedApiClient()`.
- `ApiClientBoundary` — optional shell wrapper (sets `data-api-base` for debugging).
- `ApiClientHttpError` — thrown on non-OK HTTP status with parsed body when possible.

JSON object and array bodies are serialized automatically. Native `BodyInit` values such as `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, and streams pass through without a forced JSON `Content-Type`.

## Feature usage

```ts
import { useApiClient } from "@/app/_platform/api-client"

function useTenantProfile(tenant: string) {
  const api = useApiClient()
  return api.get<{ profile: { id: string } }>(`/api/tenants/${tenant}/profile`)
}
```

Prefer **TanStack Query** (`_platform` `server-state` when added) for caching, retries, and deduplication; use `useApiClient()` inside `queryFn` or inject `getSharedApiClient()`.

## Dependency direction

- `_features/*` may import from `@/app/_platform/api-client` public exports only (or the `@/app/_platform` barrel).
- `_platform/api-client` must not import `_features/*` internals (see `policy/api-client-policy.ts`).

## Layout

Matches `_template`: `adapters/` (fetch + timeout), `services/` (`api-client-service.ts`), `policy/` (`api-client-policy.ts`), `types/` (`api-client-types.ts`), `hooks/`, `components/`, `utils/` (`api-client-utils.ts`), `scripts/` (`api-client-capability-report.ts`), `__tests__/` (`api-client-policy.test.ts`).
