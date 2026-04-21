import type { ReactNode } from "react"

import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"

import { MarketingPageSection, MarketingSectionHeading } from "../_components"

export interface MarketingElement {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
  readonly eyebrow?: ReactNode
}

export interface MarketingElementGridProps {
  readonly kicker: string
  readonly title: ReactNode
  readonly description?: ReactNode
  readonly items: readonly MarketingElement[]
}

export function MarketingElementGrid({
  kicker,
  title,
  description,
  items,
}: MarketingElementGridProps) {
  return (
    <MarketingPageSection className="border-b border-border/70">
      <MarketingSectionHeading
        kicker={kicker}
        title={title}
        description={description}
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map(({ title: itemTitle, body, icon: Icon, eyebrow }) => (
          <Card
            key={itemTitle}
            className="h-full border-border/70 bg-card/90 shadow-sm"
          >
            <CardHeader className="gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                <Icon aria-hidden="true" className="size-5 text-primary" />
              </div>

              {eyebrow ? (
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {eyebrow}
                </div>
              ) : null}

              <CardTitle className="text-xl tracking-[-0.03em]">
                {itemTitle}
              </CardTitle>
              <CardDescription className="text-sm leading-7 text-pretty">
                {body}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </MarketingPageSection>
  )
}
