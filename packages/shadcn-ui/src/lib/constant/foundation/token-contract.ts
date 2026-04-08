/**
 * SEMANTIC REGISTRY — token-contract
 * Canonical registry of approved `@theme inline` color stems for governed UI utilities.
 * Tier: Tier 1: simple semantic registry.
 * Authoring: JSON source -> validated non-empty tuple -> exported union + Zod enum.
 * Runtime: the schema validates imported registry data; it is not a replacement for authored truth.
 * Consumption: lint rules, tests, and governance tooling should import this contract instead of duplicating stems.
 * Changes: update `token-stems.json` first, then keep CSS bridge and lint consumers aligned.
 * Purpose: keep approved semantic color stems deterministic, reviewable, and shared across tooling layers.
 */
import { z } from "zod/v4"

import {
  defineConstList,
  defineTuple,
  kebabCaseSchema,
  nonEmptyListSchema,
} from "../schema/shared"
import approvedColorStemValuesJson from "./token-stems.json"

const approvedColorStemValuesDefinition = nonEmptyListSchema(
  kebabCaseSchema
).parse(approvedColorStemValuesJson) as [string, ...string[]]

export const approvedColorStemValues = defineTuple(
  approvedColorStemValuesDefinition
)
export const approvedColorStemSchema = z.enum(approvedColorStemValues)
export type ApprovedColorStem = (typeof approvedColorStemValues)[number]

export const approvedColorStemList = defineConstList(approvedColorStemValues)
export const approvedColorStemSet = new Set(approvedColorStemValues)
