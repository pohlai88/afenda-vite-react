import type { ReactNode } from "react"

import { ArrowRight, CheckCircle2 } from "lucide-react"

import { Badge, Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { MarketingPageSection, MarketingSectionHeading } from "../_components"

export interface MarketingMediaSectionProps {
  readonly kicker: string
  readonly title: ReactNode
  readonly description: ReactNode
  readonly imageSrc: string
  readonly imageAlt: string
  readonly proofItems?: readonly string[]
  readonly badge?: string
  readonly ctaLabel?: string
  readonly ctaHref?: string
  readonly className?: string
}

export function MarketingMediaSection({
  kicker,
  title,
  description,
  imageSrc,
  imageAlt,
  proofItems = [],
  badge,
  ctaLabel,
  ctaHref,
  className,
}: MarketingMediaSectionProps) {
  return (
    <MarketingPageSection
      className={cn("border-b border-border/70", className)}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-center">
        <div className="min-w-0">
          {badge ? (
            <Badge variant="outline" className="mb-5">
              {badge}
            </Badge>
          ) : null}

          <MarketingSectionHeading
            kicker={kicker}
            title={title}
            description={description}
          />

          {proofItems.length > 0 ? (
            <ul className="mt-8 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              {proofItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  <span className="min-w-0 text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {ctaLabel && ctaHref ? (
            <div className="mt-8">
              <Button asChild size="sm" className="touch-manipulation">
                <a href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </a>
              </Button>
            </div>
          ) : null}
        </div>

        <figure className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <img
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={900}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </MarketingPageSection>
  )
}
