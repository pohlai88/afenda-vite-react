import type { SeedModule } from "../contract"

/**
 * Placeholder for reference data (currencies, UoM, etc.).
 * Replace with real modules as domains are added.
 */
export const seedReferencePlaceholder: SeedModule = {
  key: "seed-reference-placeholder",
  description:
    "No-op placeholder until reference seed modules are implemented",
  stage: "reference",
  safeInProduction: true,
  async run() {
    return { inserted: 0, updated: 0 }
  },
}
