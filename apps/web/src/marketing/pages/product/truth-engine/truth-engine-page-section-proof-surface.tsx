import { motion } from "framer-motion"

import {
  MarketingStructuralVerticalRulesBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { truthEngineEditorial } from "./truth-engine-page-editorial"

export interface TruthEnginePageSectionProofSurfaceProps {
  readonly reduceMotion: boolean
}

export function TruthEnginePageSectionProofSurface({
  reduceMotion,
}: TruthEnginePageSectionProofSurfaceProps) {
  const { proofSurface } = truthEngineEditorial
  const conditionsLabelId = "truth-engine-proof-conditions"

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="truth-engine-proof-heading"
    >
      <MarketingStructuralVerticalRulesBg
        gapPx={112}
        className="opacity-[0.03]"
      />

      <div className="relative z-[1]">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h2"
              id="truth-engine-proof-heading"
              kicker="Proof surface"
              title={proofSurface.title}
              titleClassName="max-w-[30ch] tracking-[-0.045em] text-balance"
            />
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
              {proofSurface.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...getMarketingReveal(reduceMotion, 0.06)}
            role="region"
            aria-labelledby={conditionsLabelId}
          >
            <p
              id={conditionsLabelId}
              className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase"
            >
              Proof conditions
            </p>
            <div className="mt-6">
              {proofSurface.conditions.map((condition, rowIndex) => (
                <div
                  key={condition.title}
                  className={`grid gap-3 border-t border-border/70 pt-6 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-6 ${rowIndex === 0 ? "border-t-0 pt-0" : ""}`}
                >
                  <div className="border-b border-border/60 pb-4 md:border-b-0 md:pb-0">
                    <span className="font-mono text-[10px] tracking-[0.24em] text-primary/90 uppercase">
                      {condition.title}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm leading-7 text-pretty text-foreground/95">
                      {condition.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.blockquote
          className="relative z-[1] mt-16 max-w-4xl border-l-2 border-primary/50 pl-6 md:mt-20 md:pl-8"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Product claim
          </p>
          <p className="mt-3 text-lg leading-8 text-pretty text-foreground/95">
            {proofSurface.closing}
          </p>
        </motion.blockquote>
      </div>
    </MarketingPageSection>
  )
}
