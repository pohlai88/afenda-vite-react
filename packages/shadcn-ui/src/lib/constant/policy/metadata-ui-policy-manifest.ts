import { defineConstMap } from "../schema/shared"

import { type MetadataUiPolicy, metadataUiPolicy } from "./metadata-ui"
import { policyManifestSchema } from "./policy-manifest-schema"

export const METADATA_UI_POLICY_MANIFEST_VERSION = "1.0.0"

type MetadataUiPolicyField = keyof MetadataUiPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const SCHEMA = "packages/shadcn-ui/src/lib/constant/policy/metadata-ui.ts" as const
const DRIFT_AST = "scripts/check-ui-drift-ast.ts" as const
const METADATA_FIXTURES = "scripts/check-metadata-ui-fixtures.ts" as const

function entry(input: {
  field: MetadataUiPolicyField
  lifecycle: "enforced" | "review-only" | "backlog" | "deprecated"
  consumerKind: "eslint" | "ci-script" | "runtime-validator" | "manual-review"
  consumers: readonly [string, ...string[]] | readonly []
  fixtureCoverage: { valid: boolean; invalid: boolean; edge: boolean }
  fixturePaths: {
    valid: readonly string[]
    invalid: readonly string[]
    edge: readonly string[]
  }
  ciBlocking: boolean
  canonical: boolean
  compatibilityOnly: boolean
  phase:
    | "phase-1-structure"
    | "phase-2-objective-enforcement"
    | "phase-3-semantic-enforcement"
    | "phase-4-legacy-removal"
  legacySunset: string | null
  notes: string
}) {
  return input
}

