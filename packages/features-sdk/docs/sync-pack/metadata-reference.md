---
title: Sync-Pack Metadata Reference
description: Field reference for candidate, scaffold, intent, and example-fitness metadata.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 30
---

# Sync-Pack Metadata Reference

## Candidate And Scaffold Metadata

The primary operational schemas remain:

- `appCandidateSchema`
- `stackScaffoldManifestSchema`

Use these commands against candidate metadata:

```txt
pnpm run feature-sync:validate
pnpm run feature-sync:generate
pnpm run feature-sync:check
pnpm run feature-sync:verify
```

## Change Intent Metadata

Primary contract:

- `FSDK-INTENT-001`

Intent files live in:

```txt
packages/features-sdk/docs/sync-pack/change-intents/*.intent.json
```

Important truth-binding fields:

- `doctrineRefs`
- `invariantRefs`
- `expectedDiffScope`
- `expectedGeneratedOutputs`
- `evidenceRefs`

Use:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
```

## Example Fitness Metadata

Primary contract:

- `FSDK-EXAMPLE-001`

Registry:

```txt
packages/features-sdk/docs/sync-pack/example-pack-registry.json
```

Important fields:

- `packId`
- `category`
- `maturity`
- `fitness.lastVerifiedAt`
- `fitness.sdkVersion`
- `fitness.verifyStatus`

Use:

```txt
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```
