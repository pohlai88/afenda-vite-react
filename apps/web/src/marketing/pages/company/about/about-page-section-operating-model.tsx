import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutSection03OperatingModelProps {
  readonly reduceMotion: boolean
}

export function AboutSection03OperatingModel({
  reduceMotion,
}: AboutSection03OperatingModelProps) {
  const { operatingModel } = aboutPageContent

  const chainLabelId = "about-page-section-03-chain"

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      aria-labelledby="about-page-section-03-heading"
    >
      <MarketingStructuralGridBg sizePx={36} className="opacity-[0.045]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1]">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="about-page-section-03-heading"
            kicker="Section 03"
            title={operatingModel.title}
            description={operatingModel.intro}
            titleClassName="max-w-[40ch] tracking-[-0.045em] text-balance"
          />
        </motion.div>

        <motion.div
          className="mt-12 space-y-4"
          {...getMarketingReveal(reduceMotion, 0.05)}
        >
          <p
            id={chainLabelId}
            className="font-mono text-xs tracking-[0.2em] text-foreground uppercase"
          >
            Truth-binding chain
          </p>
          <div
            className="overflow-x-auto [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-labelledby={chainLabelId}
          >
            <ol className="flex min-w-[min(100%,72rem)] flex-col divide-y divide-border/70 md:min-w-0 md:flex-row md:divide-x md:divide-y-0">
              {operatingModel.chain.map((step, index) => (
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
                  <p className="text-sm leading-6 text-pretty text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <motion.aside
          className="relative z-[1] mt-12 max-w-4xl border-l-2 border-primary/40 pl-6"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          <p className="text-sm leading-7 text-pretty text-muted-foreground">
            {operatingModel.closing}
          </p>
        </motion.aside>
      </div>
    </MarketingPageSection>
  )
}
