import { z } from "zod"

export const packFileNames = [
  "00-candidate.json",
  "01-feature-brief.md",
  "02-product-requirement.md",
  "03-technical-design.md",
  "04-data-contract.md",
  "05-api-contract.md",
  "06-ui-contract.md",
  "07-security-risk-review.md",
  "08-implementation-plan.md",
  "09-test-plan.md",
  "10-handoff.md",
] as const

export const packTemplateKinds = ["product", "technical"] as const

export const packFileNameSchema = z.enum(packFileNames)
export const packTemplateKindSchema = z.enum(packTemplateKinds)

export type PackFileName = (typeof packFileNames)[number]
export type PackTemplateKind = (typeof packTemplateKinds)[number]

export const packTemplateEntrySchema = z.strictObject({
  fileName: packFileNameSchema,
  kind: packTemplateKindSchema,
  title: z.string().min(1),
})

export const packTemplateEntries = [
  {
    fileName: "00-candidate.json",
    kind: "product",
    title: "Candidate",
  },
  {
    fileName: "01-feature-brief.md",
    kind: "product",
    title: "Feature Brief",
  },
  {
    fileName: "02-product-requirement.md",
    kind: "product",
    title: "Product Requirement",
  },
  {
    fileName: "03-technical-design.md",
    kind: "technical",
    title: "Technical Design",
  },
  {
    fileName: "04-data-contract.md",
    kind: "technical",
    title: "Data Contract",
  },
  {
    fileName: "05-api-contract.md",
    kind: "technical",
    title: "API Contract",
  },
  {
    fileName: "06-ui-contract.md",
    kind: "technical",
    title: "UI Contract",
  },
  {
    fileName: "07-security-risk-review.md",
    kind: "technical",
    title: "Security Risk Review",
  },
  {
    fileName: "08-implementation-plan.md",
    kind: "technical",
    title: "Implementation Plan",
  },
  {
    fileName: "09-test-plan.md",
    kind: "technical",
    title: "Test Plan",
  },
  {
    fileName: "10-handoff.md",
    kind: "product",
    title: "Handoff",
  },
] as const satisfies ReadonlyArray<{
  fileName: PackFileName
  kind: PackTemplateKind
  title: string
}>

export const packTemplateSchema = z.array(packTemplateEntrySchema).length(11)

export function getRequiredPackFileNames(): PackFileName[] {
  return [...packFileNames]
}
