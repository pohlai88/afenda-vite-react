/**
 * GOVERNANCE VALIDATOR — validate-constants
 * Validates that governed constant registries, rule policy, and governance policies
 * remain internally consistent.
 * Scope: aggregate registry shape, governed vocabularies, rule-policy contract integrity,
 *   and cross-policy referential consistency (ownership, import, shadcn, radix, tailwind, react).
 * Runtime: validation boundary for authored constants, not a replacement for canonical authoring.
 * Consumption: use from tests, CI, scripts, or startup assertions where constant integrity matters.
 * Changes: keep validation deterministic, explicit, and reviewable.
 * Constraints: do not hide drift with implicit defaults or silent recovery.
 * Purpose: fail fast when the governed constant layer becomes inconsistent.
 */
import { z } from "zod/v4"

import {
  ruleCodeToEslintRule,
  ruleCodeToEslintRuleSchema,
  uiDriftRulePolicy,
  uiDriftRulePolicySchema,
  validateUiDriftRulePolicyLinks,
} from "./rule-policy"
import {
  componentRegistry,
  componentRegistrySchema,
  type ComponentRegistrySnapshot,
  semanticRegistry,
  semanticRegistrySchema,
  type SemanticRegistrySnapshot,
} from "./registry"
import { classPolicy } from "./policy/class-policy"
import { validatePolicyManifest } from "./policy/validate-policy-manifest"
import {
  componentPolicy,
  componentPolicyContract,
  componentPolicyEnforcementValues,
  componentPolicyScopeValues,
} from "./policy/component-policy"
import { importPolicy } from "./policy/import-policy"
import { ownershipPolicy } from "./policy/ownership-policy"
import { radixContractPolicy, radixPolicy } from "./policy/radix-policy"
import { reactPolicy } from "./policy/react-policy"
import { shadcnPolicy } from "./policy/shadcn-policy"
import { tailwindPolicy } from "./policy/tailwind-policy"
import {
  shellContextPolicy,
  shellPolicy,
  shellScopeValues,
  shellZoneValues,
} from "./policy/shell"
import {
  shellMetadataDefaults,
  shellMetadataSchema,
} from "./policy/shell/contract/shell-metadata-contract"
import {
  shellComponentContract,
  shellComponentContractDefaults,
  shellComponentContractSchema,
  type ShellComponentContract,
} from "./policy/shell/contract/shell-component-contract"
import {
  shellComponentRegistry,
  shellComponentRegistrySchema,
  type ShellComponentRegistry,
  type ShellComponentRegistryKey,
} from "./policy/shell/registry/shell-component-registry"
import { validateShellPolicyConsistency } from "./policy/shell/validation/validate-shell-policy-consistency"
import { validateShellStatePolicy } from "./policy/shell/validation/validate-shell-state-policy"
import { validateShellRegistry } from "./policy/shell/validation/validate-shell-registry"
import { validateShellRuntimeContracts } from "./policy/shell/validation/validate-shell-runtime-contracts"
import {
  metadataUiPolicy,
} from "./policy/metadata-ui"
import {
  styleBindingPolicy,
  globalStyleOwnerValues,
} from "./policy/style-binding"
import { layoutPolicy } from "./foundation/layout"

export type ComponentRegistryValidation = ComponentRegistrySnapshot
export type SemanticRegistryValidation = SemanticRegistrySnapshot

export const constantLayerValidationSchema = z
  .object({
    componentRegistry: componentRegistrySchema,
    ruleCodeToEslintRule: ruleCodeToEslintRuleSchema,
    semanticRegistry: semanticRegistrySchema,
    uiDriftRulePolicy: uiDriftRulePolicySchema,
  })
  .strict()
export type ConstantLayerValidation = z.infer<
  typeof constantLayerValidationSchema
>

