---
title: Repo guard repo map
description: Repo-native truth map for Repository Integrity Guard calibration, including owner roots, generated roots, import aliases, and doctrine-to-evidence bindings.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: governance-registry
order: 14
---

# Repo guard repo map

This document is the repo-native calibration map for the Repository Integrity Guard.

It exists to answer one practical question:

> what does this repo actually look like, and which repo-truth assumptions are legitimate enough to enforce?

This is not a second doctrine.
It is the operational map used to tighten repo-guard policy against the real Afenda monorepo.

## Purpose

This map is the calibration source for:

- `RG-STRUCT-001` placement and ownership
- `RG-TRUTH-002` generated artifact authenticity
- `RG-STRUCT-003` boundary and import regression
- `RG-TRUTH-004` source and evidence mismatch
- `RG-ADVISORY-006` stronger document control
- promotion-readiness review for `GOV-TRUTH-001`

## Root ownership map

### Repo-global governance and tooling roots

- `docs/`
  Repo-wide doctrine, ADR, ATC, operating maps, and generated discovery surfaces.
- `scripts/`
  Repo-global operational scripts, governance checks, report generation, and orchestration.
- `rules/`
  Durable machine-readable policy, waivers, and formal governance rule surfaces.
- `.artifacts/reports/governance/`
  Governance evidence outputs and snapshots.

### Workspace roots

- `apps/web`
  Vite web application package.
- `apps/api`
  API application package.
- `packages/*`
  Shared packages and configuration packages governed by `workspaceGovernance.packageRoots`.

### Web client source roots

Declared by `workspaceGovernance.webClientSrc` in [scripts/afenda.config.json](/C:/NexusCanon/afenda-react-vite/scripts/afenda.config.json):

- `apps/web/src/app`
  App platform, app components, and app feature roots.
- `apps/web/src/marketing`
  Marketing surface with its own rollout owner truth.
- `apps/web/src/routes`
  Route-level source root.
- `apps/web/src/rpc`
  RPC-facing client root.
- `apps/web/src/share`
  Shared web client code root.

### Package roots and profiles

Declared by `workspaceGovernance.packageRoots` in [scripts/afenda.config.json](/C:/NexusCanon/afenda-react-vite/scripts/afenda.config.json):

- `apps/web` -> `vite-web-app`
- `apps/api` -> `api-app`
- `packages/_database` -> `database-package`
- `packages/design-system` -> `design-system-package`
- `packages/better-auth` -> `source-library`
- `packages/contracts` -> `source-library`
- `packages/env-loader` -> `source-library`
- `packages/eslint-config` -> `source-library`
- `packages/pino-logger` -> `source-library`
- `packages/vitest-config` -> `source-library`
- `packages/typescript-config` -> `config-package`

### Current owner-root interpretation

Current repo-native interpretation for ownership calibration:

- repo-global governance and orchestration
  - `docs/`
  - `scripts/`
  - `rules/`
  - `.artifacts/reports/governance/`
- app-local web operational roots
  - `apps/web/scripts/`
  - `apps/web/src/`
- api-local roots
  - `apps/api/src/`
- package-local roots
  - `packages/*/src/`
  - `packages/*/scripts/`
  - package-specific generated or emitted roots such as `packages/*/dist/`, `packages/*/drizzle/`, `packages/*/sql/`, and `packages/design-system/icons/__*.ts`

### Current static owner scopes implemented in repo-guard policy

`RG-STRUCT-001` is no longer grounded only in the marketing rollout.
Current static owner scopes now cover:

- `scripts`
- `apps/web/scripts`
- `apps/web/src`
  - root runtime files such as `main.tsx`, `App.tsx`, `router.tsx`, and boot/runtime support files
  - top-level domain roots:
    - `app`
    - `marketing`
    - `routes`
    - `rpc`
    - `share`
- `apps/api/src`
  - root runtime files such as `app.ts` and `index.ts`
  - subroots:
    - `command`
    - `contract`
    - `lib`
    - `middleware`
    - `modules`
    - `routes`
    - `truth`
