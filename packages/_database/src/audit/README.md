# Audit (`src/audit`)

Server-side **append-only audit evidence** for Afenda: governed action keys, validated payloads, Drizzle schema, read models, investigation/query helpers, and retention services. This is accountability and forensics data—not application debug logging.

## Normative documentation

| Document                                                                         | Role                                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [docs/AUDIT_ARCHITECTURE.md](../../../../docs/AUDIT_ARCHITECTURE.md) (repo root) | Short index; links back to this module, doctrine, and `drizzle/` |
| [\_DOCTRINE/AUDIT_ARCHITECTURE.md](./_DOCTRINE/AUDIT_ARCHITECTURE.md)            | Platform doctrine: principles, dimensions, governance            |
| [\_DOCTRINE/AUDIT_VERDICT_MATRIX.md](./_DOCTRINE/AUDIT_VERDICT_MATRIX.md)        | Baseline layer verdicts vs SKILL checklist                       |
| [\_agents/SKILL.md](./_agents/SKILL.md)                                          | Full agent checklist for audit code and migrations               |

**Retention and SQL (no separate markdown leaf docs yet):** policy classes live in [`contracts/audit-retention-policy.ts`](./contracts/audit-retention-policy.ts); disposition and query helpers in [`services/audit-retention-service.ts`](./services/audit-retention-service.ts) and [`services/audit-retention-query-service.ts`](./services/audit-retention-query-service.ts). Table DDL and migrations are under [`../../drizzle/`](../../drizzle/) — see the repo-root audit index above for the pointer.

## Layout

| Folder        | Contents                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `contracts/`  | Action catalog, doctrine/invariant/resolution registries, payload and query contracts, redaction and retention policy types |
| `schema/`     | Drizzle tables (`audit-logs`) and enums                                                                                     |
| `relations/`  | Drizzle relations for audit tables                                                                                          |
| `services/`   | Build/validate/insert pipeline, invariant assertions, query/investigation/read-model/retention services                     |
| `read-model/` | Admin-facing and investigation summary shapes                                                                               |
| `utils/`      | `AuditError` / `AuditValidationError`, JSON helpers, audit context builders, serialization                                  |
| `_agents/`    | Agent-facing audit checklist (SKILL)                                                                                        |
| `__tests__/`  | Vitest coverage for contracts, pipeline, and services                                                                       |

Drizzle SQL for `audit_logs` and related objects lives under [`../../drizzle/`](../../drizzle/), not under `src/audit/`.

Public exports are defined in [`index.ts`](./index.ts).

## Governed registries (canonical keys)

The TypeScript modules under `contracts/` are the **source of truth**. The lists below are for quick navigation; when adding or renaming keys, update the registry files first, then keep this section aligned.

### Doctrine categories

`audit`, `identity`, `scope`, `administration` — see [`audit-doctrine-registry.ts`](./contracts/audit-doctrine-registry.ts) (`auditDoctrineCategoryValues`).

### Doctrines (`auditDoctrineRegistry`)

| Key                                                    |
| ------------------------------------------------------ |
| `doctrine.audit.append-only`                           |
| `doctrine.identity.attributable-action`                |
| `doctrine.identity.delegation-transparent`             |
| `doctrine.scope.operation-bounded`                     |
| `doctrine.administration.privileged-actions-auditable` |

### Invariants (`auditInvariantRegistry`)

| Key                                                          |
| ------------------------------------------------------------ |
| `invariant.audit.no-in-place-correction`                     |
| `invariant.identity.actor-required-for-user-action`          |
| `invariant.identity.delegation-must-be-explicit`             |
| `invariant.scope.tenant-required-for-governed-write`         |
| `invariant.scope.legal-entity-required-when-applicable`      |
| `invariant.administration.privileged-action-must-be-audited` |

Invariant **severity** levels: `low`, `medium`, `high`, `critical` (`auditInvariantSeverityValues`).

### Actions (`auditActionCatalog`)

| Key                       |
| ------------------------- |
| `auth.login.succeeded`    |
| `auth.login.failed`       |
| `invoice.created`         |
| `invoice.posted`          |
| `audit.redaction.applied` |

### Resolutions (`auditResolutionCatalog`)

| Key                                            |
| ---------------------------------------------- |
| `resolution.none`                              |
| `resolution.invoice.posting-approved`          |
| `resolution.invariant.override-approved`       |
| `resolution.audit.redaction-approved`          |
| `resolution.reconciliation.adjustment-applied` |

### Stable error codes (`auditErrorCodeRegistry`)

| Code          | Invariant                                               | Default resolution                       |
| ------------- | ------------------------------------------------------- | ---------------------------------------- |
| `INV-AUD-001` | `invariant.audit.no-in-place-correction`                | `resolution.invariant.override-approved` |
| `INV-ID-001`  | `invariant.identity.actor-required-for-user-action`     | `resolution.none`                        |
| `INV-FX-001`  | `invariant.scope.legal-entity-required-when-applicable` | `resolution.invoice.posting-approved`    |

## Consumption

Import from the database package root or the audit entry point (both resolve to the same surface):

```ts
import { insertGovernedAuditLog, buildAuditLog } from "@afenda/database"
// or
import { insertGovernedAuditLog } from "@afenda/database/audit"
```

**Preferred write path for app-emitted audit:** `insertGovernedAuditLog(db, input)` — it runs `buildAuditLog` (catalog merge, payload redaction/parse, `validateAuditLog`) then persists via `insertAuditLog`.

`insertAuditLog` applies `validateAuditLog` before insert and sets default `occurredAt` / `recordedAt` when omitted. Use it only when the row is already fully governed (e.g. pre-built `NewAuditLog`); prefer `insertGovernedAuditLog` for normal call sites.

## Validation

From the repo root (Turborepo):

```bash
pnpm exec turbo run typecheck --filter=@afenda/database
pnpm exec turbo run lint --filter=@afenda/database
pnpm exec turbo run test:run --filter=@afenda/database
```

From `packages/_database` (same package, direct scripts):

```bash
pnpm typecheck
pnpm lint
pnpm test:run
```

Audit-only tests (faster iteration):

```bash
pnpm exec vitest run src/audit
```

Audit tests live under `src/audit/__tests__/`.

## Related

- Package overview: [packages/\_database/README.md](../../README.md)
- Migrations and Drizzle commands are owned at the `@afenda/database` package level (`db:generate`, `db:migrate`).