function assertBoolean(value: unknown, label: string): void {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean, got ${typeof value}`)
  }
}

function assertEnum(
  value: unknown,
  allowed: readonly string[],
  label: string
): void {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(
      `${label} must be one of [${allowed.join(", ")}], got "${String(value)}"`
    )
  }
}

function assertAllBooleans(
  policy: Readonly<Record<string, unknown>>,
  keys: readonly string[],
  policyName: string
): void {
  for (const key of keys) {
    assertBoolean(policy[key], `${policyName}.${key}`)
  }
}

function assertUniqueStrings(values: readonly string[], label: string): void {
  const seen = new Set<string>()
  for (const value of values) {
    const normalized = value.trim()
    if (seen.has(normalized)) {
      throw new Error(`${label} contains duplicate entry: "${normalized}"`)
    }
    seen.add(normalized)
  }
}

function assertSortedStrings(values: readonly string[], label: string): void {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i - 1] > values[i]) {
      throw new Error(
        `${label} must be sorted in ascending lexicographic order for deterministic diffs`
      )
    }
  }
}

function hasKeyAndComponentName(
  value: unknown
): value is { key: string; componentName: string } {
  if (typeof value !== "object" || value == null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.key === "string" &&
    candidate.key.length > 0 &&
    typeof candidate.componentName === "string" &&
    candidate.componentName.length > 0
  )
}

function validateOwnershipPolicy(): void {
  assertUniqueStrings(
    ownershipPolicy.uiOwnerRoots,
    "ownershipPolicy.uiOwnerRoots"
  )
  assertUniqueStrings(
    ownershipPolicy.wrapperContractScanRoots,
    "ownershipPolicy.wrapperContractScanRoots"
  )
  assertUniqueStrings(
    ownershipPolicy.productRoots,
    "ownershipPolicy.productRoots"
  )
  assertUniqueStrings(
    ownershipPolicy.semanticOwnerRoots,
    "ownershipPolicy.semanticOwnerRoots"
  )
  assertUniqueStrings(
    ownershipPolicy.tokenOwnerFiles,
    "ownershipPolicy.tokenOwnerFiles"
  )
  assertUniqueStrings(
    ownershipPolicy.inlineStyleExceptionRoots,
    "ownershipPolicy.inlineStyleExceptionRoots"
  )

  for (const root of ownershipPolicy.wrapperContractScanRoots) {
    if (!ownershipPolicy.uiOwnerRoots.includes(root)) {
      throw new Error(
        `ownershipPolicy.wrapperContractScanRoots entry "${root}" is not listed in uiOwnerRoots`
      )
    }
  }
}

function validateImportPolicy(): void {
  assertUniqueStrings(
    importPolicy.bannedImportPrefixes,
    "importPolicy.bannedImportPrefixes"
  )
  assertUniqueStrings(
    importPolicy.bannedExactImportPaths,
    "importPolicy.bannedExactImportPaths"
  )
  assertUniqueStrings(
    importPolicy.bannedImportPatternLabels,
    "importPolicy.bannedImportPatternLabels"
  )
  assertUniqueStrings(
    importPolicy.allowedCnImportPaths,
    "importPolicy.allowedCnImportPaths"
  )
  assertUniqueStrings(
    importPolicy.governedUiOwnerSourcePathPrefixes,
    "importPolicy.governedUiOwnerSourcePathPrefixes"
  )
  assertUniqueStrings(
    importPolicy.allowedLocalCnImportSourcePathPrefixes,
    "importPolicy.allowedLocalCnImportSourcePathPrefixes"
  )
  assertUniqueStrings(
    importPolicy.directRadixImportAllowedSourcePathPrefixes,
    "importPolicy.directRadixImportAllowedSourcePathPrefixes"
  )
  assertUniqueStrings(
    importPolicy.cvaImportAllowedSourcePathPrefixes,
    "importPolicy.cvaImportAllowedSourcePathPrefixes"
  )
}

function validateRadixPolicy(): void {
  assertUniqueStrings(
    radixPolicy.allowedPrimitivePackages,
    "radixPolicy.allowedPrimitivePackages"
  )
}

function validateRadixContractPolicy(): void {
  assertAllBooleans(
    radixContractPolicy,
    [
      "requirePropsSpreadToPrimitive",
      "requireRefForwardingOrExplicitRefPassThrough",
      "requirePrimitiveRenderInWrapper",
      "warnOnLocalStateReplacingPrimitiveBehavior",
      "warnOnSuspiciousAsChildContractDrift",
    ],
    "radixContractPolicy"
  )
}

function validateReactPolicy(): void {
  assertUniqueStrings(reactPolicy.bannedPatterns, "reactPolicy.bannedPatterns")
}

function validateTailwindPolicy(): void {
  assertUniqueStrings(
    tailwindPolicy.allowedArbitraryValueFragments,
    "tailwindPolicy.allowedArbitraryValueFragments"
  )
  assertUniqueStrings(
    tailwindPolicy.allowedSelectorFragments,
    "tailwindPolicy.allowedSelectorFragments"
  )
}

function validateShellContextPolicy(): void {
  assertEnum(
    shellContextPolicy.defaultShellScope,
    shellScopeValues,
    "shellContextPolicy.defaultShellScope"
  )
  assertAllBooleans(
    shellContextPolicy,
    [
      "requireShellProvider",
      "requireAuthProvider",
      "requireLocaleProvider",
      "requireThemeProvider",
      "requireTenantProviderInTenantScope",
      "requireUserProviderInTenantScope",
      "requireTenantIsolationBinding",
      "requireOperatorScopeSeparation",
    ],
    "shellContextPolicy"
  )
}

function validateShellPolicy(): void {
  assertEnum(
    shellPolicy.defaultComponentZone,
    shellZoneValues,
    "shellPolicy.defaultComponentZone"
  )
  assertAllBooleans(
    shellPolicy,
    [
      "requireShellMetadataProvider",
      "requireNavigationContext",
      "requireCommandInfrastructure",
      "requireLayoutDensityContext",
      "requireResponsiveShellLayout",
      "allowFeatureLevelShellZoneFork",
      "allowFeatureLevelShellMetadataFork",
      "allowFeatureLevelNavigationContextFork",
      "allowFeatureLevelCommandInfrastructureFork",
      "allowFeatureLevelDensityVocabularyFork",
      "allowFeatureLevelViewportVocabularyFork",
    ],
    "shellPolicy"
  )
}

function validateShellMetadataContract(): void {
  shellMetadataSchema.parse(shellMetadataDefaults)

  if (shellMetadataDefaults.zone !== shellPolicy.defaultComponentZone) {
    throw new Error(
      "shellMetadataDefaults.zone must match shellPolicy.defaultComponentZone for canonical shell fallback consistency."
    )
  }
}

function validateShellComponentContract(): void {
  shellComponentContractSchema.parse(shellComponentContract)
  void shellComponentContractDefaults

  const componentNameToRegistryKey = new Map<string, string>()
  for (const [componentKey, entry] of Object.entries(shellComponentContract)) {
    if (entry.key !== componentKey) {
      throw new Error(
        `shellComponentContract.${componentKey}.key must match the registry key (${componentKey}).`
      )
    }

    const priorKey = componentNameToRegistryKey.get(entry.componentName)
    if (priorKey !== undefined) {
      throw new Error(
        `shellComponentContract has duplicate componentName "${entry.componentName}" (${priorKey} and ${componentKey}).`
      )
    }
    componentNameToRegistryKey.set(entry.componentName, componentKey)

    if (
      entry.participation.shellMetadata === "required" &&
      !shellPolicy.requireShellMetadataProvider
    ) {
      throw new Error(
        `shellComponentContract.${componentKey}.participation.shellMetadata is "required" but shellPolicy.requireShellMetadataProvider is false.`
      )
    }
    if (
      entry.participation.navigationContext === "required" &&
      !shellPolicy.requireNavigationContext
    ) {
      throw new Error(
        `shellComponentContract.${componentKey}.participation.navigationContext is "required" but shellPolicy.requireNavigationContext is false.`
      )
    }
    if (
      entry.participation.commandInfrastructure === "required" &&
      !shellPolicy.requireCommandInfrastructure
    ) {
      throw new Error(
        `shellComponentContract.${componentKey}.participation.commandInfrastructure is "required" but shellPolicy.requireCommandInfrastructure is false.`
      )
    }
    if (
      entry.participation.layoutDensity === "required" &&
      !shellPolicy.requireLayoutDensityContext
    ) {
      throw new Error(
        `shellComponentContract.${componentKey}.participation.layoutDensity is "required" but shellPolicy.requireLayoutDensityContext is false.`
      )
    }
    if (
      entry.participation.responsiveShell === "required" &&
      !shellPolicy.requireResponsiveShellLayout
    ) {
      throw new Error(
        `shellComponentContract.${componentKey}.participation.responsiveShell is "required" but shellPolicy.requireResponsiveShellLayout is false.`
      )
    }
  }
}

function validateShellComponentRegistry(): void {
  const parsedRegistry: ShellComponentRegistry =
    shellComponentRegistrySchema.parse(shellComponentRegistry)
  const parsedContract: ShellComponentContract =
    shellComponentContractSchema.parse(shellComponentContract)

  for (const registryKey of Object.keys(parsedRegistry) as ShellComponentRegistryKey[]) {
    const entryValue: unknown = parsedRegistry[registryKey]
    const contractValue: unknown = parsedContract[registryKey]
    if (!contractValue) {
      throw new Error(
        `shellComponentRegistry.${registryKey} is missing corresponding shellComponentContract entry.`
      )
    }

    if (!hasKeyAndComponentName(entryValue) || !hasKeyAndComponentName(contractValue)) {
      throw new Error(
        `shellComponentRegistry.${registryKey} and shellComponentContract.${registryKey} must include key/componentName strings.`
      )
    }

    const entry = entryValue
    const contractEntry = contractValue

    if (entry.key !== contractEntry.key || entry.componentName !== contractEntry.componentName) {
      throw new Error(
        `shellComponentRegistry.${registryKey} must match shellComponentContract.${registryKey} key/componentName.`
      )
    }
  }

  const shellRegistryReport = validateShellRegistry()
  if (!shellRegistryReport.ok) {
    const firstIssue = shellRegistryReport.issues[0]
    if (firstIssue) {
      throw new Error(
        `shell registry validation failed (${firstIssue.code}) at ${firstIssue.registryKey}: ${firstIssue.message}`
      )
    }
    throw new Error("shell registry validation failed with unknown issue.")
  }

  const shellPolicyConsistency = validateShellPolicyConsistency()
  if (!shellPolicyConsistency.ok) {
    const first = shellPolicyConsistency.issues[0]
    if (first) {
      throw new Error(`shell policy consistency failed (${first.code}): ${first.message}`)
    }
    throw new Error("shell policy consistency validation failed.")
  }

  const shellStatePolicyReport = validateShellStatePolicy()
  if (!shellStatePolicyReport.ok) {
    const first = shellStatePolicyReport.issues[0]
    if (first) {
      const loc =
        first.file !== undefined && first.line !== undefined
          ? ` at ${first.file}:${first.line}`
          : ""
      throw new Error(`shell state policy validation failed (${first.code})${loc}: ${first.message}`)
    }
    throw new Error("shell state policy validation failed.")
  }

  const shellRuntimeContracts = validateShellRuntimeContracts()
  if (!shellRuntimeContracts.ok) {
    const first = shellRuntimeContracts.issues[0]
    if (first) {
      throw new Error(`shell runtime contract validation failed (${first.code}): ${first.message}`)
    }
    throw new Error("shell runtime contract validation failed.")
  }
}

function validateMetadataUiPolicy(): void {
  const policy = metadataUiPolicy

  if (policy.allowedSemanticSources.length === 0) {
    throw new Error(
      "metadataUiPolicy.allowedSemanticSources must contain at least one source"
    )
  }

  if (policy.defaultSemanticSources.length === 0) {
    throw new Error(
      "metadataUiPolicy.defaultSemanticSources must contain at least one source"
    )
  }

  assertUniqueStrings(
    policy.allowedSemanticSources,
    "metadataUiPolicy.allowedSemanticSources"
  )
  assertUniqueStrings(
    policy.defaultSemanticSources,
    "metadataUiPolicy.defaultSemanticSources"
  )

  const allowedSources = new Set<string>(policy.allowedSemanticSources)

  for (const source of policy.defaultSemanticSources) {
    if (!allowedSources.has(source)) {
      throw new Error(
        `metadataUiPolicy.defaultSemanticSources contains "${source}" which is not present in allowedSemanticSources`
      )
    }
  }

  const booleanFields = [
    "allowDomainToUiSemanticMapping",
    "allowInvariantToUiSemanticMapping",
    "allowShellToUiDensityMapping",
    "allowShellToUiPriorityMapping",
    "allowMetadataDrivenVisibility",
    "allowMetadataDrivenAffordance",
    "allowMetadataDrivenSeverity",
    "allowMetadataDrivenEvidencePresentation",
    "allowMetadataDrivenRemediationUi",
    "allowMetadataDrivenInteractionMode",
    "allowMetadataDrivenLayoutMode",
    "allowMetadataDrivenActionAvailability",
    "allowMetadataDrivenDisclosureMode",
    "allowFeatureLevelMetadataToStyleFork",
    "allowFeatureLevelDomainToneMap",
    "allowInlineMetadataToTokenMappingInFeatures",
    "requireSemanticTokenBinding",
    "requireMetadataMappingToUseGovernedLayer",
    "requireMetadataNormalizationBeforeRendering",
    "requireMetadataAdaptersForCrossDomainBindings",
  ] as const

  for (const field of booleanFields) {
    if (typeof policy[field] !== "boolean") {
      throw new Error(`metadataUiPolicy.${field} must be boolean`)
    }
  }

  if (
    policy.requireMetadataNormalizationBeforeRendering &&
    !policy.requireMetadataMappingToUseGovernedLayer
  ) {
    throw new Error(
      "metadataUiPolicy.requireMetadataNormalizationBeforeRendering cannot be true when requireMetadataMappingToUseGovernedLayer is false"
    )
  }

  if (
    policy.requireMetadataAdaptersForCrossDomainBindings &&
    !policy.requireMetadataMappingToUseGovernedLayer
  ) {
    throw new Error(
      "metadataUiPolicy.requireMetadataAdaptersForCrossDomainBindings cannot be true when requireMetadataMappingToUseGovernedLayer is false"
    )
  }

  if (
    policy.requireMetadataAdaptersForCrossDomainBindings &&
    !policy.requireMetadataNormalizationBeforeRendering
  ) {
    throw new Error(
      "metadataUiPolicy.requireMetadataAdaptersForCrossDomainBindings cannot be true when requireMetadataNormalizationBeforeRendering is false"
    )
  }

  if (
    policy.requireSemanticTokenBinding &&
    policy.defaultStyleBindingMode === "none"
  ) {
    throw new Error(
      'metadataUiPolicy.defaultStyleBindingMode cannot be "none" when requireSemanticTokenBinding is true'
    )
  }

  if (
    policy.allowInlineMetadataToTokenMappingInFeatures &&
    policy.requireMetadataMappingToUseGovernedLayer
  ) {
    throw new Error(
      "metadataUiPolicy.allowInlineMetadataToTokenMappingInFeatures cannot be true when requireMetadataMappingToUseGovernedLayer is true"
    )
  }
}

function validateStyleBindingPolicy(): void {
  assertUniqueStrings(
    styleBindingPolicy.allowedGlobalStyleOwners,
    "styleBindingPolicy.allowedGlobalStyleOwners"
  )
  assertSortedStrings(
    styleBindingPolicy.allowedGlobalStyleOwners,
    "styleBindingPolicy.allowedGlobalStyleOwners"
  )
  for (const owner of styleBindingPolicy.allowedGlobalStyleOwners) {
    assertEnum(
      owner,
      globalStyleOwnerValues,
      "styleBindingPolicy.allowedGlobalStyleOwners[]"
    )
  }
  const allowedOwners = new Set(styleBindingPolicy.allowedGlobalStyleOwners)
  if (!allowedOwners.has(styleBindingPolicy.primaryGlobalStyleOwner)) {
    throw new Error(
      "styleBindingPolicy.primaryGlobalStyleOwner must be included in styleBindingPolicy.allowedGlobalStyleOwners"
    )
  }
  assertEnum(
    styleBindingPolicy.primaryGlobalStyleOwner,
    globalStyleOwnerValues,
    "styleBindingPolicy.primaryGlobalStyleOwner"
  )
  if (
    styleBindingPolicy.requireGlobalTokenLayer &&
    !styleBindingPolicy.requireSemanticColorSlots
  ) {
    throw new Error(
      "styleBindingPolicy.requireSemanticColorSlots must be true when requireGlobalTokenLayer is true"
    )
  }
  assertAllBooleans(
    styleBindingPolicy,
    [
      "requireGlobalTokenLayer",
      "requireSemanticColorSlots",
      "requireShellVariableLayer",
      "requireDensityVariableLayer",
      "allowComponentLocalSemanticColorDefinition",
      "allowFeatureLevelGlobalStyleFork",
      "allowFeatureLevelTokenAliasFork",
      "requireComponentsToConsumeTokenOutputs",
      "requireMetadataBoundStylesToUseGlobalLayer",
    ],
    "styleBindingPolicy"
  )
}

function validateClassPolicy(): void {
  assertAllBooleans(
    classPolicy,
    [
      "allowRawPaletteClasses",
      "allowArbitraryValuesInFeatures",
      "allowInlineStyleAttributeInProductUi",
      "allowHexRgbHslColorsInProductUi",
      "allowCvaOutsideUiPackage",
      "allowDirectRadixImportOutsideUiPackage",
      "allowDirectTokenUsageInFeatures",
      "allowAsChildOutsideUiPackage",
      "allowSlotOutsideUiPackage",
      "allowFeatureLevelVariantMaps",
      "allowFeatureLevelStatusToClassMapping",
      "allowFeatureLevelSemanticColorMapping",
      "allowFeatureLevelTruthToVariantMapping",
      "allowArbitraryZIndex",
      "allowPositioningUtilities",
      "allowGridTemplateOverrides",
      "allowClassNamePassThrough",
      "allowCnComposition",
    ],
    "classPolicy"
  )
  const nonNegativeIntFields = [
    "maxRecommendedClassNameTokensInFeatures",
    "warnClassNameTokenCount",
    "errorClassNameTokenCount",
  ] as const
  for (const key of nonNegativeIntFields) {
    const n = classPolicy[key]
    if (typeof n !== "number" || n < 0 || !Number.isInteger(n)) {
      throw new Error(
        `classPolicy.${key} must be a non-negative integer, got ${String(n)}`
      )
    }
  }
  if (classPolicy.errorClassNameTokenCount < classPolicy.warnClassNameTokenCount) {
    throw new Error(
      `classPolicy.errorClassNameTokenCount (${classPolicy.errorClassNameTokenCount}) must be >= warnClassNameTokenCount (${classPolicy.warnClassNameTokenCount}).`
    )
  }
  const scopeKeys = [
    "uiPackage",
    "featureUi",
    "sharedAppUi",
    "appShell",
    "chartInterop",
    "richContent",
  ] as const
  for (const sk of scopeKeys) {
    const hints = classPolicy.scopes[sk]
    if (hints == null) continue
    for (const nk of [
      "maxRecommendedClassNameTokens",
      "warnClassNameTokenCount",
      "errorClassNameTokenCount",
    ] as const) {
      const v = hints[nk]
      if (v === undefined) continue
      if (typeof v !== "number" || v < 0 || !Number.isInteger(v)) {
        throw new Error(
          `classPolicy.scopes.${sk}.${nk} must be a non-negative integer when set, got ${String(v)}`
        )
      }
    }
    const w = hints.warnClassNameTokenCount
    const e = hints.errorClassNameTokenCount
    if (
      w != null &&
      e != null &&
      e < w
    ) {
      throw new Error(
        `classPolicy.scopes.${sk}: errorClassNameTokenCount must be >= warnClassNameTokenCount when both are set.`
      )
    }
  }
}

function validateComponentPolicy(): void {
  assertAllBooleans(
    componentPolicy,
    [
      "allowFeatureLevelVariantDefinition",
      "allowFeatureLevelSemanticMaps",
      "requireSemanticMappingForDomainStatuses",
      "requireSharedEmptyStatePattern",
      "requireSharedLoadingStatePattern",
      "requireSingleGovernedPrimitivePerComponentType",
      "requireGovernedComponentsInFeatures",
      "requireGovernedDomainToUiMapping",
    ],
    "componentPolicy"
  )

  for (const [field, rule] of Object.entries(componentPolicyContract)) {
    assertBoolean(rule.allowed, `componentPolicyContract.${field}.allowed`)
    assertEnum(
      rule.enforcement,
      componentPolicyEnforcementValues,
      `componentPolicyContract.${field}.enforcement`
    )
    assertEnum(
      rule.scope,
      componentPolicyScopeValues,
      `componentPolicyContract.${field}.scope`
    )
    if (rule.rationale.trim().length === 0) {
      throw new Error(
        `componentPolicyContract.${field}.rationale must be a non-empty string.`
      )
    }
  }
}

function validateLayoutPolicy(): void {
  assertAllBooleans(
    layoutPolicy,
    [
      "allowFeatureLevelGridTaxonomy",
      "allowFeatureLevelTrackDefinitions",
      "allowFeatureLevelGapOverride",
    ],
    "layoutPolicy"
  )
}

function validateCrossPolicyConsistency(): void {
  if (
    shadcnPolicy.allowCvaOutsideUiOwner &&
    !importPolicy.cvaImportAllowedSourcePathPrefixes.length
  ) {
    throw new Error(
      "shadcnPolicy.allowCvaOutsideUiOwner is true but importPolicy.cvaImportAllowedSourcePathPrefixes is empty — " +
        "product code would be allowed CVA but have no approved source-path exemption."
    )
  }

  if (
    radixPolicy.allowDirectPrimitiveImportOutsideUiOwner &&
    !importPolicy.directRadixImportAllowedSourcePathPrefixes.length
  ) {
    throw new Error(
      "radixPolicy.allowDirectPrimitiveImportOutsideUiOwner is true but " +
        "importPolicy.directRadixImportAllowedSourcePathPrefixes is empty — no approved source-path exemption."
    )
  }

  if (
    classPolicy.allowRawPaletteClasses !== tailwindPolicy.allowRawPaletteClasses
  ) {
    throw new Error(
      "classPolicy.allowRawPaletteClasses and tailwindPolicy.allowRawPaletteClasses are out of sync."
    )
  }
  if (
    classPolicy.allowArbitraryValuesInFeatures !==
    tailwindPolicy.allowArbitraryValuesInFeatures
  ) {
    throw new Error(
      "classPolicy.allowArbitraryValuesInFeatures and tailwindPolicy.allowArbitraryValuesInFeatures are out of sync."
    )
  }
  if (
    classPolicy.allowInlineStyleAttributeInProductUi !==
    tailwindPolicy.allowInlineVisualStyleProps
  ) {
    throw new Error(
      "classPolicy.allowInlineStyleAttributeInProductUi and tailwindPolicy.allowInlineVisualStyleProps are out of sync."
    )
  }
  if (
    classPolicy.allowCvaOutsideUiPackage !== shadcnPolicy.allowCvaOutsideUiOwner
  ) {
    throw new Error(
      "classPolicy.allowCvaOutsideUiPackage and shadcnPolicy.allowCvaOutsideUiOwner are out of sync."
    )
  }
  if (
    classPolicy.allowDirectRadixImportOutsideUiPackage !==
    radixPolicy.allowDirectPrimitiveImportOutsideUiOwner
  ) {
    throw new Error(
      "classPolicy.allowDirectRadixImportOutsideUiPackage and " +
        "radixPolicy.allowDirectPrimitiveImportOutsideUiOwner are out of sync."
    )
  }

  if (!radixPolicy.allowAsChild && classPolicy.allowAsChildOutsideUiPackage) {
    throw new Error(
      "classPolicy.allowAsChildOutsideUiPackage cannot be true when radixPolicy.allowAsChild is false."
    )
  }
}

function validateGovernanceManifest(): void {
  const report = validatePolicyManifest()
  if (!report.ok) {
    const first = report.errors[0]
    if (first) {
      const where = first.field != null ? ` (${first.field})` : ""
      throw new Error(
        `policy manifest validation failed (${first.code})${where}: ${first.message}`
      )
    }
    throw new Error("policy manifest validation failed.")
  }
}

export function validateConstantLayer(): ConstantLayerValidation {
  const validation = constantLayerValidationSchema.parse({
    componentRegistry,
    ruleCodeToEslintRule,
    semanticRegistry,
    uiDriftRulePolicy,
  })

  validateUiDriftRulePolicyLinks()
  validateOwnershipPolicy()
  validateImportPolicy()
  validateRadixPolicy()
  validateRadixContractPolicy()
  validateReactPolicy()
  validateTailwindPolicy()
  validateClassPolicy()
  validateComponentPolicy()
  validateLayoutPolicy()
  validateShellContextPolicy()
  validateShellPolicy()
  validateShellMetadataContract()
  validateShellComponentContract()
  validateShellComponentRegistry()
  validateMetadataUiPolicy()
  validateStyleBindingPolicy()
  validateCrossPolicyConsistency()
  validateGovernanceManifest()

  return validation
}
