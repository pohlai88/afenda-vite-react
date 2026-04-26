---
owner: api-ops-auth
truthStatus: canonical
docClass: canonical-doc
relatedDomain: access-control
---

# Security control-plane topology

This document defines how Afenda places security-related concerns across the live repo.

It exists to prevent a legacy-style `packages/security` bucket from reappearing as a mixed ownership surface.

## Core rule

Security is a **cross-cutting control plane**, not a single ownership domain.

Therefore:

- do **not** create `packages/security`
- keep transport hardening in `apps/api/src/api-*`
- keep auth and session controls in `packages/better-auth`
- keep authorization close to API/domain boundaries
- keep rate limiting in `packages/rate-limit`
- keep audit in `packages/_database/src/7w1h-audit`
- keep shared error contracts in `packages/errors`

## Canonical ownership map

| Concern                           | Canonical owner                                       | Live target                                                                                                                  |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| HTTP security headers             | API root infrastructure                               | `apps/api/src/app.ts` plus future `apps/api/src/api-security-headers.policy.ts` if the surface grows                         |
| CORS policy                       | API root infrastructure                               | `apps/api/src/app.ts`, `apps/api/src/api-env.ts`                                                                             |
| Hono middleware glue              | API root infrastructure                               | `apps/api/src/api-*.middleware.ts`                                                                                           |
| Authentication                    | Better Auth boundary                                  | `packages/better-auth/src/**`                                                                                                |
| Session operating context         | Better Auth boundary                                  | `packages/better-auth/src/set-session-operating-context.ts`                                                                  |
| CSRF                              | Better Auth or API auth transport                     | `packages/better-auth/src/**` or `apps/api/src/api-csrf.*` only when needed                                                  |
| Authorization enforcement         | API/domain boundary                                   | module contracts, route guards, and authority resolution in `apps/api/src/modules/**` and `apps/api/src/api-auth-runtime.ts` |
| Shared permission catalog         | shared contract surface only if it becomes repo truth | future `packages/contracts/**` or a dedicated authorization package                                                          |
| API keys                          | auth or integrations boundary                         | future `packages/better-auth/src/**` or `apps/api/src/modules/integrations/api-keys/**`                                      |
| Rate limiting                     | platform protection                                   | `packages/rate-limit/src/**`                                                                                                 |
| Input validation                  | owning route/domain boundary                          | `apps/api/src/modules/**/**.schema.ts`                                                                                       |
| Normalization                     | owning route/domain boundary                          | `apps/api/src/modules/**/**-normalization.policy.ts`                                                                         |
| Audit logging                     | audit domain                                          | `packages/_database/src/7w1h-audit/**`                                                                                       |
| Security-related errors           | shared error contracts                                | `packages/errors/src/**`                                                                                                     |
| IP filtering                      | deployment edge first, API root second                | Vercel/Cloudflare/runtime config, then `apps/api/src/api-*.middleware.ts` only if needed                                     |
| Health/readiness security posture | API root infrastructure                               | `apps/api/src/api-health.*`, `apps/api/src/api-metrics.ts`                                                                   |

## Live topology

The intended live topology is:

```text
apps/api/src/
  app.ts
  api-env.ts
  api-auth-runtime.ts
  api-auth-session.middleware.ts
  api-error-handler.middleware.ts
  api-health.contract.ts
  api-health-manager.ts
  api-health.routes.ts
  api-metrics.ts
  api-request-context.middleware.ts
  modules/
    mdm/
    operations/
    users/

packages/
  better-auth/
    src/
  errors/
    src/
  rate-limit/
    src/
  contracts/
  _database/
    src/
      7w1h-audit/
```

## Placement rules

### 1. Transport hardening belongs at the API root

Examples:

- security headers
- CORS
- Hono middleware composition
- request identity propagation
- response envelope hardening

These are application-edge concerns and should stay under `apps/api/src/api-*`.

### 2. Identity and session concerns belong to Better Auth

Examples:

- session context
- sign-in/out mechanics
- auth plugin flags
- trusted origins
- session activation
- future CSRF if cookie-backed browser mutation protection becomes necessary
- future API key credential lifecycle if treated as auth primitives

These should stay under `packages/better-auth/src/**`, not under a generic security package.

### 3. Authorization belongs to the API/domain boundary

Examples:

- permission keys required by an MDM route
- command authority resolution
- route-level `403` behavior
- policy checks before writes

Permission enforcement should be explicit in the owning module.
The UI may mirror permission keys for navigation only.

### 4. Validation is not a global sanitizer bucket

Examples:

- Zod input schemas
- query validation
- normalized identifiers
- canonical display-name normalization

Keep these in the owning route or domain slice.
Do not centralize business input policy in `packages/security` or `utils/sanitize`.

### 5. Audit is its own domain

Security-relevant changes are still audit events, but the audit ownership surface remains:

- `packages/_database/src/7w1h-audit/**`

Do not create parallel audit helpers in auth or security buckets when the 7W1H audit surface can own the evidence contract.

### 6. Rate limiting is platform protection

Use:

- `packages/rate-limit/src/**`

Do not reintroduce ad hoc in-memory limiters in feature or auth packages unless they are thin adapters over the canonical package surface.

## Legacy decomposition map

The legacy `packages/security` bucket should be decomposed like this:

| Legacy surface                     | Afenda target                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `headers.ts`                       | `apps/api/src/app.ts` and future `apps/api/src/api-security-headers.policy.ts`   |
| `cors.ts`                          | `apps/api/src/app.ts` and `apps/api/src/api-env.ts`                              |
| `middleware.ts`                    | `apps/api/src/api-*.middleware.ts`                                               |
| RBAC section in `index.ts`         | module contracts now, shared contract package later if needed                    |
| rate limiter section in `index.ts` | `packages/rate-limit/src/**`                                                     |
| `csrf.ts`                          | `packages/better-auth/src/**` or `apps/api/src/api-csrf.*`                       |
| `sanitize.ts`                      | module-owned `*.schema.ts` and `*-normalization.policy.ts`                       |
| API key section in `index.ts`      | `packages/better-auth/src/**` or `apps/api/src/modules/integrations/api-keys/**` |
| IP filtering section in `index.ts` | deployment edge policy first, API middleware second                              |
| audit section in `index.ts`        | `packages/_database/src/7w1h-audit/**`                                           |
| `SecurityError`                    | `packages/errors/src/**`                                                         |

## Anti-patterns

Do not do these:

- create `packages/security`
- place business authorization in a global utility bucket
- keep audit-entry creation separate from the canonical 7W1H audit surface
- duplicate rate limiting outside `packages/rate-limit`
- treat sanitization helpers as a replacement for typed route/domain schemas
- mix Next.js or Express middleware shapes into the Hono API root

## Adoption sequence

When a legacy security concern is adopted, use this order:

1. Identify the real concern class: transport, auth, authorization, rate limiting, audit, validation, or errors.
2. Place it in the canonical owner listed in this document.
3. Bind it to existing API/module contracts instead of creating a new mixed package.
4. Add tests at the owning boundary.
5. Update narrative docs if the public API surface or permission model changes.

## Related docs

- [Authentication](./AUTHENTICATION.md)
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md)
- [API reference](./API.md)
- [Monorepo boundaries](./MONOREPO_BOUNDARIES.md)
- [Boundary surfaces](./BOUNDARY_SURFACES.md)
- [`packages/_database` README](../packages/_database/README.md)