- package-local roots:
  - `packages/better-auth/src`
  - `packages/better-auth/scripts`
  - `packages/contracts/src`
  - `packages/env-loader/src`
  - `packages/pino-logger/src`
  - `packages/vitest-config/src`
  - `packages/eslint-config/src`
  - `packages/design-system/design-architecture`
  - `packages/design-system/generated`
  - `packages/design-system/hooks`
  - `packages/design-system/icons`
  - `packages/design-system/scripts`
  - `packages/design-system/ui-primitives`
  - `packages/design-system/utils`
  - `packages/_database/docs`
  - `packages/_database/drizzle`
  - `packages/_database/scripts`
  - `packages/_database/sql`
  - `packages/_database/src`

## Current explicit owner-truth surfaces

### Marketing rollout owner truth

Current first-class owner truth is declared under `fileSurvival.rollouts[marketing]` in [scripts/afenda.config.json](/C:/NexusCanon/afenda-react-vite/scripts/afenda.config.json).

Important current owners:

- `apps/web/src/marketing/components`
  owner: `marketing-shared-surface`
- `apps/web/src/marketing/pages/company`
  owner: `marketing-route:company`
- `apps/web/src/marketing/pages/campaigns`
  owner: `marketing-route:campaigns`
- `apps/web/src/marketing/pages/legal`
  owner: `marketing-route:legal`
- `apps/web/src/marketing/pages/landing`
  owner: `marketing-route:landing`
- `apps/web/src/marketing/pages/product`
  owner: `marketing-route:product`
- `apps/web/src/marketing/pages/regional`
  owner: `marketing-route:regional`

### Marketing runtime owners

These files are currently treated as runtime orchestrators:

- `apps/web/src/marketing/marketing-layout.tsx`
- `apps/web/src/marketing/marketing-routes.tsx`
- `apps/web/src/marketing/marketing-page-registry.ts`
- `apps/web/src/marketing/marketing-theme-provider.tsx`
- `apps/web/src/marketing/marketing.config.ts`
- `apps/web/src/marketing/marketing-configured-home.tsx`
- `apps/web/src/marketing/marketing-random-home.tsx`
- `apps/web/src/marketing/marketing-loading-fallback.tsx`

### Package public and internal surfaces

Current package public surfaces are the explicit `exports` entries in each package manifest.

Examples:

- `@afenda/contracts`
  public: `.`
- `@afenda/env-loader`
  public: `.`
- `@afenda/pino-logger`
  public: `.`
- `@afenda/vitest-config`
  public:
  - `./vitest/defaults`
  - `./vitest/setup`
  - `./vitest/vite-module-resolution-plugin`
- `@afenda/eslint-config`
  public:
  - `.`
  - `./plugin`
- `@afenda/better-auth`
  public:
  - `.`
  - `./schema`
- `@afenda/database`
  public:
  - `.`
  - `./schema`
  - `./tenancy`
  - `./7w1h-audit`
  - `./audit`
  - `./governance`
  - `./studio`
  - `./studio/snapshots`
  - `./queries`
  - `./relations`
- `@afenda/design-system`
  public:
  - `.`
  - `./utils`
  - `./ui-primitives`
  - `./ui-primitives/_registry`
  - `./scripts`
  - `./icons`
  - `./hooks`
  - `./design-architecture/local.css`
  - `./design-architecture/app-theme-vocabulary.css`

Current boundary implication:

- imports through declared package exports are public-surface candidates
- deep imports into undeclared package internals should be treated as boundary-tightening follow-up
- relative filesystem imports that cross into a different workspace root are now treated as high-confidence boundary violations

## Generated and evidence roots

### Governance evidence roots

- `.artifacts/reports/governance/`
  Canonical governance evidence root declared in config.
- `docs/architecture/governance/generated/`
  Human-readable generated discovery and register root.

### Protected generated surfaces currently used by repo guard

Declared in [repo-guard-policy.ts](/C:/NexusCanon/afenda-react-vite/scripts/repo-integrity/repo-guard-policy.ts):

- `docs/architecture/governance/generated/governance-register.md`
- `.artifacts/reports/governance/governance-register.snapshot.json`
- `apps/web/scripts/i18n/data/*.json`
- `apps/web/src/app/_platform/i18n/audit/*.json`
- `docs/README.md`
- `scripts/README.md`

### Current explicit generated-authenticity bindings

