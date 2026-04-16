const ALLOWED_MANIFEST_KEYS = [
  "owner",
  "lifecycle",
  "purpose",
  "fixtures",
  "a11y",
  "requiredCoverage",
  "policy",
  "deprecation",
  "notes",
] as const

const DISALLOWED_IMPLEMENTATION_DUPLICATE_KEYS = [
  "variants",
  "sizes",
  "defaultVariants",
  "slots",
] as const

export const PRIMITIVE_LIFECYCLES = [
  "draft",
  "beta",
  "stable",
  "deprecated",
] as const

export type PrimitiveLifecycle = (typeof PRIMITIVE_LIFECYCLES)[number]

export interface PrimitiveA11yObligations {
  keyboard?: boolean
  focusRing?: boolean
  screenReader?: boolean
  reducedMotion?: boolean
}

export interface PrimitiveCoverageRequirements {
  unit?: boolean
  visual?: boolean
  keyboard?: boolean
  reducedMotion?: boolean
}

export interface PrimitivePolicyFlags {
  requiresTokenClasses?: boolean
  requiresDataSlot?: boolean
  disallowInlineStyles?: boolean
}

export interface PrimitiveDeprecationMetadata {
  replacement?: string
  since?: string
  removeAfter?: string
  allowlist?: string[]
}

export interface PrimitiveGovernanceManifest {
  owner: string
  lifecycle: PrimitiveLifecycle
  purpose: string
  fixtures?: string[]
  a11y?: PrimitiveA11yObligations
  requiredCoverage?: PrimitiveCoverageRequirements
  policy?: PrimitivePolicyFlags
  deprecation?: PrimitiveDeprecationMetadata
  notes?: string
}

function formatContext(context?: string): string {
  return context ? `[${context}] ` : ""
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assertOptionalBooleanRecord(
  value: unknown,
  context: string,
  fieldName: string
): void {
  if (value === undefined) return
  if (!isPlainObject(value)) {
    throw new Error(`${context}"${fieldName}" must be an object when provided.`)
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (nestedValue !== undefined && typeof nestedValue !== "boolean") {
      throw new Error(
        `${context}"${fieldName}.${key}" must be a boolean when provided.`
      )
    }
  }
}

function assertOptionalStringRecord(
  value: unknown,
  context: string,
  fieldName: string
): void {
  if (value === undefined) return
  if (!isPlainObject(value)) {
    throw new Error(`${context}"${fieldName}" must be an object when provided.`)
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "allowlist") continue
    if (nestedValue !== undefined && typeof nestedValue !== "string") {
      throw new Error(
        `${context}"${fieldName}.${key}" must be a string when provided.`
      )
    }
  }
}

export function validatePrimitiveManifest(
  input: unknown,
  contextLabel?: string
): asserts input is PrimitiveGovernanceManifest {
  const context = formatContext(contextLabel)

  if (!isPlainObject(input)) {
    throw new Error(`${context}Primitive manifest must be an object.`)
  }

  for (const duplicateKey of DISALLOWED_IMPLEMENTATION_DUPLICATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, duplicateKey)) {
      throw new Error(
        `${context}"${duplicateKey}" is not allowed in manifest. ` +
          "Implementation facts must be extracted from primitive source."
      )
    }
  }

  const allowedKeySet = new Set<string>(ALLOWED_MANIFEST_KEYS)
  for (const key of Object.keys(input)) {
    if (!allowedKeySet.has(key)) {
      throw new Error(
        `${context}"${key}" is not an allowed manifest key. Allowed keys: ${ALLOWED_MANIFEST_KEYS.join(", ")}`
      )
    }
  }

  if (typeof input.owner !== "string" || input.owner.trim().length === 0) {
    throw new Error(
      `${context}"owner" is required and must be a non-empty string.`
    )
  }

  if (typeof input.purpose !== "string" || input.purpose.trim().length === 0) {
    throw new Error(
      `${context}"purpose" is required and must be a non-empty string.`
    )
  }

  if (
    typeof input.lifecycle !== "string" ||
    !PRIMITIVE_LIFECYCLES.includes(input.lifecycle as PrimitiveLifecycle)
  ) {
    throw new Error(
      `${context}"lifecycle" must be one of: ${PRIMITIVE_LIFECYCLES.join(", ")}`
    )
  }

  if (input.fixtures !== undefined) {
    if (!Array.isArray(input.fixtures)) {
      throw new Error(`${context}"fixtures" must be an array when provided.`)
    }
    for (const fixture of input.fixtures) {
      if (typeof fixture !== "string" || fixture.trim().length === 0) {
        throw new Error(
          `${context}"fixtures" entries must be non-empty strings.`
        )
      }
    }
  }

  if (input.notes !== undefined && typeof input.notes !== "string") {
    throw new Error(`${context}"notes" must be a string when provided.`)
  }

  assertOptionalBooleanRecord(input.a11y, context, "a11y")
  assertOptionalBooleanRecord(
    input.requiredCoverage,
    context,
    "requiredCoverage"
  )
  assertOptionalBooleanRecord(input.policy, context, "policy")
  assertOptionalStringRecord(input.deprecation, context, "deprecation")

  const deprecationValue = input.deprecation
  if (deprecationValue !== undefined) {
    const deprecationRecord = deprecationValue as Record<string, unknown>
    const allowlistValue = deprecationRecord.allowlist
    if (allowlistValue !== undefined) {
      if (!Array.isArray(allowlistValue)) {
        throw new Error(
          `${context}"deprecation.allowlist" must be an array when provided.`
        )
      }
      for (const item of allowlistValue) {
        if (typeof item !== "string" || item.trim().length === 0) {
          throw new Error(
            `${context}"deprecation.allowlist" entries must be non-empty strings.`
          )
        }
      }
    }
  }
}

export function definePrimitiveManifest<
  const T extends PrimitiveGovernanceManifest,
>(manifest: T): T {
  validatePrimitiveManifest(manifest)
  return manifest
}
