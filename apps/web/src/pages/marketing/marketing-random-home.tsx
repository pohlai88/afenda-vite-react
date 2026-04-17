import { useEffect, useState, type ComponentType } from "react"

/**
 * Persist choice for the browser tab so `/` (and `/marketing`) does not reshuffle on every
 * in-app navigation. Clear sessionStorage or use a new tab to roll again.
 */
const STORAGE_KEY = "afenda.marketing.landing.variant"

/** Every default-export page in `pages/marketing/` that can serve as the public home. */
const VARIANTS = [
  { id: "polaris", load: () => import("./polaris") },
  { id: "singularity", load: () => import("./singularity") },
  { id: "infinite-topology", load: () => import("./InfiniteTopology") },
] as const

export type MarketingLandingVariantId = (typeof VARIANTS)[number]["id"]

function resolveVariantId(): MarketingLandingVariantId {
  if (typeof sessionStorage === "undefined") {
    return VARIANTS[Math.floor(Math.random() * VARIANTS.length)]!.id
  }
  const stored = sessionStorage.getItem(STORAGE_KEY) as MarketingLandingVariantId | null
  if (stored && VARIANTS.some((v) => v.id === stored)) {
    return stored
  }
  const next = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]!.id
  sessionStorage.setItem(STORAGE_KEY, next)
  return next
}

/**
 * Public marketing entry (`/` and `/marketing`): picks one experience from `pages/marketing/` per
 * browser session (random), then lazy-loads it so Vite code-splits each candidate.
 *
 * To add another candidate: add a default export under `marketing/` and append to {@link VARIANTS}.
 */
export default function MarketingRandomHome() {
  const [Page, setPage] = useState<ComponentType | null>(null)

  useEffect(() => {
    const id = resolveVariantId()
    const entry = VARIANTS.find((v) => v.id === id) ?? VARIANTS[0]
    void entry.load().then((m) => {
      setPage(() => m.default)
    })
  }, [])

  if (!Page) {
    return (
      <div
        className="min-h-dvh bg-black text-white"
        aria-busy="true"
        aria-label="Loading marketing experience"
      >
        <div className="flex min-h-dvh items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          Loading
        </div>
      </div>
    )
  }

  return <Page />
}
