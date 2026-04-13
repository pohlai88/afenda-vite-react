# API client (`_platform/api`)

Cross-feature **HTTP client** for the Vite SPA: same-origin `/api/...` calls in development (via Vite `server.proxy`), optional `VITE_API_BASE_URL` for explicit backends, JSON request/response defaults, and timeouts.

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
- `ApiHttpError` — thrown on non-OK HTTP status with parsed body when possible.

JSON object and array bodies are serialized automatically. Native `BodyInit` values such as `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, and streams pass through without a forced JSON `Content-Type`.

## Feature usage

```ts
import { useApiClient } from "@/app/_platform/api"

function useTenantProfile(tenant: string) {
  const api = useApiClient()
  return api.get<{ profile: { id: string } }>(`/api/tenants/${tenant}/profile`)
}
```

Prefer **TanStack Query** (`_platform` `server-state` when added) for caching, retries, and deduplication; use `useApiClient()` inside `queryFn` or inject `getSharedApiClient()`.

## Dependency direction

- `_features/*` may import from `@/app/_platform/api` public exports only.
- `_platform/api` must not import `_features/*` internals (see `api-policy.ts`).

## Layout

Matches `_template`: `adapters/` (fetch + timeout), `services/` (client factory), `policy/`, `types/`, `hooks/`, `components/`, `utils/`, `scripts/`, `__tests__/`.
