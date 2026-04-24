---
title: Feature Approval Gate
description: Approval policy for moving generated feature packs from candidate planning into implementation handoff.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: rules
relatedDomain: feature-sync-pack
order: 30
---

# Feature Approval Gate

## Approval Rule

Feature teams may start implementation only when the generated pack has:

- Valid `00-candidate.json`
- All 11 fixed files
- Explicit product and technical unknowns
- Owner team
- Priority
- Build mode
- License review flag
- Security review flag
- Data sensitivity
- Approval status

## Build Modes

- `adopt`: use the open-source project directly only after license and security approval.
- `adapt`: reuse the product pattern and selected architecture after review.
- `inspire`: use the idea only; no source-code reuse is approved.
- `avoid`: explicitly rejected or blocked.

## Completion Funnel

```txt
OpenAlternative category
-> shortlist 10 tools
-> reject unsafe / irrelevant / weak maintenance
-> keep 3-5 candidates
-> score Critical / Essential / Good-to-Have
-> generate packs
-> approve top 1-2 per category
```

## Initial Target

```txt
8 categories x 5 candidates = 40 candidates
40 candidates -> 15 approved packs
15 approved packs -> 5 implementation waves
```

## Implementation Waves

Wave 1 Critical Foundation: IAM/SSO, secrets, monitoring, backup/recovery, document management, internal support/CRM, BI/reporting, compliance evidence.

Wave 2 Essential Productivity: AI work assistant, knowledge base, workflow automation, forms/surveys, project management, product analytics, data integration, localization.

Wave 3 Good-to-Have Expansion: website builder, publishing workflow, screen recording, design/prototyping, bookmark manager, community portal, mini-developer tools, internal app builder.
