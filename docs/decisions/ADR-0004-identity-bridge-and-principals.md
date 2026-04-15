---
title: "ADR-0004: Identity authority — Better Auth user vs Afenda principal (identity_links)"
description: "Mandatory identity_links bridge from Better Auth user to Afenda users; bootstrap on sign-up; no email fallback for runtime resolution."
order: 4
status: accepted
---

# ADR-0004: Identity authority — Better Auth user vs Afenda principal (`identity_links`)

- **Status:** Accepted (implementation hardening in progress)
- **Date:** 2026-04-15
- **Owner:** Platform / identity
- **Review by:** 2026-10-01
- **Relates to:** [ADR-0003](./ADR-0003-afenda-tenancy-authority.md), [ADR-0006](./ADR-0006-session-operating-context.md)

## Context

Runtime uses **Better Auth** tables in **`public`**: `"user"` with **text** `id` (authentication identity). Afenda uses **`users`** with **uuid** `id` (ERP principal). Email-only matching is not FK-enforced, breaks under email change, and makes **audit `actor_user_id`** non-deterministic.

## Evaluation

A dedicated **bridge table** is the enterprise-stable pattern: authentication id and principal id are both first-class.

**Uniqueness:** enforce **`better_auth_user_id` UNIQUE** per auth provider and **`afenda_user_id`** linkage per provider unless a documented multi-link model is required (generally avoid).

## Decision

1. **Authentication truth** remains Better Auth **`public.user`** (via `apps/api` + `createAfendaAuth`).
2. **ERP principal truth** remains Afenda **`public.users`**.
3. **`identity_links`** carries the bridge (see Drizzle schema in `packages/_database`).
4. **Runtime resolution order is fixed:** `better_auth_user_id` → **`identity_links`** → **Afenda `users.id`** → memberships / tenant. **No email fallback** for authenticated API or auth security audit actor resolution.
5. **Bootstrap:** on Better Auth user creation, the server **creates** Afenda `users` (when needed) and **`identity_links`** (`ensureIdentityLinkForBetterAuthUser`, `user.create` database hook). No “backfill” story for an empty greenfield database.

## Alternatives considered

### Option A: Merge into a single `users` table

- Pros: One row per person.
- Cons: High blast radius; mixes auth vendor schema with ERP fields; migration cost.

### Option B: Store Better Auth id only on `users` as a column

- Pros: Simple query.
- Cons: Loses multi-source / provenance; harder to audit link history.

## Consequences

### Positive

- Deterministic resolution: session → Better Auth user → **`identity_links`** → **Afenda user** → memberships.
- Audit `actor_user_id` targets **`users.id`** via the bridge only.

### Negative

- Sign-up and hook ordering must succeed for identity bootstrap; failures must be monitored.

## Implementation status

| Item | State |
|------|--------|
| `identity_links` schema | Done |
| Bootstrap on `user.create` (`ensureIdentityLinkForBetterAuthUser`) | Done |
| Remove email fallback (`resolveAfendaMeContext` removed; `requireAfendaMeContextFromBetterAuthUserId` for strict paths) | Done |
| Protected BFF routes requiring bridge (`GET /v1/me`) | Done |

## References

- `packages/_database/src/identity/schema/users.ts`, `identity-links.ts`
- `packages/_database/src/identity/services/ensure-identity-link-for-better-auth-user.ts`
- `packages/_database/src/tenancy/services/resolve-afenda-me-context.ts`
- `packages/better-auth/src/auth-database-audit-hooks.ts`
