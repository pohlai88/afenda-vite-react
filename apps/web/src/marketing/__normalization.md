# Afenda Flagship — Normalized Refactor

Below is a production-grade split that restructures the current monolithic page into a governed, serializable flagship feature.

---

## `flagship.types.ts`

```ts
import type { LucideIcon } from "lucide-react"

export type MetricFact = {
  readonly value: string
  readonly label: string
}

export type FeatureCard = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

export type ValidationStatusKey =
  | "FAIL"
  | "UNKNOWN"
  | "DRIFT_DETECTED"
  | "RECONSTRUCTION_REQUIRED"

export type ValidationCheck = {
  readonly id: string
  readonly label: string
  readonly status: ValidationStatusKey
  readonly note: string
}

export type CanonFragmentId = "document" | "entity" | "event" | "transition"

export type CanonFragment = {
  readonly id: CanonFragmentId
  readonly label: string
  readonly note: string
}

export type CanonFragmentLayout = {
  readonly mobileOrder: number
  readonly desktopClassName: string
}

export type LinkAction = {
  readonly label: string
  readonly to: string
}
```

---

## `flagship.constants.ts`

```ts
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const SECTION_CONTAINER_CLASS_NAME =
  "mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24 lg:px-12 lg:py-28"

export const HERO_CONTAINER_CLASS_NAME =
  "relative mx-auto max-w-7xl px-6 pb-16 pt-24 md:px-10 md:pb-20 md:pt-28 lg:px-12 lg:pb-24 lg:pt-28"

export const CTA_OUTLINE_CLASS_NAME =
  "touch-manipulation border-border/70 bg-background/75"
```

---

## `flagship.status.ts`

```ts
import type { ValidationStatusKey } from "./flagship.types"

export const VALIDATION_STATUS_META = {
  FAIL: {
    label: "FAIL",
    className: "flagship-status-badge flagship-status-badge--fail",
  },
  UNKNOWN: {
    label: "UNKNOWN",
    className: "flagship-status-badge flagship-status-badge--unknown",
  },
  DRIFT_DETECTED: {
    label: "DRIFT DETECTED",
    className: "flagship-status-badge flagship-status-badge--drift",
  },
  RECONSTRUCTION_REQUIRED: {
    label: "RECONSTRUCTION REQUIRED",
    className: "flagship-status-badge flagship-status-badge--reconstruction",
  },
} as const satisfies Record<
  ValidationStatusKey,
  {
    readonly label: string
    readonly className: string
  }
>
```

---

## `flagship.motion.ts`

```ts
import { EASE_OUT } from "./flagship.constants"

export type RevealPreset = "hero" | "section" | "grid"

export function getRevealMotion(
  reduceMotion: boolean,
  preset: RevealPreset,
  delay = 0
) {
  if (reduceMotion) {
    switch (preset) {
      case "hero":
        return {
          initial: false,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0, delay: 0, ease: EASE_OUT },
        } as const
      case "section":
        return {
          initial: false,
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.22 },
          transition: { duration: 0, delay: 0, ease: EASE_OUT },
        } as const
      case "grid":
        return {
          initial: false,
          whileInView: { opacity: 1 },
          viewport: { once: true, amount: 0.22 },
          transition: { duration: 0, delay: 0, ease: EASE_OUT },
        } as const
    }
  }

  switch (preset) {
    case "hero":
      return {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.72, delay, ease: EASE_OUT },
      } as const
    case "section":
      return {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.22 },
        transition: { duration: 0.72, delay, ease: EASE_OUT },
      } as const
    case "grid":
      return {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.22 },
        transition: { duration: 0.72, delay, ease: EASE_OUT },
      } as const
  }
}
```

---

## `flagship.content.ts`

