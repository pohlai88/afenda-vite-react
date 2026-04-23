---
title: Repository integrity guard
description: Canonical doctrine for the Repository Integrity Guard governance surface, its report contract, and its warn-first rollout posture.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: governance-registry
order: 12
---

# Repository Integrity Guard

This document defines the **Repository Integrity Guard** as a first-class governance surface for repository legitimacy.

The guard does not replace existing domain governance.
It aggregates those surfaces, adds a small set of native hygiene scanners, and emits one repo-truth verdict.

The rollout posture is **warn-first**:

- the guard is registered under `GOV-TRUTH-001`
- the governance-facing command is `pnpm run script:check-repo-guard`
- the public operator command is `pnpm run repo:guard`
- v1 runs as a warned governance domain, not a blocking root check

## Purpose

The guard answers:

- is the repository structurally clean
- is repo truth drifting from current policy
- are there suspicious dirty files or working-tree states
- do existing governance surfaces still agree enough to trust the repo

## V1 scope

V1 is intentionally thin and read-only.

It aggregates existing evaluators for:

- filesystem governance
- generated artifact governance
- storage governance
- naming convention
- documentation governance
- workspace/package topology
- file survival and reviewed survival

It adds only two native scanners:

- dirty file scan
- working tree legitimacy

## Commands

- `pnpm run repo:guard`
  Human-readable summary for local repo legitimacy checks.
- `pnpm run repo:guard:ci`
  CI-oriented execution with structured report output and fail-only-on-error exit codes.
- `pnpm run repo:guard:report`
  Writes evidence artifacts without changing root check behavior.
- `pnpm run script:check-repo-guard`
  Governance entrypoint used by the `GOV-TRUTH-001` domain.

## Evidence

The guard writes:

- `.artifacts/reports/governance/repo-integrity-guard.report.json`
- `.artifacts/reports/governance/repo-integrity-guard.report.md`

The JSON report includes a governance-domain projection so the existing governance control plane can load it as standard evidence.

## V1 rules

The guard must remain:

- deterministic
- explainable
- machine-readable
- conservative in failure behavior

High-confidence native violations may fail the guard.
Lower-confidence findings should warn first.

## Relationship to governance

The Repository Integrity Guard is a repo-truth aggregator, not a second governance constitution.

It depends on the existing governance chain:

```txt
doctrine -> contract binding -> guardrail -> evidence -> CI verdict
```

Its role is to summarize whether the repository is still legitimate enough to trust as a whole.
