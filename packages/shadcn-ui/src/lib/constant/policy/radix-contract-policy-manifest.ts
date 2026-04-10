import { defineConstMap } from "../schema/shared"

import {
  type RadixContractPolicy,
  radixContractPolicy,
} from "./radix-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const RADIX_CONTRACT_POLICY_MANIFEST_VERSION = "1.0.0"

type RadixContractPolicyField = keyof RadixContractPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const WRAPPER_CONTRACTS = "scripts/check-ui-wrapper-contracts.ts" as const

function entry(input: {
  field: RadixContractPolicyField
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

export const radixContractPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "radixContractPolicy",
    policyVersion: RADIX_CONTRACT_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "requirePropsSpreadToPrimitive",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, WRAPPER_CONTRACTS],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Objective wrapper-contract requirement; check-ui-wrapper-contracts consumes radixContractPolicy. Manifest v1 is review-only until fixture-backed proof is added.",
      }),
      entry({
        field: "requireRefForwardingOrExplicitRefPassThrough",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, WRAPPER_CONTRACTS],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Objective ref contract; same consumer as other require* contract fields.",
      }),
      entry({
        field: "requirePrimitiveRenderInWrapper",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, WRAPPER_CONTRACTS],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Objective render contract; wrapper scanner is the primary enforcement surface.",
      }),
      entry({
        field: "warnOnLocalStateReplacingPrimitiveBehavior",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, WRAPPER_CONTRACTS],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Heuristic / warning-class contract flag; not the same certainty as objective require* checks. Lifecycle stays review-only until calibrated.",
      }),
      entry({
        field: "warnOnSuspiciousAsChildContractDrift",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, WRAPPER_CONTRACTS],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Heuristic asChild drift warning; softer than objective wrapper requirements.",
      }),
    ],
  })
)

export const radixContractPolicyManifestFields = Object.freeze(
  radixContractPolicyManifest.entries.map((e) => e.field)
)

export const radixContractPolicyCanonicalFields = Object.freeze(
  Object.keys(radixContractPolicy) as RadixContractPolicyField[]
)

export type RadixContractPolicyManifest = typeof radixContractPolicyManifest
