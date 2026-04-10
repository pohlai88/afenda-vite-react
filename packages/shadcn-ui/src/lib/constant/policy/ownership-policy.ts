/**
 * GOVERNANCE POLICY — ownership-policy
 * Canonical ownership boundary definitions for governed UI, product code, and token authority.
 * Scope: declares which roots may own wrapped primitives, CVA definitions, semantic maps, and tokens.
 * Authority: policy is reviewed truth; feature code must not override ownership boundaries locally.
 * Severity: downstream AST checks and drift scanners use these paths as inclusion/exclusion truth.
 * Design: keep path lists minimal, deterministic, and resolvable against the monorepo root.
 * Consumption: CI, AST checkers, and lint tooling read this instead of hardcoding path assumptions.
 * Changes: adjust ownership roots deliberately and validate that all listed paths exist in the repo.
 * Constraints: no wildcard globs — every root must be a concrete, resolvable directory or file.
 * Validation: schema-validated shape plus repo-path existence checks in validate-constants.
 * Purpose: make ownership authority explicit, reviewable, and enforceable.
 */
import { z } from "zod/v4"

import {
  defineConstMap,
  defineTuple,
  nonEmptyStringSchema,
} from "../schema/shared"

const repoPathSchema = nonEmptyStringSchema

export const ownershipPolicySchema = z
  .object({
    uiOwnerRoots: z.array(repoPathSchema).min(1).readonly(),
    /**
     * Subset of `uiOwnerRoots` audited by the wrapper-contract checker.
     * Validated at runtime: every entry must appear in `uiOwnerRoots`.
     */
    wrapperContractScanRoots: z.array(repoPathSchema).min(1).readonly(),
    /**
     * Broad drift-scan roots (apps + packages), not “product app code only.”
     * AST/regex scanners use this as inclusion roots; governance owners live under
     * `packages/*` too, so the name is intentionally broad. Narrow only if a check
     * should exclude package trees by design.
     */
    productRoots: z.array(repoPathSchema).min(1).readonly(),
    semanticOwnerRoots: z.array(repoPathSchema).min(1).readonly(),
    /**
     * Canonical token authority entrypoints (files or future dirs). Prefer adding
     * paths here over scattering token sources; a rename to `tokenOwnerPaths` may
     * follow if multiple files/dirs become first-class.
     */
    tokenOwnerFiles: z.array(repoPathSchema).min(1).readonly(),
    /**
     * Narrow zones where inline-style exceptions are allowed by policy.
     * Does not grant general styling freedom outside governed components.
     */
    inlineStyleExceptionRoots: z.array(repoPathSchema).min(1).readonly(),
  })
  .strict()

export const ownershipPolicy = defineConstMap(
  ownershipPolicySchema.parse({
    uiOwnerRoots: [
      "packages/radix-ui-themes/src",
      "packages/shadcn-ui/registry",
      "packages/shadcn-ui/src",
    ],
    /**
     * Subset of uiOwnerRoots whose wrapper implementations follow the shadcn
     * `React.forwardRef` / spread-props pattern and should be audited by the
     * wrapper contract checker.  Packages that use the `asChild` dynamic-Comp
     * pattern or contain archived / template code are excluded.
     */
    wrapperContractScanRoots: ["packages/shadcn-ui/src"],
    // Governed scan surface for drift tooling (see schema JSDoc — not “product-only”).
    productRoots: ["apps", "packages"],
    semanticOwnerRoots: [
      "packages/shadcn-ui/src/lib/constant/semantic",
      "packages/shadcn-ui/src/semantic",
    ],
    tokenOwnerFiles: ["apps/web/src/index.css"],
    inlineStyleExceptionRoots: ["packages/shadcn-ui/src/components/ui/chart"],
  })
)

export type OwnershipPolicy = typeof ownershipPolicy
export type OwnershipPolicyInput = z.input<typeof ownershipPolicySchema>

export function parseOwnershipPolicy(value: unknown): OwnershipPolicy {
  return ownershipPolicySchema.parse(value)
}

export function assertOwnershipPolicy(input: unknown): OwnershipPolicy {
  try {
    return ownershipPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid OwnershipPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseOwnershipPolicy(
  input: unknown
):
  | { success: true; data: OwnershipPolicy }
  | { success: false; error: string } {
  const result = ownershipPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isOwnershipPolicy(input: unknown): input is OwnershipPolicy {
  return ownershipPolicySchema.safeParse(input).success
}

export const OwnershipPolicyUtils = Object.freeze({
  schema: ownershipPolicySchema,
  assert: assertOwnershipPolicy,
  is: isOwnershipPolicy,
  parse: parseOwnershipPolicy,
  safeParse: safeParseOwnershipPolicy,
  defaults: ownershipPolicy,
})

export const ownershipRootKindValues = defineTuple([
  "ui-owner",
  "wrapper-contract-scan",
  "product",
  "semantic-owner",
  "token-owner",
  "inline-style-exception",
])
export type OwnershipRootKind = (typeof ownershipRootKindValues)[number]
