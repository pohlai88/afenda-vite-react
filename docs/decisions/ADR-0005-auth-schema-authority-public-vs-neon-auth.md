---
title: "ADR-0005: Auth schema authority — public (self-hosted Better Auth) vs neon_auth"
description: "public Better Auth tables are the live runtime auth store; neon_auth has no runtime authority — no reads, no writes, no workspace semantics in app code."
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

**Architectural stance:** `neon_auth.organization`, `neon_auth.member`, and session fields such as **`activeOrganizationId`** are **not** Afenda tenancy (ADR-0003). For this codebase, **`neon_auth` is dead at runtime**: application code **must not** read or write it or rely on it for workspace, sessions, or RBAC. Physical schema drops are an **operational** follow-up only.

## Decision

1. **Single writer for app authentication** in production: **`public.user`**, **`public.session`**, **`public.account`**, **`public.verification`** (as created/maintained by Better Auth migrate + runtime).
2. **`neon_auth.*`** — **no runtime dependency.** No service reads `neon_auth.organization`, `neon_auth.member`, or similar; no feature uses Neon Auth workspace semantics. ERP workspace is **`tenants`** / **`tenant_memberships`** only (ADR-0003).
3. **No ADR** may describe `neon_auth` as a valid workspace authority without superseding this decision.

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

- `grep` / CI: **no** `neon_auth` references in `apps/**` or `packages/**` TypeScript (operational SQL tools excluded).
- Confirm production `DATABASE_URL` points to the database where **`public`** auth is written.

## References

- `apps/api/src/index.ts`, `packages/better-auth/src/create-afenda-auth.ts`
- Neon schema observation: `neon_auth` vs `public` table list (architecture review 2026-04)
