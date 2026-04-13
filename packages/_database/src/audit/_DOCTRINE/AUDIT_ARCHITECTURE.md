# Audit architecture (doctrine and evidence model)

Normative guidance for **durable audit evidence** in Afenda’s PostgreSQL layer (`@afenda/database`). This is not application logging, admin “recent activity,” or unstructured JSON dumps—it is an **accountability and investigation** substrate for a multi-tenant ERP-style platform.

**Implementation artifacts** (Drizzle tables, migrations, writers) live under `packages/_database` (see [Database](./DATABASE.md)). This document defines **doctrine**, **minimum semantic dimensions**, and **governance expectations**.

---

## 1. Purpose

Audit answers forensic and compliance questions: who did what, to which business objects, when, from where, under what authority, with what causal chain, with what evidence, and with what outcome—including downstream effects across commands, jobs, and integrations.

---

## 2. Core principles

| Principle                | Meaning                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| **Append-first**         | Rows are immutable after commit; corrections are **compensating events**, not silent edits. |
| **Tenant-bounded**       | Every record is scoped to an auditable jurisdiction (at minimum `tenant_id`).               |
| **Causally traceable**   | Support reconstruction of chains (request → command → derived writes → notifications).      |
| **Evidence-oriented**    | Store **minimum necessary** proof (deltas, hashes, refs)—not full duplicate domains.        |
| **Privacy-governed**     | PII and secrets are classified, scrubbed, masked, or forbidden—not “dumped in JSON.”        |
| **Investigation-shaped** | Indexes and columns match real query paths (tenant/time, subject, actor, correlation).      |
| **Human-readable**       | Stable action keys and catalogs; free text is supplementary, not the only semantics.        |

---

## 3. Jurisdiction and scope (beyond a single `tenant_id`)

`tenant_id` is mandatory for typical SaaS boundaries. For ERP and compliance, **plan for additional scope** when the product needs it:

- **Organization** (if tenant ≠ org for your domain)
- **Environment** (`prod` / `staging` / `sandbox`) if audit aggregates across deployments
- **Legal entity** when finance or statutory boundaries differ from “tenant”

Not every column is required on day one; **do not treat “tenant only” as forever sufficient** if investigations routinely cross those lines.

---

## 4. Actor model (not only nullable `actor_id`)

A nullable FK to `persons` is insufficient for forensics. Prefer a **typed actor envelope**:

- **Kind**: human, service account, system, integration/API client, scheduler, migration/replay, policy engine, AI-assisted, unknown
- **Identity**: stable id where applicable; optional display snapshot for deleted principals
- **Delegation / impersonation**: `acting_as` / delegated context when supported by auth
- **Auth context**: link to session or auth event when investigations require it

Store enough to distinguish **automation**, **integrations**, and **impersonation** without mislabeling them as “anonymous.”

---

## 5. Actions: stable keys and a governed catalog

Use **dot-notation** action keys (e.g. `invoice.posted`, `person.created`) and move toward a **catalog** (table or registry in code) that records:

- Domain, verb, human description
- Risk / severity, security sensitivity
- Whether user-visible, whether it impacts **financial truth**
- Whether reason codes, approvals, or attachments are required
- Whether reversals are modeled and how

Free-text `action` columns without a catalog **rot** over time; the catalog is what makes reporting and policy automation possible.

---

## 6. Subject model: polymorphic base, multiple pointers when needed

`entity_type` + `entity_id` is a valid **polymorphic** pattern (no FK to every table). For enterprise investigations, **one pointer is often not enough**. Evolve toward explicit roles when required:

- **Primary subject** (the main business object acted upon)
- **Aggregate root** (consistency boundary)
- **Document** (printable/legal artifact)
- **Parent / causation** link (`parent_event_id` or `causation_id`) for workflows and multi-step operations

Name columns for **your** ubiquitous language (`subject`, `aggregate`, `document`, `case`, `batch`) rather than forcing everything into a single “entity.”

---

## 7. Evidence frame (7W1H-style)

Model dimensions explicitly so rows can answer investigations without reconstructing from logs alone.

| Dimension              | Typical fields                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| **Who**                | actor type, ids, impersonation, approver where relevant                                    |
| **What**               | action key, category, subject(s), outcome                                                  |
| **When**               | occurred, recorded, effective (see §9)                                                     |
| **Where**              | tenant/jurisdiction, environment, IP, user agent, region/service if needed                 |
| **Why**                | reason code, free text, policy/doctrine refs where applicable                              |
| **How**                | source channel (`ui`, `api`, `import`, `job`, `workflow`, `replay`), execution path        |
| **With what evidence** | structured `changes`, scrubbed `metadata`, attachment refs, hashes                         |
| **What result**        | outcome (`success`, `rejected`, `failed`, `partial`), error code, state transition summary |

---

## 8. `changes` vs `metadata` (disciplined JSON)