```ts
import {
  BarChart3,
  Building2,
  Clock3,
  Eye,
  Fingerprint,
  GitBranch,
  Landmark,
  Layers3,
  Package,
  ShieldCheck,
} from "lucide-react"

import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"
import type {
  CanonFragment,
  CanonFragmentLayout,
  FeatureCard,
  LinkAction,
  MetricFact,
  ValidationCheck,
} from "./flagship.types"

export const HERO_FACTS: readonly MetricFact[] = [
  { value: "1", label: "shared business record" },
  { value: "100%", label: "traceable state changes" },
  { value: "0", label: "reconstruction required at close" },
] as const

export const BENCHMARK_CARDS: readonly FeatureCard[] = [
  {
    title: "Fast to Operate",
    body: "Readable, low-friction workflows that support daily work instead of slowing it down.",
    icon: Building2,
  },
  {
    title: "Control by Design",
    body: "Approvals, ownership, and consequence stay explicit while work is still moving.",
    icon: Landmark,
  },
  {
    title: "Unified Surface",
    body: "Finance, inventory, and operations remain part of the same accountable system.",
    icon: Layers3,
  },
  {
    title: "Scale Without Drift",
    body: "Support more entities, more workflows, and more reporting pressure without losing continuity.",
    icon: Clock3,
  },
] as const

export const MODULE_CARDS: readonly FeatureCard[] = [
  {
    title: "Finance",
    body: "Post, approve, and close on transactions that stay tied to their origin, decision, and consequence.",
    icon: Landmark,
  },
  {
    title: "Inventory",
    body: "Track stock movement and valuation without breaking the link to operational reality.",
    icon: Package,
  },
  {
    title: "Operations",
    body: "Run workflows where exceptions, approvals, and outcomes remain attached to the same record.",
    icon: BarChart3,
  },
] as const

export const PROOF_CARDS: readonly FeatureCard[] = [
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
    body: "Evidence is already present before review, close, or exception handling begins.",
    icon: ShieldCheck,
  },
] as const

export const PROOF_IMPERATIVES = [
  "Origin remains attributable at every stage.",
  "Transitions stay linked to a valid business event.",
  "Cross-team handoff keeps one accountable context.",
] as const

export const VALIDATION_CHECKS: readonly ValidationCheck[] = [
  {
    id: "CHECK_001",
    label: "ORIGIN VERIFIED?",
    status: "FAIL",
    note: "Value exists without attributable origin.",
  },
  {
    id: "CHECK_002",
    label: "CAUSAL LINK PRESENT?",
    status: "UNKNOWN",
    note: "Transition lacks a provable causal chain.",
  },
  {
    id: "CHECK_003",
    label: "STATE CONSISTENCY MAINTAINED?",
    status: "DRIFT_DETECTED",
    note: "Recorded surface diverges from operational reality.",
  },
  {
    id: "CHECK_004",
    label: "CROSS-ENTITY CONTINUITY PRESERVED?",
    status: "RECONSTRUCTION_REQUIRED",
    note: "Truth must be rebuilt across fractured context.",
  },
] as const

export const CANON_FRAGMENTS: readonly CanonFragment[] = [
  {
    id: "document",
    label: "Document",
    note: "Commercial intent enters the system with provenance and ownership.",
  },
  {
    id: "entity",
    label: "Entity",
    note: "The accountable party remains attached to every consequential change.",
  },
  {
    id: "event",
    label: "Event",
    note: "Operational change is captured at the moment it becomes true.",
  },
  {
    id: "transition",
    label: "Transition",
    note: "State moves only when evidence can carry it forward.",
  },
] as const

export const CANON_FRAGMENT_LAYOUT: Readonly<
  Record<CanonFragment["id"], CanonFragmentLayout>
> = {
  document: {
    mobileOrder: 1,
    desktopClassName: "left-[6%] top-[12%]",
  },
  entity: {
    mobileOrder: 2,
    desktopClassName: "left-[10%] bottom-[14%]",
  },
  event: {
    mobileOrder: 3,
    desktopClassName: "right-[8%] top-[18%]",
  },
  transition: {
    mobileOrder: 4,
    desktopClassName: "right-[6%] bottom-[12%]",
  },
} as const

export const HERO_PRIMARY_ACTION: LinkAction = {
  label: "Enter Workspace",
  to: "/login",
}

export const HERO_SECONDARY_ACTION: LinkAction = {
  label: "See the Operating Model",
  to: MARKETING_PAGE_HREFS.canon,
}

export const FINAL_LINK_ACTIONS: readonly LinkAction[] = [
  {
    label: "Benchmark ERP",
    to: MARKETING_PAGE_HREFS.benchmarkErp,
  },
  {
    label: "Trust Center",
    to: MARKETING_PAGE_HREFS.trustCenter,
  },
  {
    label: "Campaign",
    to: MARKETING_PAGE_HREFS.erpBenchmarkCampaign,
  },
] as const
```

---

## `flagship.primitives.tsx`

