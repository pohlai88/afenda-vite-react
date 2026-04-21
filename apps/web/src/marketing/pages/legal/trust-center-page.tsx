import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
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

type TrustSurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const TRUST_SURFACES: readonly TrustSurface[] = [
  {
    title: "Attributable records",
    body: "Business state remains tied to source, actor, and consequence so trust starts with the record itself.",
    icon: Fingerprint,
  },
  {
    title: "Access discipline",
    body: "Role-aware operating boundaries help teams understand who can see, move, and approve consequential work.",
    icon: Users,
  },
  {
    title: "Control visibility",
    body: "Finance and operations can review proof without waiting for a parallel narrative to be reconstructed.",
    icon: ShieldCheck,
  },
  {
    title: "Security posture",
    body: "The trust story is presented as a system of controls, not a collection of isolated promises.",
    icon: LockKeyhole,
  },
] as const

export default function TrustCenterPage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell tagline="Reusable marketing shell for trust and governance pages">
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/8" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Trust Center"
            title="Operational trust starts before audit and survives after it."
            description={
              <>
                This surface explains how Afenda approaches proof, control, and
                accountability for organizations evaluating ERP platforms that
                need both velocity and discipline.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Control Surfaces"
            title="Trust is presented as a system, not a slogan."
            description={
              <>
                The marketing shell stays consistent while the page content
                shifts into legal and governance concerns. That keeps the
                experience coherent without flattening the domain.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {TRUST_SURFACES.map(({ title, body, icon: Icon }, index) => (
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
            Trust CTA
          </div>
          <h2 className="mt-4 max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
            Follow the trust model into governance detail.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            Trust pages should move people toward clearer governance, not bury
            them under an abstract promise stack.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="touch-manipulation">
              <Link to={MARKETING_PAGE_HREFS.dataGovernance}>
                Open Data Governance
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="touch-manipulation border-border/70 bg-background/75"
            >
              <Link to={MARKETING_PAGE_HREFS.flagship}>Return to Flagship</Link>
            </Button>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-pretty text-muted-foreground">
            This legal surface should stay consistent with the rest of the
            marketing tree without pushing CTA composition back into a shared
            component.
          </p>
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
