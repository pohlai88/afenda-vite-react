import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  Building2,
  Globe2,
  Languages,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  MarketingPageSection,
  MarketingPageShell,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../_components"
import { MARKETING_PAGE_HREFS } from "../../marketing-page-registry"

type RegionalSurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const REGIONAL_SURFACES: readonly RegionalSurface[] = [
  {
    title: "Regional operating context",
    body: "Geo-specific surfaces should explain where Afenda expects reporting, operations, and governance complexity to matter most.",
    icon: Globe2,
  },
  {
    title: "Entity-aware rollout",
    body: "Regional growth often means more entities, more approvals, and more cross-border process pressure on the same ERP record.",
    icon: Building2,
  },
  {
    title: "Localization readiness",
    body: "Public regional pages should acknowledge language, policy, and workflow expectations without pretending localization is only translation.",
    icon: Languages,
  },
  {
    title: "Compliance alignment",
    body: "Regional expansion has to stay connected to the legal and trust model rather than introducing a separate public narrative.",
    icon: ShieldCheck,
  },
] as const

export default function AsiaPacificPage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell tagline="Geo-specific ERP posture for regional operators">
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-accent/8" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Regional"
            title="Asia Pacific is a real ERP context, not just a localization checkbox."
            description={
              <>
                This page gives the topology a proper geo-specific public
                surface for regional operations, language complexity, and
                governance expectations without breaking the shared marketing
                system.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Regional Posture"
            title="Geo-specific pages should carry business, language, and governance meaning together."
            description={
              <>
                Regional routing is part of the approved marketing topology. The
                point is not to add geography for its own sake, but to make
                public expansion routes structurally legitimate when they are
                needed.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {REGIONAL_SURFACES.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              {...getMarketingReveal(reduceMotion, index * 0.05)}
            >
              <Card className="h-full border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl tracking-[-0.03em]">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7 text-pretty">
                    {body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </MarketingPageSection>

      <MarketingPageSection>
        <motion.div
          className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-xl shadow-primary/5 md:p-8"
          {...getMarketingReveal(reduceMotion)}
        >
          <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
            Regional CTA
          </div>
          <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
            Connect regional rollout to the same product and policy system.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            Regional pages should route cleanly into product meaning and legal
            posture so expansion does not create a fragmented public story.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="touch-manipulation">
              <Link to={MARKETING_PAGE_HREFS.truthEngine}>
                Open Truth Engine
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="touch-manipulation border-border/70 bg-background/75"
            >
              <Link to={MARKETING_PAGE_HREFS.pdpa}>View PDPA</Link>
            </Button>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-pretty text-muted-foreground">
            This route makes the regional domain real without turning it into a
            generic geography bucket with no narrative ownership.
          </p>
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
