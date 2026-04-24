---
title: Feature Sync-Pack SDK
description: Active operating guide for the Sync-Pack module inside @afenda/features-sdk.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 10
---

# Feature Sync-Pack

`sync-pack` is the active feature-planning module inside `@afenda/features-sdk`.

It turns curated software discovery into governed internal feature packs using this operating chain:

```txt
Idea -> Template -> Tech Stack -> Contract -> Implementation Plan -> DoD
```

## Current Internal Features

The module currently provides:

- typed candidate and metadata validation
- candidate scoring and category/lane mapping
- governed 11-file pack generation
- generated-pack validation
- package contract validation
- dependency and stack drift inspection
- aggregated operator verification workflow
- package-first quality validation workflow
- workspace-scoped candidate filtering for `rank`, `report`, and `generate`
- tech-stack scaffold manifest generation with package placement and route guidance
- richer gated finding remediation with exact rerun commands and governed doc links
- junior-friendly start-here and usage guidance

## Start here

If you are new, read these in order:

1. [../getting-started.md](../getting-started.md)
2. [../junior-devops-quickstart.md](../junior-devops-quickstart.md)
3. [../junior-developer-usage-guide.md](../junior-developer-usage-guide.md)
4. [command-handbook.md](./command-handbook.md)

Workspace entrypoint:

```txt
pnpm run feature-sync
```

Daily operator workflow:

```txt
pnpm run feature-sync:verify
```

Root rule:

```txt
feature-sync is always quickstart only.
It never auto-runs verify.
```

## What Sync-Pack Owns

- Code: `packages/features-sdk/src/sync-pack`
- Rules and seed data: `packages/features-sdk/rules/sync-pack`
- Generated planning packs: `packages/features-sdk/docs/sync-pack/generated-packs`
- Active docs and contracts: `packages/features-sdk/docs/sync-pack`
- Tests: `packages/features-sdk/tests/sync-pack`

## CLI Model

| Command                                  | Class             | Purpose                                                       |
| ---------------------------------------- | ----------------- | ------------------------------------------------------------- |
| `pnpm run feature-sync`                  | start here        | Explain the module, boundaries, and next command.             |
| `pnpm run feature-sync:help`             | start here        | Show grouped command help and examples.                       |
| `pnpm run feature-sync:verify`           | operator workflow | Run `release-check -> check -> doctor -> validate`.           |
| `pnpm run feature-sync:quality-validate` | operator workflow | Run the full package-first release validation workflow.       |
| `pnpm run feature-sync:release-check`    | release gate      | Validate `FSDK-CONTRACT-001` package/build integrity.         |
| `pnpm run feature-sync:check`            | release gate      | Validate generated pack structure and candidate alignment.    |
| `pnpm run feature-sync:doctor`           | release gate      | Inspect guarded dependency and stack drift.                   |
| `pnpm run feature-sync:validate`         | release gate      | Validate curated seed input.                                  |
| `pnpm run feature-sync:rank`             | operator utility  | Print candidate scoring evidence.                             |
| `pnpm run feature-sync:report`           | operator utility  | Print grouped portfolio evidence with optional filters.       |
| `pnpm run feature-sync:generate`         | operator utility  | Generate planning packs from seed candidates or one slice.    |
| `pnpm run feature-sync:scaffold`         | operator utility  | Generate a tech-stack scaffold manifest plus placement hints. |

Boundary:

- `verify` and the gated commands are CI-safe
- `quality-validate` is the package-first release validation workflow for maintainers
- `rank`, `report`, `generate`, and `scaffold` are still human-oriented operator utilities
- `rank`, `report`, and `generate` now share the candidate filter family: `--category`, `--lane`, `--owner`, `--pack`

## SDK Model

Sync-Pack is not only a CLI.

It also exports reusable SDK functions for:

- candidate schemas and typed contracts
- category, priority, and review rules
- pack generation
- report generation
- scaffold generation
- package contract validation
- generated-pack validation
- doctor and verify orchestration

Example:

```ts
import {
  checkFeatureSdkPackageContract,
  checkGeneratedPacks,
  generateFeaturePack,
  runSyncPackDoctor,
  runSyncPackValidate,
  runSyncPackVerify,
} from "@afenda/features-sdk/sync-pack"
```

## Why The Package Name Stays `features-sdk`

Keep `@afenda/features-sdk`.

Reason:

- the package exports SDK APIs in addition to CLI entrypoints
- the package owns doctrine, rules, and seed data in addition to executable commands
- the CLI surface is already accurately branded at the module level as `sync-pack`

`features-cli` would only be a better name if this package becomes CLI-only or is split into separate SDK and CLI distribution packages.

## Active Contracts

- [../../rules/sync-pack/FEATURE_SYNC_PACK_DOD.md](../../rules/sync-pack/FEATURE_SYNC_PACK_DOD.md)
- [INTERNAL_OPERATING_CONTRACT.md](./INTERNAL_OPERATING_CONTRACT.md)
- [FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md](./FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md)
- [FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md](./FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md)
- [FSDK-CLI-003_COMMAND_TREE_CONTRACT.md](./FSDK-CLI-003_COMMAND_TREE_CONTRACT.md)
- [FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md](./FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md)
- [FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md](./FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md)
- [FSDK-CLI_SCORECARD.md](./FSDK-CLI_SCORECARD.md)
- [CLI_OPERATOR_BENCHMARK_NOTE.md](./CLI_OPERATOR_BENCHMARK_NOTE.md)
- [INTERNAL_ROADMAP.md](./INTERNAL_ROADMAP.md)
- [QUALITY_VALIDATION_EXECUTION_PLAN.md](./QUALITY_VALIDATION_EXECUTION_PLAN.md)

## Practical docs for operators

- [command-handbook.md](./command-handbook.md): what each command does, when to use it, and how to recover from common failures
- [../junior-developer-usage-guide.md](../junior-developer-usage-guide.md): safe command order for junior developers
- [metadata-reference.md](./metadata-reference.md): field-level metadata contract for candidates and scaffold manifests
- [finding-remediation-catalog.md](./finding-remediation-catalog.md): current finding codes, meanings, and likely fixes
- [troubleshooting.md](./troubleshooting.md): isolate failures quickly
- [recipes.md](./recipes.md): common workflows from seed to pack to verify
- [architecture-map.md](./architecture-map.md): source layout and extension map for contributors
- [INTERNAL_ROADMAP.md](./INTERNAL_ROADMAP.md): internal now/next/later plan

## Internal Readiness

Current governed scorecard state:

- pre-V3 baseline: `62 / 100`
- current standing before the next scoring refresh: `85 / 100`
- internal target: `90+ / 100`

Read the full rationale in [FSDK-CLI_SCORECARD.md](./FSDK-CLI_SCORECARD.md).

## Definition Of Done

The canonical internal Definition of Done lives in:

- [../../rules/sync-pack/FEATURE_SYNC_PACK_DOD.md](../../rules/sync-pack/FEATURE_SYNC_PACK_DOD.md)

Use that rule when deciding whether Sync-Pack is ready for internal use, not partner/public use.

## Troubleshooting

If the internal workflow is red, use this order:

```txt
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync:verify
```

If you need to isolate the failure:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

`doctor` warnings remain non-blocking until a separate dependency cleanup pass promotes them, but active warnings should still carry a concrete remediation path.

## Active vs Historical

This folder is the active operating surface.

Historical planning material is retained under [archive](./archive/README.md) and must not be treated as current doctrine.
