import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  AFENDA_UI_RULE_IDS_OUTSIDE_CLASS_POLICY_MANIFEST,
  type ClassPolicyEslintRuleManifestEntry,
  classPolicyEslintRuleManifest,
  parseAfendaUiRuleIdToPluginKey,
} from "./class-policy-eslint-rule-manifest"
import {
  classPolicyCanonicalFields,
  classPolicyManifest,
  classPolicyManifestFields,
} from "./class-policy-manifest"
import {
  componentPolicyCanonicalFields,
  componentPolicyManifest,
  componentPolicyManifestFields,
} from "./component-policy-manifest"
import {
  importPolicyCanonicalFields,
  importPolicyManifest,
  importPolicyManifestFields,
} from "./import-policy-manifest"
import {
  metadataUiPolicyCanonicalFields,
  metadataUiPolicyManifest,
  metadataUiPolicyManifestFields,
} from "./metadata-ui-policy-manifest"
import {
  ownershipPolicyCanonicalFields,
  ownershipPolicyManifest,
  ownershipPolicyManifestFields,
} from "./ownership-policy-manifest"
import {
  radixContractPolicyCanonicalFields,
  radixContractPolicyManifest,
  radixContractPolicyManifestFields,
} from "./radix-contract-policy-manifest"
import {
  radixPolicyCanonicalFields,
  radixPolicyManifest,
  radixPolicyManifestFields,
} from "./radix-policy-manifest"
import {
  reactPolicyCanonicalFields,
  reactPolicyManifest,
  reactPolicyManifestFields,
} from "./react-policy-manifest"
import {
  shadcnPolicyCanonicalFields,
  shadcnPolicyManifest,
  shadcnPolicyManifestFields,
} from "./shadcn-policy-manifest"
import {
  tailwindPolicyCanonicalFields,
  tailwindPolicyManifest,
  tailwindPolicyManifestFields,
} from "./tailwind-policy-manifest"
import {
  styleBindingPolicyCanonicalFields,
  styleBindingPolicyManifest,
  styleBindingPolicyManifestFields,
} from "./style-binding-policy-manifest"

export type PolicyManifestIssueSeverity = "error" | "warning"

export interface PolicyManifestIssue {
  severity: PolicyManifestIssueSeverity
  code: string
  field?: string
  message: string
}

export interface PolicyManifestValidationReport {
  ok: boolean
  errors: readonly PolicyManifestIssue[]
  warnings: readonly PolicyManifestIssue[]
}

function pushIssue(
  list: PolicyManifestIssue[],
  severity: PolicyManifestIssueSeverity,
  code: string,
  message: string,
  field?: string
): void {
  list.push({ severity, code, message, field })
}

