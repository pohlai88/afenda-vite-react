/**
 * GOVERNANCE POLICY — import-policy
 * Canonical import governance controlling which external modules product code may consume directly.
 * Scope: bans direct Radix/CVA imports outside governed UI owners, restricts cn() import paths,
 *   and holds AST-check labels for module/import boundary rules (not path strings).
 * Authority: policy is reviewed truth; feature code must not circumvent import restrictions.
 * Severity: downstream AST checks scan import declarations against these patterns as hard gates.
 * Design: keep banned patterns explicit, allowlists minimal, and exception lists deliberately empty.
 * Consumption: CI, AST checkers, and lint tooling read this instead of hardcoding import rules.
 * Changes: adjust import rules deliberately; new allowlist entries require governance review.
 * Constraints: import path lists use plain prefix or exact-match strings (no regex).
 *   `bannedImportPatternLabels` holds semantic AST labels for module-boundary rules, not paths.
 * Validation: schema-validated shape and uniqueness assertions in validate-constants.
 * Purpose: prevent primitive and utility leakage into product code outside governed boundaries.
 */
import { z } from "zod/v4"

import { defineConstMap, nonEmptyStringSchema } from "../schema/shared"

export const importPolicySchema = z
  .object({
    bannedImportPrefixes: z.array(nonEmptyStringSchema).min(1).readonly(),
    bannedExactImportPaths: z.array(nonEmptyStringSchema).readonly(),
    /**
     * Semantic labels for import/module-boundary checks (e.g. barrel re-exports in feature code).
     * Not npm paths — use bannedImportPrefixes / bannedExactImportPaths for those.
     */
    bannedImportPatternLabels: z.array(nonEmptyStringSchema).min(1).readonly(),
    allowedCnImportPaths: z.array(nonEmptyStringSchema).min(1).readonly(),
    governedUiOwnerSourcePathPrefixes: z
      .array(nonEmptyStringSchema)
      .min(1)
      .readonly(),
    allowedLocalCnImportSourcePathPrefixes: z
      .array(nonEmptyStringSchema)
      .readonly(),
    directRadixImportAllowedSourcePathPrefixes: z
      .array(nonEmptyStringSchema)
      .readonly(),
    cvaImportAllowedSourcePathPrefixes: z.array(nonEmptyStringSchema).readonly(),
  })
  .strict()

export const importPolicy = defineConstMap(
  importPolicySchema.parse({
    bannedImportPrefixes: ["@radix-ui/react-"],
    bannedExactImportPaths: ["class-variance-authority"],
    bannedImportPatternLabels: ["barrel-import-in-feature"],
    allowedCnImportPaths: [
      "@afenda/ui/lib/utils/cn",
      "@afenda/shadcn-ui/lib/utils/cn",
    ],
    governedUiOwnerSourcePathPrefixes: [
      "packages/shadcn-ui/src/components/ui/",
      "packages/shadcn-ui/src/lib/",
      "packages/ui/src/",
    ],
    allowedLocalCnImportSourcePathPrefixes: [
      "packages/shadcn-ui/src/lib/utils/",
      "packages/ui/src/lib/",
    ],
    directRadixImportAllowedSourcePathPrefixes: [],
    cvaImportAllowedSourcePathPrefixes: [],
  })
)

export type ImportPolicy = typeof importPolicy
export type ImportPolicyInput = z.input<typeof importPolicySchema>

export function parseImportPolicy(value: unknown): ImportPolicy {
  return importPolicySchema.parse(value)
}

export function assertImportPolicy(input: unknown): ImportPolicy {
  try {
    return importPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ImportPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseImportPolicy(
  input: unknown
): { success: true; data: ImportPolicy } | { success: false; error: string } {
  const result = importPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isImportPolicy(input: unknown): input is ImportPolicy {
  return importPolicySchema.safeParse(input).success
}

export const ImportPolicyUtils = Object.freeze({
  schema: importPolicySchema,
  assert: assertImportPolicy,
  is: isImportPolicy,
  parse: parseImportPolicy,
  safeParse: safeParseImportPolicy,
  defaults: importPolicy,
})
