import type { ComponentType } from "react"

export const MARKETING_LANDING_STORAGE_KEY = "afenda.marketing.landing.variant"
export const DEFAULT_MARKETING_LANDING_VARIANT_ID = "Moire"

type MarketingLandingModule = {
  readonly default: ComponentType
}

export function loadMarketingFlagshipPage() {
  return import("@/marketing/pages/landing/flagship/flagship-page")
}

export const MARKETING_PAGE_HREFS = {
  home: "/",
  marketingHome: "/marketing",
  flagship: "/marketing/flagship",
  canon: "/marketing/polaris",
  benchmarkErp: "/marketing/campaigns/erp-benchmark",
  erpBenchmarkCampaign: "/marketing/campaigns/erp-benchmark",
  truthEngine: "/marketing/product/truth-engine",
  about: "/marketing/company/about",
  trustCenter: "/marketing/legal/trust-center",
  dataGovernance: "/marketing/legal/data-governance",
  privacyPolicy: "/marketing/legal/privacy-policy",
  pdpa: "/marketing/legal/pdpa",
  asiaPacific: "/marketing/regional/asia-pacific",
} as const

export const marketingShellNavigation = [
  { label: "Flagship", to: MARKETING_PAGE_HREFS.flagship },
  { label: "Truth Engine", to: MARKETING_PAGE_HREFS.truthEngine },
  { label: "Benchmark ERP", to: MARKETING_PAGE_HREFS.benchmarkErp },
  { label: "Trust Center", to: MARKETING_PAGE_HREFS.trustCenter },
  { label: "About", to: MARKETING_PAGE_HREFS.about },
  { label: "Asia Pacific", to: MARKETING_PAGE_HREFS.asiaPacific },
] as const

export const marketingPageDirectoryNavigation = [
  { label: "Flagship", to: MARKETING_PAGE_HREFS.flagship },
  { label: "Truth Engine", to: MARKETING_PAGE_HREFS.truthEngine },
  { label: "Benchmark ERP", to: MARKETING_PAGE_HREFS.benchmarkErp },
  { label: "About", to: MARKETING_PAGE_HREFS.about },
  { label: "Trust Center", to: MARKETING_PAGE_HREFS.trustCenter },
  { label: "Governance", to: MARKETING_PAGE_HREFS.dataGovernance },
  { label: "Privacy Policy", to: MARKETING_PAGE_HREFS.privacyPolicy },
  { label: "PDPA", to: MARKETING_PAGE_HREFS.pdpa },
  { label: "Asia Pacific", to: MARKETING_PAGE_HREFS.asiaPacific },
] as const

export const marketingLandingVariants = [
  {
    id: "Moire",
    slug: "moire",
    load: () => import("@/marketing/pages/landing/moire-landing-page"),
  },
  {
    id: "Absolutism",
    slug: "kinetic-absolutism",
    load: () =>
      import("@/marketing/pages/landing/kinetic-absolutism-landing-page"),
  },
  {
    id: "Single-Life",
    slug: "single-life",
    load: () => import("@/marketing/pages/landing/single-life-landing-page"),
  },
  {
    id: "Forensic",
    slug: "forensic",
    load: () => import("@/marketing/pages/landing/forensic-landing-page"),
  },
  {
    id: "Topology",
    slug: "topology",
    load: () => import("@/marketing/pages/landing/topology-landing-page"),
  },
  {
    id: "Monochrom",
    slug: "monochrom",
    load: () => import("@/marketing/pages/landing/monochrom-landing-page"),
  },
  {
    id: "Resolve",
    slug: "resolve",
    load: () => import("@/marketing/pages/landing/resolve-landing-page"),
  },
  {
    id: "Polaris",
    slug: "polaris",
    load: () => import("@/marketing/pages/landing/polaris-landing-page"),
  },
  {
    id: "Surface",
    slug: "surface",
    load: () => import("@/marketing/pages/landing/surface-landing-page"),
  },
  {
    id: "Monument",
    slug: "monument",
    load: () => import("@/marketing/pages/landing/monument-landing-page"),
  },
  {
    id: "Beastmode",
    slug: "beastmode",
    load: () => import("@/marketing/pages/landing/beastmode-landing-page"),
  },
] as const satisfies readonly {
  readonly id: string
  readonly slug: string
  readonly load: () => Promise<MarketingLandingModule>
}[]

