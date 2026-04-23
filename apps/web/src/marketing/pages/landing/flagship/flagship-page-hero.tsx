/**
 * Flagship page refactor boundary.
 * Owns only the hero section for `apps/web` marketing flagship.
 * Do not mix page composition, editorial source, or shared motion here.
 * Page order lives in `flagship-page.tsx`.
 * Copy contract lives in `flagship-page-editorial.ts`.
 * Motion helpers live in `flagship-page-motion.ts`.
 */
import { useRef } from "react"

import { Button } from "@afenda/design-system/ui-primitives"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { marketingGlassDarkNavInner } from "../../../components"
import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"
import { FLAGSHIP_PAGE_CONTENT } from "./flagship-page-editorial"

export interface FlagshipPageHeroProps {
  readonly reduceMotion?: boolean
}

type TruthStage = {
  readonly code: string
  readonly label: string
  readonly note: string
  readonly status: string
  readonly activeRange: readonly [number, number, number, number]
}

type ChaosFragment = {
  readonly code: string
  readonly label: string
  readonly note: string
  readonly xRange: readonly number[]
  readonly yRange: readonly number[]
  readonly rotateRange: readonly number[]
}

const TRUTH_STAGES: readonly TruthStage[] = [
  {
    code: "CHECK_001",
    label: "Origin",
    note: "Unattributed activity is rejected before it becomes trusted state.",
    status: "ATTRIBUTION ENFORCED",
    activeRange: [0, 1, 1, 0.34],
  },
  {
    code: "CHECK_002",
    label: "Causality",
    note: "Transitions keep the business event that made them valid.",
    status: "CHAIN PRESERVED",
    activeRange: [0, 0.26, 1, 0.68],
  },
  {
    code: "CHECK_003",
    label: "Continuity",
    note: "Finance, operations, and evidence return to one explainable field.",
    status: "TRUTH STABILIZED",
    activeRange: [0, 0.58, 1, 1],
  },
] as const

const CHAOS_FRAGMENTS: readonly ChaosFragment[] = [
  {
    code: "CHECK_001",
    label: "Origin fracture",
    note: "posted value arrives without accountable beginning",
    xRange: [-280, -96, -36],
    yRange: [-120, -74, -42],
    rotateRange: [-10, -6, -3],
  },
  {
    code: "CHECK_002",
    label: "Causality lag",
    note: "approval and state transition stop agreeing",
    xRange: [-56, -12, 48],
    yRange: [110, 42, 8],
    rotateRange: [7, 3, 0],
  },
  {
    code: "CHECK_003",
    label: "Continuity drift",
    note: "record continuity leaks across systems and review surfaces",
    xRange: [168, 88, 26],
    yRange: [-24, 22, 56],
    rotateRange: [-6, -3, -1],
  },
] as const

const { hero: HERO_CONTENT } = FLAGSHIP_PAGE_CONTENT

export function FlagshipPageHero({
  reduceMotion: reduceMotionProp,
}: FlagshipPageHeroProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedFromOs = useReducedMotion()
  const reduceMotion =
    reduceMotionProp !== undefined ? reduceMotionProp : !!reducedFromOs

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const progress = useSpring(scrollYProgress, {
    damping: reduceMotion ? 44 : 28,
    stiffness: reduceMotion ? 260 : 92,
    mass: reduceMotion ? 0.28 : 0.72,
    restDelta: 0.001,
  })

  const navOpacity = useTransform(progress, [0.82, 0.9], [0, 1])
  const navY = useTransform(progress, [0.82, 0.9], [-16, 0])

  return (
    <section
      ref={containerRef}
      aria-label={HERO_CONTENT.regionLabel}
      className="relative h-[400vh] overflow-clip bg-[#060606] text-white selection:bg-white selection:text-black"
    >
      <HeroNav opacity={navOpacity} y={navY} />
      <HeroScrollCue progress={progress} />

      <div className="sticky top-0 h-screen overflow-hidden">
        <HeroBackdrop progress={progress} />
        <TruthSpine progress={progress} />
        <HeroFragments progress={progress} reduceMotion={reduceMotion} />
        <HeroBeam progress={progress} />
        <HeroCopy progress={progress} />
      </div>
    </section>
  )
}

