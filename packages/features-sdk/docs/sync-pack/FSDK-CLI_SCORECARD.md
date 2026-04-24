---
title: Sync-Pack CLI Scorecard
description: Governed scorecard for internal Sync-Pack CLI readiness and target state.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 27
---

# FSDK CLI Scorecard

## Purpose

This scorecard tracks internal CLI readiness against the governed Sync-Pack benchmark set.

## Score rubric

| Dimension                      | Weight |
| ------------------------------ | -----: |
| Onboarding and discoverability |     20 |
| Operator workflow              |     20 |
| CI and automation contract     |     20 |
| Diagnostics and remediation    |     20 |
| Contract and test rigor        |     20 |

## Recorded scores

| State                                 |     Score |
| ------------------------------------- | --------: |
| Pre-V3 baseline                       |  62 / 100 |
| Current standing before V4 completion |  85 / 100 |
| Internal target                       | 90+ / 100 |
| Partner target                        | 85+ / 100 |
| Public target                         | 95+ / 100 |

Partner and public targets remain deferred.

## Benchmark set

| CLI          | Lesson adopted                              |
| ------------ | ------------------------------------------- |
| `changesets` | gated, non-interactive workflow contract    |
| `pnpm`       | workspace-scale flag and error discipline   |
| `knip`       | analyzer-style findings and CI output       |
| `citty`      | command-tree structure without manual drift |
| `sherif`     | small, opinionated monorepo CLI clarity     |

## Current V4 scoring intent

V4 is meant to close the remaining internal gap by delivering:

- deterministic root command behavior
- metadata-backed command tree routing
- normalized gated findings and remediation
- governed scorecard enforcement through the package contract
