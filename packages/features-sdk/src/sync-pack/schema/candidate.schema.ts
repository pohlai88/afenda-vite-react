import { z } from "zod"

import {
  featureCategorySchema,
  featureLaneSchema,
  getFeatureLane,
} from "./category.schema.js"
import { appPrioritySchema } from "./priority.schema.js"
import {
  buildModeSchema,
  candidateStatusSchema,
  dataSensitivitySchema,
} from "./review.schema.js"

const candidateIdSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use stable kebab-case app ids.",
  })

export const appCandidateSchema = z
  .strictObject({
    id: candidateIdSchema,
    name: z.string().trim().min(1),
    source: z.literal("openalternative"),
    sourceUrl: z.string().trim().url(),
    sourceCategory: z.string().trim().min(1),
    internalCategory: featureCategorySchema,
    lane: featureLaneSchema,
    priority: appPrioritySchema,
    buildMode: buildModeSchema,
    internalUseCase: z.string().trim().min(1),
    openSourceReferences: z.array(z.string().trim().url()).min(1),
    licenseReviewRequired: z.boolean(),
    securityReviewRequired: z.boolean(),
    dataSensitivity: dataSensitivitySchema,
    ownerTeam: z.string().trim().min(1),
    status: candidateStatusSchema,
  })
  .superRefine((candidate, context) => {
    const expectedLane = getFeatureLane(candidate.internalCategory)

    if (candidate.lane !== expectedLane) {
      context.addIssue({
        code: "custom",
        path: ["lane"],
        message: `Lane must be "${expectedLane}" for category "${candidate.internalCategory}".`,
      })
    }

    const normalizedReferences = candidate.openSourceReferences.map(
      (reference) => reference.trim().toLowerCase()
    )

    if (new Set(normalizedReferences).size !== normalizedReferences.length) {
      context.addIssue({
        code: "custom",
        path: ["openSourceReferences"],
        message: "Open-source references must not contain duplicates.",
      })
    }
  })

export const appCandidateArraySchema = z.array(appCandidateSchema)

export type AppCandidate = z.infer<typeof appCandidateSchema>
