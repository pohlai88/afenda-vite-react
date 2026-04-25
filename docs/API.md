---
owner: api-ops-auth
truthStatus: canonical
docClass: canonical-doc
relatedDomain: api-contract
---

# API reference

This document is the narrative contract for Afenda's live HTTP API.

- **Runtime source of truth:** [`apps/api/src/app.ts`](../apps/api/src/app.ts)
- **Generated route inventory:** [`docs/architecture/governance/generated/api-route-surface.md`](./architecture/governance/generated/api-route-surface.md)
- **Generated evidence artifact:** `.artifacts/reports/governance/api-route-surface.report.json`

Afenda currently runs a **Hono** API in `apps/api`. This document does not define a second hypothetical API topology. If the generated route surface and this narrative ever disagree, the live Hono app wins and this document must be updated.

## Implementation and clients

| Concern                     | Live surface                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| API implementation          | [`apps/api/src/app.ts`](../apps/api/src/app.ts) and [`apps/api/src/routes/`](../apps/api/src/routes/)                                       |
| Browser Hono RPC client     | [`apps/web/src/rpc/web-client.ts`](../apps/web/src/rpc/web-client.ts)                                                                       |
| Browser generic HTTP client | [`apps/web/src/app/_platform/runtime/services/api-client-service.ts`](../apps/web/src/app/_platform/runtime/services/api-client-service.ts) |
| Shell bootstrap consumer    | [`apps/web/src/app/_platform/tenant/tenant-scope-context.tsx`](../apps/web/src/app/_platform/tenant/tenant-scope-context.tsx)               |

## Route surfaces

The live app mounts these primary route groups:

- `GET /`
- `GET /health`
- `/api/auth/*`
- `/api/v1/auth/*`
- `/api/v1/me`
- `/api/v1/commands/execute`
- `/api/v1/ops/*`
- `/api/users`

Use the generated route surface for the exact method/path inventory. The sections below explain the operational contract that the web app relies on today.

## Authentication and session posture

- `/api/*` routes run behind Better Auth session middleware.
- A valid session is required for protected `v1` and workspace surfaces.
- The API, not the web app, is authoritative for auth and permission enforcement.
- The request context middleware assigns `x-request-id` to every request.

## Tenant context behavior

Afenda currently resolves tenant context from:

1. `X-Tenant-Id` request header when explicitly supplied
2. the active tenant on the authenticated session when no header is supplied

Current enforced rules:

- reads and commands require an active tenant context for tenant-scoped surfaces
- if `X-Tenant-Id` is supplied and does not match the active session tenant, the API returns a conflict response
- shell bootstrap may still return `workspace_required` when the user is authenticated but has no active tenant context

## Bootstrap contract: `GET /api/v1/me`

`GET /api/v1/me` is the authoritative shell bootstrap contract for the current web app.

It returns the current session and Afenda runtime context, including:

- Better Auth session and user identity
- Afenda tenant candidates and default tenant
- actor roles and permissions for the active tenant when one exists
- truth and command matrix context for enabled modules
- setup state such as `auth`, `workspace_required`, `profile_recommended`, or `ready`

Common error outcomes:

- `401 AUTH_REQUIRED`
- `503 AUTH_NOT_CONFIGURED`

## Command execution contract: `POST /api/v1/commands/execute`

This is the governed mutation entrypoint for the current operations flow.

Current request shape:

```json
{
  "type": "ops.event.claim" | "ops.event.advance",
  "payload": {
    "eventId": "evt-4301"
  }
}
```

Current success contract:

- returns a command execution result rooted in the command pipeline
- includes `truthRecordId`
- during the current gap-closure wave it is converging toward shared execution linkage and internal event truth

Current command error codes:

- `401 AUTH_REQUIRED`
- `403 FORBIDDEN`
- `404 EVENT_NOT_FOUND`
- `409 TENANT_CONTEXT_REQUIRED`
- `409 TENANT_CONTEXT_MISMATCH`
- `409 INVALID_TRANSITION`
- `409 STALE_STATE`

## Operations read surfaces: `/api/v1/ops/*`

These are the current tenant-scoped operations read APIs.

### `GET /api/v1/ops/events-workspace`

Returns the current event-centric operating surface:

- tenant summary
- events
- counterparties
- recent audit entries when the actor has audit visibility

Requires `ops:event:view`.

### `GET /api/v1/ops/audit`

Returns the truth/audit feed for operations events.

Query parameters:

- `limit`
- `before`

Requires `ops:audit:view`.

### `GET /api/v1/ops/counterparties`

Returns the counterparty operating surface plus linked events.

Requires `ops:event:view`.

## Auth companion surfaces

The live Hono app also mounts:

- `/api/auth/*` for Better Auth handler delegation
- `/api/v1/auth/*` for Afenda auth companion surfaces such as intelligence, session management, and tenant-context activation/candidates

These routes are part of the live contract and are included in the generated route surface.

## Users demo surface

`/api/users` is the current lightweight Hono RPC demonstration and regression surface used by the web client typing path.

Current methods:

- `GET /api/users`
- `POST /api/users`

This is useful as a typed-client proving surface, but it is not the ERP module command layer.

## Error behavior

Current API error responses are route-specific JSON objects rather than a single universal envelope. The important live guarantees today are:

- protected routes return machine-readable `code` + `message`
- `x-request-id` is present for observability
- tenant-context, permission, invalid-transition, and stale-state failures are distinguished explicitly on the main governed routes

During the gap-closure wave, the emphasis is on keeping these live semantics truthful in docs and typed clients rather than inventing a second hand-maintained error model.

## Contract discipline

- The live Hono app is authoritative for route existence.
- The generated route surface is authoritative for route inventory.
- This document is authoritative for the narrative meaning of the live routes the web app depends on today.
- No document in this repo should describe the retired tenant-routed API topology as Afenda's live API until the code actually mounts that topology.

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [Documentation scope](./DOCUMENTATION_SCOPE.md)
- [Authentication](./AUTHENTICATION.md)
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md)
- [Generated API route surface](./architecture/governance/generated/api-route-surface.md)
