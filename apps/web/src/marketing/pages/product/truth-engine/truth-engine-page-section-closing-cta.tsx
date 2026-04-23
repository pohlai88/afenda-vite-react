import { motion } from "framer-motion"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { truthEngineEditorial } from "./truth-engine-page-editorial"

export interface TruthEnginePageSectionClosingCtaProps {
  readonly reduceMotion: boolean
}

export function TruthEnginePageSectionClosingCta({
  reduceMotion,
}: TruthEnginePageSectionClosingCtaProps) {
  const { cta } = truthEngineEditorial

  return (
    <MarketingPageSection aria-labelledby="truth-engine-closing-cta-heading">
      <motion.div
        className="border-t-2 border-foreground/15 pt-10 md:pt-14"
        {...getMarketingReveal(reduceMotion)}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-14">
          <div>
            <MarketingSectionHeading
              as="h2"
              id="truth-engine-closing-cta-heading"
              kicker="Next"
              title={cta.title}
              description={<p>{cta.body}</p>}
              titleClassName="max-w-[36ch] tracking-[-0.045em] text-balance"
            />

            <div className="mt-10 flex w-full flex-col border-t border-border/70 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {cta.actions.map((action, index) => (
                <Button
                  key={action.to}
                  asChild
                  size="lg"
                  variant={index === 0 ? "default" : "outline"}
                  className={
                    index === 0
                      ? "touch-manipulation"
                      : "touch-manipulation border-border/70 bg-transparent"
                  }
                >
                  <Link to={action.to}>{action.label}</Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-l-2 border-border/70 pl-6 lg:pl-8">
            <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Route function
            </p>
            <p className="mt-4 text-sm leading-7 text-pretty text-foreground/92">
              {cta.note}
            </p>
          </div>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}
