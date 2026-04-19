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
import {
  ArrowRight,
  BarChart3,
  Eye,
  Fingerprint,
  GitBranch,
  Landmark,
  Package,
  ShieldCheck,
} from "lucide-react"
import { Link } from "react-router-dom"

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

type MarketingIcon = typeof Fingerprint

type ProofRow = {
  readonly label: string
  readonly value: string
  readonly body: string
  readonly icon: MarketingIcon
}

type ProofPillar = {
  readonly title: string
  readonly body: string
  readonly icon: MarketingIcon
  readonly accentClassName: string
  readonly iconClassName: string
}

type ModuleSurface = {
  readonly title: string
  readonly body: string
  readonly icon: MarketingIcon
  readonly accentClassName: string
  readonly iconClassName: string
}

type CanonFragment = {
  readonly label: string
  readonly note: string
  readonly className: string
}

const HERO_FACTS = [
  { value: "1", label: "Canonical Record" },
  { value: "4", label: "Proof Layers" },
  { value: "0", label: "Narrative Rescue" },
] as const

const PROOF_ROWS: readonly ProofRow[] = [
  {
    label: "Origin",
    value: "Attributed",
    body: "Every number keeps the actor, source, and trigger that created it.",
    icon: Fingerprint,
  },
  {
    label: "State Change",
    value: "Causal",
    body: "Transitions remain linked to the event that made them valid.",
    icon: GitBranch,
  },
  {
    label: "Continuity",
    value: "Bound",
    body: "Finance, inventory, and operations stay on one shared surface.",
    icon: Eye,
  },
  {
    label: "Audit",
    value: "Ready",
    body: "Evidence remains available before reconciliation turns into reconstruction.",
    icon: ShieldCheck,
  },
] as const

const PROOF_PILLARS: readonly ProofPillar[] = [
  {
    title: "Attributed Origin",
    body: "Afenda makes the source of a number explicit, so reporting never begins with doubt.",
    icon: Fingerprint,
    accentClassName: "border-l-primary",
    iconClassName: "text-primary",
  },
  {
    title: "Causal Movement",
    body: "Every state change stays tied to the business event that justified it.",
    icon: GitBranch,
    accentClassName: "border-l-secondary",
    iconClassName: "text-secondary",
  },
  {
    title: "Continuous Context",
    body: "Cross-team handoffs do not fracture the record into competing explanations.",
    icon: Eye,
    accentClassName: "border-l-accent",
    iconClassName: "text-accent",
  },
] as const

const CANON_FRAGMENTS: readonly CanonFragment[] = [
  {
    label: "Document",
    note: "Commercial intent enters the system with provenance.",
    className: "left-[6%] top-[12%]",
  },
  {
    label: "Entity",
    note: "The accountable party stays attached to every decision.",
    className: "left-[8%] bottom-[14%]",
  },
  {
    label: "Event",
    note: "Operational change is captured when it happens.",
    className: "right-[8%] top-[18%]",
  },
  {
    label: "Transition",
    note: "State moves only when evidence can carry it forward.",
    className: "right-[6%] bottom-[12%]",
  },
] as const

const MODULE_SURFACES: readonly ModuleSurface[] = [
  {
    title: "Finance",
    body: "Close the books on attributable transactions instead of spreadsheet reconstruction.",
    icon: Landmark,
    accentClassName: "border-l-primary",
    iconClassName: "text-primary",
  },
  {
    title: "Inventory",
    body: "Track movement, stock state, and valuation without losing operational context.",
    icon: Package,
    accentClassName: "border-l-secondary",
    iconClassName: "text-secondary",
  },
  {
    title: "Operations",
    body: "Keep fulfillment, exceptions, and reporting aligned on one shared proof surface.",
    icon: BarChart3,
    accentClassName: "border-l-accent",
    iconClassName: "text-accent",
  },
] as const

function getSectionReveal(reduceMotion: boolean, delay = 0) {
  return {
    initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.24 },
    transition: { duration: 0.72, delay, ease: EASE_OUT },
  } as const
}

function getHeroReveal(reduceMotion: boolean, delay = 0) {
  return {
    initial: { opacity: 0, y: reduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.76, delay, ease: EASE_OUT },
  } as const
}

function SectionKicker({ children }: { readonly children: string }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
      {children}
    </div>
  )
}

