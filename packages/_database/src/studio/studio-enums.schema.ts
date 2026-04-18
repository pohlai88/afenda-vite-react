import { z } from "zod"

/** Row shape returned by `GET /v1/studio/enums` (`queryAllowlistedPgEnums`). */
export const studioPgEnumRowSchema = z.object({
  schema_name: z.string(),
  enum_name: z.string(),
  value: z.string(),
  sort_order: z.number(),
})

export const studioEnumsResponseSchema = z.object({
  enums: z.array(studioPgEnumRowSchema),
})

export type StudioPgEnumRow = z.infer<typeof studioPgEnumRowSchema>
