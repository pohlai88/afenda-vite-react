import { Button } from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"

import {
  MarketingPageSection,
  MarketingPageShell,
  MarketingSectionHeading,
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  MarketingStructuralVerticalRulesBg,
  getMarketingReveal,
} from "../../../components"
import { dataGovernanceEditorial } from "./governance-data-page-editorial"

interface SectionProps {
  readonly reduceMotion: boolean
}

function DataGovernanceIdentitySection({ reduceMotion }: SectionProps) {
  const { opening } = dataGovernanceEditorial

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      aria-labelledby="data-governance-hero-heading"
    >
      <MarketingStructuralGridBg className="opacity-[0.05]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,22rem)] lg:items-start lg:gap-16">
        <div className="grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
          <div
            className="relative hidden w-px shrink-0 lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-0 w-px bg-border/55" />
            <div className="absolute top-0 left-0 h-16 w-px bg-primary/45" />
          </div>

          <div>
            <motion.div {...getMarketingReveal(reduceMotion)}>
              <MarketingSectionHeading
                as="h1"
                id="data-governance-hero-heading"
                kicker={opening.eyebrow}
                title={opening.headline}
                titleClassName="max-w-[14ch] text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em] text-balance"
              />
              <p className="mt-8 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
                {opening.thesis}
              </p>
            </motion.div>

            <motion.p
              className="mt-12 max-w-xl border-l-2 border-primary/45 pl-5"
              {...getMarketingReveal(reduceMotion, 0.08)}
            >
              <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/80 uppercase">
                Annotation
              </span>
              <span className="mt-2 block text-sm leading-7 text-foreground/90">
                {opening.annotation}
              </span>
            </motion.p>
          </div>
        </div>

        <motion.aside
          className="lg:sticky lg:top-28 lg:self-start"
          {...getMarketingReveal(reduceMotion, 0.06)}
        >
          <div className="border-l-2 border-border/70 pl-6 lg:pl-8">
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Governance rails
            </p>
            <ol className="mt-6 border-t border-border/70">
              {opening.rails.map((rail, index) => (
                <li key={rail} className="border-b border-border/60 py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-right text-sm leading-7 text-foreground/92">
                      {rail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.aside>
      </div>
    </MarketingPageSection>
  )
}

function DataGovernanceModelSection({ reduceMotion }: SectionProps) {
  const { governanceModel } = dataGovernanceEditorial

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="data-governance-model-heading"
    >
      <MarketingStructuralVerticalRulesBg
        gapPx={104}
        className="opacity-[0.03]"
      />

      <div className="relative z-[1]">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start lg:gap-16">
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h2"
              id="data-governance-model-heading"
              kicker="Governance model"
              title={governanceModel.title}
              titleClassName="max-w-[34ch] tracking-[-0.045em] text-balance"
            />
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
              {governanceModel.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div {...getMarketingReveal(reduceMotion, 0.06)}>
            {governanceModel.matrix.map((item, rowIndex) => (
              <div
                key={item.title}
                className={`grid gap-3 border-t border-border/70 pt-6 md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] md:gap-6 ${rowIndex === 0 ? "border-t-0 pt-0" : ""}`}
              >
                <div className="border-b border-border/60 pb-4 md:border-b-0 md:pb-0">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-primary/90 uppercase">
                    {item.title}
                  </span>
                </div>
                <div>
                  <p className="text-sm leading-7 text-pretty text-foreground/95">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </MarketingPageSection>
  )
}

function DataGovernanceEvidenceSection({ reduceMotion }: SectionProps) {
  const { evidence } = dataGovernanceEditorial
  const chainLabelId = "data-governance-chain"

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      aria-labelledby="data-governance-evidence-heading"
    >
      <MarketingStructuralGridBg sizePx={36} className="opacity-[0.045]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1]">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="data-governance-evidence-heading"
            kicker="Evidence chain"
            title={evidence.title}
            titleClassName="max-w-[34ch] tracking-[-0.045em] text-balance"
          />
          <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
            {evidence.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-12 space-y-4"
          {...getMarketingReveal(reduceMotion, 0.05)}
        >
          <p
            id={chainLabelId}
            className="font-mono text-[11px] tracking-[0.22em] text-foreground uppercase"
          >
            Governance evidence chain
          </p>
          <div
            className="overflow-x-auto [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-labelledby={chainLabelId}
          >
            <ol className="flex min-w-[min(100%,68rem)] flex-col divide-y divide-border/70 md:min-w-0 md:flex-row md:divide-x md:divide-y-0">
              {evidence.chain.map((step, index) => (
                <li
                  key={step.label}
                  className="relative flex flex-1 flex-col gap-3 p-5 md:p-6"
                >
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 left-0 z-[1] hidden -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] text-muted-foreground md:block"
                    >
                      →
                    </span>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-right font-mono text-[11px] font-semibold tracking-[0.1em] text-primary uppercase">
                      {step.label}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-pretty text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <motion.blockquote
          className="mt-12 max-w-4xl border-l-2 border-primary/50 pl-6"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Governance claim
          </p>
          <p className="mt-3 text-lg leading-8 text-pretty text-foreground/95">
            {evidence.closing}
          </p>
        </motion.blockquote>
      </div>
    </MarketingPageSection>
  )
}

function DataGovernanceClosingSection({ reduceMotion }: SectionProps) {
  const { cta } = dataGovernanceEditorial

  return (
    <MarketingPageSection aria-labelledby="data-governance-closing-heading">
      <motion.div
        className="border-t-2 border-foreground/15 pt-10 md:pt-14"
        {...getMarketingReveal(reduceMotion)}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-14">
          <div>
            <MarketingSectionHeading
              as="h2"
              id="data-governance-closing-heading"
              kicker="Next"
              title={cta.title}
              description={<p>{cta.body}</p>}
              titleClassName="max-w-[34ch] tracking-[-0.045em] text-balance"
            />

            <div className="mt-10 flex w-full flex-col border-t border-border/70 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {cta.actions.map((action, index) => (
                <Button
                  key={action.to}
                  asChild
                  size="lg"
                  variant={index === 0 ? "default" : "outline"}
                  className={
                    index === 0
                      ? "touch-manipulation"
                      : "touch-manipulation border-border/70 bg-transparent"
                  }
                >
                  <Link to={action.to}>{action.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-l-2 border-border/70 pl-6 lg:pl-8">
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Route function
            </p>
            <p className="mt-4 text-sm leading-7 text-pretty text-foreground/92">
              {cta.note}
            </p>
          </div>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}

export default function GovernanceDataPage() {
  const reduceMotion = !!useReducedMotion()
  const { shell } = dataGovernanceEditorial

  return (
    <MarketingPageShell title={shell.title} tagline={shell.tagline}>
      <DataGovernanceIdentitySection reduceMotion={reduceMotion} />
      <DataGovernanceModelSection reduceMotion={reduceMotion} />
      <DataGovernanceEvidenceSection reduceMotion={reduceMotion} />
      <DataGovernanceClosingSection reduceMotion={reduceMotion} />
    </MarketingPageShell>
  )
}
