---
title: Sync-Pack first 15 candidates
description: Archived draft candidate wave plan for the first governed Sync-Pack intake set derived from OpenAlternative-style market signal and normalized into Afenda capability language.
status: historical
owner: governance-toolchain
truthStatus: historical
docClass: historical-archive
surfaceType: doctrine
relatedDomain: product-intake-governance
order: 41
---

# Sync-Pack first 15 candidates

This document preserves an archived draft candidate wave for the Sync-Pack intake model.
It should be used as historical planning reference only while it remains parked under `packages/features-sdk/docs/sync-pack/archive/`.
It does not define active planning doctrine while archived.

## Purpose

The first wave should prove that Afenda can absorb external market signal without becoming an unbounded tool catalog.
The goal is not breadth.
The goal is a bounded, high-leverage set of candidates that strengthen Afenda as a business machine.

## Selection rule

These candidates were chosen to satisfy three conditions:

- they map to durable business or platform capability,
- they have cross-feature leverage,
- they fit Afenda better as normalized capability than as cloned product surface.

## Wave model

Use the following sequence:

- `wave-1`
  Build the spine.
- `wave-2`
  Increase leverage and operator intelligence.
- `wave-3`
  Expand into growth and ecosystem surfaces.

## Wave 1 candidates

### 1. Identity and access management

- Upstream signal:
  `Security & Privacy -> Identity & Access Management (IAM)`
- Example source tools:
  `Hanko`, `Keycloak`, `Authentik`
- Afenda capability:
  Tenant-safe identity, session, and access control
- Lane:
  `platform-spine`
- Priority:
  `critical`
- Likely target:
  `apps/web/src/app/_platform/auth`
- Why it belongs:
  Required trust and tenant boundary foundation for a SaaS ERP surface

### 2. Monitoring and observability

- Upstream signal:
  `Infrastructure & Operations -> Monitoring & Observability`
- Example source tools:
  `Uptime Kuma`, `GlitchTip`, `SigNoz`
- Afenda capability:
  Operational health, error visibility, and service confidence
- Lane:
  `platform-spine`
- Priority:
  `critical`
- Likely target:
  `apps/web/src/app/_platform/runtime` plus API-side observability ownership
- Why it belongs:
  A machine without visibility is not operationally credible

### 3. Workflow orchestration

- Upstream signal:
  `Productivity & Utilities -> Automation`
- Example source tools:
  `n8n`, `Activepieces`
- Afenda capability:
  Cross-system workflow orchestration
- Lane:
  `platform-spine`
- Priority:
  `critical`
- Likely target:
  `apps/web/src/app/_features/workflow-orchestration`
- Why it belongs:
  High reuse across approvals, notifications, integrations, and task coordination

### 4. Data platform and backend foundation

- Upstream signal:
  `Infrastructure & Operations -> Databases` and `Developer Tools -> Backend-as-a-Service style demand`
- Example source tools:
  `Supabase`, `Appwrite`
- Afenda capability:
  Governed data foundation, auth-connected backend services, and API-adjacent platform support
- Lane:
  `platform-spine`
- Priority:
  `critical`
- Likely target:
  `packages/_database`, API implementation surfaces, and approved platform adapters
- Why it belongs:
  Enables durable data contracts and operational continuity

### 5. Compliance and risk workflow

- Upstream signal:
  `Business Software -> Compliance & Risk Management`
- Example source tools:
  `Comp AI` as category signal rather than implementation mandate
- Afenda capability:
  Compliance workflow tracking and audit readiness
- Lane:
  `platform-spine`
- Priority:
  `critical`
- Likely target:
  `apps/web/src/app/_features/compliance`
- Why it belongs:
  Trust and governance are core to business-machine positioning

## Wave 2 candidates

### 6. Analytics and operational insight

- Upstream signal:
  `Data & Analytics -> Web & Product Analytics` and `Business Intelligence & Reporting`
- Example source tools:
  `OpenPanel`, `Metabase`, `PostHog` as category comparators
- Afenda capability:
  Operational analytics, reporting, and machine visibility
- Lane:
  `intelligence-layer`
- Priority:
  `essential`
- Likely target:
  `apps/web/src/app/_features/analytics`
- Why it belongs:
  Lets the machine explain itself and improve decisions

### 7. Localization and translation operations

- Upstream signal:
  Cross-cutting product localization demand
- Example source tools:
  `Tolgee`
- Afenda capability:
  Managed localization workflow for multilingual customer surfaces
- Lane:
  `intelligence-layer`
- Priority:
  `essential`
- Likely target:
  `apps/web/src/app/_platform/i18n`
