/**
 * Flagship page refactor boundary.
 * Owns only the close CTA section for `apps/web` marketing flagship.
 * Do not mix page composition, editorial source, or shared motion here.
 * Page order lives in `flagship-page.tsx`.
 * Copy contract lives in `flagship-page-editorial.ts`.
 * Motion helpers live in `flagship-page-motion.ts`.
 */
import { Button } from "@afenda/design-system/ui-primitives"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"
import { getMarketingPageSectionReveal } from "./flagship-page-motion"

export interface FlagshipPageCloseCtaProps {
  readonly reduceMotion: boolean
}

const { narrative } = FLAGSHIP_PAGE_CONTENT

function AfendaBrand() {
  return <span translate="no">Afenda</span>
}

export function FlagshipPageCloseCta({
  reduceMotion,
}: FlagshipPageCloseCtaProps) {
  return (
    <section
      aria-labelledby="flagship-final-cta-title"
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_40%)]" />

      <div className="marketing-container relative py-12 md:py-14 lg:py-16">
        <motion.div
          className="rounded-[2.4rem] border border-border/70 bg-card/94 p-7 shadow-2xl shadow-primary/6 md:p-10"
          {...getMarketingPageSectionReveal(reduceMotion)}
        >
          <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
            Final State
          </div>
          <h2
            id="flagship-final-cta-title"
            className="mt-5 max-w-5xl text-[clamp(2.5rem,5vw,4.7rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance"
          >
            Put accountable truth between every event and every decision it
            drives.
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            <AfendaBrand /> {narrative.finalDescription}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="touch-manipulation">
              <Link to="/auth/login">
                Enter Workspace
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>

            <Link
              to={MARKETING_PAGE_HREFS.canon}
              className="inline-flex items-center gap-2 text-sm font-medium tracking-[-0.02em] text-foreground/80 transition-colors hover:text-foreground"
            >
              See how <AfendaBrand /> works
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