export const metadataUiPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "metadataUiPolicy",
    policyVersion: METADATA_UI_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "allowedSemanticSources",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-1-structure",
        legacySunset: null,
        notes:
          "Policy integrity validated by schema/runtime checks (duplicates, min length). Feature usage is not statically enforced yet. Promote to enforced when AST consumer wiring is added and valid/invalid fixtures are checked in CI.",
      }),
      entry({
        field: "defaultSemanticSources",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-1-structure",
        legacySunset: null,
        notes:
          "Policy integrity validated by schema/runtime checks (subset-of-allowed, duplicate rejection). Feature usage is not statically enforced yet. Promote to enforced when AST consumer wiring and fixture-backed CI checks land.",
      }),
      entry({
        field: "defaultStyleBindingMode",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity validated by schema/runtime cross-field checks (none rejected when semantic token binding is required). Feature usage is not statically enforced yet. Promote to enforced after style-binding AST checks and valid/invalid fixtures are added.",
      }),
      entry({
        field: "allowDomainToUiSemanticMapping",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated, but this remains a transitional compatibility flag and is not canonical long-term direction. Feature usage is not statically enforced yet. Promote only if a real compatibility AST check is added; otherwise move toward deprecation lifecycle with sunset.",
      }),
      entry({
        field: "allowInvariantToUiSemanticMapping",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated, but this remains a transitional compatibility flag and is not canonical long-term direction. Feature usage is not statically enforced yet. Promote only if a real compatibility AST check is added; otherwise move toward deprecation lifecycle with sunset.",
      }),
      entry({
        field: "allowShellToUiDensityMapping",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated, but this remains a transitional compatibility flag and is not canonical long-term direction. Feature usage is not statically enforced yet. Promote only if a real compatibility AST check is added; otherwise move toward deprecation lifecycle with sunset.",
      }),
      entry({
        field: "allowShellToUiPriorityMapping",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated, but this remains a transitional compatibility flag and is not canonical long-term direction. Feature usage is not statically enforced yet. Promote only if a real compatibility AST check is added; otherwise move toward deprecation lifecycle with sunset.",
      }),
      entry({
        field: "allowMetadataDrivenVisibility",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is runtime-validated today. Feature usage is not statically enforced yet. Promote to enforced when adapter/contract-aware AST checks exist and valid/invalid fixtures prove visibility binding behavior.",
      }),
      entry({
        field: "allowMetadataDrivenAffordance",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is runtime-validated today. Feature usage is not statically enforced yet. Promote to enforced once affordance-specific AST heuristics are stable and fixture-backed in CI.",
      }),
      entry({
        field: "allowMetadataDrivenSeverity",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is runtime-validated today. Feature usage is not statically enforced yet. Promote to enforced once severity mappings are traced through governed adapters and covered by AST fixtures.",
      }),
      entry({
        field: "allowMetadataDrivenEvidencePresentation",
        lifecycle: "review-only",
        consumerKind: "manual-review",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Manual-review maturity: policy integrity is validated, but feature usage is intentionally not statically enforced yet because evidence semantics need calibrated heuristics. Promote after adapter normalization rules exist and fixture-backed checks show low false positives.",
      }),
      entry({
        field: "allowMetadataDrivenRemediationUi",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is runtime-validated today. Feature usage is not statically enforced yet. Promote to enforced after remediation adapters/component contracts are linked to AST checks with valid/invalid fixtures.",
      }),
      entry({
        field: "allowMetadataDrivenInteractionMode",
        lifecycle: "review-only",
        consumerKind: "manual-review",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Manual-review maturity: policy integrity is validated, but feature usage is intentionally not statically enforced yet due high pattern ambiguity. Promote after interaction-mode contracts are stable and AST classification accuracy is demonstrated with fixtures.",
      }),
      entry({
        field: "allowMetadataDrivenLayoutMode",
        lifecycle: "review-only",
        consumerKind: "manual-review",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Manual-review maturity: policy integrity is validated, but feature usage is intentionally not statically enforced yet because layout semantics are broad. Promote after governed layout contracts are explicit and fixture-backed AST checks are reliable.",
      }),
      entry({
        field: "allowMetadataDrivenActionAvailability",
        lifecycle: "backlog",
        consumerKind: "manual-review",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Backlog maturity: policy intent is tracked, but enforcement evidence and stable consumers are missing. Promote to review-only when action-availability adapters/components are mapped; promote to enforced only after AST + fixtures are in CI.",
      }),
      entry({
        field: "allowMetadataDrivenDisclosureMode",
        lifecycle: "review-only",
        consumerKind: "manual-review",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Manual-review maturity: policy integrity is validated, but feature usage is intentionally not statically enforced yet because disclosure semantics need nuanced heuristics. Promote after adapter alignment and fixture-backed AST checks are calibrated.",
      }),
      entry({
        field: "allowFeatureLevelMetadataToStyleFork",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [DRIFT_AST, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Review-only with concrete promotion path: policy integrity is runtime-validated and AST consumer exists. Feature usage evidence is still missing (no fixture-backed valid/invalid checks). Promote to enforced after style-fork rules are fixture-backed and CI-blocking.",
      }),
      entry({
        field: "allowFeatureLevelDomainToneMap",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [DRIFT_AST, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Review-only with concrete promotion path: policy integrity is runtime-validated and AST consumer exists. Feature usage evidence is still missing (no fixture-backed valid/invalid checks). Promote to enforced after tone-map detection is stable and fixture-backed.",
      }),
      entry({
        field: "allowInlineMetadataToTokenMappingInFeatures",
        lifecycle: "enforced",
        consumerKind: "ci-script",
        consumers: [DRIFT_AST, METADATA_FIXTURES, SCHEMA, RUNTIME],
        fixtureCoverage: { valid: true, invalid: true, edge: false },
        fixturePaths: {
          valid: [
            "scripts/fixtures/policy-manifests/metadata-ui/inline-metadata-to-token-mapping.valid.md",
          ],
          invalid: [
            "scripts/fixtures/policy-manifests/metadata-ui/inline-metadata-to-token-mapping.invalid.md",
          ],
          edge: [],
        },
        ciBlocking: true,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Enforced: policy integrity is validated by schema/runtime checks and feature usage is checked by AST rule UIX-AST-CONTROL-001 in CI. Dedicated fixture runner executes valid/invalid assertions for this rule id.",
      }),
      entry({
        field: "requireSemanticTokenBinding",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated by schema/runtime cross-field checks. Feature usage is not statically enforced yet. Promote to enforced after token-layer usage checks are linked to AST/CI with valid and invalid fixtures.",
      }),
      entry({
        field: "requireMetadataMappingToUseGovernedLayer",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated by schema/runtime cross-field checks. Feature usage is not statically enforced yet. Promote to enforced when AST checks prove mappings route through governed adapters/registries/contracts with fixture coverage.",
      }),
      entry({
        field: "requireMetadataNormalizationBeforeRendering",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated by schema/runtime dependencies. Feature usage is not statically enforced yet because normalization boundaries are not fully observable in AST checks. Promote to enforced after normalization-path fixtures and rule coverage are available.",
      }),
      entry({
        field: "requireMetadataAdaptersForCrossDomainBindings",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [SCHEMA, RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Policy integrity is validated by schema/runtime dependencies. Feature usage is not statically enforced yet because cross-domain adapter boundaries need explicit static evidence. Promote to enforced after adapter boundary checks are fixture-backed in CI.",
      }),
    ],
  })
)

export const metadataUiPolicyManifestFields = Object.freeze(
  metadataUiPolicyManifest.entries.map((entry) => entry.field)
)

export const metadataUiPolicyCanonicalFields = Object.freeze(
  Object.keys(metadataUiPolicy) as MetadataUiPolicyField[]
)

export type MetadataUiPolicyManifest = typeof metadataUiPolicyManifest
