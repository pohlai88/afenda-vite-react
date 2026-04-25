---
title: Sync-Pack intake model
description: Archived draft doctrine for converting external market signal into governed Afenda capabilities, Sync-Pack artifacts, and approved implementation targets.
status: historical
owner: governance-toolchain
truthStatus: historical
docClass: historical-archive
surfaceType: doctrine
relatedDomain: product-intake-governance
order: 40
---

# Sync-Pack intake model

This document preserves an archived draft for how Afenda might convert external market signal into governed product capability.
It should be used as historical reference only while the material remains parked under `packages/features-sdk/docs/sync-pack/archive/`.
It does not define active doctrine while archived.

## Purpose

Afenda should not absorb external software catalogs as flat feature wishlists.
It should treat them as demand signals, normalize them into Afenda-native capability language, score them with governance rules, and only then approve them as product modules or platform work.

This doctrine exists to keep the intake pipeline:

- market-aware,
- architecture-aware,
- bounded by governance,
- and separate from raw tool imitation.

## Brand positioning anchor

Afenda is the business machine of the Machine Era.

In the industrial age, companies scaled with physical machines.
In the computer age, they scaled with software systems.
In the Machine Era, they need operational systems that can organize work, coordinate tools, and turn complexity into usable capability.
Afenda is that machine.

Afenda is a consumer-facing SaaS product, not a developer-facing PaaS.
It should therefore present itself as the machine businesses run through, not as the infrastructure they assemble.

## Scope

This doctrine applies to:

- external market-signal catalogs used for product discovery,
- category and tool normalization,
- Sync-Pack candidate generation,
- priority scoring,
- repo placement decisions for approved work.

This doctrine does not:

- approve implementation by itself,
- override architecture boundaries,
- treat third-party tools as canonical product boundaries,
- authorize copying upstream repositories into Afenda.

## Source taxonomy posture

OpenAlternative is a useful upstream signal because it organizes open-source alternatives by validated market-facing categories and subcategories.
As observed on 2026-04-24, its live top-level categories include:

- AI & Machine Learning
- Business Software
- Community & Social
- Content & Publishing
- Data & Analytics
- Developer Tools
- Infrastructure & Operations
- Miscellaneous
- Productivity & Utilities
- Security & Privacy

Afenda must treat this as a source taxonomy, not as Afenda's internal product architecture.

## Canonical pipeline

The canonical transformation is:

`OpenAlternative = market signal`
`Afenda normalization = capability model`
`Sync-Pack = governed intake artifact`
`Afenda feature/module = approved implementation target`

Interpretation:

- `market signal`
  External evidence that a problem area, workflow, or capability already has active demand.
- `capability model`
  Afenda's normalized description of the business capability, use case, lane, and ownership model.
- `governed intake artifact`
  The reviewable package that records score, risk, placement, and implementation readiness.
- `approved implementation target`
  The actual Afenda outcome: feature module, platform slice, shared contract, or deferred item.

## Required normalization model

Afenda must not let a named tool become the product boundary by default.

Required transformation:

`source category -> source subcategory -> tool -> alternative-to -> use case`
`-> Afenda capability -> Afenda lane -> target owner -> delivery wave`

### Required normalized fields

Every candidate should be expressible in the following vocabulary:

| Field               | Meaning                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `sourceCategory`    | Top-level upstream grouping from the source catalog                                      |
| `sourceSubcategory` | Upstream subcategory under the source category                                           |
| `toolName`          | Named upstream project or product                                                        |
| `alternativeTo`     | Proprietary product or category the tool replaces                                        |
| `useCase`           | User or business problem being solved                                                    |
| `afendaCapability`  | Afenda-native capability statement                                                       |
| `afendaLane`        | Delivery lane such as platform, core business module, intelligence, growth, or ecosystem |
| `targetOwner`       | Expected owning feature, platform slice, or package                                      |
| `deliveryWave`      | Sequenced rollout wave such as `wave-1`, `wave-2`, or `defer`                            |

### Lane definitions

Use the following Afenda lanes unless a later ADR changes them:

