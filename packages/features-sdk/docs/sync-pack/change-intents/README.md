---
title: Sync-Pack Change Intents
description: Maintainer intent lifecycle and file rules for Sync-Pack truth-bound change artifacts.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 14
---

# Sync-Pack Change Intents

This folder stores truth-bound maintainer intent artifacts for `@afenda/features-sdk`.

## Lifecycle

1. scaffold a draft intent with:

```txt
pnpm run feature-sync:intent -- --id <id> --title "<title>" --owner <owner>
```

2. complete the truth-binding fields
3. promote status to `accepted` or `implemented`
4. run:

```txt
pnpm run feature-sync:intent-check
pnpm run feature-sync:quality-validate
```

## File rules

- one file per intent
- filename must be `<id>.intent.json`
- `id` must match the filename
- paths inside the file must be repo-relative
- `truthBinding` must be completed before the intent is treated as accepted or implemented
- `expectedDiffScope` may use exact file paths or `path/**` prefixes only

## Boundary

Intent files are a maintainer governance surface.

They are not required for normal daily operator use and they do not block `feature-sync:verify`.
