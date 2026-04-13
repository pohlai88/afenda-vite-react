---
name: audit-architecture
description: AFENDA audit doctrine for evidence integrity, anti-drift review, invariant diagnosis, troubleshooting, schema/runtime validation, and audit-focused cleanup. When writing or reviewing audit code, always apply these rules.
---

**Cursor project skill (discovery):** repo-root `.cursor/skills/audit-architecture/SKILL.md` — entrypoint that points here for full doctrine.

# Audit Architecture Skill

## Core Principle

Audit is **durable evidence**, not activity logging.

The audit layer exists to answer:

- who did what
- to which subject
- when it occurred / was recorded / became effective
- under what authority
- through which causal chain
- with what evidence
- with what result

If code cannot preserve those answers, it is not acceptable audit code.

---

## Doctrine

### 1. Append-first

- Audit rows are **immutable after commit**
- Corrections must be **compensating audit events**
- Never “fix” audit truth by updating or deleting prior evidence
- Redaction and retention must be governed workflows, never ad hoc mutation

### 2. Tenant-bounded

- Audit evidence must always be scoped to a valid jurisdiction
- At minimum: `tenantId`
- When architecture requires it, also preserve organization, legal entity, environment, or other jurisdiction boundaries
- Never allow audit writes that lose tenant or legal scope

### 3. Causally traceable

- One business operation must be reconstructible as a chain
- Request, command, causation, correlation, session, job, batch, and idempotency references are not “nice to have” once the architecture depends on them
- Missing causal linkage is an audit defect, not a cosmetic issue

### 4. Evidence-oriented

- Audit stores the **minimum necessary proof**
- Prefer structured deltas, hashes, refs, stable identifiers, and outcome summaries
- Never duplicate entire business documents into audit payloads without doctrine-level justification

### 5. Privacy-governed

- Never dump raw secrets, tokens, credentials, or unreviewed PII into `changes` or `metadata`
- Scrubbing must happen at write time
- “We will be careful later” is not a valid privacy strategy

### 6. Investigation-shaped

- Query paths matter
- Audit design must support real investigations:
  - tenant + time
  - subject + time
  - actor + time
  - request / trace / causation / correlation
  - action + outcome
- If a field exists but cannot support investigation, it is drift

### 7. Human-readable but governed

- Stable action keys, reason codes, doctrine refs, invariant refs, and outcome codes are mandatory foundations
- Free text is supplementary evidence, never the only semantic layer

---

## What This Skill Must Enforce

When asked to review, generate, refactor, or diagnose audit code, always enforce these areas:

1. **Doctrine integrity**
2. **Schema integrity**
3. **Writer integrity**
4. **Invariant integrity**
5. **Error/verdict integrity**
6. **Evidence payload discipline**
7. **Query/index fitness**
8. **Cleanup and tree-shaking**
9. **Drift detection**
10. **Troubleshooting and diagnosis**

---

# 1. Doctrine Integrity Rules

## Required posture

- Audit is not admin activity feed
- Audit is not debug logging
- Audit is not arbitrary JSON storage
- Audit is not soft-governed best effort

## Reject immediately

- Mutable audit rows
- Silent failure in audit writes
- Optional tenant scope for normal writes
- Free-text-only action semantics
- Missing actor/source/outcome with no explicit doctrine exception
- “Unknown” used as a lazy fallback when the real actor/source is available
- Event chains that cannot be reconstructed

## Preferred model

Always push toward:

- governed action key
- typed actor model
- typed source channel
- typed outcome
- explicit subject model
- explicit causal references
- explicit evidence buckets
- doctrine/invariant/resolution references where architecture already uses them

---

# 2. Schema Integrity Rules

## Column doctrine

Audit schema should preserve semantic dimensions explicitly, not bury them in JSON.

Strong default expectations:

- jurisdiction
  - `tenantId`
  - optional: `organizationId`, `legalEntityId`, `environment`

- actor
  - `actorType`
  - `actorId`
  - `actorDisplay`
  - `actingAs...` or delegation context

- action
  - `action`
  - `actionCategory`
  - `reasonCode`
  - `reasonText`

- subject
  - `subjectType`
  - `subjectId`
  - optional aggregate/document pointers

- execution path
  - `sourceChannel`
  - `requestId`
  - `traceId`
  - `correlationId`
  - `causationId`
  - `commandId`
  - `sessionId`
  - `jobId`
  - `batchId`

- result
  - `outcome`
  - `errorCode`
  - optional transition summary

- time
  - `occurredAt`
  - `recordedAt`
  - `effectiveAt`
  - optional `ingestedAt`

- evidence
  - `changes`
  - `metadata`

- governance
  - `doctrineRef`
  - `invariantRef`
  - `resolutionRef`
  - `retentionClass`
  - `legalHold`

## Schema anti-drift checks

Flag these as structural drift:

