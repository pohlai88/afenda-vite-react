---
title: Sync-Pack Metadata Reference
description: Field reference for Sync-Pack candidate and scaffold metadata, including enums, required fields, and failure implications.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 30
---

# Sync-Pack Metadata Reference

This reference is derived from the active Zod schemas under `src/sync-pack/schema`.

## 1. Seed candidate metadata

Primary schema: `appCandidateSchema`

Seed file location used by Sync-Pack:

```txt
packages/features-sdk/rules/sync-pack/openalternative.seed.json
```

### Candidate fields

| Field                    | Type       | Required | Allowed values / rule                              | Example                                            | Used by                             | Failure mode                                             |
| ------------------------ | ---------- | -------- | -------------------------------------------------- | -------------------------------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `id`                     | string     | yes      | kebab-case, regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`     | `internal-support-crm`                             | validate, generate, check           | seed validation fails; generated pack path may also fail |
| `name`                   | string     | yes      | non-empty string                                   | `Internal Support CRM`                             | validate, report, generate          | parse failure                                            |
| `source`                 | literal    | yes      | `openalternative`                                  | `openalternative`                                  | validate, reporting lineage         | parse failure                                            |
| `sourceUrl`              | URL string | yes      | valid URL                                          | `https://openalternative.co/...`                   | validate, reporting lineage         | parse failure                                            |
| `sourceCategory`         | string     | yes      | non-empty string                                   | `Customer Support`                                 | validate, reporting                 | parse failure                                            |
| `internalCategory`       | enum       | yes      | see category list below                            | `business-saas`                                    | validate, generate, check, scaffold | parse failure or category/path mismatch later            |
| `lane`                   | enum       | yes      | must match lane implied by `internalCategory`      | `operate`                                          | validate                            | custom lane mismatch error                               |
| `priority`               | enum       | yes      | `critical`, `essential`, `good-to-have`            | `essential`                                        | ranking, reporting                  | parse failure                                            |
| `buildMode`              | enum       | yes      | `adopt`, `adapt`, `inspire`, `avoid`               | `adapt`                                            | check, planning                     | parse failure; extra business rules may fail             |
| `internalUseCase`        | string     | yes      | non-empty string                                   | `Handle internal ticketing and support workflows.` | validate, planning docs             | parse failure                                            |
| `openSourceReferences`   | URL[]      | yes      | one or more URLs                                   | `[...]`                                            | validate, planning context          | parse failure                                            |
| `licenseReviewRequired`  | boolean    | yes      | true or false                                      | `true`                                             | governance review                   | parse failure                                            |
| `securityReviewRequired` | boolean    | yes      | true or false                                      | `true`                                             | check, governance review            | may fail if sensitivity is high and this is false        |
| `dataSensitivity`        | enum       | yes      | `low`, `medium`, `high`                            | `high`                                             | check, planning                     | parse failure; high sensitivity rule may fail            |
| `ownerTeam`              | string     | yes      | non-empty string                                   | `devops-platform`                                  | review / ownership                  | parse failure                                            |
| `status`                 | enum       | yes      | `candidate`, `approved`, `rejected`, `implemented` | `approved`                                         | check, handoff readiness            | `adopt` with non-approved status fails                   |

### Category values

Current allowed `internalCategory` values:

- `communication-ai-ml`
- `business-saas`
- `content-publishing`
- `data-analytics`
- `infrastructure-operations`
- `productivity-utilities`
- `security-privacy`
- `mini-developer`

### Lane values

Current allowed `lane` values:

- `operate`
- `intelligence`
- `platform`

### Category-to-lane mapping

| Category                    | Required lane  |
| --------------------------- | -------------- |
| `business-saas`             | `operate`      |
| `content-publishing`        | `operate`      |
| `productivity-utilities`    | `operate`      |
| `communication-ai-ml`       | `intelligence` |
| `data-analytics`            | `intelligence` |
| `infrastructure-operations` | `platform`     |
| `mini-developer`            | `platform`     |
| `security-privacy`          | `platform`     |

### Priority values

