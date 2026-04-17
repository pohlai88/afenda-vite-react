import { ArrowUpRight } from "lucide-react";

const HUD_METRICS = [
  { label: "Mode", value: "Truth Surface" },
  { label: "State", value: "Calibrated" },
  { label: "Drift", value: "0.00%" },
  { label: "Boundary", value: "Black / White" },
] as const;

const CHAMBERS = [
  {
    id: "01",
    title: "Transaction Truth",
    copy: "Every entry must reconcile to reality.",
  },
  {
    id: "02",
    title: "Reporting Truth",
    copy: "Pressure should reveal evidence, not weakness.",
  },
  {
    id: "03",
    title: "Enterprise Truth",
    copy: "One continuity across entities, borders, and time.",
  },
] as const;

export default function AfendaMonoHud() {
  return (
    <div className="min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <div className="relative min-h-screen">
        {/* field split */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] bg-white lg:block" />
        <div className="pointer-events-none absolute inset-y-0 right-[38%] hidden w-px bg-white/30 lg:block" />

        {/* survey lines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-y-0 left-6 w-px bg-white md:left-10 lg:left-12" />
          <div className="absolute inset-y-0 left-[33.333%] hidden w-px bg-white lg:block" />
          <div className="absolute inset-y-0 right-[38%] hidden w-px bg-white/40 lg:block" />
          <div className="absolute left-0 right-0 top-20 h-px bg-white/10 md:top-24" />
          <div className="absolute left-0 right-0 bottom-24 h-px bg-white/10" />
        </div>

        {/* top rail */}
        <header className="relative z-10 border-b border-white/10 px-6 py-6 md:px-10 lg:px-12">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="font-mono text-[11px] uppercase tracking-[0.32em]">
                AFENDA
              </span>
            </div>

            <div className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 md:block">
              Assume Nothing / Beyond Borders
            </div>
          </div>
        </header>

        <main className="relative z-10 px-6 pb-10 pt-10 md:px-10 md:pt-14 lg:px-12 lg:pt-16">
          <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-0">
            {/* left field */}
            <div className="max-w-5xl pr-0 lg:pr-16">
              <div className="mb-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                <span className="inline-block h-px w-8 bg-white/30" />
                Monochrome Control Surface
              </div>

              <h1 className="text-[16vw] font-semibold uppercase leading-[0.82] tracking-[-0.08em] md:text-[11vw] lg:text-[8.4vw]">
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
                <p className="max-w-xl text-base leading-7 text-white/66 md:text-lg">
                  Black and white do not need to oppose each other. In the right
                  system, black holds memory, white holds proof, and the boundary
                  between them becomes judgment.
                </p>

                <button className="inline-flex items-center gap-3 border border-white/20 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.24em] transition-colors hover:border-white hover:bg-white hover:text-black">
                  <span>Initialize</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* right field */}
            <aside className="lg:text-black">
              <div className="border border-white/10 bg-white/[0.02] p-0 lg:border-black/10 lg:bg-transparent">
                <div className="border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 lg:border-black/10 lg:text-black/45">
                  System Telemetry
                </div>

                <div className="divide-y divide-white/10 lg:divide-black/10">
                  {HUD_METRICS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42 lg:text-black/42">
                        {item.label}
                      </span>
                      <span className="text-sm uppercase tracking-[0.08em] text-white/88 lg:text-black/88">
                        {item.value}
                      </span>
                    </div>
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

          <section className="mt-16 border-t border-white/10 pt-8 lg:mt-20">
            <div className="mb-8 flex items-center justify-between gap-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                Chamber Index
              </div>
              <div className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-white/32 md:block">
                Transaction / Reporting / Enterprise
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              {CHAMBERS.map((item) => (
                <article
                  key={item.id}
                  className="grid bg-black md:grid-cols-[6rem_minmax(0,1fr)_18rem]"
                >
                  <div className="border-r border-white/10 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/42 md:px-5">
                    {item.id}
                  </div>

                  <div className="px-5 py-6">
                    <h2 className="text-2xl font-semibold uppercase tracking-[-0.04em] md:text-4xl">
                      {item.title}
                    </h2>
                  </div>

                  <div className="border-l border-white/10 px-5 py-6">
                    <p className="font-mono text-[10px] uppercase leading-6 tracking-[0.18em] text-white/54">
                      {item.copy}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-2 lg:mt-20">
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                Boundary Logic
              </p>
              <h2 className="max-w-2xl text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.05em] md:text-5xl">
                Let black and white
                <br />
                share one doctrine.
              </h2>
            </div>

            <div className="space-y-5">
              <p className="text-base leading-7 text-white/66">
                The interface should feel measured, not decorated. Quiet, not empty.
                Severe, but not cold. This is where AFENDA becomes less website and
                more command surface.
              </p>

              <div className="border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Business moves. Truth does not drift.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
