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

`sync-pack` is the active governance runtime inside `@afenda/features-sdk`.

It turns curated feature candidates into governed internal planning packs and validates the package surfaces around them.

## Start Here

Workspace entrypoint:

```txt
pnpm run feature-sync
```

Daily operator workflow:

```txt
pnpm run feature-sync:verify
```

Maintainer closure workflow:

```txt
pnpm run feature-sync:intent
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```

Root rule:

```txt
feature-sync is always quickstart only.
It never auto-runs verify.
```

## Current Internal Features

- release-gate validation
- operator verification
- maintainer intent governance
- golden example fitness and explicit example sync
- workspace-scoped candidate filters
- governed 11-file planning-pack generation
- scaffold manifests with implementation hints
- richer gated remediation
- junior-friendly control-console docs

## Command Model

| Command                                  | Class              | Purpose                                               |
| ---------------------------------------- | ------------------ | ----------------------------------------------------- |
| `pnpm run feature-sync`                  | start here         | Read-only control console and next-step guidance.     |
| `pnpm run feature-sync:help`             | start here         | Grouped help and examples.                            |
| `pnpm run feature-sync:verify`           | daily operator     | Run `release-check -> check -> doctor -> validate`.   |
| `pnpm run feature-sync:intent`           | maintainer utility | Scaffold a truth-bound change intent.                 |
| `pnpm run feature-sync:intent-check`     | maintainer gate    | Validate intent coverage for package-owned changes.   |
| `pnpm run feature-sync:sync-examples`    | maintainer repair  | Regenerate example registry and golden example guide. |
| `pnpm run feature-sync:quality-validate` | maintainer closure | Run package-first validation and closure verdict.     |
| `pnpm run feature-sync:release-check`    | release gate       | Validate `FSDK-CONTRACT-001` package integrity.       |
| `pnpm run feature-sync:check`            | release gate       | Validate generated pack structure.                    |
| `pnpm run feature-sync:doctor`           | release gate       | Inspect dependency/catalog drift.                     |
| `pnpm run feature-sync:validate`         | release gate       | Validate curated seed input.                          |
| `pnpm run feature-sync:rank`             | operator utility   | Print candidate scoring output.                       |
| `pnpm run feature-sync:report`           | operator utility   | Print grouped candidate portfolio output.             |
| `pnpm run feature-sync:generate`         | operator utility   | Generate governed planning packs.                     |
| `pnpm run feature-sync:scaffold`         | operator utility   | Generate a scaffold manifest.                         |

## Golden Examples

The governed golden example set is:

- `internal-support-crm`
- `bi-reporting-starter`
- `iam-sso-control-plane`
- `uptime-monitoring-workbench`

Read:

- [GOLDEN_EXAMPLES.md](./GOLDEN_EXAMPLES.md)
- [FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md](./FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md)

## Active Contracts

- [FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md](./FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md)
- [FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md](./FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md)
- [FSDK-CLI-003_COMMAND_TREE_CONTRACT.md](./FSDK-CLI-003_COMMAND_TREE_CONTRACT.md)
- [FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md](./FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md)
- [FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md](./FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md)
- [FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md](./FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md)
- [FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md](./FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md)
- [QUALITY_VALIDATION_EXECUTION_PLAN.md](./QUALITY_VALIDATION_EXECUTION_PLAN.md)
- [INTERNAL_ROADMAP.md](./INTERNAL_ROADMAP.md)

## Externalization

Partner and public externalization remain deferred.

This folder defines the internal operating surface only.