- Why it belongs:
  Existing repo topology already recognizes i18n as a platform concern

### 8. AI assistant and operator support

- Upstream signal:
  `AI & Machine Learning -> AI Interaction & Interfaces`
- Example source tools:
  `Open WebUI`
- Afenda capability:
  Guided operator assistance inside business workflows
- Lane:
  `intelligence-layer`
- Priority:
  `essential`
- Likely target:
  `apps/web/src/app/_features/operator-assistant`
- Why it belongs:
  Keep AI implicit as machine behavior, not as brand inflation

### 9. CRM and customer operations

- Upstream signal:
  `Business Software -> CRM & Sales`
- Example source tools:
  `Twenty`, `EspoCRM`
- Afenda capability:
  Customer relationship and pipeline operations
- Lane:
  `core-business-module`
- Priority:
  `essential`
- Likely target:
  `apps/web/src/app/_features/crm`
- Why it belongs:
  Strong adjacency to ERP operations and revenue flow

### 10. Document and e-signature operations

- Upstream signal:
  `Business Software -> Document Management & E-Signatures`
- Example source tools:
  `Documenso`, `Papra`
- Afenda capability:
  Business document lifecycle and signature workflow
- Lane:
  `core-business-module`
- Priority:
  `essential`
- Likely target:
  `apps/web/src/app/_features/document-operations`
- Why it belongs:
  Common operational surface across procurement, HR, and compliance

## Wave 3 candidates

### 11. Content management and publishing

- Upstream signal:
  `Content & Publishing -> Content Management Systems (CMS)` and `Publishing`
- Example source tools:
  `Directus`, `Ghost`, `Strapi`
- Afenda capability:
  Structured content operations for public and semi-public surfaces
- Lane:
  `growth-surface`
- Priority:
  `strategic-later`
- Likely target:
  `marketing/` ownership plus shared content contracts as needed
- Why it belongs:
  Important for expansion, but not part of the initial machine spine

### 12. Knowledge base and documentation operations

- Upstream signal:
  `Content & Publishing -> Documentation & Knowledge Base`
- Example source tools:
  `Outline`, `Docmost`
- Afenda capability:
  Internal and external knowledge operations
- Lane:
  `growth-surface`
- Priority:
  `strategic-later`
- Likely target:
  `apps/web/src/app/_features/knowledge-operations`
- Why it belongs:
  Valuable once core operational workflows are stable

### 13. Builder and no-code composition

- Upstream signal:
  `Developer Tools -> Website Builders` and popular low-code/no-code categories
- Example source tools:
  `Baserow`, `ToolJet`, `Appsmith`
- Afenda capability:
  Governed business-side composition and configurable workflows
- Lane:
  `ecosystem-surface`
- Priority:
  `strategic-later`
- Likely target:
  `apps/web/src/app/_features/business-builder`
- Why it belongs:
  Powerful, but dangerous if introduced before governance and permissions are mature

### 14. Social and campaign operations

- Upstream signal:
  `Community & Social` and `Content & Publishing`
- Example source tools:
  `Postiz`
- Afenda capability:
  Campaign publishing and social distribution workflow
- Lane:
  `growth-surface`
- Priority:
  `strategic-later`
- Likely target:
  `marketing/` plus a bounded campaign feature if needed
- Why it belongs:
  Supports growth, not operational viability

### 15. Visual collaboration and whiteboarding

- Upstream signal:
  `Productivity & Utilities -> Design & Visualization` and collaboration categories
- Example source tools:
  `Excalidraw`
- Afenda capability:
  Visual collaboration for planning, handoff, and review
- Lane:
  `ecosystem-surface`
- Priority:
  `strategic-later`
- Likely target:
  Deferred until a concrete cross-team workflow justifies ownership
- Why it belongs:
  Useful, but easier to overbuild without a measured product need

## Review notes

The first wave intentionally favors platform and operational integrity over breadth.
This matches Afenda's positioning as a machine businesses run through, not a marketplace of disconnected experiences.

The candidate list is also intentionally capability-first.
Named tools are category signals and reference points, not default implementation choices.

## References

Canonical doctrine:

- [Sync-Pack intake model](./SYNC_PACK_INTAKE_MODEL.md)
- [Architecture](../../../../../docs/ARCHITECTURE.md)
- [Project structure](../../../../../docs/PROJECT_STRUCTURE.md)
- [Architecture evolution](../../../../../docs/ARCHITECTURE_EVOLUTION.md)

External references:

- [OpenAlternative categories](https://openalternative.co/categories)
- [OpenAlternative about](https://openalternative.co/about)
