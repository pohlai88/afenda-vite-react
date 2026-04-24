---
title: Junior Developer Usage Guide
description: Junior-friendly usage guide for Sync-Pack validation, generation, examples, and handoff workflows.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 4
---

# Junior Developer Usage Guide

Use Sync-Pack when you need to validate candidate metadata, generate governed planning packs, inspect example packs, or bootstrap a new internal feature implementation.

## Safe Command Order

From the monorepo root:

```txt
pnpm run feature-sync
pnpm run feature-sync:validate
pnpm run feature-sync:rank
pnpm run feature-sync:generate
pnpm run feature-sync:check
pnpm run feature-sync:verify
```

If you changed the SDK package, docs, or rules rather than only candidate content, finish with the maintainer flow:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

## Golden Examples

Start from these governed examples when they match your problem:

- `internal-support-crm`
- `bi-reporting-starter`
- `iam-sso-control-plane`
- `uptime-monitoring-workbench`

Read:

- [sync-pack/GOLDEN_EXAMPLES.md](./sync-pack/GOLDEN_EXAMPLES.md)

## Useful Filters

These operator commands share the same filter family:

- `feature-sync:rank`
- `feature-sync:report`
- `feature-sync:generate`

Supported filters:

```txt
--category <category>
--lane <lane>
--owner <team>
--pack <id-or-category/id>
```

## What a Good Result Looks Like

You are in a good state when:

- `validate` succeeds
- `generate` writes the expected pack folders
- `check` succeeds
- `verify` succeeds without errors

If you used `scaffold`, a good result also includes:

- package placement hints
- suggested API and web paths
- route guidance
- next commands

## When To Ask For Help

Ask a package maintainer when:

- `release-check` fails
- `intent-check` fails and you are unsure how to cover the diff
- golden example guidance does not match the actual pack set
- CLI behavior differs from the docs
