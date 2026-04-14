export const SEMANTIC_TOKEN_GROUPS = [
  {
    key: "surfaces",
    items: [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
    ],
  },
  {
    key: "brand",
    items: [
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "accent",
      "accent-foreground",
    ],
  },
  {
    key: "feedback",
    items: ["destructive", "destructive-foreground"],
  },
  {
    key: "chrome",
    items: [
      "muted",
      "muted-foreground",
      "selection",
      "selection-foreground",
      "border",
      "input",
      "ring",
      "ring-offset",
    ],
  },
] as const

/** Flat token list (group order) — single source for counts and swatch grids. */
export const SEMANTIC_SWATCHES = SEMANTIC_TOKEN_GROUPS.flatMap((g) => [...g.items])

export const PRIMARY_SCALE = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const

export const RADIUS_KEYS = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const

export type SwatchMode = "border" | "fill" | "ring" | "text"

export function swatchMode(name: string): SwatchMode {
  if (name === "border" || name === "input") return "border"
  if (name === "ring") return "ring"
  if (name === "foreground" || name.endsWith("-foreground")) return "text"
  return "fill"
}
