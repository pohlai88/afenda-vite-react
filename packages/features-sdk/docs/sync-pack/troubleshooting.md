---
title: Sync-Pack Troubleshooting
description: Failure isolation and recovery guide for Sync-Pack operators and maintainers.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 50
---

# Sync-Pack Troubleshooting

Use this guide when `feature-sync:verify`, `feature-sync:intent-check`, `feature-sync:sync-examples`, or `feature-sync:quality-validate` fails.

## Fast Isolation Order

Daily operator path:

```txt
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

Maintainer path:

```txt
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

## Problem: `intent-check` fails

Typical causes:

- package-owned changes exist with no changed non-draft intent
- intent truth-binding paths are invalid
- changed files are not covered by `expectedDiffScope`

Recovery:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
```

Then fix the truth-binding coverage and promote status from `draft`.

## Problem: `sync-examples` fails

Typical causes:

- a golden pack is no longer approved
- generated pack structure drifted
- the governed example set is incomplete

Recovery:

```txt
pnpm run feature-sync:check
pnpm run feature-sync:sync-examples
```

## Problem: `quality-validate` fails after maintainers changed the package

Typical causes:

- intent coverage is missing
- example fitness is stale or broken
- docs or command surfaces drifted from the live CLI

Recovery:

1. fix the first blocking finding
2. rerun the narrow maintainer command
3. rerun `pnpm run feature-sync:quality-validate`
