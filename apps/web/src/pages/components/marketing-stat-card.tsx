import type { ReactNode } from "react"

import { Card, CardContent } from "@afenda/design-system/ui-primitives"

export function MarketingStatCard(props: {
  readonly icon: ReactNode
  readonly title: string
  readonly value: string
  readonly hint: string
}) {
  const { icon, title, value, hint } = props

  return (
    <Card className="gap-0 border-border/70 bg-card/60 py-4 shadow-sm backdrop-blur-sm">
      <CardContent className="space-y-4 p-0 px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground">
            {icon}
          </div>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}
