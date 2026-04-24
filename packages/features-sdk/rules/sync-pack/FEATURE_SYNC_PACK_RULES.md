---
title: Feature Sync-Pack Rules
description: Governing rules for converting open-source discovery signals into fixed product and technical feature packs.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: rules
relatedDomain: feature-sync-pack
order: 10
---

# Feature Sync-Pack Rules

## Purpose

Afenda Feature Sync-Pack SDK turns open-source software patterns into governed, comparable, build-ready internal app packs.

The operating standard is:

```txt
Idea -> Template -> Tech Stack -> Contract -> Implementation Plan -> DoD
```

## Source Policy

- OpenAlternative is discovery.
- Sync-Pack is translation.
- Afenda governance is approval.
- Feature teams build only from approved packs.

## Fixed Pack Contract

Every generated feature pack must emit exactly these files under
`packages/features-sdk/docs/sync-pack/generated-packs/<category>/<app-id>/`:

```txt
00-candidate.json
01-feature-brief.md
02-product-requirement.md
03-technical-design.md
04-data-contract.md
05-api-contract.md
06-ui-contract.md
07-security-risk-review.md
08-implementation-plan.md
09-test-plan.md
10-handoff.md
```

Unknown sections must be written as `Not yet known`. Empty silent sections are not allowed.

## Product Pack

- `00-candidate.json`
- `01-feature-brief.md`
- `02-product-requirement.md`
- `10-handoff.md`

## Technical Pack

- `03-technical-design.md`
- `04-data-contract.md`
- `05-api-contract.md`
- `06-ui-contract.md`
- `07-security-risk-review.md`
- `08-implementation-plan.md`
- `09-test-plan.md`

## OODA Workflow

Observe: OpenAlternative category, tool name, alternative-to, license, repo activity, deployment model, and security surface.

Orient: Internal category, lane, use case, data sensitivity, owner team, build mode, and stack recommendation.

Decide: Critical / Essential / Good-to-Have and Adopt / Adapt / Inspire / Avoid.

Act: Generate the Product Pack and Technical Pack, then hand off only approved packs.

## Submission Track Status

Developer end-product submission is planned as a GitHub pull request workflow with GitHub Actions enforcement.

This section is intentionally deferred for v1. Current implementation work must finish the scaffold CLI, SDK exports, dependency-version doctor, and local guardrail checks first.
