---
title: Sync-Pack Finding and Remediation Catalog
description: Current finding codes for Sync-Pack gates, maintainer validation, and example fitness.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 40
---

# Sync-Pack Finding and Remediation Catalog

This catalog documents the active finding families for Sync-Pack.

## Core Rule

- every gated `error` must include remediation
- warnings should include remediation when there is a concrete next step

## Existing Gate Findings

The existing release-check, check, doctor, and validate findings remain active.

Representative high-signal codes:

- `missing-export-target`
- `missing-required-package-file`
- `catalog-not-used`
- `invalid-seed-candidate`
- `pack-file-contract-mismatch`

## Intent-Check Findings

| Code                          | Meaning                                                                  | Fix                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `missing-change-intent`       | package-owned Sync-Pack changes exist without a changed non-draft intent | run `pnpm run feature-sync:intent`, complete the artifact, promote status, rerun `feature-sync:intent-check` |
| `draft-intent-only`           | only draft intents changed                                               | promote the changed draft to `accepted` or `implemented`, rerun `feature-sync:intent-check`                  |
| `uncovered-change-scope`      | changed file is not covered by `truthBinding.expectedDiffScope`          | update diff scope in the changed non-draft intent and rerun `feature-sync:intent-check`                      |
| `missing-intent-doctrine-ref` | doctrine ref path does not exist                                         | correct the doctrine path in the intent file                                                                 |
| `missing-intent-evidence-ref` | evidence ref path does not exist                                         | correct the evidence path in the intent file                                                                 |
| `invalid-intent-json`         | intent file is invalid JSON                                              | repair JSON syntax                                                                                           |
| `invalid-intent-schema`       | intent file violates `FSDK-INTENT-001`                                   | fix schema fields and rerun                                                                                  |
| `intent-path-id-mismatch`     | filename and `id` do not match                                           | rename the file or fix the `id`                                                                              |

## Golden Example Fitness Findings

| Code                                 | Meaning                                                | Fix                                                                                     |
| ------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `missing-example-pack-registry`      | example registry is missing                            | run `pnpm run feature-sync:sync-examples`                                               |
| `missing-golden-examples-guide`      | golden examples guide is missing                       | run `pnpm run feature-sync:sync-examples`                                               |
| `missing-golden-example-entry`       | required golden pack is absent from registry           | rerun `feature-sync:sync-examples` after restoring the generated pack                   |
| `golden-example-pack-not-approved`   | golden generated pack candidate is not `approved`      | promote the generated `00-candidate.json` status and rerun `feature-sync:sync-examples` |
| `golden-example-seed-not-approved`   | golden seed candidate is not `approved`                | promote the seed candidate and rerun `feature-sync:sync-examples`                       |
| `broken-golden-example-pack`         | golden pack no longer passes generated-pack validation | repair the pack, rerun `feature-sync:check`, then rerun `feature-sync:sync-examples`    |
| `stale-example-fitness-sdk-version`  | registry fitness still points to an older SDK version  | rerun `feature-sync:sync-examples`                                                      |
| `golden-example-guide-command-drift` | guide no longer references the governed command set    | rerun `feature-sync:sync-examples`                                                      |

## Maintainer Recovery Pattern

When a maintainer finding appears:

1. fix the source issue
2. rerun the narrow maintainer command first
3. rerun `pnpm run feature-sync:quality-validate` last
