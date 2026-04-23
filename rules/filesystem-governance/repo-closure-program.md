# Repo Closure Program

This document defines the green-first repo closure program for Afenda.

The governing doctrine is:

> **No file survives by accident.**

The program sequence is fixed:

1. green the active gates
2. prove non-obvious survivors
3. clean dead and legacy surfaces
4. tighten public, canonical, generated, and performance surfaces
5. seal by reducing exception debt in protected scopes

## Repo Health States

| State | Meaning |
| --- | --- |
| `red` | release or merge trust is broken |
| `amber` | closure is in progress and cleanup is bounded |
| `green` | gates are green, active scope is governed, reviewed exceptions are controlled |
| `sealed` | green plus minimal exception debt in protected scopes |

## Success Definitions

### Green

- active gates pass
- runtime governance is scoped correctly
- reviewed exceptions are controlled
- no obvious unreviewed survival debt remains in active scope

### Sealed

- protected scopes are nearly exception-free
- canonical truth is explicit
- warning-class survival debt is materially reduced
- no unresolved active-scope ambiguity remains

## Survival Doctrine

Every active-scope file must be one of:

- `active-runtime`
- `active-shared`
- `active-owned-local`
- `canonical-policy`
- `generated`
- `reviewed-exception`
- `historical-archive`

Otherwise it must be:

- deleted
- merged
- moved local
- quarantined under storage governance

## Non-Negotiable Rules

- no broad cleanup before the green baseline
- no mixed-slice refactors during closure waves
- no marker used as “do not touch”
- no doc survives without truth status
- no active-scope legacy without explicit retention proof
- no red gate means no “healthy repo” claim
- no new alias route or page without explicit canonical policy

## Reviewed-Survival Marker

The reviewed-survival marker applies only to non-obvious retained files:

- reviewed exceptions
- intentional aliases
- retained legacy inside active scope
- transitional compatibility files

Required fields:

- `@afenda-reviewed-survival`
- `role`
- `owner`
- `reason`
- `reviewed-on`
- `review-by`
- `action-if-stale`

Optional fields:

- `evidence`
- `supersedes`
- `planned-replacement`

Allowed roles:

- `reviewed-exception`
- `intentional-alias`
- `transitional-compat`
- `retained-legacy`

Allowed actions:

- `delete`
- `merge`
- `replace`

Forbidden marker use:

- active runtime files
- active route owners
- ordinary shared multi-consumer files
- generated files
- canonical policy/config files

Marker meaning:

- proof of intentional retention
- never maintenance amnesty

## Reviewed-Exception Ledger

The fixed repo ledger lives at:

- [`reviewed-exceptions.json`](./reviewed-exceptions.json)

Each entry must include:

- `path`
- `owner`
- `role`
- `reason`
- `reviewedOn`
- `reviewBy`
- `actionIfStale`
- `evidence`
- `plannedResolution`

Validation is enforced by the file-survival governance path.

## i18n Policy Split

Blocking runtime scope:

- `apps/web/src/app`
- locale coverage
- translation completeness
- no hardcoded runtime strings

Audit-only marketing/editorial scope:

- `apps/web/src/marketing`
- editorial copy
- canonical duplication
- untranslated reuse risk

Marketing/editorial findings remain visible during closure, but they do not red-gate the repo while the program is targeting green.

## Execution Waves

### Wave A — Red Gate Repair

Restore trust in lint, tests, runtime i18n, and the root release gate.

### Wave B — Survival Governance Foundation

Install the reviewed-exception marker, ledger, and validation rules on top of the existing file-survival system.

### Wave B.5 — Worktree Stabilization

Bound cleanup slices by domain before broad deletion or quarantine work begins.

### Wave C — Delete and Quarantine

Remove dead files, empty governed folders, dead wrappers, and stale active-scope legacy. Classify docs and retain only explicit reviewed exceptions.

### Wave D — Surface Tightening

Resolve canonical ambiguity, generated-file protection, doc truth enforcement, and explicit ownership clarity in protected scopes.

### Wave E — Sealed-State Reduction

Reduce reviewed exceptions in protected scopes toward near-zero and selectively promote warning-class debt to blocking.

## Blocking Rollout

Immediate blocking:

- invalid marker
- expired marker
- missing required marker
- generated-file policy breach
- import-boundary violation
- empty governed folder
- unknown owner or role in protected scope

Delayed blocking after Wave C stabilizes:

- dead high-confidence file
- wrapper-only module without governance value in protected scope
- canonical ambiguity where policy should already be explicit

## Evidence Artifacts

Each wave must produce:

- a closure record
- an updated survival or governance report
- an updated reviewed-exception ledger
- any wave-specific ledger/report required by the slice

Use the existing functional-slice closure record template for bounded closure evidence.
