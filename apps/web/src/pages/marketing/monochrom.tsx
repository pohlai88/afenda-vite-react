import {
  ArrowUpRight,
  Crosshair,
  Grid3X3,
  ShieldCheck,
  Workflow,
  FileDigit,
  ScanSearch,
  Database,
  ChevronRight,
} from "lucide-react"

type Chamber = {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly statement: string
  readonly telemetry: readonly string[]
}

type ProofPanel = {
  readonly id: string
  readonly title: string
  readonly icon: React.ComponentType<{ className?: string }>
  readonly description: string
  readonly detail: string
}

const CHAMBERS: readonly Chamber[] = [
  {
    id: "01",
    title: "Transaction Truth",
    subtitle: "Reality before system memory",
    statement:
      "Every posting, movement, and declaration must reconcile to the event that truly occurred.",
    telemetry: ["Ledger integrity", "Event provenance", "Resolution trace"],
  },
  {
    id: "02",
    title: "Reporting Truth",
    subtitle: "Pressure must reveal evidence",
    statement:
      "Close, audit, and disclosure should expose proof, not force teams into manual reconstruction.",
    telemetry: ["Disclosure surface", "Audit continuity", "Cross-period defense"],
  },
  {
    id: "03",
    title: "Enterprise Truth",
    subtitle: "One continuity beyond borders",
    statement:
      "A business may span entities, currencies, jurisdictions, and time, but truth cannot fracture.",
    telemetry: ["Group continuity", "Cross-entity memory", "Borderless control"],
  },
] as const

const PROOF_PANELS: readonly ProofPanel[] = [
  {
    id: "P-01",
    title: "Doctrine Surface",
    icon: ShieldCheck,
    description:
      "Truth is not hidden in workflow. It is declared, enforced, and traceable.",
    detail:
      "Policies, invariants, and decisions become visible operating material instead of tribal memory.",
  },
  {
    id: "P-02",
    title: "Resolution Engine",
    icon: Workflow,
    description:
      "When reality and records diverge, the system resolves the difference with evidence.",
    detail:
      "No silent drift. No local fixes disguised as enterprise logic. No ungoverned shortcuts.",
  },
  {
    id: "P-03",
    title: "Audit Memory",
    icon: FileDigit,
    description:
      "Every critical transition carries who, what, when, where, why, how, and what changed next.",
    detail:
      "The record survives pressure because the system remembers causality, not only final state.",
  },
] as const

const HUD_METRICS = [
  ["Mode", "Truth Surface"],
  ["State", "Calibrated"],
  ["Drift", "0.00%"],
  ["Continuity", "Borderless"],
] as const

const COMMAND_STRIP = [
  "Assume Nothing",
  "Resolve Contradictions",
  "Surface Evidence",
  "Let Truth Survive Scale",
] as const

function SectionLabel(props: { readonly children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-current/42">
      <span className="inline-block h-px w-8 bg-current/28" />
      <span>{props.children}</span>
    </div>
  )
}

function TelemetryItem(props: { readonly label: string; readonly value: string }) {
  return (
    <div className="group flex items-center justify-between gap-6 border-b border-current/10 px-5 py-4 last:border-b-0 hover:bg-current/5 transition-colors">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-current/42 group-hover:text-current/60 transition-colors">
        {props.label}
      </span>
      <span className="text-sm uppercase tracking-[0.08em] text-current/88 group-hover:text-current transition-colors">
        {props.value}
      </span>
    </div>
  )
}

