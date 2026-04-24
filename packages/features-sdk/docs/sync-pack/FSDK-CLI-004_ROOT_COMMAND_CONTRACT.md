---
title: FSDK-CLI-004 Root Command Contract
description: Internal root command contract for bare feature-sync and afenda-sync-pack execution.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 25
---

# FSDK-CLI-004: Root Command Contract

## Purpose

`FSDK-CLI-004` defines the deterministic start-here behavior for the Sync-Pack root command.

## Contract

Bare root command execution must always be quickstart only:

```txt
pnpm run feature-sync
afenda-sync-pack
```

Root command rules:

- always safe to run
- always human-first
- always prints the recommended next command
- never performs validation side effects
- never auto-runs `verify`
- never changes behavior based on TTY, build state, or workspace state

## Required next-step guidance

The root command must always recommend:

```txt
pnpm run feature-sync:verify
```

It must also surface the common explicit paths:

- `feature-sync:release-check`
- `feature-sync:check`
- `feature-sync:doctor`
- `feature-sync:validate`
- `feature-sync:help`
