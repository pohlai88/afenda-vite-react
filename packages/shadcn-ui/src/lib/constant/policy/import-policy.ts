/**
 * GOVERNANCE POLICY — import-policy
 * Canonical import governance controlling which external modules product code may consume directly.
 * Scope: bans direct Radix/CVA imports outside governed UI owners and restricts cn() import paths.
 * Authority: policy is reviewed truth; feature code must not circumvent import restrictions.
 * Severity: downstream AST checks scan import declarations against these patterns as hard gates.
 * Design: keep banned patterns explicit, allowlists minimal, and exception lists deliberately empty.
 * Consumption: CI, AST checkers, and lint tooling read this instead of hardcoding import rules.
 * Changes: adjust import rules deliberately; new allowlist entries require governance review.
 * Constraints: no regex patterns — all entries are plain prefix or exact-match strings.
 * Validation: schema-validated shape and uniqueness assertions in validate-constants.
 * Purpose: prevent primitive and utility leakage into product code outside governed boundaries.
 */
import { z } from "zod/v4"

import { defineConstMap, nonEmptyStringSchema } from "../schema/shared"

const importPolicySchema = z
  .object({
    bannedImportPatterns: z.array(nonEmptyStringSchema).min(1).readonly(),
    allowedCnImportPaths: z.array(nonEmptyStringSchema).min(1).readonly(),
    directRadixImportAllowlist: z.array(nonEmptyStringSchema).readonly(),
    cvaImportAllowlist: z.array(nonEmptyStringSchema).readonly(),
  })
  .strict()

export const importPolicy = defineConstMap(
  importPolicySchema.parse({
    bannedImportPatterns: [
      "@radix-ui/react-",
      "class-variance-authority",
    ],
    allowedCnImportPaths: [
      "@afenda/ui/lib/utils",
      "@afenda/ui/lib/utils/cn",
      "@afenda/shadcn-ui/lib/utils",
      "../../lib/utils/cn",
      "../lib/utils/cn",
      "./cn",
    ],
    directRadixImportAllowlist: [],
    cvaImportAllowlist: [],
  })
)

export type ImportPolicy = typeof importPolicy
