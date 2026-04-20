import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BarChart3,
  Building2,
  Eye,
  Fingerprint,
  GitBranch,
  Landmark,
  Layers3,
  Package,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  MarketingPageShell,
  MarketingSectionKicker as SectionKicker,
} from "../../_components"
import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

type FeatureCard = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

type CanonFragment = {
  readonly label: string
  readonly note: string
  readonly desktopClassName: string
}

const HERO_METRICS = [
  { value: "1", label: "shared business record" },
  { value: "100%", label: "traceable state changes" },
  { value: "0", label: "reconstruction required at close" },
] as const

const BENCHMARK_POINTS = [
  {
    title: "Fast to Operate",
    body: "Readable workflows that help teams move, not slow them down.",
    icon: Building2,
  },
  {
    title: "Control by Design",
    body: "Approvals, ownership, and business consequence stay explicit.",
    icon: Landmark,
  },
  {
    title: "Unified Record",
    body: "Finance, inventory, and operations remain part of one accountable system.",
    icon: Layers3,
  },
] as const satisfies readonly FeatureCard[]

const PRODUCT_SCOPE = [
  {
    title: "Finance",
    body: "Approve, post, and close on transactions that remain tied to origin and decision.",
    icon: Landmark,
  },
  {
    title: "Inventory",
    body: "Track stock movement and valuation without losing operational context.",
    icon: Package,
  },
  {
    title: "Operations",
    body: "Run workflows where approvals, exceptions, and outcomes remain attached to the same record.",
    icon: BarChart3,
  },
] as const satisfies readonly FeatureCard[]

const PROOF_POINTS = [
  {
    title: "Attributed Origin",
    body: "Every number remains tied to the actor, source, and triggering event that produced it.",
    icon: Fingerprint,
  },
  {
    title: "Causal Movement",
    body: "Every transition remains linked to the business event that made it valid.",
    icon: GitBranch,
  },
  {
    title: "Continuous Context",
    body: "Finance, inventory, and operational change remain visible on one shared surface.",
    icon: Eye,
  },
  {
    title: "Audit Readiness",
    body: "Evidence is present before review, close, or exception handling begins.",
    icon: ShieldCheck,
  },
] as const satisfies readonly FeatureCard[]

const PRACTICE_POINTS = [
  "Approve invoices with full business context.",
  "Track inventory movement with financial consequence attached.",
  "Close books without rebuilding missing narrative.",
  "Export reviewer-ready evidence directly from the workflow.",
] as const

const CANON_FRAGMENTS = [
  {
    label: "Document",
    note: "Commercial intent enters the system with provenance and ownership.",
    desktopClassName: "left-[6%] top-[12%]",
  },
  {
    label: "Entity",
    note: "The accountable party remains attached to every consequential change.",
    desktopClassName: "left-[10%] bottom-[14%]",
  },
  {
    label: "Event",
    note: "Operational change is captured at the moment it becomes true.",
    desktopClassName: "right-[8%] top-[18%]",
  },
  {
    label: "Transition",
    note: "State moves only when evidence can carry it forward.",
    desktopClassName: "right-[6%] bottom-[12%]",
  },
] as const satisfies readonly CanonFragment[]

function getHeroReveal(reduceMotion: boolean, delay = 0) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.78, delay, ease: EASE_OUT },
  } as const
}

function getSectionReveal(reduceMotion: boolean, delay = 0) {
  return {
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: reduceMotion ? 0 : 0.84, delay, ease: EASE_OUT },
  } as const
}

