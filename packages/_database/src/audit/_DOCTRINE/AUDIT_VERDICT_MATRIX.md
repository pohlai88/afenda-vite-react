# Audit doctrine verdict matrix (baseline)

Normative doctrine: [`AUDIT_ARCHITECTURE.md`](./AUDIT_ARCHITECTURE.md) and [`_agents/SKILL.md`](../_agents/SKILL.md).

This matrix records a baseline review against SKILL sections 1–10. Verdicts: **acceptable**, **acceptable_with_hardening**, **drifted**, **unsafe**.

| Layer                                                       | Verdict                   | Notes                                                                                                                                                                            |
| ----------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Doctrine (append-only, tenant, causal, evidence, privacy) | acceptable                | Append-only enforced in DB (triggers); `audit_logs` models immutable evidence; redaction at write via `buildAuditLog`.                                                           |
| 2 Schema                                                    | acceptable_with_hardening | Semantic Drizzle names vs physical `entity_type` / `created_at` documented in schema; FKs and indexes align with investigation paths.                                            |
| 3 Writer                                                    | acceptable_with_hardening | **Repaired:** `insertAuditLog` now runs `validateAuditLog` before persist. Prefer `insertGovernedAuditLog` + `buildAuditLog` for app emission (payload parsing + catalog merge). |
| 4 Invariants                                                | acceptable                | `assert-audit-invariants` + registry; validate layer enforces action/resolution/doctrine keys.                                                                                   |
| 5 Errors / verdicts                                         | acceptable_with_hardening | `AuditValidationError` + `audit-error-factory`; rare operational throws on empty `returning()` use explicit messaging.                                                           |
| 6 Payload (`changes` / `metadata`)                          | acceptable                | Zod contracts + redaction policy; not a shadow schema for core semantics.                                                                                                        |
| 7 Query / index fitness                                     | acceptable_with_hardening | Composite `tenant + subject + time` added where subject-scoped listing is hot; see schema + `audit-query-service`.                                                               |
| 8 Cleanup / tree-shaking                                    | acceptable                | Single serializer path; exports via `audit/index.ts`.                                                                                                                            |
| 9 Drift detection                                           | acceptable_with_hardening | Duplicate SQL copies under `src/audit/migrations` removed; canonical migrations in `packages/_database/drizzle/`.                                                                |
| 10 Troubleshooting                                          | acceptable                | Error messages include invariant / validation context where applicable.                                                                                                          |

**Full-stack boundary:** HTTP audit emission lives in `apps/api` (dev/demo), calling `insertGovernedAuditLog` with headers mapped to causal fields.
