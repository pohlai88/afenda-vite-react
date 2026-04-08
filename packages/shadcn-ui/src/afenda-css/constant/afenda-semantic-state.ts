import { z } from "zod/v4";

export const semanticSurfaceValues = [
  "canvas",
  "panel",
  "panel-elevated",
  "subtle",
  "nav-active",
  "input",
] as const;

export const semanticSurfaceSchema = z.enum(semanticSurfaceValues);

export type SemanticSurface = z.infer<typeof semanticSurfaceSchema>;

export const semanticSurfaceClassMap = {
  canvas: "bg-background text-foreground",
  panel: "bg-card text-card-foreground border border-border",
  "panel-elevated":
    "bg-card text-card-foreground border border-border shadow-sm",
  subtle: "bg-muted text-foreground border border-border",
  "nav-active": "bg-primary/15 text-foreground border border-primary/20",
  input: "bg-background text-foreground border border-input",
} as const satisfies Record<SemanticSurface, string>;

export function getSemanticSurfaceClass(value: SemanticSurface): string {
  return semanticSurfaceClassMap[value];
}