function HeroNav({
  opacity,
  y,
}: {
  opacity: MotionValue<number>
  y: MotionValue<number>
}) {
  const pointerEvents = useTransform(opacity, (value) =>
    value < 0.08 ? "none" : "auto"
  )

  return (
    <motion.header
      style={{ opacity, y, pointerEvents }}
      className="fixed inset-x-0 top-0 z-[100]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-5 md:px-8 md:pt-8">
        <div className={marketingGlassDarkNavInner}>
          <Link
            to={MARKETING_PAGE_HREFS.flagship}
            className="flex min-w-0 items-center gap-3 rounded-full focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <div className="flex size-9 items-center justify-center rounded-full border border-white/16 bg-white/5 text-sm font-semibold text-white">
              A
            </div>
            <div className="min-w-0">
              <div
                className="text-sm font-semibold tracking-tight text-white"
                translate="no"
              >
                {HERO_CONTENT.navTitle}
              </div>
              <div className="text-xs text-white/52">
                {HERO_CONTENT.navTagline}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to={MARKETING_PAGE_HREFS.truthEngine}
              className="hidden text-sm font-medium text-white/58 transition-colors hover:text-white md:inline-flex"
            >
              Truth Engine
            </Link>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/login">
                Enter Workspace
                <ArrowRight aria-hidden="true" className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

function HeroScrollCue({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.04, 0.14, 0.2], [0.8, 1, 1, 0])
  const y = useTransform(progress, [0, 0.08], [10, 0])
  const pulseY = useTransform(progress, [0, 0.02, 0.04], [0, 8, 0])

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none fixed inset-x-0 top-1/2 z-[90] flex -translate-y-1/2 justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="font-mono text-[10px] tracking-[0.44em] text-white/58 uppercase">
          Scroll to resolve
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-px bg-gradient-to-b from-white/8 via-white/70 to-transparent" />
          <motion.div
            style={{ y: pulseY }}
            className="size-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.5)]"
          />
        </div>
      </div>
    </motion.div>
  )
}

function HeroBackdrop({ progress }: { progress: MotionValue<number> }) {
  const gridOpacity = useTransform(
    progress,
    [0, 0.26, 0.74, 1],
    [0.12, 0.18, 0.08, 0.04]
  )
  const leftGlowOpacity = useTransform(
    progress,
    [0, 0.26, 0.62],
    [0.26, 0.18, 0.06]
  )
  const rightGlowOpacity = useTransform(
    progress,
    [0.38, 0.72, 1],
    [0.04, 0.24, 0.18]
  )

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#040404_0%,#070707_42%,#0a0a0a_100%)]" />
      <motion.div
        style={{ opacity: leftGlowOpacity }}
        className="absolute top-[12%] left-[-14vw] h-[38rem] w-[38rem] rounded-full bg-white blur-[140px]"
      />
      <motion.div
        style={{ opacity: rightGlowOpacity }}
        className="absolute top-[18%] right-[-10vw] h-[34rem] w-[34rem] rounded-full bg-white blur-[130px]"
      />
      <motion.div
        style={{ opacity: gridOpacity }}
        className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]"
      />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/14 to-transparent" />
    </>
  )
}

function TruthSpine({ progress }: { progress: MotionValue<number> }) {
  const spineOpacity = useTransform(progress, [0.1, 0.2, 0.96], [0, 1, 1])

  return (
    <motion.aside
      style={{ opacity: spineOpacity }}
      className="pointer-events-none absolute top-1/2 right-8 z-30 hidden w-44 -translate-y-1/2 lg:block"
    >
      <div className="font-mono text-[10px] tracking-[0.3em] text-white/46 uppercase">
        Truth spine
      </div>
      <div className="mt-4 space-y-3">
        {TRUTH_STAGES.map((stage) => (
          <TruthStageItem key={stage.code} stage={stage} progress={progress} />
        ))}
      </div>
    </motion.aside>
  )
}