```tsx
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { MarketingSectionKicker as SectionKicker } from "../../_components"
import { CTA_OUTLINE_CLASS_NAME } from "./flagship.constants"
import { getRevealMotion } from "./flagship.motion"
import { VALIDATION_STATUS_META } from "./flagship.status"
import type { FeatureCard, LinkAction, ValidationCheck } from "./flagship.types"

export function FlagshipSectionIntro({
  reduceMotion,
  kicker,
  id,
  title,
  body,
  secondaryBody,
}: {
  readonly reduceMotion: boolean
  readonly kicker: string
  readonly id: string
  readonly title: string
  readonly body: string
  readonly secondaryBody?: string
}) {
  return (
    <motion.div {...getRevealMotion(reduceMotion, "section")}>
      <SectionKicker>{kicker}</SectionKicker>
      <h2
        id={id}
        className="scroll-mt-28 mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance"
      >
        {title}
      </h2>
      <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
        {body}
      </p>
      {secondaryBody ? (
        <p className="mt-4 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
          {secondaryBody}
        </p>
      ) : null}
    </motion.div>
  )
}

export function FlagshipFeatureCard({
  item,
  subtle = true,
  iconBackgroundClassName = "bg-primary/10",
}: {
  readonly item: FeatureCard
  readonly subtle?: boolean
  readonly iconBackgroundClassName?: string
}) {
  const Icon = item.icon

  return (
    <Card
      className={
        subtle ? "flagship-card-subtle h-full" : "flagship-card h-full"
      }
    >
      <CardHeader className="gap-4">
        <div
          className={`flex size-11 items-center justify-center rounded-2xl ${iconBackgroundClassName}`}
        >
          <Icon aria-hidden="true" className="size-5 text-primary" />
        </div>
        <CardTitle className="text-[1.15rem] tracking-[-0.03em]">
          {item.title}
        </CardTitle>
        <CardDescription className="text-sm leading-7 text-pretty">
          {item.body}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export function FlagshipCardGrid({
  reduceMotion,
  items,
  columnsClassName,
  cardClassName,
  preset = "section",
}: {
  readonly reduceMotion: boolean
  readonly items: readonly FeatureCard[]
  readonly columnsClassName: string
  readonly cardClassName?: string
  readonly preset?: "section" | "grid"
}) {
  return (
    <div className={columnsClassName}>
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          className={cardClassName}
          {...getRevealMotion(reduceMotion, preset, index * 0.05)}
        >
          <FlagshipFeatureCard item={item} />
        </motion.div>
      ))}
    </div>
  )
}

export function FlagshipDualCta({
  primary,
  secondary,
}: {
  readonly primary: LinkAction
  readonly secondary: LinkAction
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Button asChild size="lg" className="touch-manipulation">
        <Link to={primary.to}>
          {primary.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>

      <Button
        asChild
        size="lg"
        variant="outline"
        className={CTA_OUTLINE_CLASS_NAME}
      >
        <Link to={secondary.to}>{secondary.label}</Link>
      </Button>
    </div>
  )
}

export function FlagshipImperativeList({
  reduceMotion,
  items,
}: {
  readonly reduceMotion: boolean
  readonly items: readonly string[]
}) {
  return (
    <ul className="mt-5 grid gap-3 text-sm leading-7 text-muted-foreground">
      {items.map((item, index) => (
        <motion.li
          key={item}
          className="flagship-proof-item flex items-start gap-3 rounded-2xl p-3"
          {...getRevealMotion(reduceMotion, "section", index * 0.05)}
        >
          <div className="mt-1 flex size-7 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
          </div>
          <p className="text-pretty">{item}</p>
        </motion.li>
      ))}
    </ul>
  )
}

export function FlagshipValidationTable({
  checks,
}: {
  readonly checks: readonly ValidationCheck[]
}) {
  return (
    <Card className="flagship-card overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-5">
        <CardTitle className="text-2xl tracking-[-0.03em]">
          Executable validation, not cleanup later
        </CardTitle>
        <CardDescription className="text-base leading-7">
          The system checks every business state against proof before narrative
          rescue becomes the operating model.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {checks.map((check) => {
          const meta = VALIDATION_STATUS_META[check.status]

          return (
            <article
              key={check.id}
              className="grid gap-4 border-b border-border/70 px-5 py-5 last:border-b-0 md:grid-cols-[8.5rem_minmax(0,1fr)_auto] md:px-7"
            >
              <div className="font-mono text-[10px] tracking-[0.26em] text-muted-foreground uppercase">
                {check.id}
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] uppercase md:text-2xl">
                  {check.label}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {check.note}
                </p>
              </div>

              <div>
                <Badge variant="outline" className={meta.className}>
                  {meta.label}
                </Badge>
              </div>
            </article>
          )
        })}

        <div className="border-t border-border/70 px-5 py-6 md:px-7">
          <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            System verdict
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Record invalid until evidence binds it.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## `AfendaFlagshipPage.tsx`

```tsx
/**
 * Afenda flagship marketing page.
 *
 * Purpose:
 * - Present the benchmark-aligned ERP flagship narrative.
 * - Keep page composition slim by delegating content, motion, and repeated UI.
 *
 * Governance:
 * - Content lives in flagship.content.ts.
 * - Reveal policy lives in flagship.motion.ts.
 * - Validation status rendering is keyed through flagship.status.ts.
 * - Layout coordinates are separated from canonical content.
 */

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
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import {
  MarketingPageShell,
  MarketingSectionKicker as SectionKicker,
} from "../../_components"
import {
  BENCHMARK_CARDS,
  CANON_FRAGMENT_LAYOUT,
  CANON_FRAGMENTS,
  FINAL_LINK_ACTIONS,
  HERO_FACTS,
  HERO_PRIMARY_ACTION,
  HERO_SECONDARY_ACTION,
  MODULE_CARDS,
  PROOF_CARDS,
  PROOF_IMPERATIVES,
  VALIDATION_CHECKS,
} from "./flagship.content"
import {
  CTA_OUTLINE_CLASS_NAME,
  HERO_CONTAINER_CLASS_NAME,
  SECTION_CONTAINER_CLASS_NAME,
} from "./flagship.constants"
import { getRevealMotion } from "./flagship.motion"
import {
  FlagshipCardGrid,
  FlagshipDualCta,
  FlagshipFeatureCard,
  FlagshipImperativeList,
  FlagshipSectionIntro,
  FlagshipValidationTable,
} from "./flagship.primitives"