| Lane                   | Meaning                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `platform-spine`       | Capabilities required for security, operational integrity, runtime coordination, or shared data foundations |
| `core-business-module` | ERP or line-of-business capability directly exposed to customers                                            |
| `intelligence-layer`   | Decision, assistant, analytics, or recommendation capability                                                |
| `growth-surface`       | Content, communication, publishing, or expansion surfaces                                                   |
| `ecosystem-surface`    | Integrations, builders, extensibility, or partner-facing capability                                         |

## Scoring rubric

Every normalized candidate must be scored before it can enter a real implementation backlog.

Use a five-point scale for each criterion where:

- `1` = weak or high-risk fit
- `3` = plausible fit with bounded value
- `5` = strong fit with clear value and manageable risk

### Required criteria

| Criterion                  | Question                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `strategicFit`             | Does this strengthen Afenda's product direction as a SaaS business machine rather than a generic tool collection? |
| `reuseLeverage`            | Can this capability unlock multiple modules, flows, or future packs?                                              |
| `operationalCriticality`   | Is the capability necessary for platform reliability, trust, or day-to-day business operation?                    |
| `integrationComplexity`    | Can Afenda absorb this capability without disproportionate architecture or maintenance cost?                      |
| `licenseCompliancePosture` | Is the licensing and compliance posture clear and acceptable?                                                     |
| `maintenanceBurden`        | Can the team sustain the dependency, abstraction, and upgrade surface over time?                                  |
| `differentiationValue`     | Does normalizing this capability make Afenda meaningfully stronger than a bundle of disconnected tools?           |

### Priority bands

Use the aggregate score and criticality profile to place a candidate in one of these bands:

- `critical`
  Platform spine or essential product capability with high strategic fit and bounded integration risk.
- `essential`
  Strong value and reuse, but not required to make the platform viable.
- `strategic-later`
  Valuable, but better sequenced after higher-leverage foundations exist.
- `reject-for-now`
  Weak fit, unclear ownership, poor posture, or unacceptable maintenance trade-off.

## Sync-Pack artifact contract

Each candidate should be recorded as a governed Sync-Pack artifact with the following minimum surfaces:

- `candidate.json`
- `feature-brief.md`
- `technical-design.md`
- `handoff.md`

### Required meaning of each surface

| Surface               | Purpose                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `candidate.json`      | Structured source, score, lane, owner, and status record for machine use and review                      |
| `feature-brief.md`    | Human-facing problem statement, target users, business value, and scope boundary                         |
| `technical-design.md` | Integration approach, dependencies, API/rpc boundary, state model, and risk notes                        |
| `handoff.md`          | Execution summary for the next implementing owner, including deferred issues and validation expectations |

## Candidate schema

The minimum candidate contract should contain these fields:

| Field               | Required | Meaning                                                                                                           |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`                | yes      | Stable candidate identifier                                                                                       |
| `title`             | yes      | Human-readable candidate name                                                                                     |
| `source`            | yes      | Upstream source such as `openalternative`                                                                         |
| `sourceCategory`    | yes      | Upstream top-level category                                                                                       |
| `sourceSubcategory` | yes      | Upstream child category                                                                                           |
| `toolName`          | yes      | Source project name                                                                                               |
| `alternativeTo`     | no       | Proprietary benchmark or incumbent                                                                                |
| `marketSignal`      | yes      | Summary of why the candidate matters                                                                              |
| `useCase`           | yes      | Business problem or workflow                                                                                      |
| `afendaCapability`  | yes      | Normalized Afenda capability statement                                                                            |
| `afendaLane`        | yes      | One of the approved Afenda lanes                                                                                  |
| `priority`          | yes      | `critical`, `essential`, `strategic-later`, or `reject-for-now`                                                   |
| `score`             | yes      | Rubric breakdown plus total                                                                                       |
| `status`            | yes      | Intake state such as `harvested`, `screened`, `approved-for-design`, `approved-for-build`, `deferred`, `rejected` |
| `proposedModule`    | yes      | Expected implementation target or owning surface                                                                  |
| `repoPlacement`     | yes      | Intended repo path or surface class                                                                               |
| `notes`             | no       | Bounded review notes or caveats                                                                                   |

### Illustrative shape

```json
{
  "id": "sp-001-workflow-orchestration",
  "title": "Workflow orchestration capability",
  "source": "openalternative",
  "sourceCategory": "Productivity & Utilities",
  "sourceSubcategory": "Automation",
  "toolName": "n8n",
  "alternativeTo": ["Make", "Zapier"],
  "marketSignal": "Workflow automation remains a high-demand operational category with strong cross-function reuse.",
  "useCase": "Cross-system orchestration for business actions, approvals, and notifications.",
  "afendaCapability": "Business workflow orchestration",
  "afendaLane": "platform-spine",
  "priority": "critical",
  "score": {
    "strategicFit": 5,
    "reuseLeverage": 5,
    "operationalCriticality": 4,
    "integrationComplexity": 3,
    "licenseCompliancePosture": 4,
    "maintenanceBurden": 3,
    "differentiationValue": 4,
    "total": 28
  },
  "status": "approved-for-design",
  "proposedModule": "workflow-orchestration",
  "repoPlacement": {
    "surfaceType": "feature",
    "path": "apps/web/src/app/_features/workflow-orchestration"
  },
  "notes": [
    "Keep the Afenda capability boundary above any one upstream tool implementation.",
    "Validate API and audit requirements before build approval."
  ]
}
```

## Repo placement contract

Approved work must follow the existing boundary doctrine and workspace topology.

### Required placement rules

| Artifact or work type                          | Required placement                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Repo-wide intake doctrine                      | `docs/architecture/**`                                                         |
| Supporting intake references or wave plans     | `docs/architecture/**`                                                         |
| Harvesting, normalization, and scoring scripts | `scripts/**`                                                                   |
| Generated candidate artifacts and reports      | `.artifacts/**`                                                                |
| Approved product modules                       | `apps/web/src/app/_features/**`                                                |
| Approved platform capability                   | `apps/web/src/app/_platform/**`                                                |
| Shared cross-owner contracts                   | `packages/**` or approved `apps/web/src/share/**` surfaces, depending on scope |

### Explicit non-goals

Do not:

- create a new top-level `apps/web/src/features/` root,
- let external tool names dictate package topology,
- place feature-local guidance in root when owner-local placement is enough,
- treat a harvested catalog entry as build approval.

## Portfolio sequencing guidance

The default sequencing posture is:

- `wave-1`
  Platform spine and core business capabilities that unlock trust, orchestration, and durable system behavior.
- `wave-2`
  Intelligence and leverage layers that increase operator velocity or decision quality.
- `wave-3`
  Growth, publishing, builder, and ecosystem expansions that matter after the spine is stable.

The default first-wave emphasis should favor:

- identity and access management,
- monitoring and observability,
- workflow orchestration,
- data platform and backend foundations,
- analytics and operational insight.

## Forbidden pattern

The following patterns are not allowed under this doctrine:

- copying tools randomly because they are popular,
- treating all categories as equal in weight,
- letting teams choose intake priorities without a normalized score,
- implementing directly from upstream repositories before governance review,
- ignoring license, security, or maintenance posture,
- marketing Afenda as a bundle of AI features instead of a coherent business machine.

## Exceptions

Temporary exceptions may be allowed when:

- a candidate is needed for a bounded proof-of-value review,
- the implementation is deliberately isolated and non-canonical,
- the owner, review date, and rollback condition are explicitly recorded.

An exception does not create a new default.

## Enforcement and validation

This doctrine is enforced today through review and placement alignment, not through a dedicated CI contract yet.

Contributors applying this model should at minimum align with:

- `pnpm run script:check-afenda-config`
- `pnpm run script:generate-docs-readme`

If the Sync-Pack pipeline becomes a durable operational surface, promote it later through an ADR or ATC only when the trigger conditions in [Architecture evolution](../../../../../docs/ARCHITECTURE_EVOLUTION.md) are met.

## References

Internal references:

- [Architecture](../../../../../docs/ARCHITECTURE.md)
- [Architecture evolution](../../../../../docs/ARCHITECTURE_EVOLUTION.md)
- [Project structure](../../../../../docs/PROJECT_STRUCTURE.md)
- [Monorepo boundaries](../../../../../docs/MONOREPO_BOUNDARIES.md)
- [Boundary surfaces](../../../../../docs/BOUNDARY_SURFACES.md)
- [API](../../../../../docs/API.md)
- [State management](../../../../../docs/STATE_MANAGEMENT.md)

External references:

- [OpenAlternative categories](https://openalternative.co/categories)
- [OpenAlternative about](https://openalternative.co/about)
