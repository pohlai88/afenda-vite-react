---
title: Sync-Pack CLI Operator Benchmark Note
description: OSS CLI benchmark note for the internal Sync-Pack operator workflow.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 23
---

# CLI Operator Benchmark Note

Sync-Pack V3 uses these OSS CLIs as the benchmark set for internal operator quality:

| CLI           | Internal lesson adopted in Sync-Pack               |
| ------------- | -------------------------------------------------- |
| `HTTPie`      | Human-first onboarding and examples-first help     |
| `jq`          | Stable machine-readable output for automation      |
| `fzf`         | Fast command discovery and low-friction navigation |
| `Taskwarrior` | Workflow-centered daily command design             |
| `Scrut`       | Transcript-style CLI reliability testing           |

## What V3 adopts now

- `feature-sync` remains the first human command
- `feature-sync:help` remains the grouped discovery surface
- `feature-sync:verify` becomes the daily operator workflow
- release-gate commands keep stable JSON/CI behavior
- transcript-style CLI tests verify the operator path

## What stays deferred

- interactive picker or TUI
- shell completion
- AI command generation
- public CLI polish
- taxonomy rename

This note is internal benchmark guidance only. It does not change the current support boundary: internal Afenda CLI first, partner/public work deferred.
