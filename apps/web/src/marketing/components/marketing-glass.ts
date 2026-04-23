/**
 * Shared frosted-surface recipes for marketing: use these instead of duplicating
 * blur/border/opacity stacks across hero chrome and section panels.
 */
export const marketingGlassDarkNavInner =
  "flex items-center justify-between rounded-full border border-white/10 bg-black/55 px-4 py-2.5 backdrop-blur-xl md:px-6 md:py-3"

/** Large cards and banded sections on light `--background` / `--card` marketing pages. */
export const marketingGlassLightPanel =
  "rounded-[2rem] border border-border/50 bg-card/90 shadow-sm backdrop-blur-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
