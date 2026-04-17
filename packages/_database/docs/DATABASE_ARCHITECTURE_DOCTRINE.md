# Database Architecture Doctrine

This document defines the **enduring architectural rules** for `@afenda/database`.

It is intentionally **not** a dump of whichever tables happen to exist today, and it is **not** a speculative full-ERP schema. Its job is to answer:

- what this database package is for
- what kinds of truth belong here
- how tenant, identity, and business data must relate
- what modeling rules are non-negotiable as the schema grows

If a reader needs to know the exact tables currently implemented, that belongs in a separate baseline/inventory document. Doctrine is the layer above that: the rules that remain valid while the implementation grows in phases.

---

## 1. Purpose

`@afenda/database` exists to be the **canonical PostgreSQL and Drizzle persistence boundary** for Afenda.

That means:

- it owns the durable relational model
- it defines the authoritative Drizzle schema and migrations
- it encodes invariants that should not depend only on app code
- it gives the rest of the system one stable place to reason about data truth

It does **not** exist to be:

- a random bucket of convenience tables
- a mirror of every product idea before the idea is implemented
- a place where future ERP design and present runtime truth are mixed without labels

---

## 2. What Doctrine Means

In this package, **doctrine** means architectural rules that should survive multiple implementation phases.

Examples:

- tenant is the primary business isolation boundary
- identity and business actors are related but not identical concepts
- migrations are the only production-safe schema contract
- relational invariants belong in the database when PostgreSQL can enforce them safely

Doctrine is different from:

- **baseline**: what exists right now
- **proposal**: what we might build next
- **reference/source material**: exploratory or source-of-truth design input

Those three can change quickly. Doctrine should change only when the architecture changes.

---

## 3. Core Truth Boundaries

Afenda must keep different kinds of truth separate.

### 3.1 Authentication truth

Authentication answers:

- who signed in
- how they authenticated
- what external auth identity they came from

This includes things like:

- auth companion challenge state
- Better Auth identity bridge data
- session-related identifiers when persisted for audit correlation

Authentication truth is **not** ERP truth.

### 3.2 Principal truth

A database principal is the internal actor Afenda reasons about.

This includes:

- internal user records
- identity linkage between auth provider users and Afenda principals
- tenant membership tying a principal to a tenant

Principals are where the system starts to move from “who authenticated” to “who can act inside Afenda”.

### 3.3 Tenant truth

Tenant truth answers:

- which organization owns the data
- which rows belong inside the same isolation boundary
- which membership links a principal into that boundary

Tenant is not a convenience tag. It is the first business governance boundary in the model.

### 3.4 Business truth

Business truth is the domain state Afenda ultimately exists to manage.

Examples in future phases may include:

- organization structure
- master data
- finance structures
- transactional records

Business truth must not be collapsed into auth-only or session-only tables.

### 3.5 Evidence truth

Evidence truth is append-oriented governance data used to explain or investigate actions after the fact.

Audit data is not the same thing as transactional truth. It is a durable evidence layer around system behavior.

---

## 4. Tenant-First Rule

Afenda is tenant-first.

That means:

- business data belongs inside a tenant boundary unless explicitly justified otherwise
- tenant-scoped rows should carry a stable tenant key
- repositories and queries should default to tenant-scoped access
- cross-tenant operations are exceptional and must be explicit

The tenant boundary exists to prevent accidental leakage, not merely to help filtering.

When a table belongs to one organization, `tenant_id` should be part of the model. If a table has no tenant dimension, that absence should be intentional and explainable.

---

## 5. Identity Is Not Domain Party

The architecture must keep this distinction clear:

- **identity/principal** is the authenticated or linked actor inside Afenda
- **domain party** is a business actor such as a customer, supplier, employee, or contact

Sometimes the same real-world human appears in both roles. That does **not** mean the tables should be merged.

Correct approach:

- model identity/principal separately
- link to business entities explicitly when needed
- do not overload auth tables to represent business entities

This avoids coupling ERP truth to authentication lifecycle.

---

## 6. Database-First Invariants

If PostgreSQL can safely enforce an invariant that must always hold, prefer enforcing it in the database.

Typical examples:

- primary keys
- foreign keys
- uniqueness
- check constraints
- not-null guarantees
- append-only posture where required

