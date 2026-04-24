---
title: {{candidate.name}} Feature Brief
description: Generated Feature Sync-Pack product brief for {{candidate.name}}.
status: planning
owner: {{candidate.ownerTeam}}
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 10
---

# {{candidate.name}} Feature Brief

## Purpose

Turn the OpenAlternative discovery signal into a governed internal app candidate.

## Problem

{{candidate.internalUseCase}}

## Users

- Primary owner: {{candidate.ownerTeam}}
- Additional users: Not yet known

## Workflow

- Discover pattern from {{candidate.source}}.
- Normalize into category {{candidate.internalCategory}} and lane {{candidate.lane}}.
- Score against Afenda priority rules.
- Review license, security, data sensitivity, and approval status.
- Hand off only after governance approval.

## Business Value

- Declared priority: {{candidate.priority}}
- Recommended priority: {{score.recommendedPriority}}
- Score: {{score.total}}
- Score reasons:
  {{score.reasons}}

## Source

- Source category: {{candidate.sourceCategory}}
- Source URL: {{candidate.sourceUrl}}
- References:
  {{candidate.openSourceReferences}}

## Non-Goals

- This pack does not approve direct source-code reuse.
- This pack does not claim implementation is complete.
- Unknown scope must stay explicit as `Not yet known`.
