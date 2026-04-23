/**
 * AFENDA // BEASTMODE V2
 * Architectural Brutalism.
 * High-performance kinetic typography and optical tension.
 */

import { useEffect, useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Spring physics for heavier, architectural cursor feel
  const cursorX = useSpring(0, { stiffness: 150, damping: 15, mass: 0.5 })
  const cursorY = useSpring(0, { stiffness: 150, damping: 15, mass: 0.5 })

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener("mousemove", updateMouse)
    return () => window.removeEventListener("mousemove", updateMouse)
  }, [cursorX, cursorY])

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-hidden bg-white text-black selection:bg-black selection:text-white"
      style={{
        fontFamily: "'Helvetica Neue', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Raw Digital Grain Overlay */}
      <NoiseOverlay />

      {/* Optical Moiré Background */}
      <MoireBackground x={cursorX} y={cursorY} />

      {/* Absolute Inversion Cursor */}
      <CursorBlob x={cursorX} y={cursorY} />

      <main className="relative z-10">
        <HeroExplosion scrollProgress={scrollYProgress} />
        <TruthVoid />
        <TypographicMassacre scrollProgress={scrollYProgress} />
        <TheAbyss />
        <InvertedReality />
        <FinalReckoning />
      </main>
    </div>
  )
}

// --------------------------------------------------------
// NOISE OVERLAY (The Grime)
// --------------------------------------------------------
function NoiseOverlay() {
  return (
    <svg className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.25] mix-blend-difference">
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  )
}

// --------------------------------------------------------
// MOIRÉ PATTERN (Reactive architectural grid)
// --------------------------------------------------------
function MoireBackground({
  x,
  y,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
}) {
  const moveX = useTransform(
    x,
    [0, typeof window !== "undefined" ? window.innerWidth : 1000],
    [-20, 20]
  )
  const moveY = useTransform(
    y,
    [0, typeof window !== "undefined" ? window.innerHeight : 1000],
    [-20, 20]
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]">
      <motion.div
        className="absolute inset-0"
        style={{
          x: moveX,
          y: moveY,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 1px, black 1px, black 3px)`,
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          x: useTransform(moveX, (val) => -val),
          y: useTransform(moveY, (val) => -val),
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 1px, black 1px, black 3px)`,
        }}
      />
    </div>
  )
}

// --------------------------------------------------------
// CURSOR BLOB (Total DOM Inversion)
// --------------------------------------------------------
function CursorBlob({
  x,
  y,
}: {
  x: MotionValue<number>
  y: MotionValue<number>
}) {
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-40 h-[40vw] w-[40vw] rounded-full bg-white mix-blend-difference"
      style={{
        x: useTransform(
          x,
          (val) =>
            val - (typeof window !== "undefined" ? window.innerWidth * 0.2 : 0)
        ),
        y: useTransform(
          y,
          (val) =>
            val - (typeof window !== "undefined" ? window.innerWidth * 0.2 : 0)
        ),
        filter: "blur(60px)",
        opacity: 0.9,
      }}
    />
  )
}

// --------------------------------------------------------
// HERO EXPLOSION (Kinetic Typographic Break)
// --------------------------------------------------------
function HeroExplosion({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>
}) {
  const yLeft = useTransform(scrollProgress, [0, 0.3], [0, -300])
  const yRight = useTransform(scrollProgress, [0, 0.3], [0, 300])
  const skew = useTransform(scrollProgress, [0, 0.2], [0, 15])
  const blur = useTransform(scrollProgress, [0, 0.2], [0, 10])
  const opacity = useTransform(scrollProgress, [0.1, 0.3], [1, 0])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        style={{
          scale: useTransform(scrollProgress, [0, 0.5], [1, 4]),
          opacity: useTransform(scrollProgress, [0, 0.3], [0.04, 0]),
        }}
      >
        <div
          className="text-[120vw] leading-none tracking-tighter"
          style={{ fontWeight: 900 }}
        >
          A
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 flex w-full max-w-[100vw] flex-col items-center px-6"
        style={{ opacity }}
      >
        <motion.div
          className="flex overflow-hidden"
          style={{
            skewX: skew,
            filter: useTransform(blur, (v) => `blur(${v}px)`),
          }}
        >
          <motion.h1
            className="text-[clamp(4rem,18vw,20rem)] leading-[0.75] tracking-tighter"
            style={{ fontWeight: 900, y: yLeft }}
          >
            AFEN
          </motion.h1>
          <motion.h1
            className="text-[clamp(4rem,18vw,20rem)] leading-[0.75] tracking-tighter"
            style={{ fontWeight: 900, y: yRight }}
          >
            DA
          </motion.h1>
        </motion.div>

        <div className="mt-12 flex items-center gap-6 text-xs font-bold tracking-[0.4em] uppercase">
          <span className="h-[2px] w-24 bg-black" />
          <span>The Truth Engine</span>
          <span className="h-[2px] w-24 bg-black" />
        </div>
      </motion.div>
    </section>
  )
}

