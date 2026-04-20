import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  BarChart3,
  Building2,
  GitBranch,
  Landmark,
  Package,
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

type BenchmarkCard = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const BUYER_SURFACES: readonly BenchmarkCard[] = [
  {
    title: "Ledger speed buyers expect",
    body: "Zoho and QuickBooks set the bar for approachable workflows and fast team adoption.",
    icon: Building2,
  },
  {
    title: "Control enterprise teams expect",
    body: "Oracle and SAP set the bar for governance, scope discipline, and reporting consequence.",
    icon: Landmark,
  },
  {
    title: "Operational unity Afenda insists on",
    body: "Afenda keeps inventory, finance, and execution on one proof surface instead of forcing reconciliation later.",
    icon: GitBranch,
  },
] as const

const EVALUATION_ROWS: readonly BenchmarkCard[] = [
  {
    title: "Finance consequence",
    body: "Can the number defend itself without spreadsheet rescue or manual explanation?",
    icon: BarChart3,
  },
  {
    title: "Inventory continuity",
    body: "Does stock movement preserve the business cause that changed the state?",
    icon: Package,
  },
  {
    title: "Governance readiness",
    body: "Can approvals, ownership, and audit evidence stay visible before review pressure arrives?",
    icon: ShieldCheck,
  },
] as const

export default function ErpBenchmarkCampaignPage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell
      badges={["Campaign Surface", "ERP Benchmark"]}
      tagline="Campaign shell for benchmark-led ERP narratives"
    >
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background to-secondary/8" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h1"
              kicker="ERP Benchmark Campaign"
              title="Compare the ERP benchmark without losing the Afenda point of view."
              description={
                <>
                  This campaign surface translates the same benchmark buyers use
                  for SAP, Oracle, Zoho, and QuickBooks into a sharper question:
                  which system preserves business truth while the work is still
                  happening?
                </>
              }
              titleClassName="max-w-5xl text-[clamp(3.1rem,8vw,6.2rem)] leading-[0.9] tracking-[-0.07em]"
            />
          </motion.div>

          <motion.div
            className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-primary/5"
            {...getMarketingReveal(reduceMotion, 0.08)}
          >
            <div className="grid gap-3">
              {BUYER_SURFACES.map(({ title, body, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border/60 bg-background/80 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon
                        aria-hidden="true"
                        className="size-5 text-primary"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Evaluation Standard"
            title="Use the benchmark names, but judge the operating model."
            description={
              <>
                Buyers often compare feature checklists. Afenda wins when the
                team also compares continuity, evidence, and cross-functional
                trust under pressure.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {EVALUATION_ROWS.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              {...getMarketingReveal(reduceMotion, index * 0.06)}
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

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Afenda Position"
            title="The suite can be benchmarked. The record still has to stay accountable."
            description={
              <>
                Afenda is not trying to cosplay a larger suite. It is a modern
                business ERP that keeps the record bound from operational event
                to financial consequence.
              </>
            }
          />
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap gap-3"
          {...getMarketingReveal(reduceMotion, 0.08)}
        >
          {[
            "One accountable record",
            "Cross-domain continuity",
            "Audit-ready workflow",
            "Benchmark-aware positioning",
          ].map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="border-border/70 bg-background/75 px-4 py-2 text-sm text-foreground"
            >
              {item}
            </Badge>
          ))}
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection>
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingCallToActionPanel
            kicker="Campaign CTA"
            title="Bring the benchmark conversation onto Afenda's terms."
            description={
              <>
                Show buyers the suites they already know, then show them the
                stronger operating standard they are actually missing.
              </>
            }
            links={[
              { label: "View Flagship", to: MARKETING_PAGE_HREFS.flagship },
              {
                label: "Open Trust Center",
                to: MARKETING_PAGE_HREFS.trustCenter,
                variant: "outline",
              },
            ]}
            aside={
              <>
                Reusable shell components in this page are intentionally generic
                enough for campaigns, legal, and future product surfaces without
                collapsing into a flat dump of wrappers.
              </>
            }
          />
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
