---
title: FSDK-EXAMPLE-001 Golden Example Fitness Contract
description: Governed fitness contract for Sync-Pack golden example packs and their registry.
status: active
owner: governance-toolchain
truthStatus: source
docClass: contract
surfaceType: docs
relatedDomain: feature-sync-pack
order: 13
---

# FSDK-EXAMPLE-001: Golden Example Fitness Contract

`FSDK-EXAMPLE-001` governs the internal example-pack set used by `@afenda/features-sdk`.

The goal is to keep examples alive as governed truth, not let them drift into stale documentation.

## Registry surfaces

Machine registry:

```txt
packages/features-sdk/docs/sync-pack/example-pack-registry.json
```

Human guide:

```txt
packages/features-sdk/docs/sync-pack/GOLDEN_EXAMPLES.md
```

## Machine contract

```ts
type ExamplePackMeta = {
  packId: string
  name: string
  category: FeatureCategory
  maturity: "golden" | "secondary"
  fitness: {
    lastVerifiedAt: string
    sdkVersion: string
    verifyStatus: "pass" | "fail"
  }
}
```

## Governed golden set

The golden set is fixed for this internal slice:

- `internal-support-crm`
- `bi-reporting-starter`
- `iam-sso-control-plane`
- `uptime-monitoring-workbench`

All other existing generated packs remain `secondary`.

## Rules

- The example registry must cover the governed example-pack set.
- The four golden examples must exist in both the registry and generated-pack tree.
- Golden examples must be `approved` in the seed and in generated pack output.
- Fitness metadata is written only by:

```txt
pnpm run feature-sync:sync-examples
```

- `quality-validate` is read-only and fails if:
  - a golden entry is missing
  - a golden entry is not marked `golden`
  - fitness metadata is stale or mismatched
  - a golden example pack is broken

## Repair path

When golden example fitness is stale or broken:

```txt
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

If `sync-examples` still reports errors, repair the affected generated pack or seed candidate first.