// --------------------------------------------------------
// TRUTH VOID (Expanding Clip-Path Blackout)
// --------------------------------------------------------
function TruthVoid() {
  const ref = useRef(null)
  const { scrollYProgress: localScroll } = useScroll({
    target: ref,
    offset: ["start 80%", "center center"],
  })

  const clipSize = useTransform(localScroll, [0, 1], [0, 150])
  const clipPath = useTransform(clipSize, (v) => `circle(${v}% at 50% 50%)`)

  return (
    <section ref={ref} className="relative min-h-screen">
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black px-6 text-white"
        style={{ clipPath }}
      >
        <div className="w-full max-w-6xl">
          <div className="mb-24">
            <div className="mb-10 border-l-2 border-white pl-4 text-sm tracking-[0.5em] opacity-50">
              PRINCIPLE 001
            </div>
            <h2 className="mb-12 text-[clamp(4rem,12vw,14rem)] leading-[0.8] tracking-tighter uppercase mix-blend-difference">
              <span className="font-light">Assume</span>
              <br />
              <span className="font-black">Nothing</span>
            </h2>
            <p className="max-w-4xl text-3xl leading-snug font-light opacity-80 mix-blend-difference">
              In the void of assumptions, truth crystallizes. Black is not
              absence—it is the foundation upon which certainty is built.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 border-t border-white/20 pt-16 md:grid-cols-3">
            {[
              { num: "0", label: "ASSUMPTIONS" },
              { num: "∞", label: "PRECISION" },
              { num: "1", label: "TRUTH" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col border-l-4 border-white/30 pl-8"
              >
                <div className="mb-4 text-8xl font-black tracking-tighter md:text-9xl">
                  {stat.num}
                </div>
                <div className="text-sm font-bold tracking-[0.4em] opacity-50">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// --------------------------------------------------------
// TYPOGRAPHIC MASSACRE (Brutalist Grid & Stagger)
// --------------------------------------------------------
function TypographicMassacre({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>
}) {
  const ref = useRef<HTMLElement>(null)
  const xLeft = useTransform(scrollProgress, [0.3, 0.7], [-200, 100])
  const xRight = useTransform(scrollProgress, [0.3, 0.7], [200, -100])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y-[20px] border-black bg-white py-48 text-black"
    >
      {/* Kinetic Marquee Background */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between overflow-hidden py-12 text-[25vw] leading-[0.75] font-black whitespace-nowrap opacity-[0.03]">
        <motion.div style={{ x: xLeft }}>TRUTH IS ABSOLUTE</motion.div>
        <motion.div style={{ x: xRight }}>NO COMPROMISE</motion.div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-screen-2xl flex-col justify-between gap-24 px-6 md:px-12 lg:flex-row">
        <div className="flex w-full flex-col justify-center lg:w-1/3">
          <div className="mb-16 border-b-2 border-black pb-4 text-[10px] font-black tracking-[0.4em] uppercase opacity-40">
            Beyond Borders // Beyond Doubt
          </div>
          <div className="space-y-16">
            {[
              "Transaction truth resolves to reality, not system artifacts.",
              "Reporting truth survives pressure, audit, and scrutiny.",
              "Enterprise truth maintains continuity across all entities.",
            ].map((text, i) => (
              <div
                key={i}
                className="group relative border-l-[6px] border-black pl-8 transition-all duration-300 hover:pl-12"
              >
                <div className="mb-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
                  Chamber {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-2xl leading-tight font-medium tracking-tight uppercase mix-blend-difference">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full items-center justify-end lg:w-1/2">
          <div className="flex flex-col items-end text-right">
            <div className="text-[clamp(8rem,25vw,25rem)] leading-[0.75] font-black tracking-tighter">
              01
            </div>
            <div className="mt-8 border-t-4 border-black pt-4 text-3xl font-light tracking-widest uppercase">
              Single Source
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------
// THE ABYSS (3D Stacked Perspective)
// --------------------------------------------------------
function TheAbyss() {
  const words = ["POLARIS", "BORDERS", "CLARITY", "TRUTH"]

  return (
    <section className="relative overflow-hidden bg-black py-48 text-white perspective-[1000px]">
      <div className="relative mx-auto max-w-screen-2xl px-6 md:px-12">
        <div className="relative z-0 flex flex-col items-center">
          {words.map((word, i) => (
            <motion.div
              key={word}
              className="w-full text-center text-[clamp(5rem,20vw,20rem)] leading-[0.8] font-black tracking-tighter uppercase"
              style={{
                opacity: 0.05 + i * 0.1,
                transformOrigin: "bottom center",
              }}
              initial={{ rotateX: 60, y: 100, opacity: 0 }}
              whileInView={{ rotateX: 0, y: 0, opacity: 0.05 + i * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 1.2,
                delay: i * 0.15,
                ease: [0.25, 1, 0.5, 1],
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center mix-blend-difference">
          <div className="max-w-4xl border border-white/10 bg-black/20 p-12 px-6 text-center backdrop-blur-sm">
            <h2 className="mb-8 text-7xl font-medium tracking-tighter uppercase">
              The Glass Framework
            </h2>
            <p className="text-2xl leading-relaxed font-light opacity-80">
              Transparency is not decoration. It is the visual manifestation of
              zero assumptions. Every layer, every datum, visible and
              verifiable.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------
// INVERTED REALITY (Harsh 4-Quadrant Grid)
// --------------------------------------------------------
function InvertedReality() {
  const chambers = [
    { id: "A", title: "Transaction", truth: "Reality over approximation" },
    { id: "B", title: "Reporting", truth: "Evidence over assumption" },
    { id: "C", title: "Enterprise", truth: "Continuity over drift" },
    { id: "D", title: "Polaris", truth: "Direction over chaos" },
  ]

  return (
    <section className="relative grid grid-cols-1 border-b-[20px] border-black md:grid-cols-2">
      {chambers.map((chamber, i) => {
        const isBlack = i === 1 || i === 2 // Checkered pattern

        return (
          <div
            key={chamber.id}
            className={`group relative flex aspect-square cursor-crosshair items-center justify-center overflow-hidden border border-black/10 ${
              isBlack ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {/* Massive Background Letter */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] transition-transform duration-1000 group-hover:scale-110">
              <div className="text-[40vw] leading-none font-black">
                {chamber.id}
              </div>
            </div>

            {/* Static Content */}
            <div className="relative z-10 px-12 text-center transition-opacity duration-500 group-hover:opacity-0">
              <div className="mb-8 text-[10px] font-black tracking-[0.5em] uppercase opacity-50">
                Chamber {chamber.id}
              </div>
              <h3 className="mb-6 text-5xl font-bold tracking-tighter uppercase md:text-7xl">
                {chamber.title}
              </h3>
              <p className="text-xl font-light tracking-widest uppercase opacity-70">
                {chamber.truth}
              </p>
            </div>

            {/* Inverted Hover State - Absolute Override */}
            <div
              className={`absolute inset-0 flex origin-center scale-y-0 flex-col items-center justify-center opacity-0 transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:scale-y-100 group-hover:opacity-100 ${isBlack ? "bg-white text-black" : "bg-black text-white"}`}
            >
              <div className="mb-8 text-[10px] font-black tracking-[0.6em] uppercase opacity-50">
                Inverted
              </div>
              <div className="text-8xl font-black tracking-tighter md:text-9xl">
                {chamber.id}
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

// --------------------------------------------------------
// FINAL RECKONING (Aggressive Strobing & Call to Action)
// --------------------------------------------------------
function FinalReckoning() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white text-black">
      {/* Architectural target lines */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <div className="absolute left-1/2 h-full w-[1px] bg-black" />
        <div className="absolute top-1/2 h-[1px] w-full bg-black" />
        <div className="absolute h-[80vw] w-[80vw] rounded-full border border-black" />
        <div className="absolute h-[40vw] w-[40vw] rounded-full border border-black" />
      </div>

      <div className="relative z-10 flex w-full max-w-screen-xl flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          <div className="mb-16 inline-block border-b-2 border-black pb-4 text-[10px] font-black tracking-[0.6em] uppercase opacity-40">
            Final Protocol
          </div>

          <h2 className="mb-24 text-[clamp(5rem,18vw,18rem)] leading-[0.75] font-black tracking-tighter uppercase mix-blend-difference">
            Enter
            <br />
            <span className="text-[clamp(4rem,14vw,14rem)] font-thin italic">
              The
            </span>
            <br />
            Truth
          </h2>

          <div className="flex flex-col items-center gap-12">
            <button
              type="button"
              className="group relative w-full overflow-hidden border-[6px] border-black bg-white px-16 py-8 transition-colors duration-300 hover:border-black md:w-auto"
            >
              <motion.div
                className="absolute inset-0 origin-bottom bg-black"
                initial={{ scaleY: 0 }}
                whileHover={{ scaleY: 1 }}
                transition={{ duration: 0.4, ease: [0.87, 0, 0.13, 1] }}
              />
              <span className="relative z-10 flex items-center justify-center gap-6 text-2xl font-bold tracking-[0.4em] uppercase mix-blend-difference transition-colors group-hover:text-white">
                Initialize Afenda
                <ArrowRight
                  className="h-8 w-8 transition-transform group-hover:translate-x-2"
                  strokeWidth={3}
                />
              </span>
            </button>

            <p className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">
              No Assumptions // No Borders // No Drift
            </p>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.5em] uppercase opacity-20">
        Afenda © 2026 // Beastmode Arch.
      </div>
    </section>
  )
}
