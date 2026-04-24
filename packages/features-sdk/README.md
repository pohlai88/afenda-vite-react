# Afenda Features SDK

`@afenda/features-sdk` is the internal Afenda package for governed feature planning workflows.

Today its active module is `sync-pack`, which combines:

- typed SDK APIs
- CLI entrypoints
- governed rules and seed data
- internal operating docs

This package is intentionally broader than a CLI wrapper. The CLI is one surface of the package, not the whole package.

## Start Here

From the workspace root:

```txt
pnpm run feature-sync
```

That command is deterministic quickstart only.

- It explains what Sync-Pack is.
- It points to the next command to run.
- It never auto-runs validation.

The daily operator path is explicit:

```txt
pnpm run feature-sync:verify
```

## What This Package Owns

- Library APIs under `src/sync-pack`
- CLI binaries such as `afenda-sync-pack` and the gated subcommand entrypoints
- Rules and curated seed data under `rules/sync-pack`
- Active operating docs under `docs/sync-pack`
- Tests for SDK, CLI, and contract behavior under `tests/sync-pack`

## Current Internal Features

The internal feature set today is:

- typed candidate schemas and scoring helpers
- governed 11-file planning pack generation
- package contract validation through `release-check`
- generated-pack validation through `check`
- dependency and workspace drift inspection through `doctor`
- seed validation through `validate`
- aggregated operator workflow through `verify`
- package-first quality validation workflow through `quality-validate`
- workspace-scoped candidate filtering for `rank`, `report`, and `generate`
- tech-stack scaffold manifest generation with placement and route guidance
- richer gated finding remediation with exact rerun commands and governed doc links
- junior-safe documentation and quickstart guidance

## SDK Surface

Programmatic usage stays under the package name:

```ts
import {
  appCandidateSchema,
  checkFeatureSdkPackageContract,
  checkGeneratedPacks,
  createTechStackScaffoldManifest,
  generateFeaturePack,
  runSyncPackDoctor,
  runSyncPackValidate,
  runSyncPackVerify,
  scoreCandidate,
} from "@afenda/features-sdk/sync-pack"
```

The current public surface is not just command execution. It also exports:

- schemas and inferred types
- scoring rules
- pack generation helpers
- scaffold generation helpers
- gated validation and verification functions

## CLI Surface

Preferred workspace entrypoints:

| Command                                  | Class             | Use when                                                               |
| ---------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `pnpm run feature-sync`                  | start here        | You need the deterministic first step.                                 |
| `pnpm run feature-sync:help`             | start here        | You need grouped command help and examples.                            |
| `pnpm run feature-sync:verify`           | operator workflow | You want the supported daily verification workflow.                    |
| `pnpm run feature-sync:quality-validate` | operator workflow | You want the full package-first internal release validation workflow.  |
| `pnpm run feature-sync:release-check`    | release gate      | You need to validate package/build integrity.                          |
| `pnpm run feature-sync:check`            | release gate      | You need to validate generated pack structure and candidate alignment. |
| `pnpm run feature-sync:doctor`           | release gate      | You need to inspect dependency and stack drift.                        |
| `pnpm run feature-sync:validate`         | release gate      | You need to validate curated seed input.                               |
| `pnpm run feature-sync:rank`             | operator utility  | You need a candidate scoring view.                                     |
| `pnpm run feature-sync:report`           | operator utility  | You need grouped portfolio evidence.                                   |
| `pnpm run feature-sync:generate`         | operator utility  | You need to write planning packs from seed data.                       |
| `pnpm run feature-sync:scaffold`         | operator utility  | You need a tech-stack scaffold manifest.                               |

Built CLI binaries remain available for package-local execution:

```txt
afenda-sync-pack
afenda-sync-pack help
afenda-sync-pack verify
afenda-sync-pack release-check
afenda-sync-pack check
afenda-sync-pack doctor
afenda-sync-pack validate
afenda-sync-pack rank
afenda-sync-pack report
afenda-sync-pack generate
afenda-sync-pack scaffold
```

## Naming Decision

Keep the package name as `features-sdk`.

Why:

- The package exports reusable SDK APIs, not only command handlers.
- The package owns rules, seed data, contracts, and generated-artifact doctrine in addition to CLI entrypoints.
- The active CLI brand is already more precise at the module level: `sync-pack` / `afenda-sync-pack`.

Rename to `features-cli` only if the package is later reduced to a CLI-only wrapper or split into:

- `@afenda/features-sdk` for reusable APIs
- `@afenda/features-cli` for a dedicated command-distribution package

That split is not justified by the current codebase shape.

## Internal Boundary

This package is optimized for internal Afenda use only.

- Supported environment: Afenda pnpm workspace
- Active target: internal SDK and internal operator CLI
- Partner-restricted and public externalization remain deferred

## Internal Definition Of Done

The internal Definition of Done is governed in:

- [Feature Sync-Pack DoD](./rules/sync-pack/FEATURE_SYNC_PACK_DOD.md)

In short, a change is done when:

- the correct command path is obvious
- release gates remain deterministic
- generated packs and docs stay aligned
- junior operators and junior developers can use the package safely

## Roadmap

Internal planning is tracked in:

- [Sync-Pack Internal Roadmap](./docs/sync-pack/INTERNAL_ROADMAP.md)

Priority framing:

- `Now`: keep internal verification, docs, and pack governance strong
- `Next`: improve richer remediation, change-intent discipline, and example packs
- `Later`: partner/public concerns only when internal needs require them

## Docs Map

- [Docs README](./docs/README.md): package-level documentation entrypoint
- [Getting Started](./docs/getting-started.md): safe first path for new contributors
- [Junior Developer Usage Guide](./docs/junior-developer-usage-guide.md): junior developer command order and guardrails
- [Junior DevOps Quickstart](./docs/junior-devops-quickstart.md): junior operator quickstart and failure isolation
- [Sync-Pack README](./docs/sync-pack/README.md): active module guide
- [Internal Operating Contract](./docs/sync-pack/INTERNAL_OPERATING_CONTRACT.md): supported environment and operating rules
- [Sync-Pack Internal Roadmap](./docs/sync-pack/INTERNAL_ROADMAP.md): internal now/next/later priorities
- [Quality Validation Plan](./docs/sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md): package-first internal release validation workflow
- [Finding Remediation Catalog](./docs/sync-pack/finding-remediation-catalog.md): current finding codes, meanings, and exact fix paths
- [CLI Scorecard](./docs/sync-pack/FSDK-CLI_SCORECARD.md): governed readiness scoring and target state
- [Archive README](./docs/sync-pack/archive/README.md): historical, non-active planning material
