import { motion } from "framer-motion"

import {
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { truthEngineEditorial } from "./truth-engine-page-editorial"

export interface TruthEnginePageSectionContinuityModelProps {
  readonly reduceMotion: boolean
}

export function TruthEnginePageSectionContinuityModel({
  reduceMotion,
}: TruthEnginePageSectionContinuityModelProps) {
  const { continuityModel } = truthEngineEditorial
  const chainLabelId = "truth-engine-continuity-chain"

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      aria-labelledby="truth-engine-continuity-heading"
    >
      <MarketingStructuralGridBg sizePx={36} className="opacity-[0.045]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1]">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="truth-engine-continuity-heading"
            kicker="Continuity model"
            title={continuityModel.title}
            description={continuityModel.intro}
            titleClassName="max-w-[38ch] tracking-[-0.045em] text-balance"
          />
        </motion.div>

        <motion.div
          className="mt-12 space-y-4"
          {...getMarketingReveal(reduceMotion, 0.05)}
        >
          <p
            id={chainLabelId}
            className="font-mono text-[11px] tracking-[0.22em] text-foreground uppercase"
          >
            Product continuity chain
          </p>
          <div
            className="overflow-x-auto [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-labelledby={chainLabelId}
          >
            <ol className="flex min-w-[min(100%,72rem)] flex-col divide-y divide-border/70 md:min-w-0 md:flex-row md:divide-x md:divide-y-0">
              {continuityModel.chain.map((step, index) => (
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

        <motion.aside
          className="relative z-[1] mt-12 max-w-4xl border-l-2 border-primary/40 pl-6"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          <p className="text-sm leading-7 text-pretty text-muted-foreground">
            {continuityModel.note}
          </p>
        </motion.aside>
      </div>
    </MarketingPageSection>
  )
}