`RG-TRUTH-002` currently binds:

- governance register markdown
  target: `docs/architecture/governance/generated/governance-register.md`
  required sources:
  - `scripts/afenda.config.json`
  - `.artifacts/reports/governance/governance-core.report.json`
- governance register snapshot
  target: `.artifacts/reports/governance/governance-register.snapshot.json`
  required sources:
  - `scripts/afenda.config.json`
  - `.artifacts/reports/governance/governance-core.report.json`
- design-system component governance artifacts
  targets:
  - `packages/design-system/generated/component-manifests.json`
  - `packages/design-system/generated/component-variants.json`
  - `packages/design-system/generated/component-coverage.json`
    required sources:
  - `packages/design-system/scripts/component-governance/core.ts`
  - `packages/design-system/scripts/component-governance/generate.ts`
  - `packages/design-system/ui-primitives/_registry.ts`
  - `packages/design-system/ui-primitives/`
- database schema inventory
  target: `packages/_database/docs/guideline/schema-inventory.json`
  required sources:
  - `packages/_database/scripts/sync-schema-inventory.ts`
  - `packages/_database/src/schema/`
  - `packages/_database/src/7w1h-audit/`
- database glossary snapshot
  target: `packages/_database/src/studio/business-glossary.snapshot.json`
  required sources:
  - `packages/_database/scripts/sync-glossary-enums.ts`
  - `packages/_database/src/studio/pg-enum-allowlist.ts`
  - `packages/_database/src/schema/shared/enums.schema.ts`
  - `packages/_database/src/schema/iam/auth-challenges.schema.ts`
  - `packages/_database/src/7w1h-audit/audit-enums.schema.ts`

## Generator truth map

The repo already contains a small number of high-value generators with explicit outputs.
These are the first calibration targets for `RG-TRUTH-002` and `RG-TRUTH-004`.

### Repo-global generators

- docs index generator
  command: `pnpm run script:generate-docs-readme`
  source surfaces:
  - `docs/`
  - `scripts/`
  - `rules/`
  - `.agents/skills/shadcn/`
    outputs:
  - `docs/README.md`
  - `docs/OPERATING_MAP.md`
  - collection `README.md` files under governed docs roots
  - `scripts/README.md`
- governance aggregate generator
  command: `pnpm run script:generate-governance-report`
  source surfaces:
  - `scripts/afenda.config.json`
  - per-domain evidence files
    outputs:
  - `.artifacts/reports/governance/governance-core.report.json`
  - `.artifacts/reports/governance/governance-summary.report.json`
  - `.artifacts/reports/governance/governance-summary.report.md`
  - `.artifacts/reports/governance/waivers.report.json`
- governance register generator
  command: `pnpm run script:generate-governance-register`
  source surfaces:
  - `scripts/afenda.config.json`
  - `.artifacts/reports/governance/governance-core.report.json`
    outputs:
  - `docs/architecture/governance/generated/governance-register.md`
  - `.artifacts/reports/governance/governance-register.snapshot.json`
- repo guard report generator
  commands:
  - `pnpm run repo:guard:report`
  - `pnpm run repo:guard:promotion-review`
    source surfaces:
  - repo-guard policy, waivers, doctrine, config, and current repo state
    outputs:
  - `.artifacts/reports/governance/repo-integrity-guard.report.json`
  - `.artifacts/reports/governance/repo-integrity-guard.report.md`
  - `.artifacts/reports/governance/repo-guard-promotion-readiness.report.json`
  - `.artifacts/reports/governance/repo-guard-promotion-readiness.report.md`

### App-local generators

- web i18n corpus generator
  command: `pnpm --filter @afenda/web run i18n:generate-corpus`
  source surfaces:
  - `apps/web/src/app/_platform/i18n/locales`
  - `apps/web/scripts/i18n/data/i18n-key-mapping.json`
  - upstream Tolgee/Frappe/Odoo sources
    outputs:
  - `apps/web/scripts/i18n/data/i18n-corpus-tolgee.json`
  - `apps/web/scripts/i18n/data/i18n-corpus-frappe.json`
  - `apps/web/scripts/i18n/data/i18n-corpus-odoo.json`
