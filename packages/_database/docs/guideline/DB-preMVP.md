# DB pre-MVP

This document defines the **database phase before the ERP MVP**.

Its purpose is simple:

- do **not** introduce ERP domain tables yet
- do build the database package, migration discipline, connection layer, and tenant-first foundation so MVP work can start cleanly

This is the stage where `@afenda/database` becomes structurally ready for the MVP without pretending the MVP business model already exists.

---

## 1. Position

`DB-preMVP` is **not** the ERP MVP.

It is the preparation layer for the ERP MVP.

At this stage, the database must provide:

- a stable PostgreSQL connection model
- a stable Drizzle schema package structure
- migration generation and review discipline
- tenant-first identity foundation
- audit/evidence readiness
- naming, key, and constraint conventions that future MVP tables must follow

At this stage, the database must **not** provide:

- legal entities
- business units
- locations
- org units
- roles / permissions / scoped authorities
- parties / customers / suppliers
- items / inventory masters
- finance masters
- ERP transaction tables

Those belong to the MVP or later phases, not to `DB-preMVP`.

---

## 2. Goal

The goal of `DB-preMVP` is to make this statement true:

> We can start building the ERP MVP immediately without redesigning the database package itself.

That means the package is already ready in its **architecture**, even though the ERP business schema is intentionally still small.

---

## 3. What Must Exist In DB-preMVP

## 3.1 Database package foundation

`@afenda/database` must already be the canonical persistence package for:

- PostgreSQL access
- Drizzle schema definitions
- migration generation
- migration verification
- shared database exports for downstream packages

This phase is about making the package stable as an engineering boundary.

## 3.2 Connection and runtime readiness

The database layer must already support:

- environment-based connection configuration
- pooled PostgreSQL access
- one canonical DB client entrypoint
- compatibility with local development and future production deployment
- safe downstream consumption by `apps/api` and `packages/better-auth`

The question in `DB-preMVP` is not “do we have ERP tables yet?”

The question is “can application packages depend on the database package without structural churn?”

## 3.3 Migration discipline

Before the ERP MVP begins, the package must already enforce:

- schema changes go through migrations
- generated SQL is reviewable
- migration history is the contract
- naming is deterministic
- drift checks are available

If this discipline is missing before MVP, the MVP will degrade into ad hoc schema growth.

## 3.4 Tenant-first identity foundation

The pre-MVP database should keep only the foundation required to establish tenant-aware identity and operating context:

- `users`
- `user_identities`
- `identity_links`
- `tenants`
- `tenant_memberships`
- auth companion support when required by authentication flows
- audit evidence support when required for traceability

This is enough to establish:

- who authenticated
- who the internal principal is
- which tenant boundary they belong to
- which membership grants them access into that boundary

This is **not** yet ERP master data.

## 3.5 Architectural conventions

Before MVP domain growth, the package must already standardize:

- UUID surrogate primary keys
- explicit foreign keys
- tenant-aware modeling rules
- timestamp conventions
- status/enums discipline
- table and column naming conventions
- domain-based schema/module layout

The MVP should inherit these rules, not invent them while shipping domain tables.

---

## 4. What Must Explicitly Stay Out

To avoid concept mixture, `DB-preMVP` must explicitly reject premature ERP modeling.

Do **not** add these yet:

- enterprise structure tables
- role and permission models
- approval hierarchy models
- customer, supplier, contact, and address masters
- item, category, UoM, pricing, or inventory masters
- chart of accounts, fiscal calendar, tax, or journal masters
- tenant configuration buckets that try to model future ERP policy too early
- generalized org hierarchy abstractions without a real workflow

The reason is not that these are unimportant.

The reason is that they should be introduced only when the MVP domain model is being built intentionally, not during database scaffolding.

---

## 5. Relationship To MVP

The sequence is:

1. `DATABASE_ARCHITECTURE_DOCTRINE.md`
2. `DB-preMVP.md`
3. `MVP.md`
4. `postgreSQL-DDL.md`

Their roles are different:

- doctrine defines enduring rules
- `DB-preMVP` defines the readiness boundary before ERP modeling
- MVP defines the first real business schema slice
- PostgreSQL DDL defines the mature physical engineering blueprint for that direction

`DB-preMVP` exists so the MVP does not have to solve package architecture and business modeling at the same time.

---

## 6. Success Criteria

`DB-preMVP` is complete when all of these are true:

- the database package has one stable export surface
- downstream packages can depend on it without legacy schema coupling
- migrations can be generated, reviewed, and verified cleanly
- tenant-aware identity context works end to end
- audit/evidence support is present at a minimal useful level
- no ERP domain tables have been introduced just to “prepare for the future”

If ERP tables start appearing before these conditions are stable, the project is skipping the preparation phase.

---

## 7. Exit Criteria Into MVP

Move from `DB-preMVP` into the ERP MVP only when:

- the package boundary is stable
- the migration workflow is trusted
- naming and structural conventions are settled
- tenant and identity foundation is functioning
- downstream auth and API integration are already aligned to the reduced contract

At that point, MVP work can begin by adding the first real ERP business schema intentionally.

---

## 8. Practical Rule

When deciding whether a table belongs in `DB-preMVP`, ask:

> Does this table exist to make the database package ready for MVP, or does it already belong to the ERP business model itself?

If it belongs to the ERP business model, it is **not** `DB-preMVP`.

That is the whole boundary.
