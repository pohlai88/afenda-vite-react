import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  FileCheck,
  Globe2,
  Landmark,
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

type PdpaSurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const PDPA_SURFACES: readonly PdpaSurface[] = [
  {
    title: "Regional privacy clarity",
    body: "PDPA content should make regional privacy obligations readable for organizations operating in or with Southeast Asia.",
    icon: Globe2,
  },
  {
    title: "Control mapping",
    body: "Readers need to see how policy expectations connect to operational controls and data-handling behavior.",
    icon: ShieldCheck,
  },
  {
    title: "Governance accountability",
    body: "A region-specific legal page still has to show who owns the posture and how responsibility is framed.",
    icon: Landmark,
  },
  {
    title: "Readable evidence",
    body: "If the page cannot be scanned under review conditions, it is failing the job legal content is supposed to do.",
    icon: FileCheck,
  },
] as const

export default function PdpaPage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell tagline="Regional privacy and governance posture">
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-background to-primary/10" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Legal"
            title="PDPA belongs inside the same trust system, not outside the product story."
            description={
              <>
                This route gives the marketing tree a descriptive, region-aware
                policy surface without breaking the design and governance logic
                established by the flagship, trust, and privacy pages.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="PDPA Surface"
            title="Regional policy pages should be specific, navigable, and operationally connected."
            description={
              <>
                PDPA is not just a compliance acronym. It is a signal that the
                public surface can handle regional governance requirements
                without collapsing into ad hoc page design.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PDPA_SURFACES.map(({ title, body, icon: Icon }, index) => (
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
            PDPA CTA
          </div>
          <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
            Move from regional policy into broader privacy and regional rollout
            context.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            Region-specific pages should connect policy detail back to the wider
            public system so trust remains cumulative across routes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="touch-manipulation">
              <Link to={MARKETING_PAGE_HREFS.privacyPolicy}>
                Open Privacy Policy
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="touch-manipulation border-border/70 bg-background/75"
            >
              <Link to={MARKETING_PAGE_HREFS.asiaPacific}>
                View Asia Pacific
              </Link>
            </Button>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-pretty text-muted-foreground">
            The naming is stable and descriptive on purpose. This route exists
            to satisfy a governed legal domain, not to act as a temporary
            campaign page.
          </p>
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