export const marketingRoutablePages = [
  {
    id: "ErpBenchmarkCampaign",
    path: "campaigns/erp-benchmark",
    load: () => import("./pages/campaigns/erp-benchmark/erp-benchmark-page"),
  },
  {
    id: "TruthEngine",
    path: "product/truth-engine",
    load: () => import("./pages/product/truth-engine/truth-engine-page"),
  },
  {
    id: "About",
    path: "company/about",
    load: () => import("./pages/company/about/about-page"),
  },
  {
    id: "TrustCenter",
    path: "legal/trust-center",
    load: () => import("./pages/legal/trust-center/trust-center-page"),
  },
  {
    id: "DataGovernance",
    path: "legal/data-governance",
    load: () => import("./pages/legal/data-governance/governance-data-page"),
  },
  {
    id: "PrivacyPolicy",
    path: "legal/privacy-policy",
    load: () => import("./pages/legal/privacy-policy/privacy-policy-page"),
  },
  {
    id: "Pdpa",
    path: "legal/pdpa",
    load: () => import("./pages/legal/pdpa/pdpa-page"),
  },
  {
    id: "AsiaPacific",
    path: "regional/asia-pacific",
    load: () => import("./pages/regional/asia-pacific/asia-pacific-page"),
  },
] as const satisfies readonly {
  readonly id: string
  readonly path: string
  readonly load: () => Promise<MarketingLandingModule>
}[]

/**
 * Intentional public aliases that redirect to one canonical marketing route.
 * These paths stay explicit so campaign shortcuts do not silently duplicate
 * a separate public page module.
 */
export const marketingCanonicalRedirects = [
  {
    path: "benchmark-erp",
    to: MARKETING_PAGE_HREFS.erpBenchmarkCampaign,
    canonicalId: "ErpBenchmarkCampaign",
    reason: "campaign-shortlink",
  },
] as const satisfies readonly {
  readonly path: string
  readonly to: string
  readonly canonicalId: MarketingRoutablePageDefinition["id"]
  readonly reason: "campaign-shortlink"
}[]

export type MarketingLandingVariantDefinition =
  (typeof marketingLandingVariants)[number]

export type MarketingRoutablePageDefinition =
  (typeof marketingRoutablePages)[number]

export type MarketingLandingVariantId = MarketingLandingVariantDefinition["id"]
export type MarketingLandingVariantSlug =
  MarketingLandingVariantDefinition["slug"]
export type MarketingRoutablePageId = MarketingRoutablePageDefinition["id"]
export type MarketingRoutablePagePath = MarketingRoutablePageDefinition["path"]
export type MarketingCanonicalRedirectPath =
  (typeof marketingCanonicalRedirects)[number]["path"]

export const marketingLandingVariantIds = marketingLandingVariants.map(
  (variant) => variant.id
) as readonly MarketingLandingVariantId[]

export const marketingLandingVariantSlugs = marketingLandingVariants.map(
  (variant) => variant.slug
) as readonly MarketingLandingVariantSlug[]

export const marketingRoutablePagePaths = marketingRoutablePages.map(
  (page) => page.path
) as readonly MarketingRoutablePagePath[]

export const marketingCanonicalRedirectPaths = marketingCanonicalRedirects.map(
  (page) => page.path
) as readonly MarketingCanonicalRedirectPath[]

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

const marketingRoutablePagesByPath = new Map<
  MarketingRoutablePagePath,
  MarketingRoutablePageDefinition
>(marketingRoutablePages.map((page) => [page.path, page]))

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

export function isMarketingRoutablePagePath(
  value: string
): value is MarketingRoutablePagePath {
  return marketingRoutablePagesByPath.has(value as MarketingRoutablePagePath)
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

export function requireMarketingRoutablePageByPath(
  path: string
): MarketingRoutablePageDefinition {
  if (!isMarketingRoutablePagePath(path)) {
    throw new Error(`Unknown marketing page path: "${path}"`)
  }

  return marketingRoutablePagesByPath.get(path)!
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
