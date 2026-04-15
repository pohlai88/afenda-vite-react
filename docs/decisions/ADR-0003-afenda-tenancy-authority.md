---
title: "ADR-0003: Afenda tenancy as the only business workspace authority"
description: "Tenants and Afenda memberships are canonical ERP workspace and audit jurisdiction; not neon_auth.organization or unmapped Better Auth org IDs."
order: 3
status: accepted
---

# ADR-0003: Afenda tenancy as the only business workspace authority

- **Status:** Accepted
- **Date:** 2026-04-15
- **Owner:** Platform / data architecture
- **Review by:** 2026-10-01
- **Relates to:** [ADR-0004](./ADR-0004-identity-bridge-and-principals.md), [ADR-0005](./ADR-0005-auth-schema-authority-public-vs-neon-auth.md), [ADR-0006](./ADR-0006-session-operating-context.md)

## Context

The database currently allows **multiple “workspace” interpretations**: Afenda tables (`tenants`, `tenant_memberships`, scopes) and Neon Auth / Better Auth organization-style objects (`neon_auth.organization`, `neon_auth.member`, session fields such as `activeOrganizationId` on some session stores). Those models do not share foreign keys and are not equivalent.

ERP isolation, subscription boundaries, and **audit jurisdiction** must have **one** canonical workspace concept or investigations and authorization will remain ambiguous.

## Evaluation

The **Afenda-first** choice is correct for this codebase: product schema, RBAC, legal entity and org-unit trees, and `audit_logs.tenant_id` already anchor on **`tenants`**. Better Auth’s organization plugin is optional sugar for auth products; it is **not** a substitute for ERP tenancy unless explicitly mapped 1:1 to `tenants`, which would duplicate truth.

**Clarification vs the target domain model:** “Teams” do not require a new table if **`org_units`** (with a discriminating `kind` or code) already models departmental and team boundaries. Add dedicated `teams` only if a measured access pattern cannot be expressed with memberships + org-unit scopes.

## Decision

1. **`tenants`** is the **only** canonical workspace / isolation / top-level audit jurisdiction for ERP features.
2. **`tenant_memberships`** is the canonical **user ↔ tenant** access entry.
3. **`tenant_membership_roles`** and **`membership_*_scopes`** are the canonical **authorization scope** mechanics (with `legal_entities` and `org_units` as scope dimensions where used).
4. **Better Auth `organization` plugin rows** (and **`neon_auth.organization` / `neon_auth.member`**) are **not** ERP workspace truth. They may exist for legacy or Neon Auth compatibility but **must not** be the authority for ERP routes, billing, or audit jurisdiction without an explicit, migrated mapping to `tenants` (see ADR-0005).

## Rule (normative)

All ERP features and durable audit evidence must bind to:

- `tenant_id` referencing **`tenants.id`**, and
- validated **Afenda** membership and scopes,

not to `neon_auth.organization` or unmapped Better Auth organization IDs.

## Alternatives considered

### Option A: Better Auth organization as workspace authority

- Pros: Single vendor model for “org” in auth layer.
- Cons: Does not match existing Afenda schema, duplicates `tenants`, and forces ongoing sync or drift.

### Option B: Parallel truths with best-effort sync

- Pros: No big bang.
- Cons: Permanent ambiguity; fails audit and authorization clarity.

## Consequences

### Positive

- One workspace story for engineering, support, and compliance.
- Aligns with existing `audit_logs` tenant FK and investigation queries.

### Negative

- Any UX or integration that assumed Neon Auth / BA org as primary must be rewired or mapped.

## Revisit triggers

Reopen if, for two consecutive releases, product requirements **require** a second workspace root that cannot map to `tenants` with bounded complexity.

## References

- `packages/_database/src/tenancy/schema/tenants.ts`
- `docs/AUDIT_ARCHITECTURE.md` (tenant-bounded evidence)