- web i18n cross-reference audit generator
  command: `pnpm --filter @afenda/web run i18n:generate-crossref-audit`
  source surfaces:
  - `apps/web/src/app/_platform/i18n/glossary/canonical-terms.json`
  - `apps/web/src/app/_platform/i18n/glossary/decisions.json`
  - generated i18n corpus files
    outputs:
  - `apps/web/src/app/_platform/i18n/audit/conflicts.json`
  - `apps/web/src/app/_platform/i18n/audit/provenance.json`

### Package-local generators

- design-system icons generator
  command: `pnpm --filter @afenda/design-system run icons:generate`
  source surfaces:
  - `packages/design-system/ui-primitives`
  - `packages/design-system/utils`
  - existing generated icon barrels
    outputs:
  - `packages/design-system/icons/__lucide__.ts`
  - `packages/design-system/icons/__tabler__.ts`
  - `packages/design-system/icons/__hugeicons__.ts`
  - `packages/design-system/icons/__phosphor__.ts`
  - `packages/design-system/icons/__remixicon__.ts`
- design-system component governance generator
  command: `pnpm --filter @afenda/design-system run component-governance:generate`
  source surfaces:
  - package design-system component and registry surfaces
    outputs:
  - component governance artifacts named by the generator:
    - `component-manifests.json`
    - `component-variants.json`
    - `component-coverage.json`
- better-auth schema generator
  command: `pnpm --filter @afenda/better-auth run auth:generate`
  source surfaces:
  - `packages/better-auth/src/better-auth-cli-config.ts`
  - Better Auth plugin configuration and env flags
    outputs:
  - `packages/better-auth/src/schema/auth-schema.generated.ts`
- database schema inventory generator
  command: `pnpm --filter @afenda/database run db:inventory:sync`
  source surfaces:
  - `packages/_database/src/schema/**/*.ts`
  - `packages/_database/src/7w1h-audit/**/*.ts`
    outputs:
  - `packages/_database/docs/guideline/schema-inventory.json`
- database glossary enum sync
  command: `pnpm --filter @afenda/database run db:sync-glossary-enums`
  source surfaces:
  - `packages/_database/src/studio/pg-enum-allowlist.ts`
  - selected schema enum files under `src/schema/` and `src/7w1h-audit/`
    outputs:
  - `packages/_database/src/studio/business-glossary.snapshot.json`
- database Drizzle generation
  command: `pnpm --filter @afenda/database run db:generate`
  source surfaces:
  - database schema modules
  - drizzle configuration
    outputs:
  - `packages/_database/drizzle/**`
  - baseline migration adjustments through `ensure-public-schema-in-baseline-migration.ts`

## Import and entrypoint map

### Confirmed aliases

- `@/*`
  Declared in [apps/web/config/tsconfig/app.json](/C:/NexusCanon/afenda-react-vite/apps/web/config/tsconfig/app.json) and resolved by [apps/web/vite.config.ts](/C:/NexusCanon/afenda-react-vite/apps/web/vite.config.ts) to `apps/web/src/*`.
- `@afenda/*`
  Workspace package namespace used for package public surfaces.

### Current non-alias reality

- `@canon/*` is not part of the current repo-native import map.
- Package internals are still largely governed by package path conventions and package names, not a dedicated alias family.
- `apps/api` does not currently participate in the same `@/*` alias scheme as `apps/web` in this calibration document.

### Boundary guard calibration baseline

Current `RG-STRUCT-003` first-cut policy blocks only high-confidence drift:

- `apps/web/src/marketing` must not depend on:
  - `apps/web/src/app/_features`
  - `apps/web/src/routes`
  - `apps/web/src/rpc`
- `apps/web/src/share` must not depend on:
  - `apps/web/src/app/_features`
  - `apps/web/src/marketing`
  - `apps/web/src/routes`
  - `apps/web/src/rpc`
- `apps/web/src/app/_components` must not depend on:
  - `apps/web/src/app/_features`
  - `apps/web/src/marketing`
  - `apps/web/src/routes`
  - `apps/web/src/rpc`

Global machine-noise import blocks currently include:

- `.artifacts`
- `.turbo`
- `node_modules`
- `coverage`

Current high-confidence relative-path boundary blocks also include:

- relative imports from one workspace root into another workspace root such as `apps/* -> packages/*` or `packages/* -> apps/*`

## Doctrine and evidence binding map

### Guard doctrine and contract surfaces

- [REPOSITORY_INTEGRITY_GUARD.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md)
- [ADR-0008-repository-integrity-guard-architecture.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/adr/ADR-0008-repository-integrity-guard-architecture.md)
- [ATC-0005-repository-integrity-guard-baseline.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/atc/ATC-0005-repository-integrity-guard-baseline.md)
- [REPO_GUARDRAIL_TODO.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPO_GUARDRAIL_TODO.md)

### Current source-to-evidence bindings

`RG-TRUTH-004` currently treats these as explicit source/evidence loops:

- governance register refresh
  source:
  - `scripts/afenda.config.json`
    evidence:
  - `docs/architecture/governance/generated/governance-register.md`
  - `.artifacts/reports/governance/governance-register.snapshot.json`
- repo-guard architecture discovery surfaces
  source:
  - `docs/architecture/adr/ADR-0008-repository-integrity-guard-architecture.md`
  - `docs/architecture/atc/ATC-0005-repository-integrity-guard-baseline.md`
  - `docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md`
  - `docs/architecture/governance/REPO_GUARDRAIL_TODO.md`
    evidence:
  - `docs/OPERATING_MAP.md`
  - `docs/architecture/adr/README.md`
  - `docs/architecture/atc/README.md`
  - `docs/architecture/governance/README.md`
- design-system component governance
  source:
  - `packages/design-system/ui-primitives/**/*.tsx`
  - `packages/design-system/ui-primitives/**/*.manifest.ts`
  - `packages/design-system/ui-primitives/_registry.ts`
    evidence:
  - `packages/design-system/generated/component-manifests.json`
  - `packages/design-system/generated/component-variants.json`
  - `packages/design-system/generated/component-coverage.json`
- database schema inventory
  source:
  - `packages/_database/scripts/sync-schema-inventory.ts`
  - `packages/_database/src/schema/**/*.ts`
  - `packages/_database/src/7w1h-audit/**/*.ts`
    evidence:
  - `packages/_database/docs/guideline/schema-inventory.json`
- database glossary enum sync
  source:
  - `packages/_database/scripts/sync-glossary-enums.ts`
  - `packages/_database/src/studio/pg-enum-allowlist.ts`
  - `packages/_database/src/schema/shared/enums.schema.ts`
  - `packages/_database/src/schema/iam/auth-challenges.schema.ts`
  - `packages/_database/src/7w1h-audit/audit-enums.schema.ts`
    evidence:
  - `packages/_database/src/studio/business-glossary.snapshot.json`

## Calibration notes

### What is repo-native now

- ownership truth for the marketing rollout
- static owner-root scopes for major app and package families
- workspace root and package root topology
- actual web client source roots
- actual package profiles
- package export-based public surfaces
- real generator/output loops for governance, i18n, design-system, Better Auth, and database inventory
- actual alias map for `@/*` and `@afenda/*`
- actual governance evidence and register paths

### What still needs tightening

- broader owner-root map beyond the current static app/package scopes
- package public-surface and internal-surface import rules beyond export lists
- fuller generator manifest inventory beyond the current high-value generators
- wider source/evidence binding coverage outside current governance surfaces
- stronger doctrine-network bindings for older ADRs and ATCs
- app/api-specific import and generator truth if repo guard expands there later

## Calibration checklist

- [x] Root topology captured from `scripts/afenda.config.json`
- [x] Web client top-level roots captured
- [x] Marketing rollout owner truth captured
- [x] Static owner-root scopes for major app/package families captured
- [x] Package profiles captured
- [x] Public package exports captured
- [x] Current alias map captured
- [x] Current repo-global evidence roots captured
- [x] High-value generator/output loops captured
- [~] Broader owner-root map beyond marketing captured
- [ ] Package internal boundary map tightened
- [ ] Full generator manifest inventory captured
- [~] Wider source/evidence bindings captured

## Maintenance rule

If repo-guard policy changes rely on a root, generator, alias, or evidence loop that is not represented here, this document should be updated in the same pass.
