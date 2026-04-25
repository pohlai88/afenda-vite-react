---
title: ATC-0010 official documentation surfaces and anti-drift
description: Enforceable architecture contract for Afenda's official documentation model: repo-root docs for operating guidance, docs/architecture for doctrine, no duplicate docs/workspace collection, and generated indexes aligned to real files.
status: active
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 27
---

# ATC-0010: Official documentation surfaces and anti-drift

## Contract identity

- **Contract ID:** ATC-0010
- **Bound domain ID:** GOV-DOC-001
- **Owner:** Docs policy
- **Scope:** repo-wide
- **Decision anchor:** ADR-0012

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract makes Afenda's official documentation surface explicit so repo-wide guidance, doctrine, generated indexes, and contributor entrypoints all point to the same real files.

## Implementation bindings

- In-scope paths:
  `docs/*.md`, `docs/README.md`, `docs/OPERATING_MAP.md`, `docs/architecture/**`, `docs/dependencies/**`, `scripts/docs/generate-docs-readme.ts`, `scripts/lib/doc-governance.ts`, `scripts/afenda.config.json`, `AGENTS.md`
- Bound code/config surfaces:
  root-doc placement, docs generator collection logic, governance bindings, documentation governance checks, and contributor-facing source-of-truth routing
- Explicitly out of scope:
  `.artifacts/**` working analysis reports, package-local READMEs unless they are directly linked from official repo docs, and implementation details of app/package features

## Enforcement surfaces

- Static checks:
  `pnpm run script:generate-docs-readme`, `pnpm run script:check-doc-governance`, `pnpm run script:check-governance-bindings`, `pnpm run script:check-governance`
- Tests:
  documentation governance coverage under `scripts/lib/doc-governance.ts`
- CI gates:
  documentation integrity, governance bindings, and governance aggregate/register checks
- Runtime assertions:
  deferred; this contract governs doc placement and truth routing, not runtime behavior directly

## Evidence

- **Evidence path:** `.artifacts/reports/governance/documentation-integrity.report.json`
- Required evidence artifacts:
  documentation-integrity report, generated docs indexes, and governance bindings evidence
- Validation cadence:
  every docs generation run and every governance run

## Drift handling

- What counts as drift:
  `docs/workspace/` reappearing as a canonical doc collection, generated indexes linking to removed workspace docs, AGENTS referencing non-official repo-wide docs, or governance bindings pointing to stale file paths
- How drift is recorded:
  documentation-governance findings, governance binding failures, generated docs diffs, and code review findings
- When drift blocks:
  the bound documentation domain still warns overall, but generated docs, governance bindings, and governance aggregate checks fail immediately when the official doc surface becomes inconsistent

## Linked commands

- **Check command:** `pnpm run script:check-doc-governance`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- Official repo-wide operating guidance lives at repo-root `docs/*.md`.
- Official repo-wide doctrine lives under `docs/architecture/**`.
- Dependency/library guidance lives under `docs/dependencies/**`.
- Generated navigation files are derived surfaces only and must not become substitute doctrine.
- `docs/workspace/` is retired and may not be used as a second canonical collection.