- fields collapsing multiple semantics into one ambiguous column
- raw string unions where governed enums/constants should exist
- missing nullability discipline
- nullable fields that are required by runtime doctrine
- metadata owning business truth that should be first-class columns
- fields present in contracts but not persisted
- columns persisted but absent from read/write contracts
- inconsistent naming across table, writer, serializer, admin view, and invariant layers

## Index doctrine

Audit indexes must reflect investigation paths, not only insertion convenience.

Check for:

- `tenant + time`
- `subject + time`
- `actor + time`
- `action + time`
- `outcome + time`
- correlation / request / trace lookup paths

Flag:

- no investigation-oriented composite indexes
- indexes that only satisfy generic admin listing
- indexes that make causal reconstruction expensive or impossible at scale

---

# 3. Writer Integrity Rules

## Audit writes must be deliberate

Audit writers must not be side-effect junk drawers.

Audit write code must:

- validate required dimensions before persist
- scrub payloads before persist
- normalize timestamps consistently
- enforce action/source/outcome contracts
- preserve tenant/jurisdiction identity
- preserve causal references
- fail loudly on invalid state

## Never allow

- best-effort audit writes that swallow failure silently
- fallback values that hide missing truth
- unbounded metadata passthrough
- direct persistence of unsanitized request bodies
- “optional everything” constructors
- late mutation of audit records before save

## Strong preference

- central audit writer / factory / normalizer
- stable serializer
- explicit assertion layer before persistence
- schema-compatible DTOs
- governed error factory for failures

---

# 4. Invariant Integrity Rules

## Invariants are verdict-producing, not decorative

Audit invariants must answer:

- what rule was violated
- why it matters
- what evidence is missing or malformed
- what remediation is appropriate

## Invariant design requirements

Each invariant should have:

- stable key
- doctrine linkage
- severity
- human-readable verdict
- machine-usable code
- remediation path

## Good invariant behavior

- detect missing tenant scope
- detect missing actor classification
- detect invalid action keys
- detect invalid subject pairing
- detect absent causal references when required
- detect invalid time relationships
- detect unsanitized payloads
- detect illegal append/mutation behavior
- detect missing outcome/error coherence
- detect doctrine/ref mismatch across layers

## Bad invariant behavior

- generic “invalid audit data”
- boolean pass/fail with no diagnosis
- severity with no operational meaning
- refs existing only in comments
- invariant code that cannot map to a deterministic error/verdict structure

---

# 5. Error and Verdict Rules

## Audit errors must be governed

Audit errors are not plain strings.

Preferred shape:

- stable code
- invariant key
- doctrine ref
- severity
- verdict title
- diagnosis details
- remediation guidance
- safe evidence payload
- optional resolution ref

## Reject

- `throw new Error("something wrong")`
- single-message errors that hide which invariant failed
- errors that expose secrets or raw sensitive payloads
- errors that omit the broken semantic dimension

## Require

When audit validation fails, the system should tell us:

- which invariant failed
- what field or relation was wrong
- whether this is schema drift, runtime misuse, or data corruption risk
- what the caller should do next

---

# 6. Evidence Payload Discipline

## `changes`

Use for:

- before/after deltas
- transition summaries
- normalized field changes
- evidence sufficient to explain the business mutation

Do not use for:

- entire record snapshots without purpose
- secrets
- raw tokens
- large opaque bodies
- irrelevant duplicate business state

## `metadata`

Use for:

- route/module/surface
- feature flags
- import/batch markers
- trace extras
- execution context that supports investigation

Do not use for:

- dumping unknown fields
- storing primary business semantics that should be explicit columns
- storing hidden source-of-truth values only auditors can see

## Required review question

For every field in `changes` or `metadata`, ask:

- is this evidence
- is this necessary
- is this safe
- is this queryable enough
- does this belong in JSON at all

---

# 7. Time and Correlation Rules

## Time

Never flatten business time into one ambiguous timestamp when architecture distinguishes:

- occurred
- recorded
- effective
- ingested

Flag drift when:

- only one timestamp is used for all meanings
- effective time is lost in backdated workflows
- serialization changes temporal meaning
- date handling is inconsistent across writer, serializer, and reader contracts

## Correlation

Prefer explicit correlation surfaces over inferred linkage.

Audit code should preserve:

- request correlation
- causal correlation
- business operation correlation

Flag drift when:

- request id exists but command/causation chain is lost
- async jobs break lineage
- retries duplicate or split one logical story
- idempotency handling is absent where the platform depends on it

---

# 8. Troubleshooting and Diagnosis Playbook

When asked to troubleshoot audit issues, classify them first.

## A. Doctrine failure

Examples:

- append-only broken
- jurisdiction missing
- actor/source/outcome semantics weak
- audit acting like logs

## B. Schema drift

Examples:

- table and contracts disagree
- serializer/admin view omit required fields
- nullable shape contradicts doctrine
- wrong enums / raw strings / inconsistent names

## C. Writer failure

Examples:

- payload not scrubbed
- timestamps assigned inconsistently
- correlation dropped
- errors swallowed
- invalid defaults inserted

## D. Invariant failure

