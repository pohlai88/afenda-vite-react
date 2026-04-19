/**
 * AFENDA // THE FORENSIC ERP
 * Apex Editorial Architecture - Director's Cut // Absolute B&W
 * System Architect: Gemini Pro
 * Location: Bien Hoa, VN // 2026
 */

import React, { useEffect, useState, useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { Crosshair, TerminalSquare, Scan, Fingerprint, Eye } from "lucide-react"

// ==========================================
// 1. THE PHYSICS ENGINES & DOCTRINES
// ==========================================
const LAW = {
  TYPE: {
    hero: "clamp(8rem, 24vw, 26rem)",
    headline: "clamp(4rem, 9vw, 11rem)",
    sub: "clamp(1.5rem, 3.5vw, 3rem)",
    sys: "0.65rem",
    body: "1.125rem",
  },
  SURFACE: {
    void: "#000000", // Absolute Zero
    paper: "#FFFFFF", // Absolute Light
    wire: "rgba(0, 0, 0, 0.12)", // Blueprint tension
  },
  PHYSICS: {
    actuate: { duration: 0, ease: "linear" }, // 0ms for brutalist state changes
    snap: { duration: 1.2, ease: [0.85, 0, 0.15, 1] }, // Massive structural shifts
  },
} as const

export default function AfendaForensicMachine() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#FFFFFF] selection:bg-[#000000] selection:text-[#FFFFFF]"
      style={{
        fontFamily: "'Helvetica Neue', system-ui, -apple-system, sans-serif",
      }}
    >
      <SystemTelemetry />
      <StructuralGrid scroll={scrollYProgress} />

      <main className="relative z-10 flex w-full flex-col">
        <KineticHero scroll={scrollYProgress} />
        <TheTruthDoctrine />
        <ForensicChamber scroll={scrollYProgress} />
        <NexusCanonAudit />
        <IndustrialERP />
        <TerminalReckoning />
      </main>
    </div>
  )
}

// ==========================================
// 2. KINETIC INFRASTRUCTURE & TELEMETRY
// ==========================================

function StructuralGrid({ scroll }: { scroll: MotionValue<number> }) {
  const y1 = useTransform(scroll, [0, 1], ["0%", "100%"])
  const y2 = useTransform(scroll, [0, 1], ["0%", "-100%"])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 text-[#FFFFFF] mix-blend-difference">
      {/* 1.5px Hairlines for High-DPI Precision */}
      <div className="absolute top-0 bottom-0 left-[5%] w-[1.5px] bg-[#FFFFFF] opacity-30" />
      <div className="absolute top-0 bottom-0 left-[50%] w-[1.5px] bg-[#FFFFFF] opacity-30" />
      <div className="absolute top-0 right-[5%] bottom-0 w-[1.5px] bg-[#FFFFFF] opacity-30" />

      <motion.div
        className="absolute right-0 left-0 h-[1.5px] bg-[#FFFFFF] opacity-40"
        style={{ top: "33%", y: y1 }}
      />
      <motion.div
        className="absolute right-0 left-0 h-[1.5px] bg-[#FFFFFF] opacity-40"
        style={{ top: "66%", y: y2 }}
      />

      <DraftMark top="33%" left="5%" />
      <DraftMark top="33%" left="50%" />
      <DraftMark top="33%" left="95%" />
      <DraftMark top="66%" left="5%" />
      <DraftMark top="66%" left="50%" />
      <DraftMark top="66%" left="95%" />
    </div>
  )
}

