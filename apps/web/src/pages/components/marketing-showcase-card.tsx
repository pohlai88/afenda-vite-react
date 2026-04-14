import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"

export function MarketingShowcaseCard(props: {
  readonly title: string
  readonly description: string
  readonly children: ReactNode
}) {
  const { title, description, children } = props

  return (
    <Card className="border-border/70 bg-card/70 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
