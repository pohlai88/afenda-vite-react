---
title: Sync-Pack Command Handbook
description: Operator and maintainer handbook for Sync-Pack commands, usage patterns, and recovery paths.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 20
---

# Sync-Pack Command Handbook

This handbook follows the current command tree in `src/sync-pack/cli/shared.ts`.

## Command Groups

| Group      | Commands                                                                                                          | Purpose                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| start      | `feature-sync`, `feature-sync:help`                                                                               | Safe entrypoint and grouped help     |
| workflow   | `feature-sync:verify`                                                                                             | Supported daily operator workflow    |
| maintainer | `feature-sync:intent`, `feature-sync:intent-check`, `feature-sync:sync-examples`, `feature-sync:quality-validate` | Maintainer governance and closure    |
| gate       | `feature-sync:release-check`, `feature-sync:check`, `feature-sync:doctor`, `feature-sync:validate`                | CI-safe release and validation gates |
| operator   | `feature-sync:rank`, `feature-sync:report`, `feature-sync:generate`, `feature-sync:scaffold`                      | Human-oriented utilities             |

## Global Rules

- bare `feature-sync` is quickstart only
- `verify` runs `release-check -> check -> doctor -> validate`
- `intent-check` and `quality-validate` enforce maintainer-only intent coverage
- `sync-examples` is the only mutating repair path for golden example fitness
- gate and maintainer validation commands support `--json` and `--ci` where defined
- human-oriented commands reject unsupported `--json` / `--ci`

## `pnpm run feature-sync`

Use this when you need orientation.

It prints:

- daily operator path
- maintainer commands
- golden examples
- current workspace / SDK / intent state
- explicit externalization deferral

It never auto-runs `verify`.

## `pnpm run feature-sync:verify`

Use this for daily operator validation.

It answers:

- what ran
- what passed
- what warned
- what failed
- what to fix next
- final verdict

## `pnpm run feature-sync:intent`

Use this when package-owned `features-sdk` surfaces are changing.

Example:

```txt
pnpm run feature-sync:intent -- --id v95-governance-runtime --title "V95 governance runtime" --owner governance-toolchain
```

This writes a draft `*.intent.json` file under `docs/sync-pack/change-intents/`.

## `pnpm run feature-sync:intent-check`

Use this to validate:

- changed non-draft intent exists
- truth-binding paths are valid
- diff coverage is explicit
- doctrine and evidence refs exist

It is a verdict engine, not a binary-only check.

## `pnpm run feature-sync:sync-examples`

Use this to regenerate:

- `docs/sync-pack/example-pack-registry.json`
- `docs/sync-pack/GOLDEN_EXAMPLES.md`

This command also refreshes the fitness metadata for all governed example packs.

## `pnpm run feature-sync:quality-validate`

Use this for maintainer closure.

It remains read-only and now includes:

- intent-check
- golden example fitness validation

If it fails because example fitness is stale or broken, repair with:

```txt
pnpm run feature-sync:sync-examples
```

## Release Gates

- `feature-sync:release-check`
- `feature-sync:check`
- `feature-sync:doctor`
- `feature-sync:validate`

These remain the CI-safe validation layer under `verify`.

## Operator Utilities

- `feature-sync:rank`
- `feature-sync:report`
- `feature-sync:generate`
- `feature-sync:scaffold`

Shared candidate filters:

```txt
--category <category>
--lane <lane>
--owner <team>
--pack <id-or-category/id>
```
