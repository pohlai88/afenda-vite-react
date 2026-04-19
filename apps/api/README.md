# @afenda/api

**Hono** on Node (`@hono/node-server`) — thin HTTP edge, middleware pipeline, route modules.

## Target stack (Afenda)

This package follows an **API-first** layout: modular routes, thin transport, strong typing into the Vite client.

| Layer            | Choice                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Frontend**     | Vite + React (`@afenda/web`) — normal SPA; dev proxy to this API                             |
| **Backend**      | Hono + `@hono/node-server`                                                                   |
| **Validation**   | Zod + `@hono/zod-validator`                                                                  |
| **Typed client** | `hono/client` `hc<AppType>()` (types exported from `@afenda/api/app` after `pnpm run build`) |
| **Runtime**      | Node.js (see `package.json` `engines`)                                                       |

This stack stays **simpler to reason about and debug** than a heavier traditional backend: clear process boundary (Vite dev server vs API), Hono’s middleware model, Node adapter, and RPC-style typing flow match Hono’s documented API use cases.

## Production hardening (after baseline)

Add these **in order** once the baseline routes, errors, and client typing are stable.

### Phase 1

1. **Request timing metrics** — latency and status per route (observability hooks).
2. **Structured logger bridge** — production JSON logs (e.g. Pino) aligned with request IDs.
3. **Auth middleware** — verify sessions or tokens before protected routes.
4. **Cookie / session strategy** — explicit SameSite, secure, and domain policy for the SPA + API hosts.
5. **RFC 9457 Problem Details** — standardize error bodies (`application/problem+json`) alongside or instead of the current `{ ok, error }` JSON envelope where appropriate.

### Phase 2

1. **Rate limiting** — per IP / key / route (Hono middleware or edge).
2. **Idempotency** — safe retries for mutating endpoints (third-party or custom middleware).
3. **ETag** — for read-heavy endpoints (Hono provides ETag helpers; cache validators).
4. **OpenAPI** — only if **external** clients need formal contracts; internal `hc` typing often suffices.

Hono’s ecosystem includes **logger**, **ETag**, **middleware** primitives, and community packages for concerns like **idempotency**; pick pieces that fit your deployment (Node vs serverless).

## Scaffold (current)

This tree was **replaced** from a full implementation. The previous **`apps/api`** (Better Auth, DB, studio, audit, etc.) is archived at:

**[`archives/apps-api-backup-2026-04-19/`](../archives/apps-api-backup-2026-04-19/)** (config + `src` + `scripts`; `node_modules` / `dist` not included).

### Layout

- `src/index.ts` — `serve`, env load
- `src/app.ts` — `createApp()`, middleware, route mounting (`/health`, `/api/*`)
- `src/routes/` — `health`, `auth` (placeholder), `users`, `index` mounts sub-apps
- `src/middleware/` — `logger` (via `hono/logger` in `app.ts`), `request-context`, `error-handler`
- `src/lib/` — `env`, `errors`, `response` helpers
- `src/modules/` — feature folders (e.g. `users/` schema + service)

### Run

```bash
pnpm --filter @afenda/api dev
```

Default port **8787** when `PORT` is unset (`index.ts` uses `process.env.PORT ?? 8787`). **`apps/web`** dev proxy targets **`http://localhost:8787`** by default (`VITE_API_URL` overrides). Graceful shutdown: `server.close()` on `SIGINT` / `SIGTERM` ([`@hono/node-server`](https://github.com/honojs/node-server)).

### Endpoints (scaffold)

- `GET /` and `GET /health` — liveness JSON via `success()` (`ok`, `data.service`, `data.status`, `data.now`, `data.uptimeSeconds`)
- `GET /api/users`, `POST /api/users` — in-memory users; `POST` returns **201** with `success(user)`; invalid JSON body → **400** (default `@hono/zod-validator` response)
- `GET /api/auth/session` — placeholder (`success()`; `authenticated` / `user`) until Better Auth is wired again

## Typed client (web)

The Vite app imports **`AppType`** from **`@afenda/api/app`** (build the API first so `dist/*.d.ts` exists). See **`src/api-client/client.ts`** in `@afenda/web`. Frontend and API stay **separate processes**; no Hono-in-Vite plugin is required for this layout.

## File envelope

See repo-root [`ENVELOPE.md`](../../ENVELOPE.md).
