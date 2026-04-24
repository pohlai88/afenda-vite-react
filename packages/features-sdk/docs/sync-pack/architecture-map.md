---
title: Sync-Pack Architecture Map
description: Source layout, export map, and extension guide for the Sync-Pack module inside @afenda/features-sdk.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 70
---

# Sync-Pack Architecture Map

This document explains where the active Sync-Pack behavior lives and how the major modules relate.

## Top-level layout

```txt
packages/features-sdk/
  src/sync-pack/
    cli/
    check/
    doctor/
    generator/
    scaffold/
    schema/
    scoring/
    validate/
    verify/
    finding.ts
    package-contract.ts
    workspace.ts
    index.ts
  docs/sync-pack/
  rules/sync-pack/
  tests/sync-pack/
```

## Module responsibilities

### `src/sync-pack/index.ts`

Public export surface for the Sync-Pack SDK.

Exports include:

- schemas and inferred types
- scoring logic
- generator helpers
- scaffold helpers
- release-check, check, doctor, validate, and verify functions
- workspace resolution helpers

### `src/sync-pack/cli/`

CLI definitions and entrypoints.

Key behavior comes from `cli/shared.ts`:

- command registry
- usage/help metadata
- command grouping
- flag parsing rules
- dispatcher behavior

Important contract rule:

```txt
bare afenda-sync-pack -> quickstart only
```

### `src/sync-pack/schema/`

Typed metadata contracts implemented with Zod.

Main schemas:

- `candidate.schema.ts`
- `category.schema.ts`
- `priority.schema.ts`
- `review.schema.ts`
- `pack-template.schema.ts`
- `tech-stack.schema.ts`
- `stack-contract.schema.ts`

If you need to change metadata behavior, start here first.

### `src/sync-pack/check/`

Generated pack validation.

Checks:

- exact file contract
- candidate/path alignment
- handoff readiness rules
- empty markdown sections

### `src/sync-pack/doctor/`

Workspace dependency and catalog drift inspection.

Checks:

- guarded major version mismatches
- workspace catalog major drift
- packages not using `catalog:`

### `src/sync-pack/validate/`

Seed validation entrypoint.

Reads the governed seed path and validates that candidate data can be parsed and counted successfully.

### `src/sync-pack/verify/`

Workflow orchestrator.

Runs step order:

1. `release-check`
2. `check`
3. `doctor`
4. `validate`

Aggregates all findings into a single result shape.

### `src/sync-pack/package-contract.ts`

Implements `FSDK-CONTRACT-001` package release integrity checks.

This is the source of truth for:

- required package metadata
- required docs/rules/seed files
- required built template assets
- export/bin health
- runtime dependency and engine policy checks

### `src/sync-pack/finding.ts`

Unified finding model.

Standardizes:

- `severity`
- `code`
- `message`
- optional `filePath`
- optional remediation metadata

## Tests map

### `tests/sync-pack/cli-output.test.ts`

Verifies:

- JSON-only behavior
- CI exit behavior
- flag parsing
- command help output
- root dispatcher rules

### `tests/sync-pack/built-cli-smoke.test.ts`

Verifies built CLI behavior end-to-end, including:

- quickstart-only root command
- grouped help
- verify JSON output
- direct gate command execution

### `tests/sync-pack/package-contract.test.ts`

Verifies package release contract enforcement and finding codes.

## Safe extension guidance

If you want to extend Sync-Pack safely:

1. change schema/contracts first
2. update command behavior second
3. update tests third
4. update docs in this folder before considering the change complete

## Junior-friendly mental model

Think of Sync-Pack as four layers:

```txt
metadata schema
-> operator command
-> finding/remediation result
-> docs and tests that explain the contract
```

If one layer changes, the other three should usually be reviewed too.
