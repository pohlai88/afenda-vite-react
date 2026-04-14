/* eslint-disable afenda-ui/no-inline-styles --
   Token swatches bind dynamic semantic names to `var(--color-*)` at runtime. */
import { Badge } from "@afenda/design-system/ui-primitives"

import { swatchMode } from "./marketing-token-playground-constants"

export function MarketingTokenSwatch(props: { readonly name: string }) {
  const { name } = props
  const cssVar = `--color-${name}`
  const mode = swatchMode(name)

  return (
    <div className="group rounded-xl border border-border/70 bg-card/50 p-3 transition-colors hover:border-border hover:bg-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <code className="ui-mono-token block break-all text-muted-foreground">
            {cssVar}
          </code>
        </div>
        <Badge className="shrink-0" variant="outline">
          {mode}
        </Badge>
      </div>

      {mode === "fill" ? (
        <div
          className="h-16 rounded-lg border border-border/80 shadow-sm"
          style={{ backgroundColor: `var(${cssVar})` }}
        />
      ) : null}

      {mode === "text" ? (
        <div className="flex h-16 items-center justify-center rounded-lg border border-border/80 bg-background shadow-sm">
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: `var(${cssVar})` }}
          >
            Aa
          </span>
        </div>
      ) : null}

      {mode === "border" ? (
        <div
          className="h-16 rounded-lg border-2 bg-background shadow-sm"
          style={{ borderColor: `var(${cssVar})` }}
        />
      ) : null}

      {mode === "ring" ? (
        <div className="flex h-16 items-center justify-center rounded-lg bg-background shadow-sm">
          <div
            className="size-12 rounded-md bg-background"
            style={{
              boxShadow: `
                0 0 0 2px var(${cssVar}),
                0 0 0 5px var(--color-ring-offset)
              `,
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
