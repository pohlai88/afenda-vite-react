# 002A — Physical inventory & architecture map (`@afenda/database`)

**Status:** normative physical companion to [002-foundation-inventory.md](./002-foundation-inventory.md).

**Purpose:** 002 defines the **logical foundation**. This document defines the **physical implementation map**: where the database package stores DDL, what the current on-disk inventory is, how Drizzle Kit sees it, where read models and hardening live, and which naming rules keep the package coherent.

**Authority chain**

| Artifact                                                     | Meaning                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [001-postgreSQL-DDL.md](./001-postgreSQL-DDL.md)             | Database doctrine and invariant charter                                  |
| [002-foundation-inventory.md](./002-foundation-inventory.md) | Logical foundation inventory: domains, modules, must-have table families |
| **002A-foundation-inventory-architecture.md**                | Physical inventory and implementation map                                |
| [008-db-tree.md](./008-db-tree.md)                           | Canonical path registry / placement truth                                |
| [schema-inventory.json](./schema-inventory.json)             | Machine-verified file inventory for `src/schema/` and `src/7w1h-audit/`  |

**Naming model**

- `001` = doctrine
- `002` = logical inventory
- `002A` = physical inventory
- `008` = path registry
- `schema-inventory.json` = machine inventory

This naming split is the standard. Do not use "knowledge base", "tree", "inventory", and "architecture" as interchangeable labels.

---

## 1. Physical truth layers

| Layer                                     | Scope                                                                                          | Canonical location                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **L1 - Declarative schema graph**         | Drizzle-visible DDL, enums, views, schema handles, Zod boundaries required by the schema graph | `packages/_database/src/schema/**`, `packages/_database/src/7w1h-audit/**`, `packages/_database/src/views/**` |
| **L2 - Relational and query composition** | Drizzle `relations()` graph and canonical resolver/read-model code                             | `packages/_database/src/relations/**`, `packages/_database/src/queries/**`                                    |
| **L3 - PostgreSQL hardening SQL**         | Partial uniques, exclusion constraints, triggers, RLS, functions, hardening patches            | `packages/_database/sql/hardening/**`                                                                         |
| **L4 - Generated migration output**       | Drizzle Kit SQL output and migration journal                                                   | `packages/_database/drizzle/**`                                                                               |
| **L5 - Studio / metadata snapshots**      | Glossary, enum allowlists, truth-governance snapshots                                          | `packages/_database/src/studio/**`                                                                            |

`002` explains **what must exist**. `002A` explains **how it is physically organized**.

---

## 2. Standard naming conventions

### 2.1 PostgreSQL namespace names

These names are canonical and must match `pgSchema(...)` usage and `DRIZZLE_MANAGED_PG_SCHEMAS`:

- `ref`
- `iam`
- `mdm`
- `finance`
- `governance`
- `drizzle` for Drizzle Kit metadata only

### 2.2 File role naming

