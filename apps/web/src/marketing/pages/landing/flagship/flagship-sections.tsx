import { Badge, Button } from "@afenda/design-system/ui-primitives"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import {
  MARKETING_EASE_OUT,
  MarketingPageSection,
  MarketingSectionHeading,
} from "../../_components"
import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"
import {
  BENCHMARK_POINTS,
  CANON_EVIDENCE_POINTS,
  CANON_FRAGMENTS,
  FINAL_ACTION_LINKS,
  FLAGSHIP_COPY,
  HERO_OPERATING_LAWS,
  PRACTICE_POINTS,
  PRODUCT_SCOPE,
  PROOF_POINTS,
} from "./flagship-content"
import { getFlagshipSectionReveal } from "./flagship-reveal"

export interface FlagshipSectionProps {
  readonly reduceMotion: boolean
}

export { FlagshipStickyHero as FlagshipHeroSection } from "./flagship-sticky-hero"

function AfendaBrand() {
  return <span translate="no">Afenda</span>
}

export function FlagshipOperatingLawsSection({
  reduceMotion,
}: FlagshipSectionProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-operating-laws-title"
      className="border-b border-border/70"
      containerClassName="py-6 md:py-8 lg:py-10"
    >
      <motion.div
        className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10"
        {...getFlagshipSectionReveal(reduceMotion)}
      >
        <div className="max-w-xs pt-1">
          <h2
            id="flagship-operating-laws-title"
            className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase"
          >
            Immutable Laws
          </h2>
          <p className="mt-3 text-sm leading-7 text-pretty text-muted-foreground">
            {FLAGSHIP_COPY.operatingLawsLead}
          </p>
        </div>

        <div className="grid gap-0 border-y border-border/60 md:grid-cols-3">
          {HERO_OPERATING_LAWS.map((law, index) => (
            <motion.div
              key={law.title}
              className="px-0 py-4 md:px-0 md:py-5"
              {...getFlagshipSectionReveal(reduceMotion, 0.06 + index * 0.05)}
            >
              <div
                className={`h-full ${index > 0 ? "border-t border-border/60 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6" : ""}`}
              >
                <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                  Law {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 text-sm font-semibold tracking-[-0.02em] text-foreground md:text-base">
                  {law.title}
                </div>
                <p className="mt-2 max-w-[20rem] text-sm leading-6 text-pretty text-muted-foreground">
                  {law.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}

export function FlagshipBenchmarkSection({
  reduceMotion,
}: FlagshipSectionProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-benchmark-title"
      className="border-b border-border/70 bg-foreground text-background"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <motion.div {...getFlagshipSectionReveal(reduceMotion)}>
          <div className="font-mono text-[11px] tracking-[0.28em] text-background/60 uppercase">
            Market Pain
          </div>
          <h2
            id="flagship-benchmark-title"
            className="mt-5 max-w-4xl text-[clamp(2.6rem,5.4vw,5rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance"
          >
            Where enterprise records fail first.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-pretty text-background/70">
            <AfendaBrand /> {FLAGSHIP_COPY.benchmarkDescription}
          </p>
        </motion.div>

        <div className="space-y-3">
          {BENCHMARK_POINTS.map(({ title, body }, index) => (
            <motion.div
              key={title}
              className="rounded-[1.85rem] border border-white/12 bg-white/5 px-5 py-5 shadow-sm backdrop-blur-sm md:px-6 md:py-6"
              {...getFlagshipSectionReveal(reduceMotion, index * 0.06)}
            >
              <div className="grid gap-4 md:grid-cols-[4.75rem_minmax(0,1fr)] md:items-start md:gap-5">
                <div className="text-[2.5rem] leading-none font-semibold tracking-[-0.08em] text-primary/70 md:text-[3rem]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start lg:gap-6">
                  <h3 className="max-w-[16rem] text-[1.12rem] font-semibold tracking-[-0.03em] text-balance text-background">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-pretty text-background/72 md:text-[0.96rem]">
                    {body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MarketingPageSection>
  )
}

export function FlagshipProductScopeSection({
  reduceMotion,
}: FlagshipSectionProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-scope-title"
      className="border-b border-border/70 bg-background"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <motion.div {...getFlagshipSectionReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Enforcement Surface"
            id="flagship-scope-title"
            title="Enforce truth where activity becomes consequence."
            description={
              <>
                <AfendaBrand /> {FLAGSHIP_COPY.scopeDescription}
              </>
            }
          />
        </motion.div>

        <div className="space-y-4">
          {PRODUCT_SCOPE.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              className="overflow-hidden rounded-[2rem] border border-border/60 bg-background/88 shadow-sm"
              {...getFlagshipSectionReveal(reduceMotion, index * 0.06)}
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary/70 via-primary/20 to-transparent" />
              <div className="grid gap-4 px-5 py-5 md:grid-cols-[3.5rem_minmax(0,10rem)_minmax(0,1fr)] md:items-start md:gap-6 md:px-6 md:py-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                </div>
                <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">
                  {title}
                </h3>
                <p className="max-w-xl text-sm leading-7 text-pretty text-muted-foreground">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="mt-8 border-t border-border/60 pt-8"
        {...getFlagshipSectionReveal(reduceMotion, 0.12)}
      >
        <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
          <div>
            <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
              In Practice
            </div>
            <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">
              Immutable truth in operational motion.
            </div>
          </div>

          <ul className="grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            {PRACTICE_POINTS.map((point) => (
              <li
                key={point}
                className="min-w-0 rounded-2xl border border-border/60 bg-background/72 px-4 py-4"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}

export function FlagshipProofSection({ reduceMotion }: FlagshipSectionProps) {
  return (
    <MarketingPageSection
      aria-labelledby="flagship-proof-title"
      className="border-b border-border/70"
    >
      <motion.div
        className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-card/96 p-6 shadow-2xl shadow-primary/8 md:p-8 lg:p-10"
        {...getFlagshipSectionReveal(reduceMotion)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,color-mix(in_oklab,var(--color-primary)_15%,transparent),transparent_26%),radial-gradient(circle_at_84%_14%,color-mix(in_oklab,var(--color-secondary)_10%,transparent),transparent_24%),linear-gradient(140deg,color-mix(in_oklab,var(--color-background)_90%,transparent),color-mix(in_oklab,var(--color-card)_98%,transparent))]"
        />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-10">
          <div>
            <MarketingSectionHeading
              kicker="Proof Chamber"
              id="flagship-proof-title"
              title="False state cannot survive forward motion."
              description={
                <>
                  <AfendaBrand /> {FLAGSHIP_COPY.proofDescription}
                </>
              }
            />

            <motion.aside
              className="mt-8 rounded-[1.85rem] border border-border/70 bg-background/74 p-6 shadow-sm md:p-7"
              {...getFlagshipSectionReveal(reduceMotion, 0.08)}
            >
              <div className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
                Immutable Principle
              </div>
              <h3 className="mt-3 text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
                The record cannot pass if reality cannot carry it.
              </h3>

              <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted-foreground">
                {[
                  "Origin must remain attributable.",
                  "Causality must survive the transition.",
                  "State must stay continuous across business consequence.",
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 border-t border-border/60 pt-3 first:border-t-0 first:pt-0"
                    {...getFlagshipSectionReveal(
                      reduceMotion,
                      0.12 + index * 0.05
                    )}
                  >
                    <div className="mt-1 flex size-7 items-center justify-center rounded-full bg-primary/10">
                      <ShieldCheck
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                    </div>
                    <p className="text-pretty">{item}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.aside>
          </div>

          <div className="space-y-4">
            <motion.div
              className="grid gap-3 rounded-[2rem] border border-border/70 bg-background/78 p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:p-6"
              {...getFlagshipSectionReveal(reduceMotion, 0.1)}
            >
              <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/8 p-5">
                <Badge
                  variant="outline"
                  className="border-destructive/20 bg-destructive/10 text-destructive"
                >
                  False State
                </Badge>
                <div className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Fragmented record.
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Local systems disagree, manual repair starts, and truth leaks
                  into side process.
                </p>
              </div>

              <div className="flex items-center justify-center px-1">
                <div className="rounded-full border border-primary/25 bg-primary/10 px-4 py-3 text-center">
                  <div className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">
                    Law Engine
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    Enforce
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 p-5">
                <Badge
                  variant="outline"
                  className="border-primary/25 bg-primary/10 text-primary"
                >
                  Verified Continuity
                </Badge>
                <div className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Trusted state.
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Origin, movement, evidence, and consequence still belong to
                  one accountable truth chain.
                </p>
              </div>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-2">
              {PROOF_POINTS.map(({ title, body, icon: Icon }, index) => (
                <motion.div
                  key={title}
                  className="rounded-[1.5rem] border border-border/70 bg-background/78 p-5 shadow-sm md:p-6"
                  {...getFlagshipSectionReveal(
                    reduceMotion,
                    0.14 + index * 0.05
                  )}
                >
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-[1.12rem] font-semibold tracking-[-0.03em] text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-pretty text-muted-foreground">
                    {body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </MarketingPageSection>
  )
}

export function FlagshipCanonSection({ reduceMotion }: FlagshipSectionProps) {
  return (
    <section
      aria-labelledby="flagship-canon-title"
      className="border-b border-border/70"
    >
      <div className="marketing-container py-12 md:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
          <motion.div {...getFlagshipSectionReveal(reduceMotion)}>
            <div className="flagship-canon-field relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/70 p-5 shadow-2xl shadow-primary/5 md:p-7">
              <div className="flagship-grid absolute inset-0 opacity-80" />
              <div className="flagship-grain absolute inset-0 opacity-70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_44%)]" />

              <div className="relative grid gap-4 md:hidden">
                {CANON_FRAGMENTS.map((fragment, index) => (
                  <motion.div
                    key={fragment.label}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4"
                    {...getFlagshipSectionReveal(reduceMotion, index * 0.05)}
                  >
                    <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                      {fragment.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {fragment.note}
                    </p>
                  </motion.div>
                ))}

                <div className="rounded-[1.75rem] border border-border/80 bg-card/95 px-6 py-8 text-center shadow-xl">
                  <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                    <span translate="no">NexusCanon</span>
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
                    One Record.
                    <br />
                    No Parallel Story.
                  </div>
                </div>
              </div>

              <div className="relative hidden min-h-[38rem] md:block">
                <div className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />

                {CANON_FRAGMENTS.map((fragment, index) => (
                  <motion.div
                    key={fragment.label}
                    className={`absolute max-w-[13.5rem] rounded-2xl border border-border/70 bg-background/80 px-4 py-4 shadow-lg ${fragment.desktopClassName}`}
                    initial={{
                      opacity: 0,
                      x: reduceMotion ? 0 : index < 2 ? -18 : 18,
                      y: reduceMotion ? 0 : index % 2 === 0 ? -10 : 10,
                    }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.74,
                      delay: index * 0.06,
                      ease: MARKETING_EASE_OUT,
                    }}
                  >
                    <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                      {fragment.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {fragment.note}
                    </p>
                  </motion.div>
                ))}

                <motion.div
                  className="absolute top-1/2 left-1/2 w-[min(26rem,76%)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-border/80 bg-card/95 px-8 py-10 text-center shadow-2xl"
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.82,
                    delay: 0.12,
                    ease: MARKETING_EASE_OUT,
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                    <span translate="no">NexusCanon</span>
                  </div>

                  <div className="mt-4 text-[clamp(2.3rem,4vw,3.5rem)] leading-[0.9] font-semibold tracking-[-0.065em]">
                    One Record.
                    <br />
                    No Parallel Story.
                  </div>

                  <p className="mt-5 text-base leading-7 text-pretty text-muted-foreground">
                    Document, entity, event, and transition stay bound until the
                    business record can stand on its own without narrative
                    repair.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div {...getFlagshipSectionReveal(reduceMotion, 0.08)}>
            <MarketingSectionHeading
              kicker="Canonical Record"
              id="flagship-canon-title"
              title="This is where the record stops fragmenting."
              description={FLAGSHIP_COPY.canonDescription}
              descriptionClassName="max-w-xl"
              titleClassName="max-w-2xl"
            />

            <div className="mt-6 grid gap-4">
              {CANON_EVIDENCE_POINTS.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4"
                  {...getFlagshipSectionReveal(
                    reduceMotion,
                    0.12 + index * 0.05
                  )}
                >
                  <div className="mt-1 flex size-7 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck
                      aria-hidden="true"
                      className="size-4 text-primary"
                    />
                  </div>
                  <p className="text-sm leading-7 text-pretty text-muted-foreground">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function FlagshipFinalSection({ reduceMotion }: FlagshipSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_40%)]" />

      <div className="marketing-container relative py-12 md:py-14 lg:py-16">
        <motion.div
          className="rounded-[2.4rem] border border-border/70 bg-card/94 p-7 shadow-2xl shadow-primary/6 md:p-10"
          {...getFlagshipSectionReveal(reduceMotion)}
        >
          <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
            Final State
          </div>
          <h2 className="mt-5 max-w-5xl text-[clamp(2.5rem,5vw,4.7rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance">
            Put immutable truth between activity and every record you trust.
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            <AfendaBrand /> {FLAGSHIP_COPY.finalDescription}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="touch-manipulation">
              <Link to="/login">
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

          <div className="mt-8 border-t border-border/60 pt-5">
            <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
              Continue Through the Truth Layer
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {FINAL_ACTION_LINKS.map((item) => (
                <Button
                  key={`${item.label}:${item.to}`}
                  asChild
                  size="sm"
                  variant="outline"
                  className="touch-manipulation border-border/70 bg-background/75"
                >
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