function HeroProofCard({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <motion.div {...getRevealMotion(reduceMotion, "hero", 0.12)}>
      <Card className="flagship-card">
        <CardHeader className="gap-4">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/5 text-foreground"
          >
            Proof-Led Operating Model
          </Badge>
          <CardTitle className="text-2xl font-semibold tracking-[-0.03em] text-balance md:text-3xl">
            One business record where origin, consequence, and continuity stay
            visible.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-pretty">
            Afenda keeps work attributable while it is still moving, so finance,
            inventory, and operational reality do not split into separate
            stories.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 sm:items-start">
          {PROOF_CARDS.map((item) => (
            <article
              key={item.title}
              className="flagship-proof-item grid min-h-0 gap-4 rounded-2xl p-4 md:grid-cols-[auto_1fr]"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                <item.icon aria-hidden="true" className="size-5 text-primary" />
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function HeroSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section
      aria-labelledby="flagship-hero-heading"
      className="relative overflow-hidden border-b border-border/70"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/16 via-background to-secondary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-accent)_16%,transparent),transparent_40%)]" />

      <div className={HERO_CONTAINER_CLASS_NAME}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(21rem,0.95fr)] lg:items-start">
          <div>
            <motion.div {...getRevealMotion(reduceMotion, "hero")}>
              <SectionKicker>Flagship ERP</SectionKicker>

              <h1
                id="flagship-hero-heading"
                className="scroll-mt-28 mt-5 max-w-[15ch] text-[clamp(3.2rem,7.2vw,6.2rem)] leading-[0.9] font-semibold tracking-[-0.07em] text-balance"
              >
                Run Finance, Inventory, and Operations
                <br />
                on One Accountable System.
              </h1>

              <p className="mt-7 max-w-3xl text-[clamp(1.05rem,0.35vw+1rem,1.24rem)] leading-8 text-pretty text-muted-foreground">
                <span translate="no">Afenda</span> is a modern business ERP for
                teams comparing Zoho, QuickBooks, Oracle, and SAP — but refusing
                fragmented records, reconciliation theatre, and audit recovery
                as normal operating work.
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-pretty text-muted-foreground">
                Orders, stock movement, approvals, and financial consequence
                stay on one shared record, so the system can explain itself
                before your team has to.
              </p>
            </motion.div>

            <motion.div
              className="mt-10"
              {...getRevealMotion(reduceMotion, "hero", 0.08)}
            >
              <FlagshipDualCta
                primary={HERO_PRIMARY_ACTION}
                secondary={HERO_SECONDARY_ACTION}
              />
            </motion.div>

            <motion.div
              className="mt-12 grid gap-4 sm:grid-cols-3"
              {...getRevealMotion(reduceMotion, "hero", 0.14)}
            >
              {HERO_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="flagship-fact-chip rounded-2xl p-4"
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

            <motion.p
              className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground"
              {...getRevealMotion(reduceMotion, "hero", 0.18)}
            >
              Built for companies that want the clarity of modern software and
              the discipline of serious ERP.
            </motion.p>
          </div>

          <HeroProofCard reduceMotion={reduceMotion} />
        </div>
      </div>
    </section>
  )
}

