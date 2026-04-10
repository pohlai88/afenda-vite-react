import { z } from "zod/v4"

import { defineTuple, nonEmptyStringSchema } from "../schema/shared"

export const policyLifecycleValues = defineTuple([
  "enforced",
  "review-only",
  "backlog",
  "deprecated",
])
export const policyLifecycleSchema = z.enum(policyLifecycleValues)
export type PolicyLifecycle = z.infer<typeof policyLifecycleSchema>

export const policyConsumerKindValues = defineTuple([
  "eslint",
  "ci-script",
  "runtime-validator",
  "manual-review",
])
export const policyConsumerKindSchema = z.enum(policyConsumerKindValues)
export type PolicyConsumerKind = z.infer<typeof policyConsumerKindSchema>

export const policyPhaseValues = defineTuple([
  "phase-1-structure",
  "phase-2-objective-enforcement",
  "phase-3-semantic-enforcement",
  "phase-4-legacy-removal",
])
export const policyPhaseSchema = z.enum(policyPhaseValues)
export type PolicyPhase = z.infer<typeof policyPhaseSchema>

export const policyFixtureCoverageSchema = z
  .object({
    valid: z.boolean(),
    invalid: z.boolean(),
    edge: z.boolean(),
  })
  .strict()
export type PolicyFixtureCoverage = z.infer<typeof policyFixtureCoverageSchema>

export const policyFixturePathListSchema = z.array(nonEmptyStringSchema).readonly()
export const policyFixturePathsSchema = z
  .object({
    valid: policyFixturePathListSchema,
    invalid: policyFixturePathListSchema,
    edge: policyFixturePathListSchema,
  })
  .strict()
export type PolicyFixturePaths = z.infer<typeof policyFixturePathsSchema>

export const policyManifestEntrySchema = z
  .object({
    field: nonEmptyStringSchema,
    lifecycle: policyLifecycleSchema,
    consumerKind: policyConsumerKindSchema,
    consumers: z.array(nonEmptyStringSchema).readonly(),
    fixtureCoverage: policyFixtureCoverageSchema,
    fixturePaths: policyFixturePathsSchema,
    ciBlocking: z.boolean(),
    canonical: z.boolean(),
    compatibilityOnly: z.boolean(),
    phase: policyPhaseSchema,
    legacySunset: z.string().trim().min(1).nullable(),
    notes: nonEmptyStringSchema,
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (
      (entry.lifecycle === "enforced" || entry.lifecycle === "review-only") &&
      entry.consumers.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          'consumers must be non-empty when lifecycle is "enforced" or "review-only".',
        path: ["consumers"],
      })
    }

    if (new Set(entry.consumers).size !== entry.consumers.length) {
      ctx.addIssue({
        code: "custom",
        message: "consumers must not contain duplicate entries (govern as a set).",
        path: ["consumers"],
      })
    }

    if (entry.compatibilityOnly && entry.canonical) {
      ctx.addIssue({
        code: "custom",
        message:
          "compatibilityOnly fields cannot be marked canonical; compatibility entries are transitional, not canonical long-term truth.",
        path: ["canonical"],
      })
    }

    if (entry.ciBlocking && entry.lifecycle !== "enforced") {
      ctx.addIssue({
        code: "custom",
        message: "ciBlocking can only be true for lifecycle \"enforced\".",
        path: ["ciBlocking"],
      })
    }

    if (entry.lifecycle === "enforced") {
      if (!entry.fixtureCoverage.valid) {
        ctx.addIssue({
          code: "custom",
          message:
            'fixtureCoverage.valid must be true when lifecycle is "enforced".',
          path: ["fixtureCoverage", "valid"],
        })
      }
      if (!entry.fixtureCoverage.invalid) {
        ctx.addIssue({
          code: "custom",
          message:
            'fixtureCoverage.invalid must be true when lifecycle is "enforced".',
          path: ["fixtureCoverage", "invalid"],
        })
      }
      if (entry.fixturePaths.valid.length === 0) {
        ctx.addIssue({
          code: "custom",
          message:
            'fixturePaths.valid must include at least one fixture when lifecycle is "enforced".',
          path: ["fixturePaths", "valid"],
        })
      }
      if (entry.fixturePaths.invalid.length === 0) {
        ctx.addIssue({
          code: "custom",
          message:
            'fixturePaths.invalid must include at least one fixture when lifecycle is "enforced".',
          path: ["fixturePaths", "invalid"],
        })
      }
    }

    if (entry.lifecycle === "deprecated" && entry.legacySunset == null) {
      ctx.addIssue({
        code: "custom",
        message:
          'legacySunset is required when lifecycle is "deprecated".',
        path: ["legacySunset"],
      })
    }

    if (entry.compatibilityOnly && entry.legacySunset == null) {
      ctx.addIssue({
        code: "custom",
        message:
          "compatibilityOnly entries must define a legacySunset target.",
        path: ["legacySunset"],
      })
    }
  })
export type PolicyManifestEntry = z.infer<typeof policyManifestEntrySchema>

export const policyManifestSchema = z
  .object({
    policyName: nonEmptyStringSchema,
    policyVersion: nonEmptyStringSchema,
    entries: z.array(policyManifestEntrySchema).min(1).readonly(),
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const seenFields = new Set<string>()
    for (const [index, entry] of manifest.entries.entries()) {
      if (seenFields.has(entry.field)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate manifest field "${entry.field}".`,
          path: ["entries", index, "field"],
        })
      }
      seenFields.add(entry.field)
    }
  })
export type PolicyManifest = z.infer<typeof policyManifestSchema>