function ChamberCard(props: { readonly chamber: Chamber }) {
  const { chamber } = props

  return (
    <article className="group grid border-b border-white/10 bg-black last:border-b-0 hover:bg-white/[0.02] transition-colors md:grid-cols-[6rem_minmax(0,1fr)_20rem]">
      <div className="border-r border-white/10 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/42 transition-colors group-hover:text-white/70 md:px-5">
        {chamber.id}
      </div>

      <div className="px-5 py-6 md:px-7 md:py-7">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-white/70 animate-pulse" style={{ animationDuration: '3s' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            {chamber.subtitle}
          </span>
        </div>

        <h3 className="text-2xl font-semibold uppercase tracking-[-0.045em] md:text-4xl">
          {chamber.title}
        </h3>

        <p className="mt-4 max-w-3xl text-base leading-7 text-white/66">
          {chamber.statement}
        </p>
      </div>

      <div className="border-l border-white/10 px-5 py-6 md:py-7">
        <div className="space-y-3">
          {chamber.telemetry.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/48"
            >
              <ChevronRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function ProofCard(props: { readonly panel: ProofPanel }) {
  const Icon = props.panel.icon

  return (
    <article className="group grid border border-black/10 bg-white hover:bg-black hover:text-white transition-colors duration-300 md:grid-rows-[auto_1fr_auto]">
      <div className="flex items-center justify-between border-b border-current/10 px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-current/42">
          {props.panel.id}
        </span>
        <Icon className="h-4 w-4 text-current/68 transition-transform group-hover:scale-110" />
      </div>

      <div className="px-5 py-5">
        <h3 className="text-xl font-semibold uppercase tracking-[-0.03em] md:text-2xl">
          {props.panel.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-current/68">
          {props.panel.description}
        </p>
      </div>

      <div className="border-t border-current/10 px-5 py-4">
        <p className="font-mono text-[10px] uppercase leading-6 tracking-[0.18em] text-current/46">
          {props.panel.detail}
        </p>
      </div>
    </article>
  )
}

export default function AfendaMonochromeHudLandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* Zero-Latency CSS Animations */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scanline 8s linear infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor {
          animation: blink 1s step-end infinite;
        }
      `}</style>

      <div className="relative min-h-screen">
        {/* split field */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[37%] bg-white lg:block" />
        <div className="pointer-events-none absolute inset-y-0 right-[37%] hidden w-px bg-white/30 lg:block" />

        {/* survey grid with scanning line */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] overflow-hidden">
          <div className="absolute inset-y-0 left-6 w-px bg-white md:left-10 lg:left-12" />
          <div className="absolute inset-y-0 left-1/3 hidden w-px bg-white lg:block" />
          <div className="absolute inset-y-0 right-[37%] hidden w-px bg-white/45 lg:block" />
          <div className="absolute left-0 right-0 top-[5.5rem] h-px bg-white/12 md:top-24" />
          <div className="absolute left-0 right-0 bottom-24 h-px bg-white/10" />

          {/* Active Radar Line */}
          <div className="absolute left-0 right-0 h-[1px] bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-scan" />
        </div>

        {/* top rail */}
        <header className="relative z-10 border-b border-white/10 px-6 py-6 md:px-10 lg:px-12">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 group cursor-default">
              <span className="inline-flex h-6 w-6 items-center justify-center border border-white/20 transition-colors group-hover:border-white/60 group-hover:bg-white group-hover:text-black">
                <Crosshair className="h-3.5 w-3.5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.32em]">
                AFENDA
              </span>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                Border / Memory / Truth
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                SYS.ONLINE
              </span>
            </div>
          </div>
        </header>

        <main className="relative z-10 px-6 pb-12 pt-10 md:px-10 md:pt-14 lg:px-12 lg:pt-16">
          {/* HERO */}
          <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-0">
            <div className="max-w-5xl pr-0 lg:pr-16">
              <SectionLabel>Monochrome HUD</SectionLabel>

              <h1 className="mt-8 text-[16vw] font-semibold uppercase leading-[0.82] tracking-[-0.08em] md:text-[10.8vw] lg:text-[8.2vw]">
                Assume
                <br />
                <span
                  className="text-transparent"
                  style={{ WebkitTextStroke: "1px white" }}
                >
                  Nothing.
                </span>
              </h1>

              <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <p className="max-w-2xl text-base leading-7 text-white/66 md:text-lg">
                  Black and white do not need to fight. In a correct system, black
                  holds memory, white holds proof, and the boundary between them
                  becomes judgment. AFENDA is built for businesses that cannot afford
                  decorative certainty.
                </p>

                <button className="group inline-flex items-center gap-3 border border-white/20 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.24em] transition-all hover:border-white hover:bg-white hover:text-black active:scale-[0.98]">
                  <span>Initialize</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

            <aside className="lg:text-black">
              <div className="border border-white/10 bg-white/[0.02] backdrop-blur-sm lg:border-black/10 lg:bg-transparent lg:backdrop-blur-none">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:border-black/10">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 lg:text-black/45">
                    System Telemetry
                  </span>
                  <Grid3X3 className="h-4 w-4 text-white/42 lg:text-black/42" />
                </div>

                <div>
                  {HUD_METRICS.map(([label, value]) => (
                    <TelemetryItem key={label} label={label} value={value} />
                  ))}
                </div>

                <div className="border-t border-white/10 px-5 py-5 lg:border-black/10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42 lg:text-black/42">
                    Not contrast. Calibration.
                  </p>
                </div>
              </div>
            </aside>
          </section>

          {/* COMMAND STRIP */}
          <section className="mt-14 border-t border-white/10 pt-6 lg:mt-16">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {COMMAND_STRIP.map((item, index) => (
                <div
                  key={item}
                  className="group flex cursor-crosshair items-center justify-between border border-white/10 px-4 py-4 transition-colors hover:bg-white hover:text-black"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-current/42 group-hover:text-black/50">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm uppercase tracking-[0.1em] text-current/88 group-hover:text-black group-hover:font-bold">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* CHAMBER RAIL */}
          <section className="mt-16 border-t border-white/10 pt-8 lg:mt-20">
            <div className="mb-8 flex items-center justify-between gap-6">
              <SectionLabel>Chamber Index</SectionLabel>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-white/34 md:block">
                Transaction / Reporting / Enterprise
              </span>
            </div>

            <div className="border border-white/10">
              {CHAMBERS.map((chamber) => (
                <ChamberCard key={chamber.id} chamber={chamber} />
              ))}
            </div>
          </section>

          {/* PROOF PANELS */}
          <section className="mt-16 border-t border-white/10 pt-8 lg:mt-20">
            <div className="mb-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_24rem] md:items-end">
              <div>
                <SectionLabel>Proof Surfaces</SectionLabel>
                <h2 className="mt-6 max-w-4xl text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.05em] md:text-5xl lg:text-6xl">
                  A system becomes trustworthy
                  <br />
                  when proof is part of the interface.
                </h2>
              </div>

              <p className="text-base leading-7 text-white/62">
                AFENDA should not merely process activity. It should expose doctrine,
                memory, resolution, and evidence as operating material.
              </p>
            </div>

            <div className="grid gap-px bg-black/40 md:grid-cols-3">
              {PROOF_PANELS.map((panel) => (
                <ProofCard key={panel.id} panel={panel} />
              ))}
            </div>
          </section>

          {/* SPLIT THESIS */}
          <section className="mt-16 border-t border-white/10 pt-8 lg:mt-20">
            <div className="grid gap-px bg-white/10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="bg-black px-6 py-8 md:px-8 md:py-10">
                <SectionLabel>Boundary Logic</SectionLabel>
                <h2 className="mt-6 max-w-3xl text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.05em] md:text-5xl">
                  Let black and white
                  <br />
                  share one doctrine.
                </h2>
              </div>

              <div className="bg-white px-6 py-8 text-black md:px-8 md:py-10">
                <p className="text-base leading-7 text-black/68">
                  The interface should feel measured, not decorated. Quiet, not empty.
                  Severe, but not cold. This is where AFENDA stops behaving like a
                  website and starts behaving like a command surface for enterprise
                  truth.
                </p>

                <div className="mt-8 border-t border-black/10 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-black/46">
                  Business moves. Truth does not drift.
                </div>
              </div>
            </div>
          </section>

          {/* TERMINAL CTA */}
          <section className="mt-16 border-t border-white/10 pt-8 lg:mt-20">
            <div className="grid gap-px bg-white/10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-white px-6 py-8 text-black md:px-8 md:py-10">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/42">
                    Terminal
                  </span>
                  <Database className="h-4 w-4 text-black/58" />
                </div>

                <div className="space-y-4 pt-6 font-mono text-[11px] uppercase tracking-[0.16em]">
                  <div className="text-black/78 opacity-80">&gt; boot sequence: afenda.truth</div>
                  <div className="text-black/78 opacity-80">&gt; validating doctrine surface</div>
                  <div className="text-black/78 opacity-80">&gt; synchronizing enterprise memory</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-black font-semibold">&gt; status: calibrated</span>
                    <span className="inline-block h-3 w-2 bg-black animate-cursor" />
                  </div>
                </div>
              </div>

              <div className="bg-black px-6 py-8 md:px-8 md:py-10">
                <SectionLabel>Final Command</SectionLabel>

                <h2 className="mt-6 text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.05em] md:text-5xl">
                  Beyond borders.
                  <br />
                  Beyond assumptions.
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-7 text-white/66">
                  Build on doctrine. Operate with evidence. Let the business move
                  without letting truth fracture.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button className="group inline-flex items-center gap-3 border border-white/20 bg-white px-5 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-black transition-colors hover:border-white hover:bg-black hover:text-white">
                    <span>Enter AFENDA</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>

                  <button className="group inline-flex items-center gap-3 border border-white/10 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-white/72 transition-colors hover:border-white/30 hover:text-white">
                    <ScanSearch className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Inspect Proof</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
