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
} from "./registry/component-registry"
import {
  semanticRegistry,
  semanticRegistrySchema,
  type SemanticRegistrySnapshot,
} from "./registry/semantic-registry"
import { classPolicy } from "./policy/class-policy"
import { componentPolicy } from "./policy/component-policy"
import { importPolicy } from "./policy/import-policy"
import { ownershipPolicy } from "./policy/ownership-policy"
import { radixContractPolicy, radixPolicy } from "./policy/radix-policy"
import { reactPolicy } from "./policy/react-policy"
import { shadcnPolicy } from "./policy/shadcn-policy"
import { tailwindPolicy } from "./policy/tailwind-policy"
import { shellContextPolicy, shellScopeValues } from "./policy/shell-context"
import { appShellPolicy, shellZoneValues } from "./policy/app-shell"
import {
  metadataUiPolicy,
  metadataSemanticSourceValues,
  styleBindingModeValues,
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
    importPolicy.bannedImportPatterns,
    "importPolicy.bannedImportPatterns"
  )
  assertUniqueStrings(
    importPolicy.allowedCnImportPaths,
    "importPolicy.allowedCnImportPaths"
  )
  assertUniqueStrings(
    importPolicy.directRadixImportAllowlist,
    "importPolicy.directRadixImportAllowlist"
  )
  assertUniqueStrings(
    importPolicy.cvaImportAllowlist,
    "importPolicy.cvaImportAllowlist"
  )
}

function validateRadixPolicy(): void {
  assertUniqueStrings(
    radixPolicy.allowedPrimitivePackages,
    "radixPolicy.allowedPrimitivePackages"
  )

  for (const pkg of radixPolicy.allowedPrimitivePackages) {
    if (!pkg.startsWith("@radix-ui/react-")) {
      throw new Error(
        `radixPolicy.allowedPrimitivePackages entry "${pkg}" does not start with @radix-ui/react-`
      )
    }
  }
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

function validateAppShellPolicy(): void {
  assertEnum(
    appShellPolicy.defaultZone,
    shellZoneValues,
    "appShellPolicy.defaultZone"
  )
  assertAllBooleans(
    appShellPolicy,
    [
      "requireShellMetadataProvider",
      "requireNavigationContext",
      "requireCommandContext",
      "requireLayoutDensityContext",
      "requireViewportAwareness",
      "allowFeatureLevelShellZoneFork",
      "allowFeatureLevelShellMetadataFork",
    ],
    "appShellPolicy"
  )
}

function validateMetadataUiPolicy(): void {
  assertEnum(
    metadataUiPolicy.defaultSemanticSource,
    metadataSemanticSourceValues,
    "metadataUiPolicy.defaultSemanticSource"
  )
  assertEnum(
    metadataUiPolicy.defaultStyleBindingMode,
    styleBindingModeValues,
    "metadataUiPolicy.defaultStyleBindingMode"
  )
  assertAllBooleans(
    metadataUiPolicy,
    [
      "allowDomainToUiSemanticMapping",
      "allowTruthToUiSemanticMapping",
      "allowShellToUiDensityMapping",
      "allowShellToUiPriorityMapping",
      "allowFeatureLevelMetadataToStyleFork",
      "allowFeatureLevelDomainToneMap",
      "requireSemanticTokenBinding",
      "requireMetadataMappingToUseGovernedLayer",
    ],
    "metadataUiPolicy"
  )
}

function validateStyleBindingPolicy(): void {
  assertEnum(
    styleBindingPolicy.primaryGlobalStyleOwner,
    globalStyleOwnerValues,
    "styleBindingPolicy.primaryGlobalStyleOwner"
  )
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
    ],
    "classPolicy"
  )
  if (
    typeof classPolicy.maxRecommendedClassNameTokensInFeatures !== "number" ||
    classPolicy.maxRecommendedClassNameTokensInFeatures < 0
  ) {
    throw new Error(
      `classPolicy.maxRecommendedClassNameTokensInFeatures must be a non-negative integer, got ${classPolicy.maxRecommendedClassNameTokensInFeatures}`
    )
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
      "requireTruthMappingFromGovernedSource",
    ],
    "componentPolicy"
  )
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
    !importPolicy.cvaImportAllowlist.length
  ) {
    throw new Error(
      "shadcnPolicy.allowCvaOutsideUiOwner is true but importPolicy.cvaImportAllowlist is empty — " +
        "product code would be allowed CVA but have no approved import path."
    )
  }

  if (
    radixPolicy.allowDirectPrimitiveImportOutsideUiOwner &&
    !importPolicy.directRadixImportAllowlist.length
  ) {
    throw new Error(
      "radixPolicy.allowDirectPrimitiveImportOutsideUiOwner is true but " +
        "importPolicy.directRadixImportAllowlist is empty — no approved import path."
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
  validateAppShellPolicy()
  validateMetadataUiPolicy()
  validateStyleBindingPolicy()
  validateCrossPolicyConsistency()

  return validation
}