function BenchmarkSection({
  reduceMotion,
}: {
  readonly reduceMotion: boolean
}) {
  return (
    <section
      aria-labelledby="benchmark-alignment-heading"
      className="border-b border-border/70"
    >
      <div className={SECTION_CONTAINER_CLASS_NAME}>
        <FlagshipSectionIntro
          reduceMotion={reduceMotion}
          kicker="Benchmark Alignment"
          id="benchmark-alignment-heading"
          title="Everything buyers expect from modern ERP. None of the usual fragmentation."
          body="Afenda is designed to satisfy the standards ERP buyers already bring with them: usability, control, operational scope, and readiness for scale."
          secondaryBody="It feels current like the best modern business software, but keeps the structural seriousness expected from enterprise systems."
        />

        <div className="mt-12">
          <FlagshipCardGrid
            reduceMotion={reduceMotion}
            items={BENCHMARK_CARDS}
            columnsClassName="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          />
        </div>
      </div>
    </section>
  )
}

function ModuleSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section
      aria-labelledby="erp-scope-heading"
      className="border-b border-border/70"
    >
      <div className={SECTION_CONTAINER_CLASS_NAME}>
        <FlagshipSectionIntro
          reduceMotion={reduceMotion}
          kicker="ERP Scope"
          id="erp-scope-heading"
          title="One system for the workflows that carry real consequence."
          body="Afenda is built for businesses that cannot afford operational ambiguity. Every approval, movement, and posting remains visible in context from action to reporting outcome."
        />

        <div className="mt-12">
          <FlagshipCardGrid
            reduceMotion={reduceMotion}
            items={MODULE_CARDS}
            columnsClassName="grid gap-6 md:grid-cols-3"
          />
        </div>

        <motion.div
          className="flagship-practice-panel mt-12 grid gap-4 rounded-[1.75rem] p-6 md:grid-cols-2"
          {...getRevealMotion(reduceMotion, "section", 0.1)}
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
            <li>Approve invoices with full business context.</li>
            <li>
              Track inventory movement with financial consequence attached.
            </li>
            <li>Close books without rebuilding missing narrative.</li>
            <li>Export reviewer-ready evidence directly from the workflow.</li>
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

function ProofSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section
      aria-labelledby="proof-system-heading"
      className="border-b border-border/70"
    >
      <div className={SECTION_CONTAINER_CLASS_NAME}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.86fr)] lg:items-stretch">
          <motion.div {...getRevealMotion(reduceMotion, "section")}>
            <SectionKicker>Proof System</SectionKicker>
            <h2
              id="proof-system-heading"
              className="scroll-mt-28 mt-5 max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.92] font-semibold tracking-[-0.055em] text-balance"
            >
              Every state change carries its own explanation.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-pretty text-muted-foreground">
              In most systems, teams explain the numbers after the fact. In
              Afenda, the record already carries its origin, decision path, and
              business consequence.
            </p>
          </motion.div>

          <motion.aside
            className="flagship-principle-panel rounded-[1.75rem] p-6 md:p-7 lg:p-8"
            {...getRevealMotion(reduceMotion, "section", 0.08)}
          >
            <div className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
              Proof Imperatives
            </div>
            <h3 className="mt-3 text-[clamp(1.45rem,2.4vw,1.95rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance">
              A record is not trusted until it can explain itself.
            </h3>
            <FlagshipImperativeList
              reduceMotion={reduceMotion}
              items={PROOF_IMPERATIVES}
            />
          </motion.aside>
        </div>

        <div className="mt-12">
          <FlagshipCardGrid
            reduceMotion={reduceMotion}
            items={PROOF_CARDS}
            columnsClassName="grid gap-6 md:grid-cols-2 md:items-start"
            cardClassName="min-h-0"
            preset="grid"
          />
        </div>
      </div>
    </section>
  )
}

