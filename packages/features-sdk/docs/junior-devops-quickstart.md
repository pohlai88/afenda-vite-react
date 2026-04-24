---
title: Junior DevOps Quickstart
description: Junior-friendly quickstart for building, verifying, and troubleshooting Sync-Pack in the Afenda workspace.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 3
---

# Junior DevOps Quickstart

This guide answers five questions first:

1. What is Sync-Pack?
2. Who uses it?
3. What command do I run first?
4. What does success look like?
5. What do I do when it fails?

If you are a junior developer rather than DevOps, read:

- [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)

## What is Sync-Pack?

Sync-Pack is Afenda's internal feature-planning and validation workflow inside `@afenda/features-sdk`.

It combines:

- package integrity checks
- generated pack validation
- dependency/catalog drift inspection
- seed metadata validation

## Who uses it?

- junior DevOps operating the internal package and CI checks
- junior developers consuming generated planning packs
- package contributors maintaining rules, schemas, and CLI workflows

## What command do I run first?

From repo root:

```txt
pnpm run feature-sync
```

This is the supported first step.

It prints quickstart guidance only.

## What command do I run next?

```txt
pnpm run feature-sync:verify
```

That is the supported daily operator command.

## What are the current internal features?

The internal package currently supports:

- package release checks
- generated pack checks
- dependency and catalog doctor checks
- seed validation
- governed pack generation
- tech-stack scaffold generation
- explicit quickstart and verify workflows
- package-first quality validation
- richer gated remediation with exact rerun commands and governed doc links

## Clean-clone checklist

From the monorepo root:

```txt
pnpm install
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync
pnpm run feature-sync:verify
```

## Expected success state

You are in a healthy state when:

- quickstart prints guidance without errors
- verify completes
- verify JSON/text summary shows `errorCount: 0`
- `release-check`, `check`, and `validate` pass
- `doctor` may show warnings, but warnings alone do not fail CI mode

## If verify fails

Isolate the failing step in this order:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

Then use this rule of thumb:

### If `release-check` fails

Likely causes:

- missing build output under `dist`
- missing required package docs or rules
- invalid package metadata
- broken export or bin targets

First fix to try:

```txt
pnpm --filter @afenda/features-sdk build
```

Then re-run `feature-sync:release-check`.

### If `check` fails

Likely causes:

- no generated packs exist
- wrong file set in a generated pack
- candidate id does not match the folder path
- candidate category does not match the folder path
- a markdown section is empty

First fix to try:

```txt
pnpm run feature-sync:generate
pnpm run feature-sync:check
```

### If `doctor` fails

Likely causes:

- guarded dependency major version mismatch
- package declares explicit versions where workspace catalog is preferred

First fix to try:

- align major versions with workspace policy
- switch allowed dependencies to `catalog:` when appropriate

### If `validate` fails

Likely causes:

- invalid candidate metadata in `rules/sync-pack/openalternative.seed.json`
- wrong enum values
- lane/category mismatch
- malformed URLs or ids

First fix to try:

- compare the failing candidate against the metadata reference
- repair the seed file and re-run validate

## JSON mode for CI or scripting

Supported gate and workflow commands accept:

```txt
--json --ci
```

Example:

```txt
pnpm run feature-sync:verify -- --json --ci
```

Behavior:

- JSON only on stdout
- errors set failure exit code in CI mode
- warnings alone remain non-blocking

If you changed the SDK package, docs, or contracts themselves rather than only running the daily workflow, finish with:

```txt
pnpm run feature-sync:quality-validate
```

## Next docs to use

- [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)
- [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)
- [sync-pack/finding-remediation-catalog.md](./sync-pack/finding-remediation-catalog.md)
- [sync-pack/troubleshooting.md](./sync-pack/troubleshooting.md)