function TruthStageItem({
  stage,
  progress,
}: {
  stage: TruthStage
  progress: MotionValue<number>
}) {
  const stageRange = [...stage.activeRange]
  const opacity = useTransform(progress, stageRange, [0.26, 0.54, 1, 0.54])
  const scale = useTransform(progress, stageRange, [0.96, 1, 1.03, 1])
  const x = useTransform(progress, stageRange, [8, 0, 0, 0])
  const borderOpacity = useTransform(
    progress,
    stageRange,
    [0.12, 0.24, 0.42, 0.22]
  )
  const borderColor = useTransform(borderOpacity, (value: number) => {
    return `rgba(255,255,255,${String(value)})`
  })

  return (
    <motion.div
      style={{
        opacity,
        scale,
        x,
        borderColor,
      }}
      className="rounded-[1.35rem] border bg-white/[0.04] px-4 py-4 backdrop-blur-sm"
    >
      <div className="font-mono text-[10px] tracking-[0.24em] text-white/42 uppercase">
        {stage.code}
      </div>
      <div className="mt-2 text-sm font-semibold tracking-[-0.02em] text-white">
        {stage.label}
      </div>
      <div className="mt-2 text-xs leading-5 text-white/60">{stage.note}</div>
      <div className="mt-3 font-mono text-[10px] tracking-[0.22em] text-white/44 uppercase">
        {stage.status}
      </div>
    </motion.div>
  )
}

