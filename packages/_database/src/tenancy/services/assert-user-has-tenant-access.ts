import type { DatabaseClient } from "../../client"

import { resolveAfendaMeContextFromBetterAuthUserId } from "./resolve-afenda-me-context"

export async function assertUserHasTenantAccess(
  db: DatabaseClient,
  betterAuthUserId: string,
  tenantId: string
): Promise<boolean> {
  const ctx = await resolveAfendaMeContextFromBetterAuthUserId(
    db,
    betterAuthUserId
  )
  if (!ctx) {
    return false
  }
  return ctx.tenantIds.includes(tenantId)
}
