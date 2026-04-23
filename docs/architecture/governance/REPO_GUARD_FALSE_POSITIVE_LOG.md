---
title: Repo guard false positive log
description: Evidence log for classifying Repository Integrity Guard findings during warned calibration and promotion review.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: governance-registry
order: 16
---

# Repo guard false positive log

This log exists to make `GOV-TRUTH-001` promotion evidence-based.

It records whether a repo-guard finding was:

- a true positive
- a false positive
- a temporary real exception
- a policy gap
- a repo drift issue that should be fixed directly

## Usage rule

Use this log during the warned calibration cycle.

Do not use waivers as the first response to an unclear finding.
Classify the finding first.

Decision rule:

- policy problem -> change policy
- temporary real exception -> consider waiver
- architecture drift -> fix the repo

## Log schema

| Date       | Guard ID          | Rule ID           | Finding summary                                                                                                                                             | Classification   | Fix action                                                                                                                                                               | Waiver needed | Owner                  | Notes                                                                                                                                             |
| ---------- | ----------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-23 | `RG-ADVISORY-006` | `RG-ADVISORY-006` | Older ADR missing stronger linkage markers                                                                                                                  | `true-positive`  | Add linkage markers or narrow rule if overreaching                                                                                                                       | `no`          | `docs-policy`          | Current advisory backlog from promotion readiness                                                                                                 |
| 2026-04-23 | `WORKTREE-002`    | `WORKTREE-002`    | Protected generated governance register modified during active doc/governance pass                                                                          | `repo-fix`       | Finish the pass, regenerate, and commit or otherwise clear the protected generated drift before promotion review                                                         | `no`          | `governance-toolchain` | Current blocking signal is operationally expected during uncommitted work, but still disqualifies promotion readiness                             |
| 2026-04-23 | `RG-STRUCT-001`   | `RG-STRUCT-001`   | `apps/api/src/app.ts` and `apps/api/src/index.ts` were initially unowned under the widened static ownership model                                           | `policy-gap`     | Add explicit API runtime-owner rules to the static owner-root map                                                                                                        | `no`          | `governance-toolchain` | Fixed in the same calibration pass; evidence that warned calibration is surfacing real map gaps instead of only repo drift                        |
| 2026-04-23 | `RG-TRUTH-004`    | `RG-TRUTH-004`    | Design-system component-governance implementation change was treated as a required evidence refresh even when generated outputs were semantically unchanged | `false-positive` | Narrow the mismatch binding to semantic source surfaces (`ui-primitives`, manifests, registry) and leave generator implementation changes to `RG-TRUTH-002` authenticity | `no`          | `governance-toolchain` | Fixed in the same calibration pass; evidence that mismatch policy must bind repo truth loops, not every implementation detail behind the renderer |

## Classification vocabulary

- `true-positive`
  The finding correctly identifies real drift or missing governance truth.
- `false-positive`
  The finding is incorrect under the current repo policy and should lead to policy/parser tightening.
- `temporary-exception`
  The finding is real, but a bounded temporary exception is justified.
- `policy-gap`
  The finding exposed a missing manifest, binding, owner map, or other calibration input.
- `repo-fix`
  The finding exposed actual repository drift that should be corrected directly.

## Promotion review expectation

Before `GOV-TRUTH-001` can move from warned to blocking, this log should show:

- at least one full warned review cycle
- explicit handling for recurring false positives
- bounded waiver use instead of silent suppression
- evidence that unresolved fail findings are not being normalized
