import { motion } from "framer-motion"
import { Link } from "react-router-dom"

import { Button } from "@afenda/design-system/ui-primitives"

import {
  MarketingPageSection,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../../../components"
import { aboutPageContent } from "./about-page-editorial"

export interface AboutFooterCtaProps {
  readonly reduceMotion: boolean
}

export function AboutFooterCta({ reduceMotion }: AboutFooterCtaProps) {
  const { footer } = aboutPageContent

  return (
    <MarketingPageSection aria-labelledby="about-page-footer-heading">
      <motion.div
        className="border-t-2 border-foreground/15 pt-10 md:pt-14"
        {...getMarketingReveal(reduceMotion)}
      >
        <MarketingSectionHeading
          as="h2"
          id="about-page-footer-heading"
          kicker="Footer"
          title={footer.title}
          description={<p>{footer.body}</p>}
          titleClassName="max-w-[34ch] tracking-[-0.045em] text-balance"
        />

        <div className="mt-10 flex w-full flex-col border-t border-border/70 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {footer.actions.map((action, index) => (
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

        <p className="mt-12 max-w-3xl border-l-2 border-primary/35 pl-5 text-sm leading-7 text-pretty text-muted-foreground">
          {footer.note}
        </p>
      </motion.div>
    </MarketingPageSection>
  )
}
