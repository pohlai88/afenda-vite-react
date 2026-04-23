import { motion } from "framer-motion"

import {
  MarketingStructuralVerticalRulesBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { truthEngineEditorial } from "./truth-engine-page-editorial"

export interface TruthEnginePageSectionOperatingLawProps {
  readonly reduceMotion: boolean
}

export function TruthEnginePageSectionOperatingLaw({
  reduceMotion,
}: TruthEnginePageSectionOperatingLawProps) {
  const { operatingLaw } = truthEngineEditorial

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="truth-engine-operating-law-heading"
    >
      <MarketingStructuralVerticalRulesBg
        gapPx={96}
        className="opacity-[0.035]"
      />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start lg:gap-16">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="truth-engine-operating-law-heading"
            kicker="Operating law"
            title={operatingLaw.title}
            titleClassName="max-w-[30ch] tracking-[-0.045em] text-balance"
          />
          <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
            {operatingLaw.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.div {...getMarketingReveal(reduceMotion, 0.06)}>
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Charter
          </p>
          <ol className="mt-6 border-t border-border/70">
            {operatingLaw.laws.map((law, index) => (
              <li
                key={law.title}
                className="grid gap-4 border-b border-border/60 py-6 md:grid-cols-[minmax(0,5.25rem)_minmax(0,1fr)] md:gap-8"
              >
                <div className="flex md:block">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center border border-dashed border-border/80 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.035em] text-balance">
                    {law.title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-pretty text-muted-foreground">
                    {law.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </MarketingPageSection>
  )
}
