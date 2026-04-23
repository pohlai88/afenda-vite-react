---
title: Naming convention
description: Canonical naming doctrine for files, modules, scripts, and documents in the repo. Names must encode ownership, artifact role, and responsibility clearly enough that the owning path plus filename are unambiguous.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: governance-registry
order: 11
---

# Naming convention

This document defines the canonical naming doctrine for the repository.

Naming is not cosmetic.
Naming is identity governance.

A name must help any reader, human or machine, understand:

- what owns the artifact
- what kind of artifact it is
- what responsibility it holds

This repository uses **path + filename** as the naming unit.
Only root/global surfaces are expected to stand on filename alone.

---

# Core rule

> A valid name must make ownership, artifact role, and responsibility unambiguous.

For most code, this means:

> the owning path plus filename must make the artifact understandable without guesswork.

For root/global surfaces, this means:

> the filename itself must already be self-identifying.

If a name is generic, misleading, or hides responsibility, it is invalid.

---

# Naming principles

## 1. Ownership first

Names must reflect their owner.

Examples:

- repo/global: `check-governance-registry.ts`
- app-local: `shell-scope-lineage.contract.ts`
- package-local: `accounts.schema.ts`

## 2. Artifact role must be explicit

Where a file belongs to a known artifact class, its role must be encoded in the filename.

Examples:

- `.schema.ts`
- `.contract.ts`
- `.policy.ts`
- `.adapter.ts`
- `.provider.tsx`
- `.store.ts`
- `.test.ts`
- `.spec.ts`
- `.stories.tsx`

## 3. Generic names are forbidden

Names like `utils.ts`, `helpers.ts`, `component.tsx`, or `section.tsx` do not encode responsibility clearly enough and are not allowed in governed live surfaces.

## 4. Exports stay canonical to the subject

Role suffixes belong in filenames.
Primary exports should stay focused on the subject, not mechanically repeat the role.

Examples:

- `accounts.schema.ts` exports `accounts`
- `shell-scope-lineage.contract.ts` exports `ShellScopeLineageModel`
- `i18n-policy.ts` exports `SUPPORTED_LOCALES`
- `shell-command-activity.store.ts` exports `useShellCommandActivityStore`

---

# Meaning model

## Root/global surfaces

Root/global artifacts must be understandable from filename alone.

Applies to:

- root `scripts/`
- ADR and ATC docs
- governance doctrine docs
- repo-level generated reports and registers

These names must be strongly self-identifying.

## App/package-local surfaces

App/package-local artifacts may rely on owning path, but filenames must still be specific and role-aware.

Allowed:

- `apps/web/src/app/_platform/shell/contract/shell-scope-lineage.contract.ts`
- `packages/_database/src/schema/finance/accounts.schema.ts`

Not allowed:

- `apps/web/src/app/_platform/shell/contract/contract.ts`
- `packages/_database/src/schema/finance/file.ts`

---

# Surface-specific rules

## 1. Scripts

### Root scripts

Format:

```txt
<action>-<domain>-<target>.ts
```

Examples:

- `check-governance-registry.ts`
- `generate-governance-report.ts`
- `run-governance-checks.ts`
- `check-architecture-contracts.ts`

Rules:

- must start with an approved action verb
- must include domain
- must include target
- must not be generic

Approved root verbs:

- `check`
- `generate`
- `run`
- `validate`
- `sync`
- `inspect`

Forbidden:

- `script.ts`
- `run.ts`
- `check.ts`
- `utils.ts`

### Local scripts

Scripts owned by one app or package must live with that owner.

Examples:

- `apps/web/scripts/i18n/validate-i18n-policy.ts`
- `packages/_database/scripts/check-audit-writer-boundary.ts`

Local scripts may rely on folder ownership, but must still have explicit role and target.

---

## 2. ADR and ATC documents

Format:

```txt
ADR-<id>-<context>-<purpose>.md
ATC-<id>-<context>-<purpose>.md
```

Examples:

- `ADR-0001-core-web-architecture-baseline.md`
- `ATC-0004-web-src-topology-and-ownership.md`

Rules:

- must include stable ID
- must encode context and intent
- must not use vague titles

---

## 3. Governance and doctrine docs

Format:

```txt
<TOPIC>.md
```

Examples:

- `GOVERNANCE_CONSTITUTION.md`
- `GOVERNANCE_GLOSSARY.md`
- `NAMING_CONVENTION.md`

Rules:

- must be explicit
- must be durable
- must be domain-aware
- must not use weak names like `notes.md`, `misc.md`, `draft.md`

---

## 4. Role-suffix modules

The following file classes are canonical and should be used consistently.

### Schema modules

Format:

```txt
<subject>.schema.ts
```

Examples:

- `accounts.schema.ts`
- `truth-records.schema.ts`

### Contract modules

Format:

```txt
<subject>.contract.ts
```

Examples:

- `shell-scope-lineage.contract.ts`
- `seven-w1h-audit-boundary.contract.ts`

### Policy modules

Format:

```txt
<subject>.policy.ts
```

Examples:

- `i18n-policy.ts`
- `shell-navigation-policy.ts`

### Adapter modules

Format:

```txt
<subject>.adapter.ts
```

Examples:

- `i18next.adapter.ts`
- `shell-command-toast.adapter.ts`

