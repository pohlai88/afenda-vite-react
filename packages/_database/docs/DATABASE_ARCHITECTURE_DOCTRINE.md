# Database architecture doctrine

This document defines **how Afenda reasons about PostgreSQL data**: what “truth” means, how multi-tenancy and identity interact with ERP facts, and how **business language** relates to **technical identifiers** (tables, columns, Drizzle modules). It complements operational guidance in [Database](../../../docs/DATABASE.md) and the machine-readable [business ↔ technical glossary](./data/business-technical-glossary.yaml).

**Audience:** product, backend, data, and anyone authoring migrations or seeds. **Normative detail for audit evidence** remains in the audit module—see [Audit architecture](../../../docs/AUDIT_ARCHITECTURE.md).

---

## 1. Purposes

1. **Shared vocabulary** — The same business term should map to the same tables and columns across services, docs, and scripts (see glossary).
2. **Tenant safety** — Data that belongs to a customer organization is **scoped** so it cannot leak across tenants by accident.
3. **Traceability** — Prefer explicit foreign keys and named constraints; align with `@afenda/database` governance (`*.schema.ts`, migration naming).
4. **Evolvable schema** — New domains extend the model without collapsing unrelated concepts into one table.

---

## 2. Layers of truth

| Layer | Meaning | Examples |
| ----- | ------- | -------- |
| **Authentication subject** | Who can sign in and hold sessions | User identity, OAuth links, challenge tokens (auth companion) |
| **Authorization** | What they may do in which tenant | Memberships, roles, permissions, invitations, scoped grants |
| **Organization structure** | How the company models itself | Legal entities, org units, locations, business units |
| **Transactional / ERP facts** | Day-to-day business operations | Orders, inventory movements, postings (as modules land) |
| **Evidence** | Durable, append-oriented records for governance | Audit logs (see audit doctrine) |

**Doctrine:** do not store long-lived ERP truth only inside auth-only tables. **Identity** answers *who*; **tenant membership and roles** answer *where* and *what they may do*; **domain tables** answer *business state*.

---

## 3. Multi-tenancy

- A **tenant** is an **organization** (customer) whose data is isolated from others.
- **Tenant-scoped rows** carry a stable tenant key (for example `tenant_id`) where the row belongs to one org. Queries and repositories **default to filtering by that key** unless the operation is explicitly cross-tenant and governed.
- **Platform-only** data (no tenant) is rare and must be justified and documented.

---

## 4. Identity vs domain party

- **User** (and linked **identities**) describe sign-in and account linkage.
- **Employees, customers, suppliers** as business actors may be modeled as **domain parties** or module-specific profiles—not as duplicates of the auth user row. Link with explicit keys when a person both signs in and appears in HR or CRM data.

---

## 5. Master vs transactional data (ERP orientation)

- **Master data** — Relatively stable definitions used across transactions (items, UoM, calendars, org structure). Prefer **normalized** tables and clear ownership.
- **Transactional data** — Events and balances that reference master keys. **Measurements** (quantity, money, time) belong on transactions or dependent rows; attach **units and currency** explicitly when the business meaning requires it.

When in doubt, name and model the **business operation** first, then map to tables; use the glossary to record the mapping.

---

## 6. Naming and documentation split

| Concern | Convention |
| ------- | ------------ |
| **Postgres identifiers** | `snake_case` tables/columns; stable, searchable names; follow repo governance and `sql-identifiers` patterns in `@afenda/database`. |
| **Drizzle modules** | One concern per `*.schema.ts` file; barrel exports under `packages/_database/src/schema/`. |
| **Human / product docs** | Lead with **business terms**; link to technical names via the glossary. |
| **Scripts and codegen** | May read [business-technical-glossary.yaml](./data/business-technical-glossary.yaml) for stable keys and paths. |

---

## 7. Migrations and seeds

- **Migrations** are the versioned contract with production; generate from schema changes, review SQL, apply with the governed workflow ([Database](../../../docs/DATABASE.md)).
- **Seeds** are classified (bootstrap, reference, tenant fixtures, volume); they **do not replace** migrations. See §4.1 in [Database](../../../docs/DATABASE.md).

---

## 8. Relationship to other docs

| Topic | Where |
| ----- | ----- |
| Connection strings, layout, scripts | [Database](../../../docs/DATABASE.md) |
| Business ↔ table/column mapping (machine-readable) | [data/business-technical-glossary.yaml](./data/business-technical-glossary.yaml) |
| ERP vocabulary (product language) | [Glossary](../../../docs/GLOSSARY.md) |
| Audit evidence rules | [Audit architecture](../../../docs/AUDIT_ARCHITECTURE.md) and `packages/_database/src/audit/` |
| API tenancy and routes | [API reference](../../../docs/API.md) |
| Roles and permissions | [Roles and permissions](../../../docs/ROLES_AND_PERMISSIONS.md) |

---

## 9. Maintenance

- When you add or rename a **user-visible business concept** with a database footprint, update **this doctrine** if rules change, and add or adjust an entry in **business-technical-glossary.yaml**.
- Breaking renames across environments go through **migrations** and coordinated API/doc updates—not ad hoc data fixes in production without a runbook.
