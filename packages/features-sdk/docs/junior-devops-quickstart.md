---
title: Junior DevOps Quickstart
description: Junior-friendly quickstart for Sync-Pack daily verification and maintainer closure.
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

1. what is Sync-Pack?
2. what command do I run first?
3. what command do I run daily?
4. what does green look like?
5. what do I do when it fails?

## What command do I run first?

From repo root:

```txt
pnpm run feature-sync
```

This is the supported first step and read-only control console.

## What command do I run daily?

```txt
pnpm run feature-sync:verify
```

## Maintainer-only commands

If you are changing the SDK/package itself rather than operating it day to day, use:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

## Clean-Clone Checklist

```txt
pnpm install
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync
pnpm run feature-sync:verify
```

## Expected Success State

You are healthy when:

- quickstart prints guidance without errors
- verify completes
- verify shows `errorCount: 0`
- `release-check`, `check`, and `validate` pass
- `doctor` warnings, if present, stay visible but non-blocking

## If Verify Fails

Isolate the failing step in this order:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

If you changed the SDK/package and maintainer closure fails, isolate:

```txt
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

## JSON Mode

Gate and maintainer validation commands support:

```txt
--json --ci
```

Examples:

```txt
pnpm run feature-sync:verify -- --json --ci
pnpm run feature-sync:intent-check -- --json --ci
pnpm run feature-sync:quality-validate -- --json --ci
```
