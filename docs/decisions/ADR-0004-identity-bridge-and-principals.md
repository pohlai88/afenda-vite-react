---
title: "ADR-0004: Identity authority — Better Auth user vs Afenda principal (identity_links)"
description: "Bridge authentication (public.user) and ERP principal (users) with identity_links; email match is migration-only fallback."
order: 4
status: accepted
---

# ADR-0004: Identity authority — Better Auth user vs Afenda principal (`identity_links`)

- **Status:** Accepted
- **Date:** 2026-04-15
- **Owner:** Platform / identity
- **Review by:** 2026-10-01
- **Relates to:** [ADR-0003](./ADR-0003-afenda-tenancy-authority.md), [ADR-0006](./ADR-0006-session-operating-context.md)

## Context

Runtime uses **Better Auth** tables in **`public`**: `"user"` with **text** `id` (authentication identity). Afenda uses **`users`** with **uuid** `id` (ERP principal). Today the practical link is **email convention**, which is not FK-enforced, breaks under email change, and makes **audit `actor_user_id`** and background jobs non-deterministic.

## Evaluation

A dedicated **bridge table** is the enterprise-stable pattern: authentication id and principal id are both first-class; the bridge carries provenance and lifecycle (`linked_at`, `verified_at`, `source`). This matches the gap analysis: email-only resolution is acceptable **during migration**, not as the finished state (see ADR-0006 for audit).

**Uniqueness:** enforce **`better_auth_user_id` UNIQUE** and **`afenda_user_id` UNIQUE** (one active link per side) unless a documented multi-link model is required (generally avoid).

## Decision

1. **Authentication truth** remains Better Auth **`public.user`** (via `apps/api` + `createAfendaAuth`).
2. **ERP principal truth** remains Afenda **`public.users`**.
3. Introduce **`identity_links`** with at least:
   - `id` (uuid PK)
   - `afenda_user_id` uuid **NOT NULL** → FK **`users.id`**
   - `better_auth_user_id` text **NOT NULL** → logical reference to **`public.user.id`** (FK optional if ORM constraints differ; uniqueness required)
   - `linked_at`, `verified_at` (timestamptz)
   - `source` (text enum or constrained text: e.g. `signup`, `import`, `admin_repair`)

4. All server paths that today resolve “Afenda user from session” should **prefer `identity_links`** once backfilled; **email match** is a **fallback only** until migration completes.

## Alternatives considered

### Option A: Merge into a single `users` table

- Pros: One row per person.
- Cons: High blast radius; mixes auth vendor schema with ERP fields; migration cost.

### Option B: Store Better Auth id only on `users` as a column

- Pros: Simple query.
- Cons: Loses multi-source / provenance; harder to audit link history.

## Consequences

### Positive

- Deterministic resolution: session → Better Auth user → **Afenda user** → memberships.
- Audit `actor_user_id` can always target **`users.id`**.
- Email changes do not break the link if the bridge is updated with discipline.

### Negative

- Requires backfill and monitoring for orphaned or duplicate rows.
- Operational discipline on `verified_at` / reconciliation jobs.

## Rollout (summary)

1. Add table + constraints + Drizzle schema.
2. Backfill from existing email matches where safe.
3. Switch API resolution order: **bridge → email fallback → log debt**.
4. Remove fallback after metrics show zero reliance (see ADR-0006).

## References

- `packages/_database/src/identity/schema/users.ts`
- `packages/_database/src/tenancy/services/resolve-afenda-me-context.ts` (current email-based path)
