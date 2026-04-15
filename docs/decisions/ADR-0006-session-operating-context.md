---
title: "ADR-0006: Session operating context (Better Auth) + audit resolution rules"
description: "Server-resolved session additionalFields for Afenda operating context; authorization still validates memberships; audit moves off inference-only resolution."
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

**Audit** requires **tenant-bounded**, investigation-shaped rows (`packages/_database` / `docs/AUDIT_ARCHITECTURE.md`). Inference-only tenant resolution (e.g. email → first membership, or env fallback) is a **bridge**, not the finished enterprise posture (ADR-0004).

## Evaluation

- **Session** should hold **server-resolved operating lens** (what UI selected), not duplicate ERP truth. **Authorization** still re-validates membership, roles, and scopes on every protected path.
- **`business_units`** and **`locations`** are **not** present in the current Drizzle schema; introduce them only when domain requirements justify new tables. Until then, **`org_units`** (with clear `kind` / codes) may cover department/team/location-style boundaries, or scope via existing **`membership_*_scopes`**.
- **`audit_logs`** today includes `tenant_id`, `legal_entity_id`, polymorphic subject fields, and rich `metadata`. First-class columns for `membership_id`, `org_unit_id`, or location are **optional follow-ons** when query volume or compliance requires; until then, governed **`metadata`** keys are acceptable if doctrine and redaction policy are respected.

## Decision

### A. Session (`public.session`) — additional fields

Use Better Auth **`session.additionalFields`** (and migrations) to persist **server-populated** context, for example:

| Field                  | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `activeTenantId`       | Current operating tenant (`tenants.id`)                  |
| `activeMembershipId`   | Resolves to `tenant_memberships.id` for this user+tenant |
| `activeLegalEntityId`  | Optional; must belong to tenant                          |
| `activeOrgUnitId`      | Optional; must belong to tenant                          |
| `activeBusinessUnitId` | Optional; **only if** a `business_units` table exists    |
| `activeLocationId`     | Optional; **only if** a `locations` table exists         |

**Rules:**

1. Values are **set/updated only server-side** (hooks, API after membership validation), not copied blindly from client headers.
2. Missing or stale session context does **not** bypass membership checks.

### B. Authorization (every protected path)

1. Resolve **Better Auth** session → **`better_auth_user_id`**.
2. Resolve **Afenda user** via **`identity_links`** (ADR-0004), with email fallback only during migration.
3. Validate **tenant**, **membership**, **role**, and **scope** for the operation and resource.

### C. Audit

1. **`tenant_id`** and **`actor_user_id`** (`users.id`) are mandatory for governed business-domain audit where applicable.
2. **`session_id`** should be populated when a session exists.
3. **`legal_entity_id`** when the action is scoped to a statutory entity.
4. Prefer **explicit IDs** in row fields or governed **`metadata`**; **remove inference-only and env-fallback paths** once ADR-0004 backfill and session context are live (see roadmap below).

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

| Wave                            | Action                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| **1 — Authority freeze**        | Document ADR-0003–0005; no new ERP bindings to `neon_auth.organization` / BA org as truth. |
| **2 — Identity bridge**         | Implement `identity_links`; backfill; monitor orphans (ADR-0004).                          |
| **3 — Session context**         | Add `session.additionalFields`; server-side population from memberships/scopes.            |
| **4 — Authorization hardening** | Enforce resolve order (session → link → membership → scope) on `/v1/*` mutations.          |
| **5 — Audit hardening**         | Remove tenant/actor inference fallbacks; require IDs per audit doctrine.                   |
| **6 — Deprecation**             | Archive or drop non-authoritative `neon_auth` usage after backup + validation (ADR-0005).  |

## References

- `packages/_database/src/audit/schema/audit-logs.ts`
- `packages/better-auth/src/auth-database-audit-hooks.ts` (bridge-era audit emission)
- `docs/AUDIT_ARCHITECTURE.md`
