---
title: FSDK-INTENT-001 Change Intent Contract
description: Truth-bound change-intent contract for Sync-Pack maintainer work.
status: active
owner: governance-toolchain
truthStatus: source
docClass: contract
surfaceType: docs
relatedDomain: feature-sync-pack
order: 12
---

# FSDK-INTENT-001: Change Intent Contract

`FSDK-INTENT-001` governs how maintainers declare and validate package-level changes to `@afenda/features-sdk`.

This contract is maintainer-facing.

It does not change the daily operator workflow and it does not apply to `feature-sync:verify`.

## Purpose

The intent artifact is a truth object, not a loose note.

It must answer:

- what changed
- why it changed
- which doctrine and invariants it touches
- which files are expected to move
- which generated outputs should exist
- how the maintainer plans to validate the change

## Artifact location

Intent files live in:

```txt
packages/features-sdk/docs/sync-pack/change-intents/*.intent.json
```

## Machine contract

```ts
type SyncPackChangeIntent = {
  id: string
  title: string
  status: "draft" | "accepted" | "implemented"
  owner: string
  summary: string
  changedSurface: Array<
    | "src"
    | "docs"
    | "rules"
    | "package-metadata"
    | "generated-packs"
    | "root-scripts"
  >
  commandsAffected: string[]
  truthBinding: {
    doctrineRefs: string[]
    invariantRefs: string[]
    expectedDiffScope: string[]
    expectedGeneratedOutputs: string[]
    evidenceRefs: string[]
  }
  validationPlan: string[]
  reviewNote: string
}
```

## Rules

- `id` must use kebab-case and match the filename.
- `status: "draft"` is allowed for scaffolding only.
- `intent-check` and `quality-validate` require at least one changed non-draft intent file when package-owned `features-sdk` surfaces are modified.
- `doctrineRefs`, `evidenceRefs`, and `expectedGeneratedOutputs` must be repo-relative paths.
- `invariantRefs` must be one of:
  - `FSDK-CONTRACT-001`
  - `FSDK-CLI-001`
  - `FSDK-CLI-002`
  - `FSDK-CLI-003`
  - `FSDK-CLI-004`
  - `FSDK-FINDING-001`
  - `FSDK-INTENT-001`
  - `FSDK-EXAMPLE-001`
- `expectedDiffScope` supports only:
  - exact repo-relative file paths
  - repo-relative `path/**` prefixes
- `expectedDiffScope` must not use absolute paths, empty strings, or backtracking like `../`.

## Enforcement boundary

Intent enforcement applies only to:

- `feature-sync:intent-check`
- `feature-sync:quality-validate`

Intent enforcement does not apply to:

- `feature-sync:verify`
- `feature-sync:release-check`
- `feature-sync:check`
- `feature-sync:doctor`
- `feature-sync:validate`

## Repair path

When intent coverage is missing or invalid:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
```

Then complete the truth-binding fields, promote the status from `draft`, and rerun `quality-validate`.
