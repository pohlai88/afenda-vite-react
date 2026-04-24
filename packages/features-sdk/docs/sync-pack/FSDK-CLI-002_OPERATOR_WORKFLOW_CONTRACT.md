---
title: FSDK-CLI-002 Operator Workflow Contract
description: Internal operator workflow contract for the Sync-Pack verify command.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 22
---

# FSDK-CLI-002: Operator Workflow Contract

## Purpose

`FSDK-CLI-002` defines the daily internal operator workflow for Sync-Pack.

It exists so an Afenda developer can run one command, understand what was checked, and get a clear final verdict without manually stitching together four separate gate commands.

## Scope

Start-here commands:

```txt
feature-sync
feature-sync:help
```

Operator workflow command:

```txt
feature-sync:verify
afenda-sync-pack verify
```

Underlying release-gate commands:

```txt
release-check
check
doctor
validate
```

Operator utilities:

```txt
rank
report
generate
scaffold
```

## Workflow order

`verify` must execute this exact order:

1. `release-check`
2. `check`
3. `doctor`
4. `validate`

## Output contract

Human output must always answer:

- what ran
- what passed
- what warned
- what failed
- what to fix next
- final verdict

JSON output must emit valid JSON only and include:

- `findings`
- `errorCount`
- `warningCount`
- `steps`
- `verdict`

Each step must include:

- `name`
- `status`
- `errorCount`
- `warningCount`
- `findings`

## Exit contract

- `verify --ci` fails only when total `errorCount > 0`
- warnings remain visible but non-blocking
- `doctor` warnings must not turn the overall workflow red by themselves

## Boundary statement

- `feature-sync` and `feature-sync:help` are the start-here commands
- bare `feature-sync` is quickstart only and never auto-runs `verify`
- `feature-sync:verify` is the operator workflow command
- `release-check`, `check`, `doctor`, and `validate` remain the underlying CI-safe gates
- `rank`, `report`, `generate`, and `scaffold` remain operator utilities

## Validation evidence

This contract is enforced by:

- shared CLI metadata in `src/sync-pack/cli/shared.ts`
- workflow runner logic in `src/sync-pack/verify/index.ts`
- dispatcher entrypoint `src/sync-pack/cli/verify.ts`
- transcript and smoke coverage in `tests/sync-pack/*`
