import { useRef } from "react"

import { Button } from "@afenda/design-system/ui-primitives"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion"
import { ArrowRight, Shield } from "lucide-react"
import { Link } from "react-router-dom"

import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"

export interface FlagshipStickyHeroProps {
  readonly reduceMotion?: boolean
}

export function FlagshipStickyHero({
  reduceMotion: reduceMotionProp,
}: FlagshipStickyHeroProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedFromOs = useReducedMotion()
  const reduceMotion =
    reduceMotionProp !== undefined ? reduceMotionProp : !!reducedFromOs

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const progress = useSpring(scrollYProgress, {
    damping: reduceMotion ? 44 : 30,
    stiffness: reduceMotion ? 220 : 80,
    mass: reduceMotion ? 0.25 : 0.7,
    restDelta: 0.001,
  })

  const navOpacity = useTransform(progress, [0.82, 0.9], [0, 1])
  const navY = useTransform(progress, [0.82, 0.9], [-16, 0])

  return (
    <section
      ref={containerRef}
      aria-label="Flagship truth sequence"
      className="relative h-[520vh] overflow-clip bg-[#050505] text-white selection:bg-white selection:text-black"
    >
      <HeroNav opacity={navOpacity} y={navY} />
      <HeroHud progress={progress} />
      <HeroScrollSignal progress={progress} />

      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <ResolvePhaseRail progress={progress} />
        <ForensicGrid progress={progress} />
        <ResolveCore progress={progress} reduceMotion={reduceMotion} />
        <ResolveTypography progress={progress} reduceMotion={reduceMotion} />
      </div>
    </section>
  )
}

export default FlagshipStickyHero

function HeroNav({
  opacity,
  y,
}: {
  opacity: MotionValue<number>
  y: MotionValue<number>
}) {
  const pointerEvents = useTransform(opacity, (value) =>
    value < 0.1 ? "none" : "auto"
  )

  return (
    <motion.header
      style={{ opacity, y, pointerEvents }}
      className="fixed inset-x-0 top-0 z-[100]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-5 md:px-8 md:pt-8">
        <div className="flex items-center justify-between rounded-full border border-white/12 bg-black/48 px-4 py-2.5 backdrop-blur-xl md:px-6 md:py-3">
          <Link
            to={MARKETING_PAGE_HREFS.flagship}
            className="flex min-w-0 items-center gap-3 rounded-full focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <div className="flex size-9 items-center justify-center rounded-full border border-white/18 bg-white/5 text-sm font-semibold text-white">
              A
            </div>
            <div className="min-w-0">
              <div
                className="text-sm font-semibold tracking-tight text-white"
                translate="no"
              >
                Afenda Truth Layer
              </div>
              <div className="text-xs text-white/54">
                Resolve to Polaris. Polaris to One Machine.
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to={MARKETING_PAGE_HREFS.truthEngine}
              className="hidden text-sm font-medium text-white/56 transition-colors hover:text-white md:inline-flex"
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

function HeroHud({ progress }: { progress: MotionValue<number> }) {
  const hudOpacity = useTransform(progress, [0, 0.08, 0.9], [0, 1, 0.46])
  const resolveOpacity = useTransform(progress, [0, 0.34, 0.46], [1, 1, 0])
  const machineOpacity = useTransform(progress, [0.82, 0.92, 1], [0, 1, 1])

  return (
    <motion.div
      style={{ opacity: hudOpacity }}
      className="pointer-events-none fixed inset-0 z-[120] flex flex-col justify-end p-6 font-mono text-[9px] font-semibold tracking-[0.36em] text-white/56 uppercase md:p-10"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5 leading-none">
          <motion.div
            style={{ opacity: resolveOpacity }}
            className="min-w-[24ch] text-white/70"
          >
            [1] RESOLVE_COLLAPSING
          </motion.div>
          <motion.div
            style={{ opacity: machineOpacity }}
            className="min-w-[24ch] text-white/70"
          >
            [2] ONE_MACHINE_LOCKED
          </motion.div>
          <div className="text-white/56">TRUTH_PROTOCOL_ACTIVE</div>
        </div>
        <div className="text-white/44">TRUTH_LAYER_SYNC // OK</div>
      </div>
    </motion.div>
  )
}

function HeroScrollSignal({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.02, 0.14, 0.2], [0.75, 1, 1, 0])
  const y = useTransform(progress, [0, 0.08], [10, 0])
  const pulseY = useTransform(progress, [0, 0.02, 0.04], [0, 8, 0])
  const brandOpacity = useTransform(progress, [0, 0.05, 0.16], [0.36, 0.72, 0])

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none fixed inset-x-0 top-1/2 z-[110] flex -translate-y-1/2 justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          style={{ opacity: brandOpacity }}
          className="inline-flex items-center gap-3 font-mono text-[10px] font-medium tracking-[0.42em] text-white/52 uppercase"
        >
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/28" />
          <span>AFENDA</span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/28" />
        </motion.div>
        <div className="font-mono text-[10px] font-medium tracking-[0.4em] text-white/64 uppercase">
          Scroll to Resolve
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-px bg-gradient-to-b from-white/6 via-white/70 to-transparent" />
          <motion.div
            style={{ y: pulseY }}
            className="size-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.45)]"
          />
        </div>
      </div>
    </motion.div>
  )
}