function InterrogationSection({
  reduceMotion,
}: {
  readonly reduceMotion: boolean
}) {
  return (
    <section
      aria-labelledby="system-interrogation-heading"
      className="border-b border-border/70"
    >
      <div className={SECTION_CONTAINER_CLASS_NAME}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <motion.div {...getRevealMotion(reduceMotion, "section")}>
            <SectionKicker>System Interrogation</SectionKicker>
            <h2
              id="system-interrogation-heading"
              className="scroll-mt-28 mt-5 max-w-2xl text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance"
            >
              Ordinary Systems Fail at the Handoff.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
              Numbers break when context leaves the workflow. Afenda keeps the
              work, the actor, and the state transition on the same evidence
              surface, so finance control does not depend on manual recovery.
            </p>
          </motion.div>

          <motion.div {...getRevealMotion(reduceMotion, "section", 0.08)}>
            <FlagshipValidationTable checks={VALIDATION_CHECKS} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CanonSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  const orderedFragments = [...CANON_FRAGMENTS].sort(
    (left, right) =>
      CANON_FRAGMENT_LAYOUT[left.id].mobileOrder -
      CANON_FRAGMENT_LAYOUT[right.id].mobileOrder
  )

  return (
    <section
      aria-labelledby="canonical-record-heading"
      className="border-b border-border/70"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
          <motion.div {...getRevealMotion(reduceMotion, "section")}>
            <div className="flagship-canon-field relative rounded-[2.25rem] p-6 md:p-8">
              <div className="flagship-grid absolute inset-0 opacity-80" />
              <div className="flagship-grain absolute inset-0 opacity-70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_44%)]" />

              <div className="relative grid gap-4 md:hidden">
                {orderedFragments.map((fragment, index) => (
                  <motion.div
                    key={fragment.id}
                    className="flagship-fragment-chip rounded-2xl px-4 py-4"
                    {...getRevealMotion(reduceMotion, "section", index * 0.05)}
                  >
                    <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                      {fragment.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {fragment.note}
                    </p>
                  </motion.div>
                ))}

                <div className="flagship-canon-core rounded-[1.75rem] px-6 py-8 text-center">
                  <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                    <span translate="no">NexusCanon</span>
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
                    One Record.
                    <br />
                    No Parallel Story.
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Document, entity, event, and transition remain forced into
                    one accountable sequence.
                  </p>
                </div>
              </div>

              <div className="relative hidden min-h-[36rem] md:block">
                <div className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />

                {orderedFragments.map((fragment, index) => {
                  const layout = CANON_FRAGMENT_LAYOUT[fragment.id]

                  return (
                    <motion.div
                      key={fragment.id}
                      className={`flagship-fragment-chip absolute max-w-[13.5rem] rounded-2xl px-4 py-4 ${layout.desktopClassName}`}
                      initial={{
                        opacity: 0,
                        x: reduceMotion ? 0 : index < 2 ? -18 : 18,
                        y: reduceMotion ? 0 : index % 2 === 0 ? -10 : 10,
                      }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{
                        duration: 0.68,
                        delay: index * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
                        {fragment.label}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {fragment.note}
                      </p>
                    </motion.div>
                  )
                })}

                <motion.div
                  className="flagship-canon-core absolute top-1/2 left-1/2 w-[min(26rem,76%)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] px-8 py-10 text-center"
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.78,
                    delay: 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                    <span translate="no">NexusCanon</span>
                  </div>
                  <div className="mt-4 text-[clamp(2.2rem,4vw,3.3rem)] leading-[0.92] font-semibold tracking-[-0.06em]">
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

          <motion.div {...getRevealMotion(reduceMotion, "section", 0.08)}>
            <SectionKicker>Canonical Record</SectionKicker>
            <h2
              id="canonical-record-heading"
              className="scroll-mt-28 mt-5 max-w-2xl text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-balance"
            >
              This is the structural difference.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
              Most systems let the record fracture, then ask teams to recover
              coherence later.
              <span translate="no"> NexusCanon</span> is the operating logic
              that prevents that fracture from becoming normal.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                "Order, stock, and accounting consequence remain in one continuity chain.",
                "Teams work on the same accountable record instead of exporting responsibility into spreadsheets.",
                "Audit readiness becomes a property of execution, not a project after the fact.",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  className="flagship-proof-item flex items-start gap-3 rounded-2xl p-4"
                  {...getRevealMotion(
                    reduceMotion,
                    "section",
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

function FinalSection({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <section
      aria-labelledby="final-reckoning-heading"
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/8" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-end">
          <motion.div {...getRevealMotion(reduceMotion, "section")}>
            <Card className="flagship-card">
              <CardHeader className="gap-4">
                <Badge
                  variant="outline"
                  className="w-fit border-primary/20 bg-background/70 text-foreground"
                >
                  Final Reckoning
                </Badge>
                <CardTitle className="max-w-4xl text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[0.94] font-semibold tracking-[-0.055em] text-balance">
                  Stop explaining the system.
                  <br />
                  Let the system explain itself.
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
                    <Link to={HERO_PRIMARY_ACTION.to}>
                      {HERO_PRIMARY_ACTION.label}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className={CTA_OUTLINE_CLASS_NAME}
                  >
                    <Link to={HERO_SECONDARY_ACTION.to}>
                      {HERO_SECONDARY_ACTION.label}
                    </Link>
                  </Button>
                </div>

                <div className="max-w-xl text-sm leading-7 text-pretty text-muted-foreground">
                  Finance, inventory, and operations do not need another layer
                  of explanation. They need a system where origin, consequence,
                  and continuity remain visible by design.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...getRevealMotion(reduceMotion, "section", 0.08)}>
            <SectionKicker>What Changes</SectionKicker>
            <h2
              id="final-reckoning-heading"
              className="scroll-mt-28 mt-5 max-w-xl text-[clamp(2rem,4vw,3.4rem)] leading-[0.96] font-semibold tracking-[-0.05em] text-balance"
            >
              Enterprise discipline.
              <br />
              Modern operating feel.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-pretty text-muted-foreground">
              That is the promise. A business ERP that feels current in daily
              use, but remains serious enough for close, control, scale, and
              review.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {FINAL_LINK_ACTIONS.map((item) => (
                <Button
                  key={`${item.label}:${item.to}`}
                  asChild
                  size="sm"
                  variant="outline"
                  className={CTA_OUTLINE_CLASS_NAME}
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
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell>
      <HeroSection reduceMotion={reduceMotion} />
      <BenchmarkSection reduceMotion={reduceMotion} />
      <ModuleSection reduceMotion={reduceMotion} />
      <ProofSection reduceMotion={reduceMotion} />
      <InterrogationSection reduceMotion={reduceMotion} />
      <CanonSection reduceMotion={reduceMotion} />
      <FinalSection reduceMotion={reduceMotion} />
    </MarketingPageShell>
  )
}
```

---

## What this fixes

### Structure

- Breaks the monolith into content, motion, status, constants, primitives, and page assembly.
- Removes fake type fragmentation by using `FeatureCard` as a shared card contract.

### Normalization

- Separates content from layout and layout from motion.
- Converts validation statuses into keyed serialized state.
- Moves canonical fragment positioning out of content objects.

### Serialization

- Page data is now much easier to test, diff, and evolve.
- Status, reveal motion, and link actions all have canonical sources.

### Maintainability

- The page file now reads as orchestration instead of as a giant mixed-definition artifact.
- Repeated intro/card/CTA/validation patterns are extracted into primitives.

---

## Final engineering advice

Do next:

1. Add a Vitest file that asserts:
   - `VALIDATION_STATUS_META` covers every `ValidationStatusKey`
   - every `CANON_FRAGMENT` has layout metadata
   - all CTA links are non-empty
   - `HERO_FACTS` always has exactly 3 entries if that is a design invariant

2. If this flagship page becomes a pattern, promote these primitives into a `marketing-flagship` shared layer.
3. Keep copy content in content files, not inside JSX.

If you want, the next pass should be a **true compile-safe repo patch** for your exact folder topology, with import paths adjusted to your real project tree.
