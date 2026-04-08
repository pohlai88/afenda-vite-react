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

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

const repoPathSchema = nonEmptyStringSchema

const ownershipPolicySchema = z
  .object({
    uiOwnerRoots: z.array(repoPathSchema).min(1).readonly(),
    wrapperContractScanRoots: z.array(repoPathSchema).min(1).readonly(),
    productRoots: z.array(repoPathSchema).min(1).readonly(),
    semanticOwnerRoots: z.array(repoPathSchema).min(1).readonly(),
    tokenOwnerFiles: z.array(repoPathSchema).min(1).readonly(),
    inlineStyleExceptionRoots: z.array(repoPathSchema).min(1).readonly(),
  })
  .strict()

export const ownershipPolicy = defineConstMap(
  ownershipPolicySchema.parse({
    uiOwnerRoots: [
      "packages/shadcn-ui/src",
      "packages/shadcn-ui/registry",
      "packages/ui/src",
      "packages/design-system/src/components/shadcn",
      "packages/radix-ui-themes/src",
    ],
    /**
     * Subset of uiOwnerRoots whose wrapper implementations follow the shadcn
     * `React.forwardRef` / spread-props pattern and should be audited by the
     * wrapper contract checker.  Packages that use the `asChild` dynamic-Comp
     * pattern or contain archived / template code are excluded.
     */
    wrapperContractScanRoots: [
      "packages/shadcn-ui/src",
      "packages/ui/src",
    ],
    productRoots: [
      "apps",
      "packages",
    ],
    semanticOwnerRoots: [
      "packages/ui/src/lib/semantic",
      "packages/shadcn-ui/src/lib/semantic",
      "packages/features/core/src/truth-ui",
    ],
    tokenOwnerFiles: [
      "apps/web/src/index.css",
    ],
    inlineStyleExceptionRoots: [
      "packages/ui/src/components/chart",
      "packages/ui/src/components/measurement",
    ],
  })
)

export type OwnershipPolicy = typeof ownershipPolicy

export const ownershipRootKindValues = defineTuple([
  "ui-owner",
  "product",
  "semantic-owner",
  "token-owner",
  "inline-style-exception",
])
export type OwnershipRootKind = (typeof ownershipRootKindValues)[number]
