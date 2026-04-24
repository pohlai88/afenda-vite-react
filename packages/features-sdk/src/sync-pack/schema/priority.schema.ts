import { z } from "zod"

export const appPriorities = ["critical", "essential", "good-to-have"] as const

export const appPrioritySchema = z.enum(appPriorities)

export type AppPriority = (typeof appPriorities)[number]
