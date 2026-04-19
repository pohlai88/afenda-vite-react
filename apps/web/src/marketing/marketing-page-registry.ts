import type { ComponentType } from "react"

export const MARKETING_LANDING_STORAGE_KEY = "afenda.marketing.landing.variant"
export const DEFAULT_MARKETING_LANDING_VARIANT_ID = "Moire"

type MarketingLandingModule = {
  readonly default: ComponentType
}

export const marketingLandingVariants = [
  {
    id: "Moire",
    slug: "moire",
    load: () => import("./pages/landing/1.Moire-BW"),
  },
  {
    id: "Absolutism",
    slug: "kinetic-absolutism",
    load: () => import("./pages/landing/2.Kinetic-Absolutism-BW"),
  },
  {
    id: "Single-Life",
    slug: "single-life",
    load: () => import("./pages/landing/3.Single-Life-BW"),
  },
  {
    id: "Forensic",
    slug: "forensic",
    load: () => import("./pages/landing/4.Forensic-BW"),
  },
  {
    id: "Topology",
    slug: "topology",
    load: () => import("./pages/landing/5.Topology-BW"),
  },
  {
    id: "Monochrom",
    slug: "monochrom",
    load: () => import("./pages/landing/6.Monochrom-BW"),
  },
  {
    id: "Resolve",
    slug: "resolve",
    load: () => import("./pages/landing/7.Resolve-BW"),
  },
  {
    id: "Polaris",
    slug: "polaris",
    load: () => import("./pages/landing/8.Polaris"),
  },
  {
    id: "Surface",
    slug: "surface",
    load: () => import("./pages/landing/9.Surface-BW"),
  },
  {
    id: "Monument",
    slug: "monument",
    load: () => import("./pages/landing/10.Monument"),
  },
  {
    id: "Beastmode",
    slug: "beastmode",
    load: () => import("./pages/landing/11.Beastmode"),
  },
] as const satisfies readonly {
  readonly id: string
  readonly slug: string
  readonly load: () => Promise<MarketingLandingModule>
}[]

export type MarketingLandingVariantDefinition =
  (typeof marketingLandingVariants)[number]

export type MarketingLandingVariantId = MarketingLandingVariantDefinition["id"]
export type MarketingLandingVariantSlug =
  MarketingLandingVariantDefinition["slug"]

export const marketingLandingVariantIds = marketingLandingVariants.map(
  (variant) => variant.id
) as readonly MarketingLandingVariantId[]

export const marketingLandingVariantSlugs = marketingLandingVariants.map(
  (variant) => variant.slug
) as readonly MarketingLandingVariantSlug[]

/**
 * Root-level paths that load the same code-split chunk as `/marketing/:slug`.
 * Keeps bookmark/SEO URLs stable while the registry remains the single module source.
 */
export const marketingLandingLegacySlugRoutes: ReadonlyArray<{
  readonly path: string
  readonly slug: MarketingLandingVariantSlug
}> = [
  { path: "infinite-topology", slug: "topology" },
  { path: "singularity", slug: "polaris" },
]

/** Typos or old paths that should redirect to a canonical URL. */
export const marketingLandingLegacyRedirects: ReadonlyArray<{
  readonly path: string
  readonly to: string
}> = [{ path: "infinitetopology", to: "/infinite-topology" }]

const marketingLandingVariantsById = new Map<
  MarketingLandingVariantId,
  MarketingLandingVariantDefinition
>(marketingLandingVariants.map((variant) => [variant.id, variant]))

const marketingLandingVariantsBySlug = new Map<
  MarketingLandingVariantSlug,
  MarketingLandingVariantDefinition
>(marketingLandingVariants.map((variant) => [variant.slug, variant]))

export function isMarketingLandingVariantId(
  value: string
): value is MarketingLandingVariantId {
  return marketingLandingVariantsById.has(value as MarketingLandingVariantId)
}

export function isMarketingLandingVariantSlug(
  value: string
): value is MarketingLandingVariantSlug {
  return marketingLandingVariantsBySlug.has(
    value as MarketingLandingVariantSlug
  )
}

export function getDefaultMarketingLandingVariant(): MarketingLandingVariantDefinition {
  return marketingLandingVariantsById.get(DEFAULT_MARKETING_LANDING_VARIANT_ID)!
}

export function resolveMarketingLandingVariantById(
  id: string
): MarketingLandingVariantDefinition {
  if (isMarketingLandingVariantId(id)) {
    return marketingLandingVariantsById.get(id)!
  }
  return getDefaultMarketingLandingVariant()
}

export function resolveMarketingLandingVariantBySlug(
  slug: string
): MarketingLandingVariantDefinition {
  if (isMarketingLandingVariantSlug(slug)) {
    return marketingLandingVariantsBySlug.get(slug)!
  }
  return getDefaultMarketingLandingVariant()
}

export function requireMarketingLandingVariantBySlug(
  slug: string
): MarketingLandingVariantDefinition {
  if (!isMarketingLandingVariantSlug(slug)) {
    throw new Error(`Unknown marketing landing slug: "${slug}"`)
  }

  return marketingLandingVariantsBySlug.get(slug)!
}

export function pickRandomMarketingLandingVariantId(
  randomValue: number
): MarketingLandingVariantId {
  const normalized = Math.min(Math.max(randomValue, 0), 0.9999999999999999)
  const index = Math.floor(normalized * marketingLandingVariants.length)
  return marketingLandingVariants[index]!.id
}

export function resolveMarketingLandingVariantId(options?: {
  readonly storage?: Pick<Storage, "getItem" | "setItem"> | null
  readonly randomValue?: number
  readonly persist?: boolean
}): MarketingLandingVariantId {
  const storage = options?.storage ?? null
  const randomValue = options?.randomValue ?? Math.random()
  const persist = options?.persist ?? true

  if (!storage) {
    return pickRandomMarketingLandingVariantId(randomValue)
  }

  if (persist) {
    const stored = storage.getItem(MARKETING_LANDING_STORAGE_KEY)
    if (stored && isMarketingLandingVariantId(stored)) {
      return stored
    }
  }

  const next = pickRandomMarketingLandingVariantId(randomValue)

  if (!persist) {
    return next
  }

  try {
    storage.setItem(MARKETING_LANDING_STORAGE_KEY, next)
  } catch {
    // Ignore storage failures and continue with the selected variant.
  }

  return next
}
