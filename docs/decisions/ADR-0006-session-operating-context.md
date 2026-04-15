---
title: "ADR-0006: Session operating context (Better Auth) + audit resolution rules"
description: "session.additionalFields + setSessionOperatingContext; identity_links only; session is validated lens not authority."
order: 6
status: accepted
---

# ADR-0006: Session operating context (Better Auth) + audit resolution rules

- **Status:** Accepted
- **Date:** 2026-04-15
- **Owner:** Platform / API
- **Review by:** 2026-10-01
- **Relates to:** [ADR-0003](./ADR-0003-afenda-tenancy-authority.md), [ADR-0004](./ADR-0004-identity-bridge-and-principals.md), [ADR-0005](./ADR-0005-auth-schema-authority-public-vs-neon-auth.md)

## Context

**Operating context** (which tenant / unit the user is “working in”) must be available to the API without trusting client-spoofed headers alone. Today, **`public.session`** may lack fields for Afenda workspace context, while some Neon Auth session stores expose **organization**-oriented fields that **must not** replace Afenda tenancy (ADR-0003 / ADR-0005).

**Audit** requires **tenant-bounded**, investigation-shaped rows (`packages/_database` / `docs/AUDIT_ARCHITECTURE.md`). Actor resolution uses **`identity_links`** only (ADR-0004); optional env fallback tenant for auth security audit remains **non-actor** when the bridge is missing.

## Evaluation

- **Session** should hold **server-resolved operating lens** (what UI selected), not duplicate ERP truth. **Authorization** still re-validates membership, roles, and scopes on every protected path.
- **`business_units`**, **`locations`**, and extended **`org_units`** are present in `packages/_database` as first-class operating dimensions; session may reference them once scope and **context alignment** (`assertContextAlignment`) pass.
- **`audit_logs`** includes `tenant_id`, `membership_id`, dimension FKs, and `metadata` per `docs/AUDIT_ARCHITECTURE.md`; governed writers remain the norm for business-domain rows.

## Decision

### A. Session (`public.session`) — additional fields

Use Better Auth **`session.additionalFields`** (and migrations) to persist **server-populated** context, for example:

| Field                  | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `activeTenantId`       | Current operating tenant (`tenants.id`)                  |
| `activeMembershipId`   | Resolves to `tenant_memberships.id` for this user+tenant |
| `activeLegalEntityId`  | Optional; must belong to tenant                          |
| `activeOrgUnitId`      | Optional; must belong to tenant                          |
| `activeBusinessUnitId` | Optional; must belong to tenant when set                 |
| `activeLocationId`     | Optional; must belong to tenant when set                 |

**Rules:**

1. Values are **set/updated only server-side** — canonical entry: **`setSessionOperatingContext`** (`packages/better-auth`) after **`resolveActiveTenantContext`**; clients cannot author these fields (`input: false` on additional fields).
2. Missing or stale session context does **not** bypass membership checks.
3. **Session is cache / lens**, not authority: every protected mutation re-validates.

### B. Authorization (every protected path)

1. Resolve **Better Auth** session → **`better_auth_user_id`**.
2. Resolve **Afenda user** via **`identity_links`** only (ADR-0004).
3. Validate **tenant**, **membership**, **role**, **scope**, and **context alignment** for the operation and resource.

### C. Audit

1. **`tenant_id`** and **`actor_user_id`** (`users.id`) are mandatory for governed business-domain audit where applicable; actor comes from **`identity_links`**, not email inference.
2. **`session_id`** should be populated when a session exists.
3. **`legal_entity_id`** when the action is scoped to a statutory entity.
4. Prefer **explicit IDs** in row fields or governed **`metadata`**.
5. **Better Auth security audit** (`emitAfendaAuthSecurityAudit` in `packages/better-auth/src/auth-database-audit-hooks.ts`): for `auth.session.*`, `auth.account.linked`, and `auth.user.updated`, write the Better Auth subject id to governed **`audit_logs.auth_user_id`** (not metadata alone). Keep **`metadata.betterAuthUserId`** in parallel during transition for older readers and investigations. Historical rows where only metadata was populated can be repaired with the SQL in **`packages/_database/drizzle/0015_audit_backfill_auth_user_id_from_metadata.sql`** (run after deploy). Companion **`recentEvents`** queries may use `auth_user_id = $1 OR metadata->>'betterAuthUserId' = $1` until backfill is complete, then simplify to **`auth_user_id` only**.

## Alternatives considered

### Option A: Tenant only from `X-Tenant-Id` header

- Pros: Simple client.
- Cons: Spoofable without strict server binding; rejected for mutations.

### Option B: Encode full RBAC in JWT/session without DB checks

- Pros: Fast reads.
- Cons: Stale permissions; rejected for ERP-grade enforcement.

## Consequences

### Positive

- Clear split: session = **lens**, tables = **truth**, APIs = **enforce**.
- Audit can move from inference to **deterministic IDs**.

### Negative

- Requires Better Auth schema migration for new session fields and coordinated client refresh behavior.

---

## Execution roadmap (cross-ADR)

| Wave                            | Action                                                                                     | Status (2026-04) |
| ------------------------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| **1 — Authority freeze**        | Document ADR-0003–0005; Afenda tenancy only; **`neon_auth` banned at runtime** (ADR-0005). | Done |
| **2 — Identity bridge**         | Mandatory `identity_links`; bootstrap on sign-up (ADR-0004). | Done |
| **3 — Session context**         | `session.additionalFields` + **`setSessionOperatingContext`** + **`POST /v1/session/operating-context`**. | Done; run **`pnpm --filter @afenda/better-auth run auth:migrate`** per DB |
| **4 — Authorization hardening** | `resolveActiveTenantContext` + scope + **`assertContextAlignment`**. | Done |
| **5 — Audit hardening**         | Auth security audit: **`identity_links`** only for actor; **no email fallback**. | Done |
| **6 — neon_auth**               | Physical schema cleanup optional; **runtime** already has **no** `neon_auth` dependency (ADR-0005). | Done (architecture) |

## What to do next (operators)

1. Run **`pnpm --filter @afenda/better-auth run auth:migrate`** wherever this database exists so `session` has operating-context columns.
2. Ensure **`identity_links` bootstrap** runs (Better Auth `user.create` hook); no email-based resolution.
3. Use **`setSessionOperatingContext`** (or **`POST /v1/session/operating-context`**) to establish tenant / dimension lens after the client selects context — **never** trust client-authored session fields alone.
4. After upgrading app code that emits auth security audit with **`auth_user_id`**, apply **`0015_audit_backfill_auth_user_id_from_metadata.sql`** once per database so legacy rows align (then tighten `recentEvents` queries if you still use the metadata OR fallback).

## References

- `packages/_database/src/audit/schema/audit-logs.ts`
- `packages/better-auth/src/auth-database-audit-hooks.ts` (`identity_links` for actor; no email path)
- `packages/better-auth/src/create-afenda-auth.ts` (`session.additionalFields`)
- `packages/better-auth/src/set-session-operating-context.ts` — **`setSessionOperatingContext`**
- `packages/_database/src/tenancy/services/resolve-afenda-me-context.ts`
- `docs/AUDIT_ARCHITECTURE.md`
