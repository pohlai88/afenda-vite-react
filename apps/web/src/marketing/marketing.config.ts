/**
 * MARKETING CONFIG
 *
 * Central runtime control for the public marketing surface.
 * This file defines homepage strategy and feature-level switches.
 */

export type MarketingHomeMode = "flagship" | "random"

export interface MarketingConfig {
  readonly homeMode: MarketingHomeMode
  readonly enableRandomPersistence: boolean
}

export const MARKETING_CONFIG: MarketingConfig = {
  homeMode: "flagship",
  enableRandomPersistence: true,
} as const

export function isRandomHomeEnabled(): boolean {
  return MARKETING_CONFIG.homeMode === "random"
}

export function isRandomPersistenceEnabled(): boolean {
  return MARKETING_CONFIG.enableRandomPersistence
}

/**
 * Derived aliases kept as stable named exports for consumers that prefer
 * constant-level imports over the config object.
 */
export const MARKETING_HOME_MODE = MARKETING_CONFIG.homeMode
export const MARKETING_ENABLE_RANDOM_HOME = isRandomHomeEnabled()

/**
 * Canonical public route paths owned by the marketing feature.
 *
 * Use these when adding new page groups or route assertions so path ownership
 * stays centralized.
 */
export const MARKETING_ROUTE_PATHS = {
  home: "/",
  marketingRoot: "/marketing",
} as const

/**
 * Governance-only domain buckets for `pages/`.
 *
 * These are not yet consumed directly at runtime, but documenting them here
 * keeps future expansion aligned with the approved tree.
 */
export const MARKETING_PAGE_DOMAINS = [
  "landing",
  "company",
  "legal",
  "product",
  "campaigns",
  "regional",
] as const
