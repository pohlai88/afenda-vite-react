# Afenda Features SDK

`@afenda/features-sdk` is an internal Afenda package for governed feature discovery, validation, scaffolding, and handoff workflows inside the Afenda workspace.

## Sync-Pack

The current module is `sync-pack`, which converts curated discovery signals into governed internal feature planning packs for Afenda teams.

```ts
import {
  appCandidateSchema,
  checkGeneratedPacks,
  createTechStackScaffoldManifest,
  generateFeaturePack,
  runSyncPackDoctor,
  scoreCandidate,
} from "@afenda/features-sdk/sync-pack"
```

## Start Here

From the workspace root:

```txt
pnpm run feature-sync
```

That quickstart output explains what Sync-Pack is, the green path, and the next command to run.

Daily operator path:

```txt
pnpm run feature-sync
pnpm run feature-sync:verify
```

Root command rule:

```txt
feature-sync is always quickstart only.
It never auto-runs verify.
```

## Command Intent

| Command                      | Class             | Use when                                                        |
| ---------------------------- | ----------------- | --------------------------------------------------------------- |
| `feature-sync`               | start here        | You do not know what to run.                                    |
| `feature-sync:help`          | start here        | You need command discovery and examples.                        |
| `feature-sync:verify`        | operator workflow | You want the supported daily workflow across all release gates. |
| `feature-sync:release-check` | release gate      | You need to prove the SDK package/build contract is valid.      |
| `feature-sync:check`         | release gate      | You need to validate generated feature-pack files.              |
| `feature-sync:doctor`        | release gate      | You need to inspect dependency and stack-version drift.         |
| `feature-sync:validate`      | release gate      | You need to validate curated seed JSON.                         |
| `feature-sync:rank`          | operator utility  | You need a priority scoring table.                              |
| `feature-sync:report`        | operator utility  | You need a grouped portfolio report.                            |
| `feature-sync:generate`      | operator utility  | You need to write generated planning packs.                     |
| `feature-sync:scaffold`      | operator utility  | You need a tech-stack scaffold for an app candidate.            |

`feature-sync:verify` and the release-gate commands are CI-safe. Operator utilities are human-oriented.

CLI binaries after build/publish:

```txt
afenda-sync-pack quickstart
afenda-sync-pack help
afenda-sync-pack scaffold
afenda-sync-pack doctor
afenda-sync-pack check
afenda-sync-pack verify
afenda-sync-pack validate
afenda-sync-pack rank
afenda-sync-pack report
afenda-sync-pack release-check
afenda-sync-pack generate
```

Repo-local development scripts remain available from the workspace root:

```txt
pnpm run feature-sync
pnpm run feature-sync:help
pnpm run feature-sync:verify
pnpm run feature-sync:validate
pnpm run feature-sync:rank
pnpm run feature-sync:report
pnpm run feature-sync:generate
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:release-check
pnpm run feature-sync:scaffold
```

## Internal support boundary

This package is optimized for internal use only.

- Start-here commands: `feature-sync`, `feature-sync:help`
- Operator workflow command: `feature-sync:verify`
- Underlying CI-safe gates: `check`, `doctor`, `release-check`, `validate`
- Operator utilities: `rank`, `report`, `generate`, `scaffold`
- Supported environment: Afenda pnpm workspace
- Supported consumers: Afenda internal teams

See package-local operating docs in `docs/sync-pack/` for the internal operating contract, `FSDK-CLI-001` release-gate rules, and `FSDK-CLI-002` operator workflow rules.
See `docs/sync-pack/FSDK-CLI_SCORECARD.md` for the governed internal scorecard and target state.
