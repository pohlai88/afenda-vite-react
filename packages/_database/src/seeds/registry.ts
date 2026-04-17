import type { SeedModule } from "./contract"
import { seedPermissionsAndRolesModule } from "./bootstrap/seed-permissions-and-roles"
import { seedReferencePlaceholder } from "./reference/seed-reference-placeholder"
import { seedDemoTenant } from "./tenant-fixtures/seed-demo-tenant"
import { seedSyntheticTenantSettings } from "./volume/seed-synthetic-tenant-settings"

/**
 * Ordered registry of all seed modules (policy + orchestrator filter subsets).
 */
export const allSeedModules: SeedModule[] = [
  seedDemoTenant,
  seedReferencePlaceholder,
  seedPermissionsAndRolesModule,
  seedSyntheticTenantSettings,
]