function MonumentHero({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/14 via-background to-secondary/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,color-mix(in_oklab,var(--color-secondary)_10%,transparent),transparent_30%)]" />

      <div className="marketing-container relative pt-24 pb-10 md:pt-24 md:pb-12 lg:pt-24 lg:pb-14 xl:pt-20">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.04fr)_minmax(20rem,0.96fr)] xl:items-start xl:gap-8">
          <div>
            <motion.div {...getHeroReveal(reduceMotion)}>
              <SectionKicker>Flagship ERP</SectionKicker>

              <div className="mt-3 font-mono text-[10px] tracking-[0.34em] text-muted-foreground uppercase">
                System Activation
              </div>

              <h1 className="mt-3 max-w-[9ch] text-[clamp(2.9rem,7.6vw,6.2rem)] leading-[0.84] font-semibold tracking-[-0.075em] text-balance uppercase xl:text-[clamp(3.4rem,7vw,6.8rem)]">
                No
                <br />
                Guesswork
              </h1>

              <p className="mt-6 max-w-2xl border-l border-border/70 pl-6 text-[clamp(1.02rem,0.32vw+0.98rem,1.16rem)] leading-8 text-muted-foreground">
                Most systems record outcomes.
                <br />
                Afenda records causality.
              </p>

              <p className="mt-6 max-w-3xl text-base leading-7 text-pretty text-muted-foreground">
                <span translate="no">Afenda</span> is a modern business ERP for
                teams comparing Zoho, QuickBooks, Oracle, and SAP - but refusing
                fragmented records, reconciliation theatre, and audit recovery
                as normal operating work.
              </p>
            </motion.div>

            <motion.div
              className="mt-7 flex flex-col gap-4 sm:flex-row"
              {...getHeroReveal(reduceMotion, 0.08)}
            >
              <Button asChild size="lg" className="touch-manipulation">
                <Link to="/login">
                  Enter System
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="touch-manipulation border-border/70 bg-background/75"
              >
                <Link to={MARKETING_PAGE_HREFS.canon}>
                  See How Afenda Works
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="mt-7 grid gap-4 sm:grid-cols-3"
              {...getHeroReveal(reduceMotion, 0.14)}
            >
              {HERO_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur-sm"
                >
                  <div className="text-3xl font-semibold tracking-[-0.04em] tabular-nums">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.p
              className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground"
              {...getHeroReveal(reduceMotion, 0.18)}
            >
              Built for companies that want the clarity of modern software and
              the discipline expected from serious ERP.
            </motion.p>
          </div>

          <motion.div {...getHeroReveal(reduceMotion, 0.12)}>
            <Card className="flagship-card border-border/70 bg-card/90 shadow-2xl shadow-primary/5">
              <CardHeader className="gap-4">
                <Badge
                  variant="outline"
                  className="w-fit border-primary/20 bg-primary/5 text-foreground"
                >
                  System State
                </Badge>
                <CardTitle className="text-2xl font-semibold tracking-[-0.03em] text-balance md:text-3xl">
                  Run finance, inventory, and operations on one accountable
                  system.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-pretty">
                  Orders, stock movement, approvals, and financial consequence
                  stay on one shared record, so the system can explain itself
                  before your team has to.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-3">
                {[
                  ["Mode", "Operational"],
                  ["Record", "Bound"],
                  ["Trust", "Verified"],
                  ["Close", "No reconstruction"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3"
                  >
                    <span className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                      {label}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function StrikeSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section className="border-b border-border/70">
      <div className="marketing-container py-12 md:py-14 lg:py-16">
        <motion.div {...getSectionReveal(reduceMotion)}>
          <SectionKicker>Benchmark Alignment</SectionKicker>

          <h2 className="mt-5 max-w-5xl text-[clamp(2.5rem,5vw,5rem)] leading-[0.9] font-semibold tracking-[-0.06em] text-balance">
            You do not need more tools.
            <br />
            You need one system that holds.
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            Afenda is designed to satisfy what ERP buyers already expect:
            usability, control, operational scope, and readiness for scale.
          </p>

          <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            It feels current like modern business software, but keeps the
            structural seriousness usually expected from enterprise systems.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {BENCHMARK_POINTS.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              {...getSectionReveal(reduceMotion, index * 0.06)}
            >
              <Card className="h-full border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-[1.15rem] tracking-[-0.03em]">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7 text-pretty">
                    {body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductScopeSection({
  reduceMotion,
}: {
  readonly reduceMotion: boolean
}) {
  return (
    <section className="border-b border-border/70">
      <div className="marketing-container py-12 md:py-14 lg:py-16">
        <motion.div {...getSectionReveal(reduceMotion)}>
          <SectionKicker>Product Scope</SectionKicker>

          <h2 className="mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance">
            One system for the workflows that carry real consequence.
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
            Afenda is built for businesses that cannot afford operational
            ambiguity. Every approval, movement, and posting remains visible in
            context from action to reporting outcome.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PRODUCT_SCOPE.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              {...getSectionReveal(reduceMotion, index * 0.06)}
            >
              <Card className="h-full border-border/70 bg-card/90 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardHeader className="gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-background">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-[1.15rem] tracking-[-0.03em]">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7 text-pretty">
                    {body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 grid gap-4 rounded-[1.75rem] border border-border/70 bg-card/80 p-5 md:grid-cols-2 md:p-6"
          {...getSectionReveal(reduceMotion, 0.12)}
        >
          <div>
            <div className="font-mono text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
              In practice
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              Built for real operational work.
            </div>
          </div>

          <ul className="grid gap-3 text-sm leading-7 text-muted-foreground">
            {PRACTICE_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

function ProofSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section className="border-b border-border/70">
      <div className="marketing-container py-12 md:py-14 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)] lg:items-stretch lg:gap-8">
          <motion.div {...getSectionReveal(reduceMotion)}>
            <SectionKicker>Proof Model</SectionKicker>

            <h2 className="mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance">
              Every state change arrives with its own explanation.
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
              In most systems, teams explain the numbers after the fact. In
              Afenda, the record already carries its origin, decision path, and
              business consequence.
            </p>
          </motion.div>

          <motion.aside
            className="rounded-[1.75rem] border border-border/70 bg-background/70 p-6 shadow-sm md:p-7 lg:p-8"
            {...getSectionReveal(reduceMotion, 0.08)}
          >
            <div className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
              System Principle
            </div>
            <h3 className="mt-3 text-[clamp(1.45rem,2.4vw,1.95rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">
              A record is not trusted until it can explain itself.
            </h3>

            <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted-foreground">
              {[
                "Origin remains attributable at every stage.",
                "Transitions stay linked to a valid business event.",
                "Cross-team handoff keeps one accountable context.",
              ].map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-3"
                  {...getSectionReveal(reduceMotion, 0.12 + index * 0.05)}
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

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PROOF_POINTS.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              {...getSectionReveal(reduceMotion, index * 0.05)}
            >
              <Card className="h-full border-border/70 bg-card/88 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-[1.15rem] tracking-[-0.03em]">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7 text-pretty">
                    {body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CanonSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section className="border-b border-border/70">
      <div className="marketing-container py-12 md:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
          <motion.div {...getSectionReveal(reduceMotion)}>
            <div className="flagship-canon-field relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/70 p-5 shadow-2xl shadow-primary/5 md:p-7">
              <div className="flagship-grid absolute inset-0 opacity-80" />
              <div className="flagship-grain absolute inset-0 opacity-70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_44%)]" />

              <div className="relative grid gap-4 md:hidden">
                {CANON_FRAGMENTS.map((fragment, index) => (
                  <motion.div
                    key={fragment.label}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-4"
                    {...getSectionReveal(reduceMotion, index * 0.05)}
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
                      ease: EASE_OUT,
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
                    ease: EASE_OUT,
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

          <motion.div {...getSectionReveal(reduceMotion, 0.08)}>
            <SectionKicker>Canonical Record</SectionKicker>

            <h2 className="mt-5 max-w-2xl text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance">
              This is where the record stops fragmenting.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
              Most systems let the record fracture, then ask teams to recover
              coherence later. <span translate="no">NexusCanon</span> is the
              operating logic that prevents that fracture from becoming normal.
            </p>

            <div className="mt-6 grid gap-4">
              {[
                "Order, stock, and accounting consequence remain in one continuity chain.",
                "Teams work on the same accountable record instead of exporting responsibility into spreadsheets.",
                "Audit readiness becomes a property of execution, not a project after the fact.",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4"
                  {...getSectionReveal(reduceMotion, 0.12 + index * 0.05)}
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

function FinalReckoningSection({
  reduceMotion,
}: {
  readonly reduceMotion: boolean
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_40%)]" />

      <div className="marketing-container relative py-12 md:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-end">
          <motion.div {...getSectionReveal(reduceMotion)}>
            <Card className="flagship-card border-border/70 bg-card/95 shadow-2xl shadow-primary/5">
              <CardHeader className="gap-4">
                <Badge
                  variant="outline"
                  className="w-fit border-primary/20 bg-background/70 text-foreground"
                >
                  Final State
                </Badge>

                <CardTitle className="max-w-4xl text-[clamp(2.3rem,4.8vw,4rem)] leading-[0.93] font-semibold tracking-[-0.06em] text-balance">
                  Stop explaining the system.
                  <br />
                  Use one that explains itself.
                </CardTitle>

                <CardDescription className="max-w-3xl text-base leading-8 text-pretty">
                  Afenda is built for teams that want modern usability,
                  operational clarity, and records that stay accountable under
                  pressure.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end">
                <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                  <Button asChild size="lg" className="touch-manipulation">
                    <Link to="/login">
                      Enter System
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="touch-manipulation border-border/70 bg-background/75"
                  >
                    <Link to={MARKETING_PAGE_HREFS.canon}>
                      See How Afenda Works
                    </Link>
                  </Button>
                </div>

                <div className="max-w-xl text-sm leading-7 text-pretty text-muted-foreground">
                  Finance, inventory, and operations do not need another layer
                  of explanation. They need a system where origin, consequence,
                  and continuity remain visible by default.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...getSectionReveal(reduceMotion, 0.08)}>
            <SectionKicker>What Changes</SectionKicker>

            <h2 className="mt-5 max-w-xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.96] font-semibold tracking-[-0.05em] text-balance">
              Enterprise discipline.
              <br />
              Modern operating feel.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
              That is the promise. A business ERP that feels current in daily
              use, but remains serious enough for close, control, scale, and
              review.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                {
                  label: "Explore ERP Benchmarks",
                  to: MARKETING_PAGE_HREFS.benchmarkErp,
                },
                {
                  label: "Trust Center",
                  to: MARKETING_PAGE_HREFS.trustCenter,
                },
                {
                  label: "View Campaign",
                  to: MARKETING_PAGE_HREFS.erpBenchmarkCampaign,
                },
              ].map((item) => (
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default function AfendaFlagshipPage() {
  const reduceMotion = useReducedMotion()
  const isReducedMotion = !!reduceMotion

  return (
    <MarketingPageShell>
      <MonumentHero reduceMotion={isReducedMotion} />
      <StrikeSection reduceMotion={isReducedMotion} />
      <ProductScopeSection reduceMotion={isReducedMotion} />
      <ProofSection reduceMotion={isReducedMotion} />
      <CanonSection reduceMotion={isReducedMotion} />
      <FinalReckoningSection reduceMotion={isReducedMotion} />
    </MarketingPageShell>
  )
}
