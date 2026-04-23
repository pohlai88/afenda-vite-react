import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  MarketingStructuralVerticalRulesBg,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutSection04PrinciplesProps {
  readonly reduceMotion: boolean
}

export function AboutSection04Principles({
  reduceMotion,
}: AboutSection04PrinciplesProps) {
  const { principles } = aboutPageContent

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="about-page-section-04-heading"
    >
      <MarketingStructuralVerticalRulesBg
        gapPx={96}
        className="opacity-[0.035]"
      />

      <div className="relative z-[1]">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="about-page-section-04-heading"
            kicker="Section 04"
            title={principles.title}
            titleClassName="max-w-[36ch] tracking-[-0.045em] text-balance"
          />
        </motion.div>

        <ol className="relative mt-14 space-y-0">
          {principles.items.map((item, index) => (
            <motion.li
              key={item.title}
              className="grid gap-6 border-t border-border/70 py-10 md:grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)] md:gap-10 md:py-12"
              {...getMarketingReveal(reduceMotion, index * 0.04)}
            >
              <div className="flex md:block">
                <span className="inline-flex size-10 shrink-0 items-center justify-center border border-dashed border-border/80 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.035em] text-balance">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </MarketingPageSection>
  )
}
