import { motion } from "framer-motion"

import {
  MarketingStructuralBaseline,
  MarketingStructuralGridBg,
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { erpBenchmarkEditorial } from "./erp-benchmark-page-editorial"

export interface ErpBenchmarkPageSectionEvaluationModelProps {
  readonly reduceMotion: boolean
}

export function ErpBenchmarkPageSectionEvaluationModel({
  reduceMotion,
}: ErpBenchmarkPageSectionEvaluationModelProps) {
  const { evaluationModel } = erpBenchmarkEditorial
  const traceLabelId = "erp-benchmark-continuity-trace"

  return (
    <MarketingPageSection
      className="relative overflow-hidden border-b border-border/70"
      aria-labelledby="erp-benchmark-evaluation-heading"
    >
      <MarketingStructuralGridBg sizePx={36} className="opacity-[0.045]" />
      <MarketingStructuralBaseline />

      <div className="relative z-[1] grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,22rem)] lg:items-start lg:gap-16">
        <div>
          <motion.div {...getMarketingReveal(reduceMotion)}>
            <MarketingSectionHeading
              as="h2"
              id="erp-benchmark-evaluation-heading"
              kicker="Evaluation model"
              title={evaluationModel.title}
              description={evaluationModel.intro}
              titleClassName="max-w-[34ch] tracking-[-0.045em] text-balance"
            />
          </motion.div>

          <motion.div
            className="mt-12 space-y-4"
            {...getMarketingReveal(reduceMotion, 0.05)}
          >
            <p
              id={traceLabelId}
              className="font-mono text-[11px] tracking-[0.22em] text-foreground uppercase"
            >
              Continuity trace
            </p>
            <div
              className="overflow-x-auto [-webkit-overflow-scrolling:touch]"
              role="region"
              aria-labelledby={traceLabelId}
            >
              <ol className="flex min-w-[min(100%,72rem)] flex-col divide-y divide-border/70 md:min-w-0 md:flex-row md:divide-x md:divide-y-0">
                {evaluationModel.trace.map((step, index) => (
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

          <motion.p
            className="mt-12 max-w-4xl border-l-2 border-primary/40 pl-6 text-sm leading-7 text-pretty text-muted-foreground"
            {...getMarketingReveal(reduceMotion, 0.1)}
          >
            {evaluationModel.note}
          </motion.p>
        </div>

        <motion.aside
          className="lg:sticky lg:top-28 lg:self-start"
          {...getMarketingReveal(reduceMotion, 0.08)}
        >
          <div className="border-l-2 border-border/70 pl-6 lg:pl-8">
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Pressure tests
            </p>
            <ol className="mt-6 border-t border-border/70">
              {evaluationModel.tests.map((test, index) => (
                <li
                  key={test.title}
                  className="border-b border-border/60 py-5 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-mono text-[11px] tracking-[0.14em] text-foreground uppercase">
                      {test.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-pretty text-foreground/92">
                    {test.description}
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
