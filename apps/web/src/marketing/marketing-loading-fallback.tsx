/** Cinematic full-viewport suspense fallback for AFENDA marketing system. */
export function MarketingLoadingFallback() {
  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black text-white"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Loading marketing experience"
    >
      {/* Ambient pulse layer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
      </div>

      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute h-[1px] w-full animate-[scan_2.5s_linear_infinite] bg-white/20" />
      </div>

      {/* Core content */}
      <div className="relative flex flex-col items-center gap-4 text-center">
        {/* Primary signal */}
        <div className="animate-[flicker_2s_infinite] font-mono text-lg tracking-[0.6em] text-white/80 uppercase">
          AFENDA
        </div>

        {/* Secondary state */}
        <div className="font-mono text-xs tracking-[0.4em] text-white/40 uppercase">
          Resolving truth surface
        </div>

        {/* Micro indicator */}
        <div className="flex gap-1">
          <span className="h-[2px] w-2 animate-[blink_1s_infinite] bg-white/30" />
          <span className="h-[2px] w-2 animate-[blink_1s_infinite_0.2s] bg-white/30" />
          <span className="h-[2px] w-2 animate-[blink_1s_infinite_0.4s] bg-white/30" />
        </div>
      </div>

      {/* Keyframes */}
      <style>
        {`
          @keyframes flicker {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 0.4; }
          }

          @keyframes blink {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }

          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
        `}
      </style>
    </div>
  )
}
