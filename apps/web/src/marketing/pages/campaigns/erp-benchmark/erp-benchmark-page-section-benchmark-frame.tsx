import { motion } from "framer-motion"

import {
  MarketingStructuralVerticalRulesBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { erpBenchmarkEditorial } from "./erp-benchmark-page-editorial"

export interface ErpBenchmarkPageSectionBenchmarkFrameProps {
  readonly reduceMotion: boolean
}

export function ErpBenchmarkPageSectionBenchmarkFrame({
  reduceMotion,
}: ErpBenchmarkPageSectionBenchmarkFrameProps) {
  const { benchmarkFrame } = erpBenchmarkEditorial
  const matrixLabelId = "erp-benchmark-matrix"

  return (
    <MarketingPageSection
      className="relative border-b border-border/70"
      aria-labelledby="erp-benchmark-frame-heading"
    >
      <MarketingStructuralVerticalRulesBg
        gapPx={96}
        className="opacity-[0.035]"
      />

      <div className="relative z-[1]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-16">
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h2"
              id="erp-benchmark-frame-heading"
              kicker="Reference frame"
              title={benchmarkFrame.title}
              titleClassName="max-w-[28ch] tracking-[-0.045em] text-balance"
            />
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pretty text-muted-foreground">
              {benchmarkFrame.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...getMarketingReveal(reduceMotion, 0.06)}
            role="region"
            aria-labelledby={matrixLabelId}
          >
            <p
              id={matrixLabelId}
              className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase"
            >
              Benchmark matrix
            </p>
            <div className="mt-6 overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <div className="min-w-[56rem] border-t border-border/70">
                <div className="grid grid-cols-[11rem_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-x-6 border-b border-border/70 py-3">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    System
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    Trains buyers to value
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    Still leaves open
                  </div>
                </div>

                {benchmarkFrame.matrix.map((item, index) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-[11rem_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-x-6 border-b border-border/60 py-5"
                  >
                    <div className="pr-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 text-base font-semibold tracking-[-0.03em] text-foreground">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm leading-7 text-pretty text-muted-foreground">
                      {item.benchmarkUse}
                    </p>
                    <p className="text-sm leading-7 text-pretty text-foreground/92">
                      {item.missing}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          className="mt-12 max-w-4xl border-l-2 border-primary/45 pl-6 text-sm leading-7 text-pretty text-foreground/92"
          {...getMarketingReveal(reduceMotion, 0.1)}
        >
          {benchmarkFrame.footer}
        </motion.p>
      </div>
    </MarketingPageSection>
  )
}