function ResolvePhaseRail({ progress }: { progress: MotionValue<number> }) {
  const railPresence = useTransform(
    progress,
    [0, 0.04, 0.32, 0.48, 0.52],
    [0, 1, 1, 1, 0]
  )
  const velocity = useVelocity(progress)
  const timer = useTransform(progress, (value) =>
    String(Math.min(2999, Math.floor(value * 4546))).padStart(3, "0")
  )
  const rpm = useTransform(velocity, (value) =>
    String(Math.min(999, Math.floor(Math.abs(value) * 26000))).padStart(3, "0")
  )
  const railScale = useTransform(progress, [0.08, 0.18, 0.3], [0.88, 1, 1.18])
  const railX = useTransform(progress, [0.08, 0.3], [0, 48])
  const railY = useTransform(progress, [0.08, 0.3, 0.5], [0, -6, -35])
  const panelWidth = useTransform(progress, [0.08, 0.22, 0.32], [180, 220, 268])
  const panelOffset = useTransform(progress, [0.08, 0.22, 0.32], [10, 18, 28])
  const panelHeight = useTransform(
    progress,
    [0.08, 0.22, 0.32],
    [168, 240, 332]
  )
  const numberScale = useTransform(progress, [0.08, 0.22, 0.32], [1, 1.08, 1.2])
  const axisHeight = panelHeight
  const scanY = useTransform(progress, [0.08, 0.32], [20, 300])
  const exitProgress = useTransform(progress, [0.32, 0.42, 0.5], [0, 0, 1])
  const exitOpacity = useTransform(exitProgress, [0, 0.95, 1], [1, 1, 0])
  const exitY = useTransform(exitProgress, [0, 1], [0, -28])
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.94])
  const exitBlur = useTransform(
    exitProgress,
    (value) => `blur(${(value * 1.4).toFixed(2)}px)`
  )
  const axisCoreOpacity = useTransform(
    exitProgress,
    [0, 0.95, 1],
    [0.92, 0.92, 0]
  )
  const axisGlowOpacity = useTransform(
    exitProgress,
    [0, 0.4, 1],
    [0.75, 0.35, 0]
  )

  return (
    <motion.aside
      style={{ opacity: railPresence, scale: railScale, x: railX, y: railY }}
      className="pointer-events-none absolute top-1/2 left-10 z-30 hidden -translate-y-1/2 md:block"
    >
      <motion.div
        style={{
          opacity: exitOpacity,
          y: exitY,
          scale: exitScale,
          filter: exitBlur,
          transformOrigin: "left center",
        }}
        className="relative"
      >
        {/* Debug timer intentionally shares the exact axis motion channel. */}
        <motion.div
          style={{ height: axisHeight, opacity: axisCoreOpacity }}
          className="absolute top-1/2 left-4 -translate-y-1/2"
        >
          <div className="flex h-full items-center">
            <div className="rounded-sm border border-white/12 bg-black/44 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.24em] text-white/82 uppercase">
              DBG_TIMER::AXIS{" "}
              <motion.span className="ml-2">{timer}</motion.span>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{
            height: axisHeight,
            opacity: axisCoreOpacity,
          }}
          className="absolute top-1/2 left-0 w-px -translate-y-1/2 overflow-hidden bg-gradient-to-b from-white/9 via-white/24 to-transparent"
        >
          <motion.div
            style={{ y: scanY, opacity: axisGlowOpacity }}
            className="absolute left-1/2 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_12px_rgba(255,255,255,0.5)]"
          />
        </motion.div>

        <motion.div
          style={{
            width: panelWidth,
            height: panelHeight,
            marginLeft: panelOffset,
          }}
          className="relative border border-white/12 bg-white/[0.045] px-6 py-6 backdrop-blur-[2px]"
        >
          <div className="space-y-5">
            <div className="font-mono text-[10px] tracking-[0.34em] text-white/52 uppercase">
              Phase Clock
            </div>
            <motion.div
              style={{ scale: numberScale, originX: 0, originY: 0.5 }}
              className="font-mono text-[5.75rem] leading-none font-semibold tracking-[-0.12em] text-white/94"
            >
              <motion.span>{timer}</motion.span>
            </motion.div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-white/46 uppercase">
              Collapse Window
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-5">
            <div className="flex items-end justify-between gap-8">
              <div>
                <div className="font-mono text-[9px] tracking-[0.28em] text-white/46 uppercase">
                  RPM
                </div>
                <div className="mt-2 font-mono text-3xl leading-none font-semibold tracking-[-0.1em] text-white/88">
                  <motion.span>{rpm}</motion.span>
                </div>
              </div>
              <div className="max-w-[8rem] text-right font-mono text-[9px] leading-relaxed tracking-[0.26em] text-white/40 uppercase">
                Scroll Velocity
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
            <div className="font-mono text-[9px] tracking-[0.28em] text-white/40 uppercase">
              Runaway Axis
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.aside>
  )
}