| Bucket         | Use for                                                                        | Avoid                                                   |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **`changes`**  | Before/after or normalized field deltas, transition summaries                  | Secrets, tokens, full PII dumps when a summary suffices |
| **`metadata`** | Route, module, feature flags, batch/import ids, UI surface, correlation extras | Unbounded “dump anything here”                          |

Define **scrubbing rules** at write time; do not rely on documentation alone.

---

## 9. Time: multiple instants

Prefer separating:

- **Occurred at** — when the business action happened (user clock)
- **Recorded at** — when the audit row was persisted (system clock)
- **Effective at** — business-effective date/time (posting period, backdated operations)
- **Ingested at** (optional) — external/import pipelines

One timestamp is often ambiguous in ERP (performed now, effective last period, imported later).

---

## 10. Correlation: request, causation, and business operation

Minimum: `request_id`, `trace_id` (distributed tracing).

**Often also needed** for truth platforms: `command_id`, `correlation_id`, `causation_id`, `session_id`, `job_id`, `batch_id`, `idempotency_key`—so one user action that fans out to many writes remains **one reconstructible story**.

Distinguish:

- **Request correlation** — one inbound HTTP/command
- **Causal correlation** — which audit event caused this event
- **Business correlation** — which business operation owns this row

---

## 11. Outcome and errors

Record **whether the action succeeded** and how the domain state moved:

- Outcome enum (at least success vs failure vs partial/rejected)
- Stable `error_code` where applicable
- Optional `state_transition` / version before-after summaries for high-value entities

---

## 12. Append-only and mutation doctrine

Treat audit as **append-only by default**:

- No updates/deletes in application code for “fixes”
- Corrections via **new** events
- **Redaction** and **retention** via governed processes, not ad-hoc row edits
- DB privileges and triggers (where used) reinforce immutability

**Avoid cascade-deleting audit history** when a tenant or person is removed; prefer archival, tombstoning, or retention-policy purge under explicit workflow. Audit often **outlives** operational rows.

---

## 13. PII and secrets

- Classify fields: allowed cleartext, masked, hashed, forbidden in audit payloads
- Scrub before persist; never store passwords, raw tokens, or full payment instruments in `jsonb`
- Define **retention by sensitivity** and support **legal hold** when required

---

## 14. AI lineage (evidence, not decoration)

When AI affects outcomes, record enough to reconstruct accountability: model id/version, prompt/template id/version, tool/policy pack version, input/output refs or hashes, and human override/approval when applicable—not merely “AI was involved.”

---

## 15. Physical design and scale

Baseline indexes usually include: tenant, subject (type + id), actor, time, request/trace, and common composites such as **tenant + time**, **subject + time**, **action + time**, **outcome + time** for failure mining.

At higher volume: **partitioning** (often by time), **cold/archive** stores, **aggregated projections** for admin UI, and search indexes only where justified.

Do not over-build early; **design correlation and subject columns** so partitioning and archival can be added without rewriting semantics.

---

## 16. Reference record shape (illustrative TypeScript)

The following is a **contract sketch** for discussion and schema evolution—not a mandate to add every column at once:

```ts
type AuditRecord = {
  id: string

  tenantId: string
  organizationId?: string | null
  environment: "prod" | "staging" | "sandbox"

  actorType: "person" | "service" | "system" | "integration" | "ai" | "unknown"
  actorId?: string | null
  actorDisplay?: string | null
  actingAsPersonId?: string | null

  action: string
  actionCategory?: string | null
  reasonCode?: string | null
  reasonText?: string | null

  subjectType: string
  subjectId?: string | null
  aggregateType?: string | null
  aggregateId?: string | null
  documentType?: string | null
  documentId?: string | null

  sourceChannel: "ui" | "api" | "workflow" | "job" | "import" | "replay"
  requestId?: string | null
  traceId?: string | null
  correlationId?: string | null
  causationId?: string | null
  commandId?: string | null
  sessionId?: string | null
  jobId?: string | null
  batchId?: string | null

  ipAddress?: string | null
  userAgent?: string | null

  outcome: "success" | "rejected" | "failed" | "partial"
  errorCode?: string | null

  occurredAt: string
  recordedAt: string
  effectiveAt?: string | null

  changes?: unknown
  metadata?: unknown

  doctrineRef?: string | null
  invariantRef?: string | null
  resolutionRef?: string | null

  aiModelVersion?: string | null
  aiPromptVersion?: string | null

  retentionClass?: string | null
  legalHold?: boolean | null
}
```

Map columns to Drizzle types, constraints, and indexes incrementally as products require them.

---

## Related docs

- [Database](./DATABASE.md) — Drizzle package layout, migrations, tenant-oriented schema
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) — authorization vs audit evidence
- [API reference](./API.md) — tenant-scoped HTTP surface that generates auditable actions
- [Documentation scope](./DOCUMENTATION_SCOPE.md) — normative vs optional docs
