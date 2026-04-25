---
title: ATC-0006 Cline governed runtime boundaries and ownership
description: Enforceable architecture contract for the governed single-package Cline runtime, its execution protocol, blocking boundary invariants, and transport isolation.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 22
---

# ATC-0006: Cline governed runtime boundaries and ownership

## Contract identity

- **Contract ID:** ATC-0006
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Governance toolchain
- **Scope:** bounded subsystem
- **Decision anchor:** ADR-0009

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds the `packages/cline` package boundary, the governed runtime execution protocol, and the blocking invariants that keep the runtime, the SDK truth engine, and the MCP transport layer aligned.

## Implementation bindings

- In-scope paths:
  `packages/cline/**`, `packages/features-sdk/src/sync-pack/workflow-catalog.ts`, `packages/features-sdk/src/sync-pack/scaffold/path-contract.ts`, `docs/architecture/adr/ADR-0009-cline-single-package-extraction-ready-boundaries.md`
- Bound code/config surfaces:
  `packages/cline/src/core/**`, `packages/cline/src/runtime/**`, `packages/cline/src/mcp-server/**`, `packages/cline/src/plugins/features-sdk/**`, `packages/cline/tests/**`, `packages/cline/package.json`, `packages/cline/tsconfig.build.json`, `packages/eslint-config/src/rules/enforce-cline-boundaries.js`, `packages/eslint-config/src/rules/no-cline-child-process.js`, `scripts/repo-integrity/repo-guard-policy.ts`, and the removal of the live `./cline` export surface from `@afenda/features-sdk`
- Explicitly out of scope:
  multi-package extraction, second-plugin support, and public externalization of MCP transport

## Enforcement surfaces

- Static checks:
  `pnpm run lint`, `pnpm --filter @afenda/cline build`, `pnpm --filter @afenda/cline typecheck`, `pnpm --filter @afenda/features-sdk typecheck`, `pnpm run script:test-repo-guard`, `pnpm run script:check-architecture-contracts`
- Tests:
  `pnpm --filter @afenda/cline test:run`, `pnpm --filter @afenda/eslint-config test:run`
- CI gates:
  lint, repo-guard, package tests, and architecture contract evidence completeness
- Runtime assertions:
  mode and mutation gating through the runtime protocol, plus scaffold placement/runtime contract assertions delegated to Features SDK

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, aggregate governance report, repo-guard output, lint output, and package-local build/typecheck/test results in CI logs
- Validation cadence:
  every governance run and every Cline package change

## Drift handling

- What counts as drift:
  reintroducing an exported embedded `features-sdk` Cline surface, core importing Feature SDK domain logic, `cline` importing Features SDK source internals, runtime subprocess execution, MCP importing internal runtime/plugin/SDK surfaces, declared tool drift, or docs claiming stronger enforcement than the repo can prove
- How drift is recorded:
  lint failures, repo-guard findings, test failures, architecture-contract findings, and code review findings
- When drift blocks:
  the bound architecture-contract domain still warns overall, but the package-local lint, repo-guard, build, and test surfaces fail immediately when their invariants are violated

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- `packages/cline` is the approved governed runtime package boundary.
- `RG-PKG-BOUNDARY-001` blocks source reaches into `packages/features-sdk`, MCP imports of internal runtime/plugin surfaces, and direct MCP imports of Features SDK.
- `RG-EXEC-001` blocks `child_process` imports and subprocess execution in `packages/cline/src/**`.
- `ATC-CLINE-TOOLS-001` requires `CLINE_TOOL_NAMES == syncPackWorkflowCatalog == governed runtime registry`.
