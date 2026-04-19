/** Full-viewport suspense fallback for lazy marketing landing chunks and session-gated home. */
export function MarketingLoadingFallback() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-black font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase"
      aria-busy="true"
      aria-label="Loading marketing experience"
    >
      Loading
    </div>
  )
}
