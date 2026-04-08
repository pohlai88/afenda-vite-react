/**
 * SEMANTIC SYSTEM — tone
 * Canonical governed system for tone semantics and coordinated presentation mappings.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed maps -> `as const satisfies` or schema-checked equivalents.
 * Runtime: exported schemas support boundary parsing or validation, not primary authoring.
 * Consumption: import governed tone values and reviewed mappings; do not recreate tone maps inline.
 * Tokens: presentation outputs must remain inside reviewed governed mappings.
 * Defaults: add `DEFAULT_TONE` only if the system adopts a true canonical default.
 * Changes: update this file first, then validate all dependent mappings and CI.
 * Purpose: prevent tone drift and keep semantic presentation behavior deterministic.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"
import { type Emphasis } from "./emphasis"

export const toneValues = defineTuple([
  "neutral",
  "brand",
  "success",
  "warning",
  "destructive",
  "info",
])
export const toneSchema = z.enum(toneValues)
export type Tone = (typeof toneValues)[number]

export const toneClassSchema = z
  .object({
    bg: z.string().trim().min(1),
    text: z.string().trim().min(1),
    border: z.string().trim().min(1),
  })
  .strict()
export type ToneClassDefinition = z.infer<typeof toneClassSchema>

export const toneClassMapSchema = z.record(toneSchema, toneClassSchema)

const toneClassMapDefinition = {
  neutral: {
    bg: "bg-muted",
    text: "text-foreground",
    border: "border-border",
  },
  brand: {
    bg: "bg-primary",
    text: "text-primary-foreground",
    border: "border-primary",
  },
  success: {
    bg: "bg-success",
    text: "text-success-foreground",
    border: "border-success",
  },
  warning: {
    bg: "bg-warning",
    text: "text-warning-foreground",
    border: "border-warning",
  },
  destructive: {
    bg: "bg-destructive",
    text: "text-destructive-foreground",
    border: "border-destructive",
  },
  info: {
    bg: "bg-info",
    text: "text-info-foreground",
    border: "border-info",
  },
} as const satisfies Record<Tone, ToneClassDefinition>

export const toneClassMap = defineConstMap(
  toneClassMapSchema.parse(toneClassMapDefinition)
)

export function getToneClassDefinition(tone: Tone): ToneClassDefinition {
  return toneClassMap[tone]
}

export function getToneBgClass(tone: Tone): string {
  return toneClassMap[tone].bg
}

export function getToneTextClass(tone: Tone): string {
  return toneClassMap[tone].text
}

export function getToneBorderClass(tone: Tone): string {
  return toneClassMap[tone].border
}

const toneEmphasisClassSchema = z
  .object({
    subtle: z.string().trim().min(1),
    soft: z.string().trim().min(1),
    outline: z.string().trim().min(1),
    solid: z.string().trim().min(1),
  })
  .strict()
type ToneEmphasisClassDefinition = z.infer<typeof toneEmphasisClassSchema>

const toneBadgeClassMapSchema = z.record(toneSchema, toneEmphasisClassSchema)
const toneAlertClassMapSchema = z.record(toneSchema, toneEmphasisClassSchema)

const toneBadgeClassMapDefinition = {
  neutral: {
    subtle: "border-transparent bg-muted/60 text-muted-foreground",
    soft: "border-border bg-muted text-foreground",
    outline: "border-border bg-background text-foreground",
    solid: "border-foreground bg-foreground text-background",
  },
  brand: {
    subtle: "border-transparent bg-primary/10 text-primary",
    soft: "border-primary/20 bg-primary/15 text-primary",
    outline: "border-primary/40 bg-background text-primary",
    solid: "border-primary bg-primary text-primary-foreground",
  },
  success: {
    subtle: "border-transparent bg-success/15 text-success",
    soft: "border-success/20 bg-success/20 text-success",
    outline: "border-success/35 bg-background text-success",
    solid: "border-success bg-success text-success-foreground",
  },
  warning: {
    subtle: "border-transparent bg-warning/15 text-warning",
    soft: "border-warning/20 bg-warning/20 text-warning",
    outline: "border-warning/35 bg-background text-warning",
    solid: "border-warning bg-warning text-warning-foreground",
  },
  destructive: {
    subtle: "border-transparent bg-destructive/10 text-destructive",
    soft: "border-destructive/20 bg-destructive/15 text-destructive",
    outline: "border-destructive/35 bg-background text-destructive",
    solid:
      "border-destructive bg-destructive text-destructive-foreground shadow-sm",
  },
  info: {
    subtle: "border-transparent bg-info/15 text-info",
    soft: "border-info/20 bg-info/20 text-info",
    outline: "border-info/35 bg-background text-info",
    solid: "border-info bg-info text-info-foreground",
  },
} as const satisfies Record<Tone, ToneEmphasisClassDefinition>

const toneAlertClassMapDefinition = {
  neutral: {
    subtle: "border-border/60 bg-muted/40 text-muted-foreground",
    soft: "border-border bg-muted text-foreground",
    outline: "border-border bg-background text-foreground",
    solid: "border-foreground/20 bg-foreground text-background",
  },
  brand: {
    subtle: "border-primary/20 bg-primary/10 text-primary",
    soft: "border-primary/30 bg-primary/15 text-primary",
    outline: "border-primary/40 bg-background text-primary",
    solid: "border-primary bg-primary text-primary-foreground",
  },
  success: {
    subtle: "border-success/20 bg-success/10 text-success",
    soft: "border-success/30 bg-success/15 text-success",
    outline: "border-success/40 bg-background text-success",
    solid: "border-success bg-success text-success-foreground",
  },
  warning: {
    subtle: "border-warning/20 bg-warning/10 text-warning",
    soft: "border-warning/30 bg-warning/15 text-warning",
    outline: "border-warning/40 bg-background text-warning",
    solid: "border-warning bg-warning text-warning-foreground",
  },
  destructive: {
    subtle: "border-destructive/20 bg-destructive/10 text-destructive",
    soft: "border-destructive/30 bg-destructive/15 text-destructive",
    outline: "border-destructive/40 bg-background text-destructive",
    solid: "border-destructive bg-destructive text-destructive-foreground",
  },
  info: {
    subtle: "border-info/20 bg-info/10 text-info",
    soft: "border-info/30 bg-info/15 text-info",
    outline: "border-info/40 bg-background text-info",
    solid: "border-info bg-info text-info-foreground",
  },
} as const satisfies Record<Tone, ToneEmphasisClassDefinition>

export const toneBadgeClassMap = defineConstMap(
  toneBadgeClassMapSchema.parse(toneBadgeClassMapDefinition)
)

export const toneAlertClassMap = defineConstMap(
  toneAlertClassMapSchema.parse(toneAlertClassMapDefinition)
)

export function getBadgeToneClass(tone: Tone, emphasis: Emphasis): string {
  return toneBadgeClassMap[tone][emphasis]
}

export function getAlertToneClass(tone: Tone, emphasis: Emphasis): string {
  return toneAlertClassMap[tone][emphasis]
}
