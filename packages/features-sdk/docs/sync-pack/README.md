---
title: Feature Sync-Pack SDK
description: Package-local operating guide for the Sync-Pack module in the Afenda Features SDK.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 10
---

# Feature Sync-Pack SDK

`sync-pack` is a feature module inside `@afenda/features-sdk`.

It owns the full lifecycle for turning open-source discovery patterns into internal application planning packs:

```txt
Idea -> Template -> Tech Stack -> Contract -> Implementation Plan -> DoD
```

## Owned Surfaces

- Code: `packages/features-sdk/src/sync-pack`
- Rules and seed data: `packages/features-sdk/rules/sync-pack`
- Generated planning packs: `packages/features-sdk/docs/sync-pack/generated-packs`
- Tests: `packages/features-sdk/tests/sync-pack`

## Boundary Rule

Keep Sync-Pack artifacts inside `packages/features-sdk` unless a separate publish step intentionally exports a copy to repo-level docs.

OpenAlternative is discovery. Sync-Pack is translation. Afenda governance is approval.

## Current target

```txt
Internal Afenda SDK / CLI only
```

This package is optimized for the Afenda workspace and Afenda governance model.

Active internal contract docs:

- [INTERNAL_OPERATING_CONTRACT.md](./INTERNAL_OPERATING_CONTRACT.md)
- [FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md](./FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md)
- [FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md](./FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md)
- [FSDK-CLI-003_COMMAND_TREE_CONTRACT.md](./FSDK-CLI-003_COMMAND_TREE_CONTRACT.md)
- [FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md](./FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md)
- [FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md](./FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md)
- [FSDK-CLI_SCORECARD.md](./FSDK-CLI_SCORECARD.md)
- [CLI_OPERATOR_BENCHMARK_NOTE.md](./CLI_OPERATOR_BENCHMARK_NOTE.md)

## Governance line

Start here:

```txt
pnpm run feature-sync
pnpm run feature-sync:help
```

Operator workflow:

```txt
pnpm run feature-sync:verify
```

Release-gate commands:

```txt
check
doctor
release-check
validate
```

Non-gated operator commands:

```txt
rank
report
generate
scaffold
```

`verify` and the underlying release-gate commands are part of the strict CI-safe contract.

## Command Intent

| Command                               | Class             | Purpose                                                                   |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| `pnpm run feature-sync`               | start here        | Explain Sync-Pack, green path, and next command.                          |
| `pnpm run feature-sync:help`          | start here        | Show grouped CLI help and command discovery.                              |
| `pnpm run feature-sync:verify`        | operator workflow | Run the daily workflow across release-check, check, doctor, and validate. |
| `pnpm run feature-sync:release-check` | release gate      | Validate package/build integrity through `FSDK-CONTRACT-001`.             |
| `pnpm run feature-sync:check`         | release gate      | Validate generated feature-pack structure and candidate alignment.        |
| `pnpm run feature-sync:doctor`        | release gate      | Inspect guarded dependency and stack-version drift.                       |
| `pnpm run feature-sync:validate`      | release gate      | Validate curated seed JSON.                                               |
| `pnpm run feature-sync:rank`          | operator utility  | Show candidate priority score comparison.                                 |
| `pnpm run feature-sync:report`        | operator utility  | Show grouped portfolio evidence.                                          |
| `pnpm run feature-sync:generate`      | operator utility  | Generate planning packs from seed candidates.                             |
| `pnpm run feature-sync:scaffold`      | operator utility  | Generate a tech-stack scaffold manifest for a candidate app.              |

## Internal operator boundary

- `feature-sync` and `feature-sync:help` are the start-here commands
- `feature-sync:verify` is the operator workflow command
- `release-check`, `check`, `doctor`, and `validate` remain the underlying CI-safe gates
- `rank`, `report`, `generate`, and `scaffold` remain operator utilities
- bare `feature-sync` never auto-runs `verify`

## Internal Release-Gate Commands

These commands are the professional internal readiness surface for the SDK:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

Gate command rules:

- `--json` emits valid JSON only.
- `--ci` fails only when `errorCount > 0`.
- Warnings are non-blocking.
- Unknown flags and missing option values are errors.
- Help exits `0`.

Human-oriented commands such as `rank`, `report`, `generate`, and `scaffold` are not part of the strict release-gate contract in this pass. They reject unsupported `--json` or `--ci` flags instead of pretending to be CI-safe.

## Internal operator workflow

Use this daily path when you want one operator command instead of four separate checks:

```txt
pnpm run feature-sync
pnpm run feature-sync:verify
```

`verify` runs `release-check`, `check`, `doctor`, and `validate` in that exact order, keeps warnings visible, and fails only when total `errorCount > 0`.

## Internal scorecard

The governed CLI scorecard currently records:

- pre-V3 baseline: `62 / 100`
- current standing before V4 completion: `85 / 100`
- internal target: `90+ / 100`

## Troubleshooting

If a release gate fails, run the checks in this order:

```txt
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync:verify
```

`release-check` validates `FSDK-CONTRACT-001`: package metadata, exports, bins, shebangs, Node engine policy, runtime `zod`, packaged docs/rules/seed files, and required built non-code assets.

`doctor` may report catalog drift warnings. Those warnings are intentionally non-blocking until a separate catalog cleanup pass.

## Internal documentation set

- [INTERNAL_OPERATING_CONTRACT.md](./INTERNAL_OPERATING_CONTRACT.md): supported environment, execution path, and remediation flow.
- [FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md](./FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md): release-gate CLI behavior contract.
- [FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md](./FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md): operator workflow behavior contract for `verify`.
- [FSDK-CLI-003_COMMAND_TREE_CONTRACT.md](./FSDK-CLI-003_COMMAND_TREE_CONTRACT.md): metadata-backed command tree contract.
- [FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md](./FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md): deterministic root command contract.
- [FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md](./FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md): normalized gated finding contract.
- [FSDK-CLI_SCORECARD.md](./FSDK-CLI_SCORECARD.md): governed CLI readiness scorecard and target state.
- [CLI_OPERATOR_BENCHMARK_NOTE.md](./CLI_OPERATOR_BENCHMARK_NOTE.md): benchmark note for the OSS CLI lessons adopted in V3.
- Historical material is archived under [`./archive`](./archive) and is not part of the active internal operating contract.
