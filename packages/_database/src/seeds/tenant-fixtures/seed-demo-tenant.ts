import { tenants } from "../../tenancy/schema/tenants.schema"
import type { SeedModule } from "../contract"
import { DEMO_TENANT_ID } from "../constants"

/**
 * Canonical demo tenant for local / CI / preview.
 * Identity: fixed UUID upsert; natural keys code + slug unique.
 */
export const seedDemoTenant: SeedModule = {
  key: "seed-demo-tenant",
  description:
    "Upserts the canonical demo tenant row used for role and permission fixtures",
  stage: "tenant-fixture",
  safeInProduction: false,
  async run(context) {
    if (context.dryRun) {
      return
    }

    await context.db
      .insert(tenants)
      .values({
        id: DEMO_TENANT_ID,
        code: "demo",
        slug: "demo",
        name: "Demo tenant",
        status: "active",
        baseCurrencyCode: "USD",
        defaultLocale: "en",
        defaultTimezone: "UTC",
      })
      .onConflictDoNothing({ target: tenants.id })

    return { inserted: 1, updated: 0 }
  },
}
