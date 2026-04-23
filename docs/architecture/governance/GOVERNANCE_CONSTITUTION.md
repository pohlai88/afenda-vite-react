---
title: Governance constitution
description: Canonical doctrine for the repo-local governance spine: what is canonical, how enforcement works, how evidence is produced, and how CI reaches verdicts.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: doctrine
relatedDomain: governance-registry
order: 10
---

# Governance constitution

This document is the root doctrine for the repo-local governance spine.
It exists to prevent the monorepo from treating governance as a puzzle of disconnected scripts, docs, and CI jobs.

## Canonical chain

The governance chain for this repository is:

`doctrine -> contract binding -> guardrail -> evidence -> CI verdict`

Each enforced governance rule must be traceable across that chain.

## Canonical vs derived

The repo distinguishes between canonical vs derived governance surfaces:

- Canonical governance doctrine lives in `docs/architecture/governance/`, with related doctrine in `docs/architecture/adr/` and `docs/architecture/atc/`.
- Doctrine is a semantic class for authoritative governing text; it is not a synonym for all docs and not a separate required filesystem tree.
- Canonical machine binding lives in `scripts/afenda.config.json`.
- Domain-local enforcement config lives in `rules/**`.
- Derived evidence lives under `.artifacts/reports/governance/**`.
- CI verdicts are derived from the registry, the checks, and the evidence artifacts.

No derived artifact is allowed to redefine policy independently of the canonical control plane.

## Root vs owner-local surfaces

The governance spine follows the canonical boundary model in `docs/workspace/BOUNDARY_SURFACES.md`.

- Root doctrine exists only for repo-wide or multi-owner governance.
- Root `rules/` exists only for enforcement-tied policy artifacts.
- Root `scripts/` exists only for repo-local orchestration and execution.
- Owner-local docs, rules, scripts, schema, and tests belong with the owner by default.
- Owner-local doctrine is allowed only when it lives under the owner's `docs/` surface and is explicitly classified as doctrine.

## Ownership model

Every governance domain must declare:

- an owner
- a lifecycle status
- an enforcement maturity
- a CI behavior
- an evidence path

No governance surface is considered active unless an owner is named in the registry.

## ADR vs ATC

The repository uses an explicit ADR vs ATC split:

- `ADR` records narrative decisions, context, and consequences.
- `ATC` records enforceable architecture contracts that are expected to bind to checks and evidence.

An ADR may explain intent without enforcement.
An ATC may not claim `enforced` without a real check command and a real evidence path.

## Status model

Governance domains use three separate axes:

- Lifecycle status:
  `watcher`, `bound`, `partial`, `enforced`, `drifted`, `retired`
- Enforcement maturity:
  `defined`, `measured`, `warned`, `blocking`, `runtime-enforced`
- Violation severity:
  `info`, `warn`, `error`, `fatal`

These axes are not interchangeable.

## CI gate semantics

Governance CI is organized as explicit gates:

- registry integrity
- binding validity
- registered checks
- evidence completeness
- waiver validity
- generated register/report sync

The control plane decides whether a domain is:

- observe only
- warning
- blocking

## Evidence model

All repo-level governance evidence belongs under:

`/.artifacts/reports/governance/`

Required evidence outputs:

- per-domain JSON reports
- aggregate governance report
- summary report
- waiver report
- governance register snapshot

Console output alone is not sufficient evidence for enforced governance.

## Waiver/exception policy

The repository supports waiver/exception handling, but only through the governed waiver registry.

Each waiver must declare:

- target domain or policy id
- affected paths
- owner
- approver
- created date
- expiry date
- severity cap
- remediation plan

Expired waivers fail CI.
Unknown waiver targets fail CI.
Waivers against retired domains fail CI.
A waiver may suppress a violation only when the violation severity is less than or equal to the waiver `severityCap`.

## Required traceability chain

Every blocking governance rule must preserve a traceability chain:

1. which rule or domain was violated
2. where the rule is defined
3. which machine binding registered it
4. which guardrail detected it
5. which evidence artifact recorded it
6. which CI gate enforced it
7. how the violation is remediated

If the repo cannot answer those questions, the rule is not yet fully integrated governance.