function HeroFragments({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
  return (
    <div className="absolute inset-0 z-20">
      {CHAOS_FRAGMENTS.map((fragment, index) => (
        <ChaosFragmentCard
          key={fragment.code}
          fragment={fragment}
          index={index}
          progress={progress}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  )
}

function ChaosFragmentCard({
  fragment,
  index,
  progress,
  reduceMotion,
}: {
  fragment: ChaosFragment
  index: number
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
  const x = useTransform(progress, [0.02, 0.38, 0.72], [...fragment.xRange])
  const y = useTransform(progress, [0.02, 0.38, 0.72], [...fragment.yRange])
  const rotate = useTransform(
    progress,
    [0.02, 0.38, 0.72],
    [...fragment.rotateRange]
  )
  const opacity = useTransform(
    progress,
    [0.02, 0.12, 0.64, 0.82],
    [0, 0.88, 0.56, 0.18]
  )
  const scale = useTransform(progress, [0.08, 0.6, 0.82], [1.04, 0.98, 0.94])

  const positions = [
    "top-[18%] left-[10%]",
    "top-[52%] left-[26%]",
    "top-[26%] left-[40%]",
  ] as const

  return (
    <motion.div
      style={
        reduceMotion ? { opacity, scale } : { x, y, rotate, opacity, scale }
      }
      className={`absolute ${positions[index]} max-w-[18rem] rounded-[1.9rem] border border-white/12 bg-white/[0.06] px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md`}
    >
      <div className="font-mono text-[10px] tracking-[0.3em] text-white/44 uppercase">
        {fragment.code}
      </div>
      <div className="mt-2 text-sm font-semibold tracking-[0.02em] text-white/90 uppercase">
        {fragment.label}
      </div>
      <p className="mt-3 text-[0.96rem] leading-7 text-white/62">
        {fragment.note}
      </p>
    </motion.div>
  )
}

function HeroBeam({ progress }: { progress: MotionValue<number> }) {
  const beamOpacity = useTransform(
    progress,
    [0.18, 0.36, 0.78],
    [0, 0.42, 0.16]
  )
  const beamScale = useTransform(progress, [0.2, 0.54, 0.82], [0.72, 1, 1.08])
  const beamX = useTransform(progress, [0.18, 0.78], ["-2%", "6%"])

  return (
    <motion.div
      style={{ opacity: beamOpacity, scale: beamScale, x: beamX }}
      className="pointer-events-none absolute inset-y-[16%] left-[42%] z-10 hidden w-[26%] lg:block"
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 38%, rgba(255,255,255,0.86) 100%)",
          clipPath: "polygon(0 14%, 64% 0, 100% 50%, 64% 100%, 0 86%, 18% 50%)",
          filter: "blur(18px)",
        }}
      />
    </motion.div>
  )
}

function HeroCopy({ progress }: { progress: MotionValue<number> }) {
  const phaseOneOpacity = useTransform(
    progress,
    [0.03, 0.1, 0.18, 0.24],
    [0, 1, 1, 0]
  )
  const phaseOneY = useTransform(progress, [0.04, 0.22], [20, -14])

  const phaseTwoOpacity = useTransform(
    progress,
    [0.18, 0.26, 0.44, 0.54],
    [0, 1, 1, 0]
  )
  const phaseTwoY = useTransform(progress, [0.2, 0.5], [16, -8])

  const finalOpacity = useTransform(progress, [0.44, 0.56, 1], [0, 1, 1])
  const finalY = useTransform(progress, [0.44, 0.62], [24, 0])
  const finalX = useTransform(progress, [0.44, 0.62], [28, 0])
  const finalScale = useTransform(progress, [0.46, 0.64], [0.97, 1])

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <motion.div
        style={{ opacity: phaseOneOpacity, y: phaseOneY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
      >
        <div className="max-w-5xl">
          <div className="font-mono text-[10px] tracking-[0.44em] text-white/52 uppercase">
            {HERO_CONTENT.phaseOneEyebrow}
          </div>
          <h1 className="mt-6 text-[clamp(4.5rem,11vw,9rem)] leading-[0.84] font-black tracking-[-0.07em] text-white uppercase">
            {HERO_CONTENT.phaseOneHeading}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-sm tracking-[0.28em] text-white/56 uppercase md:text-[12px]">
            {HERO_CONTENT.phaseOneSupport}
          </p>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: phaseTwoOpacity, y: phaseTwoY }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
      >
        <div className="max-w-5xl">
          <div className="font-mono text-[10px] tracking-[0.44em] text-white/52 uppercase">
            {HERO_CONTENT.phaseTwoEyebrow}
          </div>
          <h2 className="mt-6 text-[clamp(4rem,10vw,8rem)] leading-[0.84] font-black tracking-[-0.07em] text-white uppercase">
            {HERO_CONTENT.phaseTwoHeading}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm tracking-[0.28em] text-white/56 uppercase md:text-[12px]">
            {HERO_CONTENT.phaseTwoSupport}
          </p>
        </div>
      </motion.div>

      <motion.div
        style={{
          opacity: finalOpacity,
          x: finalX,
          y: finalY,
          scale: finalScale,
        }}
        className="absolute inset-0 flex items-center justify-center px-6 py-12 lg:justify-end lg:px-20"
      >
        <div className="pointer-events-auto w-full max-w-[38rem] rounded-[2.8rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.07))] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl md:p-9">
          <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-5">
            <div className="font-mono text-[10px] tracking-[0.34em] text-white/48 uppercase">
              {HERO_CONTENT.finalEyebrow}
            </div>
            <div className="font-mono text-[10px] tracking-[0.26em] text-white/34 uppercase">
              {HERO_CONTENT.finalStatusLabel}
            </div>
          </div>
          <h2 className="mt-5 text-[clamp(3.2rem,7vw,5.6rem)] leading-[0.84] font-black tracking-[-0.065em] text-white">
            {HERO_CONTENT.finalHeading}
          </h2>
          <p className="mt-6 max-w-[28rem] text-[1.05rem] leading-8 text-white/72 md:text-[1.12rem]">
            {HERO_CONTENT.finalBody}
          </p>

          <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="space-y-3">
              {HERO_CONTENT.finalProofPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 text-white/72"
                >
                  <div className="mt-1.5 flex size-6 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheck
                      aria-hidden="true"
                      className="size-3.5 text-white"
                    />
                  </div>
                  <p className="text-sm leading-6">{point}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-black/24 px-4 py-4">
              <div className="font-mono text-[10px] tracking-[0.24em] text-white/38 uppercase">
                {HERO_CONTENT.machineStateLabel}
              </div>
              <div className="mt-3 space-y-2 font-mono text-[10px] tracking-[0.22em] text-white/56 uppercase">
                {HERO_CONTENT.machineStateItems.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white text-black hover:bg-white/90"
            >
              <Link to="/login">
                Enter Workspace
                <ArrowRight aria-hidden="true" className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <Link to={MARKETING_PAGE_HREFS.truthEngine}>
                See the truth engine
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
