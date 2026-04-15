import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardHeader,
} from "@afenda/design-system/ui-primitives"

type MarketingAuthShellProps = {
  title: string
  description?: string
  children: ReactNode
}

/** Shared card chrome for public marketing auth routes (`/login`, `/register`, …). */
export function MarketingAuthShell({
  title,
  description,
  children,
}: MarketingAuthShellProps) {
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  )
}
