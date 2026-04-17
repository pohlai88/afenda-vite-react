/**
 * Re-export glossary snapshot types from Zod schemas (single source of truth).
 * @see business-glossary.schema.ts
 */
export type {
  BusinessGlossaryBody,
  BusinessGlossarySnapshot,
} from "./business-glossary.schema"

import type { BusinessGlossarySnapshot } from "./business-glossary.schema"

export type BusinessGlossaryDomainModule =
  BusinessGlossarySnapshot["domain_modules"][number]

export type BusinessGlossaryEntry = BusinessGlossarySnapshot["entries"][number]

export type BusinessGlossaryTechnical = BusinessGlossaryEntry["technical"]

/** @deprecated Prefer {@link BusinessGlossarySnapshot} */
export type BusinessGlossaryDocument = BusinessGlossarySnapshot
