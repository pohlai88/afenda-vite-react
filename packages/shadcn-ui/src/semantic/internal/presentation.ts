/**
 * SEMANTIC PRESENTATION — resolver
 * Composes governed semantic primitives into semantic UI class outputs.
 * Rules: do not define semantic vocabularies or recreate governed mappings here.
 * Purpose: keep semantic components thin and prevent local semantic drift.
 */
import type { LucideIcon } from "lucide-react"
import { createElement } from "react"

import { cn } from "../../lib/utils"
import {
  getDensityGapClass,
  getFieldGapClass,
  getPanelSectionSpacingClass,
} from "../../lib/constant/foundation/density"
import { getPanelEmphasisClass } from "../../lib/constant/semantic/emphasis"
import { getSurfaceClass } from "../../lib/constant/semantic/surface"
import { getAlertToneClass, getBadgeToneClass } from "../../lib/constant/semantic/tone"
import type { SemanticDensity } from "../primitives/density"
import type { SemanticEmphasis } from "../primitives/emphasis"
import type { SemanticSize } from "../primitives/size"
import type { SemanticSurface } from "../primitives/surface"
import type { SemanticTone } from "../primitives/tone"

const badgeSizeClassMap: Record<Extract<SemanticSize, "sm" | "md">, string> = {
  sm: "min-h-6 px-2 py-0.5 text-xs",
  md: "min-h-7 px-2.5 py-1 text-sm",
}

export function getBadgeClasses(
  tone: SemanticTone,
  emphasis: SemanticEmphasis,
  size: Extract<SemanticSize, "sm" | "md">
) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
    badgeSizeClassMap[size],
    getBadgeToneClass(tone, emphasis)
  )
}

export function getAlertClasses(
  tone: SemanticTone,
  emphasis: SemanticEmphasis
) {
  return cn("rounded-xl border px-4 py-3 shadow-sm", getAlertToneClass(tone, emphasis))
}

export function getPanelClasses(
  surface: SemanticSurface,
  density: SemanticDensity,
  emphasis: SemanticEmphasis
) {
  return cn(
    "rounded-2xl border",
    getSurfaceClass(surface),
    getPanelEmphasisClass(emphasis),
    getDensityGapClass(density)
  )
}

export function getPanelSectionSpacing(density: SemanticDensity) {
  return getPanelSectionSpacingClass(density)
}

export function getFieldStackClasses(density: SemanticDensity) {
  return cn("flex flex-col", getFieldGapClass(density))
}

export function renderSemanticIcon(
  Icon: LucideIcon | undefined,
  className: string
) {
  if (Icon == null) return null
  return createElement(Icon, { "aria-hidden": "true", className })
}
