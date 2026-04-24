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
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use stable kebab-case app ids.",
  })

export const appCandidateSchema = z
  .strictObject({
    id: candidateIdSchema,
    name: z.string().min(1),
    source: z.literal("openalternative"),
    sourceUrl: z.string().url(),
    sourceCategory: z.string().min(1),
    internalCategory: featureCategorySchema,
    lane: featureLaneSchema,
    priority: appPrioritySchema,
    buildMode: buildModeSchema,
    internalUseCase: z.string().min(1),
    openSourceReferences: z.array(z.string().url()).min(1),
    licenseReviewRequired: z.boolean(),
    securityReviewRequired: z.boolean(),
    dataSensitivity: dataSensitivitySchema,
    ownerTeam: z.string().min(1),
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
  })

export const appCandidateArraySchema = z.array(appCandidateSchema)

export type AppCandidate = z.infer<typeof appCandidateSchema>
