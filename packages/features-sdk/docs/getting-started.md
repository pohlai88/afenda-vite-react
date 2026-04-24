---
title: Features SDK Getting Started
description: Entry guide to understand @afenda/features-sdk, Sync-Pack, and the safe first command path.
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
- operating contracts and docs

Its active feature module is **Sync-Pack**.

## What is Sync-Pack?

Sync-Pack turns curated feature candidates into governed planning packs and validates the package, metadata, generated outputs, and workspace conditions around them.

## What command should I run first?

From the monorepo root:

```txt
pnpm run feature-sync
```

That command is the read-only control console.

It never auto-runs `verify`.

## What command should I run daily?

```txt
pnpm run feature-sync:verify
```

That runs the supported operator workflow:

```txt
release-check -> check -> doctor -> validate
```

## What if I am changing the SDK/package itself?

Use the maintainer path:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

## What does success look like?

For daily operator use:

- `verify` completes without errors
- `release-check`, `check`, and `validate` are green
- `doctor` warnings may remain visible, but warnings alone are non-blocking

For package maintainer closure:

- `intent-check` passes
- golden example fitness is valid
- `quality-validate` closes as `PASS`

## What to read next

- [junior-devops-quickstart.md](./junior-devops-quickstart.md)
- [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)
- [sync-pack/README.md](./sync-pack/README.md)
- [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)