function ResolveCore({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
  const rotation = useTransform(progress, [0, 0.7, 1], [45, 0, -15])
  const scale = useTransform(progress, [0, 0.7, 0.9, 1], [0.4, 1, 1.08, 12])
  const perspective = useTransform(progress, [0, 1], ["1000px", "400px"])

  return (
    <motion.div
      className="relative z-10 flex h-full w-full items-center justify-center"
      style={{ perspective }}
    >
      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotation,
          rotateY: reduceMotion ? 0 : rotation,
          scale,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {[...Array(8)].map((_, index) => (
          <TruthLayer key={index} index={index} progress={progress} />
        ))}
      </motion.div>
    </motion.div>
  )
}

function TruthLayer({
  index,
  progress,
}: {
  index: number
  progress: MotionValue<number>
}) {
  const depth = (index - 4) * 200
  const z = useTransform(progress, [0, 0.6], [depth, 0])
  const opacity = useTransform(progress, [0, 0.2, 0.6, 0.8], [0, 0.4, 1, 0])
  const borderWidth = useTransform(progress, [0.5, 0.6], [1, 3])

  return (
    <motion.div
      className="absolute inset-0 m-auto flex items-center justify-center overflow-hidden border border-white/10"
      style={{
        width: 400 + index * 40,
        height: 400 + index * 40,
        z,
        opacity,
        borderWidth,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="flex h-full w-full flex-wrap gap-2 overflow-hidden p-4 font-mono text-[8px] break-all opacity-20">
        {Array(10)
          .fill(0)
          .map((_, row) => {
            const suffix = (((index * 31 + row * 17) * 2654435761) >>> 0)
              .toString(16)
              .slice(0, 6)
            return (
              <span key={row}>
                0x{index}
                {row}FF_TRUTH_STMT_{suffix}
              </span>
            )
          })}
      </div>
    </motion.div>
  )
}

function ResolveTypography({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
  const chaosY = useTransform(progress, [0, 0.3], [reduceMotion ? 0 : 80, 0])
  const chaosOpacity = useTransform(progress, [0, 0.16, 0.3], [0, 1, 0])

  const resolvedScale = useTransform(progress, [0.5, 0.7], [0.84, 1])
  const resolvedOpacity = useTransform(
    progress,
    [0.5, 0.6, 0.8, 0.9],
    [0, 1, 1, 0]
  )

  const machineOpacity = useTransform(progress, [0.86, 0.95], [0, 1])

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
      <motion.div
        style={{ y: chaosY, opacity: chaosOpacity }}
        className="absolute px-6"
      >
        <div className="font-mono text-[10px] tracking-[0.45em] text-white/56 uppercase">
          Phase 1 / Fragmented Truth
        </div>
        <h2 className="mt-6 text-[clamp(5rem,12vw,9rem)] leading-[0.84] font-black tracking-tighter text-white uppercase italic">
          Fragmented
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-sm tracking-[0.34em] text-white/58 uppercase md:text-[12px]">
          Truth is split across surfaces before the canon restores it.
        </p>
      </motion.div>

      <motion.div
        style={{ scale: resolvedScale, opacity: resolvedOpacity }}
        className="absolute px-6"
      >
        <h2 className="text-[clamp(4rem,10vw,8rem)] leading-[0.86] font-bold tracking-tight text-white uppercase">
          Resolve.
        </h2>
        <div className="mx-auto mt-8 h-px w-64 bg-white" />
      </motion.div>

      <motion.div
        style={{ opacity: machineOpacity }}
        className="absolute inset-0 overflow-hidden bg-[#050505] px-8 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_50%,rgba(255,255,255,0.14),transparent_70%),radial-gradient(60%_50%_at_85%_15%,rgba(255,255,255,0.08),transparent_72%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px] opacity-[0.05]" />
        <div className="absolute top-[16%] -left-[7vw] text-[clamp(7rem,20vw,19rem)] leading-[0.8] font-black tracking-[-0.08em] text-white/[0.06] uppercase select-none">
          AFENDA
        </div>
        <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/16 to-transparent lg:block" />

        <div className="relative mx-auto flex h-full w-full max-w-[88rem] items-center">
          <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-white">
                <Shield className="size-4" aria-hidden="true" />
                <span className="font-mono text-[10px] tracking-[0.36em] uppercase">
                  Machine Integrity Locked
                </span>
              </div>
              <h3 className="font-mono text-[11px] tracking-[0.48em] text-white/64 uppercase">
                AFENDA // CANON FINALIZATION
              </h3>
              <p className="text-[clamp(4.2rem,11vw,10rem)] leading-[0.8] font-black tracking-[-0.06em] text-white uppercase">
                ONE
                <br />
                MACHINE
              </p>
              <div className="h-px w-full max-w-xl bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
              <p className="max-w-3xl text-[clamp(1.2rem,2.3vw,2rem)] leading-relaxed font-light tracking-tight text-white/78">
                AFENDA resolves truth to canon and binds execution to evidence.
                Authority starts only when proof is attached.
              </p>
              <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-black hover:bg-white/90"
                >
                  <Link to="/login">
                    Initialize Protocol
                    <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  <Link to={MARKETING_PAGE_HREFS.canon}>
                    See the Canon Surface
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="space-y-6 border-l border-white/16 pl-7">
                <div className="font-mono text-[10px] tracking-[0.36em] text-white/46 uppercase">
                  AFENDA Brand Lock
                </div>
                <div className="font-mono text-[1.7rem] leading-[0.88] font-semibold tracking-[0.12em] text-white uppercase">
                  AFENDA
                  <br />
                  ONE CORE
                </div>
                <div className="space-y-2 font-mono text-[10px] tracking-[0.3em] text-white/52 uppercase">
                  <div>AFENDA State // Canonized</div>
                  <div>AFENDA Proof // Bound</div>
                  <div>AFENDA Execution // Admitted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ForensicGrid({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.5, 1], [0.05, 0.15, 0.05])

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-0"
      dangerouslySetInnerHTML={{
        __html: `
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="flagship-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#flagship-grid)" />
          </svg>
        `,
      }}
    />
  )
}
