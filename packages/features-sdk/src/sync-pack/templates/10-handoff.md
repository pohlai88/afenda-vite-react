---
title: {{candidate.name}} Handoff
description: Generated Feature Sync-Pack handoff record for {{candidate.name}}.
status: planning
owner: {{candidate.ownerTeam}}
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 100
---

# {{candidate.name}} Handoff

## Owner

- Owner team: {{candidate.ownerTeam}}
- Lane: {{candidate.lane}}
- Category: {{candidate.internalCategory}}

## Decision

- Current status: {{candidate.status}}
- Build mode: {{candidate.buildMode}}
- Declared priority: {{candidate.priority}}
- Recommended priority: {{score.recommendedPriority}}
- Next decision: Not yet known

## Approval

- License review required: {{candidate.licenseReviewRequired}}
- Security review required: {{candidate.securityReviewRequired}}
- Approval status: {{candidate.status}}

## Links

- Source URL: {{candidate.sourceUrl}}
- Open-source references:
  {{candidate.openSourceReferences}}
- Generated pack path: `packages/features-sdk/docs/sync-pack/generated-packs/{{candidate.internalCategory}}/{{candidate.id}}`

## Definition Of Done

- Idea is normalized into the fixed template.
- Tech stack and category override are visible.
- Product and technical contracts are explicit.
- Implementation plan and test plan exist.
- Unknowns are marked `Not yet known`.
