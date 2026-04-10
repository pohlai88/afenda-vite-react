import { defineConstMap } from "../schema/shared"

import { type ReactPolicy, reactPolicy } from "./react-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const REACT_POLICY_MANIFEST_VERSION = "1.0.0"

type ReactPolicyField = keyof ReactPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const DRIFT_AST = "scripts/check-ui-drift-ast.ts" as const

function entry(input: {
  field: ReactPolicyField
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

export const reactPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "reactPolicy",
    policyVersion: REACT_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "requirePureRender",
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
          "Render purity doctrine; pair with allowMutationDuringRender. Future ESLint (rule-policy UIX-REACT-PURITY-001) or AST when mapped.",
      }),
      entry({
        field: "allowMutationDuringRender",
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
          "Violation gate vs requirePureRender; not a second source of truth. Enforcement via future React-specific checkers.",
      }),
      entry({
        field: "allowStateSetterDuringRender",
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
          "Discipline for setState during render; aligns with bannedPatterns label set-state-in-render when enforced.",
      }),
      entry({
        field: "allowConditionalHookCalls",
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
          "Rules-of-hooks stance; pairs with conditional-hooks in bannedPatterns for future AST mapping.",
      }),
      entry({
        field: "preferLocalStateUntilShared",
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
          "Directional guidance (prefer*); may be warning-tier or review until automated.",
      }),
      entry({
        field: "preferSingleSourceOfTruthState",
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
          "SSOT posture; overlaps duplicate-derived-state and related bannedPatterns when enforced.",
      }),
      entry({
        field: "allowDerivedStateCopies",
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
          "See react-policy schema JSDoc: derivation vs memo/cache. Future ESLint UIX-REACT-STATE-001 when wired.",
      }),
      entry({
        field: "preferControlledComponentsAtBoundary",
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
          "Reusable UI / product boundary preference; enforcement often review or component-contract checks.",
      }),
      entry({
        field: "preferEffectForExternalSyncOnly",
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
          "Effect hygiene; pairs allowBusinessLogicDumpedIntoEffects. Future ESLint UIX-REACT-EFFECT-001.",
      }),
      entry({
        field: "allowBusinessLogicDumpedIntoEffects",
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
          "Violation gate vs effect-as-primary-business-logic in bannedPatterns.",
      }),
      entry({
        field: "preferMemoOnlyWhenMeasured",
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
          "Memo heuristics; pairs allowBlindMemoizationEverywhere. Future ESLint UIX-REACT-MEMO-001.",
      }),
      entry({
        field: "allowBlindMemoizationEverywhere",
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
          "Violation gate vs blind-memoization bannedPattern label.",
      }),
      entry({
        field: "bannedPatterns",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, DRIFT_AST],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "AST-check labels (non-vague); validate-constants uniqueness; reactBannedPatternValues tuple. Wire each label to a checker before promoting lifecycle. Drift AST and ESLint consume when mapped per rule-policy.",
      }),
    ],
  })
)

export const reactPolicyManifestFields = Object.freeze(
  reactPolicyManifest.entries.map((e) => e.field)
)

export const reactPolicyCanonicalFields = Object.freeze(
  Object.keys(reactPolicy) as ReactPolicyField[]
)

export type ReactPolicyManifest = typeof reactPolicyManifest
