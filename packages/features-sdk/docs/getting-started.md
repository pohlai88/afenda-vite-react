---
title: Features SDK Getting Started
description: Entry guide to understand @afenda/features-sdk, its active module, and the safe first commands.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 2
---

# Getting Started

## What is `@afenda/features-sdk`?

`@afenda/features-sdk` is an internal Afenda package that combines:

- typed SDK APIs
- CLI entrypoints
- governed rules and seed data
- operational documentation

Its active feature module is **Sync-Pack**.

## What is Sync-Pack?

Sync-Pack is the governed workflow for turning curated feature candidates into structured implementation packs and validating the supporting package, metadata, and workspace conditions around them.

In practical terms, Sync-Pack helps Afenda teams:

- validate candidate metadata
- score and review candidate priority
- generate 11-file planning packs
- validate generated packs
- inspect dependency/catalog drift
- run an aggregated release/operator verification flow

## What does this package own?

Inside `packages/features-sdk`:

- `src/sync-pack`: SDK source and CLI logic
- `rules/sync-pack`: governed rules and curated seed input
- `docs/sync-pack`: active Sync-Pack docs and contracts
- `tests/sync-pack`: package, CLI, and workflow tests

## Who should use it?

### Junior DevOps

Use it to:

- build and verify package readiness
- inspect warnings and errors from release gates
- validate whether the package is safe to use internally

### Junior developers

Use it to:

- understand candidate metadata requirements
- generate or inspect planning packs
- validate output before implementation handoff

### Contributors to the SDK

Use it to:

- extend schemas and workflows
- maintain release-gate contracts
- keep CLI behavior deterministic and test-backed

## What command should I run first?

From the monorepo root:

```txt
pnpm run feature-sync
```

That is the **safe first command**.

It is intentionally deterministic quickstart only.

It does **not** auto-run verify.

## What are the current internal features?

Today Sync-Pack gives internal teams these core features:

- typed candidate schemas and validation
- candidate scoring and priority review
- governed 11-file planning pack generation
- generated-pack structure checks
- dependency and catalog drift inspection
- package contract and release-gate validation
- tech-stack scaffold manifest generation
- package-first quality validation with closure verdicts
- richer finding remediation with exact rerun commands and governed docs
- junior-safe quickstart and verification workflow

## What command should I run daily?

```txt
pnpm run feature-sync:verify
```

That runs the supported workflow:

```txt
release-check -> check -> doctor -> validate
```

## What success looks like

For most day-to-day operator use:

- `verify` completes without errors
- `release-check` has `errorCount = 0`
- `check` has `errorCount = 0`
- `validate` has `errorCount = 0`
- `doctor` may still report warnings, but warnings are non-blocking in CI mode

If you are changing the SDK package itself, finish with:

```txt
pnpm run feature-sync:quality-validate
```

## What is the internal Definition of Done?

For internal use, the package is done when:

- a developer can discover the correct command path
- `verify` runs without errors
- release gates stay deterministic
- generated packs stay governed and aligned with rules
- junior-facing docs are sufficient for first-use workflows

Read the canonical rule in:

- [../rules/sync-pack/FEATURE_SYNC_PACK_DOD.md](../rules/sync-pack/FEATURE_SYNC_PACK_DOD.md)

## What is the current plan?

Use the internal-first roadmap:

- [sync-pack/INTERNAL_ROADMAP.md](./sync-pack/INTERNAL_ROADMAP.md)

## What to read next

- [junior-devops-quickstart.md](./junior-devops-quickstart.md)
- [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)
- [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)
- [sync-pack/troubleshooting.md](./sync-pack/troubleshooting.md)
