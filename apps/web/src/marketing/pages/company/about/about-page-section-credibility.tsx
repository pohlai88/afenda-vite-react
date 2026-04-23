import { motion } from "framer-motion"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutSection05CredibilityProps {
  readonly reduceMotion: boolean
}

export function AboutSection05Credibility({
  reduceMotion,
}: AboutSection05CredibilityProps) {
  const { credibility } = aboutPageContent

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="about-page-section-05-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border/50"
        aria-hidden="true"
      />

      <div className="relative z-[1]">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h2"
            id="about-page-section-05-heading"
            kicker="Section 05"
            title={credibility.title}
            titleClassName="max-w-[36ch] tracking-[-0.045em] text-balance"
          />
          <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
            {credibility.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-14"
          {...getMarketingReveal(reduceMotion, 0.06)}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Structural signals
          </p>
          <ul
            className="mt-4 border-t border-border/70"
            aria-label="Structural credibility signals"
          >
            {credibility.signals.map((signal) => (
              <li
                key={signal}
                className="flex gap-4 border-b border-border/60 py-4 pl-1"
              >
                <span
                  className="mt-2 h-px w-6 shrink-0 bg-primary/45"
                  aria-hidden="true"
                />
                <span className="text-sm leading-7 text-foreground/95">
                  {signal}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </MarketingPageSection>
  )
}