### Provider modules

Format:

```txt
<subject>.provider.tsx
```

Examples:

- `query.provider.tsx`
- `marketing-theme.provider.tsx`

### Store modules

Format:

```txt
<subject>.store.ts
```

Examples:

- `shell-command-activity.store.ts`
- `context-bar-preferences.store.ts`

---

## 5. Hooks

Format:

```txt
use-<subject>.ts
use-<subject>.tsx
```

Examples:

- `use-shell-command-interaction.ts`
- `use-feature-template.tsx`

Rules:

- hooks keep the `use-` prefix in filenames
- exported hook names stay canonical hook names such as `useShellCommandInteraction`

---

## 6. Tests and stories

### Unit/integration tests

Format:

```txt
<subject>.test.ts
<subject>.test.tsx
```

Examples:

- `shell-navigation-policy.test.ts`
- `app-surface.test.tsx`

### Spec-style tests

Format:

```txt
<subject>.spec.ts
```

Use only where the test runner or surface is genuinely spec-oriented, such as E2E/spec suites.

### Stories

Format:

```txt
<subject>.stories.tsx
```

Examples:

- `button.stories.tsx`
- `app-shell-route-state.stories.tsx`

Rules:

- `.test` is the default for live governed unit and integration tests
- `.spec` is reserved for spec/E2E-style surfaces
- `test.ts` and `spec.ts` alone are forbidden

---

## 7. React components and UI modules

Local React/UI filenames may rely on owning path, but must still be specific.

Allowed:

- `feature-command-header.tsx`
- `event-timeline-panel.tsx`
- `app-shell-route-state.tsx`

Forbidden:

- `hero.tsx`
- `section.tsx`
- `panel.tsx`
- `component.tsx`

Exception:
A highly local file may use a shorter subject if the owning path already makes the domain explicit and the filename still communicates the artifact’s actual responsibility.

---

# Forbidden naming patterns

The following are not allowed in governed live surfaces.

## Generic names

- `section.tsx`
- `component.tsx`
- `panel.tsx`
- `data.ts`
- `file.ts`

## Catch-all names

- `utils.ts`
- `helpers.ts`
- `common.ts`

## Ambiguous intent

- `final.ts`
- `new.ts`
- `temp.ts`
- `copy.ts`
- `test.ts`

## Empty role names

- `schema.ts`
- `contract.ts`
- `policy.ts`
- `store.ts`
- `provider.tsx`

---

# `index.ts` rule

`index.ts` is allowed only when it is an intentional public entrypoint or re-export boundary.

Allowed:

- package root public API
- feature public surface barrel where explicitly intended
- adapter boundary index where documented

Not allowed:

- hidden domain logic
- catch-all implementation dumping
- avoiding a real subject name

---

# Required properties of a valid name

A valid name must:

- encode ownership clearly through path or filename
- encode artifact role where the artifact class is known
- encode a specific subject or responsibility
- avoid generic or catch-all wording
- be unique within its effective scope
- support traceability in docs, checks, and CI output

---

# Naming examples

## Invalid

```txt
hero.tsx
utils.ts
final.ts
section.tsx
schema.ts
check.ts
```

## Valid

```txt
check-governance-registry.ts
generate-governance-report.ts
shell-scope-lineage.contract.ts
accounts.schema.ts
i18n-policy.ts
audit-log-table-display.tsx
feature-command-header.tsx
```

---

# Enforcement model

Naming is enforced through governance.

## Phase 1

Controlled governed domains only:

- `scripts/`
- `docs/architecture/governance/`
- `docs/architecture/adr/`
- `docs/architecture/atc/`

In these surfaces:

- new violations fail checks
- generic names are not allowed
- root/global naming must be self-identifying

## Phase 2

Expand to additional live governed roots:

- `apps/web/src`
- selected package roots under `packages/*`

Current bounded rollout starts with:

- `apps/web/src/app/_platform/i18n`
- `apps/web/src/app/_platform/runtime`
- `apps/web/src/app/_platform/tenant`
- `apps/web/src/app/_platform/theme`
- `apps/web/src/app/_platform/config`
- `apps/web/src/app/_platform/app-surface`
- `apps/web/src/app/_platform/auth`
- `apps/web/src/app/_platform/shell`
- `apps/web/src/app/_components`
- `apps/web/src/app/_features`

In these surfaces:

- path + filename enforcement applies
- role suffixes become enforced where relevant
- weak names must be corrected when touched

## Phase 3

Broader live repo lock-in:

- naming checks become standard in all governed live surfaces
- legacy exclusions remain explicit and documented

---

# Migration rule

> If you touch a weakly named file in a governed live surface, improve it.

Immediate bulk renaming across the whole repo is not required.
Controlled domains go first, then wider live surfaces expand deliberately.

---

# Relationship to governance

Naming is part of the governance chain:

```txt
doctrine -> contract binding -> guardrail -> evidence -> CI verdict
```

Naming affects:

- traceability
- readability
- diagnostics
- documentation clarity
- enforcement precision

Weak naming weakens governance.

---

# Final rule

> If a name can be misunderstood, it is wrong.

> If path plus filename still hide responsibility, it is incomplete.

> If a root/global name is not self-identifying, it violates governance.