function HeroProofCard({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <motion.div {...getHeroReveal(reduceMotion, 0.16)}>
      <Card className="flagship-card border-border/70 bg-card/95 shadow-2xl shadow-primary/5">
        <CardHeader className="gap-4">
          <Badge
            variant="outline"
            className="border-primary/20 bg-background/70 text-foreground"
          >
            Operational Proof System
          </Badge>
          <CardTitle className="text-2xl font-semibold tracking-[-0.03em] text-balance md:text-3xl">
            One surface where origin, consequence, and continuity stay visible.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-pretty">
            Afenda keeps business truth attributable while the work is still in
            motion, not after teams have already started explaining gaps.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {PROOF_ROWS.map(({ label, value, body, icon: Icon }) => (
            <article
              key={label}
              className="grid gap-4 rounded-2xl border border-border/60 bg-background/70 p-4 md:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                <Icon aria-hidden="true" className="size-5 text-primary" />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-[-0.02em]">
                  {label}
                </h2>
                <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
                  {body}
                </p>
              </div>

              <div className="self-start rounded-full border border-border/70 px-3 py-1 text-xs font-medium tracking-[0.18em] text-foreground uppercase">
                {value}
              </div>
            </article>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CanonField({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <div className="flagship-canon-field relative overflow-hidden rounded-[2rem] border border-border/70 p-6 md:p-8">
      <div className="flagship-grid absolute inset-0 opacity-70" />
      <div className="flagship-grain absolute inset-0 opacity-60" />

      <div className="relative grid gap-4 md:hidden">
        {CANON_FRAGMENTS.map((fragment, index) => (
          <motion.div
            key={fragment.label}
            className="flagship-fragment-chip rounded-2xl border border-border/70 px-4 py-4"
            {...getSectionReveal(reduceMotion, index * 0.06)}
          >
            <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
              {fragment.label}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {fragment.note}
            </p>
          </motion.div>
        ))}

        <div className="rounded-[1.75rem] border border-border/80 bg-card/95 px-6 py-7 text-center shadow-xl">
          <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            <span translate="no">NexusCanon</span>
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Bound Truth
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            One record survives because every fragment is forced into the same
            accountable sequence.
          </p>
        </div>
      </div>

      <div className="relative hidden min-h-[34rem] md:block">
        <div className="flagship-canon-spine absolute inset-y-8 left-1/2 w-px -translate-x-1/2" />

        {CANON_FRAGMENTS.map((fragment, index) => (
          <motion.div
            key={fragment.label}
            className={`flagship-fragment-chip absolute max-w-[13rem] rounded-2xl border border-border/70 px-4 py-4 shadow-lg ${fragment.className}`}
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : index < 2 ? -20 : 20,
              y: reduceMotion ? 0 : index % 2 === 0 ? -14 : 14,
            }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.68, delay: index * 0.08, ease: EASE_OUT }}
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
          className="absolute top-1/2 left-1/2 w-[min(24rem,76%)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-border/80 bg-card/95 px-8 py-9 text-center shadow-2xl"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.78, delay: 0.12, ease: EASE_OUT }}
        >
          <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            <span translate="no">NexusCanon</span>
          </div>
          <div className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
            Bound Truth
          </div>
          <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground">
            Document, entity, event, and transition stay attached until
            contradiction has nowhere left to hide.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function AfendaFlagshipPage() {
  const reduceMotion = useReducedMotion()
  const isReducedMotion = !!reduceMotion

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <a className="marketing-skip-link" href="#main-content">
        Skip to content
      </a>

      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/16 via-background to-secondary/12" />
        <div className="flagship-grid absolute inset-0 opacity-80" />
        <div className="flagship-grain absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-7xl px-6 pt-8 pb-16 md:px-10 md:pb-20 lg:px-12 lg:pb-24">
          <div className="flex flex-col gap-8 border-b border-border/60 pb-10 md:flex-row md:items-center md:justify-between">
            <motion.div
              className="flex items-center gap-4"
              {...getHeroReveal(isReducedMotion)}
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                <span translate="no">A</span>
              </div>
              <div>
                <div
                  className="text-sm font-semibold tracking-[-0.02em]"
                  translate="no"
                >
                  Afenda ERP
                </div>
                <div className="text-sm text-muted-foreground">
                  One record for consequential work.
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center gap-3"
              {...getHeroReveal(isReducedMotion, 0.08)}
            >
              <Badge
                variant="outline"
                className="border-border/70 bg-background/70 px-3 py-1.5 text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Proof-Led Operations
              </Badge>
              <Badge
                variant="outline"
                className="border-border/70 bg-background/70 px-3 py-1.5 text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Audit-Ready by Design
              </Badge>
            </motion.div>
          </div>

          <div className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
            <div>
              <motion.div {...getHeroReveal(isReducedMotion, 0.04)}>
                <SectionKicker>Flagship Surface</SectionKicker>
                <h1 className="mt-5 max-w-4xl text-[clamp(3.75rem,9vw,7.4rem)] leading-[0.88] font-semibold tracking-[-0.08em] text-balance">
                  Proof Every State. Trust Every Number.
                </h1>
                <p className="mt-7 max-w-3xl text-[clamp(1.05rem,0.35vw+1rem,1.25rem)] leading-8 text-pretty text-muted-foreground">
                  <span translate="no">Afenda</span> gives finance, inventory,
                  and operations one attributable record. Origin, causality, and
                  continuity remain visible before audit asks for them.
                </p>
              </motion.div>

              <motion.div
                className="mt-10 flex flex-col gap-4 sm:flex-row"
                {...getHeroReveal(isReducedMotion, 0.12)}
              >
                <Button asChild size="lg" className="touch-manipulation">
                  <Link to="/login">
                    Enter Workspace
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="touch-manipulation border-border/70 bg-background/75"
                >
                  <Link to="/marketing/polaris">View Canon</Link>
                </Button>
              </motion.div>

              <motion.div
                className="mt-12 grid gap-4 sm:grid-cols-3"
                {...getHeroReveal(isReducedMotion, 0.2)}
              >
                {HERO_FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-2xl border border-border/60 bg-background/75 p-4 backdrop-blur-sm"
                  >
                    <div className="text-3xl font-semibold tracking-[-0.04em] tabular-nums">
                      {fact.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {fact.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <HeroProofCard reduceMotion={isReducedMotion} />
          </div>
        </div>
      </section>

      <main id="main-content" className="relative">
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24 lg:px-12 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <motion.div {...getSectionReveal(isReducedMotion)}>
              <SectionKicker>Proof Model</SectionKicker>
              <h2 className="mt-5 max-w-2xl text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance">
                Ordinary Systems Fail at the Handoff.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
                Numbers break when context leaves the workflow. Afenda keeps the
                work, the actor, and the state transition on the same evidence
                surface.
              </p>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-3">
              {PROOF_PILLARS.map(
                (
                  { title, body, icon: Icon, accentClassName, iconClassName },
                  index
                ) => (
                  <motion.div
                    key={title}
                    {...getSectionReveal(isReducedMotion, index * 0.08)}
                  >
                    <Card
                      className={`h-full border-border/70 bg-card/90 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl ${accentClassName} border-l-4`}
                    >
                      <CardHeader className="gap-4">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-background">
                          <Icon
                            aria-hidden="true"
                            className={`size-5 ${iconClassName}`}
                          />
                        </div>
                        <CardTitle className="text-xl tracking-[-0.03em]">
                          {title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-7 text-pretty">
                          {body}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <motion.div {...getSectionReveal(isReducedMotion)}>
              <CanonField reduceMotion={isReducedMotion} />
            </motion.div>

            <motion.div {...getSectionReveal(isReducedMotion, 0.08)}>
              <SectionKicker>Canonical Record</SectionKicker>
              <h2 className="mt-5 max-w-2xl text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance">
                One Canonical Record. No Parallel Stories.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
                <span translate="no">NexusCanon</span> is the operating logic
                behind Afenda’s proof surface. It keeps each fragment of the
                business record bound until contradiction has been resolved at
                the source.
              </p>

              <div className="mt-8 grid gap-4">
                {[
                  "Origin remains attributable from intake to close.",
                  "Cross-team work preserves one shared continuity chain.",
                  "Audit is a system property, not a cleanup project.",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/80 p-4"
                    {...getSectionReveal(isReducedMotion, 0.14 + index * 0.06)}
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
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24 lg:px-12 lg:py-28">
          <motion.div {...getSectionReveal(isReducedMotion)}>
            <SectionKicker>ERP Scope</SectionKicker>
            <h2 className="mt-5 max-w-4xl text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance">
              Built for Finance, Inventory &amp; Operations.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
              Afenda is designed for teams carrying fiscal, operational, and
              reporting consequence. The interface stays calm because the record
              underneath it is disciplined.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {MODULE_SURFACES.map(
              (
                { title, body, icon: Icon, accentClassName, iconClassName },
                index
              ) => (
                <motion.div
                  key={title}
                  {...getSectionReveal(isReducedMotion, index * 0.08)}
                >
                  <Card
                    className={`h-full border-border/70 bg-card/90 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl ${accentClassName} border-l-4`}
                  >
                    <CardHeader className="gap-4">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-background">
                        <Icon
                          aria-hidden="true"
                          className={`size-5 ${iconClassName}`}
                        />
                      </div>
                      <CardTitle className="text-xl tracking-[-0.03em]">
                        {title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-7 text-pretty">
                        {body}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              )
            )}
          </div>

          <motion.div
            className="mt-10"
            {...getSectionReveal(isReducedMotion, 0.14)}
          >
            <Card className="flagship-card border-border/70 bg-card/95 shadow-2xl shadow-primary/5">
              <CardHeader className="gap-4">
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-background/70 text-foreground"
                >
                  Final Invitation
                </Badge>
                <CardTitle className="max-w-4xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
                  Run the business on evidence, not reconstruction.
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-8 text-pretty">
                  When every number can defend itself, teams move faster with
                  less noise. That is the point of the system.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="touch-manipulation">
                  <Link to="/login">
                    Enter Workspace
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="touch-manipulation border-border/70 bg-background/75"
                >
                  <Link to="/marketing/polaris">View Canon</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