function DraftMark({ top, left }: { top: string; left: string }) {
  return (
    <div
      className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2"
      style={{ top, left }}
    >
      <div className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 bg-[#FFFFFF]" />
      <div className="absolute top-0 left-1/2 h-full w-[1.5px] -translate-x-1/2 bg-[#FFFFFF]" />
    </div>
  )
}

function SystemTelemetry() {
  const [time, setTime] = useState("")
  const [mem, setMem] = useState("0x0000")

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`
      )
      setMem(
        `0x${Math.floor(Math.random() * 65535)
          .toString(16)
          .toUpperCase()
          .padStart(4, "0")}`
      )
    }, 47)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 text-[#FFFFFF] mix-blend-difference">
      <div
        className="absolute top-0 left-0 flex w-full justify-between border-b-[1.5px] border-[#FFFFFF]/30 px-[5%] py-5 font-mono font-bold tracking-[0.4em] uppercase"
        style={{ fontSize: LAW.TYPE.sys }}
      >
        <div className="flex gap-16">
          <span>AFENDA // CORE</span>
          <span className="hidden opacity-60 md:inline">MEM: {mem}</span>
        </div>
        <div className="flex gap-16 text-right">
          <span className="hidden opacity-60 md:inline">LOC: BIEN HOA</span>
          <span className="w-[120px] text-right">{time}</span>
        </div>
      </div>
      <div
        className="absolute right-[5%] bottom-12 flex origin-bottom-right -rotate-90 items-center gap-4 font-mono tracking-[0.6em] uppercase opacity-40"
        style={{ fontSize: LAW.TYPE.sys }}
      >
        <Crosshair className="h-3 w-3" />
        GEMINI PRO
      </div>
    </div>
  )
}

// ==========================================
// 3. THE ARCHITECTURAL CHAMBERS
// ==========================================

function KineticHero({ scroll }: { scroll: MotionValue<number> }) {
  const yLeft = useTransform(scroll, [0, 0.4], ["0vh", "-30vh"])
  const yRight = useTransform(scroll, [0, 0.4], ["0vh", "30vh"])
  const scale = useTransform(scroll, [0, 0.5], [1, 1.12])

  // High-contrast drafting mesh
  const mesh = `repeating-linear-gradient(0deg, transparent, transparent 1px, #000000 1px, #000000 2px)`

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-[#000000] pt-20">
      <motion.div
        className="relative flex h-[80vh] w-[90%] flex-col items-center justify-center overflow-hidden border-[1.5px] border-[#FFFFFF]/20 bg-[#FFFFFF]"
        style={{ scale }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: mesh, backgroundSize: "100% 2px" }}
        />

        {/* Registration Corners */}
        <div className="absolute top-4 left-4 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-[#000000]" />
        <div className="absolute right-4 bottom-4 h-4 w-4 border-r-[1.5px] border-b-[1.5px] border-[#000000]" />

        <div className="relative z-10 flex text-[#FFFFFF] mix-blend-difference">
          <motion.div
            style={{ y: yLeft }}
            className="flex flex-col justify-end"
          >
            <h1
              className="leading-[0.73] tracking-tighter uppercase"
              style={{ fontSize: LAW.TYPE.hero, fontWeight: 900 }}
            >
              AFEN
            </h1>
          </motion.div>
          <motion.div
            style={{ y: yRight }}
            className="flex flex-col justify-start"
          >
            <h1
              className="leading-[0.73] tracking-tighter uppercase"
              style={{ fontSize: LAW.TYPE.hero, fontWeight: 900 }}
            >
              DA
            </h1>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-8 font-mono text-[10px] font-black tracking-[0.5em] text-[#000000] uppercase opacity-80">
          [MACHINE_INIT] <br /> FORENSIC_ERP: ONLINE <br /> NEXUS_CANON: ACTIVE
        </div>
      </motion.div>
    </section>
  )
}

function TheTruthDoctrine() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center border-b-[1.5px] border-[#000000]/10 bg-[#FFFFFF] px-[5%] py-40 text-[#000000]">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-0">
        <div className="flex flex-col justify-between lg:col-span-3">
          <div className="flex items-center gap-4 font-mono text-[10px] font-black tracking-[0.6em] uppercase">
            <Scan className="h-5 w-5" /> [LAW_01]
          </div>
          <div className="mt-12 max-w-[220px] border-l-[1.5px] border-[#000000] pl-6 font-mono text-xs leading-relaxed font-bold tracking-widest uppercase opacity-70 lg:mt-0">
            Assumptions are flaws. <br />
            <br /> Consensus is a compromise. <br />
            <br /> Truth is computed.
          </div>
        </div>

        <div className="relative lg:col-span-9">
          <h2
            className="tracking-tighter uppercase"
            style={{
              fontSize: LAW.TYPE.headline,
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
            }}
          >
            Data is{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ WebkitTextStroke: `2.5px #000000` }}
            >
              Raw.
            </span>
            <br />
            Truth is{" "}
            <span className="border-b-[1.5vw] border-[#000000] pb-2">
              Architecture.
            </span>
          </h2>

          <div className="relative mt-24 ml-0 max-w-3xl bg-[#000000] p-10 text-[#FFFFFF] md:ml-[10vw] md:p-16">
            <div className="absolute -top-4 -left-4 h-8 w-8 border-t-[3px] border-l-[3px] border-[#000000]" />
            <div className="absolute -right-4 -bottom-4 h-8 w-8 border-r-[3px] border-b-[3px] border-[#000000]" />

            <p
              className="font-bold tracking-tight uppercase"
              style={{ fontSize: LAW.TYPE.sub, lineHeight: 1.1 }}
            >
              We do not present dashboards. <br />
              We compute absolute reality.
            </p>
            <p
              className="mt-10 font-medium opacity-80"
              style={{ fontSize: LAW.TYPE.body, lineHeight: 1.6 }}
            >
              Standard software allows data to drift. If data drifts, the
              enterprise hallucinates. The AFENDA Machine binds operations to a
              singular, mathematically proven ledger.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ForensicChamber({ scroll }: { scroll: MotionValue<number> }) {
  const box1Y = useTransform(scroll, [0.3, 0.8], [100, -100])
  const box2Y = useTransform(scroll, [0.4, 0.9], [200, -200])

  return (
    <section className="relative overflow-hidden bg-[#FFFFFF] px-[5%] py-48 text-[#000000]">
      <div className="pointer-events-none absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center opacity-[0.03]">
        <div className="text-[25vw] leading-none font-black tracking-tighter text-[#000000]">
          FORENSIC
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-32 border-[1.5px] border-[#000000] px-8 py-3 font-mono text-[10px] font-black tracking-[0.6em] uppercase">
          Component_01 // Forensic Ledger
        </div>

        <div className="grid w-full max-w-7xl grid-cols-1 gap-16 md:grid-cols-2">
          <motion.div
            style={{ y: box1Y }}
            className="relative bg-[#000000] p-12 text-[#FFFFFF] lg:p-20"
          >
            <h3 className="mb-10 text-6xl leading-[0.85] font-black tracking-tighter uppercase md:text-8xl">
              Immutable
              <br />
              Record.
            </h3>
            <p className="max-w-md font-mono text-sm leading-relaxed tracking-widest uppercase opacity-80">
              The ledger is an append-only absolute. There is no revision
              history; there is only physical certainty of what occurred.
            </p>
            <div className="mt-20 flex items-center justify-between border-t-[1.5px] border-[#FFFFFF]/20 pt-8 font-mono text-[10px] tracking-widest opacity-60">
              <span>ID: 0x8F9A2B // TRACE_LOCK</span>
              <Fingerprint className="h-5 w-5" />
            </div>
          </motion.div>

          <motion.div
            style={{ y: box2Y }}
            className="mt-12 flex flex-col justify-end border-[8px] border-[#000000] bg-[#FFFFFF] p-12 md:mt-48 lg:p-20"
          >
            <h3 className="mb-10 text-6xl leading-[0.85] font-black tracking-tighter uppercase md:text-8xl">
              Deep
              <br />
              Audit.
            </h3>
            <p className="max-w-md font-mono text-sm leading-relaxed font-bold tracking-widest uppercase">
              Every node is mathematically traced. Zero dark data. We strip away
              the fog of standard reporting to expose the raw mechanics.
            </p>
            <div className="mt-20 flex items-center justify-between border-t-[1.5px] border-[#000000]/20 pt-8 font-mono text-[10px] tracking-widest opacity-60">
              <span>ID: 0x1C4D9E // VERIFIED</span>
              <Scan className="h-5 w-5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function NexusCanonAudit() {
  const canon = [
    { id: "W1", label: "WHO", desc: "CRYPTOGRAPHIC IDENTITY" },
    { id: "W2", label: "WHAT", desc: "MUTATION PAYLOAD" },
    { id: "W3", label: "WHEN", desc: "CHRONO-LOCKED STAMP" },
    { id: "W4", label: "WHERE", desc: "NODE GEO-TRACE" },
    { id: "W5", label: "WHY", desc: "CONTEXT AUTHENTICITY" },
    { id: "W6", label: "WHICH", desc: "STATE VERSIONING" },
    { id: "W7", label: "WHOSE", desc: "CUSTODY & OWNERSHIP" },
    { id: "H1", label: "HOW", desc: "EXECUTION METHOD" },
  ]

  return (
    <section className="relative flex min-h-screen flex-col justify-center bg-[#000000] px-[5%] py-40 text-[#FFFFFF]">
      <div className="mx-auto mb-32 flex w-full max-w-screen-2xl flex-col gap-16 md:flex-row">
        <div className="w-full md:w-1/2">
          <div className="mb-12 flex items-center gap-4 font-mono text-[10px] font-black tracking-[0.6em] uppercase opacity-70">
            <Eye className="h-5 w-5" /> [COMPONENT_02] // NEXUS_CANON
          </div>
          <h2
            className="tracking-tighter uppercase"
            style={{
              fontSize: "clamp(4rem, 8vw, 9rem)",
              fontWeight: 900,
              lineHeight: 0.85,
            }}
          >
            Absolute <br /> Memory.
          </h2>
        </div>
        <div className="flex w-full items-end md:w-1/2">
          <p className="max-w-xl border-l-[1.5px] border-[#FFFFFF]/30 pl-10 text-2xl leading-relaxed font-light opacity-80">
            The Machine does not restrict you. Restriction implies a lack of
            control. The Machine permits execution, but it binds every action to
            the immutable ledger.
            <br />
            <br />
            <span className="mt-6 block border-t-[1.5px] border-[#FFFFFF]/30 pt-6 text-sm font-bold tracking-widest text-[#FFFFFF] uppercase">
              Every mutation is subjected to the 7W1H protocol. Total
              accountability.
            </span>
          </p>
        </div>
      </div>

      {/* Identical Rhythm Grid */}
      <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-2 gap-[1.5px] border-[1.5px] border-[#FFFFFF]/30 bg-[#FFFFFF]/30 md:grid-cols-4">
        {canon.map((item) => (
          <div
            key={item.id}
            className="group relative cursor-crosshair overflow-hidden bg-[#000000] p-10 text-[#FFFFFF] transition-none hover:bg-[#FFFFFF] hover:text-[#000000]"
          >
            <div className="relative z-10">
              <div className="mb-16 flex justify-between font-mono text-[10px] font-black tracking-[0.5em] uppercase">
                <span className="opacity-60 group-hover:opacity-100">
                  {item.id}
                </span>
                <span className="opacity-0 group-hover:opacity-100">
                  LOGGED
                </span>
              </div>
              <div className="mb-6 text-4xl font-black tracking-tighter uppercase lg:text-5xl">
                {item.label}
              </div>
              <div className="border-t-[1.5px] border-inherit pt-5 font-mono text-[11px] font-bold tracking-widest uppercase opacity-70 group-hover:opacity-100">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function IndustrialERP() {
  return (
    <section className="relative flex min-h-screen items-center border-t-[1.5px] border-b-[1.5px] border-[#000000] bg-[#FFFFFF] text-[#000000]">
      <div className="flex h-full min-h-screen w-full flex-col md:flex-row">
        <div className="relative flex w-full flex-col justify-center overflow-hidden border-r-[1.5px] border-[#000000] p-[5%] md:w-1/2">
          <div className="mb-12 flex items-center gap-4 font-mono text-[10px] font-black tracking-[0.6em] uppercase opacity-60">
            <TerminalSquare className="h-5 w-5" /> Component_03 // Industrial
            ERP
          </div>
          <h2
            className="mb-12 tracking-tighter uppercase"
            style={{
              fontSize: "clamp(4rem, 8vw, 9rem)",
              fontWeight: 900,
              lineHeight: 0.85,
            }}
          >
            Structural <br /> Routing.
          </h2>
          <p className="max-w-lg text-2xl leading-relaxed font-bold opacity-90">
            Enterprise resource planning is not software; it is the physical
            infrastructure of your operation. Total resource alignment without
            human drift.
          </p>
        </div>

        {/* Harmonious Box Grid */}
        <div className="grid w-full grid-cols-2 grid-rows-3 gap-[1.5px] bg-[#000000]">
          <div className="col-span-2 row-span-1 flex flex-col justify-end bg-[#FFFFFF] p-10">
            <div className="text-7xl leading-none font-black tracking-tighter lg:text-9xl">
              100%
            </div>
            <div className="mt-6 font-mono text-[11px] font-black tracking-[0.4em] uppercase opacity-60">
              Enterprise Alignment
            </div>
          </div>

          <div className="group relative cursor-crosshair overflow-hidden bg-[#000000] p-10 text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000]">
            <div className="relative z-10">
              <div className="mb-6 font-mono text-[10px] font-bold tracking-[0.5em] uppercase opacity-60 group-hover:opacity-100">
                Supply Routing
              </div>
              <div className="text-4xl font-black tracking-tighter uppercase lg:text-5xl">
                LOCKED
              </div>
            </div>
          </div>

          <div className="group relative cursor-crosshair overflow-hidden bg-[#000000] p-10 text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000]">
            <div className="relative z-10">
              <div className="mb-6 font-mono text-[10px] font-bold tracking-[0.5em] uppercase opacity-60 group-hover:opacity-100">
                Data Drift
              </div>
              <div className="text-4xl font-black tracking-tighter uppercase lg:text-5xl">
                NULL
              </div>
            </div>
          </div>

          <div className="col-span-2 row-span-1 flex items-center justify-between bg-[#FFFFFF] p-10 text-[#000000]">
            <div className="text-3xl font-black tracking-[0.3em] uppercase">
              Global Sync
            </div>
            <div className="h-16 w-16 animate-spin rounded-full border-[4px] border-[#000000] border-t-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ==========================================
// 4. THE APEX RECKONING (300vh Scroll Lock)
// ==========================================

function TerminalReckoning() {
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // 1. The Iris Breach: The white paper tears open to reveal the absolute void.
  const apertureSize = useTransform(scrollYProgress, [0.05, 0.45], [0, 150])
  const clipPath = useTransform(
    apertureSize,
    (val) => `circle(${val}% at 50% 50%)`
  )

  // 2. The Zenith Lock: Heavy structural lines slam precisely into the center.
  // Originating from the extremes, stopping leaving a perfect geometric core gap.
  const topBracketY = useTransform(
    scrollYProgress,
    [0.4, 0.65],
    ["-50vh", "-5vw"]
  )
  const bottomBracketY = useTransform(
    scrollYProgress,
    [0.4, 0.65],
    ["50vh", "5vw"]
  )
  const leftBracketX = useTransform(
    scrollYProgress,
    [0.4, 0.65],
    ["-50vw", "-5vw"]
  )
  const rightBracketX = useTransform(
    scrollYProgress,
    [0.4, 0.65],
    ["50vw", "5vw"]
  )

  // The impact core flashes instantly
  const coreOpacity = useTransform(scrollYProgress, [0.64, 0.65], [0, 1])
  const coreScale = useTransform(scrollYProgress, [0.64, 0.65], [0.5, 1])

  // 3. Payload Actuation: The terminal execution block anchors perfectly.
  const contentOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.7, 0.85], [100, 0])

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#FFFFFF]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Outer Shell: The Clinical White Waiting to be Breached */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFFFFF] p-8 text-[#000000]">
          <div className="w-full text-center font-mono text-sm font-black tracking-[1em] uppercase opacity-30">
            SCROLL TO BREACH PROTOCOL
          </div>
        </div>

        {/* The Void Mask: Revealed physically via user friction */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#000000]"
          style={{ clipPath }}
        >
          {/* Internal Void Grid: Absolute rigid symmetry */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.15]">
            <div className="absolute h-[1.5px] w-full bg-[#FFFFFF]" />
            <div className="absolute h-full w-[1.5px] bg-[#FFFFFF]" />
            <div className="absolute h-[60vw] w-[60vw] rounded-full border-[1.5px] border-[#FFFFFF] md:h-[40vw] md:w-[40vw]" />
          </div>

          {/* THE ZENITH LOCK */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            {/* Top Actuator */}
            <motion.div
              className="absolute flex flex-col items-center"
              style={{ y: topBracketY }}
            >
              <div className="h-[50vh] w-[2px] bg-[#FFFFFF]" />
              <div className="h-10 w-10 border-b-[6px] border-[#FFFFFF]" />
            </motion.div>

            {/* Bottom Actuator */}
            <motion.div
              className="absolute flex flex-col items-center"
              style={{ y: bottomBracketY }}
            >
              <div className="h-10 w-10 border-t-[6px] border-[#FFFFFF]" />
              <div className="h-[50vh] w-[2px] bg-[#FFFFFF]" />
            </motion.div>

            {/* Left Actuator */}
            <motion.div
              className="absolute flex items-center"
              style={{ x: leftBracketX }}
            >
              <div className="h-[2px] w-[50vw] bg-[#FFFFFF]" />
              <div className="h-10 w-10 border-r-[6px] border-[#FFFFFF]" />
            </motion.div>

            {/* Right Actuator */}
            <motion.div
              className="absolute flex items-center"
              style={{ x: rightBracketX }}
            >
              <div className="h-10 w-10 border-l-[6px] border-[#FFFFFF]" />
              <div className="h-[2px] w-[50vw] bg-[#FFFFFF]" />
            </motion.div>

            {/* Core Impact Void Fill */}
            <motion.div
              className="absolute h-8 w-8 rotate-45 bg-[#FFFFFF]"
              style={{ opacity: coreOpacity, scale: coreScale }}
            />
          </div>

          {/* PAYLOAD ACTUATION: The Terminal Reckoning */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="relative z-30 mx-auto mt-[22vh] flex w-full max-w-screen-2xl flex-col items-center px-[5%]"
          >
            <div className="mb-8 border-[1.5px] border-[#FFFFFF]/30 bg-[#000000] px-8 py-3 font-mono text-[10px] font-black tracking-[0.6em] text-[#FFFFFF] uppercase">
              Protocol // Zenith Actuation
            </div>

            <h2
              className="mb-16 w-full text-center text-[#FFFFFF] uppercase"
              style={{
                fontSize: LAW.TYPE.headline,
                fontWeight: 900,
                lineHeight: 0.8,
                letterSpacing: "-0.05em",
              }}
            >
              Total Lock.
            </h2>

            <button
              type="button"
              className="group relative flex w-full max-w-[700px] cursor-crosshair items-center justify-center p-3"
            >
              <div className="absolute inset-0 border-[1.5px] border-[#FFFFFF]/30 transition-colors duration-0 group-hover:border-[#FFFFFF]" />

              <div className="absolute top-0 left-0 h-6 w-6 border-t-[4px] border-l-[4px] border-[#FFFFFF]" />
              <div className="absolute top-0 right-0 h-6 w-6 border-t-[4px] border-r-[4px] border-[#FFFFFF]" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-[4px] border-l-[4px] border-[#FFFFFF]" />
              <div className="absolute right-0 bottom-0 h-6 w-6 border-r-[4px] border-b-[4px] border-[#FFFFFF]" />

              <div className="absolute inset-3 origin-bottom scale-y-0 bg-[#FFFFFF] transition-transform duration-100 ease-linear group-hover:scale-y-100" />

              <div className="relative z-10 flex w-full items-center justify-between px-10 py-10 text-[#FFFFFF] mix-blend-difference">
                <span className="hidden font-mono text-[11px] font-bold tracking-[0.4em] uppercase opacity-80 md:block">
                  SYS_AUTHORIZE
                </span>
                <span className="text-2xl font-black tracking-[0.4em] uppercase md:text-4xl">
                  Initiate System
                </span>
                <Crosshair className="h-10 w-10 transition-transform duration-100 group-hover:rotate-90" />
              </div>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
