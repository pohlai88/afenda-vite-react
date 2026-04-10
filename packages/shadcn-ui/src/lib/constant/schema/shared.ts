/**
 * AUTHORING INFRASTRUCTURE — shared-schema
 * Shared helper schemas and authoring utilities for the governed constant layer.
 * Scope: reusable Zod primitives and compile-time helpers such as `defineTuple()`.
 * Runtime: authoring and validation only — not product-level semantic invention.
 * Consumption: constant files should reuse these helpers instead of redefining patterns.
 * Boundaries: generic, deterministic, and free of feature-specific doctrine.
 * Stability: public exports are semver-sensitive; evolve with migration notes for dependents.
 */
import { z } from "zod/v4"

// -----------------------------------------------------------------------------
// String primitives (normalized: trim + domain rules)
// -----------------------------------------------------------------------------

export const nonEmptyStringSchema = z.string().trim().min(1)

export const kebabCaseSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected kebab-case text.")

export const componentNameSchema = z
  .string()
  .trim()
  .regex(/^[A-Z][A-Za-z0-9]+$/, "Expected PascalCase component name.")

export const cssVarTokenSchema = z
  .string()
  .trim()
  .regex(/^--[a-z0-9-]+$/, "Expected CSS variable name like --background.")

export const tailwindTokenClassSchema = z
  .string()
  .trim()
  .regex(
    /^(bg|text|border|ring|stroke|fill)-[a-z0-9-/:]+$/,
    "Expected token-backed utility class.",
  )

// -----------------------------------------------------------------------------
// Numeric / boolean primitives
// -----------------------------------------------------------------------------

export const positiveIntSchema = z.number().int().positive()
export const nonNegativeIntSchema = z.number().int().min(0)
export const percentageIntSchema = z.number().int().min(0).max(100)
export const booleanFlagSchema = z.boolean()

// -----------------------------------------------------------------------------
// Records, lists, and tuple vocabulary types
// -----------------------------------------------------------------------------

type ZodShape = Record<string, z.ZodTypeAny>

export const recordOfSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.record(z.string(), valueSchema)

export type StringValueTuple = readonly [string, ...string[]]
export type NonEmptyReadonlyList<T> = readonly [T, ...T[]]
export type TupleValue<T extends readonly unknown[]> = T[number]

export type RegistryTupleMapDefinition<
  T extends Record<string, StringValueTuple>,
> = {
  readonly [K in keyof T]: NonEmptyReadonlyList<TupleValue<T[K]>>
}

export type NestedRegistryTupleMapDefinition<
  T extends Record<string, Record<string, StringValueTuple>>,
> = {
  readonly [K in keyof T]: RegistryTupleMapDefinition<T[K]>
}

export const nonEmptyListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).min(1)

export const nonEmptyEnumListSchema = <const T extends StringValueTuple>(
  values: T,
) => nonEmptyListSchema(z.enum(values))

function enumListShapeFromStringTupleMap<T extends Record<string, StringValueTuple>>(
  definition: T,
): ZodShape {
  const shape: ZodShape = {}
  for (const key of Object.keys(definition) as (keyof T)[]) {
    shape[key as string] = nonEmptyEnumListSchema(definition[key])
  }
  return shape
}

/**
 * Strict Zod object schema for a flat registry: each key maps to one vocabulary tuple.
 */
export function flatRegistrySchemaFromDefinition<
  const T extends Record<string, StringValueTuple>,
>(definition: T) {
  return z.object(enumListShapeFromStringTupleMap(definition)).strict()
}

/**
 * Strict Zod object schema for a nested registry: component → property → vocabulary tuple.
 */
export function nestedRegistrySchemaFromDefinition<
  const T extends Record<string, Record<string, StringValueTuple>>,
>(definition: T) {
  const shape: ZodShape = {}
  for (const outerKey of Object.keys(definition) as (keyof T)[]) {
    const inner = definition[outerKey]
    shape[outerKey as string] = z
      .object(enumListShapeFromStringTupleMap(inner))
      .strict()
  }
  return z.object(shape).strict()
}

export function defineTuple<const T extends StringValueTuple>(values: T): T {
  return values
}

