import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  BarChart3,
  Fingerprint,
  GitBranch,
  Layers3,
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

type TruthEngineSurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const TRUTH_ENGINE_SURFACES: readonly TruthEngineSurface[] = [
  {
    title: "Origin stays attributable",
    body: "Every consequential number needs a visible source, actor, and decision path before it earns trust.",
    icon: Fingerprint,
  },
  {
    title: "State change stays causal",
    body: "Orders, inventory movement, and ledger consequence remain attached to the business event that made them valid.",
    icon: GitBranch,
  },
  {
    title: "Cross-domain context stays intact",
    body: "Finance, operations, and inventory read from one continuity chain instead of parallel narratives stitched together later.",
    icon: Layers3,
  },
  {
    title: "Reporting stays defensible",
    body: "The output matters because the underlying record can still explain itself under review pressure.",
    icon: BarChart3,
  },
] as const

export default function TruthEnginePage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell
      badges={["Product Surface", "Truth Engine"]}
      tagline="Product architecture and platform meaning"
    >
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-accent/8" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Product"
            title="The truth engine is the operating logic behind Afenda."
            description={
              <>
                This page explains the product layer beneath the flagship
                narrative: why Afenda treats proof, continuity, and accountable
                state as first-class ERP behavior rather than reporting cleanup.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Operating Law"
            title="Afenda does not treat the record as an after-image of the workflow."
            description={
              <>
                The product stance is simple: if a business state matters, the
                system should preserve the evidence that made it true while work
                is still happening.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {TRUTH_ENGINE_SURFACES.map(({ title, body, icon: Icon }, index) => (
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
            kicker="Product CTA"
            title="See the product logic in the flagship, then test it against the ERP benchmark."
            description={
              <>
                Product pages should clarify the mechanism, not repeat the
                slogan. The route tree stays connected so readers can move from
                architecture to narrative to benchmark without losing context.
              </>
            }
            links={[
              { label: "Open Flagship", to: MARKETING_PAGE_HREFS.flagship },
              {
                label: "View Benchmark ERP",
                to: MARKETING_PAGE_HREFS.benchmarkErp,
                variant: "outline",
              },
            ]}
            aside={
              <>
                This page owns product meaning. It does not borrow campaign or
                legal framing to explain what the system actually is.
              </>
            }
          />
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
