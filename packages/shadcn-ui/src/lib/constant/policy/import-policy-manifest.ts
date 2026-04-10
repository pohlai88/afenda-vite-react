import { defineConstMap } from "../schema/shared"

import { type ImportPolicy, importPolicy } from "./import-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const IMPORT_POLICY_MANIFEST_VERSION = "1.0.0"

type ImportPolicyField = keyof ImportPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

function entry(input: {
  field: ImportPolicyField
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

export const importPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "importPolicy",
    policyVersion: IMPORT_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "bannedImportPrefixes",
        lifecycle: "enforced",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: true, invalid: true, edge: false },
        fixturePaths: {
          valid: [
            "scripts/fixtures/policy-manifests/import-policy/banned-import-prefixes.valid.md",
          ],
          invalid: [
            "scripts/fixtures/policy-manifests/import-policy/banned-import-prefixes.invalid.md",
          ],
          edge: [],
        },
        ciBlocking: true,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Prefix-based banned imports are enforced by AST import checks and validated for policy consistency.",
      }),
      entry({
        field: "bannedExactImportPaths",
        lifecycle: "enforced",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: true, invalid: true, edge: false },
        fixturePaths: {
          valid: [
            "scripts/fixtures/policy-manifests/import-policy/banned-exact-import-paths.valid.md",
          ],
          invalid: [
            "scripts/fixtures/policy-manifests/import-policy/banned-exact-import-paths.invalid.md",
          ],
          edge: [],
        },
        ciBlocking: true,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Exact banned imports are enforced by AST import checks and validated for policy consistency.",
      }),
      entry({
        field: "bannedImportPatternLabels",
        lifecycle: "enforced",
        consumerKind: "ci-script",
        consumers: [
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
          "scripts/check-ui-drift-ast.ts",
        ],
        fixtureCoverage: { valid: true, invalid: true, edge: false },
        fixturePaths: {
          valid: [
            "scripts/fixtures/policy-manifests/import-policy/banned-import-pattern-labels.valid.md",
          ],
          invalid: [
            "scripts/fixtures/policy-manifests/import-policy/banned-import-pattern-labels.invalid.md",
          ],
          edge: [],
        },
        ciBlocking: true,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Semantic labels for module/import-boundary AST checks (e.g. barrel-import-in-feature). Enforced by check-ui-drift-ast (UIX-AST-IMPORT-005) when the label is present; path bans remain on bannedImportPrefixes / bannedExactImportPaths.",
      }),
      entry({
        field: "allowedCnImportPaths",
        lifecycle: "enforced",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: true, invalid: true, edge: false },
        fixturePaths: {
          valid: [
            "scripts/fixtures/policy-manifests/import-policy/allowed-cn-import-paths.valid.md",
          ],
          invalid: [
            "scripts/fixtures/policy-manifests/import-policy/allowed-cn-import-paths.invalid.md",
          ],
          edge: [],
        },
        ciBlocking: true,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Approved cn import paths are enforced by AST checks and validated for uniqueness.",
      }),
      entry({
        field: "governedUiOwnerSourcePathPrefixes",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Owner path prefixes define where direct primitive imports are governance-exempt by policy.",
      }),
      entry({
        field: "allowedLocalCnImportSourcePathPrefixes",
        lifecycle: "backlog",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Local cn import source exemptions are supported but should remain narrow and audited.",
      }),
      entry({
        field: "directRadixImportAllowedSourcePathPrefixes",
        lifecycle: "backlog",
        consumerKind: "runtime-validator",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Radix source-path exemptions are intentionally empty by default and reviewed when added.",
      }),
      entry({
        field: "cvaImportAllowedSourcePathPrefixes",
        lifecycle: "backlog",
        consumerKind: "runtime-validator",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "CVA source-path exemptions are intentionally empty by default and reviewed when added.",
      }),
    ],
  })
)

export const importPolicyManifestFields = Object.freeze(
  importPolicyManifest.entries.map((entry) => entry.field)
)

export const importPolicyCanonicalFields = Object.freeze(
  Object.keys(importPolicy) as ImportPolicyField[]
)

export type ImportPolicyManifest = typeof importPolicyManifest
