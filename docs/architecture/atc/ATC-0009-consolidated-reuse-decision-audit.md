---
title: ATC-0009 consolidated ERP reuse decision audit
description: Enforceable architecture contract for Afenda's canonical benchmark-authority model, evidence-backed reuse verdicts, and governed execution backlog generation from external ERP comparisons.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 26
---

# ATC-0009: Consolidated ERP reuse decision audit

## Contract identity

- **Contract ID:** ATC-0009
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Governance toolchain
- **Scope:** repo-wide
- **Decision anchor:** ADR-0011

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds Afenda's external ERP and platform comparisons to one canonical reuse audit so benchmark evidence produces consistent verdicts, owned backlog items, and governance-safe recommendations instead of scattered repo archaeology.

## Implementation bindings

- In-scope paths:
  `docs/architecture/adr/ADR-0011-consolidated-reuse-decision-audit.md`, `docs/architecture/atc/ATC-0009-consolidated-reuse-decision-audit.md`, `.artifacts/reports/reuse/consolidated-reuse-decision-audit.md`, `.legacy/cna-templates/**`, `apps/web/src/rpc/web-client.ts`, `docs/API.md`, `apps/api/src/routes/me.ts`, `apps/api/src/routes/commands.ts`, `apps/api/src/modules/operations/**`
- Bound code/config surfaces:
  canonical benchmark-authority table, `AuditVerdictRow` contract, execution backlog owner/gate model, and the rule that benchmark repos may inform Afenda but may not override Afenda's truth/governance authority
- Explicitly out of scope:
  direct import of benchmark code, implementation of the generated backlog items, and automatic synchronization with external repositories

## Enforcement surfaces

- Static checks:
  `pnpm run script:generate-docs-readme`, `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance`
- Tests:
  governance regression coverage under `scripts/lib/governance-spine.test.ts`
- CI gates:
  architecture docs integrity, architecture contract evidence completeness, and governance aggregate checks
- Runtime assertions:
  deferred; this contract governs doctrine and evidence, not runtime behavior directly

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, derived docs index output, aggregate governance report, and the working consolidated reuse audit at `.artifacts/reports/reuse/consolidated-reuse-decision-audit.md`
- Validation cadence:
  every governance run and every update to benchmark doctrine or the consolidated reuse audit

## Drift handling

- What counts as drift:
  missing benchmark authority table, TPM no longer acting as the runtime anchor, `akaunting/module-my-blog` treated as a peer platform benchmark, verdict rows missing evidence or owner/gate, recommendations that suggest direct legacy coupling, or docs claiming stronger enforcement than the repo can prove
- How drift is recorded:
  architecture-contract findings, generated docs diffs, governance aggregate findings, and code review findings
- When drift blocks:
  the bound architecture-contract domain still warns overall, but derived docs generation, architecture-contract checks, and governance checks fail immediately when metadata or generated-doc integrity drifts

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- Benchmark authority is fixed until this contract changes:
  - TPM -> runtime
  - Gauzy -> modularity
  - Akaunting core -> extension
  - Odoo -> taxonomy
  - Akaunting module -> appendix
  - Afenda -> truth, governance, tenancy, permissions, and final judgment
- Allowed verdicts:
  `Adopt`, `Adapt`, `Reference-only`, `Reject`
- Allowed final actions:
  `Borrow now`, `Rebuild in Afenda style`, `Reject permanently`
- `Borrow now` is only valid when the recommendation strengthens Afenda without weakening truth, tenant, permission, typing, or governance discipline.
- No benchmark repo may be cited as authority for direct production-code import into Afenda.
