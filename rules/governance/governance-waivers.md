---
title: Governance waivers
description: Policy for governed waivers, their required fields, expiry discipline, and the registry path used by the governance spine.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: governance-waiver
order: 10
---

# Governance waivers

Waivers are allowed only through `rules/governance/waivers.json`.

Each waiver must declare:

- id
- policyId
- domainId
- paths
- reason
- owner
- approvedBy
- createdAt
- expiresAt
- severityCap
- remediationPlan

Rules:

- expired waivers fail CI
- unknown targets fail CI
- waivers against retired domains fail CI
- missing owner or approver fails CI
- missing remediation plan fails CI
- a waiver may suppress only violations whose severity is less than or equal to its `severityCap`

The waiver registry is a controlled escape hatch, not a substitute for fixing drift.
