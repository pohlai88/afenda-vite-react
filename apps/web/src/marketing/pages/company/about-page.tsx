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
  Landmark,
  Target,
  Users,
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

type CompanySurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const COMPANY_SURFACES: readonly CompanySurface[] = [
  {
    title: "Business-first ERP",
    body: "Afenda is built for organizations carrying operational and financial consequence, not for lightweight workflow demos.",
    icon: Building2,
  },
  {
    title: "Serious governance posture",
    body: "The company surface should make legitimacy and control legible without turning into enterprise theater.",
    icon: Landmark,
  },
  {
    title: "Focused scope",
    body: "Afenda stays opinionated about finance, inventory, and operations instead of pretending to be every category at once.",
    icon: Target,
  },
  {
    title: "Shared accountability",
    body: "Teams move faster when responsibility and context remain visible across the same operating record.",
    icon: Users,
  },
] as const

export default function AboutPage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell tagline="Corporate identity, legitimacy, and operating stance">
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-primary/8" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Company"
            title="Afenda exists to make business truth harder to lose."
            description={
              <>
                The company story is not separate from the product story. It is
                the reason the product is built around accountable state,
                visible ownership, and operational proof in the first place.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Company Position"
            title="Corporate legitimacy should reinforce the operating model."
            description={
              <>
                This page owns why Afenda should be taken seriously as a
                business ERP company, while the flagship and product pages own
                how that stance becomes system behavior.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {COMPANY_SURFACES.map(({ title, body, icon: Icon }, index) => (
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
            Company CTA
          </div>
          <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
            Move from company stance into product mechanism and control posture.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            Readers should be able to trace the company claim into the truth
            engine and the trust model without feeling like they left the same
            public system.
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
              <Link to={MARKETING_PAGE_HREFS.trustCenter}>
                Visit Trust Center
              </Link>
            </Button>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-pretty text-muted-foreground">
            The company page owns legitimacy. It should not devolve into generic
            startup copy or duplicate the flagship hero.
          </p>
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
