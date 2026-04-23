import { motion } from "framer-motion"

import {
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { erpBenchmarkEditorial } from "./erp-benchmark-page-editorial"

export interface ErpBenchmarkPageSectionIdentityProps {
  readonly reduceMotion: boolean
}

export function ErpBenchmarkPageSectionIdentity({
  reduceMotion,
}: ErpBenchmarkPageSectionIdentityProps) {
  const { opening } = erpBenchmarkEditorial

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      aria-labelledby="erp-benchmark-hero-heading"
    >
      <MarketingStructuralGridBg className="opacity-[0.05]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,24rem)] lg:items-start lg:gap-16">
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
                id="erp-benchmark-hero-heading"
                kicker={opening.eyebrow}
                title={opening.headline}
                titleClassName="max-w-[15ch] text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-[-0.07em] text-balance"
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
              Reference axes
            </p>
            <ol className="mt-6 border-t border-border/70">
              {opening.referenceAxes.map((axis, index) => (
                <li
                  key={axis.label}
                  className="grid gap-2 border-b border-border/60 py-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.16em] text-foreground uppercase">
                      {axis.label}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-pretty text-foreground/90">
                    {axis.detail}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </motion.aside>
      </div>
    </MarketingPageSection>
  )
}
