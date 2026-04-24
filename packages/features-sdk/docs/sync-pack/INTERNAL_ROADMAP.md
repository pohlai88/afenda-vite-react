---
title: Sync-Pack Internal Roadmap
description: Internal-first roadmap for @afenda/features-sdk and the Sync-Pack module.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 25
---

# Sync-Pack Internal Roadmap

This roadmap is for internal Afenda priorities only.

It does not describe partner or public externalization work unless that work becomes directly necessary for internal operation.

## Now

These are the current internal priorities and should stay green:

- deterministic start-here command:
  - `pnpm run feature-sync`
- explicit daily workflow:
  - `pnpm run feature-sync:verify`
- release gates that are safe for CI and readable by humans:
  - `release-check`
  - `check`
  - `doctor`
  - `validate`
- clear junior-facing docs for DevOps and developers
- governed 11-file planning pack generation
- workspace-scoped operator filters:
  - `--category`
  - `--lane`
  - `--owner`
  - `--pack`
- stronger scaffold output for internal app bootstrap:
  - dependency recommendations
  - route suggestions
  - package placement hints
- package contract validation for docs, rules, templates, exports, and bins
- read-only validation vs explicit sync/repair separation
- richer remediation in gated findings:
  - exact rerun command
  - governed doc reference
  - file-targeted fix guidance

## Next

These improvements are valuable soon, but they are not blockers for current internal use:

- internal change-intent discipline for SDK changes:
  - changed surface
  - generated outputs expected
  - approval or review note
- more generated example packs across categories so teams start from governed examples instead of empty folders

## Later

These remain intentionally deferred until internal-first work demands them:

- partner-restricted SDK mode
- public npm externalization
- GitHub PR bundle automation
- GitHub Actions reporting and annotation workflow
- interactive CLI picker or TUI
- shell completion
- AI-assisted command generation
- package split into separate SDK and CLI distributions

## Planning Rule

Use this priority order:

1. protect internal operator correctness
2. reduce junior developer confusion
3. reduce drift in generated artifacts and metadata
4. improve speed and convenience only after the first three are stable

## Success Signal

The roadmap is working when:

- a junior developer can follow docs without asking which command to run first
- a junior DevOps operator can isolate failures from `verify`
- generated planning packs stay consistent across teams
- SDK changes do not silently drift from rules, docs, or package contracts
