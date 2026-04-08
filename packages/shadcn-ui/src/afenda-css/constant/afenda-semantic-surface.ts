import { z } from "zod/v4";

export const semanticStateValues = [
  "default",
  "primary",
  "accent",
  "success",
  "warning",
  "destructive",
  "info",
  "muted",
] as const;

export const semanticStateSchema = z.enum(semanticStateValues);

export type SemanticState = z.infer<typeof semanticStateSchema>;

export const semanticStateClassMap = {
  default: "bg-card text-card-foreground border-border",
  primary: "bg-primary text-primary-foreground border-primary/20",
  accent: "bg-accent text-accent-foreground border-accent/20",
  success: "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-[hsl(var(--success)/0.25)]",
  warning: "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] border-[hsl(var(--warning)/0.25)]",
  destructive:
    "bg-destructive text-destructive-foreground border-destructive/20",
  info: "bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))] border-[hsl(var(--info)/0.25)]",
  muted: "bg-muted text-muted-foreground border-border",
} as const satisfies Record<SemanticState, string>;

export function getSemanticStateClass(value: SemanticState): string {
  return semanticStateClassMap[value];
}