Examples:

- invariant exists but does not run
- error mapping absent
- weak diagnosis
- doctrine linkage not enforced

## E. Operational/query failure

Examples:

- investigation queries slow or impossible
- indexes missing
- projections misrepresent audit truth
- admin view collapses evidence too aggressively

## F. Cleanup failure

Examples:

- dead audit helpers
- duplicate serializers
- legacy action names
- wrappers with no doctrine value
- re-export drift
- compatibility shims hiding architecture weakness

## Diagnostic output format

When reviewing code, always produce:

1. **Verdict**
   - acceptable
   - acceptable with hardening required
   - drifted
   - unsafe
2. **Broken area**
   - doctrine / schema / writer / invariant / query / cleanup
3. **Why**
   - concrete explanation
4. **Risk**
   - forensic loss / privacy leak / false evidence / operational fragility / scale issue
5. **Fix**
   - exact corrective direction
6. **Priority**
   - critical / high / medium / low

---

# 9. Drift Rectification Rules

## Always rectify toward governed structure

Do not patch symptoms only.

When drift is found, prefer:

- central constants/registries over repeated strings
- typed contracts over free-form objects
- invariant assertions over comments
- shared normalizers over ad hoc shaping
- explicit doctrine-linked error mapping over generic throw sites
- deletion of weak legacy helpers over preserving them “just in case”

## Common audit drift patterns

- action strings hardcoded in many files
- multiple competing serializers
- admin view diverges from persisted truth
- nullable fields used to hide missing required semantics
- metadata becomes shadow schema
- append-only doctrine documented but not enforced
- invariant registry and error mapping out of sync
- action catalog, doctrine registry, and runtime writer use different names
- AI lineage or retention fields present in types but never written or validated

## Rectification stance

- remove fake optionality
- collapse duplicate pathways
- make invalid state unrepresentable where possible
- promote recurring semantics into governed constants/contracts
- add assertive invariant checks at the right layer
- delete dead abstractions that weaken audit truth

---

# 10. Tree-Shaking and Cleanup Rules

## Remove aggressively

Audit code must not accumulate dead weight.

Delete:

- unused serializers
- duplicate DTOs
- legacy aliases
- compatibility re-exports with no architectural value
- unused enums / constants / error codes
- admin-only wrappers that distort audit semantics
- commented-out old audit paths
- “temporary” audit helpers that bypass governed writers

## Keep only if it strengthens doctrine

Retain code only when it clearly supports:

- evidence integrity
- invariant enforcement
- investigation queries
- privacy controls
- retention / legal hold / correction workflows

## Anti-pattern

Do not keep drift alive for convenience.

Three weak audit paths are worse than one strict path.

---

# 11. Review Mode Instructions

When this skill is invoked to review code, always do the following:

## Step 1: Determine the audit layer

Identify whether the code belongs to:

- schema
- relations
- writer
- serializer
- contract
- invariant/assertion
- error mapping
- admin projection
- query/index
- retention/redaction workflow

## Step 2: Judge against doctrine

Ask:

- does this preserve durable evidence
- does this preserve tenant/jurisdiction
- does this preserve causality
- does this preserve investigation fitness
- does this preserve privacy discipline
- does this preserve append-only behavior

## Step 3: Produce verdict

Use direct verdict language:

- correct
- incomplete
- drifted
- weak for enterprise audit
- unsafe for durable evidence

## Step 4: Give the correction

Prefer:

- exact file recommendations
- exact layer boundaries
- exact constant/contract/invariant additions
- exact deletions where necessary

---

# 12. Coding Style for Audit Surfaces

## Write code that is:

- explicit
- typed
- verdict-rich
- stable in naming
- deterministic in serialization
- strict in invariants
- minimal in payload shape
- enterprise-grade in diagnosis

## Do not:

- over-abstract too early
- create generic helpers that erase audit semantics
- hide domain distinctions behind convenience wrappers
- treat audit as another CRUD table
- preserve drift for backward compatibility unless explicitly required by governed migration work

---

# 13. Preferred Output Style When Assisting

When helping with audit work, respond in this order:

1. **Architectural verdict**
2. **What is correct**
3. **What is drift / weak / unsafe**
4. **What must change now**
5. **What can wait**
6. **Exact file/layer recommendations**
7. **If requested, provide drop-in code**

Always optimize for:

- durability
- diagnosis
- evidence quality
- investigation fitness
- privacy safety
- future enforcement

---

# 14. Non-Negotiables

- Crash or reject before writing invalid audit truth
- No silent evidence corruption
- No secret dumping
- No fake append-only doctrine
- No free-text-only semantics
- No missing jurisdiction in normal audit writes
- No causal chain loss where the architecture depends on it
- No keeping dead audit code just because it exists

---

# 15. Cleanup Reminder

When refactoring audit code:

- delete unused code completely
- remove duplicate pathways
- remove weak aliases
- do not leave “legacy for now” unless migration doctrine explicitly requires it
- prefer one governed path over multiple soft paths
