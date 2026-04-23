---
title: Repo guard promotion scorecard 2026-04-23
description: Scorecard for the 2026-04-23 GOV-TRUTH-001 promotion-readiness review.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: governance-registry
order: 18
---

# Repo guard promotion scorecard 2026-04-23

## Scorecard

- Total checks: `8`
- Pass: `7`
- Warn: `1`
- Fail: `0`
- Ready for promotion: `no`

## Review areas

| Area                       | Status | Evidence                                                                                                                        | Notes                                                                                           |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Architecture binding       | `pass` | `ADR-0008`, `ATC-0005`, repo-guard doctrine, roadmap                                                                            | Binding surfaces are current and present.                                                       |
| Governance domain posture  | `pass` | `lifecycleStatus=partial`, `enforcementMaturity=warned`, `ciBehavior=warn`                                                      | Review is correctly starting from warned posture.                                               |
| Major guardrail coverage   | `pass` | Native guard files for `RG-STRUCT-001`, `RG-TRUTH-002`, `RG-STRUCT-003`, `RG-TRUTH-004`, `RG-HYGIENE-005`, `RG-ADVISORY-006`    | Major roadmap slices are implemented as first cuts.                                             |
| Coverage model             | `pass` | Repo-guard report coverage summary: `9 implemented`, `6 partial`, `0 missing`                                                   | Planned repo-guard areas are classified explicitly.                                             |
| Waiver model               | `pass` | [repo-guard-waivers.json](/C:/NexusCanon/afenda-react-vite/rules/repo-integrity/repo-guard-waivers.json)                        | Registry is present and valid; no active waivers.                                               |
| Repo-guard current verdict | `pass` | [repo-integrity-guard.report.md](/C:/NexusCanon/afenda-react-vite/.artifacts/reports/governance/repo-integrity-guard.report.md) | Clean-tree repo guard is fully green.                                                           |
| Advisory backlog           | `pass` | `stronger-document-control=0`                                                                                                   | No current advisory backlog remains.                                                            |
| Manual promotion criteria  | `warn` | Promotion-readiness report manual criteria section                                                                              | False-positive rate, stable full-cycle usage, and explicit approval still require human review. |
