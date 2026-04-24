# Afenda Features SDK

`@afenda/features-sdk` is Afenda’s internal package for governed feature-planning workflows.

Its active module is `sync-pack`, which combines:

- typed SDK APIs
- CLI entrypoints
- governed rules and seed data
- internal operating contracts and docs

This package is intentionally broader than a CLI wrapper. The CLI is one surface of the package, not the package identity.

## Start Here

From the workspace root:

```txt
pnpm run feature-sync
```

That command is deterministic quickstart only. It never auto-runs validation.

The daily operator path is explicit:

```txt
pnpm run feature-sync:verify
```

## Current Internal Features

The internal package now includes:

- release-gate validation through `release-check`, `check`, `doctor`, and `validate`
- aggregated operator workflow through `verify`
- package-maintainer closure through `quality-validate`
- truth-bound change intent through `intent` and `intent-check`
- golden example fitness with explicit sync through `sync-examples`
- governed 11-file planning-pack generation
- workspace-scoped candidate filters for `rank`, `report`, and `generate`
- scaffold manifests with package placement, route hints, and next commands
- richer remediation across gated findings
- junior-friendly quickstart, usage, and troubleshooting docs

## SDK Surface

Programmatic usage stays under the package name:

```ts
import {
  checkFeatureSdkPackageContract,
  checkGeneratedPacks,
  checkGoldenExampleFitness,
  createSyncPackChangeIntentTemplate,
  generateFeaturePack,
  runSyncPackIntentCheck,
  runSyncPackQualityValidation,
  runSyncPackVerify,
  syncGoldenExampleFitness,
} from "@afenda/features-sdk/sync-pack"
```

## CLI Surface

Preferred workspace entrypoints:

| Command                                  | Class              | Use when                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `pnpm run feature-sync`                  | start here         | You need the deterministic first step and control console.               |
| `pnpm run feature-sync:help`             | start here         | You need grouped command help and examples.                              |
| `pnpm run feature-sync:verify`           | daily operator     | You want the supported verification workflow.                            |
| `pnpm run feature-sync:intent`           | maintainer utility | You need to scaffold a truth-bound change intent.                        |
| `pnpm run feature-sync:intent-check`     | maintainer gate    | You need to validate intent coverage for package-owned changes.          |
| `pnpm run feature-sync:sync-examples`    | maintainer repair  | You need to regenerate golden example fitness metadata and guide output. |
| `pnpm run feature-sync:quality-validate` | maintainer closure | You need the full package-first closure workflow.                        |
| `pnpm run feature-sync:release-check`    | release gate       | You need package/build integrity validation.                             |
| `pnpm run feature-sync:check`            | release gate       | You need generated pack validation.                                      |
| `pnpm run feature-sync:doctor`           | release gate       | You need dependency/catalog drift inspection.                            |
| `pnpm run feature-sync:validate`         | release gate       | You need seed validation.                                                |
| `pnpm run feature-sync:rank`             | operator utility   | You need candidate scoring output.                                       |
| `pnpm run feature-sync:report`           | operator utility   | You need grouped portfolio evidence.                                     |
| `pnpm run feature-sync:generate`         | operator utility   | You need governed planning packs.                                        |
| `pnpm run feature-sync:scaffold`         | operator utility   | You need a tech-stack scaffold manifest.                                 |

## Golden Examples

The governed golden example set is:

- `internal-support-crm`
- `bi-reporting-starter`
- `iam-sso-control-plane`
- `uptime-monitoring-workbench`

See:

- [Golden Examples](./docs/sync-pack/GOLDEN_EXAMPLES.md)
- [Golden Example Fitness Contract](./docs/sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md)

## Naming Decision

Keep the package name as `features-sdk`, not `features-cli`.

Why:

- the package exports reusable SDK APIs, not only command handlers
- the package owns rules, seed data, contracts, and generated examples in addition to CLI entrypoints
- the CLI already has the narrower operational brand: `sync-pack` / `afenda-sync-pack`

Rename only if the package is later split into:

- `@afenda/features-sdk` for reusable APIs
- `@afenda/features-cli` for a CLI-only distribution wrapper

That split is not justified by the current codebase shape.

## Internal Boundary

This package is optimized for internal Afenda workspace use only.

- active target: internal SDK and internal operator CLI
- partner-restricted and public externalization remain deferred

## Docs Map

- [Docs README](./docs/README.md)
- [Getting Started](./docs/getting-started.md)
- [Junior Developer Usage Guide](./docs/junior-developer-usage-guide.md)
- [Junior DevOps Quickstart](./docs/junior-devops-quickstart.md)
- [Sync-Pack README](./docs/sync-pack/README.md)
- [Command Handbook](./docs/sync-pack/command-handbook.md)
- [Change Intent Contract](./docs/sync-pack/FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md)
- [Golden Example Fitness Contract](./docs/sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md)
- [Quality Validation Plan](./docs/sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md)
- [Sync-Pack Internal Roadmap](./docs/sync-pack/INTERNAL_ROADMAP.md)
