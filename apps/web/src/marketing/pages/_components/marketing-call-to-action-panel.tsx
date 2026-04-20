import type { ReactNode } from "react"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export interface MarketingCallToActionLink {
  readonly label: string
  readonly to: string
  readonly variant?: "default" | "outline"
}

export interface MarketingCallToActionPanelProps {
  readonly kicker: string
  readonly title: ReactNode
  readonly description: ReactNode
  readonly links: readonly MarketingCallToActionLink[]
  readonly aside?: ReactNode
  readonly className?: string
}

export function MarketingCallToActionPanel({
  kicker,
  title,
  description,
  links,
  aside,
  className,
}: MarketingCallToActionPanelProps) {
  return (
    <Card
      className={cn(
        "flagship-card border-border/70 bg-card/95 shadow-2xl shadow-primary/5",
        className
      )}
    >
      <CardHeader className="gap-4">
        <Badge
          variant="outline"
          className="w-fit border-primary/20 bg-background/70 text-foreground"
        >
          {kicker}
        </Badge>
        <CardTitle className="max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
          {title}
        </CardTitle>
        <CardDescription className="max-w-3xl text-base leading-8 text-pretty">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex flex-col gap-3 sm:flex-row">
          {links.map((link) => (
            <Button
              key={`${link.label}:${link.to}`}
              asChild
              size="lg"
              variant={link.variant ?? "default"}
              className={cn(
                "touch-manipulation",
                link.variant === "outline"
                  ? "border-border/70 bg-background/75"
                  : undefined
              )}
            >
              <Link to={link.to}>
                {link.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          ))}
        </div>

        {aside ? (
          <div className="max-w-xl text-sm leading-7 text-pretty text-muted-foreground">
            {aside}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
