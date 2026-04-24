---
title: Sync-Pack Internal Operating Contract
description: Internal operating contract for the Afenda Sync-Pack SDK and CLI.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 21
---

# Sync-Pack Internal Operating Contract

## Supported Use

`sync-pack` is supported only for Afenda internal teams operating inside the Afenda pnpm workspace.

## Supported Command Classes

Start here:

```txt
pnpm run feature-sync
pnpm run feature-sync:help
```

Daily operator:

```txt
pnpm run feature-sync:verify
```

SDK/package maintainer:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

Release gates:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

## Boundary

- bare `feature-sync` is quickstart only and never auto-runs `verify`
- `feature-sync:verify` is the operator workflow command
- `feature-sync:intent-check` and `feature-sync:quality-validate` are maintainer validation surfaces
- `feature-sync:sync-examples` is the only mutating repair path for golden example fitness
- partner and public externalization are deferred
