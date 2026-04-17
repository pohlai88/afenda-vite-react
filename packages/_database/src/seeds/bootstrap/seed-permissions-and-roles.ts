import { seedPermissionsAndRoles } from "../../authorization/seeds/default-permissions-and-roles"
import type { SeedModule } from "../contract"

/**
 * Seeds global permission rows and per-tenant roles for one tenant.
 * Identity: upsert / onConflictDoNothing (see authorization seed implementation).
 *
 * Tenant id resolution:
 * 1. `context.tenantScope[0]` (from `--tenant=` CLI)
 * 2. `SEED_TENANT_ID` env
 */
export const seedPermissionsAndRolesModule: SeedModule = {
  key: "seed-permissions-and-roles",
  description:
    "Default permissions catalog and system roles mapped to a tenant context",
  stage: "bootstrap",
  safeInProduction: true,
  async run(context) {
    const tenantId =
      context.tenantScope?.[0] ?? process.env.SEED_TENANT_ID?.trim()

    if (!tenantId) {
      throw new Error(
        "[seed] seed-permissions-and-roles: set --tenant or SEED_TENANT_ID (or run with demo tenant scope from scripts/seed.ts)"
      )
    }

    if (context.dryRun) {
      return
    }

    await seedPermissionsAndRoles(tenantId, context.db)
    return { inserted: undefined, updated: undefined }
  },
}