function parseIsoDateOrNull(value: string | null): Date | null {
  if (value == null) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

interface ManifestCoverageInput {
  policyLabel: string
  canonicalFields: readonly string[]
  manifestFields: readonly string[]
  entries: ReadonlyArray<{
    field: string
    lifecycle: "enforced" | "review-only" | "backlog" | "deprecated"
    consumers: readonly string[]
    fixtureCoverage: { valid: boolean; invalid: boolean; edge: boolean }
    fixturePaths: {
      valid: readonly string[]
      invalid: readonly string[]
      edge: readonly string[]
    }
    compatibilityOnly: boolean
    legacySunset: string | null
  }>
}

interface PolicyManifestRegistryEntry {
  policyLabel: string
  canonicalFields: readonly string[]
  manifestFields: readonly string[]
  entries: ManifestCoverageInput["entries"]
}

function validateManifestCoverage(
  input: ManifestCoverageInput
): PolicyManifestValidationReport {
  const issues: PolicyManifestIssue[] = []

  const manifestFieldSet = new Set<string>(input.manifestFields)
  const canonicalFieldSet = new Set<string>(input.canonicalFields)

  for (const field of input.canonicalFields) {
    if (!manifestFieldSet.has(field)) {
      pushIssue(
        issues,
        "error",
        "missing_manifest_entry",
        `Canonical ${input.policyLabel} field "${field}" is missing from ${input.policyLabel} manifest.`,
        field
      )
    }
  }

  for (const entry of input.entries) {
    if (!canonicalFieldSet.has(entry.field)) {
      pushIssue(
        issues,
        "error",
        "unknown_manifest_field",
        `Manifest field "${entry.field}" is not a canonical ${input.policyLabel} field.`,
        entry.field
      )
    }

    if (
      entry.lifecycle === "review-only" &&
      entry.consumers.length === 0
    ) {
      pushIssue(
        issues,
        "warning",
        "review_only_missing_consumer",
        `Review-only field "${entry.field}" has no linked consumers.`,
        entry.field
      )
    }

    if (
      entry.fixtureCoverage.valid &&
      entry.fixturePaths.valid.length === 0
    ) {
      pushIssue(
        issues,
        "warning",
        "fixture_paths_missing_valid",
        `Field "${entry.field}" marks valid fixture coverage but has no fixturePaths.valid entries.`,
        entry.field
      )
    }
    if (
      entry.fixtureCoverage.invalid &&
      entry.fixturePaths.invalid.length === 0
    ) {
      pushIssue(
        issues,
        "warning",
        "fixture_paths_missing_invalid",
        `Field "${entry.field}" marks invalid fixture coverage but has no fixturePaths.invalid entries.`,
        entry.field
      )
    }
    if (entry.fixtureCoverage.edge && entry.fixturePaths.edge.length === 0) {
      pushIssue(
        issues,
        "warning",
        "fixture_paths_missing_edge",
        `Field "${entry.field}" marks edge fixture coverage but has no fixturePaths.edge entries.`,
        entry.field
      )
    }

    if (entry.compatibilityOnly && entry.legacySunset != null) {
      const sunsetDate = parseIsoDateOrNull(entry.legacySunset)
      if (sunsetDate == null) {
        pushIssue(
          issues,
          "warning",
          "legacy_sunset_not_iso",
          `compatibilityOnly field "${entry.field}" has a non-ISO legacySunset value.`,
          entry.field
        )
      } else if (sunsetDate.getTime() < Date.now()) {
        pushIssue(
          issues,
          "warning",
          "legacy_sunset_elapsed",
          `compatibilityOnly field "${entry.field}" is past legacySunset (${entry.legacySunset}).`,
          entry.field
        )
      }
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warning")
  return {
    ok: errors.length === 0,
    errors,
    warnings,
  }
}

function loadAfendaUiPluginRuleNames(): ReadonlySet<string> | null {
  try {
    const require = createRequire(import.meta.url)
    const registryPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../../../../packages/eslint-config/afenda-ui-plugin/plugin-rule-registry.cjs"
    )
    const mod = require(registryPath) as {
      AFENDA_UI_PLUGIN_RULE_NAMES: readonly string[]
    }
    return new Set(mod.AFENDA_UI_PLUGIN_RULE_NAMES)
  } catch {
    return null
  }
}

/**
 * Ensures every canonical `classPolicy` field is present in the ESLint manifest,
 * each binding lists a real plugin rule for `implemented` / `partial`, `planned`
 * rules are not falsely treated as active, and plugin rules are mapped or exempt.
 */
export function validateClassPolicyEslintRuleManifest(): PolicyManifestValidationReport {
  const issues: PolicyManifestIssue[] = []
  const canonicalSet = new Set<string>(classPolicyCanonicalFields)
  const manifestKeys = Object.keys(
    classPolicyEslintRuleManifest
  ) as (keyof typeof classPolicyEslintRuleManifest)[]

  const pluginRuleNames = loadAfendaUiPluginRuleNames()
  if (pluginRuleNames == null) {
    pushIssue(
      issues,
      "warning",
      "class_policy_eslint_plugin_registry_unresolved",
      "Could not load packages/eslint-config/afenda-ui-plugin/plugin-rule-registry.cjs; skipping rule-id existence checks (run from monorepo with packages/eslint-config present)."
    )
  }

  const exemptPluginKeys = new Set<string>(
    [...AFENDA_UI_RULE_IDS_OUTSIDE_CLASS_POLICY_MANIFEST].map((id) =>
      parseAfendaUiRuleIdToPluginKey(id)
    )
  )

  /** Every rule name mentioned in the manifest (all statuses). */
  const manifestReferencedPluginKeys = new Set<string>()

  for (const field of classPolicyCanonicalFields) {
    if (!(field in classPolicyEslintRuleManifest)) {
      pushIssue(
        issues,
        "error",
        "class_policy_eslint_manifest_missing_field",
        `classPolicyEslintRuleManifest is missing canonical classPolicy field "${field}".`,
        field
      )
      continue
    }

    const entry: ClassPolicyEslintRuleManifestEntry =
      classPolicyEslintRuleManifest[field]
    if (!Array.isArray(entry.rules) || entry.rules.length < 1) {
      pushIssue(
        issues,
        "error",
        "class_policy_eslint_manifest_empty_rules",
        `classPolicyEslintRuleManifest["${field}"].rules must list at least one rule binding.`,
        field
      )
    }

    for (const binding of entry.rules) {
      const key = parseAfendaUiRuleIdToPluginKey(binding.ruleId)
      manifestReferencedPluginKeys.add(key)

      if (pluginRuleNames == null) continue

      const inPlugin = pluginRuleNames.has(key)

      if (binding.status === "planned" && inPlugin) {
        pushIssue(
          issues,
          "warning",
          "class_policy_eslint_planned_rule_already_registered",
          `Rule "${binding.ruleId}" is marked planned but already exists in the afenda-ui plugin — update status to implemented or partial.`,
          field
        )
      }

      if (!inPlugin && binding.status !== "planned") {
        pushIssue(
          issues,
          "error",
          "class_policy_eslint_manifest_rule_missing_in_plugin",
          `Rule "${binding.ruleId}" is marked ${binding.status} but is not registered in packages/eslint-config/afenda-ui-plugin (see plugin-rule-registry.cjs).`,
          field
        )
      }
    }
  }

  for (const key of manifestKeys) {
    if (!canonicalSet.has(key)) {
      pushIssue(
        issues,
        "error",
        "class_policy_eslint_manifest_unknown_field",
        `classPolicyEslintRuleManifest has unknown field "${String(key)}" (not a canonical classPolicy key).`,
        String(key)
      )
    }
  }

  if (manifestKeys.length !== classPolicyCanonicalFields.length) {
    pushIssue(
      issues,
      "error",
      "class_policy_eslint_manifest_key_mismatch",
      `classPolicyEslintRuleManifest key count (${manifestKeys.length}) does not match canonical classPolicy fields (${classPolicyCanonicalFields.length}).`
    )
  }

  if (pluginRuleNames != null) {
    for (const pluginKey of pluginRuleNames) {
      if (exemptPluginKeys.has(pluginKey)) continue
      if (!manifestReferencedPluginKeys.has(pluginKey)) {
        pushIssue(
          issues,
          "warning",
          "class_policy_eslint_plugin_rule_not_in_manifest",
          `afenda-ui plugin rule "${pluginKey}" is not referenced in classPolicyEslintRuleManifest (add a binding or list it in AFENDA_UI_RULE_IDS_OUTSIDE_CLASS_POLICY_MANIFEST if intentional).`
        )
      }
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warning")
  return {
    ok: errors.length === 0,
    errors,
    warnings,
  }
}

export function validatePolicyManifest(): PolicyManifestValidationReport {
  const classEslintRuleReport = validateClassPolicyEslintRuleManifest()

  const manifestRegistry: readonly PolicyManifestRegistryEntry[] = [
    {
      policyLabel: "classPolicy",
      canonicalFields: classPolicyCanonicalFields,
      manifestFields: classPolicyManifestFields,
      entries: classPolicyManifest.entries,
    },
    {
      policyLabel: "componentPolicyContract",
      canonicalFields: componentPolicyCanonicalFields,
      manifestFields: componentPolicyManifestFields,
      entries: componentPolicyManifest.entries,
    },
    {
      policyLabel: "importPolicy",
      canonicalFields: importPolicyCanonicalFields,
      manifestFields: importPolicyManifestFields,
      entries: importPolicyManifest.entries,
    },
    {
      policyLabel: "metadataUiPolicy",
      canonicalFields: metadataUiPolicyCanonicalFields,
      manifestFields: metadataUiPolicyManifestFields,
      entries: metadataUiPolicyManifest.entries,
    },
    {
      policyLabel: "ownershipPolicy",
      canonicalFields: ownershipPolicyCanonicalFields,
      manifestFields: ownershipPolicyManifestFields,
      entries: ownershipPolicyManifest.entries,
    },
    {
      policyLabel: "radixPolicy",
      canonicalFields: radixPolicyCanonicalFields,
      manifestFields: radixPolicyManifestFields,
      entries: radixPolicyManifest.entries,
    },
    {
      policyLabel: "radixContractPolicy",
      canonicalFields: radixContractPolicyCanonicalFields,
      manifestFields: radixContractPolicyManifestFields,
      entries: radixContractPolicyManifest.entries,
    },
    {
      policyLabel: "reactPolicy",
      canonicalFields: reactPolicyCanonicalFields,
      manifestFields: reactPolicyManifestFields,
      entries: reactPolicyManifest.entries,
    },
    {
      policyLabel: "shadcnPolicy",
      canonicalFields: shadcnPolicyCanonicalFields,
      manifestFields: shadcnPolicyManifestFields,
      entries: shadcnPolicyManifest.entries,
    },
    {
      policyLabel: "tailwindPolicy",
      canonicalFields: tailwindPolicyCanonicalFields,
      manifestFields: tailwindPolicyManifestFields,
      entries: tailwindPolicyManifest.entries,
    },
    {
      policyLabel: "styleBindingPolicy",
      canonicalFields: styleBindingPolicyCanonicalFields,
      manifestFields: styleBindingPolicyManifestFields,
      entries: styleBindingPolicyManifest.entries,
    },
  ]

  const coverageReports = manifestRegistry.map((entry) =>
    validateManifestCoverage(entry)
  )

  const errors = [
    ...classEslintRuleReport.errors,
    ...coverageReports.flatMap((report) => report.errors),
  ]
  const warnings = [
    ...classEslintRuleReport.warnings,
    ...coverageReports.flatMap((report) => report.warnings),
  ]
  return {
    ok: errors.length === 0,
    errors,
    warnings,
  }
}