export function defineConstMap<const T extends Record<string, unknown>>(
  value: T,
): Readonly<T> {
  return Object.freeze(value)
}

export function defineConstList<const T extends readonly unknown[]>(
  value: T,
): Readonly<T> {
  return Object.freeze([...value]) as Readonly<T>
}

export function hasDuplicateStrings(values: readonly string[]): boolean {
  return new Set(values).size !== values.length
}

export function isSortedAscending(values: readonly string[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i - 1] > values[i]) {
      return false
    }
  }
  return true
}

// -----------------------------------------------------------------------------
// Class / token record helpers (aligned with nonEmptyStringSchema)
// -----------------------------------------------------------------------------

/** Single class segment; same refinement as `nonEmptyStringSchema`. */
export const classNameSchema = nonEmptyStringSchema

export const classListSchema = z.array(classNameSchema).readonly()
export const frozenStringRecordSchema = z.record(z.string(), z.string())
export const strictBooleanRecordSchema = z.record(z.string(), z.boolean())

// -----------------------------------------------------------------------------
// Component contract bundle (vocabs + defaults + policy)
// -----------------------------------------------------------------------------

/**
 * Three-part contract shape that component constant files should satisfy.
 *
 * - vocabularies: at least one named tuple of canonical enum values
 * - defaults: schema-validated default prop values
 * - policy: governance flags for drift prevention
 *
 * Use `defineComponentContract()` at the bottom of each file to assert compliance.
 */
export interface ComponentContractBundle<
  TVocabs extends Record<string, StringValueTuple> = Record<
    string,
    StringValueTuple
  >,
  TDefaults extends Readonly<Record<string, unknown>> = Readonly<
    Record<string, unknown>
  >,
  TPolicy extends Readonly<Record<string, unknown>> = Readonly<
    Record<string, unknown>
  >,
> {
  readonly vocabularies: TVocabs
  readonly defaults: TDefaults
  readonly policy: TPolicy
}

const CONTRACT_ERR = {
  vocabRequired: "Component contract requires at least one vocabulary tuple.",
  vocabNonEmpty: (key: string) =>
    `Component contract vocabulary "${key}" must be a non-empty tuple.`,
  defaultsRequired: "Component contract requires at least one default value.",
  policyRequired: "Component contract requires at least one policy rule.",
} as const

export function defineComponentContract<
  const TVocabs extends Record<string, StringValueTuple>,
  const TDefaults extends Readonly<Record<string, unknown>>,
  const TPolicy extends Readonly<Record<string, unknown>>,
>(input: {
  vocabularies: TVocabs
  defaults: TDefaults
  policy: TPolicy
}): ComponentContractBundle<TVocabs, TDefaults, TPolicy> {
  const { vocabularies, defaults, policy } = input

  const vocabKeys = Object.keys(vocabularies)
  if (vocabKeys.length === 0) {
    throw new Error(CONTRACT_ERR.vocabRequired)
  }
  for (const key of vocabKeys) {
    const tuple = vocabularies[key as keyof TVocabs]
    if (!Array.isArray(tuple) || tuple.length === 0) {
      throw new Error(CONTRACT_ERR.vocabNonEmpty(key))
    }
  }

  if (Object.keys(defaults).length === 0) {
    throw new Error(CONTRACT_ERR.defaultsRequired)
  }
  if (Object.keys(policy).length === 0) {
    throw new Error(CONTRACT_ERR.policyRequired)
  }

  return Object.freeze({ vocabularies, defaults, policy })
}

/**
 * JSON round-trip for manifest emission, checksums, and tooling that needs plain data.
 * Fails on non-serializable values (e.g. bigint, symbol keys).
 */
export function snapshotComponentContractJson(
  bundle: ComponentContractBundle<
    Record<string, StringValueTuple>,
    Readonly<Record<string, unknown>>,
    Readonly<Record<string, unknown>>
  >,
): ComponentContractBundle<
  Record<string, StringValueTuple>,
  Readonly<Record<string, unknown>>,
  Readonly<Record<string, unknown>>
> {
  return JSON.parse(JSON.stringify(bundle)) as ComponentContractBundle<
    Record<string, StringValueTuple>,
    Readonly<Record<string, unknown>>,
    Readonly<Record<string, unknown>>
  >
}
