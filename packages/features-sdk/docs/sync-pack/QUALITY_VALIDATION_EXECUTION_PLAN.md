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

This execution plan validates `@afenda/features-sdk` as an internal-first package surface.

## Validation Order

Run sequentially:

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
6. maintainer governance
   - `intent-check`
   - golden example fitness validation
7. operator features
   - filtered `rank`
   - filtered `report`
   - filtered `generate`
   - zero-match filter failure
   - `scaffold`
8. docs surface
   - README, Sync-Pack README, command handbook, operating contract, roadmap, DoD

## Closure Rule

- `PASS` -> package is eligible for maintenance-only operation
- `WARN` -> package may proceed, but warnings remain owned and visible
- `FAIL` -> stop and fix before promotion or handoff