| Pattern                           | Meaning                                                                                        | Example                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/schema/<domain>/_schema.ts`  | `pgSchema("...")` namespace handle                                                             | `src/schema/mdm/_schema.ts`              |
| `src/schema/<domain>/*.schema.ts` | Drizzle schema module: `pgTable`, `pgEnum`, `pgView`, boundary schema tied to the schema graph | `src/schema/finance/accounts.schema.ts`  |
| `src/schema/<domain>/index.ts`    | Domain barrel                                                                                  | `src/schema/governance/index.ts`         |
| `src/views/*.ts`                  | Read-model view definitions re-exported through `src/schema/index.ts`                          | `src/views/mdm-canonical-views.ts`       |
| `src/relations/*-relations.ts`    | Drizzle `relations()` modules                                                                  | `src/relations/mdm-relations.ts`         |
| `src/queries/*.ts`                | Canonical query / resolver modules                                                             | `src/queries/resolve-item-settings.ts`   |
| `src/schema/<support>/*.ts`       | Support modules, not alternate DDL roots                                                       | `src/schema/pkg-governance/constants.ts` |

### 2.3 Support-folder naming

These are logical support folders only; they are **not** extra PostgreSQL namespaces:

- `src/schema/identity/`
- `src/schema/tenancy/`
- `src/schema/pkg-governance/`
- `src/schema/helpers/`
- `src/schema/constants/`

### 2.4 Reserved suffix rule

`src/schema/pkg-governance/schema-modules.ts` defines `*.schema.ts` as the package convention for Drizzle schema modules.

Current naming exceptions still on disk:

- `src/relations/relations.schema.ts`
- `src/studio/business-glossary.schema.ts`
- `src/studio/studio-enums.schema.ts`
- `src/studio/studio-snapshot-metadata.schema.ts`
- `src/studio/truth-governance.schema.ts`

Treat those as **documented exceptions / naming debt**, not as the desired general rule.

### 2.5 7W1H audit placement rule

`src/7w1h-audit/` is a **sibling** of `src/schema/`, not a child of `src/schema/governance/`. Its DDL still belongs to PostgreSQL schema `governance` because `src/schema/governance/index.ts` re-exports it into the Drizzle schema graph.

---

## 3. Drizzle configuration contract

Current authoritative values from `packages/_database/drizzle.config.ts` and `src/schema/pkg-governance/constants.ts`:

| Setting             | Value                                                   |
| ------------------- | ------------------------------------------------------- |
| `dialect`           | `postgresql`                                            |
| `schema`            | `./src/schema/index.ts`                                 |
| `out`               | `./drizzle`                                             |
| `verbose`           | `true`                                                  |
| `strict`            | `true`                                                  |
| `schemaFilter`      | `iam`, `mdm`, `ref`, `finance`, `governance`, `drizzle` |
| `migrations.schema` | `drizzle`                                               |

Key consequence:

- Drizzle Kit sees the schema graph through `src/schema/index.ts`
- `src/schema/index.ts` re-exports domain modules and `../views`
- `src/schema/governance/index.ts` re-exports `src/7w1h-audit/*`
- objects outside the managed schema filter are not reconciled by Drizzle Kit

---

## 4. Complete registered schema inventory

**Machine source of truth:** [schema-inventory.json](./schema-inventory.json)

Current recorded state:

- roots: `src/schema`, `src/7w1h-audit`
- file count: `102`
- generated at: `2026-04-18T04:55:00.279Z`

This section mirrors that inventory in human-readable tree form.

```text
packages/_database/
  src/
    schema/
      index.ts

      shared/
        columns.schema.ts
        enums.schema.ts
        helpers.ts
        index.ts
        shared-boundary.schema.ts
        __tests__/
          shared-boundary.test.ts

      ref/
        _schema.ts
        countries.schema.ts
        currencies.schema.ts
        index.ts
        locales.schema.ts
        ref-boundary.schema.ts
        timezones.schema.ts
        uoms.schema.ts
        __tests__/
          ref-boundary.schemas.test.ts

      mdm/
        _schema.ts
        addresses.schema.ts
        business-units.schema.ts
        custom-field-definitions.schema.ts
        custom-field-values.schema.ts
        customers.schema.ts
        document-sequences.schema.ts
        external-identities.schema.ts
        index.ts
        item-categories.schema.ts
        item-entity-settings.schema.ts
        items.schema.ts
        legal-entities.schema.ts
        locations.schema.ts
        master-aliases.schema.ts
        mdm-boundary.schema.ts
        org-units.schema.ts
        parties.schema.ts
        party-addresses.schema.ts
        suppliers.schema.ts
        tax-registrations.schema.ts
        tenant-label-overrides.schema.ts
        tenant-policies.schema.ts
        tenant-profiles.schema.ts
        tenants.schema.ts
        __tests__/
          mdm-boundary.test.ts

      iam/
        _schema.ts
        auth-challenges.schema.ts
        authority-policies.schema.ts
        iam-boundary.schema.ts
        identity-links.schema.ts
        index.ts
        persons.schema.ts
        tenant-memberships.schema.ts
        tenant-role-assignments.schema.ts
        tenant-roles.schema.ts
        user-accounts.schema.ts
        user-identities.schema.ts
        __tests__/
          iam-boundary.test.ts

      finance/
        _schema.ts
        accounts.schema.ts
        chart-of-account-sets.schema.ts
        finance-boundary.schema.ts
        fiscal-calendars.schema.ts
        fiscal-periods.schema.ts
        index.ts
        legal-entity-coa-assignments.schema.ts
        __tests__/
          finance-boundary.schemas.test.ts

      governance/
        _schema.ts
        data-sources.schema.ts
        governance-boundary.schema.ts
        index.ts
        __tests__/
          governance-boundary.schemas.test.ts

      identity/
        index.ts
        services/
          ensure-identity-link-for-better-auth-user.ts

      tenancy/
        index.ts
        tenancy-boundary.schema.ts
        services/
          assert-user-has-tenant-access.ts
          resolve-active-tenant-context.ts
          resolve-afenda-me-context.ts
        __tests__/
          tenancy-boundary.test.ts

      pkg-governance/
        constants.ts
        database-concepts.ts
        index.ts
        migration-sql-files.ts
        pkg-governance-boundary.schema.ts
        schema-modules.ts
        sql-identifiers.ts
        __tests__/
          governance.test.ts

      helpers/
        env-boundary.schema.ts
        env.ts
        index.ts

      constants/
        runtime.ts

    7w1h-audit/
      audit-enums.schema.ts
      audit-logs.schema.ts
      index.ts
      seven-w1h-audit-boundary.schema.ts
      contracts/
        audit-action-catalog.ts
        audit-query-contract.ts
        audit-seven-w1h-query-manifest.ts
      services/
        audit-query-service.ts
        build-audit-log.ts
        insert-audit-log.ts
        validate-audit-log.ts
      __tests__/
        audit-query-contract.test.ts
        seven-w1h-audit-boundary.schemas.test.ts
```

---

## 5. Supporting package inventory outside the registered schema roots

These files are part of the physical database package architecture, but they are not included in `schema-inventory.json`.

### 5.1 Relations inventory

```text
packages/_database/src/relations/
  finance-relations.ts
  governance-relations.ts
  iam-relations.ts
  mdm-relations.ts
  README.md
  ref-relations.ts
  relation-names.ts
  relations.schema.ts
```

### 5.2 Queries inventory

```text
packages/_database/src/queries/
  index.ts
  README.md
  resolve-current-tenant-policy.ts
  resolve-item-settings.ts
  resolve-membership-scope.ts
  helpers/
    effective-row.ts
    iso-date.ts
    scope-utils.ts
  __tests__/
    iso-date.test.ts
    scope-utils.test.ts
```

### 5.3 Views inventory

```text
packages/_database/src/views/
  index.ts
  mdm-canonical-views.ts
  README.md
```

### 5.4 Studio / metadata inventory

```text
packages/_database/src/studio/
  build-studio-snapshots.ts
  business-glossary.schema.ts
  business-glossary.snapshot.json
  business-glossary.ts
  business-glossary.types.ts
  database-truth-governance.snapshot.json
  index.ts
  pg-enum-allowlist.ts
  query-allowlisted-pg-enums.ts
  studio-enums.schema.ts
  studio-snapshot-metadata.schema.ts
  studio-snapshots-public.ts
  truth-governance.schema.ts
  truth-governance.ts
```

### 5.5 Package-root runtime anchors

```text
packages/_database/
  drizzle.config.ts
  package.json
  src/
    client.ts
    index.ts
    migrations/
      index.ts
    schema/
      __tests__/
        schema-contract.test.ts
      helpers/
        __tests__/
          helpers-env.test.ts
    __tests__/
      002a-physical-inventory.test.ts
      database-doctrine.test.ts
      hardening-patches.test.ts
      helper-boundary.test.ts
      web-boundary.test.ts
      studio/
        business-glossary-matrix.test.ts
        business-glossary-refine.test.ts
        studio-enum-glossary-parity.test.ts
        studio-yaml-snapshot-parity.test.ts
```

---

## 6. Hardening SQL inventory

`drizzle-kit push` and `drizzle-kit migrate` do not replace these files. They are the PostgreSQL-native hardening layer.

```text
packages/_database/sql/hardening/
  README.md
  patch_a_triggers.sql
  patch_b_parties_canonical_name_normalized.sql
  patch_c_gin_trgm_indexes.sql
  patch_d_partial_unique_indexes.sql
  patch_e_nullable_scope_uniqueness.sql
  patch_f_master_aliases_preferred.sql
  patch_g_document_sequences_default.sql
  patch_h_temporal_overlap.sql
  patch_i_master_domain_validation.sql
  patch_j_allocate_document_number.sql
  patch_k_canonical_views.sql
  patch_l_row_level_security.sql
  patch_m_tenant_role_assignment_scope.sql
  patch_n_temporal_overlap_wave.sql
```

Current canonical apply order:

1. `patch_a_triggers.sql`
2. `patch_b_parties_canonical_name_normalized.sql`
3. `patch_d_partial_unique_indexes.sql`
4. `patch_e_nullable_scope_uniqueness.sql`
5. `patch_f_master_aliases_preferred.sql`
6. `patch_g_document_sequences_default.sql`
7. `patch_c_gin_trgm_indexes.sql`
8. `patch_h_temporal_overlap.sql`
9. `patch_i_master_domain_validation.sql`
10. `patch_j_allocate_document_number.sql`
11. `patch_k_canonical_views.sql`
12. `patch_l_row_level_security.sql`
13. `patch_m_tenant_role_assignment_scope.sql`
14. `patch_n_temporal_overlap_wave.sql`

---

## 7. Generated migration inventory state

Current on-disk state:

```text
packages/_database/drizzle/
  .gitignore
```

This means:

- the configured output directory already exists
- no generated migration SQL is currently checked in here
- when migrations are generated, this folder becomes part of the physical truth layer and must be reviewed with the schema change

---

## 8. Script contract

Current package scripts relevant to this architecture:

| Script                      | Role                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `db:inventory:sync`         | regenerate `schema-inventory.json`                                                                                  |
| `db:inventory:verify`       | verify inventory JSON matches disk                                                                                  |
| `db:002a:verify`            | verify on-disk files match directory trees in this document (`002A`)                                                |
| `db:guard`                  | typecheck + schema module guard + inventory verify + 002A tree verify + hardening verify + schema/query/audit tests |
| `db:guard:ci`               | CI-safe `db:guard` variant (includes `db:002a:verify`)                                                              |
| `db:generate`               | run guard then `drizzle-kit generate`                                                                               |
| `db:check-migrations`       | migration journal hygiene                                                                                           |
| `db:verify-migrations-sync` | verify migration state consistency                                                                                  |
| `db:ci`                     | combined database CI gate                                                                                           |
| `db:migrate`                | apply generated migrations                                                                                          |
| `db:push`                   | guarded `drizzle-kit push`                                                                                          |
| `db:push:force`             | forced guarded push                                                                                                 |
| `db:apply-hardening`        | apply hardening SQL patches                                                                                         |
| `db:sync-glossary-enums`    | sync studio glossary / enum metadata                                                                                |

---

## 9. Clarified relationship to 002

`002` and `002A` are complementary, not competing documents.

| Document | Primary question it answers                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `002`    | Which PostgreSQL domains, logical modules, and table families must exist?                                                |
| `002A`   | Where do those concerns live physically in this package, how are they wired into Drizzle, and what is on disk right now? |

Use `002` for **logical planning**. Use `002A` for **implementation mapping, review, and repository orientation**.

---

## 10. Current gap vs 001

Compared with [001-postgreSQL-DDL.md](./001-postgreSQL-DDL.md), the following Layer 5 governance surfaces are still identified as architectural targets rather than current on-disk modules:

- `survivorship-rules.schema.ts`
- `master-records.schema.ts`
- `master-record-matches.schema.ts`
- `master-record-merges.schema.ts`
- `data-quality-issues.schema.ts`

If implemented, their clean physical home is:

```text
packages/_database/src/schema/governance/
```

They must also be:

- re-exported from `src/schema/governance/index.ts`
- visible through `src/schema/index.ts`
- reflected in `008-db-tree.md`
- reflected in `schema-inventory.json`

---

## 11. Maintenance rule

Update `002A` when any of these change:

- the physical package layout
- the schema graph entry / export wiring
- the naming convention
- the hardening patch inventory
- the generated migration inventory model

Do **not** update `002A` just to restate doctrine already owned by `001`, unless the physical implementation contract changes with it.

---

## Document history

| Version | Date       | Notes                                                                                                                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0     | 2026-04-18 | Reframed 002A as the physical inventory companion to 002; standardized naming model; refreshed full on-disk inventory to include `src/7w1h-audit`, `src/views`, current queries, hardening, and migration output state. |
| 1.1     | 2026-04-18 | Added machine inventory note and file-count coupling.                                                                                                                                                                   |
| 1.0     | 2026-04-18 | Initial architecture-and-tree companion draft.                                                                                                                                                                          |
