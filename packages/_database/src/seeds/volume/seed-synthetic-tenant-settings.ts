import { eq } from "drizzle-orm"
import { faker } from "@faker-js/faker"
import { getGeneratorsFunctions } from "drizzle-seed"

import { tenantSettings } from "../../tenancy/schema/tenant-settings.schema"
import type { SeedModule } from "../contract"
import { DEMO_TENANT_ID } from "../constants"
import {
  DRIZZLE_SEED_GENERATOR_VERSION,
  DRIZZLE_SYNTHETIC_PRNG_SEED,
  drizzleSeed,
} from "../drizzle-seed-config"
import { FAKER_SYNTHETIC_SEED, seedFakerDeterministic } from "../faker-seed"

type RefineGenerators = ReturnType<typeof getGeneratorsFunctions>

/**
 * Synthetic volume seed: one `tenant_settings` row for the demo tenant using
 * drizzle-seed refinements (json, email) + aligned faker seed for any hybrid use.
 *
 * Identity: PK `tenantId` fixed to {@link DEMO_TENANT_ID}; row is removed and
 * re-inserted in volume runs so re-seeding stays deterministic (volume is local/ci only).
 */
export const seedSyntheticTenantSettings: SeedModule = {
  key: "seed-synthetic-tenant-settings",
  description:
    "drizzle-seed refine on tenant_settings (deterministic PRNG + faker seed alignment)",
  stage: "volume",
  safeInProduction: false,
  async run(context) {
    if (context.dryRun) {
      return
    }

    seedFakerDeterministic(FAKER_SYNTHETIC_SEED)
    faker.string.sample(4)

    const schemaSlice = { tenantSettings }

    await context.db
      .delete(tenantSettings)
      .where(eq(tenantSettings.tenantId, DEMO_TENANT_ID))

    await drizzleSeed(context.db, schemaSlice, {
      seed: DRIZZLE_SYNTHETIC_PRNG_SEED,
      version: DRIZZLE_SEED_GENERATOR_VERSION,
    }).refine((funcs: RefineGenerators) => ({
      tenantSettings: {
        count: 1,
        columns: {
          tenantId: funcs.default({ defaultValue: DEMO_TENANT_ID }),
          billingEmail: funcs.email(),
          featureFlags: funcs.json(),
          uiSettings: funcs.json(),
          operationalSettings: funcs.json(),
          auditSettings: funcs.json(),
        },
      },
    }))

    return { inserted: 1, updated: 0 }
  },
}
