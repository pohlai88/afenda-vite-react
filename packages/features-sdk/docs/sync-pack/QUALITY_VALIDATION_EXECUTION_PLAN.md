---
title: Features SDK Quality Validation Execution Plan
description: Sequential package-first validation workflow for @afenda/features-sdk internal release readiness.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 26
---

# Features SDK Quality Validation Execution Plan

This execution plan validates `@afenda/features-sdk` as an **internal-first package release surface**.

It is package-first by default:

- `features-sdk` must be green on build integrity, release-gate behavior, operator workflow, operator features, and junior-facing documentation
- wider workspace warnings remain visible and tracked, but they do not block package closure unless they originate from `features-sdk` or break package contracts

## Validation Order

Run this workflow sequentially:

1. integrity
   - `typecheck`
   - `build`
   - `release-check`
2. quality
   - `test:run`
   - `lint`
3. root UX
   - `feature-sync`
   - `feature-sync:help`
4. workflow
   - `verify`
5. targeted gates
   - `check`
   - `doctor`
   - `validate`
6. operator features
   - filtered `rank`
   - filtered `report`
   - filtered `generate`
   - zero-match filter failure
   - `scaffold`
7. docs surface
   - README, Sync-Pack README, command handbook, operating contract, DoD

## Gate Policy

### PASS

- zero blocking failures
- zero disallowed warnings

### WARN

- zero blocking failures
- only allowed non-blocking warnings remain

### FAIL

- any blocking condition exists

## Blocking

- `typecheck`, `build`, `test:run`, or `lint` fails
- `release-check` reports any error or warning
- `check` reports any error or warning
- `validate` reports any error or warning
- `verify` reports blocking findings
- root command violates quickstart-only behavior
- `verify` output violates the usability contract
- docs drift from live command behavior
- any gated error lacks remediation
- generated pack or scaffold contract shape is broken

## Non-Blocking But Tracked

- `doctor` warnings outside `features-sdk`
- wider workspace `catalog-not-used` drift not owned by this package
- roadmap `Next` items not yet implemented

## Must Not Be Silenced

- existing `doctor` warnings stay visible unless actually fixed or explicitly waived
- no warning is hidden just to make `verify` or package validation look green

## Closure Rule

- `PASS` -> package is eligible to move into `Next`
- `WARN` -> package may proceed, but warnings must be owned and tracked
- `FAIL` -> stop and fix before promotion

Required closeout artifact:

- commands executed
- PASS/WARN/FAIL per step
- blocking findings
- non-blocking findings
- owner for each fix
- disposition:
  - `fix-now`
  - `track-in-next`
  - `out-of-package-scope`
