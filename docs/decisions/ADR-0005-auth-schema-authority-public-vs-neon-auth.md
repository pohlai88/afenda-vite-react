---
title: "ADR-0005: Auth schema authority — public (self-hosted Better Auth) vs neon_auth"
description: "public Better Auth tables are the live runtime auth store; neon_auth is non-authoritative for ERP and must not gain new workspace truth."
order: 5
status: accepted
---

# ADR-0005: Auth schema authority — `public` (self-hosted Better Auth) vs `neon_auth`

- **Status:** Accepted
- **Date:** 2026-04-15
- **Owner:** Platform / infrastructure
- **Review by:** 2026-10-01
- **Relates to:** [ADR-0003](./ADR-0003-afenda-tenancy-authority.md), [ADR-0004](./ADR-0004-identity-bridge-and-principals.md)

## Context

Neon databases may contain both:

- **`neon_auth.*`** — Neon-managed auth schema (includes organization/member-style tables and session shapes with fields such as **`activeOrganizationId`**).
- **`public.*`** — Self-hosted Better Auth core tables (`"user"`, `session`, `account`, `verification`) used by **`createAfendaAuth`** in `apps/api`, plus Afenda domain tables.

Two live writers or two “current session” truths create **schema drift**, confused debugging, and incorrect assumptions about where ERP tenancy lives (see ADR-0003).

## Evaluation

For this monorepo’s **runtime path** (`apps/api` + `createAfendaAuth` + `DATABASE_URL`), **`public`** Better Auth tables are the **operational** authentication store. **`neon_auth`** is **not** part of that write path unless explicitly integrated; it must not be treated as a parallel authority for product features.

**Deprecation stance:** `neon_auth.organization`, `neon_auth.member`, and session fields that encode **Better Auth workspace** (e.g. `activeOrganizationId`) are **not** Afenda tenancy (ADR-0003). They may remain in the database for Neon Auth / compatibility, but **must not** be authoritative for ERP.

## Decision

1. **Single writer for app authentication** in production: **`public.user`**, **`public.session`**, **`public.account`**, **`public.verification`** (as created/maintained by Better Auth migrate + runtime).
2. **`neon_auth.*`** is **non-authoritative** for Afenda ERP features. Allowed states:
   - **Deprecated** (documented, no new dependencies), or
   - **Compatibility-only / read-only** for a defined integration, or
   - **Removed** after backup and validation (separate cutover plan).
3. **No new product feature** may read or write **`neon_auth.organization`** / **`neon_auth.member`** as workspace truth without an ADR that supersedes this one.

## Alternatives considered

### Option A: Standardize on Neon Auth schema only

- Pros: Managed operations.
- Cons: Conflicts with current `apps/api` self-hosted path and Afenda schema ownership; large migration.

### Option B: Merge `neon_auth` and `public` physically

- Pros: One set of tables.
- Cons: High risk; vendor-controlled vs app-controlled boundaries.

## Consequences

### Positive

- Clear answer for “which `user` / `session` row matters.”
- Aligns engineering and support with actual connection targets.

### Negative

- Requires communication with anyone using Neon Console features against `neon_auth`.
- Cleanup may need coordinated downtime or dual-read windows.

## Validation

- Inventory queries / scripts that reference `neon_auth` (grep / Neon SQL).
- Confirm production `DATABASE_URL` points to the database where **`public`** auth is written.

## References

- `apps/api/src/index.ts`, `packages/better-auth/src/create-afenda-auth.ts`
- Neon schema observation: `neon_auth` vs `public` table list (architecture review 2026-04)