Application code still matters, but app-only enforcement is not enough for structural truths.

The rule is:

- database enforces invariants
- application orchestrates workflows

Do not push all correctness into service code when the database can carry the rule more reliably.

---

## 7. Surrogate Keys and Business Meaning

The default identity rule is:

- use stable surrogate primary keys for joins and references
- preserve business identifiers separately when they matter

Do not confuse row identity with business identity.

A row’s PK exists to make the data model stable. Business keys exist to make the model meaningful. Mature designs often need both.

---

## 8. Migrations Are the Contract

Production schema evolution must go through migrations.

Doctrine here is strict:

- schema changes are not “just TypeScript changes”
- generated SQL must be reviewed
- production truth is the applied migration history, not an informal local state

This package may use Drizzle to define schema, but the contract with the real database is still the migration stream.

No ad hoc production edits without a documented migration or an explicit emergency runbook.

---

## 9. Drizzle and PostgreSQL Responsibilities

Drizzle is the schema and query layer. PostgreSQL is the data engine.

Use Drizzle for:

- table definitions
- type-safe queries
- shared schema exports
- migration generation workflow

Use PostgreSQL itself for:

- integrity guarantees
- indexes and performance features
- transactional safety
- advanced constraint behavior
- append-only or audit-sensitive patterns

Do not pretend the ORM is the architecture. The ORM is one implementation tool inside the architecture.

---

## 10. Present Truth vs Planned Truth

One of the main doctrine failures in this repo was mixing these two ideas:

- what the package currently implements
- what the package is expected to implement later

That must stop.

Going forward:

- current-state docs must describe only active package truth
- growth-sequence docs must describe the approved future order
- source/reference docs must be clearly marked as non-normative

A document must not silently slide between current truth and future design.

If it does, it becomes unreliable.

---

## 11. Documentation Rules

Documentation under `packages/_database/docs` must follow these rules:

### 11.1 Current-state docs

These describe only what exists in the active package.

If a table, module, export, or workflow has been removed, it must not remain documented as active.

### 11.2 Doctrine docs

These describe enduring principles and architecture constraints.

They should outlive one particular table set.

### 11.3 Growth docs

These describe sequence and direction:

- what comes next
- in what order
- under what assumptions

They must be labeled as future-oriented.

### 11.4 Source/reference docs

These are allowed, but they must be clearly marked as:

- source material
- exploration
- non-normative reference

They are not the same as package doctrine.

---

## 12. Rebuild Sequence Principle

The package should grow in intentional layers.

The approved architectural sequence is:

1. identity and tenant root
2. tenant membership and minimal principal context
3. business organization structure
4. authorization model
5. MDM and business master structures
6. stewardship and governance extensions
7. richer audit enrichment around stabilized business workflows

This order matters because it prevents upstream concepts from being built on unstable foundations.

---

## 13. Non-Negotiable Quality Bar

This package should reject low-standard database work.

That includes:

- documenting removed schema as current truth
- introducing broad future-state structures without clear need
- mixing auth truth and ERP truth
- relying on app code for invariants that PostgreSQL should enforce
- adding tables without a clear tenant and truth-boundary story

Any schema growth should be explainable in terms of:

- truth boundary
- tenant boundary
- migration safety
- downstream consumer impact
- long-term architectural fit

---

## 14. Decision Rule for Future Changes

When evaluating a new schema change, ask:

1. Which truth boundary does this belong to?
2. Is it tenant-scoped?
3. Is it current truth or future design?
4. What invariants belong in PostgreSQL?
5. Does it belong in the current phase, or is it being added too early?

If those questions are not answered clearly, the design is not ready.

---

## 15. Relationship to Other Docs

This doctrine should be read alongside:

- the current baseline doc for active package truth
- growth-sequence docs for phased rebuild direction
- glossary governance docs for naming and mapping discipline
- audit module docs for evidence-specific rules

Doctrine does not replace those documents. It constrains them.

---

## 16. Maintenance

Update this doctrine only when the architecture changes.

Do **not** update it merely because:

- one table was added
- one migration landed
- a short-term implementation detail changed

If the change is really a baseline or inventory change, update the baseline doc instead.

If the change is a future direction change, update the growth doc instead.
