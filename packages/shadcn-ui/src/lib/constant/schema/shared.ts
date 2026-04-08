/**
 * AUTHORING INFRASTRUCTURE — shared-schema
 * Shared helper schemas and authoring utilities for the governed constant layer.
 * Scope: provides reusable Zod primitives and compile-time helpers such as `defineTuple()`.
 * Runtime: helpers here support authoring and validation, not product-level semantic invention.
 * Consumption: constant files should reuse these helpers instead of redefining common patterns.
 * Boundaries: keep this file generic, deterministic, and free of feature-specific doctrine.
 * Changes: evolve helpers carefully because many constant files depend on this contract.
 * Purpose: keep constant-layer authoring consistent, minimal, and reviewable.
 */
import { z } from "zod/v4"

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
    "Expected token-backed utility class."
  )

export const positiveIntSchema = z.number().int().positive()
export const nonNegativeIntSchema = z.number().int().min(0)

export const percentageIntSchema = z.number().int().min(0).max(100)
export const booleanFlagSchema = z.boolean()

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
  values: T
) => nonEmptyListSchema(z.enum(values))

export function defineTuple<const T extends StringValueTuple>(values: T): T {
  return values
}

export function defineConstMap<const T extends Record<string, unknown>>(
  value: T
): Readonly<T> {
  return Object.freeze(value)
}

export function defineConstList<const T extends readonly unknown[]>(
  value: T
): Readonly<T> {
  return Object.freeze([...value]) as Readonly<T>
}

export const classNameSchema = z.string().trim().min(1)
export const classListSchema = z.array(classNameSchema).readonly()
export const frozenStringRecordSchema = z.record(z.string(), z.string())
export const strictBooleanRecordSchema = z.record(z.string(), z.boolean())

/**
 * Three-part contract shape that every component constant file must satisfy.
 *
 * - vocabularies: at least one named tuple of canonical enum values
 * - defaults: schema-validated default prop values
 * - policy: schema-validated governance flags for drift prevention
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
    throw new Error("Component contract requires at least one vocabulary tuple.")
  }
  for (const key of vocabKeys) {
    const tuple = vocabularies[key]
    if (!Array.isArray(tuple) || tuple.length === 0) {
      throw new Error(
        `Component contract vocabulary "${key}" must be a non-empty tuple.`
      )
    }
  }

  if (Object.keys(defaults).length === 0) {
    throw new Error("Component contract requires at least one default value.")
  }
  if (Object.keys(policy).length === 0) {
    throw new Error("Component contract requires at least one policy rule.")
  }

  return Object.freeze({ vocabularies, defaults, policy })
}
