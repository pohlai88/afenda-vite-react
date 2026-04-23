import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  MarketingStructuralVerticalRulesBg,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutSection01InterrogationProps {
  readonly reduceMotion: boolean
}

export function AboutSection01Interrogation({
  reduceMotion,
}: AboutSection01InterrogationProps) {
  const { interrogation } = aboutPageContent

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="about-page-section-01-heading"
    >
      <MarketingStructuralVerticalRulesBg />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-20">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="about-page-section-01-heading"
            kicker="Section 01"
            title={interrogation.title}
            titleClassName="max-w-[28ch] tracking-[-0.045em] text-balance"
          />
          <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
            {interrogation.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.aside
          className="lg:sticky lg:top-28 lg:self-start"
          {...getMarketingReveal(reduceMotion, 0.08)}
        >
          <div className="border-l-2 border-primary/40 pt-1 pl-6">
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Margin
            </p>
            <p className="mt-4 text-sm leading-7 text-pretty text-foreground/95">
              {interrogation.sideNote}
            </p>
          </div>
        </motion.aside>
      </div>
    </MarketingPageSection>
  )
}
