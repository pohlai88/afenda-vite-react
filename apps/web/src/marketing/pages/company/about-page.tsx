import {
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

import {
  MarketingCallToActionPanel,
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
    <MarketingPageShell
      badges={["Company Surface", "About Afenda"]}
      tagline="Corporate identity, legitimacy, and operating stance"
    >
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
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingCallToActionPanel
            kicker="Company CTA"
            title="Move from company stance into product mechanism and control posture."
            description={
              <>
                Readers should be able to trace the company claim into the truth
                engine and the trust model without feeling like they left the
                same public system.
              </>
            }
            links={[
              {
                label: "Open Truth Engine",
                to: MARKETING_PAGE_HREFS.truthEngine,
              },
              {
                label: "Visit Trust Center",
                to: MARKETING_PAGE_HREFS.trustCenter,
                variant: "outline",
              },
            ]}
            aside={
              <>
                The company page owns legitimacy. It should not devolve into
                generic startup copy or duplicate the flagship hero.
              </>
            }
          />
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
