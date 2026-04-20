import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  Building2,
  Database,
  FileCheck,
  ShieldCheck,
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

type GovernanceSurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const GOVERNANCE_SURFACES: readonly GovernanceSurface[] = [
  {
    title: "Scope discipline",
    body: "Truth stays grounded in the correct operating context, including the business boundary the work belongs to.",
    icon: Building2,
  },
  {
    title: "Lineage visibility",
    body: "Data movement is easier to defend when the system preserves what changed, why it changed, and who moved it.",
    icon: Database,
  },
  {
    title: "Policy alignment",
    body: "Governance surfaces should explain how operational behavior lines up with reporting and review expectations.",
    icon: FileCheck,
  },
  {
    title: "Control narrative",
    body: "A legal page still needs a usable structure so policy information remains readable under pressure.",
    icon: ShieldCheck,
  },
] as const

export default function DataGovernancePage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell
      badges={["Legal and Trust", "Data Governance"]}
      tagline="Governance page scaffold for reusable marketing quality"
    >
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-primary/8" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Data Governance"
            title="Governance pages should be precise, readable, and operationally relevant."
            description={
              <>
                Afenda's marketing shell can support policy and governance
                surfaces without turning them into generic legal dumps. The page
                remains structured around business consequence and clarity.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Governance Model"
            title="Use the shell to keep legal content structured under real review conditions."
            description={
              <>
                Reusable scaffolds matter here because data governance pages are
                often where product sites collapse into inconsistent spacing,
                weak hierarchy, and unreadable policy blocks.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {GOVERNANCE_SURFACES.map(({ title, body, icon: Icon }, index) => (
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
            kicker="Governance CTA"
            title="Keep governance pages connected to the product story."
            description={
              <>
                Legal and trust pages should reinforce the operating model, not
                feel like a separate website with lower standards.
              </>
            }
            links={[
              {
                label: "Open Trust Center",
                to: MARKETING_PAGE_HREFS.trustCenter,
              },
              {
                label: "View Benchmark Campaign",
                to: MARKETING_PAGE_HREFS.erpBenchmarkCampaign,
                variant: "outline",
              },
            ]}
            aside={
              <>
                The shell components are built so additional legal pages can
                reuse the same frame without hiding policy content inside vague
                wrappers.
              </>
            }
          />
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