- `critical`
- `essential`
- `good-to-have`

### Build mode values

- `adopt`
- `adapt`
- `inspire`
- `avoid`

### Candidate status values

- `candidate`
- `approved`
- `rejected`
- `implemented`

### Data sensitivity values

- `low`
- `medium`
- `high`

### Important cross-field rules

1. `lane` must match the lane derived from `internalCategory`.
2. If `buildMode === "adopt"`, then generated pack checks require `status === "approved"`.
3. If `dataSensitivity === "high"`, then generated pack checks require `securityReviewRequired === true`.

## 2. Generated pack file contract

Generated packs must contain exactly these 11 files:

1. `00-candidate.json`
2. `01-feature-brief.md`
3. `02-product-requirement.md`
4. `03-technical-design.md`
5. `04-data-contract.md`
6. `05-api-contract.md`
7. `06-ui-contract.md`
8. `07-security-risk-review.md`
9. `08-implementation-plan.md`
10. `09-test-plan.md`
11. `10-handoff.md`

If any are missing or extra files exist, `check` reports `pack-file-contract-mismatch`.

## 3. Scaffold manifest metadata

Primary schema: `stackScaffoldManifestSchema`

### Manifest fields

| Field             | Type                  | Required | Allowed values / rule             | Example                     | Used by             | Failure mode  |
| ----------------- | --------------------- | -------- | --------------------------------- | --------------------------- | ------------------- | ------------- |
| `appId`           | string                | yes      | kebab-case app id                 | `internal-support`          | scaffold            | parse failure |
| `packageName`     | string                | yes      | non-empty                         | `@afenda/internal-support`  | scaffold            | parse failure |
| `category`        | enum                  | yes      | Sync-Pack feature categories      | `business-saas`             | scaffold            | parse failure |
| `generatedBy`     | literal               | yes      | `@afenda/features-sdk/sync-pack`  | same                        | scaffold provenance | parse failure |
| `dependencies`    | array                 | yes      | array of stack dependency objects | `[...]`                     | scaffold output     | parse failure |
| `devDependencies` | array                 | yes      | array of stack dependency objects | `[...]`                     | scaffold output     | parse failure |
| `scripts`         | record<string,string> | yes      | string values only                | `{ "build": "vite build" }` | scaffold output     | parse failure |
| `notes`           | string[]              | yes      | non-empty strings                 | `[...]`                     | scaffold output     | parse failure |

### Stack dependency object fields

| Field         | Type     | Required | Allowed values                                       | Example                          |
| ------------- | -------- | -------- | ---------------------------------------------------- | -------------------------------- |
| `name`        | string   | yes      | non-empty                                            | `zod`                            |
| `versionSpec` | string   | yes      | non-empty                                            | `catalog:`                       |
| `group`       | enum     | yes      | `dependencies`, `devDependencies`                    | `dependencies`                   |
| `source`      | enum     | yes      | `workspace-catalog`, `workspace-package`, `fallback` | `workspace-catalog`              |
| `requiredFor` | string[] | yes      | one or more non-empty strings                        | `["validation", "api-contract"]` |

## 4. What commands consume which metadata?

| Metadata area               | Main commands                                               |
| --------------------------- | ----------------------------------------------------------- |
| seed candidate metadata     | `validate`, `rank`, `report`, `generate`, `check`, `verify` |
| generated pack file set     | `check`, `verify`                                           |
| package metadata            | `release-check`, `verify`                                   |
| dependency/catalog metadata | `doctor`, `verify`                                          |
| scaffold manifest metadata  | `scaffold`                                                  |

## 5. Safe operator rule

If you change candidate metadata, the safest sequence is:

```txt
pnpm run feature-sync:validate
pnpm run feature-sync:generate
pnpm run feature-sync:check
pnpm run feature-sync:verify
```

If `validate` fails, the primary finding codes are:

- `invalid-seed-json`
- `invalid-seed-candidate`
- `missing-seed-file`
- `seed-read-failed`

The governed remediation catalog for those findings lives in:

- [finding-remediation-catalog.md](./finding-remediation-catalog.md)
