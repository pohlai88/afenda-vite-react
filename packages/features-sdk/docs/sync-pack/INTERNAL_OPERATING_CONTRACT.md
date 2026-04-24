---
title: Sync-Pack Internal Operating Contract
description: Internal operating contract for the Afenda Sync-Pack SDK and CLI.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 21
---

# Sync-Pack Internal Operating Contract

## Supported use

`sync-pack` is supported only for Afenda internal teams operating inside the Afenda pnpm workspace.

## Required environment

- Node: `^20.19.0 || >=22.12.0`
- Workspace marker: `pnpm-workspace.yaml`
- Package root: `packages/features-sdk`
- Packaged rules/templates/docs must remain present for build and release validation

## Supported command classes

Start here:

```txt
pnpm run feature-sync
pnpm run feature-sync:help
```

Operator workflow:

```txt
pnpm run feature-sync:verify
```

Release-gate commands:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

Operator utilities:

```txt
pnpm run feature-sync:rank
pnpm run feature-sync:report
pnpm run feature-sync:generate
pnpm run feature-sync:scaffold
```

## Internal readiness path

Recommended internal validation order:

```txt
pnpm run feature-sync
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync:verify
```

## Failure interpretation

- `feature-sync` explains the CLI purpose, green path, and next commands
- `feature-sync:verify` runs the supported operator workflow and gives a final verdict
- `release-check` validates `FSDK-CONTRACT-001` package integrity
- `check` validates generated pack structure and candidate contract alignment
- `doctor` validates dependency/version drift with warnings remaining non-blocking
- `validate` confirms curated seed input parses cleanly

## Common remediation flows

- Missing built assets: rebuild `@afenda/features-sdk`
- Missing or invalid generated-pack files: rerun generation or repair pack content to match template contract
- Workspace-root discovery errors: rerun from inside the Afenda workspace
- Catalog/version drift errors: align package dependencies with workspace policy

## Support boundary

This package is governed for Afenda internal workspace use only.

Anything outside that boundary is not part of the active operating contract and must not drive internal implementation decisions, release gates, or documentation priorities.

Boundary summary:

- `feature-sync` and `feature-sync:help` are the start-here commands
- bare `feature-sync` is quickstart only and never auto-runs `verify`
- `feature-sync:verify` is the operator workflow command
- `release-check`, `check`, `doctor`, and `validate` are the underlying CI-safe gates
- `rank`, `report`, `generate`, and `scaffold` are operator utilities
